/**
 * EduSpace V3 Exam Engine - Master Pipeline Orchestrator
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Coordinates the full assessment execution lifecycle:
 * Exam -> ExamExecutionPlan -> ExamSession -> Submission -> GradingRecord -> Result
 * 
 * Framework-independent: does not touch Firestore, React, or DOM.
 */

import type { Exam } from '../../core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../core/domain/question.ts';
import type {
  ExamSession,
  GradingRecord,
  Result,
  SessionQuestionRef,
  Submission,
  SubmittedAnswerItem
} from '../../core/domain/session.ts';
import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import { defaultGradingEngine, GradingEngine } from '../grading/gradingEngine.ts';
import { defaultExamPlanner, ExamPlanner } from '../plan/examPlanner.ts';
import { defaultQuestionRegistry, QuestionRegistry } from '../registry/questionRegistry.ts';
import { defaultResultBuilder, ResultBuilder, type ResultBuilderOptions } from '../result/resultBuilder.ts';
import { defaultSessionStateMachine, SessionStateMachine } from '../state/sessionStateMachine.ts';
import { defaultSubmissionValidator, SubmissionValidator } from '../submission/submissionValidator.ts';
import { defaultServerTimer, ServerTimer } from '../timer/serverTimer.ts';
import type { AutosaveEnvelope, ExamExecutionPlan, SessionState } from '../types.ts';
import { defaultExamValidator, ExamValidator } from '../validation/examValidator.ts';

export interface StartSessionOptions {
  assignmentId?: string | null;
  attemptNumber?: number;
  serverNow?: string | Date;
  clientIp?: string;
  userAgent?: string;
}

export class ExamEngine {
  constructor(
    public readonly planner: ExamPlanner = defaultExamPlanner,
    public readonly examValidator: ExamValidator = defaultExamValidator,
    public readonly submissionValidator: SubmissionValidator = defaultSubmissionValidator,
    public readonly gradingEngine: GradingEngine = defaultGradingEngine,
    public readonly resultBuilder: ResultBuilder = defaultResultBuilder,
    public readonly stateMachine: SessionStateMachine = defaultSessionStateMachine,
    public readonly timer: ServerTimer = defaultServerTimer,
    public readonly questionRegistry: QuestionRegistry = defaultQuestionRegistry
  ) {}

  /**
   * 1. Generates an immutable, deterministic execution plan from an Exam.
   */
  createPlan(
    exam: Exam,
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>,
    attemptSeed: string,
    questions?: Map<string, Question> | Record<string, Question>
  ): ExamExecutionPlan {
    return this.planner.createExecutionPlan(exam, versions, attemptSeed, questions);
  }

  /**
   * 2. Initializes a new server-authoritative ExamSession.
   */
  startSession(
    plan: ExamExecutionPlan,
    studentCodeId: string,
    options: StartSessionOptions = {}
  ): ExamSession {
    const startedAt = options.serverNow
      ? (typeof options.serverNow === 'string' ? options.serverNow : options.serverNow.toISOString())
      : new Date().toISOString();

    const expiresAt = this.timer.computeExpiresAt(startedAt, {
      durationMinutes: plan.durationMinutes,
      bufferSeconds: 30
    });

    // Pinned version references
    const qRefs: SessionQuestionRef[] = [];
    for (const section of plan.sections) {
      for (const q of section.questions) {
        // Firestore does not accept an `undefined` value anywhere in a
        // document (including inside an array item). Most V2-compatible
        // questions do not belong to a choice/group, so optional IDs must be
        // omitted rather than written as `undefined`.
        const questionReference: SessionQuestionRef = {
          questionId: q.questionId,
          questionVersionId: q.questionVersionId,
          assignedSectionId: section.id,
          allocatedPoints: q.allocatedPoints,
          orderIndex: q.orderIndex
        };
        if (q.choiceGroupId !== undefined) questionReference.choiceGroupId = q.choiceGroupId;
        if (q.groupId !== undefined) questionReference.groupId = q.groupId;
        qRefs.push(questionReference);
      }
    }

    const sessionId = `ses_${plan.examId}_${studentCodeId}_${Date.now()}`;

    const session: ExamSession = {
      id: sessionId,
      schemaVersion: 1,
      examId: plan.examId,
      assignmentId: options.assignmentId || null,
      studentCodeId,
      attemptNumber: options.attemptNumber || 1,
      startedAt,
      expiresAt,
      submittedAt: null,
      status: 'in_progress',
      attemptSeed: plan.attemptSeed,
      questionVersionReferences: qRefs,
      securityContext: {
        tabSwitchCount: 0,
        ...(options.clientIp !== undefined ? { clientIp: options.clientIp } : {}),
        ...(options.userAgent !== undefined ? { userAgent: options.userAgent } : {})
      },
      createdAt: startedAt,
      updatedAt: startedAt
    };

    return session;
  }

