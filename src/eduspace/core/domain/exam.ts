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

export interface ExamSectionQuestionRef {
  questionId: string;
  questionVersionId: string;
  allocatedPoints: number;
  orderIndex: number;
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  questionType: QuestionType;
  questions: ExamSectionQuestionRef[];
}

export interface ExamPolicy {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  allowReviewAfterSubmit: boolean;
  showExplanationsImmediately: boolean;
  requireContinuousFocus: boolean;
  allowRetake: boolean;
  openTime?: string;
  deadlineTime?: string;
}

export interface Exam {
  id: string;
  schemaVersion: 1;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  blueprintId?: string;
  examType: ExamType;
  durationMinutes: number;
  totalPoints: number;
  passPoints?: number;
  sections: ExamSection[];

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
