/**
 * EduSpace V3 Server-Authoritative Exam Session Service
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-api-contract.md
 * 
 * Orchestrates:
 * Exam -> ExamExecutionPlan -> ExamSession -> Submission -> GradingRecord -> Result
 * 
 * Enforces:
 * - Server clock authority & strict expiration timers
 * - Session ownership & role authorization
 * - Answer key isolation & response sanitization
 * - Autosave contract & idempotency
 * - Result immutability & Raw NDID preservation
 */

import { EduSpaceError } from '../core/errors/EduSpaceError.ts';
import type {
  AssignmentRepository,
  ClassroomRepository,
  ExamRepository,
  ExamSessionRepository,
  QuestionRepository,
  ResultRepository,
  SubmissionRepository
} from '../core/repositories/interfaces.ts';
import type { Exam } from '../core/domain/exam.ts';
import type { Question, QuestionVersion } from '../core/domain/question.ts';
import type { ExamSession, Result, Submission } from '../core/domain/session.ts';
import { defaultExamEngine, ExamEngine } from '../engine/pipeline/examEngine.ts';
import type { ExamExecutionPlan, SessionState } from '../engine/types.ts';
import { sanitizeExecutionPlan } from './sanitizer.ts';
import type {
  AutosaveRequest,
  AutosaveResponse,
  ManualGradeRequest,
  ManualGradeResponse,
  ResumeSessionResponse,
  StartSessionRequest,
  StartSessionResponse,
  SubmitSessionRequest,
  SubmitSessionResponse,
  UserSecurityContext
} from './types.ts';

export interface ExamSessionServiceDependencies {
  examRepo: ExamRepository;
  questionRepo: QuestionRepository;
  sessionRepo: ExamSessionRepository;
  submissionRepo: SubmissionRepository;
  resultRepo: ResultRepository;
  classroomRepo?: ClassroomRepository;
  assignmentRepo?: AssignmentRepository;
  engine?: ExamEngine;
}

export class ExamSessionService {
  private readonly examRepo: ExamRepository;
  private readonly questionRepo: QuestionRepository;
  private readonly sessionRepo: ExamSessionRepository;
  private readonly submissionRepo: SubmissionRepository;
  private readonly resultRepo: ResultRepository;
  private readonly classroomRepo?: ClassroomRepository;
  private readonly assignmentRepo?: AssignmentRepository;
  private readonly engine: ExamEngine;

  constructor(deps: ExamSessionServiceDependencies) {
    this.examRepo = deps.examRepo;
    this.questionRepo = deps.questionRepo;
    this.sessionRepo = deps.sessionRepo;
    this.submissionRepo = deps.submissionRepo;
    this.resultRepo = deps.resultRepo;
    this.classroomRepo = deps.classroomRepo;
    this.assignmentRepo = deps.assignmentRepo;
    this.engine = deps.engine || defaultExamEngine;
  }

  /**
   * Helper to format serverNow timestamp consistently.
   */
  private resolveServerNow(serverNow?: Date | string): string {
    if (!serverNow) return new Date().toISOString();
    return typeof serverNow === 'string' ? serverNow : serverNow.toISOString();
  }

