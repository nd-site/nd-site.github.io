/**
 * EduSpace V3 Assessment Sanitizer
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-api-contract.md
 * 
 * Guarantees 100% answer key isolation:
 * - Strips all grading configs, answer keys, explanations, and rubric criteria.
 * - Produces immutable student-facing exam representation.
 */

import type { ExamExecutionPlan, PlanQuestion } from '../engine/types.ts';
import type { SanitizedExam, SanitizedPlanQuestion, SanitizedPlanSection } from './types.ts';

// Forbidden answer-key keys that must never appear in student payloads
const FORBIDDEN_KEYS = new Set([
  'correctOptionId',
  'correctOptionIds',
  'correctAnswers',
  'acceptableAnswers',
  'exactValue',
  'tolerance',
  'correctPairs',
  'correctOrderIds',
  'rubricCriteria',
  'explanation',
  'gradingConfig',
  'scoringMethod',
  'partialScoreLadder'
]);

/**
 * Deeply scans an object and deletes any forbidden grading/answer key property.
 */
function removeForbiddenKeys(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeForbiddenKeys);
  }
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!FORBIDDEN_KEYS.has(k)) {
      clean[k] = removeForbiddenKeys(v);
    }
  }
  return clean;
}

/**
 * Sanitizes a single plan question for student presentation.
 */
export function sanitizePlanQuestion(q: PlanQuestion): SanitizedPlanQuestion {
  const sanitized: SanitizedPlanQuestion = {
    questionId: q.questionId,
    questionVersionId: q.questionVersionId,
    prompt: q.prompt,
    type: q.type,
    allocatedPoints: q.allocatedPoints,
    orderIndex: q.orderIndex
  };

  if (q.mediaAssets && q.mediaAssets.length > 0) {
    sanitized.mediaAssets = JSON.parse(JSON.stringify(q.mediaAssets));
  }
  if (q.blocks && q.blocks.length > 0) {
    sanitized.blocks = removeForbiddenKeys(JSON.parse(JSON.stringify(q.blocks)));
  }
  if (q.sourceSetId) sanitized.sourceSetId = q.sourceSetId;
  if (q.groupId) sanitized.groupId = q.groupId;
  if (q.choiceGroupId) sanitized.choiceGroupId = q.choiceGroupId;

  if (Array.isArray(q.parts) && q.parts.length > 0) {
    sanitized.parts = q.parts.map(p => ({
      partId: p.partId,
      label: p.label,
      prompt: p.prompt,
      type: p.type,
      allocatedPoints: p.allocatedPoints,
      blocks: p.blocks ? removeForbiddenKeys(JSON.parse(JSON.stringify(p.blocks))) : undefined,
      contentPayload: removeForbiddenKeys(JSON.parse(JSON.stringify(p.contentPayload || {})))
    }));
  }

  const payload = q.contentPayload ? JSON.parse(JSON.stringify(q.contentPayload)) : {};

  // Extract type-specific presentation properties without leaking answer keys
  switch (q.type) {
    case 'single_choice':
    case 'multiple_choice':
      if (Array.isArray(payload.options)) {
        sanitized.options = payload.options.map((opt: any) => ({
          id: String(opt.id),
          text: String(opt.text),
          ...(opt.mediaAsset ? { mediaAsset: opt.mediaAsset } : {})
        }));
      }
      break;

    case 'true_false':
      if (Array.isArray(payload.items)) {
        sanitized.items = payload.items.map((item: any) => ({
          id: String(item.id),
          text: String(item.text)
        }));
      }
      break;

    case 'matching':
      if (Array.isArray(payload.leftColumn)) {
        (sanitized as any).leftColumn = payload.leftColumn.map((item: any) => ({
          id: String(item.id),
          text: String(item.text)
        }));
      }
      if (Array.isArray(payload.rightColumn)) {
        (sanitized as any).rightColumn = payload.rightColumn.map((item: any) => ({
          id: String(item.id),
          text: String(item.text)
        }));
      }
      break;

    case 'ordering':
      if (Array.isArray(payload.items)) {
        sanitized.items = payload.items.map((item: any) => ({
          id: String(item.id),
          text: String(item.text)
        }));
      }
      break;

    case 'fill_blank':
      if (payload.template) {
        sanitized.template = String(payload.template);
      }
      break;

    case 'short_answer':
    case 'numeric':
      if (payload.placeholder) {
        (sanitized as any).placeholder = String(payload.placeholder);
      }
      if (payload.unitLabel) {
        (sanitized as any).unitLabel = String(payload.unitLabel);
      }
      break;

    case 'essay':
      if (payload.minWords) (sanitized as any).minWords = payload.minWords;
      if (payload.maxWords) (sanitized as any).maxWords = payload.maxWords;
      if (payload.attachmentAllowed !== undefined) {
        (sanitized as any).attachmentAllowed = payload.attachmentAllowed;
      }
      break;
  }

  // Safety net: perform recursive check for any remaining forbidden keys
  return removeForbiddenKeys(sanitized) as SanitizedPlanQuestion;
}

/**
 * Sanitizes an entire ExamExecutionPlan for student delivery.
 */
export function sanitizeExecutionPlan(plan: ExamExecutionPlan): SanitizedExam {
  const sections: SanitizedPlanSection[] = plan.sections.map(section => ({
    id: section.id,
    title: section.title,
    sourceSetIds: section.sourceSetIds ? [...section.sourceSetIds] : undefined,
    choiceGroups: section.choiceGroups ? removeForbiddenKeys(JSON.parse(JSON.stringify(section.choiceGroups))) : undefined,
    required: section.required,
    questions: section.questions.map(q => sanitizePlanQuestion(q))
  }));

  return {
    id: plan.examId,
    title: plan.title,
    durationMinutes: plan.durationMinutes,
    totalPoints: plan.totalPoints,
    mode: plan.mode,
    sourceSets: plan.sourceSets ? removeForbiddenKeys(JSON.parse(JSON.stringify(plan.sourceSets))) : undefined,
    questionGroups: plan.questionGroups ? removeForbiddenKeys(JSON.parse(JSON.stringify(plan.questionGroups))) : undefined,
    choiceGroups: plan.choiceGroups ? removeForbiddenKeys(JSON.parse(JSON.stringify(plan.choiceGroups))) : undefined,
    sections
  };
}
