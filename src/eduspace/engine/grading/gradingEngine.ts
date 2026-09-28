/**
 * EduSpace V3 Exam Engine - Grading Engine
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-api-contract.md
 * 
 * Server-authoritative grading evaluation for student submissions.
 * - Computes awardedPoints per question based on authoritative QuestionVersion.gradingConfig.
 * - Separates maxPoints from awardedPoints.
 * - Applies GDPT 2018 True/False partial scoring ladder [0.1, 0.25, 0.5, 1.0].
 * - Distinguishes between automatic, manual, and hybrid grading methods.
 */

import type { GradingMethod, QuestionType } from '../../core/constants/index.ts';
import type { Question, QuestionVersion } from '../../core/domain/question.ts';
import type { ExamSession, GradingRecord, QuestionGradingDetail, Submission } from '../../core/domain/session.ts';
import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import { defaultQuestionRegistry, QuestionRegistry } from '../registry/questionRegistry.ts';

export class GradingEngine {
  constructor(private registry: QuestionRegistry = defaultQuestionRegistry) {}

  /**
   * Evaluates a submission and generates an authoritative GradingRecord.
   */
  evaluateSubmission(
    session: ExamSession,
    submission: Submission,
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>,
    questions?: Map<string, Question> | Record<string, Question>
  ): GradingRecord {
    const vMap = versions instanceof Map ? versions : new Map(Object.entries(versions));
    const qMap = questions instanceof Map
      ? questions
      : (questions ? new Map(Object.entries(questions)) : undefined);

    const answerMap = new Map<string, any>();
    for (const ans of submission.answers) {
      answerMap.set(ans.questionId, ans.responsePayload);
    }

    const detailedQuestions: QuestionGradingDetail[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    let hasManual = false;
    let hasAutomatic = false;

    // Identify selected choice questions if any choice groups exist
    const selectedChoiceIds = submission.selectedChoiceQuestionIds || session.autosaveState?.selectedChoiceQuestionIds;
    const choiceIdSet = selectedChoiceIds ? new Set(selectedChoiceIds) : null;

    for (const qRef of session.questionVersionReferences) {
      // Check if this question belongs to a choiceGroup
      const isChoiceQuestion = !!qRef.choiceGroupId;
      let isQuestionSelected = true;

      if (isChoiceQuestion) {
        if (choiceIdSet) {
          isQuestionSelected = choiceIdSet.has(qRef.questionId);
        } else {
          // Fallback: If student answered this question, consider it selected; otherwise unselected
          const resp = answerMap.get(qRef.questionId);
          isQuestionSelected = resp !== undefined && resp !== null && resp !== '';
        }
      }

      // If question was not chosen in an optional group, it does not count towards total points
      if (!isQuestionSelected) {
        detailedQuestions.push({
          questionId: qRef.questionId,
          questionVersionId: qRef.questionVersionId,
          maxPoints: 0,
          awardedPoints: 0,
          isCorrect: false,
          teacherFeedback: 'Không chọn (câu hỏi tự chọn)',
          gradingMethod: 'automatic'
        });
        continue;
      }

      const version = vMap.get(qRef.questionVersionId);
      if (!version) {
        throw EduSpaceError.validationError(
          `Authoritative QuestionVersion '${qRef.questionVersionId}' not found during grading`
        );
      }

      // Determine question type from Version parts, Question entity or Version content
      let qType: QuestionType = 'single_choice';
      if (Array.isArray(version.content?.parts) && version.content.parts.length > 0) {
        qType = 'multi_part' as QuestionType;
      } else if (qMap && qMap.has(qRef.questionId)) {
        qType = qMap.get(qRef.questionId)!.type;
      } else if ((version as any).type) {
        qType = (version as any).type;
      } else if ((version.content as any)?.type) {
        qType = (version.content as any).type;
      }

      const plugin = this.registry.get(qType);
      const studentResponse = answerMap.get(qRef.questionId);

      const evalResult = plugin.evaluate(
        studentResponse,
        version.content.payload || version.content,
        version.gradingConfig,
        qRef.allocatedPoints
      );

      maxPossibleScore += evalResult.maxPoints;
      totalScore += evalResult.awardedPoints;

      if (evalResult.gradingMethod === 'manual' || evalResult.needsManualReview) {
        hasManual = true;
      } else {
        hasAutomatic = true;
      }

      const detail: QuestionGradingDetail = {
        questionId: qRef.questionId,
        questionVersionId: qRef.questionVersionId,
        maxPoints: evalResult.maxPoints,
        awardedPoints: evalResult.awardedPoints,
        isCorrect: evalResult.isCorrect,
        partialBreakdown: evalResult.partialBreakdown,
        teacherFeedback: undefined,
        gradingMethod: evalResult.gradingMethod
      };

      detailedQuestions.push(detail);
    }

    let overallGradingMethod: GradingMethod = 'automatic';
    if (hasManual && hasAutomatic) {
      overallGradingMethod = 'hybrid';
    } else if (hasManual) {
      overallGradingMethod = 'manual';
    }

    totalScore = Number(totalScore.toFixed(3));
    maxPossibleScore = Number(maxPossibleScore.toFixed(3));

    return {
      id: session.id, // Idempotency key: session.id === submission.id === gradingRecord.id
      schemaVersion: 1,
      submissionId: submission.id,
      sessionId: session.id,
      examId: session.examId,
      studentCodeId: session.studentCodeId,
      overallGradingMethod,
      gradedByCodeId: overallGradingMethod === 'automatic' ? 'system' : null,
      detailedQuestions,
      totalScore,
      maxPossibleScore,
      percentage: maxPossibleScore > 0 ? Number(((totalScore / maxPossibleScore) * 100).toFixed(2)) : 0,
      isFinalized: overallGradingMethod === 'automatic',
      gradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const defaultGradingEngine = new GradingEngine();
