/**
 * EduSpace V3 - Phase 3 Domain Foundation Test Suite
 * Source of truth:
 * - docs/eduspace-v3-architecture.md
 * - docs/eduspace-v3-database-schema.md
 * - docs/eduspace-v3-api-contract.md
 * - .agents/AGENTS.md
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  // Constants
  COGNITIVE_LEVELS,
  EXAM_TYPES,
  EXAM_VISIBILITIES,
  MODERATION_STATUSES,
  SESSION_STATUSES,
  GRADING_METHODS,
  ASSIGNMENT_STATUSES,
  CLASSROOM_ROLES,
  EDU_ROLES,
  USER_ROLES,
  ADMIN_LEVELS,
  ERROR_CODES,
  SCHEMA_VERSION_LEGACY,
  SCHEMA_VERSION_CANONICAL,

  // Schema detection
  getSchemaVersion,
  isLegacySchema,
  isCanonicalSchema,

  // Payloads
  type SingleChoiceContentPayload,
  type SingleChoiceGradingPayload,
  type TrueFalseContentPayload,
  type TrueFalseGradingPayload,

  // Errors
  EduSpaceError,

  // Permissions
  isOwner,
  isAdmin,
  isTeacher,
  isStudent,
  canModeratePublicContent,
  canManageClassrooms,
  canEditExam,
  canEditClassroom,

  // Normalizers & Adapters
  normalizeQuestion,
  normalizeExam,
  normalizeClassroom,
  normalizeAssignment,
  normalizeResult,
  adaptLegacyV2Question,
  adaptLegacyV2Quiz,
  adaptLegacyV2QuizBundle,
  adaptLegacyV2Classroom,
  adaptLegacyV2ClassroomBundle,
  adaptLegacyV2Attempt,

  // Repositories
  createInMemoryRepositories,

  // API Client
  EduSpaceApiClient
} from '../../src/eduspace/core/index.ts';

// ======================================================================
// 1. Constants and Enums
// ======================================================================
describe('EduSpace V3 Constants & Enums', () => {
  it('should define all 10 canonical error codes', () => {
    assert.equal(ERROR_CODES.length, 10);
    assert.ok(ERROR_CODES.includes('VALIDATION_ERROR'));
    assert.ok(ERROR_CODES.includes('UNAUTHENTICATED'));
    assert.ok(ERROR_CODES.includes('FORBIDDEN'));
    assert.ok(ERROR_CODES.includes('NOT_FOUND'));
    assert.ok(ERROR_CODES.includes('CONFLICT'));
    assert.ok(ERROR_CODES.includes('RATE_LIMITED'));
    assert.ok(ERROR_CODES.includes('SESSION_EXPIRED'));
    assert.ok(ERROR_CODES.includes('SUBMISSION_CLOSED'));
    assert.ok(ERROR_CODES.includes('GRADING_UNAVAILABLE'));
    assert.ok(ERROR_CODES.includes('INTERNAL_ERROR'));
  });

  it('should define GDPT 2018 cognitive levels', () => {
    assert.deepEqual([...COGNITIVE_LEVELS], [
      'recognition',
      'comprehension',
      'application',
      'high_application'
    ]);
  });

  it('should define schema versions correctly', () => {
    assert.equal(SCHEMA_VERSION_LEGACY, 0);
    assert.equal(SCHEMA_VERSION_CANONICAL, 1);
  });
});

// ======================================================================
// 2. Schema Version Detection & Isolation
// ======================================================================
describe('Schema Version Detection & Isolation', () => {
  it('detects canonical V3 schema (schemaVersion === 1)', () => {
    const doc = { id: 'q_01', schemaVersion: 1, prompt: 'Test' };
    assert.equal(getSchemaVersion(doc), 1);
    assert.equal(isCanonicalSchema(doc), true);
    assert.equal(isLegacySchema(doc), false);
  });

  it('detects legacy V2 schema when schemaVersion is missing or 0', () => {
    const legacyDoc1 = { id: 'legacy_01', title: 'Old Quiz' };
    const legacyDoc2 = { id: 'legacy_02', schemaVersion: 0, title: 'Old Attempt' };

    assert.equal(getSchemaVersion(legacyDoc1), 0);
    assert.equal(getSchemaVersion(legacyDoc2), 0);
    assert.equal(isLegacySchema(legacyDoc1), true);
    assert.equal(isLegacySchema(legacyDoc2), true);
    assert.equal(isCanonicalSchema(legacyDoc1), false);
  });

  it('safely handles non-object or nullish inputs', () => {
    assert.equal(getSchemaVersion(null), 0);
    assert.equal(getSchemaVersion(undefined), 0);
    assert.equal(getSchemaVersion('invalid'), 0);
    assert.equal(isLegacySchema(null), true);
  });
});

// ======================================================================
// 3. Question Normalization & V2 Adapter
// ======================================================================
describe('Question Normalization & V2 Adapter', () => {
  it('normalizes legacy V2 single choice question', () => {
    const legacyRaw = {
      title: 'Mệnh đề nào sau đây đúng?',
      type: 'multiple',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      answer: 1, // index 1 -> opt_b
      explain: 'Giải thích chi tiết phương án B'
    };

    const { question, version } = adaptLegacyV2Question('quiz_toan_10', legacyRaw, 0, {
      subjectId: 'toan',
      grade: 10
    });

    assert.equal(question.schemaVersion, 1);
    assert.equal(question.type, 'single_choice');
    assert.equal(question.subjectId, 'toan');
    assert.equal(question.grade, 10);
    assert.equal(question.status, 'approved');

    assert.equal(version.schemaVersion, 1);
    assert.equal(version.content.prompt, 'Mệnh đề nào sau đây đúng?');
    const scContent = version.content.payload as SingleChoiceContentPayload;
    const scGrading = version.gradingConfig.payload as SingleChoiceGradingPayload;
    assert.equal(scContent.options.length, 4);
    assert.equal(scContent.options[1].id, 'opt_1');
    assert.equal(scGrading.correctOptionId, 'opt_1');
    assert.equal(version.gradingConfig.explanation, 'Giải thích chi tiết phương án B');
  });

  it('normalizes legacy V2 true/false question with GDPT 2018 ladder', () => {
    const legacyTf = {
      title: 'Các mệnh đề sau đúng hay sai?',
      type: 'truefalse',
      items: [
        { text: 'Ý a đúng', isCorrect: true },
        { text: 'Ý b sai', isCorrect: false },
        { text: 'Ý c đúng', isCorrect: true },
        { text: 'Ý d đúng', isCorrect: true }
      ]
    };

    const { question, version } = adaptLegacyV2Question('quiz_toan_10', legacyTf, 1);

    assert.equal(question.type, 'true_false');
    const tfContent = version.content.payload as TrueFalseContentPayload;
    const tfGrading = version.gradingConfig.payload as TrueFalseGradingPayload;
    assert.equal(tfContent.items.length, 4);
    assert.deepEqual(tfGrading.partialScoreLadder, [0.1, 0.25, 0.5, 1.0]);
    assert.equal(tfGrading.correctAnswers['item_0'], true);
    assert.equal(tfGrading.correctAnswers['item_1'], false);
  });

  it('normalizes canonical V3 question preserving structure', () => {
    const canonicalRaw = {
      id: 'q_chem_001',
      schemaVersion: 1,
      authorCodeId: '10042',
      type: 'numeric',
      subjectId: 'hoahoc',
      grade: 11,
      cognitiveLevel: 'application',
      difficultyScore: 3,
      tags: ['nồng độ', 'pH'],
      currentVersionId: 'q_chem_001_v1',
      currentVersionNumber: 1,
      status: 'approved',
      content: {
        prompt: 'Tính giá trị pH của dung dịch HCl 0.01M'
      }
    };

    const normalized = normalizeQuestion('q_chem_001', canonicalRaw);
    assert.equal(normalized.id, 'q_chem_001');
    assert.equal(normalized.schemaVersion, 1);
    assert.equal(normalized.type, 'numeric');
    assert.equal(normalized.subjectId, 'hoahoc');
    assert.equal(normalized.grade, 11);
    assert.equal(normalized.cognitiveLevel, 'application');
  });

  it('throws EduSpaceError with VALIDATION_ERROR on malformed question data', () => {
    assert.throws(
      () => normalizeQuestion('invalid_q', null),
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );

    assert.throws(
      () => normalizeQuestion('invalid_q2', { schemaVersion: 1 }), // missing prompt and type
      (err: any) => err instanceof EduSpaceError && err.code === 'VALIDATION_ERROR'
    );
  });
});

// ======================================================================
// 4. Exam Normalization & V2 Quiz Adapter
// ======================================================================
describe('Exam Normalization & V2 Quiz Adapter', () => {
  it('adapts legacy V2 quiz into canonical Exam and questions', () => {
    const legacyQuiz = {
      title: 'Đề Kiểm tra Định kỳ Toán 10',
      description: 'Đề kiểm tra 45 phút',
      subject: 'Toán',
      grade: '10',
      timeLimit: 45,
      questions: [
        {
          title: 'Câu hỏi số 1',
          type: 'multiple',
          options: ['A', 'B', 'C', 'D'],
          answer: 0
        },
        {
          title: 'Câu hỏi số 2',
          type: 'short',
          answer: '42'
        }
      ]
    };

    const { exam, questions, versions } = adaptLegacyV2QuizBundle('quiz_legacy_101', legacyQuiz);

    assert.equal(exam.id, 'quiz_legacy_101');
    assert.equal(exam.schemaVersion, 1);
    assert.equal(exam.sections.length, 2);
    assert.equal(exam.sections[0].questions.length, 1);
    assert.equal(exam.sections[1].questions.length, 1);
    assert.equal(questions.length, 2);
    assert.equal(versions.length, 2);
  });

  it('normalizes canonical V3 exam directly', () => {
    const canonicalExam = {
      id: 'exam_v3_01',
      schemaVersion: 1,
      title: 'Thi thử Tốt nghiệp THPT 2026',
      subjectId: 'vatly',
      grade: 12,
      examType: 'mock_thpt',
      durationMinutes: 50,
      totalPoints: 10.0,
      sections: [],
      visibility: 'public',
      moderationStatus: 'approved',
      creatorCodeId: '0000',
      policy: {
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: 2,
        allowReviewAfterSubmit: true,
        showExplanationsImmediately: false,
        requireContinuousFocus: true,
        allowRetake: true
      },
      status: 'active'
    };

    const normalized = normalizeExam('exam_v3_01', canonicalExam);
    assert.equal(normalized.id, 'exam_v3_01');
    assert.equal(normalized.schemaVersion, 1);
    assert.equal(normalized.subjectId, 'vatly');
    assert.equal(normalized.examType, 'mock_thpt');
  });
});

// ======================================================================
// 5. Classroom Normalization & NDID RAW STRING Preservation
// ======================================================================
describe('Classroom Normalization & NDID Raw String Rules', () => {
  it('preserves NDID 100% untouched as Raw String without prefix @', () => {
    const legacyClassroom = {
      name: 'Lớp 12A1 Chuyên Tin',
      subject: 'Tin học',
      grade: 12,
      teacherUid: '10042',
      joinCode: '654321',
      studentUids: ['10101', '10102', '10103'],
      studentNdids: ['alice', 'admin@nd', 'bob#special$chars!'], // Contains @, #, $, !
      studentNames: ['Alice Nguyen', 'Admin ND', 'Bob Tran']
    };

    const { classroom, members } = adaptLegacyV2ClassroomBundle('class_12a1', legacyClassroom);

    assert.equal(classroom.id, 'class_12a1');
    assert.equal(classroom.schemaVersion, 1);
    assert.equal(classroom.memberCount, 3);
    assert.equal(members.length, 3);

    // Strict NDID preservation assertions
    assert.equal(members[0].cachedNdid, 'alice');
    assert.ok(!members[0].cachedNdid.startsWith('@')); // NOT @alice

    assert.equal(members[1].cachedNdid, 'admin@nd'); // In DB it is "admin@nd", preserved raw verbatim
    assert.ok(!members[1].cachedNdid.startsWith('@@')); // NOT @@admin@nd

    assert.equal(members[2].cachedNdid, 'bob#special$chars!'); // Raw string preserved, no sanitize/strip
  });
});

// ======================================================================
// 6. Attempt / Result Normalization & NDID RAW STRING Preservation
// ======================================================================
describe('Attempt / Result Normalization & Raw String NDID', () => {
  it('maps legacy attempt to canonical Result preserving raw studentNdid', () => {
    const legacyAttempt = {
      id: 'att_7788',
      quizId: 'quiz_ck1',
      studentUid: '10099',
      studentNdid: 'learner_user.99', // Raw string
      studentName: 'Learner User',
      score: 9.0,
      totalQuestions: 10,
      correctCount: 9,
      timestamp: 1726480000000 // Milliseconds timestamp
    };

    const result = adaptLegacyV2Attempt('att_7788', legacyAttempt);

    assert.equal(result.id, 'att_7788');
    assert.equal(result.schemaVersion, 1);
    assert.equal(result.studentCodeId, '10099');
    assert.equal(result.studentNdid, 'learner_user.99');
    assert.ok(!result.studentNdid.startsWith('@')); // NEVER prepend @
    assert.equal(result.totalScore, 9.0);
    assert.equal(result.maxScore, 10.0);
    assert.ok(typeof result.submittedAt === 'string');
    assert.ok(result.submittedAt.endsWith('Z')); // ISO 8601 UTC string
  });
});

// ======================================================================
// 7. Canonical Error System (EduSpaceError)
// ======================================================================
describe('EduSpaceError Canonical Error System', () => {
  it('generates correct status and structure for all 10 error factories', () => {
    const cases: Array<{
      fn: () => EduSpaceError;
      code: string;
      status: number;
      retryAllowed: boolean;
    }> = [
      { fn: () => EduSpaceError.validationError('Bad data'), code: 'VALIDATION_ERROR', status: 400, retryAllowed: false },
      { fn: () => EduSpaceError.unauthenticated('No token'), code: 'UNAUTHENTICATED', status: 401, retryAllowed: false },
      { fn: () => EduSpaceError.forbidden('Denied'), code: 'FORBIDDEN', status: 403, retryAllowed: false },
      { fn: () => EduSpaceError.notFound('Missing'), code: 'NOT_FOUND', status: 404, retryAllowed: false },
      { fn: () => EduSpaceError.conflict('Exists'), code: 'CONFLICT', status: 409, retryAllowed: false },
      { fn: () => EduSpaceError.rateLimited('Slow down'), code: 'RATE_LIMITED', status: 429, retryAllowed: true },
      { fn: () => EduSpaceError.sessionExpired('Time up'), code: 'SESSION_EXPIRED', status: 410, retryAllowed: false },
      { fn: () => EduSpaceError.submissionClosed('Closed'), code: 'SUBMISSION_CLOSED', status: 423, retryAllowed: false },
      { fn: () => EduSpaceError.gradingUnavailable('Busy'), code: 'GRADING_UNAVAILABLE', status: 503, retryAllowed: true },
      { fn: () => EduSpaceError.internalError('Crash'), code: 'INTERNAL_ERROR', status: 500, retryAllowed: true }
    ];

    for (const c of cases) {
      const err = c.fn();
      assert.equal(err.code, c.code);
      assert.equal(err.status, c.status);
      assert.equal(err.retryAllowed, c.retryAllowed);
    }
  });

  it('toResponse() serializes public envelope without stack trace leak', () => {
    const err = EduSpaceError.forbidden('Access denied to exam');
    const response = err.toResponse();

    assert.equal(response.success, false);
    assert.equal(response.error.code, 'FORBIDDEN');
    assert.equal(response.error.message, 'Access denied to exam');
    assert.equal(response.error.retryAllowed, false);
    assert.ok(!('stack' in response.error));
  });
});

// ======================================================================
// 8. Permission & Identity Helpers
// ======================================================================
describe('Domain Permission & Identity Helpers', () => {
  it('protects Owner CodeID 0000 invariant', () => {
    const ownerCtx = {
      codeId: '0000',
      ndid: 'owner',
      displayName: 'Owner ND',
      role: 'admin' as const,
      adminLevel: 'owner' as const,
      eduRole: 'teacher' as const
    };

    assert.equal(isOwner(ownerCtx), true);
    assert.equal(isAdmin(ownerCtx), true);
    assert.equal(canModeratePublicContent(ownerCtx), true);

    // Impostor trying to spoof codeId 0000 without adminLevel owner
    const impostorCtx = {
      codeId: '0000',
      ndid: 'impostor',
      displayName: 'Impostor',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'student' as const
    };
    assert.equal(isOwner(impostorCtx), false);

    // Admin who is not owner
    const adminCtx = {
      codeId: '10001',
      ndid: 'admin_user',
      displayName: 'Admin User',
      role: 'admin' as const,
      adminLevel: 'admin' as const,
      eduRole: 'teacher' as const
    };
    assert.equal(isOwner(adminCtx), false);
    assert.equal(isAdmin(adminCtx), true);
    assert.equal(canModeratePublicContent(adminCtx), true);
  });

  it('validates teacher and student role permissions', () => {
    const teacherCtx = {
      codeId: '20001',
      ndid: 'teacher_toan',
      displayName: 'Teacher Toan',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'teacher' as const
    };

    const studentCtx = {
      codeId: '30001',
      ndid: 'student_10a1',
      displayName: 'Student 10A1',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'student' as const
    };

    assert.equal(isTeacher(teacherCtx), true);
    assert.equal(isStudent(teacherCtx), false);
    assert.equal(canManageClassrooms(teacherCtx), true);

    assert.equal(isTeacher(studentCtx), false);
    assert.equal(isStudent(studentCtx), true);
    assert.equal(canManageClassrooms(studentCtx), false);
    assert.equal(canModeratePublicContent(studentCtx), false);
  });

  it('verifies exam and classroom ownership edit rights', () => {
    const teacherCtx = {
      codeId: '20001',
      ndid: 'teacher_toan',
      displayName: 'Teacher Toan',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'teacher' as const
    };

    const otherTeacherCtx = {
      codeId: '20002',
      ndid: 'teacher_ly',
      displayName: 'Teacher Ly',
      role: 'user' as const,
      adminLevel: null,
      eduRole: 'teacher' as const
    };

    const exam = {
      id: 'exam_01',
      creatorCodeId: '20001'
    } as any;

    assert.equal(canEditExam(teacherCtx, exam), true);
    assert.equal(canEditExam(otherTeacherCtx, exam), false);
  });
});

// ======================================================================
// 9. Repository Layer (In-Memory Isolation)
// ======================================================================
describe('In-Memory Repository Contracts & Operations', () => {
  const repos = createInMemoryRepositories();

  it('performs complete Question and Version lifecycle', async () => {
    const question = {
      id: 'q_test_100',
      schemaVersion: 1 as const,
      authorCodeId: '10042',
      type: 'single_choice' as const,
      subjectId: 'toan',
      grade: 10,
      learningObjectiveIds: [],
      cognitiveLevel: 'comprehension' as const,
      difficultyScore: 2,
      tags: ['toan-10'],
      currentVersionId: 'q_test_100_v1',
      currentVersionNumber: 1,
      status: 'approved' as const,
      createdAt: '2026-09-16T12:00:00.000Z',
      updatedAt: '2026-09-16T12:00:00.000Z'
    };

    const initialVersion = {
      id: 'q_test_100_v1',
      schemaVersion: 1 as const,
      questionId: 'q_test_100',
      versionNumber: 1,
      content: {
        prompt: '1 + 1 = ?',
        payload: { options: [{ id: 'opt_1', text: '2' }] }
      },
      gradingConfig: {
        payload: { correctOptionId: 'opt_1' }
      },
      createdByCodeId: '10042',
      createdAt: '2026-09-16T12:00:00.000Z'
    };

    await repos.questions.create(question, initialVersion);

    const fetched = await repos.questions.getById('q_test_100');
    assert.ok(fetched);
    assert.equal(fetched.id, 'q_test_100');

    const fetchedVersion = await repos.questions.getVersion('q_test_100', 'q_test_100_v1');
    assert.ok(fetchedVersion);
    assert.equal(fetchedVersion.content.prompt, '1 + 1 = ?');

    // Add version 2
    const v2 = {
      id: 'q_test_100_v2',
      schemaVersion: 1 as const,
      questionId: 'q_test_100',
      versionNumber: 2,
      content: {
        prompt: '1 + 1 bằng bao nhiêu?',
        payload: { options: [{ id: 'opt_1', text: '2' }] }
      },
      gradingConfig: {
        payload: { correctOptionId: 'opt_1' }
      },
      changeSummary: 'Sửa lại câu hỏi rõ nghĩa hơn',
      createdByCodeId: '10042',
      createdAt: '2026-09-16T12:05:00.000Z'
    };

    await repos.questions.addVersion('q_test_100', v2);

    const updatedQ = await repos.questions.getById('q_test_100');
    assert.equal(updatedQ?.currentVersionId, 'q_test_100_v2');
    assert.equal(updatedQ?.currentVersionNumber, 2);

    // Test list filtering
    const listMath = await repos.questions.list({ subjectId: 'toan', grade: 10 });
    assert.equal(listMath.length, 1);

    const listPhysics = await repos.questions.list({ subjectId: 'vatly' });
    assert.equal(listPhysics.length, 0);

    // Archive
    await repos.questions.archive('q_test_100');
    const archivedQ = await repos.questions.getById('q_test_100');
    assert.equal(archivedQ?.status, 'archived');
  });

  it('manages classroom enrollment and members counter', async () => {
    const classroom = {
      id: 'cls_001',
      schemaVersion: 1 as const,
      className: 'Lớp 11A2',
      grade: 11,
      schoolYear: '2025-2026',
      teacherCodeId: '20001',
      joinCode: '112233',
      allowSelfEnrollment: true,
      memberCount: 0,
      status: 'active' as const,
      createdAt: '2026-09-16T10:00:00.000Z',
      updatedAt: '2026-09-16T10:00:00.000Z'
    };

    await repos.classrooms.create(classroom);

    const member1 = {
      id: 'cls_001_30001',
      schemaVersion: 1 as const,
      classroomId: 'cls_001',
      studentCodeId: '30001',
      cachedNdid: 'student_nam',
      cachedDisplayName: 'Nam Nguyen',
      roleInClass: 'student' as const,
      joinedAt: '2026-09-16T10:05:00.000Z',
      status: 'active' as const,
      updatedAt: '2026-09-16T10:05:00.000Z'
    };

    await repos.classrooms.addMember(member1);

    const afterAdd = await repos.classrooms.getById('cls_001');
    assert.equal(afterAdd?.memberCount, 1);

    const members = await repos.classrooms.getMembers('cls_001');
    assert.equal(members.length, 1);
    assert.equal(members[0].cachedNdid, 'student_nam');

    await repos.classrooms.removeMember('cls_001', '30001');
    const afterRemove = await repos.classrooms.getById('cls_001');
    assert.equal(afterRemove?.memberCount, 0);
  });
});

// ======================================================================
// 10. API Client Layer (Mock Fetch)
// ======================================================================
describe('EduSpaceApiClient Error Mapping & Request Handling', () => {
  it('handles successful API request with auth token', async () => {
    let capturedHeaders: Record<string, string> = {};

    const mockFetch: typeof fetch = async (input, init) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'bank_01', title: 'Ngân hàng Toán 10' }]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new EduSpaceApiClient({
      baseUrl: 'https://api.eduspace.internal',
      getToken: async () => 'test-firebase-id-token',
      fetchFn: mockFetch
    });

    const res = await client.getQuestionBanks({ subjectId: 'toan', grade: 10 });
    assert.equal(res.success, true);
    assert.equal(capturedHeaders['Authorization'], 'Bearer test-firebase-id-token');
    assert.equal(res.data?.[0]?.id, 'bank_01');
  });

  it('maps HTTP 403 response to EduSpaceError FORBIDDEN', async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bạn không có quyền thực hiện thao tác này.',
            retryAllowed: false
          }
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new EduSpaceApiClient({
      baseUrl: 'https://api.eduspace.internal',
      fetchFn: mockFetch
    });

    await assert.rejects(
      () => client.getQuestion('q_secret'),
      (err: any) => {
        assert.ok(err instanceof EduSpaceError);
        assert.equal(err.code, 'FORBIDDEN');
        assert.equal(err.status, 403);
        assert.equal(err.retryAllowed, false);
        return true;
      }
    );
  });

  it('maps HTTP 410 response to EduSpaceError SESSION_EXPIRED', async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Phiên làm bài đã hết giờ.',
            retryAllowed: false
          }
        }),
        { status: 410, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new EduSpaceApiClient({
      baseUrl: 'https://api.eduspace.internal',
      fetchFn: mockFetch
    });

    await assert.rejects(
      () => client.resumeExamSession('ses_expired_1'),
      (err: any) => {
        assert.ok(err instanceof EduSpaceError);
        assert.equal(err.code, 'SESSION_EXPIRED');
        assert.equal(err.status, 410);
        return true;
      }
    );
  });
});
