/**
 * EduSpace V3 - Exam & ExamBlueprint Domain Models
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import type { ExamType, ExamVisibility, ModerationStatus, QuestionType } from '../constants/index.ts';

export interface BlueprintSectionSpecification {
  id: string;
  title: string;
  description?: string;
  questionType: QuestionType;
  questionCount: number;
  pointsPerQuestion: number;
  partialScoreLadder?: number[];
  distribution: {
    recognition: number;
    comprehension: number;
    application: number;
    high_application: number;
  };
  allowedTopicIds?: string[];
  allowedObjectiveIds?: string[];
}

export interface ExamBlueprint {
  id: string;
  schemaVersion: 1;
  title: string;
  subjectId: string;
  grade: number;
  curriculumId?: string;
  examType: ExamType;
  totalDurationMinutes: number;
  totalPoints: number;
  sections: BlueprintSectionSpecification[];
  creatorCodeId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

import type {
  ChoiceGroup,
  ExamBlueprintSpecification,
  ExamStructureMode,
  QuestionGroup,
  QuestionPool,
  SourceSet
} from './assessmentStructure.ts';

export interface ExamSectionQuestionRef {
  questionId: string;
  questionVersionId: string;
  allocatedPoints: number;
  orderIndex: number;
  choiceGroupId?: string;     // If this question belongs to a ChoiceGroup
  groupId?: string;           // If this question belongs to a QuestionGroup
  sourceSetId?: string;       // Optional shared source material for this question
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  questionType: QuestionType;
  questions: ExamSectionQuestionRef[];
  sourceSetIds?: string[];
  choiceGroups?: ChoiceGroup[];
  required?: boolean;
}

export interface ExamPolicy {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  maxAttempts?: number;
  allowReviewAfterSubmit?: boolean;
  /**
   * Backward-compatible authoring alias. New persisted exams must use
   * `allowReviewAfterSubmit`; the normalizer maps this legacy field.
   */
  allowReview?: boolean;
  showExplanationsImmediately?: boolean;
  requireContinuousFocus?: boolean;
  allowRetake?: boolean;
  openTime?: string;
  deadlineTime?: string;
}

export interface Exam {
  id: string;
  schemaVersion: 1;
  versionNumber?: number;     // e.g. 1, 2...
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  blueprintId?: string;
  blueprint?: ExamBlueprintSpecification;
  mode?: ExamStructureMode;   // 'full' | 'structured'
  examType: ExamType;
  durationMinutes: number;
  totalPoints: number;
  passPoints?: number;
  sections: ExamSection[];

  // Modular Assessment Sets
  sourceSets?: SourceSet[];
  questionGroups?: QuestionGroup[];
  choiceGroups?: ChoiceGroup[];
  questionPools?: QuestionPool[];

  visibility: ExamVisibility;
  moderationStatus: ModerationStatus;
  creatorCodeId: string;
  targetClassroomIds?: string[];

  policy: ExamPolicy;

  stats?: {
    attemptCount: number;
    completedCount: number;
    averageScore: number;
  };

  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
