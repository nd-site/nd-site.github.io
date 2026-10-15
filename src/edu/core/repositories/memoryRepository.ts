/**
 * EduSpace V3 - In-Memory Repository Implementations
 * For unit testing, offline preview, and boundary isolation.
 */

import type {
  AssignmentRepository,
  BlueprintFilter,
  ClassroomRepository,
  ExamBlueprintRepository,
  ExamFilter,
  ExamRepository,
  ExamSessionRepository,
  QuestionBankRepository,
  QuestionFilter,
  QuestionRepository,
  ResultFilter,
  ResultRepository,
  SubjectRepository,
  SubmissionRepository
} from './interfaces.ts';
import type { Subject } from '../domain/curriculum.ts';
import type { Question, QuestionBank, QuestionVersion } from '../domain/question.ts';
import type { Exam, ExamBlueprint } from '../domain/exam.ts';
import type { ExamSession, GradingRecord, Result, SessionSecurityContext, Submission } from '../domain/session.ts';
import type { Assignment, Classroom, ClassroomMember } from '../domain/classroom.ts';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class MemorySubjectRepository implements SubjectRepository {
  private items = new Map<string, Subject>();

  async getById(id: string): Promise<Subject | null> {
    const item = this.items.get(id);
    return item ? deepClone(item) : null;
  }

  async list(): Promise<Subject[]> {
    return Array.from(this.items.values()).map(deepClone);
  }

  async create(subject: Subject): Promise<void> {
    this.items.set(subject.id, deepClone(subject));
  }

  async update(id: string, updates: Partial<Subject>): Promise<void> {
    const item = this.items.get(id);
    if (!item) return;
    this.items.set(id, { ...item, ...deepClone(updates) });
  }

  clear(): void {
    this.items.clear();
  }
}

export class MemoryQuestionRepository implements QuestionRepository {
  private questions = new Map<string, Question>();
  private versions = new Map<string, Map<string, QuestionVersion>>();

  async getById(id: string): Promise<Question | null> {
    const q = this.questions.get(id);
    return q ? deepClone(q) : null;
  }

  async getVersion(questionId: string, versionId: string): Promise<QuestionVersion | null> {
    const qVersions = this.versions.get(questionId);
    if (!qVersions) return null;
    const v = qVersions.get(versionId);
    return v ? deepClone(v) : null;
  }

  async list(filter?: QuestionFilter): Promise<Question[]> {
    let result = Array.from(this.questions.values());

    if (filter) {
      if (filter.subjectId) result = result.filter(q => q.subjectId === filter.subjectId);
      if (filter.grade !== undefined) result = result.filter(q => q.grade === filter.grade);
      if (filter.type) result = result.filter(q => q.type === filter.type);
      if (filter.cognitiveLevel) result = result.filter(q => q.cognitiveLevel === filter.cognitiveLevel);
      if (filter.authorCodeId) result = result.filter(q => q.authorCodeId === filter.authorCodeId);
      if (filter.questionBankId) result = result.filter(q => q.questionBankId === filter.questionBankId);
      if (filter.status) result = result.filter(q => q.status === filter.status);

      if (filter.offset) result = result.slice(filter.offset);
      if (filter.limit) result = result.slice(0, filter.limit);
    }

    return result.map(deepClone);
  }

  async create(question: Question, initialVersion: QuestionVersion): Promise<void> {
    this.questions.set(question.id, deepClone(question));
    if (!this.versions.has(question.id)) {
      this.versions.set(question.id, new Map());
    }
    this.versions.get(question.id)!.set(initialVersion.id, deepClone(initialVersion));
  }

  async addVersion(questionId: string, version: QuestionVersion): Promise<void> {
    if (!this.versions.has(questionId)) {
      this.versions.set(questionId, new Map());
    }
    this.versions.get(questionId)!.set(version.id, deepClone(version));
    const q = this.questions.get(questionId);
    if (q) {
      q.currentVersionId = version.id;
      q.currentVersionNumber = version.versionNumber;
      q.updatedAt = version.createdAt;
    }
  }

  async archive(id: string): Promise<void> {
    const q = this.questions.get(id);
    if (q) {
      q.status = 'archived';
      q.updatedAt = new Date().toISOString();
    }
  }

  clear(): void {
    this.questions.clear();
    this.versions.clear();
  }
}

export class MemoryQuestionBankRepository implements QuestionBankRepository {
  private banks = new Map<string, QuestionBank>();

  async getById(id: string): Promise<QuestionBank | null> {
    const b = this.banks.get(id);
    return b ? deepClone(b) : null;
  }

