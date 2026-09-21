/**
 * EduSpace V3 - Server-Authoritative Exam Session & Assessment Backend Tests
 * Source of truth: docs/eduspace-v3-exam-session.md & docs/eduspace-v3-api-contract.md
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import {
  ExamSessionController,
  ExamSessionService,
  sanitizeExecutionPlan,
  type UserSecurityContext,
  type StartSessionRequest,
  type SubmitSessionRequest,
  type AutosaveRequest
} from '../../src/eduspace/assessment/index.ts';

import {
  MemoryExamRepository,
  MemoryExamSessionRepository,
  MemoryQuestionRepository,
  MemoryResultRepository,
  MemorySubmissionRepository,
  MemoryClassroomRepository
} from '../../src/eduspace/core/repositories/memoryRepository.ts';

import { EduSpaceError } from '../../src/eduspace/core/errors/EduSpaceError.ts';
import type { Exam } from '../../src/eduspace/core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../src/eduspace/core/domain/question.ts';
import { adaptLegacyV2QuizBundle } from '../../src/eduspace/core/normalizers/v2QuizAdapter.ts';

// ----------------------------------------------------------------------
// Test Fixtures & Factories
// ----------------------------------------------------------------------

function createMockStudent(codeId = '10042', ndid = 'student_raw_ndid', displayName = 'Nguyen Van A'): UserSecurityContext {
  return {
    codeId,
    ndid, // Raw string invariant: must not be prefixed with @
    role: 'user',
    eduRole: 'student',
    displayName,
    clientIp: '192.168.1.100',
    userAgent: 'Mozilla/5.0 EduSpaceTestAgent'
  };
}

function createMockTeacher(codeId = '90001', ndid = 'teacher_math', displayName = 'Thay Giao Toan'): UserSecurityContext {
  return {
    codeId,
    ndid,
    role: 'user',
    eduRole: 'teacher',
    displayName
  };
}

function createMockAdmin(codeId = '0000', ndid = 'owner_nd', displayName = 'Super Admin'): UserSecurityContext {
  return {
    codeId,
    ndid,
    role: 'admin',
    eduRole: 'teacher',
    adminLevel: 'owner',
    displayName
  };
}

function createTestExamAndQuestions(): {
  exam: Exam;
  questions: Question[];
  versions: QuestionVersion[];
} {
  const q1: Question = {
    id: 'q_sc_1',
    schemaVersion: 1,
    type: 'single_choice',
    subjectId: 'toan',
    grade: 10,
    authorCodeId: '90001',
    currentVersionId: 'q_sc_1_v1',
    currentVersionNumber: 1,
    cognitiveLevel: 'recognition',
    difficultyScore: 1,
    learningObjectiveIds: [],
    tags: [],
    status: 'approved',
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  };

  const v1: QuestionVersion = {
    id: 'q_sc_1_v1',
    schemaVersion: 1,
    questionId: 'q_sc_1',
    versionNumber: 1,
    content: {
      prompt: 'Phương trình bậc nhất ax + b = 0 (a != 0) có nghiệm là gì?',
      payload: {
        options: [
          { id: 'opt_a', text: 'x = -b/a' },
          { id: 'opt_b', text: 'x = b/a' },
          { id: 'opt_c', text: 'x = -a/b' },
          { id: 'opt_d', text: 'x = a/b' }
        ]
      }
    },
    gradingConfig: {
      payload: {
        correctOptionId: 'opt_a'
      },
      explanation: 'Nghiệm của ax + b = 0 là x = -b/a.'
    },
    createdByCodeId: '90001',
    createdAt: '2026-09-16T12:00:00.000Z'
  };

  const q2: Question = {
    id: 'q_tf_2',
    schemaVersion: 1,
    type: 'true_false',
    subjectId: 'toan',
    grade: 10,
    authorCodeId: '90001',
    currentVersionId: 'q_tf_2_v1',
    currentVersionNumber: 1,
    cognitiveLevel: 'comprehension',
    difficultyScore: 2,
    learningObjectiveIds: [],
    tags: [],
    status: 'approved',
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  };

  const v2: QuestionVersion = {
    id: 'q_tf_2_v1',
    schemaVersion: 1,
    questionId: 'q_tf_2',
    versionNumber: 1,
    content: {
      prompt: 'Cho tam giác ABC đều. Xét tính đúng sai của các mệnh đề sau:',
      payload: {
        items: [
          { id: 'item_a', text: 'Ba cạnh bằng nhau' },
          { id: 'item_b', text: 'Ba góc bằng nhau và bằng 60 độ' },
          { id: 'item_c', text: 'Là tam giác vuông cân' },
          { id: 'item_d', text: 'Đường cao đồng thời là trung tuyến' }
        ]
      }
    },
    gradingConfig: {
      payload: {
        correctAnswers: {
          item_a: true,
          item_b: true,
          item_c: false,
          item_d: true
        },
        partialScoreLadder: [0.1, 0.25, 0.5, 1.0]
      },
      explanation: 'Tam giác đều có 3 cạnh bằng nhau, 3 góc 60 độ, không thể là tam giác vuông.'
    },
    createdByCodeId: '90001',
    createdAt: '2026-09-16T12:00:00.000Z'
  };

  const exam: Exam = {
    id: 'exam_toan_10_test',
    schemaVersion: 1,
    title: 'Kiểm tra Giữa kỳ 1 Toán 10',
    subjectId: 'toan',
    grade: 10,
    examType: 'midterm',
    durationMinutes: 45,
    totalPoints: 10.0,
    passPoints: 5.0,
    sections: [
      {
        id: 'sec_1',
        title: 'Phần 1: Trắc nghiệm 4 lựa chọn',
        sectionOrder: 1,
        questionType: 'single_choice',
        questions: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            allocatedPoints: 4.0,
            orderIndex: 1
          }
        ]
      },
      {
        id: 'sec_2',
        title: 'Phần 2: Trắc nghiệm Đúng/Sai GDPT 2018',
        sectionOrder: 2,
        questionType: 'true_false',
        questions: [
          {
            questionId: 'q_tf_2',
            questionVersionId: 'q_tf_2_v1',
            allocatedPoints: 6.0,
            orderIndex: 2
          }
        ]
      }
    ],
    visibility: 'public',
    moderationStatus: 'approved',
    creatorCodeId: '90001',
    policy: {
      shuffleQuestions: false,
      shuffleOptions: false,
      maxAttempts: 2,
      allowReviewAfterSubmit: true,
      showExplanationsImmediately: true,
      requireContinuousFocus: false,
      allowRetake: true
    },
    status: 'active',
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  };

  return { exam, questions: [q1, q2], versions: [v1, v2] };
}

// ----------------------------------------------------------------------
// Test Suite
// ----------------------------------------------------------------------

describe('EduSpace V3 Server-Authoritative Exam Session & Assessment Backend', () => {
  let examRepo: MemoryExamRepository;
  let questionRepo: MemoryQuestionRepository;
  let sessionRepo: MemoryExamSessionRepository;
  let submissionRepo: MemorySubmissionRepository;
  let resultRepo: MemoryResultRepository;
  let classroomRepo: MemoryClassroomRepository;
  let service: ExamSessionService;
  let controller: ExamSessionController;

  beforeEach(async () => {
    examRepo = new MemoryExamRepository();
    questionRepo = new MemoryQuestionRepository();
    sessionRepo = new MemoryExamSessionRepository();
    submissionRepo = new MemorySubmissionRepository();
    resultRepo = new MemoryResultRepository();
    classroomRepo = new MemoryClassroomRepository();

    service = new ExamSessionService({
      examRepo,
      questionRepo,
      sessionRepo,
      submissionRepo,
      resultRepo,
      classroomRepo
    });

    controller = new ExamSessionController(service);

    // Seed test exam and questions
    const { exam, questions, versions } = createTestExamAndQuestions();
    await examRepo.create(exam);
    for (let i = 0; i < questions.length; i++) {
      await questionRepo.create(questions[i], versions[i]);
    }
  });

  // --------------------------------------------------------------------
  // Scenario A: Session Authorization & Pre-Conditions
  // --------------------------------------------------------------------
  describe('A. Session Authorization & Access Control', () => {
    it('allows an authenticated student to start an exam session', async () => {
      const student = createMockStudent();
      const response = await service.startSession(student, { examId: 'exam_toan_10_test' });

      assert.equal(response.success, true);
      assert.ok(response.sessionId.startsWith('ses_exam_toan_10_test_10042_'));
      assert.equal(response.exam.id, 'exam_toan_10_test');
      assert.equal(response.exam.sections.length, 2);
    });

    it('rejects unauthenticated requests to start session', async () => {
      const emptyUser = {} as UserSecurityContext;
      await assert.rejects(
        async () => {
          await service.startSession(emptyUser, { examId: 'exam_toan_10_test' });
        },
        (err: any) => {
          assert.equal(err.code, 'UNAUTHENTICATED');
          assert.equal(err.status, 401);
          return true;
        }
      );
    });

    it('rejects starting session for non-existent exam with NOT_FOUND', async () => {
      const student = createMockStudent();
      await assert.rejects(
        async () => {
          await service.startSession(student, { examId: 'non_existent_exam' });
        },
        (err: any) => {
          assert.equal(err.code, 'NOT_FOUND');
          assert.equal(err.status, 404);
          return true;
        }
      );
    });

    it('rejects starting session when maxAttempts is exceeded', async () => {
      const student = createMockStudent();

      // Start attempt 1 & submit
      const session1 = await service.startSession(student, { examId: 'exam_toan_10_test' });
      await service.submit(student, session1.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      // Start attempt 2 & submit
      const session2 = await service.startSession(student, { examId: 'exam_toan_10_test' });
      await service.submit(student, session2.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      // Attempt 3 must be rejected (maxAttempts = 2)
      await assert.rejects(
        async () => {
          await service.startSession(student, { examId: 'exam_toan_10_test' });
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          assert.match(err.message, /Maximum exam attempts/);
          return true;
        }
      );
    });

    it('rejects starting session before openTime or after deadlineTime', async () => {
      const student = createMockStudent();
      const exam = await examRepo.getById('exam_toan_10_test');
      assert.ok(exam);

      // Set schedule in the future
      exam.policy.openTime = '2026-10-01T00:00:00.000Z';
      await examRepo.update(exam.id, exam);

      await assert.rejects(
        async () => {
          await service.startSession(student, { examId: exam.id }, '2026-09-16T12:00:00.000Z');
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          assert.match(err.message, /Exam is not open yet/);
          return true;
        }
      );

      // Set deadline in the past
      exam.policy.openTime = undefined;
      exam.policy.deadlineTime = '2026-09-01T00:00:00.000Z';
      await examRepo.update(exam.id, exam);

      await assert.rejects(
        async () => {
          await service.startSession(student, { examId: exam.id }, '2026-09-16T12:00:00.000Z');
        },
        (err: any) => {
          assert.equal(err.code, 'SESSION_EXPIRED');
          assert.match(err.message, /Exam deadline has passed/);
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------
  // Scenario B: Strict Session Ownership & Isolation
  // --------------------------------------------------------------------
  describe('B. Strict Session Ownership & User Isolation', () => {
    it('strictly prevents student B from resuming, autosaving, or submitting student A session', async () => {
      const studentA = createMockStudent('10042', 'student_a');
      const studentB = createMockStudent('20088', 'student_b');

      const session = await service.startSession(studentA, { examId: 'exam_toan_10_test' });

      // 1. Student B resumes Student A session -> FORBIDDEN
      await assert.rejects(
        async () => {
          await service.resumeSession(studentB, session.sessionId);
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          assert.match(err.message, /You do not own this exam session/);
          return true;
        }
      );

      // 2. Student B autosaves Student A session -> FORBIDDEN
      await assert.rejects(
        async () => {
          await service.autosave(studentB, session.sessionId, { answersPayload: { q_sc_1: 'opt_b' } });
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          return true;
        }
      );

      // 3. Student B submits Student A session -> FORBIDDEN
      await assert.rejects(
        async () => {
          await service.submit(studentB, session.sessionId, {
            answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
          });
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------
  // Scenario C: Server Timer Semantics & Expiration Grace Period
  // --------------------------------------------------------------------
  describe('C. Server Timer Semantics & Expiration Buffer', () => {
    it('computes expiresAt strictly with 30s network buffer', async () => {
      const student = createMockStudent();
      const startTime = '2026-09-16T12:00:00.000Z';
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' }, startTime);

      // 45 minutes = 2700 seconds + 30 seconds buffer = 2730 seconds = 45m 30s
      const expectedExpiresAt = '2026-09-16T12:45:30.000Z';
      assert.equal(session.expiresAt, expectedExpiresAt);
    });

    it('accepts submission within 15 seconds grace buffer after expiresAt', async () => {
      const student = createMockStudent();
      const startTime = '2026-09-16T12:00:00.000Z';
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' }, startTime);

      // expiresAt is 12:45:30.000Z. Submit at 12:45:40.000Z (10s past expiresAt, within 15s grace buffer)
      const submitTime = '2026-09-16T12:45:40.000Z';
      const response = await service.submit(
        student,
        session.sessionId,
        {
          answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
        },
        submitTime
      );

      assert.equal(response.success, true);
      assert.equal(response.status, 'graded');
    });

    it('hard-rejects submission submitted after expiresAt + 15s grace buffer with SESSION_EXPIRED', async () => {
      const student = createMockStudent();
      const startTime = '2026-09-16T12:00:00.000Z';
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' }, startTime);

      // Submit at 12:45:46.000Z (16s past expiresAt, exceeding 15s buffer)
      const tooLateTime = '2026-09-16T12:45:46.000Z';
      await assert.rejects(
        async () => {
          await service.submit(
            student,
            session.sessionId,
            {
              answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
            },
            tooLateTime
          );
        },
        (err: any) => {
          assert.equal(err.code, 'SESSION_EXPIRED');
          assert.equal(err.status, 410);
          return true;
        }
      );

      // Verify session status transitioned to expired
      const updated = await sessionRepo.getById(session.sessionId);
      assert.equal(updated?.status, 'expired');
    });

    it('transitions session to expired upon resume if current time > expiresAt', async () => {
      const student = createMockStudent();
      const startTime = '2026-09-16T12:00:00.000Z';
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' }, startTime);

      const pastExpiryTime = '2026-09-16T13:00:00.000Z';
      await assert.rejects(
        async () => {
          await service.resumeSession(student, session.sessionId, pastExpiryTime);
        },
        (err: any) => {
          assert.equal(err.code, 'SESSION_EXPIRED');
          return true;
        }
      );

      const updated = await sessionRepo.getById(session.sessionId);
      assert.equal(updated?.status, 'expired');
    });
  });

  // --------------------------------------------------------------------
  // Scenario D: Autosave Contract & Answer Validation
  // --------------------------------------------------------------------
  describe('D. Autosave Contract & Non-Terminal Preservation', () => {
    it('successfully autosaves valid answers without changing session status out of in_progress', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const autosavePayload: AutosaveRequest = {
        answersPayload: {
          q_sc_1: 'opt_a',
          q_tf_2: { item_a: true, item_b: true }
        },
        answerVersion: 1
      };

      const response = await service.autosave(student, session.sessionId, autosavePayload);

      assert.equal(response.success, true);
      assert.equal(response.savedAnswersCount, 2);

      const updated = await sessionRepo.getById(session.sessionId);
      assert.equal(updated?.status, 'in_progress'); // Autosave MUST NEVER finalize or submit
      assert.equal(updated?.autosaveState?.savedAnswersCount, 2);
      assert.equal(updated?.autosaveState?.answersPayload.q_sc_1, 'opt_a');
    });

    it('rejects autosave containing unknown question IDs', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const roguePayload: AutosaveRequest = {
        answersPayload: {
          q_sc_1: 'opt_a',
          rogue_question_999: 'opt_x'
        }
      };

      await assert.rejects(
        async () => {
          await service.autosave(student, session.sessionId, roguePayload);
        },
        (err: any) => {
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.match(err.message, /Unknown question ID in autosave payload/);
          return true;
        }
      );
    });

    it('rejects autosave if session has already expired', async () => {
      const student = createMockStudent();
      const startTime = '2026-09-16T12:00:00.000Z';
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' }, startTime);

      await assert.rejects(
        async () => {
          await service.autosave(
            student,
            session.sessionId,
            { answersPayload: { q_sc_1: 'opt_a' } },
            '2026-09-16T13:00:00.000Z' // Past expiry
          );
        },
        (err: any) => {
          assert.equal(err.code, 'SESSION_EXPIRED');
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------
  // Scenario E: Submission Validation & Tampering Protections
  // --------------------------------------------------------------------
  describe('E. Submission Validation & Tampering Protections', () => {
    it('rejects submission containing unknown questions not in exam plan', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      await assert.rejects(
        async () => {
          await service.submit(student, session.sessionId, {
            answers: [
              { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } },
              { questionId: 'rogue_alien_q', questionVersionId: 'v1', responsePayload: { text: 'fake' } }
            ]
          });
        },
        (err: any) => {
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.match(err.message, /not part of exam session/);
          return true;
        }
      );
    });

    it('rejects submission with duplicate answers for the same question', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      await assert.rejects(
        async () => {
          await service.submit(student, session.sessionId, {
            answers: [
              { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } },
              { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_b' } }
            ]
          });
        },
        (err: any) => {
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.match(err.message, /Duplicate answer/);
          return true;
        }
      );
    });

    it('rejects submission with tampered questionVersionId', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      await assert.rejects(
        async () => {
          await service.submit(student, session.sessionId, {
            answers: [
              { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v999_tampered', responsePayload: { selectedOptionId: 'opt_a' } }
            ]
          });
        },
        (err: any) => {
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.match(err.message, /Tampered version ID/);
          return true;
        }
      );
    });

    it('strips client-supplied score and awardedPoints fields without trusting them', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      // Attacker attempts to submit wrong answer 'opt_b' but injects full score and awardedPoints: 10
      const submitResponse = await service.submit(student, session.sessionId, {
        answers: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            responsePayload: { selectedOptionId: 'opt_b' }, // Wrong answer!
            score: 10.0, // Rogue client field!
            awardedPoints: 4.0, // Rogue client field!
            isCorrect: true // Rogue client field!
          }
        ]
      });

      assert.equal(submitResponse.success, true);

      // Verify official Result: must be 0 points because opt_b is wrong!
      const result = await service.getResult(student, session.sessionId);
      assert.ok(result);
      assert.equal(result.totalScore, 0); // Server calculated 0, attacker's 10.0 was stripped!
    });
  });

  // --------------------------------------------------------------------
  // Scenario F: Full Auto-Grading Lifecycle & GDPT 2018 Partial Scoring
  // --------------------------------------------------------------------
  describe('F. Server Auto-Grading & GDPT 2018 Scoring Engine', () => {
    it('executes full grading accurately: Single Choice (4đ) + GDPT 2018 True/False (6đ)', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      // Student submits:
      // - Q1 (Single choice): opt_a (CORRECT) -> 4.0 points
      // - Q2 (True/False): 4/4 items correct -> full 1.0 ratio * 6.0 points = 6.0 points
      const response = await service.submit(student, session.sessionId, {
        answers: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            responsePayload: { selectedOptionId: 'opt_a' }
          },
          {
            questionId: 'q_tf_2',
            questionVersionId: 'q_tf_2_v1',
            responsePayload: {
              tfAnswers: {
                item_a: true,
                item_b: true,
                item_c: false,
                item_d: true
              }
            }
          }
        ]
      });

      assert.equal(response.success, true);
      assert.equal(response.status, 'graded');

      // Check authoritative Result
      const result = await service.getResult(student, session.sessionId);
      assert.equal(result.totalScore, 10.0);
      assert.equal(result.maxScore, 10.0);
      assert.equal(result.percentage, 100);
      assert.equal(result.passed, true);
      assert.equal(result.sectionScores.length, 2);
      assert.equal(result.sectionScores[0].score, 4.0);
      assert.equal(result.sectionScores[1].score, 6.0);
    });

    it('accurately applies GDPT 2018 partial ladder: 2/4 items correct -> 0.25 ladder ratio', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      // Student submits:
      // - Q1: opt_a (CORRECT) -> 4.0đ
      // - Q2: item_a correct, item_b correct, item_c WRONG, item_d WRONG (2/4 correct) -> ladder 0.25 * 6.0đ = 1.5đ
      await service.submit(student, session.sessionId, {
        answers: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            responsePayload: { selectedOptionId: 'opt_a' }
          },
          {
            questionId: 'q_tf_2',
            questionVersionId: 'q_tf_2_v1',
            responsePayload: {
              tfAnswers: {
                item_a: true,  // correct
                item_b: true,  // correct
                item_c: true,  // wrong (expected false)
                item_d: false  // wrong (expected true)
              }
            }
          }
        ]
      });

      const result = await service.getResult(student, session.sessionId);
      // Total = 4.0 (Q1) + 1.5 (Q2: 0.25 * 6.0) = 5.5
      assert.equal(result.totalScore, 5.5);
      assert.equal(result.passed, true);
    });
  });

  // --------------------------------------------------------------------
  // Scenario G: Submission Idempotency Replay Contract
  // --------------------------------------------------------------------
  describe('G. Submission Idempotency & Terminal Session Protection', () => {
    it('handles duplicate submit cleanly as an idempotent replay without throwing or re-grading', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const answersPayload: SubmitSessionRequest = {
        answers: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            responsePayload: { selectedOptionId: 'opt_a' }
          }
        ]
      };

      // First submit
      const res1 = await service.submit(student, session.sessionId, answersPayload);
      assert.equal(res1.success, true);
      assert.equal(res1.isIdempotentReplay, false);

      // Second submit (Double click / Network retry replay)
      const res2 = await service.submit(student, session.sessionId, answersPayload);
      assert.equal(res2.success, true);
      assert.equal(res2.sessionId, session.sessionId);
      assert.equal(res2.isIdempotentReplay, true);
    });

    it('rejects autosave on already-submitted or graded session with SUBMISSION_CLOSED', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      await service.submit(student, session.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      await assert.rejects(
        async () => {
          await service.autosave(student, session.sessionId, { answersPayload: { q_sc_1: 'opt_a' } });
        },
        (err: any) => {
          assert.equal(err.code, 'SUBMISSION_CLOSED');
          assert.equal(err.status, 423);
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------
  // Scenario H: API Response Sanitization & Answer Key Isolation
  // --------------------------------------------------------------------
  describe('H. Answer Key Isolation & Response Sanitization', () => {
    it('guarantees that StartSession response has ZERO answer keys or grading configs', async () => {
      const student = createMockStudent();
      const response = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const jsonStr = JSON.stringify(response);

      // Verify forbidden keys are 100% absent
      assert.ok(!jsonStr.includes('correctOptionId'), 'Leaked correctOptionId!');
      assert.ok(!jsonStr.includes('correctAnswers'), 'Leaked correctAnswers!');
      assert.ok(!jsonStr.includes('gradingConfig'), 'Leaked gradingConfig!');
      assert.ok(!jsonStr.includes('explanation'), 'Leaked explanation!');
      assert.ok(!jsonStr.includes('rubricCriteria'), 'Leaked rubricCriteria!');
      assert.ok(!jsonStr.includes('partialScoreLadder'), 'Leaked partialScoreLadder!');
    });

    it('guarantees that ResumeSession response has ZERO answer keys or grading configs', async () => {
      const student = createMockStudent();
      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const resumeRes = await service.resumeSession(student, session.sessionId);
      const jsonStr = JSON.stringify(resumeRes);

      assert.ok(!jsonStr.includes('correctOptionId'));
      assert.ok(!jsonStr.includes('correctAnswers'));
      assert.ok(!jsonStr.includes('gradingConfig'));
      assert.ok(!jsonStr.includes('explanation'));
    });
  });

  // --------------------------------------------------------------------
  // Scenario I: Canonical NDID Raw String & CodeID Preservation
  // --------------------------------------------------------------------
  describe('I. Canonical NDID Raw String Preservation & Auth Invariants', () => {
    it('preserves student raw NDID 100% untouched without adding prefix @ in Result', async () => {
      const studentWithRawSpecialNdid = createMockStudent('10042', 'admin@nd.special_ndid#123');
      const session = await service.startSession(studentWithRawSpecialNdid, { examId: 'exam_toan_10_test' });

      await service.submit(studentWithRawSpecialNdid, session.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      const result = await service.getResult(studentWithRawSpecialNdid, session.sessionId);

      // Must be EXACT raw string
      assert.equal(result.studentNdid, 'admin@nd.special_ndid#123');
      assert.notEqual(result.studentNdid, '@admin@nd.special_ndid#123');
      assert.equal(result.studentCodeId, '10042');
    });

    it('allows Owner CodeID 0000 to view any student result', async () => {
      const student = createMockStudent('10042', 'student_a');
      const owner = createMockAdmin('0000', 'super_owner');

      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });
      await service.submit(student, session.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      // Owner views student's result
      const result = await service.getResult(owner, session.sessionId);
      assert.equal(result.studentCodeId, '10042');
    });
  });

  // --------------------------------------------------------------------
  // Scenario J: Manual Grading & AI Review Guardrails
  // --------------------------------------------------------------------
  describe('J. Manual Grading & Teacher Review Guardrails', () => {
    it('allows teacher to perform manual grading on session', async () => {
      const student = createMockStudent();
      const teacher = createMockTeacher();

      const session = await service.startSession(student, { examId: 'exam_toan_10_test' });
      await service.submit(student, session.sessionId, {
        answers: [{ questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }]
      });

      const manualGradeRes = await service.manualGrade(teacher, {
        sessionId: session.sessionId,
        scores: [
          { questionId: 'q_sc_1', awardedPoints: 4.0, feedback: 'Tốt lắm' }
        ]
      });

      assert.equal(manualGradeRes.success, true);
      assert.equal(manualGradeRes.gradedByCodeId, teacher.codeId);
      assert.equal(manualGradeRes.isFinalized, true);
    });

    it('rejects student attempting to call manual grading with FORBIDDEN', async () => {
      const student = createMockStudent();
      await assert.rejects(
        async () => {
          await service.manualGrade(student, { sessionId: 'any_session', scores: [] });
        },
        (err: any) => {
          assert.equal(err.code, 'FORBIDDEN');
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------
  // Scenario K: V2 Compatibility with Session Service
  // --------------------------------------------------------------------
  describe('K. V2 Compatibility & Legacy Quiz Ingestion', () => {
    it('seamlessly starts, autosaves, and grades an exam adapted from a legacy V2 Quiz', async () => {
      const legacyV2Quiz = {
        id: 'legacy_v2_toan_gk',
        title: 'Đề kiểm tra V2 Toán 10',
        creator: 'TeacherV2',
        visibility: 'public' as const,
        timeLimit: 30,
        questions: [
          {
            id: 'legacy_q_1',
            title: 'Tập hợp nào sau đây là tập rỗng?',
            type: 'single',
            options: ['{x in R | x^2 + 1 = 0}', '{0}', '{x in R | x = x}', 'R'],
            correct: 0,
            score: 10
          }
        ]
      };

      const bundle = adaptLegacyV2QuizBundle('legacy_v2_toan_gk', legacyV2Quiz);
      await examRepo.create(bundle.exam);
      for (let i = 0; i < bundle.questions.length; i++) {
        await questionRepo.create(bundle.questions[i], bundle.versions[i]);
      }

      const student = createMockStudent('10042', 'student_v2_compat');
      const startRes = await service.startSession(student, { examId: bundle.exam.id });

      assert.equal(startRes.success, true);
      assert.equal(startRes.exam.title, 'Đề kiểm tra V2 Toán 10');

      // Submit with correct option opt_0
      const submitRes = await service.submit(student, startRes.sessionId, {
        answers: [
          {
            questionId: bundle.questions[0].id,
            questionVersionId: bundle.versions[0].id,
            responsePayload: { selectedOptionId: 'opt_0' }
          }
        ]
      });

      assert.equal(submitRes.success, true);
      const result = await service.getResult(student, startRes.sessionId);
      assert.equal(result.totalScore, 10.0);
      assert.equal(result.passed, true);
    });
  });

  // --------------------------------------------------------------------
  // Scenario L: ExamSessionController HTTP Dispatch & Envelope Mapping
  // --------------------------------------------------------------------
  describe('L. ExamSessionController HTTP Dispatch & Envelope Mapping', () => {
    it('handles POST /api/v3/exam-sessions with 201 Created and JSON envelope', async () => {
      const student = createMockStudent();
      const res = await controller.handleRequest(
        {
          method: 'POST',
          path: '/api/v3/exam-sessions',
          body: { examId: 'exam_toan_10_test' }
        },
        student
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.sessionId);
    });

    it('handles GET /api/v3/exam-sessions/:id/resume with 200 OK', async () => {
      const student = createMockStudent();
      const start = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const res = await controller.handleRequest(
        {
          method: 'GET',
          path: `/api/v3/exam-sessions/${start.sessionId}/resume`
        },
        student
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.sessionId, start.sessionId);
    });

    it('handles POST /api/v3/exam-sessions/:id/autosave with 200 OK', async () => {
      const student = createMockStudent();
      const start = await service.startSession(student, { examId: 'exam_toan_10_test' });

      const res = await controller.handleRequest(
        {
          method: 'POST',
          path: `/api/v3/exam-sessions/${start.sessionId}/autosave`,
          body: { answersPayload: { q_sc_1: 'opt_a' } }
        },
        student
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.savedAnswersCount, 1);
    });

    it('maps unauthenticated request to HTTP 401 UNAUTHENTICATED', async () => {
      const res = await controller.handleRequest(
        {
          method: 'POST',
          path: '/api/v3/exam-sessions',
          body: { examId: 'exam_toan_10_test' }
        },
        null // Missing auth
      );

      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHENTICATED');
    });

    it('maps OPTIONS preflight to HTTP 204 No Content with CORS headers', async () => {
      const res = await controller.handleRequest({
        method: 'OPTIONS',
        path: '/api/v3/exam-sessions'
      });

      assert.equal(res.statusCode, 204);
      assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
    });

    it('returns HTTP 404 for unknown API endpoints', async () => {
      const student = createMockStudent();
      const res = await controller.handleRequest(
        {
          method: 'GET',
          path: '/api/v3/unknown-non-existent-endpoint'
        },
        student
      );

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });
  });
});