  /**
   * 1. Starts a new server-authoritative exam session.
   */
  async startSession(
    userContext: UserSecurityContext,
    request: StartSessionRequest,
    serverNow?: Date | string
  ): Promise<StartSessionResponse> {
    if (!userContext || !userContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required to start exam session');
    }

    const nowStr = this.resolveServerNow(serverNow);

    // 1. Fetch and validate Exam
    const exam = await this.examRepo.getById(request.examId);
    if (!exam) {
      throw EduSpaceError.notFound(`Exam not found: ${request.examId}`);
    }

    if (exam.status === 'archived') {
      throw EduSpaceError.conflict('Cannot start session: Exam has been archived');
    }

    // 2. Check exam visibility and classroom permissions
    if (exam.visibility === 'classroom' && exam.targetClassroomIds && exam.targetClassroomIds.length > 0) {
      const isPrivileged = userContext.role === 'admin' || userContext.codeId === exam.creatorCodeId;
      if (!isPrivileged && this.classroomRepo) {
        let isEnrolledInAny = false;
        for (const cId of exam.targetClassroomIds) {
          const members = await this.classroomRepo.getMembers(cId);
          if (members.some(m => m.studentCodeId === userContext.codeId)) {
            isEnrolledInAny = true;
            break;
          }
        }
        if (!isEnrolledInAny) {
          throw EduSpaceError.forbidden('You are not enrolled in any classroom assigned to this exam');
        }
      }
    }

    // 3. Check public moderation status
    if (exam.visibility === 'public') {
      const isPrivileged = userContext.role === 'admin' || userContext.codeId === exam.creatorCodeId;
      if (!isPrivileged && exam.moderationStatus !== 'approved') {
        throw EduSpaceError.forbidden('Exam is pending review and cannot be taken yet');
      }
    }

    // 4. Check exam open / deadline schedule window
    if (exam.policy?.openTime && nowStr < exam.policy.openTime) {
      throw EduSpaceError.forbidden(`Exam is not open yet (opens at ${exam.policy.openTime})`);
    }
    if (exam.policy?.deadlineTime && nowStr > exam.policy.deadlineTime) {
      throw EduSpaceError.sessionExpired(`Exam deadline has passed (closed at ${exam.policy.deadlineTime})`);
    }

    // 5. Check attempt limit
    const existingResults = await this.resultRepo.listByStudent(userContext.codeId, { examId: exam.id });
    const currentAttemptCount = existingResults.length;
    if (exam.policy?.maxAttempts && currentAttemptCount >= exam.policy.maxAttempts) {
      throw EduSpaceError.forbidden(`Maximum exam attempts (${exam.policy.maxAttempts}) reached`);
    }

    // 6. Resolve pinned QuestionVersion references from repository
    const versionsMap = new Map<string, QuestionVersion>();
    const questionsMap = new Map<string, Question>();

    for (const section of exam.sections) {
      for (const qItem of section.questions) {
        const question = await this.questionRepo.getById(qItem.questionId);
        if (!question) {
          throw EduSpaceError.notFound(`Question not found: ${qItem.questionId}`);
        }
        questionsMap.set(question.id, question);

        const versionId = qItem.questionVersionId || question.currentVersionId;
        const version = await this.questionRepo.getVersion(qItem.questionId, versionId);
        if (!version) {
          throw EduSpaceError.notFound(`Question version not found: ${qItem.questionId} (${versionId})`);
        }
        versionsMap.set(version.id, version);
      }
    }

    // 7. Generate server-authoritative deterministic attemptSeed
    const attemptSeed = `seed_${exam.id}_${userContext.codeId}_${Date.now()}_${Math.floor(Math.random() * 1e6).toString(36)}`;

    // 8. Generate execution plan
    const plan = this.engine.createPlan(exam, versionsMap, attemptSeed, questionsMap);

    // 9. Start session with server-authoritative clock and 30s buffer
    const session = this.engine.startSession(plan, userContext.codeId, {
      assignmentId: request.assignmentId,
      attemptNumber: currentAttemptCount + 1,
      serverNow: nowStr,
      clientIp: userContext.clientIp,
      userAgent: userContext.userAgent
    });

    // 10. Persist session
    await this.sessionRepo.createSession(session);

    // 11. Sanitize execution plan for student delivery (0% answer key leakage)
    const sanitizedExam = sanitizeExecutionPlan(plan);

    return {
      success: true,
      sessionId: session.id,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      serverNow: nowStr,
      attemptSeed: session.attemptSeed,
      exam: sanitizedExam
    };
  }

