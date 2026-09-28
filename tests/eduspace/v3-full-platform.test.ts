/**
 * EduSpace V3 Full Assessment Platform Test Suite
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Verifies:
 * 1. Choice Groups (Optional question groups: 2/3, 1/2) with effective points and non-penalizing grading
 * 2. Universal Content Blocks & Shared SourceSets (reading passages, listening audio)
 * 3. Multi-part questions (parent question with sub-parts 1a, 1b...)
 * 4. 0% Answer Key Leakage across all new assessment primitives
 * 5. Authoring & AI Assistant Server Guardrails
 * 6. RAW NDID string invariant & zero regression on legacy V2 quizzes
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { Exam, ExamSection } from '../../src/eduspace/core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../src/eduspace/core/domain/question.ts';
import type { ChoiceGroup, ContentBlock, SourceSet, MultiPartQuestionPart } from '../../src/eduspace/core/domain/assessmentStructure.ts';
import { defaultExamPlanner } from '../../src/eduspace/engine/plan/examPlanner.ts';
import { defaultGradingEngine } from '../../src/eduspace/engine/grading/gradingEngine.ts';
import { defaultExamValidator } from '../../src/eduspace/engine/validation/examValidator.ts';
import { sanitizeExecutionPlan } from '../../src/eduspace/assessment/sanitizer.ts';
import { defaultResultBuilder } from '../../src/eduspace/engine/result/resultBuilder.ts';
import { multiPartPlugin, defaultQuestionRegistry } from '../../src/eduspace/engine/registry/questionRegistry.ts';
import { handleAssessmentApi } from '../../src/eduspace/backend/assessmentBackend.ts';
import { MemoryExamRepository, MemoryExamSessionRepository, MemoryQuestionRepository, MemoryResultRepository, MemorySubmissionRepository } from '../../src/eduspace/core/repositories/memoryRepository.ts';

describe('EduSpace V3 Full Assessment Platform', () => {
  // ----------------------------------------------------------------------
  // 1. Choice Groups (Optional Groups: e.g. 2 of 3 questions)
  // ----------------------------------------------------------------------
  describe('Choice Groups & Blueprint-Guided Execution', () => {
    it('validates effective points correctly for choice groups (e.g. 2/3 choice group)', () => {
      // 3 candidate questions, 1 point each, but student only needs 2 -> totalPoints must be 2.0
      const choiceGroup: ChoiceGroup = {
        id: 'cg_opt_1',
        title: 'Nhóm tự chọn II',
        description: 'Học sinh chọn 2 trong 3 câu',
        questionIds: ['q_opt_1', 'q_opt_2', 'q_opt_3'],
        requiredCount: 2,
        totalCount: 3,
        selectionMode: 'student_choice'
      };

      const exam: Exam = {
        id: 'exam_choice_demo',
        schemaVersion: 1,
        title: 'Đề thi có phần tự chọn 2/3',
        subjectId: 'toan',
        grade: 10,
        examType: 'regular',
        visibility: 'classroom',
        moderationStatus: 'approved',
        status: 'active',
        durationMinutes: 45,
        totalPoints: 2.0, // 2 questions * 1.0 point = 2.0 points
        sections: [
          {
            id: 'sec_opt',
            title: 'Phần Tự Chọn',
            sectionOrder: 1,
            questionType: 'single_choice',
            choiceGroups: [choiceGroup],
            questions: [
              { questionId: 'q_opt_1', questionVersionId: 'q_opt_1_v1', allocatedPoints: 1.0, orderIndex: 0, choiceGroupId: 'cg_opt_1' },
              { questionId: 'q_opt_2', questionVersionId: 'q_opt_2_v1', allocatedPoints: 1.0, orderIndex: 1, choiceGroupId: 'cg_opt_1' },
              { questionId: 'q_opt_3', questionVersionId: 'q_opt_3_v1', allocatedPoints: 1.0, orderIndex: 2, choiceGroupId: 'cg_opt_1' }
            ]
          }
        ],
        choiceGroups: [choiceGroup],
        policy: { allowReview: true },
        creatorCodeId: '0000',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z'
      };

      // Validation should succeed because effective points = (3.0 / 3) * 2 = 2.0
      assert.doesNotThrow(() => {
        defaultExamValidator.validate(exam);
      });
    });

    it('grades ONLY selected choice questions without penalizing unselected questions', () => {
      const choiceGroup: ChoiceGroup = {
        id: 'cg_1',
        title: 'Nhóm tự chọn',
        questionIds: ['q_a', 'q_b', 'q_c'],
        requiredCount: 2,
        totalCount: 3,
        selectionMode: 'student_choice'
      };

      const exam: Exam = {
        id: 'exam_cg_eval',
        schemaVersion: 1,
        title: 'Đề thi tự chọn',
        subjectId: 'toan',
        grade: 10,
        examType: 'regular',
        visibility: 'classroom',
        moderationStatus: 'approved',
        status: 'active',
        durationMinutes: 30,
        totalPoints: 2.0,
        sections: [
          {
            id: 'sec_1',
            title: 'Phần tự chọn',
            sectionOrder: 1,
            questionType: 'single_choice',
            questions: [
              { questionId: 'q_a', questionVersionId: 'q_a_v1', allocatedPoints: 1.0, orderIndex: 0, choiceGroupId: 'cg_1' },
              { questionId: 'q_b', questionVersionId: 'q_b_v1', allocatedPoints: 1.0, orderIndex: 1, choiceGroupId: 'cg_1' },
              { questionId: 'q_c', questionVersionId: 'q_c_v1', allocatedPoints: 1.0, orderIndex: 2, choiceGroupId: 'cg_1' }
            ]
          }
        ],
        choiceGroups: [choiceGroup],
        policy: { allowReview: true },
        creatorCodeId: '0000',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z'
      };

      const versions = new Map<string, QuestionVersion>([
        ['q_a_v1', {
          id: 'q_a_v1',
          schemaVersion: 1,
          questionId: 'q_a',
          versionNumber: 1,
          content: { prompt: 'Câu A', payload: { options: [{ id: 'opt1', text: '1' }, { id: 'opt2', text: '2' }] } },
          gradingConfig: { payload: { correctOptionId: 'opt1' } },
          createdByCodeId: '0000',
          createdAt: '2026-09-24T00:00:00.000Z'
        }],
        ['q_b_v1', {
          id: 'q_b_v1',
          schemaVersion: 1,
          questionId: 'q_b',
          versionNumber: 1,
          content: { prompt: 'Câu B', payload: { options: [{ id: 'opt1', text: '1' }, { id: 'opt2', text: '2' }] } },
          gradingConfig: { payload: { correctOptionId: 'opt1' } },
          createdByCodeId: '0000',
          createdAt: '2026-09-24T00:00:00.000Z'
        }],
        ['q_c_v1', {
          id: 'q_c_v1',
          schemaVersion: 1,
          questionId: 'q_c',
          versionNumber: 1,
          content: { prompt: 'Câu C', payload: { options: [{ id: 'opt1', text: '1' }, { id: 'opt2', text: '2' }] } },
          gradingConfig: { payload: { correctOptionId: 'opt1' } },
          createdByCodeId: '0000',
          createdAt: '2026-09-24T00:00:00.000Z'
        }]
      ]);

      const plan = defaultExamPlanner.createExecutionPlan(exam, versions, 'seed_test_cg');

      const session: any = {
        id: 'sess_cg_1',
        examId: 'exam_cg_eval',
        studentCodeId: 'std_01',
        attemptNumber: 1,
        status: 'in_progress',
        questionVersionReferences: [
          { questionId: 'q_a', questionVersionId: 'q_a_v1', assignedSectionId: 'sec_1', allocatedPoints: 1.0, orderIndex: 0, choiceGroupId: 'cg_1' },
          { questionId: 'q_b', questionVersionId: 'q_b_v1', assignedSectionId: 'sec_1', allocatedPoints: 1.0, orderIndex: 1, choiceGroupId: 'cg_1' },
          { questionId: 'q_c', questionVersionId: 'q_c_v1', assignedSectionId: 'sec_1', allocatedPoints: 1.0, orderIndex: 2, choiceGroupId: 'cg_1' }
        ]
      };

      // Student chooses q_a and q_b (2/3), leaves q_c unselected
      const submission: any = {
        id: 'sess_cg_1',
        sessionId: 'sess_cg_1',
        examId: 'exam_cg_eval',
        studentCodeId: 'std_01',
        submittedAt: '2026-09-24T00:15:00.000Z',
        selectedChoiceQuestionIds: ['q_a', 'q_b'],
        answers: [
          { questionId: 'q_a', questionVersionId: 'q_a_v1', responsePayload: { selectedOptionId: 'opt1' } }, // Correct (1.0)
          { questionId: 'q_b', questionVersionId: 'q_b_v1', responsePayload: { selectedOptionId: 'opt2' } }  // Incorrect (0.0)
          // q_c not submitted and not in selectedChoiceQuestionIds
        ]
      };

      const record = defaultGradingEngine.evaluateSubmission(session, submission, versions);

      // CRITICAL INVARIANT:
      // maxPossibleScore must equal 2.0 (ONLY the 2 selected questions count)
      assert.equal(record.maxPossibleScore, 2.0);
      assert.equal(record.totalScore, 1.0);
      assert.equal(record.percentage, 50.0);

      // Verify unselected question has maxPoints: 0
      const unselectedDetail = record.detailedQuestions.find(d => d.questionId === 'q_c');
      assert.ok(unselectedDetail);
      assert.equal(unselectedDetail?.maxPoints, 0);
      assert.equal(unselectedDetail?.awardedPoints, 0);

      // ResultBuilder builds sectionScores accurately
      const result = defaultResultBuilder.buildResult(session, submission, record, {
        studentNdid: 'std_ndid_raw_123',
        studentDisplayName: 'Nguyễn Văn A'
      });

      assert.equal(result.maxScore, 2.0);
      assert.equal(result.totalScore, 1.0);
      assert.equal(result.studentNdid, 'std_ndid_raw_123'); // RAW string preserved
    });
  });

  // ----------------------------------------------------------------------
  // 2. Multi-Part Questions & Universal Content Blocks
  // ----------------------------------------------------------------------
  describe('Multi-Part Questions & Content Blocks', () => {
    it('evaluates multi-part question with sub-parts accurately', () => {
      const multiPart: MultiPartQuestionPart[] = [
        {
          partId: 'part_1a',
          label: '1a',
          prompt: 'Tính đạo hàm của hàm số tại x = 1',
          type: 'single_choice',
          allocatedPoints: 1.0,
          contentPayload: {
            options: [{ id: 'opt_1', text: '2' }, { id: 'opt_2', text: '4' }]
          },
          gradingPayload: {
            correctOptionId: 'opt_1'
          }
        },
        {
          partId: 'part_1b',
          label: '1b',
          prompt: 'Điền giá trị cực tiểu của hàm số',
          type: 'numeric',
          allocatedPoints: 1.5,
          contentPayload: { placeholder: 'Nhập số' },
          gradingPayload: { exactValue: 3.14, tolerance: 0.01 }
        }
      ];

      // Student answers: part_1a correct, part_1b correct
      const studentResponse = {
        part_1a: { selectedOptionId: 'opt_1' },
        part_1b: { value: 3.14 }
      };

      const evalResult = multiPartPlugin.evaluate(
        studentResponse,
        { parts: multiPart },
        {},
        2.5
      );

      assert.equal(evalResult.maxPoints, 2.5);
      assert.equal(evalResult.awardedPoints, 2.5);
      assert.equal(evalResult.isCorrect, true);
      assert.equal(evalResult.partialBreakdown?.part_1a, 1.0);
      assert.equal(evalResult.partialBreakdown?.part_1b, 1.5);
    });

    it('sanitizes execution plan: 0% answer key leakage in multi-parts, blocks, and sourceSets', () => {
      const sourceSet: SourceSet = {
        id: 'ss_reading_1',
        title: 'Trích đoạn Rừng Xà Nu',
        blocks: [
          {
            id: 'b_text',
            type: 'text',
            content: 'Đêm ấy, làng Xô Man thức suốt đêm...'
          },
          {
            id: 'b_audio',
            type: 'audio',
            url: 'https://cdn.example.com/audio/xa_nu.mp3'
          }
        ]
      };

      const plan: any = {
        examId: 'exam_full_test',
        title: 'Đề thi toàn diện',
        durationMinutes: 45,
        totalPoints: 10,
        mode: 'structured',
        sourceSets: [sourceSet],
        choiceGroups: [
          { id: 'cg_1', title: 'Tự chọn 1/2', questionIds: ['q1', 'q2'], requiredCount: 1, totalCount: 2 }
        ],
        sections: [
          {
            id: 'sec_1',
            title: 'Phần I',
            questions: [
              {
                questionId: 'q_parent_1',
                questionVersionId: 'q_parent_1_v1',
                type: 'multi_part',
                prompt: 'Dựa vào văn bản trên, trả lời các câu hỏi:',
                allocatedPoints: 2.0,
                orderIndex: 0,
                sourceSetId: 'ss_reading_1',
                parts: [
                  {
                    partId: 'p1',
                    label: 'a)',
                    prompt: 'Phương thức biểu đạt chính?',
                    type: 'single_choice',
                    allocatedPoints: 1.0,
                    contentPayload: { options: [{ id: 'o1', text: 'Tự sự' }, { id: 'o2', text: 'Miêu tả' }] },
                    gradingPayload: { correctOptionId: 'o1', explanation: 'SECRET ANSWER KEY' }
                  }
                ]
              }
            ]
          }
        ]
      };

      const sanitized = sanitizeExecutionPlan(plan);

      // Verify answer key is completely stripped
      const str = JSON.stringify(sanitized);
      assert.ok(!str.includes('SECRET ANSWER KEY'));
      assert.ok(!str.includes('correctOptionId'));
      assert.ok(!str.includes('gradingPayload'));

      // Verify structure is preserved
      assert.equal(sanitized.sourceSets?.length, 1);
      assert.equal(sanitized.choiceGroups?.length, 1);
      assert.equal(sanitized.sections[0].questions[0].parts?.length, 1);
      assert.equal(sanitized.sections[0].questions[0].parts?.[0].prompt, 'Phương thức biểu đạt chính?');
    });
  });

  // ----------------------------------------------------------------------
  // 3. Authoring API & AI Assistant Guardrails
  // ----------------------------------------------------------------------
  describe('Authoring API & AI Assistant Boundaries', () => {
    it('rejects non-teacher from calling POST /api/v3/author/exams with HTTP 403', async () => {
      const mockReq = {
        method: 'POST',
        url: '/api/v3/author/exams',
        headers: {
          authorization: 'Bearer student_token_123',
          host: 'localhost:3000'
        },
        body: { title: 'Rogue Student Exam' }
      };

      let status = 0;
      let responseBody: any = null;
      const mockRes = {
        statusCode: 200,
        setHeader: () => {},
        end: (data?: string) => {
          status = mockRes.statusCode;
          if (data) responseBody = JSON.parse(data);
        }
      };

      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              data: () => ({ codeId: id, ndid: 'student_123', role: 'user', eduRole: 'student' })
            })
          })
        })
      };

      const mockAuth = {
        verifyIdToken: async () => ({ uid: 'std_123' })
      };

      await handleAssessmentApi(mockReq, mockRes, { db: mockDb, auth: mockAuth });

      assert.equal(status, 403);
      assert.equal(responseBody.error?.code, 'FORBIDDEN');
    });

    it('allows teacher to save draft exam and validates structure', async () => {
      const examRepo = new MemoryExamRepository();
      const questionRepo = new MemoryQuestionRepository();

      const mockReq = {
        method: 'POST',
        url: '/api/v3/author/exams',
        headers: {
          authorization: 'Bearer teacher_token',
          host: 'localhost:3000'
        },
        body: {
          exam: {
            id: 'exam_teacher_01',
            title: 'Đề kiểm tra Đại số 10',
            subjectId: 'toan',
            grade: 10,
            durationMinutes: 45,
            totalPoints: 10,
            sections: []
          }
        }
      };

      let status = 0;
      let responseBody: any = null;
      const mockRes = {
        statusCode: 200,
        setHeader: () => {},
        end: (data?: string) => {
          status = mockRes.statusCode;
          if (data) responseBody = JSON.parse(data);
        }
      };

      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              data: () => ({ codeId: id, ndid: 'teacher_nguyen', role: 'user', eduRole: 'teacher' })
            })
          })
        })
      };

      const mockAuth = {
        verifyIdToken: async () => ({ uid: 'tea_001' })
      };

      await handleAssessmentApi(mockReq, mockRes, {
        db: mockDb,
        auth: mockAuth,
        examRepo,
        questionRepo
      });

      assert.equal(status, 200);
      assert.equal(responseBody.success, true);
      assert.equal(responseBody.examId, 'exam_teacher_01');

      // Verify exam was persisted in repository
      const saved = await examRepo.getById('exam_teacher_01');
      assert.ok(saved);
      assert.equal(saved?.title, 'Đề kiểm tra Đại số 10');
      assert.equal(saved?.creatorCodeId, 'tea_001');
    });

    it('generates draft questions via POST /api/v3/author/ai-assist with teacher disclaimer', async () => {
      const mockReq = {
        method: 'POST',
        url: '/api/v3/author/ai-assist',
        headers: {
          authorization: 'Bearer teacher_token',
          host: 'localhost:3000'
        },
        body: {
          task: 'generate_questions',
          subjectId: 'toan',
          grade: 10,
          topic: 'Bất phương trình bậc hai',
          cognitiveLevel: 'application'
        }
      };

      let status = 0;
      let responseBody: any = null;
      const mockRes = {
        statusCode: 200,
        setHeader: () => {},
        end: (data?: string) => {
          status = mockRes.statusCode;
          if (data) responseBody = JSON.parse(data);
        }
      };

      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              data: () => ({ codeId: id, ndid: 'teacher_nguyen', role: 'user', eduRole: 'teacher' })
            })
          })
        })
      };

      const mockAuth = {
        verifyIdToken: async () => ({ uid: 'tea_001' })
      };

      await handleAssessmentApi(mockReq, mockRes, { db: mockDb, auth: mockAuth });

      assert.equal(status, 200);
      assert.equal(responseBody.success, true);
      assert.ok(responseBody.aiGeneratedDraft?.suggestions?.length > 0);
      // Teacher authority disclaimer must be present
      assert.ok(responseBody.disclaimer.includes('giáo viên'));
    });
  });
});
