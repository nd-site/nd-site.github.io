/**
 * EduSpace V3 - Firestore Repository Implementations
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Provides server-authoritative Firestore database access for EduSpace V3 entities:
 * - exams
 * - questions & question versions
 * - exam_sessions
 * - submissions
 * - grading_records
 * - results
 */

import type { Exam } from '../domain/exam.ts';
import type { Question, QuestionVersion } from '../domain/question.ts';
import type { ExamSession, GradingRecord, Result, SessionSecurityContext, Submission } from '../domain/session.ts';
import type {
  ExamFilter,
  ExamRepository,
  ExamSessionRepository,
  QuestionFilter,
  QuestionRepository,
  ResultFilter,
  ResultRepository,
  SubmissionRepository
} from './interfaces.ts';

// Minimal generic Firestore interface matching Firebase Admin SDK
export interface FirestoreDatabase {
  collection(name: string): any;
}

export class FirestoreExamRepository implements ExamRepository {
  constructor(private readonly db: FirestoreDatabase) {}

  async getById(id: string): Promise<Exam | null> {
    const snap = await this.db.collection('exams').doc(id).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as Exam;
  }

  async list(filter?: ExamFilter): Promise<Exam[]> {
    let q = this.db.collection('exams');
    if (filter?.subjectId) q = q.where('subjectId', '==', filter.subjectId);
    if (filter?.grade !== undefined) q = q.where('grade', '==', filter.grade);
    if (filter?.status) q = q.where('status', '==', filter.status);
    if (filter?.visibility) q = q.where('visibility', '==', filter.visibility);
    if (filter?.limit) q = q.limit(filter.limit);

    const snap = await q.get();
    const results: Exam[] = [];
    snap.forEach((doc: any) => results.push(doc.data() as Exam));
    return results;
  }

  async create(exam: Exam): Promise<void> {
    await this.db.collection('exams').doc(exam.id).set(exam);
  }

  async update(id: string, updates: Partial<Exam>): Promise<void> {
    await this.db.collection('exams').doc(id).set(
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }

  async publish(id: string): Promise<void> {
    await this.update(id, {
      moderationStatus: 'approved',
      status: 'active'
    });
  }

  async archive(id: string): Promise<void> {
    await this.update(id, {
      status: 'archived'
    });
  }
}

export class FirestoreQuestionRepository implements QuestionRepository {
  constructor(private readonly db: FirestoreDatabase) {}

  async getById(id: string): Promise<Question | null> {
    const snap = await this.db.collection('questions').doc(id).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as Question;
  }

  async getVersion(questionId: string, versionId: string): Promise<QuestionVersion | null> {
    // Check nested subcollection first: questions/{id}/versions/{vId}
    const subSnap = await this.db.collection('questions').doc(questionId).collection('versions').doc(versionId).get();
    if (subSnap && subSnap.exists) {
      return subSnap.data() as QuestionVersion;
    }
    // Fallback check top-level question_versions collection
    const topSnap = await this.db.collection('question_versions').doc(versionId).get();
    if (topSnap && topSnap.exists) {
      return topSnap.data() as QuestionVersion;
    }
    return null;
  }

  async list(filter?: QuestionFilter): Promise<Question[]> {
    let q = this.db.collection('questions');
    if (filter?.subjectId) q = q.where('subjectId', '==', filter.subjectId);
    if (filter?.grade !== undefined) q = q.where('grade', '==', filter.grade);
    if (filter?.type) q = q.where('type', '==', filter.type);
    if (filter?.limit) q = q.limit(filter.limit);

    const snap = await q.get();
    const results: Question[] = [];
    snap.forEach((doc: any) => results.push(doc.data() as Question));
    return results;
  }

  async create(question: Question, initialVersion: QuestionVersion): Promise<void> {
    await this.db.collection('questions').doc(question.id).set(question);
    await this.db.collection('questions').doc(question.id).collection('versions').doc(initialVersion.id).set(initialVersion);
    await this.db.collection('question_versions').doc(initialVersion.id).set(initialVersion);
  }

  async addVersion(questionId: string, version: QuestionVersion): Promise<void> {
    await this.db.collection('questions').doc(questionId).collection('versions').doc(version.id).set(version);
    await this.db.collection('question_versions').doc(version.id).set(version);
    await this.db.collection('questions').doc(questionId).update({
      currentVersionId: version.id,
      currentVersionNumber: version.versionNumber,
      updatedAt: version.createdAt
    });
  }

