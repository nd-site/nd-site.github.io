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

    // 2. Build fast lookup for question choiceGroupId from choiceGroups
    const choiceGroupMap = new Map<string, string>();
    if (Array.isArray(exam.choiceGroups)) {
      for (const cg of exam.choiceGroups) {
        for (const qid of cg.questionIds || []) {
          choiceGroupMap.set(qid, cg.id);
        }
      }
    }
    for (const sec of exam.sections) {
      if (Array.isArray(sec.choiceGroups)) {
        for (const cg of sec.choiceGroups) {
          for (const qid of cg.questionIds || []) {
            choiceGroupMap.set(qid, cg.id);
          }
        }
      }
    }

    // 3. Initialize PRNG for deterministic permutation
    const rng = createDeterministicRng(attemptSeed);

    // A structured exam keeps its complete candidate bank in `sections`, then
    // uses the blueprint to choose the executable subset for this attempt.
    // This is also how legacy V2 `examStructure` matrices are represented by
    // the compatibility adapter.  Selection is deterministic for a session's
    // attempt seed, so resume and grading always see the same pinned refs.
    const blueprintSections = new Map(
      exam.mode === 'structured' && Array.isArray(exam.blueprint?.sections)
        ? exam.blueprint.sections.map(blueprintSection => [blueprintSection.id, blueprintSection])
        : []
    );

    // 4. Process sections
    const planSections: PlanSection[] = [];

    for (const section of exam.sections) {
      let qRefs = [...section.questions];

      const blueprintSection = blueprintSections.get(section.id);
      const requestedCount = blueprintSection?.questionSelection?.count;
      if (typeof requestedCount === 'number' && Number.isFinite(requestedCount)) {
        const count = Math.max(0, Math.min(qRefs.length, Math.floor(requestedCount)));
        if (count === 0) {
          // A matrix may intentionally omit a question type.  Do not emit an
          // empty section into the student plan or session references.
          continue;
        }
        if (count < qRefs.length) {
          const strategy = blueprintSection.questionSelection.strategy || 'random';
          qRefs = strategy === 'fixed'
            ? qRefs.slice(0, count)
            : deterministicShuffle(qRefs, rng).slice(0, count);
        }
      }

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

        // Determine question type (support multi_part if parts exist)
        let resolvedType = section.questionType;
        if (Array.isArray(version.content.parts) && version.content.parts.length > 0) {
          resolvedType = 'multi_part' as any;
        } else if (qMap && qMap.has(qRef.questionId)) {
          resolvedType = qMap.get(qRef.questionId)!.type;
        }

        const choiceGroupId = qRef.choiceGroupId || choiceGroupMap.get(qRef.questionId);

        // Student-facing PlanQuestion: NO gradingConfig!
        const planQ: PlanQuestion = {
          questionId: qRef.questionId,
          questionVersionId: qRef.questionVersionId, // Pinned immutable version ID
          type: resolvedType,
          prompt: version.content.prompt,
          mediaAssets: version.content.mediaAssets
            ? JSON.parse(JSON.stringify(version.content.mediaAssets))
            : undefined,
          blocks: version.content.blocks
            ? JSON.parse(JSON.stringify(version.content.blocks))
            : undefined,
          sourceSetId: version.content.sourceSetId || qRef.sourceSetId || (qMap ? qMap.get(qRef.questionId)?.sourceSetId : undefined),
          groupId: version.content.groupId || qRef.groupId || (qMap ? qMap.get(qRef.questionId)?.groupId : undefined),
          choiceGroupId,
          parts: version.content.parts
            ? JSON.parse(JSON.stringify(version.content.parts))
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
        sourceSetIds: section.sourceSetIds ? [...section.sourceSetIds] : undefined,
        choiceGroups: section.choiceGroups ? JSON.parse(JSON.stringify(section.choiceGroups)) : undefined,
        required: section.required,
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
      mode: exam.mode || 'full',
      sections: planSections,
      sourceSets: exam.sourceSets ? JSON.parse(JSON.stringify(exam.sourceSets)) : undefined,
      questionGroups: exam.questionGroups ? JSON.parse(JSON.stringify(exam.questionGroups)) : undefined,
      choiceGroups: exam.choiceGroups ? JSON.parse(JSON.stringify(exam.choiceGroups)) : undefined,
      questionPools: exam.questionPools ? JSON.parse(JSON.stringify(exam.questionPools)) : undefined,
      blueprint: exam.blueprint ? JSON.parse(JSON.stringify(exam.blueprint)) : undefined,
      policy: JSON.parse(JSON.stringify(exam.policy || {})),
      generatedAt: new Date().toISOString()
    };
  }
}

export const defaultExamPlanner = new ExamPlanner();