  /**
   * 3. Validates and packages an autosave payload.
   */
  autosave(
    session: ExamSession,
    answersPayload: Record<string, any>,
    answerVersion: number = 1,
    serverNow: string | Date = new Date()
  ): AutosaveEnvelope {
    if (session.status !== 'in_progress') {
      throw EduSpaceError.submissionClosed(`Cannot autosave: session status is '${session.status}'`);
    }

    if (this.timer.isExpired(session.expiresAt, serverNow)) {
      session.status = this.stateMachine.transition(session.status as SessionState, 'expired');
      throw EduSpaceError.sessionExpired('Cannot autosave: exam session has expired');
    }

    const savedAt = typeof serverNow === 'string' ? serverNow : serverNow.toISOString();
    session.autosaveState = {
      lastSavedAt: savedAt,
      savedAnswersCount: Object.keys(answersPayload || {}).length,
      answersPayload: JSON.parse(JSON.stringify(answersPayload || {}))
    };
    session.updatedAt = savedAt;

    return {
      sessionId: session.id,
      answerVersion,
      answersPayload: session.autosaveState.answersPayload,
      savedAt
    };
  }

  /**
   * 4. Submits official student answers, closing the session.
   * STRICT: Rejects expired sessions and client-supplied scores.
   */
  submit(
    session: ExamSession,
    rawAnswers: unknown[],
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>,
    serverNow: string | Date = new Date()
  ): { session: ExamSession; submission: Submission } {
    if (session.status !== 'in_progress') {
      throw EduSpaceError.submissionClosed(`Cannot submit: session is already '${session.status}'`);
    }

    // 15 seconds network grace buffer
    if (this.timer.isExpired(session.expiresAt, serverNow, 15)) {
      session.status = this.stateMachine.transition(session.status as SessionState, 'expired');
      throw EduSpaceError.sessionExpired('Exam submission rejected: time limit exceeded');
    }

    // Validate answers and sanitize untrusted client fields
    const sanitizedAnswers = this.submissionValidator.validateSubmission(session, rawAnswers, versions);

    const submittedAt = typeof serverNow === 'string' ? serverNow : serverNow.toISOString();

    // Transition session state to submitted
    session.status = this.stateMachine.transition(session.status as SessionState, 'submitted');
    session.submittedAt = submittedAt;
    session.updatedAt = submittedAt;

    const submission: Submission = {
      id: session.id, // Idempotency key: session.id === submission.id
      schemaVersion: 1,
      sessionId: session.id,
      examId: session.examId,
      assignmentId: session.assignmentId,
      studentCodeId: session.studentCodeId,
      submittedAt,
      answers: sanitizedAnswers,
      createdAt: submittedAt
    };

    return { session, submission };
  }

  /**
   * 5. Grades the submission and generates authoritative GradingRecord.
   */
  grade(
    session: ExamSession,
    submission: Submission,
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>,
    questions?: Map<string, Question> | Record<string, Question>
  ): GradingRecord {
    const currentState = session.status as SessionState;
    if (currentState !== 'submitted' && currentState !== 'expired') {
      throw EduSpaceError.conflict(`Cannot grade session in '${currentState}' state`);
    }

    session.status = this.stateMachine.transition(currentState, 'grading');
    const record = this.gradingEngine.evaluateSubmission(session, submission, versions, questions);
    session.status = this.stateMachine.transition(session.status as SessionState, 'graded');
    session.updatedAt = new Date().toISOString();

    return record;
  }

  /**
   * 6. Builds the canonical Result record.
   */
  buildResult(
    session: ExamSession,
    submission: Submission,
    gradingRecord: GradingRecord,
    options: ResultBuilderOptions
  ): Result {
    return this.resultBuilder.buildResult(session, submission, gradingRecord, options);
  }
}

export const defaultExamEngine = new ExamEngine();
