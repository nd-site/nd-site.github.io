/**
 * EduSpace V3 - Beta V2 Compatibility Test Suite
 * Validates that legacy V2 quizzes can be executed in EduSpace V3 without database duplication
 * and with strict session isolation.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ExamSessionService,
  type UserSecurityContext
} from '../../src/eduspace/assessment/index.ts';

import {
  MemoryExamRepository,
  MemoryExamSessionRepository,
  MemoryQuestionRepository,
  MemoryResultRepository,
  MemorySubmissionRepository
} from '../../src/eduspace/core/repositories/memoryRepository.ts';

import {
  V2CompatibleExamRepository,
  V2CompatibleQuestionRepository,
  V2QuizBundleCache,
  type V2QuizReader
} from '../../src/eduspace/core/repositories/v2CompatibleRepository.ts';

import type { V2QuizRawData } from '../../src/eduspace/core/normalizers/v2QuizAdapter.ts';

// Mock V2 quiz matching A111 structure from production Firestore
const sampleA111Quiz: V2QuizRawData = {
  title: 'Đề kiểm tra Tin học 11 - Giữa kỳ 1 (A111)',
  description: 'Đề thi trắc nghiệm và đúng sai Tin học lớp 11',
  subject: 'Tin học',
  grade: '11',
  duration: 45,
  visibility: 'public',
  creatorUid: '0000',
  quizData: {
    title: 'Đề kiểm tra Tin học 11 - Giữa kỳ 1 (A111)',
    examInfo: {
      examName: 'Đề Tin học 11 giữa kỳ',
      grade: '11',
      subject: 'Tin học',
      author: 'Thầy ND'
    },
    questions: [
      {
        type: 'multiple',
        question: 'Thiết bị nào sau đây là thiết bị vào của máy tính?',
        options: ['Bàn phím', 'Màn hình', 'Máy in', 'Loa'],
        correct: 0,
        points: 0.25,
        explanation: 'Bàn phím dùng để nhập dữ liệu vào máy tính.'
      },
      {
        type: 'multiple',
        question: 'Bộ xử lý trung tâm của máy tính là gì?',
        options: ['RAM', 'ROM', 'CPU', 'GPU'],
        correct: 2,
        points: 0.25,
        explanation: 'CPU là Central Processing Unit.'
      },
      {
        type: 'truefalse',
        question: 'Xét tính đúng/sai của các phát biểu về mạng máy tính:',
        options: [
          'LAN là mạng cục bộ',
          'WAN là mạng diện rộng',
          'Internet là sở hữu của một quốc gia',
          'Switch là thiết bị mạng'
        ],
        correct: [true, true, false, true],
        points: 1.0,
        explanation: 'Internet không thuộc sở hữu độc quyền của bất kỳ quốc gia nào.'
      },
      {
        type: 'short',
        question: 'Có bao nhiêu bit trong 1 byte? (Chỉ điền số)',
        correct: '8',
        points: 0.5,
        explanation: '1 byte = 8 bit.'
      }
    ]
  }
};

class MockV2QuizReader implements V2QuizReader {
  private readonly store = new Map<string, V2QuizRawData>();

  constructor(initial: Record<string, V2QuizRawData> = {}) {
    for (const [k, v] of Object.entries(initial)) {
      this.store.set(k, v);
    }
  }

  async getQuizById(quizId: string): Promise<V2QuizRawData | null> {
    return this.store.get(quizId) || null;
  }

  async listQuizzes(limit = 50): Promise<Array<{ id: string; data: V2QuizRawData }>> {
    return Array.from(this.store.entries()).slice(0, limit).map(([id, data]) => ({ id, data }));
  }
}

describe('EduSpace V3 - V2 Shared Database Compatibility & Execution', () => {
  const studentUser: UserSecurityContext = {
    codeId: '10042',
    ndid: 'student_beta_user', // RAW STRING invariant
    role: 'user',
    eduRole: 'student',
    displayName: 'Nguyễn Văn Beta'
  };

  it('A. V2CompatibleExamRepository resolves legacy quiz on-the-fly without duplication', async () => {
    const memoryExamRepo = new MemoryExamRepository();
    const v2Reader = new MockV2QuizReader({ A111: sampleA111Quiz });
    const cache = new V2QuizBundleCache();
    const examRepo = new V2CompatibleExamRepository(memoryExamRepo, v2Reader, cache);

    const exam = await examRepo.getById('A111');
    assert.ok(exam, 'Exam should be adapted from V2 quiz');
    assert.strictEqual(exam.id, 'A111');
    assert.strictEqual(exam.grade, 11);
    assert.strictEqual(exam.durationMinutes, 45);
    assert.strictEqual(exam.sections.length >= 2, true);
  });

  it('B. Full session lifecycle: start, resume, autosave, submit, and score on legacy quiz', async () => {
    const memoryExamRepo = new MemoryExamRepository();
    const memoryQuestionRepo = new MemoryQuestionRepository();
    const memorySessionRepo = new MemoryExamSessionRepository();
    const memorySubmissionRepo = new MemorySubmissionRepository();
    const memoryResultRepo = new MemoryResultRepository();

    const v2Reader = new MockV2QuizReader({ A111: sampleA111Quiz });
    const cache = new V2QuizBundleCache();

    const examRepo = new V2CompatibleExamRepository(memoryExamRepo, v2Reader, cache);
    const questionRepo = new V2CompatibleQuestionRepository(memoryQuestionRepo, v2Reader, cache);

    const service = new ExamSessionService({
      examRepo,
      questionRepo,
      sessionRepo: memorySessionRepo,
      submissionRepo: memorySubmissionRepo,
      resultRepo: memoryResultRepo
    });

    // 1. Start session
    const startTime = new Date('2026-09-21T10:00:00Z');
    const startRes = await service.startSession(studentUser, { examId: 'A111' }, startTime);

    assert.ok(startRes.sessionId, 'Session ID created');
    assert.strictEqual(startRes.exam.title, sampleA111Quiz.title);
    assert.strictEqual(startRes.exam.durationMinutes, 45);
    
    const allQuestions = startRes.exam.sections.flatMap(s => s.questions);
    assert.strictEqual(allQuestions.length, 4);

    const planQ1 = allQuestions[0];
    const planQ2 = allQuestions[1];
    const planQ3 = allQuestions[2];
    const planQ4 = allQuestions[3];

    // Ensure answers/correct keys are sanitized from client payload
    assert.strictEqual((planQ1 as any).correct, undefined);
    assert.strictEqual((planQ1 as any).explanation, undefined);

    // 2. Resume session
    const resumeRes = await service.resumeSession(studentUser, startRes.sessionId, new Date('2026-09-21T10:05:00Z'));
    assert.strictEqual(resumeRes.sessionId, startRes.sessionId);
    assert.strictEqual(resumeRes.status, 'in_progress');

    // 3. Autosave
    const autosaveRes = await service.autosave(studentUser, startRes.sessionId, {
      answersPayload: {
        [planQ1.questionId]: { selectedOptionId: 'opt_0' }
      }
    }, new Date('2026-09-21T10:10:00Z'));
    assert.strictEqual(autosaveRes.savedAnswersCount, 1);

    // 4. Submit session with answers:
    // Q1: correct ('opt_0') -> +0.25
    // Q2: correct ('opt_2') -> +0.25
    // Q3: true_false [true, true, false, true] (4/4 correct GDPT rule -> 1.0)
    // Q4: numeric 8 -> +0.5
    // Total expected = 2.0 / 2.0 (100%)
    const submitTime = new Date('2026-09-21T10:25:00Z');
    const submitRes = await service.submit(studentUser, startRes.sessionId, {
      answers: [
        { questionId: planQ1.questionId, questionVersionId: planQ1.questionVersionId, responsePayload: { selectedOptionId: 'opt_0' } },
        { questionId: planQ2.questionId, questionVersionId: planQ2.questionVersionId, responsePayload: { selectedOptionId: 'opt_2' } },
        {
          questionId: planQ3.questionId,
          questionVersionId: planQ3.questionVersionId,
          responsePayload: {
            answers: {
              item_0: true,
              item_1: true,
              item_2: false,
              item_3: true
            }
          }
        },
        { questionId: planQ4.questionId, questionVersionId: planQ4.questionVersionId, responsePayload: { value: 8 } }
      ]
    }, submitTime);

    assert.ok(submitRes.resultId, 'Result ID generated');
    assert.strictEqual(submitRes.status, 'graded');

    // 5. Verify official Result record
    const resultRecord = await service.getResult(studentUser, submitRes.resultId!);
    assert.strictEqual(resultRecord.studentCodeId, '10042');
    assert.strictEqual(resultRecord.examId, 'A111');
    assert.strictEqual(resultRecord.totalScore, 2.0);
    assert.strictEqual(resultRecord.maxScore, 2.0);
    assert.strictEqual(resultRecord.status, 'final');
  });
});
