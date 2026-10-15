import type { Exam } from '../core/domain/exam.ts';
import type { Question, QuestionVersion } from '../core/domain/question.ts';
import { FirestoreV2QuizRepository } from '../core/repositories/v2QuizRepository.ts';

export interface SharedQuizMigrationReport {
  scanned: number;
  migrated: number;
  alreadyInSharedBank: number;
  conflicts: string[];
  failed: Array<{ examId: string; reason: string }>;
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Copies pre-shared-bank V3 exam definitions into quizzes/{examId}, embedding
 * the exact question versions referenced by each exam. Source documents stay
 * intact for rollback; runtime reads prefer the shared quiz record.
 */
export async function migrateLegacyV3ExamsToSharedQuizzes(
  db: any,
  { cursor, pageSize = 5 }: { cursor?: string; pageSize?: number } = {}
): Promise<SharedQuizMigrationReport> {
  const report: SharedQuizMigrationReport = {
    scanned: 0,
    migrated: 0,
    alreadyInSharedBank: 0,
    conflicts: [],
    failed: [],
    nextCursor: null,
    hasMore: false
  };
  const sharedQuizRepo = new FirestoreV2QuizRepository(db);
  let examQuery = db.collection('exams').orderBy('__name__').limit(Math.max(1, Math.min(pageSize, 10)));
  if (cursor) examQuery = examQuery.startAfter(cursor);
  const examSnapshot = await examQuery.get();
  const exams: Array<{ id: string; data: Exam }> = [];
  examSnapshot.forEach((doc: any) => exams.push({ id: doc.id, data: doc.data() as Exam }));
  report.scanned = exams.length;
  report.nextCursor = exams.length ? exams[exams.length - 1].id : null;
  report.hasMore = exams.length === Math.max(1, Math.min(pageSize, 10));

  for (const { id, data } of exams) {
    try {
      const examId = String(id);
      const quizRef = db.collection('quizzes').doc(examId);
      let existing = await quizRef.get();
      if (!existing?.exists && examId !== examId.toUpperCase()) {
        existing = await db.collection('quizzes').doc(examId.toUpperCase()).get();
      }
      if (existing?.exists) {
        if (existing.id === examId && existing.data()?.eduspaceV3) report.alreadyInSharedBank++;
        else report.conflicts.push(examId);
        continue;
      }

      const exam = { ...data, id: examId } as Exam;
      const questionIds = new Set<string>();
      for (const section of exam.sections || []) {
        for (const reference of section.questions || []) questionIds.add(reference.questionId);
      }

      const questionBundles = await Promise.all(Array.from(questionIds, async questionId => {
        const questionSnapshot = await db.collection('questions').doc(questionId).get();
        if (!questionSnapshot?.exists) throw new Error(`Missing question ${questionId}`);
        const question = questionSnapshot.data() as Question;
        const reference = (exam.sections || [])
          .flatMap(section => section.questions || [])
          .find(item => item.questionId === questionId);
        const versionId = reference?.questionVersionId || question.currentVersionId;

        let versionSnapshot = await db.collection('questions').doc(questionId).collection('versions').doc(versionId).get();
        if (!versionSnapshot?.exists) {
          versionSnapshot = await db.collection('question_versions').doc(versionId).get();
        }
        const version = versionSnapshot?.exists
          ? versionSnapshot.data() as QuestionVersion
          : question.activeVersion;
        if (!version) throw new Error(`Missing version ${versionId} for question ${questionId}`);
        return { question, version };
      }));

      await sharedQuizRepo.saveV3Bundle(exam, questionBundles);
      report.migrated++;
    } catch (error: any) {
      report.failed.push({ examId: id, reason: error?.message || 'Migration failed' });
    }
  }

  return report;
}