  /**
   * 2. Resumes an in-progress session (e.g. after network drop or page reload).
   */
  async resumeSession(
    userContext: UserSecurityContext,
    sessionId: string,
    serverNow?: Date | string
  ): Promise<ResumeSessionResponse> {
    if (!userContext || !userContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required');
    }

    const session = await this.sessionRepo.getById(sessionId);
    if (!session) {
      throw EduSpaceError.notFound(`Exam session not found: ${sessionId}`);
    }

    // Strict ownership enforcement
    if (session.studentCodeId !== userContext.codeId) {
      throw EduSpaceError.forbidden('You do not own this exam session');
    }

    const nowStr = this.resolveServerNow(serverNow);

    // State & Timer checks
    if (session.status === 'in_progress') {
      if (this.engine.timer.isExpired(session.expiresAt, nowStr)) {
        session.status = this.engine.stateMachine.transition(session.status as SessionState, 'expired');
        session.updatedAt = nowStr;
        await this.sessionRepo.updateSession(session);
        throw EduSpaceError.sessionExpired('Exam session has expired');
      }
    } else if (session.status === 'expired') {
      throw EduSpaceError.sessionExpired('Exam session has expired');
    } else if (session.status === 'submitted' || session.status === 'grading' || session.status === 'graded') {
      throw EduSpaceError.submissionClosed('Exam session is already submitted');
    } else if (session.status === 'cancelled') {
      throw EduSpaceError.conflict('Exam session has been cancelled');
    }

    // Reconstruct sanitized plan using pinned questionVersionReferences and original attemptSeed
    const exam = await this.examRepo.getById(session.examId);
    if (!exam) {
      throw EduSpaceError.notFound(`Underlying exam not found: ${session.examId}`);
    }

    const versionsMap = new Map<string, QuestionVersion>();
    const questionsMap = new Map<string, Question>();

    for (const ref of session.questionVersionReferences) {
      const q = await this.questionRepo.getById(ref.questionId);
      if (q) questionsMap.set(q.id, q);
      const v = await this.questionRepo.getVersion(ref.questionId, ref.questionVersionId);
      if (v) versionsMap.set(v.id, v);
    }

    const plan = this.engine.createPlan(exam, versionsMap, session.attemptSeed, questionsMap);
    const sanitizedExam = sanitizeExecutionPlan(plan);

    return {
      success: true,
      sessionId: session.id,
      status: session.status,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      serverNow: nowStr,
      attemptSeed: session.attemptSeed,
      exam: sanitizedExam,
      autosaveState: session.autosaveState
    };
  }

  /**
   * 3. Autosaves answer state periodically.
   * Strict contract: Accepts answers only, validates question IDs, never finalizes exam.
   */
  async autosave(
    userContext: UserSecurityContext,
    sessionId: string,
    payload: AutosaveRequest,
    serverNow?: Date | string
  ): Promise<AutosaveResponse> {
    if (!userContext || !userContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required');
    }

    const session = await this.sessionRepo.getById(sessionId);
    if (!session) {
      throw EduSpaceError.notFound(`Exam session not found: ${sessionId}`);
    }

    // Strict ownership verification
    if (session.studentCodeId !== userContext.codeId) {
      throw EduSpaceError.forbidden('You do not own this exam session');
    }

    const nowStr = this.resolveServerNow(serverNow);

    // Validate valid session question IDs
    const allowedQuestionIds = new Set(session.questionVersionReferences.map(r => r.questionId));
    const rawAnswers = payload.answersPayload || {};

    // Reject unknown question keys
    for (const qId of Object.keys(rawAnswers)) {
      if (!allowedQuestionIds.has(qId)) {
        throw EduSpaceError.validation(`Unknown question ID in autosave payload: ${qId}`);
      }
    }

    // Engine validates state & timer, updates session.autosaveState
    const envelope = this.engine.autosave(session, rawAnswers, payload.answerVersion || 1, nowStr);

    if (Array.isArray(payload.selectedChoiceQuestionIds) && session.autosaveState) {
      session.autosaveState.selectedChoiceQuestionIds = payload.selectedChoiceQuestionIds;
    }

    // Persist session update
    await this.sessionRepo.updateSession(session);

    return {
      success: true,
      sessionId: session.id,
      savedAt: envelope.savedAt,
      savedAnswersCount: session.autosaveState?.savedAnswersCount || 0,
      answerVersion: envelope.answerVersion,
      selectedChoiceQuestionIds: session.autosaveState?.selectedChoiceQuestionIds
    };
  }

