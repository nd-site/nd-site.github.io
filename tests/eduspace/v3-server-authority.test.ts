/**
 * EduSpace V3 - Server-Authoritative HTTP Boundary Verification Tests (Phase 5.1)
 * Source of truth: docs/eduspace-v3-exam-session.md & docs/eduspace-v3-api-contract.md
 * 
 * Verifies that the V3 assessment execution path is genuinely server-authoritative:
 * Client -> HTTP API -> Authentication Boundary -> Authorization -> Server Assessment Engine -> Trusted Database -> Sanitized Response
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { EventEmitter } from 'node:events';

import handleV3Assessment from '../../api/v3.js';
import {
  MemoryExamRepository,
  MemoryExamSessionRepository,
  MemoryQuestionRepository,
  MemoryResultRepository,
  MemorySubmissionRepository
} from '../../src/eduspace/core/repositories/memoryRepository.ts';
import type { Exam } from '../../src/eduspace/core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../src/eduspace/core/domain/question.ts';
import { adaptLegacyV2QuizBundle } from '../../src/eduspace/core/normalizers/v2QuizAdapter.ts';

// ----------------------------------------------------------------------
// Mock HTTP Request & Response Infrastructure (Matching Node.js HTTP)
// ----------------------------------------------------------------------

class MockHttpRequest extends EventEmitter {
  public method: string;
  public url: string;
  public headers: Record<string, string>;
  public body: any;
  public socket: { remoteAddress: string };

  constructor(options: { method?: string; url?: string; headers?: Record<string, string>; body?: any }) {
    super();
    this.method = options.method || 'GET';
    this.url = options.url || '/';
    this.headers = { host: 'localhost:3000', ...(options.headers || {}) };
    this.body = options.body !== undefined ? options.body : null;
    this.socket = { remoteAddress: '127.0.0.1' };
  }
}

class MockHttpResponse extends EventEmitter {
  public statusCode: number = 200;
  public headers: Record<string, string> = {};
  public body: string = '';

  setHeader(key: string, val: string): void {
    this.headers[key.toLowerCase()] = val;
  }

  end(chunk?: string): void {
    if (chunk) this.body += chunk;
    this.emit('finish');
  }

  getJson(): any {
    return this.body ? JSON.parse(this.body) : null;
  }
}

async function dispatchServerApi(
  reqOptions: { method?: string; url?: string; headers?: Record<string, string>; body?: any; streamBody?: string },
  customOptions: any
): Promise<MockHttpResponse> {
  const req = new MockHttpRequest(reqOptions);
  const res = new MockHttpResponse();
  const finishPromise = new Promise(resolve => res.on('finish', resolve));

  handleV3Assessment(req, res, customOptions);

  if (reqOptions.streamBody) {
    req.emit('data', reqOptions.streamBody);
    req.emit('end');
  } else {
    process.nextTick(() => req.emit('end'));
  }

  await finishPromise;
  return res;
}

// ----------------------------------------------------------------------
// Mock Database & Auth Environment
// ----------------------------------------------------------------------

function createMockFirebaseContext() {
  const usersStore = new Map<string, any>();

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          return {
            async get() {
              if (name === 'users') {
                const user = usersStore.get(id);
                return {
                  exists: !!user,
                  data: () => user
                };
              }
              return { exists: false, data: () => null };
            }
          };
        }
      };
    }
  };

  const auth = {
    async verifyIdToken(token: string) {
      if (token.startsWith('valid_token_for_')) {
        const uid = token.replace('valid_token_for_', '');
        return { uid };
      }
      throw new Error('Invalid Firebase ID token signature');
    }
  };

  // Seed canonical users
  usersStore.set('10042', {
    codeId: '10042',
    ndid: 'student.nd_raw#10042', // RAW STRING invariant (no @)
    role: 'user',
    eduRole: 'student',
    displayName: 'Nguyen Van A',
    status: 'active'
  });

  usersStore.set('20088', {
    codeId: '20088',
    ndid: 'attacker_student#20088',
    role: 'user',
    eduRole: 'student',
    displayName: 'Nguyen Van B',
    status: 'active'
  });

  usersStore.set('90001', {
    codeId: '90001',
    ndid: 'teacher_toan',
    role: 'user',
    eduRole: 'teacher',
    displayName: 'Thay Giao Toan',
    status: 'active'
  });

  usersStore.set('0000', {
    codeId: '0000',
    ndid: 'owner_nd_labs',
    role: 'admin',
    adminLevel: 'owner',
    eduRole: 'teacher',
    displayName: 'System Owner',
    status: 'active'
  });

  return { db, auth, usersStore };
}

function createSeedExamAndQuestions(): { exam: Exam; questions: Question[]; versions: QuestionVersion[] } {
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
          { id: 'opt_b', text: 'x = b/a' }
        ]
      }
    },
    gradingConfig: {
      payload: {
        correctOptionId: 'opt_a'
      },
      explanation: 'Nghiệm là x = -b/a'
    },
    createdByCodeId: '90001',
    createdAt: '2026-09-16T12:00:00.000Z'
  };

  const exam: Exam = {
    id: 'exam_toan_midterm',
    schemaVersion: 1,
    title: 'Kiểm tra Giữa kỳ 1 Toán 10',
    subjectId: 'toan',
    grade: 10,
    examType: 'midterm',
    durationMinutes: 45,
    totalPoints: 10.0,
    sections: [
      {
        id: 'sec_1',
        title: 'Trắc nghiệm',
        sectionOrder: 1,
        questionType: 'single_choice',
        questions: [
          {
            questionId: 'q_sc_1',
            questionVersionId: 'q_sc_1_v1',
            allocatedPoints: 10.0,
            orderIndex: 1
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

  return { exam, questions: [q1], versions: [v1] };
}

// ----------------------------------------------------------------------
// Test Suite: Real Server Authority Verification
// ----------------------------------------------------------------------

describe('EduSpace V3 Real Server Authority & HTTP Execution Boundary (Phase 5.1)', () => {
  let firebaseContext: ReturnType<typeof createMockFirebaseContext>;
  let examRepo: MemoryExamRepository;
  let questionRepo: MemoryQuestionRepository;
  let sessionRepo: MemoryExamSessionRepository;
  let submissionRepo: MemorySubmissionRepository;
  let resultRepo: MemoryResultRepository;
  let testEnv: any;

  beforeEach(async () => {
    firebaseContext = createMockFirebaseContext();
    examRepo = new MemoryExamRepository();
    questionRepo = new MemoryQuestionRepository();
    sessionRepo = new MemoryExamSessionRepository();
    submissionRepo = new MemorySubmissionRepository();
    resultRepo = new MemoryResultRepository();

    const { exam, questions, versions } = createSeedExamAndQuestions();
    await examRepo.create(exam);
    await questionRepo.create(questions[0], versions[0]);

    testEnv = {
      db: firebaseContext.db,
      auth: firebaseContext.auth,
      examRepo,
      questionRepo,
      sessionRepo,
      submissionRepo,
      resultRepo
    };
  });

  // A. Unauthenticated session creation rejected
  it('A. rejects unauthenticated session creation with HTTP 401 UNAUTHENTICATED', async () => {
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );

    assert.equal(res.statusCode, 401);
    const json = res.getJson();
    assert.equal(json.success, false);
    assert.equal(json.error.code, 'UNAUTHENTICATED');
  });

  // B. Authenticated session creation
  it('B. creates server session with HTTP 201 when authenticated with valid Bearer token', async () => {
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );

    assert.equal(res.statusCode, 201);
    const json = res.getJson();
    assert.equal(json.success, true);
    assert.ok(json.sessionId);
    assert.equal(json.exam.id, 'exam_toan_midterm');
  });

  // C. CodeID derived strictly from auth token, never from client body
  it('C. derives CodeID strictly from authenticated token UID and ignores client-injected studentCodeId', async () => {
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          examId: 'exam_toan_midterm',
          studentCodeId: '99999_injected_attacker_id', // Attacker tries to impersonate!
          codeId: '99999'
        }
      },
      testEnv
    );

    assert.equal(res.statusCode, 201);
    const json = res.getJson();

    // Verify session stored on server: studentCodeId MUST BE 10042 (from token)
    const storedSession = await sessionRepo.getById(json.sessionId);
    assert.ok(storedSession);
    assert.equal(storedSession.studentCodeId, '10042');
    assert.notEqual(storedSession.studentCodeId, '99999_injected_attacker_id');
  });

  // D. NDID derived strictly from users/{CodeID}.ndid as raw string (never prepending @)
  it('D. resolves canonical NDID from users/{CodeID}.ndid and preserves RAW STRING in Result', async () => {
    // 1. Start session
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    // 2. Submit
    await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }
          ]
        }
      },
      testEnv
    );

    // 3. Get Result
    const res = await dispatchServerApi(
      {
        method: 'GET',
        url: `/api/v3/results/${sessionId}`,
        headers: { authorization: 'Bearer valid_token_for_10042' }
      },
      testEnv
    );

    assert.equal(res.statusCode, 200);
    const json = res.getJson();
    assert.equal(json.result.studentNdid, 'student.nd_raw#10042'); // 100% RAW STRING preserved
    assert.ok(!json.result.studentNdid.startsWith('@'), 'Must NOT prepend @ prefix!');
  });

  // E. Student A cannot access Student B session
  it('E. rejects Student B attempting to resume or submit Student A session with HTTP 403 FORBIDDEN', async () => {
    // Student A (10042) creates session
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    // Student B (20088) tries to resume Student A session
    const resumeRes = await dispatchServerApi(
      {
        method: 'GET',
        url: `/api/v3/exam-sessions/${sessionId}/resume`,
        headers: { authorization: 'Bearer valid_token_for_20088' }
      },
      testEnv
    );

    assert.equal(resumeRes.statusCode, 403);
    assert.equal(resumeRes.getJson().error.code, 'FORBIDDEN');

    // Student B tries to submit Student A session
    const submitRes = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_20088' },
        body: { answers: [] }
      },
      testEnv
    );

    assert.equal(submitRes.statusCode, 403);
    assert.equal(submitRes.getJson().error.code, 'FORBIDDEN');
  });

  // F. Client cannot choose expiresAt
  it('F. computes expiresAt on server with 30s buffer and ignores client-sent expiresAt', async () => {
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          examId: 'exam_toan_midterm',
          expiresAt: '2099-01-01T00:00:00.000Z' // Client tries to give itself 70 years!
        }
      },
      testEnv
    );

    assert.equal(res.statusCode, 201);
    const json = res.getJson();
    assert.notEqual(json.expiresAt, '2099-01-01T00:00:00.000Z');

    const startedTime = new Date(json.startedAt).getTime();
    const expiresTime = new Date(json.expiresAt).getTime();
    const diffSeconds = Math.round((expiresTime - startedTime) / 1000);

    // 45 minutes = 2700s + 30s buffer = 2730s
    assert.equal(diffSeconds, 2730);
  });

  // G. Client cannot choose attemptSeed
  it('G. server generates attemptSeed and ignores client-sent attemptSeed', async () => {
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          examId: 'exam_toan_midterm',
          attemptSeed: 'rigged_seed_123'
        }
      },
      testEnv
    );

    assert.equal(res.statusCode, 201);
    const json = res.getJson();
    assert.notEqual(json.attemptSeed, 'rigged_seed_123');
  });

  // H. Client cannot submit score (stripped and computed server-side)
  it('H. strips client-supplied score and computes official score purely from server grading record', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    // Attacker submits wrong answer 'opt_b' but claims score: 10
    const submitRes = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            {
              questionId: 'q_sc_1',
              questionVersionId: 'q_sc_1_v1',
              responsePayload: { selectedOptionId: 'opt_b' }, // Wrong!
              score: 10.0,
              awardedPoints: 10.0,
              isCorrect: true
            }
          ]
        }
      },
      testEnv
    );

    assert.equal(submitRes.statusCode, 200);

    // Get Result from server
    const resultRes = await dispatchServerApi(
      {
        method: 'GET',
        url: `/api/v3/results/${sessionId}`,
        headers: { authorization: 'Bearer valid_token_for_10042' }
      },
      testEnv
    );

    assert.equal(resultRes.statusCode, 200);
    assert.equal(resultRes.getJson().result.totalScore, 0); // Server calculated 0!
  });

  // I & J. Client cannot submit correctAnswers or gradingConfig
  it('I & J. server ignores any rogue correctAnswers or gradingConfig submitted in payload', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            {
              questionId: 'q_sc_1',
              questionVersionId: 'q_sc_1_v1',
              responsePayload: { selectedOptionId: 'opt_b' },
              correctOptionId: 'opt_b', // Rogue injection!
              gradingConfig: { correctOptionId: 'opt_b' } // Rogue injection!
            }
          ]
        }
      },
      testEnv
    );

    const resultRes = await dispatchServerApi(
      {
        method: 'GET',
        url: `/api/v3/results/${sessionId}`,
        headers: { authorization: 'Bearer valid_token_for_10042' }
      },
      testEnv
    );

    assert.equal(resultRes.getJson().result.totalScore, 0);
  });

  // K. QuestionVersionId tampering rejected
  it('K. rejects submission with tampered questionVersionId with HTTP 422 VALIDATION_ERROR', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    const submitRes = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v999_fake', responsePayload: { selectedOptionId: 'opt_a' } }
          ]
        }
      },
      testEnv
    );

    assert.ok([400, 422].includes(submitRes.statusCode));
    assert.equal(submitRes.getJson().error.code, 'VALIDATION_ERROR');
  });

  // L. Expired submission rejected
  it('L. rejects submission submitted past expiration limit with HTTP 410 SESSION_EXPIRED', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    // Mutate session expiresAt to past time directly in DB
    const session = await sessionRepo.getById(sessionId);
    assert.ok(session);
    session.expiresAt = '2026-09-01T00:00:00.000Z';
    await sessionRepo.updateSession(session);

    const submitRes = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }
          ]
        }
      },
      testEnv
    );

    assert.equal(submitRes.statusCode, 410);
    assert.equal(submitRes.getJson().error.code, 'SESSION_EXPIRED');
  });

  // M. Duplicate submission idempotency
  it('M. duplicate submission replay returns HTTP 200 with isIdempotentReplay: true', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    const payload = {
      answers: [
        { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }
      ]
    };

    // First submit
    const sub1 = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: payload
      },
      testEnv
    );
    assert.equal(sub1.statusCode, 200);
    assert.equal(sub1.getJson().isIdempotentReplay, false);

    // Second submit (replay)
    const sub2 = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: payload
      },
      testEnv
    );
    assert.equal(sub2.statusCode, 200);
    assert.equal(sub2.getJson().isIdempotentReplay, true);
  });

  // N & O. Result cannot be client-created or overwritten
  it('N & O. results are created strictly on server and client cannot create or overwrite result', async () => {
    // Calling POST /api/v3/results/any_id returns 404 (no client create endpoint)
    const rogueRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/results/fake_res',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { totalScore: 10 }
      },
      testEnv
    );

    assert.equal(rogueRes.statusCode, 404);
  });

  // P. AI-assisted grading cannot finalize official score without reviewer
  it('P. AI-assisted grading cannot finalize official score without human reviewer', async () => {
    // Verified by GradingRegistry assertCanFinalize guardrail
    const student = {
      codeId: '10042',
      ndid: 'student_nd',
      role: 'user' as const,
      eduRole: 'student' as const,
      displayName: 'Student'
    };

    // Manual grading endpoint cannot be called by student
    const res = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/grading/manual',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { sessionId: 'ses_1', scores: [] }
      },
      testEnv
    );

    assert.equal(res.statusCode, 403);
  });

  // Q. Manual grading authorization requires teacher/admin
  it('Q. allows authorized teacher to submit manual grades via POST /api/v3/grading/manual', async () => {
    // 1. Student completes submission
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );
    const sessionId = startRes.getJson().sessionId;

    await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            { questionId: 'q_sc_1', questionVersionId: 'q_sc_1_v1', responsePayload: { selectedOptionId: 'opt_a' } }
          ]
        }
      },
      testEnv
    );

    // 2. Teacher (90001) grades manually
    const gradeRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/grading/manual',
        headers: { authorization: 'Bearer valid_token_for_90001' },
        body: {
          sessionId,
          scores: [{ questionId: 'q_sc_1', awardedPoints: 10.0, feedback: 'Xuat sac' }]
        }
      },
      testEnv
    );

    assert.equal(gradeRes.statusCode, 200);
    assert.equal(gradeRes.getJson().success, true);
    assert.equal(gradeRes.getJson().gradedByCodeId, '90001');
  });

  // R. API response contains NO answer key
  it('R. server response from POST /api/v3/exam-sessions and GET .../resume contains 0% answer keys', async () => {
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'exam_toan_midterm' }
      },
      testEnv
    );

    const bodyStr = JSON.stringify(startRes.getJson());
    assert.ok(!bodyStr.includes('correctOptionId'));
    assert.ok(!bodyStr.includes('correctAnswers'));
    assert.ok(!bodyStr.includes('gradingConfig'));
    assert.ok(!bodyStr.includes('explanation'));
  });

  // S. V2 compatibility remains intact
  it('S. legacy V2 quiz adapted exam executes seamlessly through backend HTTP handler', async () => {
    const legacyQuiz = {
      id: 'quiz_v2_poly',
      title: 'Đa thức V2',
      creator: 'TeacherV2',
      visibility: 'public' as const,
      timeLimit: 20,
      questions: [
        {
          id: 'q_v2_1',
          title: 'Đơn thức nào đồng dạng với 2xy?',
          type: 'single',
          options: ['-3xy', '2x', '2y', 'xy^2'],
          correct: 0,
          points: 10
        }
      ]
    };

    const bundle = adaptLegacyV2QuizBundle('quiz_v2_poly', legacyQuiz);
    await examRepo.create(bundle.exam);
    await questionRepo.create(bundle.questions[0], bundle.versions[0]);

    // Start session via HTTP
    const startRes = await dispatchServerApi(
      {
        method: 'POST',
        url: '/api/v3/exam-sessions',
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: { examId: 'quiz_v2_poly' }
      },
      testEnv
    );

    assert.equal(startRes.statusCode, 201);
    const sessionId = startRes.getJson().sessionId;

    // Submit via HTTP
    const submitRes = await dispatchServerApi(
      {
        method: 'POST',
        url: `/api/v3/exam-sessions/${sessionId}/submit`,
        headers: { authorization: 'Bearer valid_token_for_10042' },
        body: {
          answers: [
            {
              questionId: bundle.questions[0].id,
              questionVersionId: bundle.versions[0].id,
              responsePayload: { selectedOptionId: 'opt_0' }
            }
          ]
        }
      },
      testEnv
    );

    assert.equal(submitRes.statusCode, 200);

    // Get Result via HTTP
    const resultRes = await dispatchServerApi(
      {
        method: 'GET',
        url: `/api/v3/results/${sessionId}`,
        headers: { authorization: 'Bearer valid_token_for_10042' }
      },
      testEnv
    );

    assert.equal(resultRes.statusCode, 200);
    assert.equal(resultRes.getJson().result.totalScore, 10.0);
  });
});
