/**
 * EduSpace V3 Exam Engine - Engine Core Types
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Defines framework-independent assessment execution structures.
 * Strictly separates student-visible presentation from server-authoritative grading.
 */

import type { GradingMethod, QuestionType } from '../core/constants/index.ts';
import type { ExamPolicy } from '../core/domain/exam.ts';
import type { QuestionContentPayload } from '../core/domain/question.ts';
import type { SubmittedAnswerItem } from '../core/domain/session.ts';

// ----------------------------------------------------------------------
// 1. Session State Machine Types
// ----------------------------------------------------------------------
export type SessionState =
  | 'created'
  | 'in_progress'
  | 'submitted'
  | 'grading'
  | 'graded'
  | 'expired'
  | 'cancelled';

// ----------------------------------------------------------------------
// 2. Immutable Execution Plan Types (Student-Facing / Runner Definition)
// ----------------------------------------------------------------------

/**
 * Single executable question in the plan.
 * Answer keys (gradingConfig) are strictly excluded.
 */
export interface PlanQuestion {
  questionId: string;
  questionVersionId: string;
  type: QuestionType;
  prompt: string;
  mediaAssets?: Array<{ type: 'image' | 'audio' | 'video'; url: string; caption?: string }>;
  contentPayload: QuestionContentPayload;
  allocatedPoints: number;
  orderIndex: number;
  sectionId: string;
}

export interface PlanSection {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  questionType: QuestionType;
  questions: PlanQuestion[];
}

export interface ExamExecutionPlan {
  examId: string;
  attemptSeed: string;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  durationMinutes: number;
  totalPoints: number;
  sections: PlanSection[];
  policy: ExamPolicy;
  generatedAt: string;
}

// ----------------------------------------------------------------------
// 3. Question Plugin Registry Definition
// ----------------------------------------------------------------------

export interface QuestionTypeDefinition<
  TContent = any,
  TGrading = any,
  TResponse = any
> {
  readonly type: QuestionType;
  readonly defaultGradingMethod: GradingMethod;
  readonly supportsAutomaticGrading: boolean;

  /**
   * Validates authoring content and grading configuration.
   */
  validateDefinition(content: TContent, gradingConfig: TGrading): void;

  /**
   * Validates a student's submitted response.
   */
  validateResponse(response: TResponse, content: TContent): void;

  /**
   * Calculates awarded points and correction breakdown.
   */
  evaluate(
    response: TResponse,
    content: TContent,
    gradingConfig: TGrading,
    allocatedPoints: number
  ): QuestionEvaluation;
}

export interface QuestionEvaluation {
  maxPoints: number;
  awardedPoints: number;
  isCorrect: boolean;
  partialBreakdown?: Record<string, number>;
  explanation?: string;
  gradingMethod: GradingMethod;
  needsManualReview?: boolean;
}

// ----------------------------------------------------------------------
// 4. Grading Capability Descriptor
// ----------------------------------------------------------------------

export interface GradingCapabilityDescriptor {
  method: GradingMethod;
  canFinalizeOfficialScore: boolean;
  requiresTeacherReview: boolean;
  description: string;
}

// ----------------------------------------------------------------------
// 5. Submission & Autosave Envelopes
// ----------------------------------------------------------------------

export interface AutosaveEnvelope {
  sessionId: string;
  answerVersion: number;
  answersPayload: Record<string, any>;
  savedAt: string;
}

export interface SubmissionValidationResult {
  isValid: boolean;
  sanitizedAnswers: SubmittedAnswerItem[];
  warnings?: string[];
}