  async archive(id: string): Promise<void> {
    await this.db.collection('questions').doc(id).update({
      status: 'archived',
      updatedAt: new Date().toISOString()
    });
  }
}

export class FirestoreExamSessionRepository implements ExamSessionRepository {
  constructor(private readonly db: FirestoreDatabase) {}

  async getById(sessionId: string): Promise<ExamSession | null> {
    const snap = await this.db.collection('exam_sessions').doc(sessionId).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as ExamSession;
  }

  async createSession(session: ExamSession): Promise<void> {
    await this.db.collection('exam_sessions').doc(session.id).set(session);
  }

  async updateSession(session: ExamSession): Promise<void> {
    await this.db.collection('exam_sessions').doc(session.id).set(session, { merge: true });
  }

  async updateSecurityContext(sessionId: string, context: Partial<SessionSecurityContext>): Promise<void> {
    const snap = await this.db.collection('exam_sessions').doc(sessionId).get();
    if (!snap || !snap.exists) return;
    const current = snap.data() as ExamSession;
    await this.db.collection('exam_sessions').doc(sessionId).update({
      securityContext: { ...current.securityContext, ...context },
      updatedAt: new Date().toISOString()
    });
  }

  async start(sessionId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.collection('exam_sessions').doc(sessionId).update({
      status: 'in_progress',
      startedAt: now,
      updatedAt: now
    });
  }

  async finish(sessionId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.collection('exam_sessions').doc(sessionId).update({
      status: 'submitted',
      submittedAt: now,
      updatedAt: now
    });
  }
}

export class FirestoreSubmissionRepository implements SubmissionRepository {
  constructor(private readonly db: FirestoreDatabase) {}

  async getById(submissionId: string): Promise<Submission | null> {
    const snap = await this.db.collection('submissions').doc(submissionId).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as Submission;
  }

  async getBySessionId(sessionId: string): Promise<Submission | null> {
    // Fast path: submission.id === sessionId by canonical invariant
    const direct = await this.getById(sessionId);
    if (direct) return direct;

    const snap = await this.db.collection('submissions').where('sessionId', '==', sessionId).limit(1).get();
    if (!snap || snap.empty) return null;
    let found: Submission | null = null;
    snap.forEach((doc: any) => { found = doc.data() as Submission; });
    return found;
  }

  async createSubmission(submission: Submission): Promise<void> {
    await this.db.collection('submissions').doc(submission.id).set(submission);
  }

  async getGradingRecord(submissionId: string): Promise<GradingRecord | null> {
    const snap = await this.db.collection('grading_records').doc(submissionId).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as GradingRecord;
  }

  async saveGradingRecord(record: GradingRecord): Promise<void> {
    await this.db.collection('grading_records').doc(record.submissionId).set(record);
  }
}

export class FirestoreResultRepository implements ResultRepository {
  constructor(private readonly db: FirestoreDatabase) {}

  async getById(resultId: string): Promise<Result | null> {
    const snap = await this.db.collection('results').doc(resultId).get();
    if (!snap || !snap.exists) return null;
    return snap.data() as Result;
  }

  async getBySessionId(sessionId: string): Promise<Result | null> {
    // Fast path: results often keyed with res_${sessionId} or ${sessionId}
    const directRes = await this.getById(`res_${sessionId}`);
    if (directRes) return directRes;

    const direct = await this.getById(sessionId);
    if (direct) return direct;

    const snap = await this.db.collection('results').where('sessionId', '==', sessionId).limit(1).get();
    if (!snap || snap.empty) return null;
    let found: Result | null = null;
    snap.forEach((doc: any) => { found = doc.data() as Result; });
    return found;
  }

  async listByStudent(studentCodeId: string, filter?: ResultFilter): Promise<Result[]> {
    let q = this.db.collection('results').where('studentCodeId', '==', studentCodeId);
    if (filter?.examId) q = q.where('examId', '==', filter.examId);
    if (filter?.limit) q = q.limit(filter.limit);

    const snap = await q.get();
    const results: Result[] = [];
    snap.forEach((doc: any) => results.push(doc.data() as Result));
    return results;
  }

  async listByExam(examId: string, filter?: ResultFilter): Promise<Result[]> {
    let q = this.db.collection('results').where('examId', '==', examId);
    if (filter?.studentCodeId) q = q.where('studentCodeId', '==', filter.studentCodeId);
    if (filter?.limit) q = q.limit(filter.limit);

    const snap = await q.get();
    const results: Result[] = [];
    snap.forEach((doc: any) => results.push(doc.data() as Result));
    return results;
  }

  async createResult(result: Result): Promise<void> {
    await this.db.collection('results').doc(result.id).set(result);
  }
}
