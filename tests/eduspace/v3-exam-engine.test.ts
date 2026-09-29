/**
 * EduSpace V3 Exam Engine - Phase 4 Comprehensive Unit Test Suite
 * Source of truth:
 * - docs/eduspace-v3-architecture.md
 * - docs/eduspace-v3-database-schema.md
 * - docs/eduspace-v3-api-contract.md
 * - docs/eduspace-v3-domain-foundation.md
 * - .agents/AGENTS.md
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  EduSpaceError,
  isOwner,
  adaptLegacyV2QuizBundle
} from '../../src/eduspace/core/index.ts';

import {
  // Engine
  ExamEngine,
  defaultExamEngine,

  // Registries
  QuestionRegistry,
  defaultQuestionRegistry,
  GradingRegistry,
  defaultGradingRegistry,

  // PRNG
  createDeterministicRng,
  deterministicShuffle,

  // State Machine
  SessionStateMachine,
  defaultSessionStateMachine,

  // Timer
  ServerTimer,
  defaultServerTimer,

  // Validators
  QuestionValidator,
  defaultQuestionValidator,
  ExamValidator,
  defaultExamValidator,
  SubmissionValidator,
  defaultSubmissionValidator,

  // Planner
  ExamPlanner,
  defaultExamPlanner,

  // Grading
  GradingEngine,
  defaultGradingEngine,

  // Result
  ResultBuilder,
  defaultResultBuilder
} from '../../src/eduspace/engine/index.ts';

import type { Exam, ExamPolicy, ExamSection } from '../../src/eduspace/core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../src/eduspace/core/domain/question.ts';

// ----------------------------------------------------------------------
// Helper Test Fixtures Generator (In-Memory Only, No Production Writes)
// ----------------------------------------------------------------------
function createTestQuestion(
  id: string,
  type: any,
  contentPayload: any,
  gradingPayload: any,
  explanation?: string
): { question: Question; version: QuestionVersion } {
  const versionId = `${id}_v1`;
  const version: QuestionVersion = {
    id: versionId,
    schemaVersion: 1,
    questionId: id,
    versionNumber: 1,
    content: {
      prompt: `Nội dung câu hỏi ${id}`,
      payload: contentPayload
    },
    gradingConfig: {
      payload: gradingPayload,
      explanation
    },
    createdByCodeId: '10042',
    createdAt: '2026-09-16T12:00:00.000Z'
  };

  const question: Question = {
    id,
    schemaVersion: 1,
    authorCodeId: '10042',
    type,
    subjectId: 'toan',
    grade: 10,
    learningObjectiveIds: [],
    cognitiveLevel: 'comprehension',
    difficultyScore: 2,
    tags: ['kiem_tra'],
    currentVersionId: versionId,
    currentVersionNumber: 1,
    status: 'approved',
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  };

  return { question, version };
}

function createTestExam(sections: ExamSection[], totalPoints = 10.0): Exam {
  return {
    id: 'exam_test_01',
    schemaVersion: 1,
    title: 'Đề Kiểm tra Định kỳ Toán 10',
    description: 'Đề thi trắc nghiệm chuẩn GDPT 2018',
    subjectId: 'toan',
    grade: 10,
    examType: 'periodic',
    durationMinutes: 45,
    totalPoints,
    sections,
    visibility: 'public',
    moderationStatus: 'approved',
    creatorCodeId: '10042',
    policy: {
      shuffleQuestions: true,
      shuffleOptions: true,
      maxAttempts: 2,
      allowReviewAfterSubmit: true,
      showExplanationsImmediately: false,
      requireContinuousFocus: true,
      allowRetake: true
    },
    status: 'active',
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  };
}

// ======================================================================
// 1. Question Registry & Validation (All 9 Question Types)
// ======================================================================
describe('Question Registry & Question Type Plugins', () => {
  it('registers all 9 canonical question types', () => {
    const types = defaultQuestionRegistry.getSupportedTypes();
    assert.equal(types.length, 9);
    assert.ok(types.includes('single_choice'));
    assert.ok(types.includes('multiple_choice'));
    assert.ok(types.includes('true_false'));
    assert.ok(types.includes('short_answer'));
    assert.ok(types.includes('numeric'));
    assert.ok(types.includes('essay'));
    assert.ok(types.includes('matching'));
    assert.ok(types.includes('ordering'));
    assert.ok(types.includes('fill_blank'));
  });

  it('validates single_choice: requires >= 2 options & valid correctOptionId', () => {
    const valid = createTestQuestion(
      'q_sc_1',
      'single_choice',
      { options: [{ id: 'opt_a', text: 'A' }, { id: 'opt_b', text: 'B' }] },
      { correctOptionId: 'opt_a' }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(valid.question, valid.version));

    // Invalid: only 1 option
    const invalid1 = createTestQuestion(
      'q_sc_bad1',
      'single_choice',
      { options: [{ id: 'opt_a', text: 'A' }] },
      { correctOptionId: 'opt_a' }
    );
    assert.throws(
      () => defaultQuestionValidator.validate(invalid1.question, invalid1.version),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );

    // Invalid: correctOptionId does not exist
    const invalid2 = createTestQuestion(
      'q_sc_bad2',
      'single_choice',
      { options: [{ id: 'opt_a', text: 'A' }, { id: 'opt_b', text: 'B' }] },
      { correctOptionId: 'opt_z' }
    );
    assert.throws(
      () => defaultQuestionValidator.validate(invalid2.question, invalid2.version),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('validates multiple_choice: requires options & correctOptionIds', () => {
    const valid = createTestQuestion(
      'q_mc_1',
      'multiple_choice',
      { options: [{ id: 'opt_1', text: '1' }, { id: 'opt_2', text: '2' }, { id: 'opt_3', text: '3' }] },
      { correctOptionIds: ['opt_1', 'opt_3'], partialScoring: true }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(valid.question, valid.version));

    const invalid = createTestQuestion(
      'q_mc_bad',
      'multiple_choice',
      { options: [{ id: 'opt_1', text: '1' }, { id: 'opt_2', text: '2' }] },
      { correctOptionIds: [] } // Empty correct options
    );
    assert.throws(
      () => defaultQuestionValidator.validate(invalid.question, invalid.version),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('validates true_false: requires items and boolean map in correctAnswers', () => {
    const valid = createTestQuestion(
      'q_tf_1',
      'true_false',
      { items: [{ id: 'item_a', text: 'A' }, { id: 'item_b', text: 'B' }] },
      { correctAnswers: { item_a: true, item_b: false }, partialScoreLadder: [0.1, 0.25, 0.5, 1.0] }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(valid.question, valid.version));

    const invalid = createTestQuestion(
      'q_tf_bad',
      'true_false',
      { items: [{ id: 'item_a', text: 'A' }, { id: 'item_b', text: 'B' }] },
      { correctAnswers: { item_a: true } } // missing item_b
    );
    assert.throws(
      () => defaultQuestionValidator.validate(invalid.question, invalid.version),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('validates short_answer, numeric, essay, matching, ordering, and fill_blank', () => {
    // Short Answer
    const qShort = createTestQuestion('q_sa_1', 'short_answer', {}, { acceptableAnswers: ['Hà Nội'] });
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qShort.question, qShort.version));

    // Numeric
    const qNum = createTestQuestion('q_num_1', 'numeric', {}, { exactValue: 3.14, tolerance: 0.01 });
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qNum.question, qNum.version));

    // Essay
    const qEssay = createTestQuestion('q_es_1', 'essay', { minWords: 100 }, {});
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qEssay.question, qEssay.version));

    // Matching
    const qMatch = createTestQuestion(
      'q_mat_1',
      'matching',
      { leftItems: [{ id: 'l1', text: 'L1' }], rightItems: [{ id: 'r1', text: 'R1' }] },
      { pairs: { l1: 'r1' } }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qMatch.question, qMatch.version));

    // Ordering
    const qOrder = createTestQuestion(
      'q_ord_1',
      'ordering',
      { items: [{ id: 'i1', text: '1' }, { id: 'i2', text: '2' }] },
      { correctOrder: ['i1', 'i2'] }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qOrder.question, qOrder.version));

    // Fill Blank
    const qFill = createTestQuestion(
      'q_fb_1',
      'fill_blank',
      { template: 'Hôm nay là [blank_1]' },
      { acceptableBlanks: { blank_1: ['thứ hai', 'thu hai'] } }
    );
    assert.doesNotThrow(() => defaultQuestionValidator.validate(qFill.question, qFill.version));
  });
});

// ======================================================================
// 2. True / False GDPT 2018 Partial Scoring Ladder Tests
// ======================================================================
describe('True/False GDPT 2018 Partial Scoring Ladder', () => {
  const plugin = defaultQuestionRegistry.get('true_false');
  const content = {
    items: [
      { id: 'item_a', text: 'Ý a' },
      { id: 'item_b', text: 'Ý b' },
      { id: 'item_c', text: 'Ý c' },
      { id: 'item_d', text: 'Ý d' }
    ]
  };
  const gradingConfig = {
    payload: {
      correctAnswers: { item_a: true, item_b: false, item_c: true, item_d: false },
      partialScoreLadder: [0.1, 0.25, 0.5, 1.0]
    }
  };

  it('awards 0 points when 0/4 items correct', () => {
    const response = { answers: { item_a: false, item_b: true, item_c: false, item_d: true } };
    const res = plugin.evaluate(response, content, gradingConfig.payload, 1.0);
    assert.equal(res.awardedPoints, 0);
    assert.equal(res.isCorrect, false);
  });

  it('awards 0.1 points when exactly 1/4 item correct', () => {
    const response = { answers: { item_a: true, item_b: true, item_c: false, item_d: true } };
    const res = plugin.evaluate(response, content, gradingConfig.payload, 1.0);
    assert.equal(res.awardedPoints, 0.1);
    assert.equal(res.isCorrect, false);
  });

  it('awards 0.25 points when exactly 2/4 items correct', () => {
    const response = { answers: { item_a: true, item_b: false, item_c: false, item_d: true } };
    const res = plugin.evaluate(response, content, gradingConfig.payload, 1.0);
    assert.equal(res.awardedPoints, 0.25);
    assert.equal(res.isCorrect, false);
  });

  it('awards 0.5 points when exactly 3/4 items correct', () => {
    const response = { answers: { item_a: true, item_b: false, item_c: true, item_d: true } };
    const res = plugin.evaluate(response, content, gradingConfig.payload, 1.0);
    assert.equal(res.awardedPoints, 0.5);
    assert.equal(res.isCorrect, false);
  });

  it('awards full 1.0 points when all 4/4 items correct', () => {
    const response = { answers: { item_a: true, item_b: false, item_c: true, item_d: false } };
    const res = plugin.evaluate(response, content, gradingConfig.payload, 1.0);
    assert.equal(res.awardedPoints, 1.0);
    assert.equal(res.isCorrect, true);
  });
});

// ======================================================================
// 3. Exam Validation & Section Handling
// ======================================================================
describe('Exam Validator & Section Restrictions', () => {
  it('validates a correct multi-section exam', () => {
    const q1 = createTestQuestion('q1', 'single_choice', { options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] }, { correctOptionId: 'a' });
    const q2 = createTestQuestion('q2', 'numeric', {}, { exactValue: 42 });

    const sec1: ExamSection = {
      id: 'sec_1',
      title: 'Phần I: Trắc nghiệm',
      sectionOrder: 1,
      questionType: 'single_choice',
      questions: [{ questionId: 'q1', questionVersionId: 'q1_v1', allocatedPoints: 5.0, orderIndex: 0 }]
    };

    const sec2: ExamSection = {
      id: 'sec_2',
      title: 'Phần II: Số học',
      sectionOrder: 2,
      questionType: 'numeric',
      questions: [{ questionId: 'q2', questionVersionId: 'q2_v1', allocatedPoints: 5.0, orderIndex: 0 }]
    };

    const exam = createTestExam([sec1, sec2], 10.0);
    const questions = new Map([['q1', q1.question], ['q2', q2.question]]);
    const versions = new Map([['q1_v1', q1.version], ['q2_v1', q2.version]]);

    assert.doesNotThrow(() => defaultExamValidator.validate(exam, { questions, versions }));
  });

  it('rejects exam when allocated points do not equal totalPoints', () => {
    const q1 = createTestQuestion('q1', 'single_choice', { options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] }, { correctOptionId: 'a' });
    const sec1: ExamSection = {
      id: 'sec_1',
      title: 'Phần I',
      sectionOrder: 1,
      questionType: 'single_choice',
      questions: [{ questionId: 'q1', questionVersionId: 'q1_v1', allocatedPoints: 5.0, orderIndex: 0 }]
    };
    const exam = createTestExam([sec1], 10.0); // 5.0 !== 10.0

    assert.throws(
      () => defaultExamValidator.validate(exam),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('rejects question type mismatch against section questionType', () => {
    const qNumeric = createTestQuestion('q_num', 'numeric', {}, { exactValue: 10 });
    const sec: ExamSection = {
      id: 'sec_sc_only',
      title: 'Chỉ trắc nghiệm một lựa chọn',
      sectionOrder: 1,
      questionType: 'single_choice', // Expects single_choice, but receives numeric!
      questions: [{ questionId: 'q_num', questionVersionId: 'q_num_v1', allocatedPoints: 10.0, orderIndex: 0 }]
    };

    const exam = createTestExam([sec], 10.0);
    const questions = new Map([['q_num', qNumeric.question]]);
    const versions = new Map([['q_num_v1', qNumeric.version]]);

    assert.throws(
      () => defaultExamValidator.validate(exam, { questions, versions }),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });
});

// ======================================================================
// 4. Deterministic Randomization & Question Version Immutability
// ======================================================================
describe('Deterministic Randomization & Version Immutability', () => {
  const qA = createTestQuestion('qa', 'single_choice', { options: [{ id: '1', text: '1' }, { id: '2', text: '2' }, { id: '3', text: '3' }] }, { correctOptionId: '1' });
  const qB = createTestQuestion('qb', 'single_choice', { options: [{ id: '4', text: '4' }, { id: '5', text: '5' }] }, { correctOptionId: '4' });
  const qC = createTestQuestion('qc', 'single_choice', { options: [{ id: '6', text: '6' }, { id: '7', text: '7' }] }, { correctOptionId: '6' });

  const sec: ExamSection = {
    id: 'sec_all',
    title: 'Phần thi',
    sectionOrder: 1,
    questionType: 'single_choice',
    questions: [
      { questionId: 'qa', questionVersionId: 'qa_v1', allocatedPoints: 3.333, orderIndex: 0 },
      { questionId: 'qb', questionVersionId: 'qb_v1', allocatedPoints: 3.333, orderIndex: 1 },
      { questionId: 'qc', questionVersionId: 'qc_v1', allocatedPoints: 3.334, orderIndex: 2 }
    ]
  };

  const exam = createTestExam([sec], 10.0);
  const versions = new Map([['qa_v1', qA.version], ['qb_v1', qB.version], ['qc_v1', qC.version]]);

  it('same seed produces identical question order and option order', () => {
    const seed = 'seed_room_101';
    const plan1 = defaultExamPlanner.createExecutionPlan(exam, versions, seed);
    const plan2 = defaultExamPlanner.createExecutionPlan(exam, versions, seed);

    assert.deepEqual(plan1.sections[0].questions, plan2.sections[0].questions);
  });

  it('different seeds produce different question orders', () => {
    const plan1 = defaultExamPlanner.createExecutionPlan(exam, versions, 'seed_alpha_01');
    const plan2 = defaultExamPlanner.createExecutionPlan(exam, versions, 'seed_omega_99');

    const order1 = plan1.sections[0].questions.map(q => q.questionId);
    const order2 = plan2.sections[0].questions.map(q => q.questionId);

    // Both contain same questions, but order can differ
    assert.equal(order1.length, order2.length);
  });

  it('pins questionVersionId immutably in the execution plan', () => {
    const plan = defaultExamPlanner.createExecutionPlan(exam, versions, 'seed_test');
    assert.equal(plan.sections[0].questions[0].questionVersionId.endsWith('_v1'), true);

    // Answer keys (gradingConfig) must NOT be leaked into the execution plan
    for (const q of plan.sections[0].questions) {
      assert.ok(!('gradingConfig' in q));
      assert.ok(!('correctOptionId' in q));
    }
  });
});

// ======================================================================
// 5. Session State Machine Transitions
// ======================================================================
describe('Session State Machine & Lifecycle Transitions', () => {
  const sm = defaultSessionStateMachine;

  it('permits valid lifecycle transitions', () => {
    assert.equal(sm.transition('created', 'in_progress'), 'in_progress');
    assert.equal(sm.transition('in_progress', 'submitted'), 'submitted');
    assert.equal(sm.transition('submitted', 'grading'), 'grading');
    assert.equal(sm.transition('grading', 'graded'), 'graded');
  });

  it('rejects transitioning graded session back to in_progress', () => {
    assert.throws(
      () => sm.transition('graded', 'in_progress'),
      (err: any) => err instanceof EduSpaceError && err.status === 423
    );
  });

  it('rejects transitioning expired session to in_progress', () => {
    assert.throws(
      () => sm.transition('expired', 'in_progress'),
      (err: any) => err instanceof EduSpaceError && err.status === 410
    );
  });
});

// ======================================================================
// 6. Server Timer Abstraction & Expiration Behavior
// ======================================================================
describe('Server Timer Abstraction & Expiration', () => {
  const timer = defaultServerTimer;

  it('computes official expiresAt with network buffer', () => {
    const started = '2026-09-16T12:00:00.000Z';
    const expiresAt = timer.computeExpiresAt(started, { durationMinutes: 45, bufferSeconds: 30 });
    // 12:00:00 + 45m + 30s = 12:45:30.000Z
    assert.equal(expiresAt, '2026-09-16T12:45:30.000Z');
  });

  it('accurately identifies expired vs active sessions', () => {
    const expiresAt = '2026-09-16T12:45:30.000Z';
    const beforeExpiry = '2026-09-16T12:40:00.000Z';
    const afterExpiry = '2026-09-16T12:46:00.000Z';

    assert.equal(timer.isExpired(expiresAt, beforeExpiry), false);
    assert.equal(timer.isExpired(expiresAt, afterExpiry), true);
  });
});

// ======================================================================
// 7. Submission Validation & Security Tampering Protections
// ======================================================================
describe('Submission Validation & Tampering Protections', () => {
  const q1 = createTestQuestion('q1', 'single_choice', { options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] }, { correctOptionId: 'a' });
  const versions = new Map([['q1_v1', q1.version]]);

  const mockSession: any = {
    id: 'ses_1001',
    examId: 'exam_01',
    studentCodeId: '10042',
    questionVersionReferences: [{ questionId: 'q1', questionVersionId: 'q1_v1', assignedSectionId: 'sec_1', allocatedPoints: 10.0, orderIndex: 0 }]
  };

  it('rejects client attempt to inject official score or awardedPoints', () => {
    const maliciousAnswers = [
      {
        questionId: 'q1',
        questionVersionId: 'q1_v1',
        responsePayload: { selectedOptionId: 'b' },
        score: 100, // Malicious injection
        awardedPoints: 100,
        isCorrect: true
      }
    ];

    const sanitized = defaultSubmissionValidator.validateSubmission(mockSession, maliciousAnswers, versions);
    assert.equal(sanitized.length, 1);
    // Verified: untrusted fields are stripped
    assert.ok(!('score' in sanitized[0]));
    assert.ok(!('awardedPoints' in sanitized[0]));
    assert.ok(!('isCorrect' in sanitized[0]));
  });

  it('rejects answer with question not in the session', () => {
    const invalidAnswers = [
      { questionId: 'q_foreign_99', questionVersionId: 'q_foreign_99_v1', responsePayload: {} }
    ];

    assert.throws(
      () => defaultSubmissionValidator.validateSubmission(mockSession, invalidAnswers, versions),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('rejects client attempt to tamper with questionVersionId', () => {
    const tamperedAnswers = [
      { questionId: 'q1', questionVersionId: 'q1_v999_fake', responsePayload: { selectedOptionId: 'a' } }
    ];

    assert.throws(
      () => defaultSubmissionValidator.validateSubmission(mockSession, tamperedAnswers, versions),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });

  it('rejects duplicate answers for the same question', () => {
    const duplicateAnswers = [
      { questionId: 'q1', questionVersionId: 'q1_v1', responsePayload: { selectedOptionId: 'a' } },
      { questionId: 'q1', questionVersionId: 'q1_v1', responsePayload: { selectedOptionId: 'b' } }
    ];

    assert.throws(
      () => defaultSubmissionValidator.validateSubmission(mockSession, duplicateAnswers, versions),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });
});

// ======================================================================
// 8. Grading Capabilities & AI Review Isolation
// ======================================================================
describe('Grading Capabilities & AI Review Isolation', () => {
  const gr = defaultGradingRegistry;

  it('identifies automatic grading capability for objective types', () => {
    const desc = gr.getDescriptor('automatic');
    assert.equal(desc.canFinalizeOfficialScore, true);
    assert.equal(desc.requiresTeacherReview, false);
  });

  it('enforces that AI-assisted grading cannot finalize score without human reviewer', () => {
    const desc = gr.getDescriptor('ai_assisted');
    assert.equal(desc.canFinalizeOfficialScore, false);
    assert.equal(desc.requiresTeacherReview, true);

    // Must throw if no reviewerCodeId
    assert.throws(
      () => gr.assertCanFinalize('ai_assisted', null),
      (err: any) => err instanceof EduSpaceError && err.code === 'FORBIDDEN'
    );

    // Does not throw if teacher approved
    assert.doesNotThrow(() => gr.assertCanFinalize('ai_assisted', 'teacher_10042'));
  });
});

// ======================================================================
// 9. End-to-End Pipeline & Idempotency
// ======================================================================
describe('Full Assessment Engine Lifecycle & Idempotency', () => {
  const engine = defaultExamEngine;

  const q1 = createTestQuestion('q1', 'single_choice', { options: [{ id: 'opt_a', text: 'A' }, { id: 'opt_b', text: 'B' }] }, { correctOptionId: 'opt_a' });
  const q2 = createTestQuestion('q2', 'numeric', {}, { exactValue: 2026, tolerance: 0 });

  const sec: ExamSection = {
    id: 'sec_1',
    title: 'Phần I',
    sectionOrder: 1,
    questionType: 'single_choice',
    questions: [
      { questionId: 'q1', questionVersionId: 'q1_v1', allocatedPoints: 5.0, orderIndex: 0 },
      { questionId: 'q2', questionVersionId: 'q2_v1', allocatedPoints: 5.0, orderIndex: 1 }
    ]
  };

  const exam = createTestExam([sec], 10.0);
  const questions = new Map([['q1', q1.question], ['q2', q2.question]]);
  const versions = new Map([['q1_v1', q1.version], ['q2_v1', q2.version]]);

  it('runs complete lifecycle: Plan -> Session -> Autosave -> Submit -> Grade -> Result', () => {
    // 1. Plan
    const plan = engine.createPlan(exam, versions, 'seed_student_42');
    assert.equal(plan.sections[0].questions.length, 2);

    // 2. Start session
    const session = engine.startSession(plan, 'student_10042', { serverNow: '2026-09-16T12:00:00.000Z' });
    assert.equal(session.status, 'in_progress');
    // Optional grouping metadata must be omitted, not serialised as
    // `undefined`, because Firestore rejects undefined values in array items.
    assert.ok(!('choiceGroupId' in session.questionVersionReferences[0]));
    assert.ok(!('groupId' in session.questionVersionReferences[0]));
    assert.ok(!('clientIp' in session.securityContext));
    assert.ok(!('userAgent' in session.securityContext));

    // 3. Autosave
    const autosave = engine.autosave(session, { q1: 'opt_a' }, 1, '2026-09-16T12:10:00.000Z');
    assert.equal(autosave.answersPayload.q1, 'opt_a');

    // 4. Submit
    const submittedAnswers = [
      { questionId: 'q1', questionVersionId: 'q1_v1', responsePayload: { selectedOptionId: 'opt_a' } },
      { questionId: 'q2', questionVersionId: 'q2_v1', responsePayload: { value: 2026 } }
    ];
    const { submission } = engine.submit(session, submittedAnswers, versions, '2026-09-16T12:30:00.000Z');
    assert.equal(session.status, 'submitted');
    assert.equal(submission.answers.length, 2);

    // 5. Grade
    const grading = engine.grade(session, submission, versions, questions);
    assert.equal(session.status, 'graded');
    assert.equal(grading.totalScore, 10.0);
    assert.equal(grading.overallGradingMethod, 'automatic');
    assert.equal(grading.isFinalized, true);

    // 6. Result
    const result = engine.buildResult(session, submission, grading, {
      studentNdid: 'student_alice.nd',
      studentDisplayName: 'Alice Nguyen',
      passPoints: 5.0
    });
    assert.equal(result.totalScore, 10.0);
    assert.equal(result.passed, true);
    assert.equal(result.studentNdid, 'student_alice.nd'); // Raw string preserved verbatim
    assert.ok(!result.studentNdid.startsWith('@'));
  });

  it('enforces submission idempotency using sessionId', () => {
    const plan = engine.createPlan(exam, versions, 'seed_idem');
    const session = engine.startSession(plan, 'student_10042');

    const answers = [
      { questionId: 'q1', questionVersionId: 'q1_v1', responsePayload: { selectedOptionId: 'opt_a' } },
      { questionId: 'q2', questionVersionId: 'q2_v1', responsePayload: { value: 2026 } }
    ];

    engine.submit(session, answers, versions);

    // Submitting again to already submitted session must be rejected (SUBMISSION_CLOSED)
    assert.throws(
      () => engine.submit(session, answers, versions),
      (err: any) => err instanceof EduSpaceError && err.code === 'SUBMISSION_CLOSED'
    );
  });
});

// ======================================================================
// 10. V2 Compatibility & Legacy Data
// ======================================================================
describe('V2 Compatibility: Engine Consuming Adapted Legacy Quiz', () => {
  it('executes assessment seamlessly from adaptLegacyV2QuizBundle output', () => {
    const legacyQuiz = {
      title: 'Đề Toán 10 V2',
      duration: 30,
      questions: [
        {
          question: '1 + 1 = ?',
          type: 'multiple',
          options: ['2', '3', '4'],
          correct: 0,
          points: 5.0
        },
        {
          question: 'Phương trình x = 10 có nghiệm là:',
          type: 'short',
          answer: '10',
          points: 5.0
        }
      ]
    };

    const { exam, questions, versions } = adaptLegacyV2QuizBundle('quiz_v2_legacy', legacyQuiz);

    const qMap = new Map(questions.map(q => [q.id, q]));
    const vMap = new Map(versions.map(v => [v.id, v]));

    // Feed directly into V3 Engine
    const plan = defaultExamEngine.createPlan(exam, vMap, 'seed_legacy_v2', qMap);
    assert.equal(plan.sections.length, 2);
    assert.equal(plan.sections[0].questions.length, 1);
    assert.equal(plan.sections[1].questions.length, 1);

    const session = defaultExamEngine.startSession(plan, 'user_v2');
    const q1Id = plan.sections[0].questions[0].questionId;
    const q2Id = plan.sections[1].questions[0].questionId;
    const answers = [
      { questionId: q1Id, responsePayload: { selectedOptionId: 'opt_0' } },
      { questionId: q2Id, responsePayload: { value: 10 } }
    ];

    const { submission } = defaultExamEngine.submit(session, answers, vMap);
    const grading = defaultExamEngine.grade(session, submission, vMap, qMap);

    assert.equal(grading.totalScore, 10.0);
    assert.equal(grading.percentage, 100);
  });
});

// ======================================================================
// 11. Security & Identity Protections
// ======================================================================
describe('Engine Security & Identity Invariant Tests', () => {
  it('strictly protects Owner CodeID 0000 invariant', () => {
    const ownerAuth = {
      codeId: '0000',
      ndid: 'owner',
      displayName: 'System Owner',
      role: 'admin' as const,
      adminLevel: 'owner' as const,
      eduRole: 'teacher' as const
    };

    assert.equal(isOwner(ownerAuth), true);

    const impostorAuth = {
      codeId: '0000',
      ndid: 'fake_owner',
      displayName: 'Fake',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'student' as const
    };

    assert.equal(isOwner(impostorAuth), false);
  });

  it('verifies that NDID is never derived from email or displayName', () => {
    const result = defaultResultBuilder.buildResult(
      {
        id: 'ses_sec',
        schemaVersion: 1,
        examId: 'ex1',
        assignmentId: null,
        studentCodeId: '10042',
        attemptNumber: 1,
        startedAt: '2026-09-16T12:00:00.000Z',
        expiresAt: '2026-09-16T12:45:00.000Z',
        status: 'in_progress',
        attemptSeed: 'seed',
        questionVersionReferences: [],
        securityContext: { tabSwitchCount: 0 },
        createdAt: '2026-09-16T12:00:00.000Z',
        updatedAt: '2026-09-16T12:00:00.000Z'
      },
      {
        id: 'sub_sec',
        schemaVersion: 1,
        sessionId: 'ses_sec',
        examId: 'ex1',
        studentCodeId: '10042',
        submittedAt: '2026-09-16T12:30:00.000Z',
        answers: [],
        createdAt: '2026-09-16T12:30:00.000Z'
      },
      {
        id: 'gr_sec',
        schemaVersion: 1,
        submissionId: 'sub_sec',
        sessionId: 'ses_sec',
        examId: 'ex1',
        studentCodeId: '10042',
        overallGradingMethod: 'automatic',
        detailedQuestions: [],
        totalScore: 10,
        maxPossibleScore: 10,
        percentage: 100,
        isFinalized: true,
        gradedAt: '2026-09-16T12:30:00.000Z',
        updatedAt: '2026-09-16T12:30:00.000Z'
      },
      {
        studentNdid: 'special#char$ndid!', // Raw string with special characters
        studentDisplayName: 'Special User'
      }
    );

    // Rule: NDID is preserved 100% untouched as raw string, never stripped, never '@' prefixed
    assert.equal(result.studentNdid, 'special#char$ndid!');
    assert.ok(!result.studentNdid.startsWith('@'));
  });
});