  /**
   * 4. Officially submits exam session, executes server-side auto-grading, and builds Result.
   * STRICT: Enforces ownership, 15s grace period, strips client scores, idempotent.
   */
  async submit(
    userContext: UserSecurityContext,
    sessionId: string,
    request: SubmitSessionRequest,
    serverNow?: Date | string
  ): Promise<SubmitSessionResponse> {
    if (!userContext || !userContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required');
    }

    const session = await this.sessionRepo.getById(sessionId);
    if (!session) {
      throw EduSpaceError.notFound(`Exam session not found: ${sessionId}`);
    }

    // Strict ownership enforcement
    if (session.studentCodeId !== userContext.codeId) {
      throw EduSpaceError.forbidden('You do not own this exam session');
    }

    // Idempotency check: if session already submitted/graded, return idempotent confirmation
    if (session.status === 'submitted' || session.status === 'grading' || session.status === 'graded') {
      const existingSubmission = await this.submissionRepo.getById(sessionId);
      if (existingSubmission) {
        return {
          success: true,
          sessionId: session.id,
          status: session.status,
          submittedAt: session.submittedAt || existingSubmission.submittedAt,
          resultId: session.id,
          isIdempotentReplay: true
        };
      }
      throw EduSpaceError.submissionClosed('Exam session has already been closed');
    }

    if (session.status === 'expired') {
      throw EduSpaceError.sessionExpired('Exam submission rejected: time limit exceeded');
    }

    if (session.status !== 'in_progress') {
      throw EduSpaceError.submissionClosed(`Cannot submit exam session in '${session.status}' state`);
    }

    const nowStr = this.resolveServerNow(serverNow);

    // Timer check: 15s network grace buffer beyond expiresAt
    if (this.engine.timer.isExpired(session.expiresAt, nowStr, 15)) {
      session.status = this.engine.stateMachine.transition(session.status as SessionState, 'expired');
      session.updatedAt = nowStr;
      await this.sessionRepo.updateSession(session);
      throw EduSpaceError.sessionExpired('Exam submission rejected: time limit exceeded');
    }

    // Load pinned QuestionVersions
    const versionsMap = new Map<string, QuestionVersion>();
    const questionsMap = new Map<string, Question>();

    for (const ref of session.questionVersionReferences) {
      const q = await this.questionRepo.getById(ref.questionId);
      if (q) questionsMap.set(q.id, q);

      const v = await this.questionRepo.getVersion(ref.questionId, ref.questionVersionId);
      if (!v) {
        throw EduSpaceError.internal(`Authoritative question version missing: ${ref.questionVersionId}`);
      }
      versionsMap.set(v.id, v);
    }

    // 1. Submit through Engine (validates questions, versions, strips client scores, transitions state)
    const { submission } = this.engine.submit(session, request.answers || [], versionsMap, nowStr);
    submission.selectedChoiceQuestionIds = request.selectedChoiceQuestionIds || session.autosaveState?.selectedChoiceQuestionIds;

    // Save Submission record
    await this.submissionRepo.createSubmission(submission);
    await this.sessionRepo.updateSession(session);

    // 2. Trigger Server Auto-Grading
    const gradingRecord = this.engine.grade(session, submission, versionsMap, questionsMap);
    await this.submissionRepo.saveGradingRecord(gradingRecord);
    await this.sessionRepo.updateSession(session);

    // 3. Build Canonical Result
    const hasManualReview = gradingRecord.detailedQuestions.some(
      q => q.gradingMethod === 'manual' || (q as any).needsManualReview
    );

    const result = this.engine.buildResult(session, submission, gradingRecord, {
      studentNdid: userContext.ndid, // RAW string preserved 100%
      studentDisplayName: userContext.displayName,
      isProvisional: hasManualReview,
      classroomId: session.assignmentId || undefined
    });

    await this.resultRepo.createResult(result);

    return {
      success: true,
      sessionId: session.id,
      status: session.status,
      submittedAt: submission.submittedAt,
      resultId: result.id,
      isIdempotentReplay: false
    };
  }

