// Type definitions for EduND Central Admin & Exam Authoring

export type QuestionType =
  | 'multiple'
  | 'truefalse'
  | 'short'
  | 'essay'
  | 'matching'
  | 'cloze'
  | 'ordering';

export interface AudioMedia {
  url: string;
  maxPlays?: number; // 0 hoặc undefined = Không giới hạn
}

export interface PassageContext {
  id: string;
  title?: string;
  content: string; // Hỗ trợ văn bản, bảng, KaTeX, Markdown
  imageUrl?: string;
  audioUrl?: string;
  maxAudioPlays?: number;
  videoUrl?: string;
  shuffleQuestions?: boolean; // Tùy chọn đảo thứ tự câu hỏi con trong ngữ liệu
}

export interface RubricStep {
  step: number;
  description: string;
  points: number;
}

export interface BaseQuestion {
  id?: string;
  type: QuestionType;
  question: string;
  points?: number;
  explanation?: string;
  // Đa phương tiện & Ngữ liệu
  imageUrl?: string;
  audioUrl?: string;
  maxAudioPlays?: number; // Số lần nghe tối đa cho câu hỏi
  videoUrl?: string;
  passageId?: string; // ID của ngữ liệu chung (nếu thuộc ngữ liệu)
  rubric?: RubricStep[]; // Tiêu chí chấm điểm tự luận theo từng bước
  rubrics?: RubricStep[];
  // Metadata cho các phần thi GDPT 2018 khi làm bài
  _sectionId?: number;
  _sectionTitle?: string;
  _sectionDesc?: string;
  _indexInSection?: number;
  _totalInSection?: number;
  _passageIndex?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  correct: number; // 0..3
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  options: string[]; // 4 ý [a, b, c, d]
  correctAnswers: boolean[]; // 4 giá trị đúng/sai
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short';
  correct: string; // Số thập phân (hỗ trợ dấu . và ,)
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  correct?: string; // Hướng dẫn chấm / lời giải mẫu
  allowAttachments?: boolean; // Cho phép tải ảnh bài làm viết tay
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ClozeBlank {
  id: string; // Ví dụ "1", "2" tương ứng [1], [2] trong văn bản câu hỏi
  options?: string[]; // Danh sách lựa chọn thả xuống (nếu có)
  correct: string; // Đáp án đúng
}

export interface ClozeQuestion extends BaseQuestion {
  type: 'cloze';
  blanks: ClozeBlank[];
}

export interface OrderingItem {
  id: string;
  text: string;
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: OrderingItem[];
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | MatchingQuestion
  | ClozeQuestion
  | OrderingQuestion;

export interface ExamStructureCounts {
  multiple: number;
  truefalse: number;
  short: number;
  essay: number;
  matching?: number;
  cloze?: number;
  ordering?: number;
}

export interface ExamStructure {
  enabled: boolean;
  counts: ExamStructureCounts;
  shuffleWithinType: boolean;
  matrixDuration?: number; // Thời gian làm bài ở chế độ Ma trận kiểm tra (phút)
  fullDuration?: number;   // Thời gian làm bài ở chế độ Tất cả các câu (phút)
}

export interface ExamConfig {
  testDuration?: number; // In seconds
  matrixDuration?: number; // In minutes
  fullDuration?: number;   // In minutes
  examLayout?: {
    multiple?: { count: number; pointsPerQ: number };
    truefalse?: { count: number; pointsPerQ: number };
    short?: { count: number; pointsPerQ: number };
    essay?: { count: number; pointsPerQ: number };
  };
}

export interface ExamComment {
  id: string;
  authorNdid: string;
  createdAt: any;
  content: string;
  questionIndex?: number; // Nhận xét cho câu hỏi cụ thể, hoặc toàn bộ đề nếu không có
}

export interface QuizDataPayload {
  title: string;
  class?: string;
  grade?: string;
  subject?: string;
  examType?: string;
  duration?: number; // In minutes (mặc định lấy theo ma trận)
  matrixDuration?: number;
  fullDuration?: number;
  author?: string;
  collaborators?: string[];
  viewers?: string[];
  commenters?: string[];
  comments?: ExamComment[];
  year?: string;
  school?: string;
  book?: string;
  description?: string;
  totalPoints?: number;
  examStructure?: ExamStructure;
  config?: ExamConfig;
  passages?: PassageContext[];
  questions: Question[];
}

export interface QuizRecord {
  id: string; // Uppercase ID
  creatorUid?: string;
  creatorNdid?: string;
  author?: string;
  collaborators?: string[]; // Danh sách NDID người cùng sửa
  viewers?: string[]; // Danh sách NDID được xem khi đề riêng tư
  commenters?: string[]; // Danh sách NDID được nhận xét/góp ý
  comments?: ExamComment[]; // Danh sách nhận xét góp ý đề thi
  title: string;
  description?: string;
  grade?: string;
  class?: string;
  subject?: string;
  examType?: string;
  duration?: number; // Lấy theo matrixDuration
  matrixDuration?: number;
  fullDuration?: number;
  tag?: string;
  isHot?: boolean;
  isComingSoon?: boolean;
  isVerified?: boolean; // Đã kiểm duyệt / Đạt chuẩn
  verifiedAt?: any;
  verifiedBy?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  passages?: PassageContext[];
  quizData?: QuizDataPayload;
  questions?: Question[];
  eduspaceV3?: boolean;
  createdAt?: any;
  updatedAt?: any;
  _docId?: string;
}

export interface EduCategoriesConfig {
  grades: string[];
  subjects: string[];
  examTypes: string[];
  updatedAt?: any;
  updatedBy?: string;
}

export interface QuestionBankItem {
  id: string;
  creatorNdid: string;
  subject: string;
  grade: string;
  topic?: string;
  question: Question;
  createdAt?: any;
}

export interface AdminUser {
  uid: string;
  ndid?: string;
  role?: string;
  adminLevel?: string;
  eduRole?: string;
  status?: string;
  fullname?: string;
  displayName?: string;
  customGeminiKey?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface ExamAuditFeedback {
  score: number;
  levels?: {
    'Nhận biết'?: number;
    'Thông hiểu'?: number;
    'Vận dụng'?: number;
    'Vận dụng cao'?: number;
  };
  remarks?: string;
  feedback?: string[];
}
