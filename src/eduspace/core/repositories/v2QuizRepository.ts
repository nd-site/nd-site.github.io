/**
 * EduSpace V3 - Shared Quiz Repository
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Reads V2 and V3 quizzes from `quizzes/{quizId}` and writes native V3 exam
 * aggregates there. Legacy V2 quiz records are never modified by V3 writes.
 */

import type { V2QuizRawData } from '../normalizers/v2QuizAdapter.ts';
import type { Exam } from '../domain/exam.ts';
import type { Question, QuestionVersion } from '../domain/question.ts';
import type { FirestoreDatabase } from './firestoreRepository.ts';

export interface V3QuizQuestionBundle {
  question: Question;
  version: QuestionVersion;
}

export interface V2QuizReader {
  getQuizById(quizId: string): Promise<V2QuizRawData | null>;
  listQuizzes(limit?: number): Promise<Array<{ id: string; data: V2QuizRawData }>>;
  saveV3Bundle?(exam: Exam, questions: V3QuizQuestionBundle[]): Promise<void>;
}

export class FirestoreV2QuizRepository implements V2QuizReader {
  constructor(private readonly db: FirestoreDatabase) {}

  async getQuizById(quizId: string): Promise<V2QuizRawData | null> {
    if (!this.db) return null;
    try {
      let ref = this.db.collection('quizzes').doc(quizId);
      let snap = await ref.get();
      if ((!snap || !snap.exists) && quizId !== quizId.toUpperCase()) {
        ref = this.db.collection('quizzes').doc(quizId.toUpperCase());
        snap = await ref.get();
      }
      if (!snap || !snap.exists) return null;
      const data = snap.data() as V2QuizRawData;
      if (data.eduspaceV3?.exam) {
        const exam = data.eduspaceV3.exam as Exam;
        const questionIds = new Set<string>();
        for (const section of exam.sections || []) {
          for (const reference of section.questions || []) questionIds.add(reference.questionId);
        }
        const bundles = await Promise.all(Array.from(questionIds, async questionId => {
          const questionSnapshot = await ref.collection('questionBank').doc(questionId).get();
          if (!questionSnapshot?.exists) return [];
          const questionRecord = questionSnapshot.data() || {};
          const question = (questionRecord.question || questionRecord) as Question;
          const references = (exam.sections || []).flatMap(section => section.questions || []).filter(item => item.questionId === questionId);
          const versionIds = Array.from(new Set(references.map(item => item.questionVersionId || question.currentVersionId)));
          return Promise.all(versionIds.map(async versionId => {
            const versionSnapshot = await ref.collection('questionBank').doc(questionId).collection('versions').doc(versionId).get();
            return versionSnapshot?.exists ? { question, version: versionSnapshot.data() as QuestionVersion } : null;
          }));
        }));
        data.eduspaceV3.questions = bundles.flatMap(bundle => bundle.filter(Boolean));
      }
      return data;
    } catch {
      return null;
    }
  }

  async listQuizzes(limit = 50): Promise<Array<{ id: string; data: V2QuizRawData }>> {
    if (!this.db) return [];
    try {
      let q = this.db.collection('quizzes');
      if (limit > 0) {
        q = q.limit(limit);
      }
      const snap = await q.get();
      const results: Array<{ id: string; data: V2QuizRawData }> = [];
      snap.forEach((doc: any) => {
        results.push({
          id: doc.id,
          data: doc.data() as V2QuizRawData
        });
      });
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Stores a V3 exam and its current question versions in the shared quizzes
   * record. New exam definitions no longer create separate exams/questions/
   * question_versions documents.
   */
  async saveV3Bundle(exam: Exam, questions: V3QuizQuestionBundle[]): Promise<void> {
    if (!this.db) throw new Error('Firestore is not available');
    if (questions.length > 249) {
      throw new Error('Đề vượt quá giới hạn 249 câu hỏi cho một lần lưu an toàn.');
    }
    const ref = this.db.collection('quizzes').doc(exam.id);
    const existing = await ref.get();
    const existingData = existing?.exists ? existing.data() : null;
    if (existingData && !existingData.eduspaceV3) {
      throw new Error('Mã đề này đang thuộc đề V2. Hãy mở và chỉnh sửa đề bằng Edu Admin.');
    }
    if (exam.id !== exam.id.toUpperCase()) {
      const caseVariant = await this.db.collection('quizzes').doc(exam.id.toUpperCase()).get();
      if (caseVariant?.exists && caseVariant.id !== exam.id) {
        throw new Error(`Mã đề đã tồn tại dưới dạng ${caseVariant.id}; hãy dùng đúng cách viết hoa/thường của mã.`);
      }
    }

    const batch = (this.db as any).batch?.();
    const preparedVersions = await Promise.all(questions.map(async bundle => {
      const questionRef = ref.collection('questionBank').doc(bundle.question.id);
      const savedQuestion = await questionRef.get();
      const previous = savedQuestion?.exists ? savedQuestion.data() : null;
      const previousQuestion = previous?.question || previous;
      const versionNumber = Number(previousQuestion?.currentVersionNumber || 0) + 1;
      const versionId = `${bundle.question.id}_v${versionNumber}`;
      const question = {
        ...bundle.question,
        currentVersionId: versionId,
        currentVersionNumber: versionNumber,
        updatedAt: exam.updatedAt
      };
      const version = {
        ...bundle.version,
        id: versionId,
        questionId: bundle.question.id,
        versionNumber
      };
      if (batch) {
        batch.set(questionRef, { question, currentVersionId: versionId, currentVersionNumber: versionNumber });
        batch.set(questionRef.collection('versions').doc(versionId), version);
      } else {
        await questionRef.set({ question, currentVersionId: versionId, currentVersionNumber: versionNumber });
        await questionRef.collection('versions').doc(versionId).set(version);
      }
      return { questionId: bundle.question.id, versionId };
    }));
    const questionVersionIds = new Map(preparedVersions.map(({ questionId, versionId }) => [questionId, versionId]));

    const examWithPinnedVersions: Exam = {
      ...exam,
      sections: exam.sections.map(section => ({
        ...section,
        questions: section.questions.map(reference => ({
          ...reference,
          questionVersionId: questionVersionIds.get(reference.questionId) || reference.questionVersionId
        }))
      }))
    };

    const quizRecord = {
      id: exam.id,
      schemaVersion: 1,
      format: 'eduspace-v3',
      title: exam.title,
      description: exam.description || '',
      subject: exam.subjectId,
      grade: exam.grade,
      duration: exam.durationMinutes,
      visibility: exam.visibility,
      targetClassrooms: exam.targetClassroomIds || [],
      creatorUid: exam.creatorCodeId,
      status: exam.status,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      eduspaceV3: {
        schemaVersion: 1,
        exam: examWithPinnedVersions
      }
    };
    if (batch) {
      batch.set(ref, quizRecord);
      await batch.commit();
    } else {
      await ref.set(quizRecord);
    }
  }
}
