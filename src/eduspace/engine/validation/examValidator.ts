/**
 * EduSpace V3 Exam Engine - Exam Validator
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-architecture.md
 * 
 * Validates the complete structure, sections, questions, and points of an Exam
 * before it can be used to generate an execution plan or session.
 */

import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { Exam } from '../../core/domain/exam.ts';
import type { Question, QuestionVersion } from '../../core/domain/question.ts';
import { defaultQuestionValidator, QuestionValidator } from './questionValidator.ts';

export interface ResolvedQuestionsContext {
  questions: Map<string, Question> | Record<string, Question>;
  versions: Map<string, QuestionVersion> | Record<string, QuestionVersion>;
}

export class ExamValidator {
  constructor(private questionValidator: QuestionValidator = defaultQuestionValidator) {}

  /**
   * Validates the exam and its referenced questions and versions.
   */
  validate(exam: Exam, context?: ResolvedQuestionsContext): void {
    if (!exam || typeof exam !== 'object') {
      throw EduSpaceError.validationError('Exam must be a non-null object');
    }
    if (!exam.id || !exam.title?.trim()) {
      throw EduSpaceError.validationError('Exam must define a valid id and non-empty title');
    }
    if (exam.status === 'archived') {
      throw EduSpaceError.validationError(`Cannot execute archived exam '${exam.id}'`);
    }
    if (typeof exam.durationMinutes !== 'number' || exam.durationMinutes <= 0) {
      throw EduSpaceError.validationError(`Exam '${exam.id}' durationMinutes must be a positive number`);
    }
    if (typeof exam.totalPoints !== 'number' || exam.totalPoints <= 0) {
      throw EduSpaceError.validationError(`Exam '${exam.id}' totalPoints must be a positive number`);
    }
    if (!Array.isArray(exam.sections) || exam.sections.length === 0) {
      throw EduSpaceError.validationError(`Exam '${exam.id}' must have at least one section`);
    }

    let calculatedSumPoints = 0;
    const seenQuestionIds = new Set<string>();

    for (const section of exam.sections) {
      if (!section.id || !section.title?.trim()) {
        throw EduSpaceError.validationError(`Exam '${exam.id}' contains a section without id or title`);
      }
      if (!Array.isArray(section.questions) || section.questions.length === 0) {
        throw EduSpaceError.validationError(
          `Exam '${exam.id}' section '${section.id}' has no questions`
        );
      }

      for (const qRef of section.questions) {
        if (!qRef.questionId || !qRef.questionVersionId) {
          throw EduSpaceError.validationError(
            `Section '${section.id}' has a question reference missing questionId or questionVersionId`
          );
        }
        if (typeof qRef.allocatedPoints !== 'number' || qRef.allocatedPoints <= 0) {
          throw EduSpaceError.validationError(
            `Question '${qRef.questionId}' in section '${section.id}' must have positive allocatedPoints`
          );
        }

        if (seenQuestionIds.has(qRef.questionId)) {
          throw EduSpaceError.validationError(
            `Duplicate question '${qRef.questionId}' found in exam '${exam.id}'`
          );
        }
        seenQuestionIds.add(qRef.questionId);
        calculatedSumPoints += qRef.allocatedPoints;

        // If context provided, validate the resolved question and version
        if (context) {
          const qMap = context.questions instanceof Map
            ? context.questions
            : new Map(Object.entries(context.questions));
          const vMap = context.versions instanceof Map
            ? context.versions
            : new Map(Object.entries(context.versions));

          const question = qMap.get(qRef.questionId);
          if (!question) {
            throw EduSpaceError.validationError(
              `Referenced question '${qRef.questionId}' was not found in resolved questions`
            );
          }

          const version = vMap.get(qRef.questionVersionId);
          if (!version) {
            throw EduSpaceError.validationError(
              `Referenced version '${qRef.questionVersionId}' was not found for question '${qRef.questionId}'`
            );
          }

          // Section question type restriction check
          if (section.questionType && question.type !== section.questionType) {
            throw EduSpaceError.validationError(
              `Question '${qRef.questionId}' type '${question.type}' does not match section '${section.id}' type restriction '${section.questionType}'`
            );
          }

          this.questionValidator.validate(question, version);
        }
      }
    }

    // Points sum validation (with standard float epsilon 0.01)
    if (Math.abs(calculatedSumPoints - exam.totalPoints) > 0.01) {
      throw EduSpaceError.validationError(
        `Sum of question allocatedPoints (${calculatedSumPoints.toFixed(2)}) does not match exam totalPoints (${exam.totalPoints.toFixed(2)})`
      );
    }
  }
}

export const defaultExamValidator = new ExamValidator();
