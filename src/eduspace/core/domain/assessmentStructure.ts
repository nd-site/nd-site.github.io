/**
 * EduSpace V3 - Universal Assessment Structure Primitives
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-database-schema.md
 * 
 * Provides generic, extensible assessment primitives:
 * - ContentBlock
 * - SourceSet (Passage, Listening Audio, Document, Map, Chart)
 * - QuestionGroup (Parent-child shared context)
 * - MultiPartQuestionPart (Nested questions: 1a, 1b...)
 * - ChoiceGroup (Optional groups: 2 of 3, 2 of 4, 1 of 2...)
 * - QuestionPool (Candidate pools & deterministic selection)
 * - ExamBlueprint (Structured exam specification)
 */

import type { CognitiveLevel, ExamType, QuestionType } from '../constants/index.ts';
import type { QuestionContentPayload, QuestionGradingPayload } from './question.ts';

// ----------------------------------------------------------------------
// 1. Content Block System (Section 11, 12)
// ----------------------------------------------------------------------

export type ContentBlockType =
  | 'text'
  | 'markdown'
  | 'image'
  | 'audio'
  | 'video'
  | 'table'
  | 'chart'
  | 'formula'
  | 'source'
  | 'quote'
  | 'document';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content?: string;           // Text, Markdown, LaTeX formula, or quote text
  url?: string;               // URL for image, audio, video, or attachment
  caption?: string;           // Title or caption displayed below block
  altText?: string;           // Accessibility alt text
  metadata?: {
    tableData?: { headers?: string[]; rows?: string[][] };
    chartType?: 'bar' | 'line' | 'pie';
    chartData?: any;
    author?: string;
    workTitle?: string;
    sourceRef?: string;
    mimeType?: string;
    [key: string]: any;
  };
}

// ----------------------------------------------------------------------
// 2. Source Sets & Context Passages (Section 16, 17)
// ----------------------------------------------------------------------

export interface SourceSet {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  metadata?: {
    subjectId?: string;
    author?: string;
    publicationYear?: string | number;
    sourceOrigin?: string;
    isListeningAudio?: boolean;
    audioDurationSeconds?: number;
    [key: string]: any;
  };
}

// ----------------------------------------------------------------------
// 3. Question Groups (Section 13)
// ----------------------------------------------------------------------

export interface QuestionGroup {
  id: string;
  title?: string;
  instruction?: string;
  sourceSetId?: string;       // References an existing SourceSet
  sourceSet?: SourceSet;      // Embedded inline source set
  questionIds: string[];      // Ordered list of child question IDs
}

// ----------------------------------------------------------------------
// 4. Multi-Part Question Sub-parts (Section 14)
// ----------------------------------------------------------------------

export interface MultiPartQuestionPart {
  partId: string;
  label: string;              // e.g. "a)", "b)", "1a", "Ý 1"
  prompt: string;
  type: QuestionType;
  allocatedPoints: number;
  blocks?: ContentBlock[];
  contentPayload: QuestionContentPayload;
  gradingPayload: QuestionGradingPayload;
  explanation?: string;
  cognitiveLevel?: CognitiveLevel;
}

// ----------------------------------------------------------------------
// 5. Choice Groups (Optional Groups - Section 5)
// ----------------------------------------------------------------------

export interface ChoiceGroup {
  id: string;
  title: string;              // e.g. "Nhóm tự chọn Phần II"
  description?: string;       // e.g. "Học sinh chọn 2 trong 3 câu hỏi sau đây"
  questionIds: string[];      // Candidate question IDs in this group
  requiredCount: number;      // e.g. 2 for 2/3, 1 for 1/2
  totalCount: number;         // e.g. 3 for 2/3, 4 for 2/4
  allowUnanswered?: boolean;  // If true, student can leave optional questions unselected
  selectionMode: 'student_choice' | 'blueprint_random';
}

// ----------------------------------------------------------------------
// 6. Question Pools & Deterministic Selection (Section 18)
// ----------------------------------------------------------------------

export type PoolSelectionStrategy =
  | 'fixed'
  | 'random'
  | 'difficulty_balanced'
  | 'topic_balanced';

export interface QuestionPool {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  candidateQuestionIds: string[];
  selectionRule?: {
    count: number;
    strategy: PoolSelectionStrategy;
    targetDistribution?: {
      recognition?: number;
      comprehension?: number;
      application?: number;
      high_application?: number;
    };
  };
}

// ----------------------------------------------------------------------
// 7. Exam Blueprint (Sections 4, 6, 7, 8)
// ----------------------------------------------------------------------

export type ExamStructureMode = 'full' | 'structured';

export interface BlueprintSectionConfig {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  required: boolean;
  totalPoints: number;
  questionType?: QuestionType;
  
  // Selection Specification
  questionSelection: {
    poolId?: string;          // If selecting from a pool
    count: number;            // Number of questions to execute
    pointsPerQuestion?: number;
    strategy?: PoolSelectionStrategy;
    questionIds?: string[];   // Fixed candidate questions
  };

  // Optional choice groups within this section
  choiceGroups?: ChoiceGroup[];
}

export interface ExamBlueprintSpecification {
  id: string;
  schemaVersion: 1;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  examType: ExamType;
  mode: ExamStructureMode;    // 'full' = do all; 'structured' = blueprint guided
  durationMinutes: number;
  totalPoints: number;
  sections: BlueprintSectionConfig[];
  pools?: QuestionPool[];
  choiceGroups?: ChoiceGroup[];
  sourceSets?: SourceSet[];
  creatorCodeId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
