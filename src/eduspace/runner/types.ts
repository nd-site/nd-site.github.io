/**
 * EduSpace V3 Beta Runner - Frontend Types
 */

export interface ContentBlock {
  id: string;
  type: 'text' | 'markdown' | 'image' | 'audio' | 'video' | 'table' | 'chart' | 'formula' | 'source' | 'quote' | 'document';
  content?: string;
  url?: string;
  caption?: string;
  altText?: string;
  metadata?: Record<string, any>;
}

export interface SourceSet {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  metadata?: Record<string, any>;
}

export interface QuestionGroup {
  id: string;
  title?: string;
  instruction?: string;
  sourceSetId?: string;
  questionIds: string[];
}

export interface ChoiceGroup {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  requiredCount: number;
  totalCount: number;
  allowUnanswered?: boolean;
}

export interface SanitizedMultiPartQuestionPart {
  partId: string;
  label: string;
  prompt: string;
  type: string;
  allocatedPoints: number;
  blocks?: ContentBlock[];
  contentPayload?: any;
}

export interface SanitizedOption {
  id: string;
  text: string;
  mediaAsset?: any;
}

export interface SanitizedTrueFalseItem {
  id: string;
  text: string;
}

export interface SanitizedQuestion {
  questionId: string;
  questionVersionId: string;
  orderIndex: number;
  allocatedPoints: number;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'numeric' | 'matching' | 'essay' | 'multi_part' | string;
  blocks?: ContentBlock[];
  sourceSetId?: string;
  groupId?: string;
  choiceGroupId?: string;
  parts?: SanitizedMultiPartQuestionPart[];
  content: {
    prompt: string;
    payload?: {
      options?: SanitizedOption[];
      items?: SanitizedTrueFalseItem[];
      placeholder?: string;
      minWords?: number;
      [key: string]: any;
    };
  };
}

export interface SanitizedExamSection {
  id: string;
  title: string;
  sectionOrder: number;
  questionType: string;
  sourceSetIds?: string[];
  choiceGroups?: ChoiceGroup[];
  required?: boolean;
  questions: SanitizedQuestion[];
}

export interface SanitizedExam {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  examType: string;
  mode?: 'full' | 'structured';
  durationMinutes: number;
  totalPoints: number;
  passPoints?: number;
  sourceSets?: SourceSet[];
  questionGroups?: QuestionGroup[];
  choiceGroups?: ChoiceGroup[];
  sections: SanitizedExamSection[];
  policy?: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    allowReviewAfterSubmit?: boolean;
    showExplanationsImmediately?: boolean;
    [key: string]: any;
  };
}

export interface SessionData {
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  serverNow: string;
  attemptSeed: string;
  exam: SanitizedExam;
}

export interface SubmittedAnswerDto {
  questionId: string;
  questionVersionId: string;
  responsePayload: any;
  timeSpentSeconds?: number;
}

export interface QuestionGradingDetail {
  questionId: string;
  questionVersionId: string;
  maxPoints: number;
  awardedPoints: number;
  isCorrect: boolean;
  partialBreakdown?: Record<string, number>;
  teacherFeedback?: string;
  explanation?: string;
}

export interface OfficialResult {
  id: string;
  sessionId: string;
  examId: string;
  studentCodeId: string;
  studentNdid: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  durationSeconds: number;
  status: 'preliminary' | 'final' | 'appealed';
  details?: QuestionGradingDetail[];
  submittedAt: string;
  createdAt: string;
}
