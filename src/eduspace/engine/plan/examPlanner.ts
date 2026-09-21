/**
 * EduSpace V3 Exam Engine - Exam Planner
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Generates an immutable, deterministic ExamExecutionPlan for a student exam session.
 * - Resolves exact QuestionVersion records (pinning versionId immutably).
 * - Applies deterministic shuffle to questions and options according to ExamPolicy.
 * - STRICT: Completely excludes answer keys (gradingConfig) from the execution plan.
 */

import type { Exam } from '../../core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../core/domain/question.ts';
import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import { createDeterministicRng, deterministicShuffle } from '../random/prng.ts';
import type { ExamExecutionPlan, PlanQuestion, PlanSection } from '../types.ts';
import { defaultExamValidator, ExamValidator } from '../validation/examValidator.ts';

export class ExamPlanner {
  constructor(private examValidator: ExamValidator = defaultExamValidator) {}

  /**
   * Generates a deterministic ExamExecutionPlan.
   * Does NOT mutate the input Exam or QuestionVersion objects.
   */
  createExecutionPlan(
    exam: Exam,
    versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>,
    attemptSeed: string,
    questions?: Map<string, Question> | Record<string, Question>
  ): ExamExecutionPlan {
    const vMap = versions instanceof Map ? versions : new Map(Object.entries(versions));
    const qMap = questions instanceof Map
      ? questions
      : (questions ? new Map(Object.entries(questions)) : undefined);

    // 1. Validate exam structure
    if (qMap) {
      this.examValidator.validate(exam, { questions: qMap, versions: vMap });
    } else {
      this.examValidator.validate(exam);
    }

    // 2. Initialize PRNG for deterministic permutation
    const rng = createDeterministicRng(attemptSeed);

    // 3. Process sections
    const planSections: PlanSection[] = [];

    for (const section of exam.sections) {
      let qRefs = [...section.questions];

      // Shuffle questions if policy enables it
      if (exam.policy?.shuffleQuestions) {
        qRefs = deterministicShuffle(qRefs, rng);
      }

      const planQuestions: PlanQuestion[] = [];

      for (let idx = 0; idx < qRefs.length; idx++) {
        const qRef = qRefs[idx];
        const version = vMap.get(qRef.questionVersionId);
        if (!version) {
          throw EduSpaceError.validationError(
            `QuestionVersion '${qRef.questionVersionId}' missing for question '${qRef.questionId}'`
          );
        }

        // Deep clone contentPayload so shuffling options doesn't mutate source version
        const contentPayloadClone = JSON.parse(JSON.stringify(version.content.payload || {}));

        // Shuffle options if permitted by policy and question type
        if (
          exam.policy?.shuffleOptions &&
          (section.questionType === 'single_choice' || section.questionType === 'multiple_choice' ||
           Array.isArray(contentPayloadClone.options))
        ) {
          if (Array.isArray(contentPayloadClone.options) && contentPayloadClone.shuffleOptions !== false) {
            contentPayloadClone.options = deterministicShuffle(contentPayloadClone.options, rng);
          }
        }

        // Student-facing PlanQuestion: NO gradingConfig!
        const planQ: PlanQuestion = {
          questionId: qRef.questionId,
          questionVersionId: qRef.questionVersionId, // Pinned immutable version ID
          type: section.questionType,
          prompt: version.content.prompt,
          mediaAssets: version.content.mediaAssets
            ? JSON.parse(JSON.stringify(version.content.mediaAssets))
            : undefined,
          contentPayload: contentPayloadClone,
          allocatedPoints: qRef.allocatedPoints,
          orderIndex: idx,
          sectionId: section.id
        };

        planQuestions.push(planQ);
      }

      planSections.push({
        id: section.id,
        title: section.title,
        description: section.description,
        sectionOrder: section.sectionOrder,
        questionType: section.questionType,
        questions: planQuestions
      });
    }

    return {
      examId: exam.id,
      attemptSeed,
      title: exam.title,
      description: exam.description,
      subjectId: exam.subjectId,
      grade: exam.grade,
      durationMinutes: exam.durationMinutes,
      totalPoints: exam.totalPoints,
      sections: planSections,
      policy: JSON.parse(JSON.stringify(exam.policy || {})),
      generatedAt: new Date().toISOString()
    };
  }
}

export const defaultExamPlanner = new ExamPlanner();