  async listByOwner(ownerCodeId: string): Promise<QuestionBank[]> {
    return Array.from(this.banks.values())
      .filter(b => b.ownerCodeId === ownerCodeId)
      .map(deepClone);
  }

  async create(bank: QuestionBank): Promise<void> {
    this.banks.set(bank.id, deepClone(bank));
  }

  async update(id: string, updates: Partial<QuestionBank>): Promise<void> {
    const b = this.banks.get(id);
    if (!b) return;
    this.banks.set(id, { ...b, ...deepClone(updates), updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<void> {
    this.banks.delete(id);
  }

  clear(): void {
    this.banks.clear();
  }
}

export class MemoryExamBlueprintRepository implements ExamBlueprintRepository {
  private blueprints = new Map<string, ExamBlueprint>();

  async getById(id: string): Promise<ExamBlueprint | null> {
    const bp = this.blueprints.get(id);
    return bp ? deepClone(bp) : null;
  }

  async list(filter?: BlueprintFilter): Promise<ExamBlueprint[]> {
    let result = Array.from(this.blueprints.values());
    if (filter) {
      if (filter.subjectId) result = result.filter(b => b.subjectId === filter.subjectId);
      if (filter.grade !== undefined) result = result.filter(b => b.grade === filter.grade);
      if (filter.creatorCodeId) result = result.filter(b => b.creatorCodeId === filter.creatorCodeId);
      if (filter.status) result = result.filter(b => b.status === filter.status);
      if (filter.offset) result = result.slice(filter.offset);
      if (filter.limit) result = result.slice(0, filter.limit);
    }
    return result.map(deepClone);
  }

  async create(blueprint: ExamBlueprint): Promise<void> {
    this.blueprints.set(blueprint.id, deepClone(blueprint));
  }

  async update(id: string, updates: Partial<ExamBlueprint>): Promise<void> {
    const bp = this.blueprints.get(id);
    if (!bp) return;
    this.blueprints.set(id, { ...bp, ...deepClone(updates), updatedAt: new Date().toISOString() });
  }

  clear(): void {
    this.blueprints.clear();
  }
}

export class MemoryExamRepository implements ExamRepository {
  private exams = new Map<string, Exam>();

  async getById(id: string): Promise<Exam | null> {
    const exam = this.exams.get(id);
    return exam ? deepClone(exam) : null;
  }

  async list(filter?: ExamFilter): Promise<Exam[]> {
    let result = Array.from(this.exams.values());
    if (filter) {
      if (filter.subjectId) result = result.filter(e => e.subjectId === filter.subjectId);
      if (filter.grade !== undefined) result = result.filter(e => e.grade === filter.grade);
      if (filter.examType) result = result.filter(e => e.examType === filter.examType);
      if (filter.visibility) result = result.filter(e => e.visibility === filter.visibility);
      if (filter.moderationStatus) result = result.filter(e => e.moderationStatus === filter.moderationStatus);
      if (filter.creatorCodeId) result = result.filter(e => e.creatorCodeId === filter.creatorCodeId);
      if (filter.status) result = result.filter(e => e.status === filter.status);
      if (filter.classroomId) result = result.filter(e => e.targetClassroomIds?.includes(filter.classroomId!));
      if (filter.offset) result = result.slice(filter.offset);
      if (filter.limit) result = result.slice(0, filter.limit);
    }
    return result.map(deepClone);
  }

  async create(exam: Exam): Promise<void> {
    this.exams.set(exam.id, deepClone(exam));
  }

  async update(id: string, updates: Partial<Exam>): Promise<void> {
    const exam = this.exams.get(id);
    if (!exam) return;
    this.exams.set(id, { ...exam, ...deepClone(updates), updatedAt: new Date().toISOString() });
  }

  async publish(id: string): Promise<void> {
    const exam = this.exams.get(id);
    if (exam) {
      exam.moderationStatus = 'approved';
      exam.status = 'active';
      exam.updatedAt = new Date().toISOString();
    }
  }

  async archive(id: string): Promise<void> {
    const exam = this.exams.get(id);
    if (exam) {
      exam.status = 'archived';
      exam.updatedAt = new Date().toISOString();
    }
  }

  clear(): void {
    this.exams.clear();
  }
}

export class MemoryExamSessionRepository implements ExamSessionRepository {
  private sessions = new Map<string, ExamSession>();

  async getById(sessionId: string): Promise<ExamSession | null> {
    const s = this.sessions.get(sessionId);
    return s ? deepClone(s) : null;
  }

  async createSession(session: ExamSession): Promise<void> {
    this.sessions.set(session.id, deepClone(session));
  }

  async updateSession(session: ExamSession): Promise<void> {
    this.sessions.set(session.id, deepClone(session));
  }

  async updateSecurityContext(sessionId: string, context: Partial<SessionSecurityContext>): Promise<void> {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.securityContext = { ...s.securityContext, ...deepClone(context) };
  }

  async start(sessionId: string): Promise<void> {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.status = 'in_progress';
    s.startedAt = new Date().toISOString();
    s.updatedAt = s.startedAt;
  }

  async finish(sessionId: string): Promise<void> {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.status = 'submitted';
    s.submittedAt = new Date().toISOString();
    s.updatedAt = s.submittedAt;
  }

  clear(): void {
    this.sessions.clear();
  }
}

export class MemorySubmissionRepository implements SubmissionRepository {
  private submissions = new Map<string, Submission>();
  private gradingRecords = new Map<string, GradingRecord>();

  async getById(submissionId: string): Promise<Submission | null> {
    const sub = this.submissions.get(submissionId);
    return sub ? deepClone(sub) : null;
  }

  async getBySessionId(sessionId: string): Promise<Submission | null> {
    for (const sub of this.submissions.values()) {
      if (sub.sessionId === sessionId) return deepClone(sub);
    }
    return null;
  }

  async createSubmission(submission: Submission): Promise<void> {
    this.submissions.set(submission.id, deepClone(submission));
  }

  async getGradingRecord(submissionId: string): Promise<GradingRecord | null> {
    const rec = this.gradingRecords.get(submissionId);
    return rec ? deepClone(rec) : null;
  }

  async saveGradingRecord(record: GradingRecord): Promise<void> {
    this.gradingRecords.set(record.submissionId, deepClone(record));
  }

  clear(): void {
    this.submissions.clear();
    this.gradingRecords.clear();
  }
}

export class MemoryResultRepository implements ResultRepository {
  private results = new Map<string, Result>();

  async getById(resultId: string): Promise<Result | null> {
    const r = this.results.get(resultId);
    return r ? deepClone(r) : null;
  }

  async getBySessionId(sessionId: string): Promise<Result | null> {
    for (const r of this.results.values()) {
      if (r.sessionId === sessionId) return deepClone(r);
    }
    return null;
  }

  async listByStudent(studentCodeId: string, filter?: ResultFilter): Promise<Result[]> {
    let list = Array.from(this.results.values()).filter(r => r.studentCodeId === studentCodeId);
    if (filter) {
      if (filter.examId) list = list.filter(r => r.examId === filter.examId);
      if (filter.classroomId) list = list.filter(r => r.classroomId === filter.classroomId);
      if (filter.offset) list = list.slice(filter.offset);
      if (filter.limit) list = list.slice(0, filter.limit);
    }
    return list.map(deepClone);
  }

  async listByExam(examId: string, filter?: ResultFilter): Promise<Result[]> {
    let list = Array.from(this.results.values()).filter(r => r.examId === examId);
    if (filter) {
      if (filter.studentCodeId) list = list.filter(r => r.studentCodeId === filter.studentCodeId);
      if (filter.classroomId) list = list.filter(r => r.classroomId === filter.classroomId);
      if (filter.offset) list = list.slice(filter.offset);
      if (filter.limit) list = list.slice(0, filter.limit);
    }
    return list.map(deepClone);
  }

  async createResult(result: Result): Promise<void> {
    this.results.set(result.id, deepClone(result));
  }

  clear(): void {
    this.results.clear();
  }
}

export class MemoryClassroomRepository implements ClassroomRepository {
  private classrooms = new Map<string, Classroom>();
  private members = new Map<string, Map<string, ClassroomMember>>(); // classroomId -> (studentCodeId -> Member)

  async getById(classroomId: string): Promise<Classroom | null> {
    const c = this.classrooms.get(classroomId);
    return c ? deepClone(c) : null;
  }

  async listByTeacher(teacherCodeId: string): Promise<Classroom[]> {
    return Array.from(this.classrooms.values())
      .filter(c => c.teacherCodeId === teacherCodeId)
      .map(deepClone);
  }

  async listByStudent(studentCodeId: string): Promise<Classroom[]> {
    const matchedIds: string[] = [];
    for (const [cId, membersMap] of this.members.entries()) {
      if (membersMap.has(studentCodeId)) {
        matchedIds.push(cId);
      }
    }
    return matchedIds
      .map(id => this.classrooms.get(id))
      .filter((c): c is Classroom => !!c)
      .map(deepClone);
  }

  async create(classroom: Classroom): Promise<void> {
    this.classrooms.set(classroom.id, deepClone(classroom));
    if (!this.members.has(classroom.id)) {
      this.members.set(classroom.id, new Map());
    }
  }

  async update(classroomId: string, updates: Partial<Classroom>): Promise<void> {
    const c = this.classrooms.get(classroomId);
    if (!c) return;
    this.classrooms.set(classroomId, { ...c, ...deepClone(updates), updatedAt: new Date().toISOString() });
  }

  async getMembers(classroomId: string): Promise<ClassroomMember[]> {
    const m = this.members.get(classroomId);
    if (!m) return [];
    return Array.from(m.values()).map(deepClone);
  }

  async addMember(member: ClassroomMember): Promise<void> {
    if (!this.members.has(member.classroomId)) {
      this.members.set(member.classroomId, new Map());
    }
    this.members.get(member.classroomId)!.set(member.studentCodeId, deepClone(member));
    const c = this.classrooms.get(member.classroomId);
    if (c) {
      c.memberCount = this.members.get(member.classroomId)!.size;
    }
  }

  async removeMember(classroomId: string, studentCodeId: string): Promise<void> {
    const m = this.members.get(classroomId);
    if (m) {
      m.delete(studentCodeId);
      const c = this.classrooms.get(classroomId);
      if (c) {
        c.memberCount = m.size;
      }
    }
  }

  clear(): void {
    this.classrooms.clear();
    this.members.clear();
  }
}

export class MemoryAssignmentRepository implements AssignmentRepository {
  private assignments = new Map<string, Assignment>();
  private classroomRepo?: ClassroomRepository;

  constructor(classroomRepo?: ClassroomRepository) {
    this.classroomRepo = classroomRepo;
  }

  async getById(assignmentId: string): Promise<Assignment | null> {
    const a = this.assignments.get(assignmentId);
    return a ? deepClone(a) : null;
  }

  async listByClassroom(classroomId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.classroomId === classroomId)
      .map(deepClone);
  }

  async listByStudent(studentCodeId: string): Promise<Assignment[]> {
    if (!this.classroomRepo) {
      return Array.from(this.assignments.values()).map(deepClone);
    }
    const studentClasses = await this.classroomRepo.listByStudent(studentCodeId);
    const classIds = new Set(studentClasses.map(c => c.id));
    return Array.from(this.assignments.values())
      .filter(a => classIds.has(a.classroomId))
      .map(deepClone);
  }

  async create(assignment: Assignment): Promise<void> {
    this.assignments.set(assignment.id, deepClone(assignment));
  }

  async update(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    const a = this.assignments.get(assignmentId);
    if (!a) return;
    this.assignments.set(assignmentId, { ...a, ...deepClone(updates), updatedAt: new Date().toISOString() });
  }

  clear(): void {
    this.assignments.clear();
  }
}

export interface InMemoryRepositories {
  subjects: MemorySubjectRepository;
  questions: MemoryQuestionRepository;
  questionBanks: MemoryQuestionBankRepository;
  blueprints: MemoryExamBlueprintRepository;
  exams: MemoryExamRepository;
  sessions: MemoryExamSessionRepository;
  submissions: MemorySubmissionRepository;
  results: MemoryResultRepository;
  classrooms: MemoryClassroomRepository;
  assignments: MemoryAssignmentRepository;
  clearAll: () => void;
}

export function createInMemoryRepositories(): InMemoryRepositories {
  const subjects = new MemorySubjectRepository();
  const questions = new MemoryQuestionRepository();
  const questionBanks = new MemoryQuestionBankRepository();
  const blueprints = new MemoryExamBlueprintRepository();
  const exams = new MemoryExamRepository();
  const sessions = new MemoryExamSessionRepository();
  const submissions = new MemorySubmissionRepository();
  const results = new MemoryResultRepository();
  const classrooms = new MemoryClassroomRepository();
  const assignments = new MemoryAssignmentRepository(classrooms);

  return {
    subjects,
    questions,
    questionBanks,
    blueprints,
    exams,
    sessions,
    submissions,
    results,
    classrooms,
    assignments,
    clearAll: () => {
      subjects.clear();
      questions.clear();
      questionBanks.clear();
      blueprints.clear();
      exams.clear();
      sessions.clear();
      submissions.clear();
      results.clear();
      classrooms.clear();
      assignments.clear();
    }
  };
}
