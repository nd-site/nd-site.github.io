/**
 * EduSpace V3 - Question Domain Models & Discriminated Payloads
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import type { CognitiveLevel, QuestionType } from '../constants/index.ts';
import type { ContentBlock, MultiPartQuestionPart } from './assessmentStructure.ts';

export interface QuestionMediaAsset {
  type: 'image' | 'audio' | 'video';
  url: string;
  caption?: string;
  altText?: string;
}

// -------------------------------------------------------------
// Type-Discriminated Question Content & Grading Payloads
// -------------------------------------------------------------

// 1. Single Choice
export interface SingleChoiceContentPayload {
  options: Array<{ id: string; text: string }>;
  shuffleOptions?: boolean;
}
export interface SingleChoiceGradingPayload {
  correctOptionId: string;
}

// 2. Multiple Choice
export interface MultipleChoiceContentPayload {
  options: Array<{ id: string; text: string }>;
  shuffleOptions?: boolean;
}
export interface MultipleChoiceGradingPayload {
  correctOptionIds: string[];
  partialScoring?: boolean;
}

// 3. True / False (GDPT 2018 4-item independent format)
export interface TrueFalseContentPayload {
  items: Array<{ id: string; text: string }>;
}
export interface TrueFalseGradingPayload {
  correctAnswers: Record<string, boolean>;
  partialScoreLadder: [number, number, number, number]; // [0.1, 0.25, 0.5, 1.0]
}

// 4. Short Answer (Text)
export interface ShortAnswerContentPayload {
  placeholder?: string;
  caseSensitive?: boolean;
}
export interface ShortAnswerGradingPayload {
  acceptableAnswers: string[];
  caseSensitive: boolean;
  trimWhitespace: boolean;
}

// 5. Numeric (GDPT 2018 Numeric Fill)
export interface NumericContentPayload {
  placeholder?: string;
  unitLabel?: string;
}
export interface NumericGradingPayload {
  exactValue: number;
  tolerance?: number;
  roundingPrecision?: number;
}

// 6. Essay
export interface EssayContentPayload {
  minWords?: number;
  maxWords?: number;
  attachmentAllowed?: boolean;
}
export interface EssayGradingPayload {
  rubricCriteria: Array<{
    id: string;
    description: string;
    maxPoints: number;
  }>;
}

// 7. Matching
export interface MatchingContentPayload {
  leftColumn: Array<{ id: string; text: string }>;
  rightColumn: Array<{ id: string; text: string }>;
}
export interface MatchingGradingPayload {
  correctPairs: Array<{ leftId: string; rightId: string }>;
}

// 8. Ordering
export interface OrderingContentPayload {
  items: Array<{ id: string; text: string }>;
}
export interface OrderingGradingPayload {
  correctOrderIds: string[];
}

// 9. Fill Blank
export interface FillBlankContentPayload {
  textWithTokens: string; // e.g. "Paris là thủ đô của {{blank_1}}"
}
export interface FillBlankGradingPayload {
  blanks: Record<string, { acceptableAnswers: string[]; caseSensitive: boolean }>;
}

// Generic / Extensible Payload Map
export type QuestionContentPayload =
  | SingleChoiceContentPayload
  | MultipleChoiceContentPayload
  | TrueFalseContentPayload
  | ShortAnswerContentPayload
  | NumericContentPayload
  | EssayContentPayload
  | MatchingContentPayload
  | OrderingContentPayload
  | FillBlankContentPayload
  | Record<string, any>;

export type QuestionGradingPayload =
  | SingleChoiceGradingPayload
  | MultipleChoiceGradingPayload
  | TrueFalseGradingPayload
  | ShortAnswerGradingPayload
  | NumericGradingPayload
  | EssayGradingPayload
  | MatchingGradingPayload
  | OrderingGradingPayload
  | FillBlankGradingPayload
  | Record<string, any>;

// -------------------------------------------------------------
// Question Entities
// -------------------------------------------------------------

export interface QuestionBank {
  id: string;
  schemaVersion: 1;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  ownerCodeId: string;
  scope: 'personal' | 'shared' | 'public';
  questionCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVersion {
  id: string; // e.g. `${questionId}_v${versionNumber}`
  schemaVersion: 1;
  questionId: string;
  versionNumber: number;
  content: {
    prompt: string;
    mediaAssets?: QuestionMediaAsset[];
    blocks?: ContentBlock[];
    sourceSetId?: string;
    groupId?: string;
    parts?: MultiPartQuestionPart[];
    payload: QuestionContentPayload;
  };
  gradingConfig: {
    payload: QuestionGradingPayload;
    explanation?: string;
    rubricGuide?: string;
  };
  changeSummary?: string;
  createdByCodeId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  schemaVersion: 1;
  questionBankId?: string;
  authorCodeId: string;
  type: QuestionType;
  sourceSetId?: string;
  groupId?: string;
  
  // GDPT 2018 Academic Metadata
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  topicId?: string;
  learningObjectiveIds: string[];
  cognitiveLevel: CognitiveLevel;
  difficultyScore: number; // 1 to 5
  tags: string[];

  // Active Version Reference
  currentVersionId: string;
  currentVersionNumber: number;

  // Embedded active version content for fast retrieval (Optional, denormalized)
  activeVersion?: QuestionVersion;

  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  createdAt: string;
  updatedAt: string;
}
