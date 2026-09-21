/**
 * EduSpace V3 - Repository Layer Interfaces
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Defines strongly typed repository contracts to isolate business logic and UI
 * from direct database/Firestore access.
 */

import type { CognitiveLevel, ExamType, ExamVisibility, ModerationStatus, QuestionType } from '../constants/index.ts';
import type { Subject } from '../domain/curriculum.ts';
import type { Question, QuestionBank, QuestionVersion } from '../domain/question.ts';
import type { Exam, ExamBlueprint } from '../domain/exam.ts';
import type { ExamSession, GradingRecord, Result, SessionSecurityContext, Submission } from '../domain/session.ts';
import type { Assignment, Classroom, ClassroomMember } from '../domain/classroom.ts';

// ----------------------------------------------------------------------
// Filter Types
// ----------------------------------------------------------------------

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface QuestionFilter extends PaginationOptions {
  subjectId?: string;
  grade?: number;
  type?: QuestionType;
  cognitiveLevel?: CognitiveLevel;
  authorCodeId?: string;
  questionBankId?: string;
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
}

export interface BlueprintFilter extends PaginationOptions {
  subjectId?: string;
  grade?: number;
  creatorCodeId?: string;
  status?: 'active' | 'archived';
}

export interface ExamFilter extends PaginationOptions {
  subjectId?: string;
  grade?: number;
  examType?: ExamType;
  visibility?: ExamVisibility;
  moderationStatus?: ModerationStatus;
  creatorCodeId?: string;
  status?: 'active' | 'archived';
  classroomId?: string;
}

export interface ResultFilter extends PaginationOptions {
  studentCodeId?: string;
  examId?: string;
  classroomId?: string;
}

// ----------------------------------------------------------------------
// Repository Contracts
// ----------------------------------------------------------------------

export interface SubjectRepository {
  getById(id: string): Promise<Subject | null>;
  list(): Promise<Subject[]>;
  create(subject: Subject): Promise<void>;
  update(id: string, updates: Partial<Subject>): Promise<void>;
}

export interface QuestionRepository {
  getById(id: string): Promise<Question | null>;
  getVersion(questionId: string, versionId: string): Promise<QuestionVersion | null>;
  list(filter?: QuestionFilter): Promise<Question[]>;
  create(question: Question, initialVersion: QuestionVersion): Promise<void>;
  addVersion(questionId: string, version: QuestionVersion): Promise<void>;
  archive(id: string): Promise<void>;
}

export interface QuestionBankRepository {
  getById(id: string): Promise<QuestionBank | null>;
  listByOwner(ownerCodeId: string): Promise<QuestionBank[]>;
  create(bank: QuestionBank): Promise<void>;
  update(id: string, updates: Partial<QuestionBank>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ExamBlueprintRepository {
  getById(id: string): Promise<ExamBlueprint | null>;
  list(filter?: BlueprintFilter): Promise<ExamBlueprint[]>;
  create(blueprint: ExamBlueprint): Promise<void>;
  update(id: string, updates: Partial<ExamBlueprint>): Promise<void>;
}

export interface ExamRepository {
  getById(id: string): Promise<Exam | null>;
  list(filter?: ExamFilter): Promise<Exam[]>;
  create(exam: Exam): Promise<void>;
  update(id: string, updates: Partial<Exam>): Promise<void>;
  publish(id: string): Promise<void>;
  archive(id: string): Promise<void>;
}

export interface ExamSessionRepository {
  getById(sessionId: string): Promise<ExamSession | null>;
  createSession(session: ExamSession): Promise<void>;
  updateSession(session: ExamSession): Promise<void>;
  updateSecurityContext(sessionId: string, context: Partial<SessionSecurityContext>): Promise<void>;
  start(sessionId: string): Promise<void>;
  finish(sessionId: string): Promise<void>;
}

export interface SubmissionRepository {
  getById(submissionId: string): Promise<Submission | null>;
  getBySessionId(sessionId: string): Promise<Submission | null>;
  createSubmission(submission: Submission): Promise<void>;
  getGradingRecord(submissionId: string): Promise<GradingRecord | null>;
  saveGradingRecord(record: GradingRecord): Promise<void>;
}

export interface ResultRepository {
  getById(resultId: string): Promise<Result | null>;
  getBySessionId(sessionId: string): Promise<Result | null>;
  listByStudent(studentCodeId: string, filter?: ResultFilter): Promise<Result[]>;
  listByExam(examId: string, filter?: ResultFilter): Promise<Result[]>;
  createResult(result: Result): Promise<void>;
}

export interface ClassroomRepository {
  getById(classroomId: string): Promise<Classroom | null>;
  listByTeacher(teacherCodeId: string): Promise<Classroom[]>;
  listByStudent(studentCodeId: string): Promise<Classroom[]>;
  create(classroom: Classroom): Promise<void>;
  update(classroomId: string, updates: Partial<Classroom>): Promise<void>;
  getMembers(classroomId: string): Promise<ClassroomMember[]>;
  addMember(member: ClassroomMember): Promise<void>;
  removeMember(classroomId: string, studentCodeId: string): Promise<void>;
}

export interface AssignmentRepository {
  getById(assignmentId: string): Promise<Assignment | null>;
  listByClassroom(classroomId: string): Promise<Assignment[]>;
  listByStudent(studentCodeId: string): Promise<Assignment[]>;
  create(assignment: Assignment): Promise<void>;
  update(assignmentId: string, updates: Partial<Assignment>): Promise<void>;
}
