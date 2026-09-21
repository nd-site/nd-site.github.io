/**
 * EduSpace V3 Exam Engine - Question Validator
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Validates individual question and version definitions before exam execution.
 */

import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { Question, QuestionVersion } from '../../core/domain/question.ts';
import { defaultQuestionRegistry, QuestionRegistry } from '../registry/questionRegistry.ts';

export class QuestionValidator {
  constructor(private registry: QuestionRegistry = defaultQuestionRegistry) {}

  /**
   * Validates Question and its active QuestionVersion.
   * Throws EduSpaceError(VALIDATION_ERROR) on invalid input.
   */
  validate(question: Question, version: QuestionVersion): void {
    if (!question || typeof question !== 'object') {
      throw EduSpaceError.validationError('Question must be a non-null object');
    }
    if (!question.id) {
      throw EduSpaceError.validationError('Question must have an id');
    }
    if (!question.type) {
      throw EduSpaceError.validationError(`Question '${question.id}' is missing type`);
    }

    if (!version || typeof version !== 'object') {
      throw EduSpaceError.validationError(`Missing QuestionVersion for question '${question.id}'`);
    }
    if (version.questionId !== question.id) {
      throw EduSpaceError.validationError(
        `Version questionId '${version.questionId}' does not match question id '${question.id}'`
      );
    }

    const prompt = version.content?.prompt?.trim();
    if (!prompt) {
      throw EduSpaceError.validationError(`Question '${question.id}' content.prompt cannot be empty`);
    }

    // Delegate type-specific validation to the registered plugin
    const plugin = this.registry.get(question.type);
    plugin.validateDefinition(version.content?.payload, version.gradingConfig);
  }
}

export const defaultQuestionValidator = new QuestionValidator();
