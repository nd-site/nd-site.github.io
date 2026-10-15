/**
 * EduSpace V3 Assessment Layer - Type Definitions
 * Source of truth: docs/eduspace-v3-api-contract.md & docs/eduspace-v3-database-schema.md
 */

import type { QuestionType, SessionStatus } from '../core/constants/index.ts';
import type { Result } from '../core/domain/session.ts';
import type {
  ContentBlock,
  SourceSet,
  QuestionGroup,
  ChoiceGroup,
  ExamStructureMode,
} from '../core/domain/assessmentStructure.ts';

// ----------------------------------------------------------------------
// Security & Authentication Context
// ----------------------------------------------------------------------

export interface UserSecurityContext {
  /**
   * Canonical CodeID (Firebase Auth UID === CodeID)
   */
  codeId: string;

  /**
   * Canonical RAW NDID from users/{CodeID}.ndid
   * Must preserve 100% untouched raw string (never prepend '@', never strip chars)
   */
  ndid: string;

  /**
   * Base system role
   */
  role: 'user' | 'admin';

  /**
   * Educational role
   */
  eduRole: 'student' | 'teacher';

  /**
   * Granular admin privileges
   */
  adminLevel?: 'none' | 'moderator' | 'admin' | 'owner';

  /**
   * Display name
   */
  displayName: string;

  /**
   * Optional client audit details
   */
  clientIp?: string;
  userAgent?: string;
}

// ----------------------------------------------------------------------
// Sanitized Exam DTOs (Answer-Key-Free)
// ----------------------------------------------------------------------

export interface SanitizedOption {
  id: string;
  text: string;
  mediaAsset?: any;
}

export interface SanitizedMultiPartQuestionPart {
  partId: string;
  label: string;
  prompt: string;
  type: QuestionType;
  allocatedPoints: number;
  blocks?: ContentBlock[];
  contentPayload: any;
}

export interface SanitizedPlanQuestion {
  questionId: string;
  questionVersionId: string;
  prompt: string;
  type: QuestionType;
  allocatedPoints: number;
  orderIndex: number;
  mediaAssets?: any[];
  blocks?: ContentBlock[];
  sourceSetId?: string;
  groupId?: string;
  parts?: SanitizedMultiPartQuestionPart[];
  choiceGroupId?: string;
  options?: SanitizedOption[];
  items?: any[];
  matchingOptions?: string[];
  template?: string;
}

export interface SanitizedPlanSection {
  id: string;
  title: string;
  sourceSetIds?: string[];
  choiceGroups?: ChoiceGroup[];
  required?: boolean;
  questions: SanitizedPlanQuestion[];
}

export interface SanitizedExam {
  id: string;
  title: string;
  durationMinutes: number;
  totalPoints: number;
  mode?: ExamStructureMode;
  sourceSets?: SourceSet[];
  questionGroups?: QuestionGroup[];
  choiceGroups?: ChoiceGroup[];
  sections: SanitizedPlanSection[];
}

// ----------------------------------------------------------------------
// Request & Response Envelopes
// ----------------------------------------------------------------------

export interface StartSessionRequest {
  examId: string;
  assignmentId?: string | null;
}

export interface StartSessionResponse {
  success: true;
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  serverNow: string;
  attemptSeed: string;
  exam: SanitizedExam;
}

export interface ResumeSessionResponse {
  success: true;
  sessionId: string;
  status: SessionStatus;
  startedAt: string;
  expiresAt: string;
  serverNow: string;
  attemptSeed: string;
  exam: SanitizedExam;
  autosaveState?: {
    lastSavedAt: string;
    savedAnswersCount: number;
    answersPayload: Record<string, any>;
    selectedChoiceQuestionIds?: string[];
  };
}

export interface AutosaveRequest {
  answersPayload: Record<string, any>;
  selectedChoiceQuestionIds?: string[];
  answerVersion?: number;
}

export interface AutosaveResponse {
  success: true;
  sessionId: string;
  savedAt: string;
  savedAnswersCount: number;
  answerVersion: number;
  selectedChoiceQuestionIds?: string[];
}

export interface SubmittedAnswerDto {
  questionId: string;
  questionVersionId: string;
  responsePayload: any;
  timeSpentSeconds?: number;
  // Untrusted client fields (may be injected by attackers; must be rejected or stripped):
  score?: number;
  awardedPoints?: number;
  isCorrect?: boolean;
  [key: string]: any;
}

export interface SubmitSessionRequest {
  answers: SubmittedAnswerDto[];
  selectedChoiceQuestionIds?: string[];
  clientReportedTime?: string;
}

export interface SubmitSessionResponse {
  success: true;
  sessionId: string;
  status: SessionStatus;
  submittedAt: string;
  resultId?: string;
  isIdempotentReplay?: boolean;
}

export interface ManualGradeItem {
  questionId: string;
  awardedPoints: number;
  feedback?: string;
}

export interface ManualGradeRequest {
  sessionId: string;
  scores: ManualGradeItem[];
}

export interface ManualGradeResponse {
  success: true;
  sessionId: string;
  gradedByCodeId: string;
  totalScore: number;
  isFinalized: boolean;
}

export interface ResultResponse {
  success: true;
  result: Result;
}
