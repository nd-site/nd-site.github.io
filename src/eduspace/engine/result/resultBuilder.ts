/**
 * EduSpace V3 Exam Engine - Result Builder
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-api-contract.md
 * 
 * Computes official Result and section scores from GradingRecord and ExamSession.
 * STRICT: Preserves studentNdid RAW STRING verbatim without stripping or prepending '@'.
 */

import type { ExamSession, GradingRecord, Result, SectionScore, Submission } from '../../core/domain/session.ts';

export interface ResultBuilderOptions {
  studentNdid: string; // RAW STRING
  studentDisplayName: string;
  passPoints?: number;
  sectionTitles?: Record<string, string>;
  classroomId?: string;
  isProvisional?: boolean;
}

export class ResultBuilder {
  /**
   * Constructs a canonical Result record.
   */
  buildResult(
    session: ExamSession,
    submission: Submission,
    gradingRecord: GradingRecord,
    options: ResultBuilderOptions
  ): Result {
    const passThreshold = options.passPoints ?? 5.0;
    const isPassed = gradingRecord.totalScore >= passThreshold;

    // Build section scores breakdown
    const sectionScoreMap = new Map<string, { score: number; maxScore: number }>();
    const questionToSectionMap = new Map<string, string>();

    for (const qRef of session.questionVersionReferences) {
      questionToSectionMap.set(qRef.questionId, qRef.assignedSectionId);
      if (!sectionScoreMap.has(qRef.assignedSectionId)) {
        sectionScoreMap.set(qRef.assignedSectionId, { score: 0, maxScore: 0 });
      }
    }

    for (const dq of gradingRecord.detailedQuestions) {
      const secId = questionToSectionMap.get(dq.questionId) || 'default';
      const current = sectionScoreMap.get(secId) || { score: 0, maxScore: 0 };
      current.score += dq.awardedPoints;
      current.maxScore += dq.maxPoints;
      sectionScoreMap.set(secId, current);
    }

    const sectionScores: SectionScore[] = [];
    for (const [secId, item] of sectionScoreMap.entries()) {
      sectionScores.push({
        sectionId: secId,
        sectionTitle: options.sectionTitles?.[secId] || `Phần ${secId}`,
        score: Number(item.score.toFixed(3)),
        maxScore: Number(item.maxScore.toFixed(3))
      });
    }

    const startedTime = new Date(session.startedAt).getTime();
    const submittedTime = new Date(submission.submittedAt).getTime();
    const durationSeconds = Math.max(0, Math.floor((submittedTime - startedTime) / 1000));

    const isFinal = gradingRecord.overallGradingMethod === 'automatic';

    return {
      id: `res_${session.id}`,
      schemaVersion: 1,
      sessionId: session.id,
      examId: session.examId,
      assignmentId: session.assignmentId,
      classroomId: options.classroomId || null,
      studentCodeId: session.studentCodeId,
      studentNdid: options.studentNdid, // RAW STRING PRESERVED
      studentDisplayName: options.studentDisplayName,
      totalScore: gradingRecord.totalScore,
      maxScore: gradingRecord.maxPossibleScore,
      percentage: gradingRecord.percentage,
      passed: isPassed,
      sectionScores,
      attemptNumber: session.attemptNumber,
      startedAt: session.startedAt,
      submittedAt: submission.submittedAt,
      durationSeconds,
      status: options.isProvisional !== undefined ? (options.isProvisional ? 'provisional' : 'final') : (isFinal ? 'final' : 'provisional'),
      publishedToStudent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const defaultResultBuilder = new ResultBuilder();
