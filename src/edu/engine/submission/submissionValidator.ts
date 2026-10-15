/**
 * EduSpace V3 Exam Engine - Submission Validator
 * Source of truth: docs/eduspace-v3-api-contract.md & docs/eduspace-v3-database-schema.md
 * 
 * Verifies submitted answers against the authoritative ExamSession.
 * STRICT: Rejects any client-supplied scores, awardedPoints, or answer keys.
 */

import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { ExamSession, SubmittedAnswerItem } from '../../core/domain/session.ts';
import type { QuestionVersion } from '../../core/domain/question.ts';
import { defaultQuestionRegistry, QuestionRegistry } from '../registry/questionRegistry.ts';

export class SubmissionValidator {
  constructor(private registry: QuestionRegistry = defaultQuestionRegistry) {}

  /**
   * Validates submitted answers against session and question version definitions.
   * Strips out any untrusted client-supplied scores or tampering attempts.
   */
  validateSubmission(
    session: ExamSession,
    submittedAnswers: unknown[],
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>
  ): SubmittedAnswerItem[] {
    if (!session || typeof session !== 'object') {
      throw EduSpaceError.validationError('Invalid session reference');
    }
    if (!Array.isArray(submittedAnswers)) {
      throw EduSpaceError.validationError('Submitted answers must be an array');
    }

    const vMap = versions instanceof Map ? versions : new Map(Object.entries(versions));
    const sessionQuestionMap = new Map<string, { questionVersionId: string }>();

    for (const qRef of session.questionVersionReferences) {
      sessionQuestionMap.set(qRef.questionId, { questionVersionId: qRef.questionVersionId });
    }

    const seenQuestionIds = new Set<string>();
    const sanitizedAnswers: SubmittedAnswerItem[] = [];

    for (let idx = 0; idx < submittedAnswers.length; idx++) {
      const item = submittedAnswers[idx] as Record<string, any>;
      if (!item || typeof item !== 'object') {
        throw EduSpaceError.validationError(`Submitted answer at index ${idx} is not an object`);
      }

      const qId = item.questionId;
      const vId = item.questionVersionId;

      if (!qId || typeof qId !== 'string') {
        throw EduSpaceError.validationError(`Answer at index ${idx} is missing questionId`);
      }

      // Check if question exists in this session
      const sessionRef = sessionQuestionMap.get(qId);
      if (!sessionRef) {
        throw EduSpaceError.validationError(`Question '${qId}' is not part of exam session '${session.id}'`);
      }

      // Check questionVersionId matches session's pinned version
      if (vId && vId !== sessionRef.questionVersionId) {
        throw EduSpaceError.validationError(
          `Tampered version ID '${vId}' for question '${qId}'. Pinned session version is '${sessionRef.questionVersionId}'`
        );
      }

      // Check duplicate answer entries
      if (seenQuestionIds.has(qId)) {
        throw EduSpaceError.validationError(`Duplicate answer submission for question '${qId}'`);
      }
      seenQuestionIds.add(qId);

      // Verify question version exists in registry
      const version = vMap.get(sessionRef.questionVersionId);
      if (!version) {
        throw EduSpaceError.validationError(
          `Authoritative QuestionVersion '${sessionRef.questionVersionId}' not found for question '${qId}'`
        );
      }

      // Extract responsePayload
      const responsePayload = item.responsePayload !== undefined ? item.responsePayload : item.response;
      if (responsePayload === undefined) {
        throw EduSpaceError.validationError(`Missing responsePayload for question '${qId}'`);
      }

      // Validate answer shape via registered question type plugin
      // If version is associated with a question, type comes from version content or session
      const questionType = (version as any).type || (version.content as any)?.type;
      if (questionType && this.registry.has(questionType)) {
        const plugin = this.registry.get(questionType);
        plugin.validateResponse(responsePayload, version.content?.payload);
      }

      // Security: Strip out any client-supplied scores, awardedPoints, or answers
      const sanitized: SubmittedAnswerItem = {
        questionId: qId,
        questionVersionId: sessionRef.questionVersionId, // Always use session's pinned version ID
        responsePayload: JSON.parse(JSON.stringify(responsePayload)),
        answeredAt: typeof item.answeredAt === 'string' ? item.answeredAt : new Date().toISOString(),
        timeSpentSeconds: typeof item.timeSpentSeconds === 'number' ? Math.max(0, item.timeSpentSeconds) : undefined
      };

      sanitizedAnswers.push(sanitized);
    }

    return sanitizedAnswers;
  }
}

export const defaultSubmissionValidator = new SubmissionValidator();
