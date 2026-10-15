/**
 * EduSpace V3 - ExamSession, Submission, GradingRecord & Result Domain Models
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import type { GradingMethod, SessionStatus } from '../constants/index.ts';

export interface SessionQuestionRef {
  questionId: string;
  questionVersionId: string;
  assignedSectionId: string;
  allocatedPoints: number;
  orderIndex: number;
  choiceGroupId?: string;
  groupId?: string;
}

export interface SessionSecurityContext {
  clientIp?: string;
  userAgent?: string;
  tabSwitchCount: number;
}

export interface ExamSession {
  id: string;
  schemaVersion: 1;
  examId: string;
  assignmentId?: string | null;
  studentCodeId: string;
  attemptNumber: number;

  // Server-authoritative timing
  startedAt: string;
  expiresAt: string;
  submittedAt?: string | null;

  status: SessionStatus;
  attemptSeed: string;

  questionVersionReferences: SessionQuestionRef[];

  autosaveState?: {
    lastSavedAt: string;
    savedAnswersCount: number;
    answersPayload: Record<string, any>;
    selectedChoiceQuestionIds?: string[];
  };

  securityContext: SessionSecurityContext;

  createdAt: string;
  updatedAt: string;
}

export interface SubmittedAnswerItem {
  questionId: string;
  questionVersionId: string;
  responsePayload: any;
  answeredAt: string;
  timeSpentSeconds?: number;
}

export interface Submission {
  id: string; // id === sessionId for idempotency
  schemaVersion: 1;
  sessionId: string;
  examId: string;
  assignmentId?: string | null;
  studentCodeId: string;
  submittedAt: string;
  clientReportedTime?: string;
  selectedChoiceQuestionIds?: string[];
  answers: SubmittedAnswerItem[];
  createdAt: string;
}

export interface QuestionGradingDetail {
  questionId: string;
  questionVersionId: string;
  maxPoints: number;
  awardedPoints: number;
  isCorrect: boolean;
  partialBreakdown?: Record<string, number>;
  teacherFeedback?: string;
  aiSuggestedPoints?: number;
  aiFeedbackText?: string;
  gradingMethod: GradingMethod;
}

export interface GradingRecord {
  id: string; // id === sessionId
  schemaVersion: 1;
  submissionId: string;
  sessionId: string;
  examId: string;
  studentCodeId: string;

  overallGradingMethod: GradingMethod;
  gradedByCodeId?: string | null;

  detailedQuestions: QuestionGradingDetail[];

  totalScore: number;
  maxPossibleScore: number;
  percentage: number;

  isFinalized: boolean;
  gradedAt: string;
  updatedAt: string;
}

export interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  score: number;
  maxScore: number;
}

export interface Result {
  id: string; // id === sessionId
  schemaVersion: 1;
  sessionId: string;
  examId: string;
  assignmentId?: string | null;
  classroomId?: string | null;
  studentCodeId: string;
  studentNdid: string; // Raw String preserved
  studentDisplayName: string;

  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;

  sectionScores: SectionScore[];

  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;

  status: 'provisional' | 'final';
  publishedToStudent: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
