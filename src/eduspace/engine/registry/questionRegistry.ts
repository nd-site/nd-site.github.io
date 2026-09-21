/**
 * EduSpace V3 Exam Engine - Question Type Registry & Plugins
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Modular, plugin-style registry for all 9 canonical question types.
 * Encapsulates validation, response parsing, and score evaluation.
 * STRICT: No large if/else ladders; all type behavior lives in its plugin.
 */

import type { QuestionType } from '../../core/constants/index.ts';
import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { QuestionEvaluation, QuestionTypeDefinition } from '../types.ts';

// ----------------------------------------------------------------------
// 1. Single Choice Plugin
// ----------------------------------------------------------------------
export const singleChoicePlugin: QuestionTypeDefinition = {
  type: 'single_choice',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    if (!content || !Array.isArray(content.options) || content.options.length < 2) {
      throw EduSpaceError.validationError('Single Choice question must have at least 2 options');
    }
    const optionIds = new Set(content.options.map((o: any) => o.id));
    if (optionIds.size !== content.options.length) {
      throw EduSpaceError.validationError('Single Choice options must have unique IDs');
    }
    const correctId = gradingConfig?.payload?.correctOptionId;
    if (!correctId || !optionIds.has(correctId)) {
      throw EduSpaceError.validationError(`Single Choice correctOptionId '${correctId}' does not exist in options`);
    }
  },

  validateResponse(response: any): void {
    if (response === undefined || response === null) {
      throw EduSpaceError.validationError('Student response cannot be empty');
    }
    const selected = typeof response === 'object' ? response.selectedOptionId : response;
    if (typeof selected !== 'string') {
      throw EduSpaceError.validationError('Single Choice response must specify selectedOptionId as string');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const selected = typeof response === 'object' ? response.selectedOptionId : response;
    const correct = gradingConfig?.payload?.correctOptionId || gradingConfig?.correctOptionId;
    const isCorrect = selected === correct;
    return {
      maxPoints: allocatedPoints,
      awardedPoints: isCorrect ? allocatedPoints : 0,
      isCorrect,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 2. Multiple Choice Plugin
// ----------------------------------------------------------------------
export const multipleChoicePlugin: QuestionTypeDefinition = {
  type: 'multiple_choice',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    if (!content || !Array.isArray(content.options) || content.options.length < 2) {
      throw EduSpaceError.validationError('Multiple Choice question must have at least 2 options');
    }
    const optionIds = new Set(content.options.map((o: any) => o.id));
    const correctIds = gradingConfig?.payload?.correctOptionIds;
    if (!Array.isArray(correctIds) || correctIds.length === 0) {
      throw EduSpaceError.validationError('Multiple Choice must define at least one correctOptionId');
    }
    for (const cid of correctIds) {
      if (!optionIds.has(cid)) {
        throw EduSpaceError.validationError(`Multiple Choice correctOptionId '${cid}' does not exist in options`);
      }
    }
  },

  validateResponse(response: any): void {
    const selected = Array.isArray(response)
      ? response
      : (Array.isArray(response?.selectedOptionIds) ? response.selectedOptionIds : null);
    if (!selected) {
      throw EduSpaceError.validationError('Multiple Choice response must provide selectedOptionIds array');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const selected: string[] = Array.isArray(response)
      ? response
      : (Array.isArray(response?.selectedOptionIds) ? response.selectedOptionIds : []);
    const correct: string[] = gradingConfig?.payload?.correctOptionIds || gradingConfig?.correctOptionIds || [];
    const partial = !!(gradingConfig?.payload?.partialScoring ?? gradingConfig?.partialScoring);

    const selectedSet = new Set(selected);
    const correctSet = new Set(correct);

    let isExact = selected.length === correct.length && correct.every(c => selectedSet.has(c));

    if (!partial) {
      return {
        maxPoints: allocatedPoints,
        awardedPoints: isExact ? allocatedPoints : 0,
        isCorrect: isExact,
        explanation: gradingConfig?.explanation,
        gradingMethod: 'automatic'
      };
    }

    // Partial scoring: correct picks minus incorrect picks
    let correctCount = 0;
    let incorrectCount = 0;
    for (const s of selected) {
      if (correctSet.has(s)) correctCount++;
      else incorrectCount++;
    }

    const netScore = Math.max(0, (correctCount - incorrectCount) / correct.length);
    const awardedPoints = Number((netScore * allocatedPoints).toFixed(3));

    return {
      maxPoints: allocatedPoints,
      awardedPoints,
      isCorrect: isExact,
      partialBreakdown: { correctCount, incorrectCount },
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 3. True / False (GDPT 2018 4-item ladder: [0.1, 0.25, 0.5, 1.0])
// ----------------------------------------------------------------------
export const trueFalsePlugin: QuestionTypeDefinition = {
  type: 'true_false',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    if (!content || !Array.isArray(content.items) || content.items.length === 0) {
      throw EduSpaceError.validationError('True/False question must define items array');
    }
    const correctMap = gradingConfig?.payload?.correctAnswers || gradingConfig?.correctAnswers;
    if (!correctMap || typeof correctMap !== 'object') {
      throw EduSpaceError.validationError('True/False question must define correctAnswers map');
    }
    for (const item of content.items) {
      if (typeof correctMap[item.id] !== 'boolean') {
        throw EduSpaceError.validationError(`True/False item '${item.id}' missing boolean correct answer`);
      }
    }
  },

  validateResponse(response: any): void {
    const map = response?.answers || response?.tfAnswers || response;
    if (!map || typeof map !== 'object') {
      throw EduSpaceError.validationError('True/False response must provide answers map');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const studentMap: Record<string, boolean> = response?.answers || response?.tfAnswers || response || {};
    const correctMap: Record<string, boolean> = gradingConfig?.payload?.correctAnswers || gradingConfig?.correctAnswers || {};
    const items: Array<{ id: string }> = content?.items || [];
    const ladder: number[] = gradingConfig?.payload?.partialScoreLadder || gradingConfig?.partialScoreLadder || [0.1, 0.25, 0.5, 1.0];

    const breakdown: Record<string, number> = {};
    let correctCount = 0;

    for (const item of items) {
      const isCorrect = studentMap[item.id] === correctMap[item.id];
      if (isCorrect) correctCount++;
      breakdown[item.id] = isCorrect ? 1 : 0;
    }

    let awardedPoints = 0;
    if (correctCount > 0) {
      const ladderIndex = Math.min(correctCount - 1, ladder.length - 1);
      const ladderMultiplier = ladder[ladderIndex] ?? 0;
      // Normalizes against 1.0 max point standard of GDPT 2018
      awardedPoints = Number((ladderMultiplier * (allocatedPoints / 1.0)).toFixed(3));
    }

    const isAllCorrect = correctCount === items.length;

    return {
      maxPoints: allocatedPoints,
      awardedPoints,
      isCorrect: isAllCorrect,
      partialBreakdown: breakdown,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 4. Short Answer Plugin
// ----------------------------------------------------------------------
export const shortAnswerPlugin: QuestionTypeDefinition = {
  type: 'short_answer',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    const acceptable = gradingConfig?.payload?.acceptableAnswers;
    if (!Array.isArray(acceptable) || acceptable.length === 0) {
      throw EduSpaceError.validationError('Short Answer must define at least one acceptable answer');
    }
  },

  validateResponse(response: any): void {
    const text = typeof response === 'object' ? response.text : response;
    if (typeof text !== 'string') {
      throw EduSpaceError.validationError('Short Answer response must be a string');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    let studentText = typeof response === 'object' ? String(response.text ?? '') : String(response ?? '');
    const acceptable: string[] = gradingConfig?.payload?.acceptableAnswers || [];
    const caseSensitive = !!gradingConfig?.payload?.caseSensitive;
    const trimWhitespace = gradingConfig?.payload?.trimWhitespace !== false;

    if (trimWhitespace) studentText = studentText.trim();
    if (!caseSensitive) studentText = studentText.toLowerCase();

    const isMatch = acceptable.some(ans => {
      let target = String(ans);
      if (trimWhitespace) target = target.trim();
      if (!caseSensitive) target = target.toLowerCase();
      return target === studentText;
    });

    return {
      maxPoints: allocatedPoints,
      awardedPoints: isMatch ? allocatedPoints : 0,
      isCorrect: isMatch,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 5. Numeric Plugin
// ----------------------------------------------------------------------
export const numericPlugin: QuestionTypeDefinition = {
  type: 'numeric',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    const exact = gradingConfig?.payload?.exactValue;
    if (typeof exact !== 'number' || isNaN(exact)) {
      throw EduSpaceError.validationError('Numeric question must define a numeric exactValue');
    }
  },

  validateResponse(response: any): void {
    const val = typeof response === 'object' ? response.value : response;
    if (val === undefined || val === null || val === '') {
      throw EduSpaceError.validationError('Numeric response cannot be empty');
    }
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    if (isNaN(num)) {
      throw EduSpaceError.validationError('Numeric response must be a valid number');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const rawVal = typeof response === 'object' ? response.value : response;
    const submittedNum = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal || '').replace(',', '.'));
    const exactValue = Number(gradingConfig?.payload?.exactValue ?? 0);
    const tolerance = Number(gradingConfig?.payload?.tolerance ?? 0);

    const isCorrect = !isNaN(submittedNum) && Math.abs(submittedNum - exactValue) <= tolerance;

    return {
      maxPoints: allocatedPoints,
      awardedPoints: isCorrect ? allocatedPoints : 0,
      isCorrect,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 6. Essay Plugin (Subjective / Manual / AI-Assisted)
// ----------------------------------------------------------------------
export const essayPlugin: QuestionTypeDefinition = {
  type: 'essay',
  defaultGradingMethod: 'manual',
  supportsAutomaticGrading: false,

  validateDefinition(content: any, gradingConfig: any): void {
    // Essays can define minWords, rubricCriteria
  },

  validateResponse(response: any): void {
    const text = typeof response === 'object' ? response.text : response;
    if (typeof text !== 'string') {
      throw EduSpaceError.validationError('Essay response must be a text string');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    // Essay cannot be automatically finalized without review
    return {
      maxPoints: allocatedPoints,
      awardedPoints: 0,
      isCorrect: false,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'manual',
      needsManualReview: true
    };
  }
};

// ----------------------------------------------------------------------
// 7. Matching Plugin
// ----------------------------------------------------------------------
export const matchingPlugin: QuestionTypeDefinition = {
  type: 'matching',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    if (!content || !Array.isArray(content.leftItems) || !Array.isArray(content.rightItems)) {
      throw EduSpaceError.validationError('Matching question must define leftItems and rightItems');
    }
    const pairs = gradingConfig?.payload?.pairs;
    if (!pairs || typeof pairs !== 'object') {
      throw EduSpaceError.validationError('Matching question must define pairs mapping');
    }
  },

  validateResponse(response: any): void {
    const pairs = response?.pairs || response;
    if (!pairs || typeof pairs !== 'object') {
      throw EduSpaceError.validationError('Matching response must provide pairs map');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const studentPairs: Record<string, string> = response?.pairs || response || {};
    const correctPairs: Record<string, string> = gradingConfig?.payload?.pairs || {};
    const leftItems: Array<{ id: string }> = content?.leftItems || [];

    let correctMatches = 0;
    const breakdown: Record<string, number> = {};

    for (const left of leftItems) {
      const isMatch = studentPairs[left.id] === correctPairs[left.id];
      if (isMatch) correctMatches++;
      breakdown[left.id] = isMatch ? 1 : 0;
    }

    const totalCount = Math.max(1, leftItems.length);
    const scoreFraction = correctMatches / totalCount;
    const awardedPoints = Number((scoreFraction * allocatedPoints).toFixed(3));
    const isAllCorrect = correctMatches === totalCount;

    return {
      maxPoints: allocatedPoints,
      awardedPoints,
      isCorrect: isAllCorrect,
      partialBreakdown: breakdown,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 8. Ordering Plugin
// ----------------------------------------------------------------------
export const orderingPlugin: QuestionTypeDefinition = {
  type: 'ordering',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    if (!content || !Array.isArray(content.items) || content.items.length < 2) {
      throw EduSpaceError.validationError('Ordering question must have at least 2 items');
    }
    const correctOrder = gradingConfig?.payload?.correctOrder;
    if (!Array.isArray(correctOrder) || correctOrder.length !== content.items.length) {
      throw EduSpaceError.validationError('Ordering question must define correctOrder matching items length');
    }
  },

  validateResponse(response: any): void {
    const order = Array.isArray(response) ? response : response?.orderedIds;
    if (!Array.isArray(order)) {
      throw EduSpaceError.validationError('Ordering response must provide orderedIds array');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const studentOrder: string[] = Array.isArray(response) ? response : (response?.orderedIds || []);
    const correctOrder: string[] = gradingConfig?.payload?.correctOrder || [];

    const isMatch = studentOrder.length === correctOrder.length &&
      correctOrder.every((id, idx) => studentOrder[idx] === id);

    return {
      maxPoints: allocatedPoints,
      awardedPoints: isMatch ? allocatedPoints : 0,
      isCorrect: isMatch,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// 9. Fill Blank Plugin
// ----------------------------------------------------------------------
export const fillBlankPlugin: QuestionTypeDefinition = {
  type: 'fill_blank',
  defaultGradingMethod: 'automatic',
  supportsAutomaticGrading: true,

  validateDefinition(content: any, gradingConfig: any): void {
    const acceptable = gradingConfig?.payload?.acceptableBlanks;
    if (!acceptable || typeof acceptable !== 'object') {
      throw EduSpaceError.validationError('Fill Blank question must define acceptableBlanks map');
    }
  },

  validateResponse(response: any): void {
    const blanks = response?.blanks || response;
    if (!blanks || typeof blanks !== 'object') {
      throw EduSpaceError.validationError('Fill Blank response must provide blanks map');
    }
  },

  evaluate(response: any, content: any, gradingConfig: any, allocatedPoints: number): QuestionEvaluation {
    const studentBlanks: Record<string, string> = response?.blanks || response || {};
    const acceptable: Record<string, string[]> = gradingConfig?.payload?.acceptableBlanks || {};
    const blankKeys = Object.keys(acceptable);

    let correctCount = 0;
    const breakdown: Record<string, number> = {};

    for (const key of blankKeys) {
      const allowed = acceptable[key] || [];
      const submitted = String(studentBlanks[key] || '').trim().toLowerCase();
      const isMatch = allowed.some(a => String(a).trim().toLowerCase() === submitted);
      if (isMatch) correctCount++;
      breakdown[key] = isMatch ? 1 : 0;
    }

    const total = Math.max(1, blankKeys.length);
    const awardedPoints = Number(((correctCount / total) * allocatedPoints).toFixed(3));
    const isAllCorrect = correctCount === total;

    return {
      maxPoints: allocatedPoints,
      awardedPoints,
      isCorrect: isAllCorrect,
      partialBreakdown: breakdown,
      explanation: gradingConfig?.explanation,
      gradingMethod: 'automatic'
    };
  }
};

// ----------------------------------------------------------------------
// Question Registry Manager
// ----------------------------------------------------------------------
export class QuestionRegistry {
  private plugins = new Map<QuestionType, QuestionTypeDefinition>();

  constructor() {
    this.register(singleChoicePlugin);
    this.register(multipleChoicePlugin);
    this.register(trueFalsePlugin);
    this.register(shortAnswerPlugin);
    this.register(numericPlugin);
    this.register(essayPlugin);
    this.register(matchingPlugin);
    this.register(orderingPlugin);
    this.register(fillBlankPlugin);
  }

  register(plugin: QuestionTypeDefinition): void {
    this.plugins.set(plugin.type, plugin);
  }

  get(type: QuestionType): QuestionTypeDefinition {
    const plugin = this.plugins.get(type);
    if (!plugin) {
      throw EduSpaceError.validationError(`Unsupported question type: '${type}'`);
    }
    return plugin;
  }

  has(type: QuestionType): boolean {
    return this.plugins.has(type);
  }

  getSupportedTypes(): QuestionType[] {
    return Array.from(this.plugins.keys());
  }
}

// Global default instance
export const defaultQuestionRegistry = new QuestionRegistry();