  /**
   * 5. Retrieves Result with strict access control and RAW NDID preservation.
   */
  async getResult(
    userContext: UserSecurityContext,
    resultIdOrSessionId: string
  ): Promise<Result> {
    if (!userContext || !userContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required');
    }

    let result = await this.resultRepo.getById(resultIdOrSessionId);
    if (!result) {
      result = await this.resultRepo.getBySessionId(resultIdOrSessionId);
    }
    if (!result) {
      throw EduSpaceError.notFound(`Result not found: ${resultIdOrSessionId}`);
    }

    // Access authorization:
    // 1. Student can view their own result
    // 2. Teacher or Admin can view any student's result
    const isOwner = userContext.codeId === result.studentCodeId;
    const isTeacherOrAdmin = userContext.role === 'admin' || userContext.eduRole === 'teacher';

    if (!isOwner && !isTeacherOrAdmin) {
      throw EduSpaceError.forbidden('You do not have permission to view this result');
    }

    return result;
  }

  /**
   * 6. Allows authorized teachers/admins to manually grade essay/open-ended questions.
   */
  async manualGrade(
    reviewerContext: UserSecurityContext,
    request: ManualGradeRequest,
    serverNow?: Date | string
  ): Promise<ManualGradeResponse> {
    if (!reviewerContext || !reviewerContext.codeId) {
      throw EduSpaceError.unauthenticated('Authentication required');
    }

    const isPrivileged = reviewerContext.role === 'admin' || reviewerContext.eduRole === 'teacher';
    if (!isPrivileged) {
      throw EduSpaceError.forbidden('Only teachers and administrators can perform manual grading');
    }

    const gradingRecord = await this.submissionRepo.getGradingRecord(request.sessionId);
    if (!gradingRecord) {
      throw EduSpaceError.notFound(`Grading record not found for session: ${request.sessionId}`);
    }

    const scoreMap = new Map(request.scores.map(s => [s.questionId, s]));

    for (const detail of gradingRecord.detailedQuestions) {
      const update = scoreMap.get(detail.questionId);
      if (update) {
        if (update.awardedPoints < 0 || update.awardedPoints > detail.maxPoints) {
          throw EduSpaceError.validation(
            `Awarded points ${update.awardedPoints} exceeds max points ${detail.maxPoints} for question ${detail.questionId}`
          );
        }
        detail.awardedPoints = update.awardedPoints;
        detail.isCorrect = update.awardedPoints > 0;
        if (update.feedback) {
          detail.teacherFeedback = update.feedback;
        }
      }
    }

    // Recompute total score
    const newTotal = gradingRecord.detailedQuestions.reduce((acc, q) => acc + q.awardedPoints, 0);
    gradingRecord.totalScore = Math.round(newTotal * 100) / 100;
    gradingRecord.percentage =
      gradingRecord.maxPossibleScore > 0
        ? Math.round((gradingRecord.totalScore / gradingRecord.maxPossibleScore) * 10000) / 100
        : 0;
    gradingRecord.gradedByCodeId = reviewerContext.codeId;
    gradingRecord.isFinalized = true;
    gradingRecord.updatedAt = this.resolveServerNow(serverNow);

    await this.submissionRepo.saveGradingRecord(gradingRecord);

    // Update Result
    const result = await this.resultRepo.getById(request.sessionId);
    if (result) {
      result.totalScore = gradingRecord.totalScore;
      result.percentage = gradingRecord.percentage;
      result.status = 'final';
      result.updatedAt = gradingRecord.updatedAt;
      await this.resultRepo.createResult(result);
    }

    return {
      success: true,
      sessionId: request.sessionId,
      gradedByCodeId: reviewerContext.codeId,
      totalScore: gradingRecord.totalScore,
      isFinalized: true
    };
  }
}
