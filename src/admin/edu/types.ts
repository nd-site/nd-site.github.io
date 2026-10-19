// Type definitions for EduND Central Admin & Exam Authoring

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type QuestionType =
  | 'multiple'
  | 'truefalse'
  | 'short'
  | 'essay'
  | 'matching'
  | 'cloze'
  | 'ordering'
  | 'multiselect'
  | 'grouping'
  | 'error_identification';

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
  cognitiveLevel?: CognitiveLevel; // 4 mức độ nhận thức GDPT 2018
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

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multiselect';
  options: string[];
  correct: number[]; // Các chỉ số phương án đúng [0, 2, ...]
  partialCredit?: boolean;
}

export interface GroupingCategory {
  id: string;
  name: string;
}

export interface GroupingItem {
  id: string;
  text: string;
  categoryId: string;
}

export interface GroupingQuestion extends BaseQuestion {
  type: 'grouping';
  categories: GroupingCategory[];
  items: GroupingItem[];
}

export interface ErrorUnderline {
  id: string; // "A", "B", "C", "D"
  text: string;
  isError: boolean;
}

export interface ErrorIdentificationQuestion extends BaseQuestion {
  type: 'error_identification';
  underlines: ErrorUnderline[];
  correctCorrection: string; // Từ / cụm từ sửa lại cho đúng
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | MatchingQuestion
  | ClozeQuestion
  | OrderingQuestion
  | MultiSelectQuestion
  | GroupingQuestion
  | ErrorIdentificationQuestion;

export interface ExamStructureCounts {
  multiple: number;
  truefalse: number;
  short: number;
  essay: number;
  matching?: number;
  cloze?: number;
  ordering?: number;
  multiselect?: number;
  grouping?: number;
  error_identification?: number;
}

export interface ExamStructure {
  enabled: boolean;
  counts: ExamStructureCounts;
  shuffleWithinType: boolean;
  matrixDuration?: number; // Thời gian làm bài ở chế độ Ma trận kiểm tra (phút)
  fullDuration?: number;   // Thời gian làm bài ở chế độ Tất cả các câu (phút)
}

export interface ExamProctoringConfig {
  enabled: boolean;
  appliedModes: 'exam_only' | 'practice_only' | 'both'; // Áp dụng trong chế độ nào
  requireLogin: boolean; // Yêu cầu đăng nhập trước khi làm
  requireCamera: boolean; // Bắt buộc camera (không có cam không cho phép làm bài)
  recordAudio: boolean; // Ghi âm trong quá trình làm bài
  recordScreenLog: boolean; // Ghi lại nhật ký chuyển tab, thoát toàn màn hình
  randomSnapshots: boolean; // Chụp ngẫu nhiên màn hình và camera trước/sau
  maxAttempts?: number; // Giới hạn số lần kiểm tra (0 hoặc undefined = không giới hạn)
  maxFullscreenExits?: number; // Số lần cảnh báo thoát toàn màn hình trước khi cấm thi (mặc định ví dụ 3)
  fullscreenBanDuration?: number; // Thời hạn cấm thi tính theo phút: 0 = cấm vĩnh viễn, >0 = cấm n phút (ví dụ 30, 60, 1440...)
  customAiEndpoint?: string; // Link API AI riêng của giáo viên
  customApiKey?: string; // API Key riêng của giáo viên (không dùng API dự án)
  customAiModel?: string; // Model AI (gemini-2.5-flash, gpt-4o, v.v.)
  customAiPrompt?: string; // Prompt phân tích giám sát
}

export interface ExamConfig {
  testDuration?: number; // In seconds
  matrixDuration?: number; // In minutes
  fullDuration?: number;   // In minutes
  proctoring?: ExamProctoringConfig;
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
  creatorCodeId?: string;
  collaboratorCodeIds?: string[];
  accessType?: 'all' | 'restricted';
  allowedCodeIds?: string[];
  book?: string;
  description?: string;
  totalPoints?: number;
  examStructure?: ExamStructure;
  config?: ExamConfig;
  proctoring?: ExamProctoringConfig;
  passages?: PassageContext[];
  questions: Question[];
}

export interface QuizRecord {
  id: string; // Uppercase ID
  creatorUid?: string;
  creatorNdid?: string;
  creatorCodeId?: string; // Mã CodeID của người tạo đề
  author?: string; // Tên hiển thị người ra đề
  school?: string; // Trường / cơ sở (nơi tạo đề)
  collaborators?: string[]; // Danh sách NDID người cùng sửa (hiển thị UI)
  collaboratorCodeIds?: string[]; // Danh sách CodeID người cùng sửa (lưu DB)
  accessType?: 'all' | 'restricted'; // 'all' (tất cả) hoặc 'restricted' (chỉ định)
  allowedCodeIds?: string[]; // Danh sách CodeID những người được phép làm đề
  viewers?: string[]; // Danh sách NDID được xem khi đề riêng tư
  commenters?: string[]; // Danh sách NDID được nhận xét/góp ý
  comments?: ExamComment[]; // Danh sách nhận xét góp ý đề thi
  proctoring?: ExamProctoringConfig;
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
  codeId?: string;
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

export interface StudentSubmissionRecord {
  id: string; // docId
  examId: string;
  examTitle: string;
  studentNdid: string;
  studentName?: string;
  studentCodeId?: string;
  score10: number;
  achievedPoints: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  mode: 'exam' | 'practice';
  samplingMode: 'matrix' | 'full';
  timeSpentSecs: number;
  submittedAt: any;
  userAnswers: any[];
  proctoringLogs: {
    timestamp: string;
    type: string;
    detail: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  attemptNumber: number;
  classId?: string;
  cheatSuspicionScore?: number; // 0 - 100
  weakSkillSummary?: string[];
}

export interface ClassGroupRecord {
  id: string;
  name: string;
  grade: string;
  description?: string;
  teacherUid: string;
  teacherNdid: string;
  teacherName?: string;
  studentNdids: string[]; // Danh sách NDID học sinh trong lớp
  assignedExamIds: string[]; // Danh sách mã đề thi đã giao
  visibility?: 'public' | 'private'; // Công khai (học sinh tự tìm và xin vào) hoặc riêng tư (chỉ giáo viên thêm)
  joinCode?: string; // Mã tham gia lớp học nhanh
  school?: string;
  createdAt: any;
  updatedAt?: any;
}
