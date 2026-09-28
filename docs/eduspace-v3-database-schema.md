# EDUSPACE V3 DATABASE SCHEMA & CANONICAL DATA MODEL
## Canonical Architecture, Domain Specification & Firestore Resource Contract

> **Authority:** Source of Truth for EduSpace V3 Database Architecture, Entity Definitions & Data Access Contracts.  
> **Project:** EduSpace by ND Labs (Version 3.0)  
> **Status:** CANONICAL CONTRACT (Phase 2 Specification)  
> **Date:** 16/09/2026  
> **Runtime Environment:** Cloud Firestore (Primary) + Cloud Functions / Node.js 20+ (Admin SDK)  
> **References:** [eduspace-v3-architecture.md](eduspace-v3-architecture.md), [DATABASE.md](DATABASE.md), [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md), [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_RULES.md](AUTH_RULES.md), [PROJECT_RULES.md](PROJECT_RULES.md)

> **Operational storage update (2026-09-28):** Active V2 and V3 exam definitions share the `quizzes/{quizId}` aggregate. See [eduspace-shared-quiz-bank.md](eduspace-shared-quiz-bank.md) for the deployed storage layout and migration path; the historical collection tables below describe the earlier V3 design.

---

### CÁC NGUYÊN TẮC CỐT LÕI BẮT BUỘC (MANDATORY AXIOMS)

1. **DATABASE-FIRST 100%:**
   Toàn bộ môn học, bộ sách, khối lớp, chủ đề, yêu cầu cần đạt, ngân hàng câu hỏi, ma trận đề, đề thi, bài tập, lớp học, bài nộp, điểm số và cấu hình hệ thống **bắt buộc phải xuất phát từ Database/API**. Tuyệt đối không lưu trữ nội dung giáo dục động trong các file mã nguồn tĩnh (như `data.js`, quiz JSON, static question files). Mã nguồn ứng dụng chỉ chứa logic chương trình, định nghĩa kiểu, trình biên dịch, adapters và renderers.

2. **BẢO VỆ TUYỆT ĐỐI CÁC THÀNH PHẦN BẤT BIẾN:**
   - **Thời khóa biểu (TimeTable):** Tuyệt đối KHÔNG sửa đổi, xóa, migrate hoặc tái cấu trúc dữ liệu `timetables/{timetableId}` và mã nguồn TimeTable. V3 chỉ đóng vai trò liên kết điều hướng.
   - **Tài khoản Owner CodeID `0000`:** Bất biến, không một API nào được phép thay đổi quyền hạn hoặc trạng thái của Owner.
   - **Dữ liệu Quiz V2 hiện hữu:** Giữ nguyên vẹn các bản ghi trong `quizzes`, `eduspace_lessons` và `attempts`. V3 cung cấp adapter tương thích ngược không phá hủy.
   - **Quy chuẩn NDID:** Bảo toàn 100% Raw String từ Database; không chạy hàm strip/sanitize trên dữ liệu đã lưu; tuyệt đối không tự động chèn tiền tố `@` vào giao diện người dùng.
   - **Định danh Canonical:** `Firebase Auth UID === CodeID`. Mọi quan hệ nội bộ liên kết người dùng đều sử dụng `CodeID`.

3. **PHIÊN BẢN HÓA DỮ LIỆU (VERSIONED PERSISTENCE):**
   Mọi tài liệu nghiệp vụ quan trọng bắt buộc phải chứa trường `schemaVersion: number` (khởi đầu với `schemaVersion: 1` cho V3). Lớp đọc dữ liệu (Normalizer) chịu trách nhiệm chuẩn hóa mọi phiên bản dữ liệu về Canonical Domain Models cho React UI tiêu thụ.

---

## PHẦN I: DANH MỤC MÔ HÌNH DỮ LIỆU CHUẨN TẮC (CANONICAL DOMAIN MODELS)

Hệ thống EduSpace V3 định nghĩa 22 mô hình chuẩn tắc bằng TypeScript, phân ranh giới rõ ràng giữa các trường bắt buộc và tùy chọn.

```
                              ┌────────────────────────────────────────────────────────┐
                              │             CANONICAL DOMAINS OVERVIEW                 │
                              └───────────────────────────┬────────────────────────────┘
                                                          │
         ┌────────────────────────────────┬───────────────┴────────────────┬───────────────────────────────┐
         ▼                                ▼                                ▼                               ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐            ┌──────────────────┐
│ 1. CURRICULUM &  │             │  2. ASSESSMENT   │             │ 3. CLASSROOM &   │            │ 4. EXECUTION &   │
│    TAXONOMY      │             │     & EXAMS      │             │   ASSIGNMENTS    │            │    EVALUATION    │
├──────────────────┤             ├──────────────────┤             ├──────────────────┤            ├──────────────────┤
│ Subject          │             │ QuestionBank     │             │ Classroom        │            │ ExamSession      │
│ Curriculum       │             │ Question         │             │ ClassroomMember  │            │ Submission       │
│ TextbookSet      │             │ QuestionVersion  │             │ Assignment       │            │ GradingRecord    │
│ Grade            │             │ ExamBlueprint    │             └──────────────────┘            │ Result           │
│ Topic            │             │ Exam             │                                             └──────────────────┘
│ LearningObjective│             │ ExamSection      │
└──────────────────┘             └──────────────────┘
```

---

### 1. Miền Học thuật & Chương trình (Curriculum & Taxonomy)

#### 1.1 `Subject` (Môn học)
Môn học chuẩn hóa trong hệ thống giáo dục (Toán, Vật lí, Hóa học, Sinh học, Tin học, Ngữ văn, Lịch sử, Địa lí, GD KT&PL, Ngoại ngữ, Công nghệ...).

```typescript
export interface Subject {
  /** Khóa chính duy nhất, dạng định danh thân thiện (e.g. "toan", "vatly", "tinhoc") */
  id: string;
  /** Phiên bản cấu trúc tài liệu */
  schemaVersion: 1;
  /** Tên hiển thị đầy đủ (e.g. "Toán học", "Vật lí") */
  name: string;
  /** Mã viết tắt chuẩn hóa (e.g. "MATH", "PHYS", "INFO") */
  code: string;
  /** Tên icon định danh theo thư viện Lucide (e.g. "calculator", "atom", "binary") */
  icon: string;
  /** Mã màu hex thương hiệu môn học (e.g. "#3b82f6") */
  color: string;
  /** Các khối lớp áp dụng môn học này (e.g. [6, 7, 8, 9, 10, 11, 12]) */
  applicableGrades: number[];
  /** Thứ tự sắp xếp hiển thị trên giao diện */
  orderIndex: number;
  /** Trạng thái hoạt động */
  status: 'active' | 'archived';
  /** Thời điểm tạo (ISO 8601 UTC) */
  createdAt: string;
  /** Thời điểm cập nhật cuối (ISO 8601 UTC) */
  updatedAt: string;
}
```

#### 1.2 `Curriculum` (Khung chương trình giáo dục)
Đại diện cho khung chương trình giáo dục quốc gia (e.g. Chương trình GDPT 2018, Chuyên ban).

```typescript
export interface Curriculum {
  /** Định danh duy nhất (e.g. "gdpt_2018", "chuyen_sau") */
  id: string;
  schemaVersion: 1;
  /** Tên khung chương trình (e.g. "Chương trình Giáo dục Phổ thông 2018") */
  name: string;
  /** Mã viết tắt (e.g. "GDPT2018") */
  code: string;
  /** Cơ quan ban hành (e.g. "Bộ Giáo dục và Đào tạo") */
  governingBody: string;
  /** Năm bắt đầu áp dụng */
  yearEffective: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 1.3 `TextbookSet` (Bộ sách giáo khoa)
Đại diện cho các bộ sách giáo khoa lưu hành (Kết nối tri thức, Cánh diều, Chân trời sáng tạo...).

```typescript
export interface TextbookSet {
  /** Định danh duy nhất (e.g. "kntt", "canh_dieu", "ctst") */
  id: string;
  schemaVersion: 1;
  /** Thuộc khung chương trình nào (tham chiếu Curriculum.id) */
  curriculumId: string;
  /** Tên đầy đủ của bộ sách */
  name: string;
  /** Tên viết tắt hiển thị (e.g. "KNTT", "Cánh Diều") */
  shortName: string;
  /** Nhà xuất bản */
  publisher: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 1.4 `Grade` (Khối lớp)
Định nghĩa thông tin chuẩn của từng khối lớp từ cấp 1 đến cấp 3 (ưu tiên THCS: 6–9 và THPT: 10–12).

```typescript
export interface Grade {
  /** ID số hoặc chuỗi (e.g. "10", "11", "12") */
  id: string;
  schemaVersion: 1;
  /** Số nguyên biểu diễn khối lớp (1 to 12) */
  numericLevel: number;
  /** Tên khối (e.g. "Lớp 10", "Lớp 12") */
  name: string;
  /** Cấp học */
  tier: 'tieu_hoc' | 'thcs' | 'thpt';
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 1.5 `Topic` (Chủ đề / Chuyên đề học tập)
Cây cấu trúc bài học và chuyên đề phân cấp theo môn học và khối lớp.

```typescript
export interface Topic {
  /** ID định danh duy nhất (e.g. "toan-10-menh-de-tap-hop") */
  id: string;
  schemaVersion: 1;
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  /** ID chủ đề cha (nếu là chủ đề con, tạo cây phân cấp) */
  parentTopicId?: string | null;
  name: string;
  code?: string;
  description?: string;
  orderIndex: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 1.6 `LearningObjective` (Yêu cầu cần đạt - YCCĐ)
Đặc tả mục tiêu học tập theo chuẩn quy định tại Thông tư 22 và khung GDPT 2018 của Bộ GD&ĐT.

```typescript
export type CognitiveLevel = 'recognition' | 'comprehension' | 'application' | 'high_application';

export interface LearningObjective {
  /** Mã định chuẩn độc lập (e.g. "YCCD-TOAN-10-TAP-HOP-01") */
  id: string;
  schemaVersion: 1;
  subjectId: string;
  grade: number;
  topicId: string;
  /** Mã ký hiệu quy ước chuẩn */
  code: string;
  /** Lời phát biểu Yêu cầu cần đạt */
  statement: string;
  /** Mức độ nhận thức chính */
  cognitiveLevel: CognitiveLevel;
  /** Các năng lực chuyên biệt liên quan (e.g. ['tu_duy_toan_hoc', 'giai_quyet_van_de']) */
  competencies: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Miền Ngân hàng Câu hỏi & Đề thi (Assessment & Exams)

#### 2.1 `QuestionBank` (Ngân hàng câu hỏi)
Vùng chứa tập hợp các câu hỏi thuộc quyền sở hữu của giáo viên, tổ bộ môn hoặc hệ thống chung.

```typescript
export interface QuestionBank {
  id: string;
  schemaVersion: 1;
  title: string;
  description?: string;
  subjectId: string;
  grade: number;
  /** CodeID của người tạo ngân hàng */
  ownerCodeId: string;
  /** Quyền truy cập: nội bộ tác giả, chia sẻ trường/tổ bộ môn, hoặc công khai */
  scope: 'personal' | 'shared' | 'public';
  questionCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 2.2 `Question` & `QuestionVersion` (Câu hỏi & Phiên bản lịch sử)
Để đảm bảo đề thi và kết quả làm bài trong quá khứ **luôn luôn tái hiện được chính xác 100%**, câu hỏi được tách biệt giữa bản ghi định tuyến (`Question`) và bản ghi dữ liệu nội dung chi tiết theo phiên bản (`QuestionVersion`).

```typescript
export type QuestionType =
  | 'single_choice'           // Trắc nghiệm 1 đáp án đúng (A, B, C, D)
  | 'multiple_choice'         // Trắc nghiệm nhiều đáp án đúng
  | 'true_false'              // Trắc nghiệm Đúng/Sai 4 ý chuẩn GDPT 2018
  | 'short_answer'            // Trả lời ngắn chuỗi chữ
  | 'numeric'                 // Trả lời ngắn số học (GDPT 2018)
  | 'fill_blank'              // Điền khuyết vào đoạn văn
  | 'matching'                // Nối cặp tương ứng
  | 'ordering'                // Sắp xếp thứ tự logic / thời gian
  | 'essay'                   // Tự luận
  | 'reading_comprehension'   // Đọc hiểu văn bản ngữ liệu dài
  | 'listening'               // Nghe hiểu âm thanh
  | 'speaking'                // Nói / thu âm
  | 'grouped'                 // Chùm câu hỏi liên hoàn
  | 'code_programming';       // Lập trình Tin học

export interface QuestionMediaAsset {
  type: 'image' | 'audio' | 'video';
  url: string;
  caption?: string;
  altText?: string;
}

export interface Question {
  id: string;
  schemaVersion: 1;
  questionBankId?: string;
  authorCodeId: string;
  type: QuestionType;
  
  // GDPT 2018 Academic Metadata
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  topicId?: string;
  learningObjectiveIds: string[];
  cognitiveLevel: CognitiveLevel;
  difficultyScore: number;     // Thang đo độ khó từ 1 đến 5
  tags: string[];

  /** ID phiên bản nội dung đang có hiệu lực (active) */
  currentVersionId: string;
  /** Số phiên bản tăng dần (1, 2, 3...) */
  currentVersionNumber: number;

  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVersion {
  /** Định danh duy nhất phiên bản (e.g. `${questionId}_v${versionNumber}`) */
  id: string;
  schemaVersion: 1;
  questionId: string;
  versionNumber: number;
  
  // Tách biệt ranh giới: Nội dung hiển thị cho học sinh
  content: {
    prompt: string;           // Văn bản câu hỏi (hỗ trợ Markdown, KaTeX LaTeX $...$, $$...$$)
    mediaAssets?: QuestionMediaAsset[];
    /** Cấu trúc lựa chọn phụ thuộc type (xem Chi tiết Payload ở Mục 2.3) */
    payload: Record<string, any>;
  };

  // Tách biệt ranh giới: Dữ liệu chấm điểm bảo mật (Server-Only, không gửi cho thí sinh trước nộp bài)
  gradingConfig: {
    /** Cấu trúc đáp án đúng và barem điểm theo từng dạng câu hỏi */
    payload: Record<string, any>;
    explanation?: string;     // Lời giải chi tiết
    rubricGuide?: string;     // Hướng dẫn chấm cho câu tự luận
  };

  changeSummary?: string;     // Ghi chú lý do cập nhật phiên bản
  createdByCodeId: string;
  createdAt: string;
}
```

#### 2.3 Chi tiết cấu trúc Payload cho từng dạng câu hỏi

```typescript
// 1. single_choice
export interface SingleChoiceContentPayload {
  options: Array<{ id: string; text: string }>;
  shuffleOptions?: boolean;
}
export interface SingleChoiceGradingPayload {
  correctOptionId: string;
}

// 2. multiple_choice
export interface MultipleChoiceContentPayload {
  options: Array<{ id: string; text: string }>;
  shuffleOptions?: boolean;
}
export interface MultipleChoiceGradingPayload {
  correctOptionIds: string[];
  partialScoring?: boolean;
}

// 3. true_false (Chuẩn GDPT 2018: 4 ý độc lập)
export interface TrueFalseContentPayload {
  items: Array<{ id: string; text: string }>; // Thông thường 4 ý [a, b, c, d]
}
export interface TrueFalseGradingPayload {
  /** Map item ID sang boolean đáp án đúng */
  correctAnswers: Record<string, boolean>;
  /** Barem điểm từng phần chuẩn Bộ GD&ĐT: 1 ý = 0.1, 2 ý = 0.25, 3 ý = 0.5, 4 ý = 1.0 */
  partialScoreLadder: [number, number, number, number];
}

// 4. short_answer
export interface ShortAnswerContentPayload {
  placeholder?: string;
  caseSensitive?: boolean;
}
export interface ShortAnswerGradingPayload {
  acceptableAnswers: string[];
  caseSensitive: boolean;
  trimWhitespace: boolean;
}

// 5. numeric (Chuẩn GDPT 2018 môn Toán, Lí, Hóa, Sinh)
export interface NumericContentPayload {
  placeholder?: string;
  unitLabel?: string;
}
export interface NumericGradingPayload {
  exactValue: number;
  /** Dung sai cho phép (e.g. 0.01) */
  tolerance?: number;
  roundingPrecision?: number; // Số chữ số thập phân
}

// 6. essay
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

// 7. matching
export interface MatchingContentPayload {
  leftColumn: Array<{ id: string; text: string }>;
  rightColumn: Array<{ id: string; text: string }>;
}
export interface MatchingGradingPayload {
  correctPairs: Array<{ leftId: string; rightId: string }>;
}

// 8. ordering
export interface OrderingContentPayload {
  items: Array<{ id: string; text: string }>;
}
export interface OrderingGradingPayload {
  correctOrderIds: string[];
}

// 9. fill_blank
export interface FillBlankContentPayload {
  textWithTokens: string; // "Thủ đô của Việt Nam là {{blank_1}} và diện tích là {{blank_2}} km2"
}
export interface FillBlankGradingPayload {
  blanks: Record<string, { acceptableAnswers: string[]; caseSensitive: boolean }>;
}
```

#### 2.4 `ExamBlueprint` (Ma trận & Bản đặc tả đề thi)
Mô hình cấu hình ma trận đề thi linh hoạt, độc lập hoàn toàn với một cấu trúc cố định của Bộ GD&ĐT, cho phép tái cấu hình theo mọi giai đoạn.

```typescript
export interface BlueprintSectionSpecification {
  id: string;
  title: string;               // e.g. "Phần I: Câu hỏi trắc nghiệm nhiều phương án"
  description?: string;
  questionType: QuestionType;
  questionCount: number;
  pointsPerQuestion: number;
  partialScoreLadder?: number[]; // [0.1, 0.25, 0.5, 1.0]
  /** Phân bổ câu hỏi theo 4 mức độ tư duy */
  distribution: {
    recognition: number;       // Nhận biết
    comprehension: number;     // Thông hiểu
    application: number;       // Vận dụng
    high_application: number;  // Vận dụng cao
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
  examType: 'regular' | 'periodic' | 'midterm' | 'final' | 'mock_thpt' | 'entrance' | 'competency';
  totalDurationMinutes: number;
  totalPoints: number;         // Mặc định 10.00 điểm
  sections: BlueprintSectionSpecification[];
  creatorCodeId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 2.5 `Exam` & `ExamSection` (Đề thi hoàn chỉnh)
Đề thi là tập hợp các câu hỏi hoặc cấu trúc chọn câu hỏi theo phân đoạn, gắn với chính sách phòng thi.

```typescript
export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  questionType: QuestionType;
  /** Danh sách ID câu hỏi tham chiếu kèm chỉ định phiên bản chính xác */
  questions: Array<{
    questionId: string;
    questionVersionId: string;
    allocatedPoints: number;
    orderIndex: number;
  }>;
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
  blueprintId?: string;        // Tham chiếu ma trận đề thi nếu có
  
  examType:
    | 'regular'                // Kiểm tra thường xuyên 15 phút
    | 'periodic'               // Kiểm tra định kỳ
    | 'midterm'                // Giữa học kỳ
    | 'final'                  // Cuối học kỳ
    | 'mock_thpt'              // Ôn thi tốt nghiệp THPT
    | 'gifted'                 // Học sinh giỏi
    | 'competency'             // Đánh giá năng lực ĐHQG/ĐHSP
    | 'custom';                // Đề thi tự do giáo viên tạo

  durationMinutes: number;
  totalPoints: number;         // Thường là 10.00
  passPoints?: number;         // Thường là 5.00
  
  sections: ExamSection[];

  // Phân quyền & Duyệt
  visibility: 'private' | 'classroom' | 'public';
  moderationStatus: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  creatorCodeId: string;
  targetClassroomIds?: string[]; // Áp dụng khi visibility === 'classroom'

  // Chính sách thi (Exam Policies)
  policy: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    maxAttempts: number;       // 0 = không giới hạn
    allowReviewAfterSubmit: boolean;
    showExplanationsImmediately: boolean;
    requireContinuousFocus: boolean; // Cảnh báo khi chuyển tab
    allowRetake: boolean;
  };

  // Thống kê tổng hợp (Cache)
  stats?: {
    attemptCount: number;
    completedCount: number;
    averageScore: number;
  };

  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

---

### 3. Miền Lớp học & Phân công Bài tập (Classrooms & Assignments)

#### 3.1 `Classroom` (Lớp học)
Loại bỏ hoàn toàn kiến trúc mảng phẳng `studentUids` để chống tràn giới hạn 1MB của Firestore document. Thành viên được lưu độc lập tại collection con hoặc root collection `classroom_members`.

```typescript
export interface Classroom {
  /** Khóa chính lớp học (Mã 6 chữ số hoặc định danh UUID) */
  id: string;
  schemaVersion: 1;
  className: string;
  subjectId?: string;
  grade: number;
  schoolYear: string;          // e.g. "2025-2026"
  schoolName?: string;
  teacherCodeId: string;       // Bắt buộc tham chiếu CodeID của giáo viên
  joinCode: string;            // Mã tham gia lớp (e.g. "724915")
  allowSelfEnrollment: boolean;
  memberCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

#### 3.2 `ClassroomMember` (Thành viên lớp học)

```typescript
export interface ClassroomMember {
  /** ID duy nhất dạng `${classroomId}_${studentCodeId}` */
  id: string;
  schemaVersion: 1;
  classroomId: string;
  studentCodeId: string;       // Khóa tham chiếu Canonical User
  /** Snapshot dữ liệu học sinh tại thời điểm tham gia */
  cachedNdid: string;          // Bảo toàn Raw String
  cachedDisplayName: string;
  roleInClass: 'student' | 'class_monitor' | 'teaching_assistant';
  joinedAt: string;
  status: 'active' | 'suspended';
  updatedAt: string;
}
```

#### 3.3 `Assignment` (Giao bài tập & Đề thi)
Tách rời độc lập với đề thi, đại diện cho một lần phát động bài thi tới lớp học hoặc cá nhân.

```typescript
export interface Assignment {
  id: string;
  schemaVersion: 1;
  examId: string;
  teacherCodeId: string;
  
  // Phạm vi giao bài
  classroomId: string;
  targetStudentCodeIds?: string[]; // Trống = toàn bộ lớp; Có giá trị = chỉ định nhóm học sinh
  
  // Lịch trình phòng thi
  openTime?: string | null;    // Thời điểm bắt đầu cho phép vào đề (ISO 8601)
  deadlineTime?: string | null;// Hạn chót nộp bài (ISO 8601)
  timeLimitOverrideMinutes?: number | null; // Ghi đè thời lượng nếu cần
  
  attemptLimit: number;        // Số lần làm bài cho phép (mặc định 1)
  isLocked: boolean;           // Khóa khẩn cấp không cho vào thi tiếp

  // Hiển thị & Kiểm duyệt (Public vs Classroom)
  visibility: 'private' | 'classroom' | 'public';
  moderationStatus: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

  titleOverride?: string;
  instructions?: string;
  status: 'active' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

---

### 4. Miền Thực thi Khảo thí, Chấm điểm & Kết quả (Sessions, Submissions & Grading)

#### 4.1 `ExamSession` (Phiên thi xác thực máy chủ)
Thực thể quản lý toàn bộ chu trình sống của một lượt làm bài. **Máy chủ nắm giữ thẩm quyền tuyệt đối về thời gian.**

```typescript
export type SessionStatus =
  | 'created'        // Khởi tạo phiên, chưa bắt đầu tính giờ
  | 'in_progress'    // Đang làm bài, đồng hồ đếm ngược đang chạy
  | 'submitted'      // Đã gửi bài, đang chờ chấm
  | 'grading'        // Đang chấm điểm tự động / thủ công
  | 'graded'         // Đã chấm xong
  | 'expired'        // Hết giờ làm bài quy định máy chủ
  | 'cancelled';     // Phiên bị hủy do vi phạm hoặc lỗi

export interface ExamSession {
  id: string;
  schemaVersion: 1;
  examId: string;
  assignmentId?: string | null;
  studentCodeId: string;
  attemptNumber: number;

  // Ràng buộc thời gian chuẩn máy chủ (Server Authority)
  startedAt: string;           // Thời điểm Server chấp thuận bắt đầu
  expiresAt: string;           // startedAt + durationMinutes + networkBufferSeconds
  submittedAt?: string | null; // Thời điểm Server ghi nhận nhận bài

  status: SessionStatus;
  attemptSeed: string;         // Seed để tái hiện thứ tự câu hỏi và phương án xáo trộn

  /** Bảng đối chiếu câu hỏi và phiên bản câu hỏi được cố định cho phiên thi này */
  questionVersionReferences: Array<{
    questionId: string;
    questionVersionId: string;
    assignedSectionId: string;
    allocatedPoints: number;
    orderIndex: number;
  }>;

  // Autosave phục hồi trạng thái khi mất mạng / đổi thiết bị
  autosaveState?: {
    lastSavedAt: string;
    savedAnswersCount: number;
    answersPayload: Record<string, any>;
  };

  // Bảo mật phiên thi
  securityContext: {
    clientIp?: string;
    userAgent?: string;
    tabSwitchCount: number;
  };

  createdAt: string;
  updatedAt: string;
}
```

#### 4.2 `Submission` (Bài làm nộp lên)
Tách rời bài làm thô của học sinh khỏi kết quả chấm điểm.

```typescript
export interface SubmittedAnswerItem {
  questionId: string;
  questionVersionId: string;
  /** Dữ liệu câu trả lời của thí sinh */
  responsePayload: any;        // e.g. { selectedOptionId: "opt_b" }, { tfAnswers: { a: true, b: false } }
  answeredAt: string;
  timeSpentSeconds?: number;
}

export interface Submission {
  id: string;                  // Trùng với sessionId để bảo đảm Idempotency
  schemaVersion: 1;
  sessionId: string;
  examId: string;
  assignmentId?: string | null;
  studentCodeId: string;
  submittedAt: string;
  clientReportedTime?: string;
  answers: SubmittedAnswerItem[];
  createdAt: string;
}
```

#### 4.3 `GradingRecord` (Bản ghi chấm điểm chi tiết)

```typescript
export type GradingMethod = 'automatic' | 'manual' | 'ai_assisted' | 'hybrid';

export interface QuestionGradingDetail {
  questionId: string;
  questionVersionId: string;
  maxPoints: number;
  awardedPoints: number;
  isCorrect: boolean;
  partialBreakdown?: Record<string, number>; // Điểm chi tiết cho từng ý Đúng/Sai
  teacherFeedback?: string;
  aiSuggestedPoints?: number;
  aiFeedbackText?: string;
  gradingMethod: GradingMethod;
}

export interface GradingRecord {
  id: string;                  // Trùng với submissionId
  schemaVersion: 1;
  submissionId: string;
  sessionId: string;
  examId: string;
  studentCodeId: string;
  
  overallGradingMethod: GradingMethod;
  gradedByCodeId?: string | null; // CodeID giáo viên nếu chấm tay/xác nhận
  
  detailedQuestions: QuestionGradingDetail[];
  
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  
  isFinalized: boolean;        // true nếu toàn bộ câu hỏi (kể cả tự luận) đã chấm xong
  gradedAt: string;
  updatedAt: string;
}
```

#### 4.4 `Result` (Kết quả chính thức được công bố)

```typescript
export interface Result {
  id: string;                  // Trùng với sessionId
  schemaVersion: 1;
  sessionId: string;
  examId: string;
  assignmentId?: string | null;
  classroomId?: string | null;
  studentCodeId: string;
  studentNdid: string;         // Cache hiển thị (Raw string)
  studentDisplayName: string;
  
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;

  sectionScores: Array<{
    sectionId: string;
    sectionTitle: string;
    score: number;
    maxScore: number;
  }>;

  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;

  status: 'provisional' | 'final'; // Tạm thời (đang chờ chấm tự luận) hoặc Chính thức
  publishedToStudent: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 5. Miền Quản trị, Kiểm duyệt & Hệ thống (Admin & Governance)

#### 5.1 `ModerationRecord` (Bản ghi kiểm duyệt bài thi công khai)
Mọi đề thi hoặc bài tập muốn phát hành chế độ `public` bắt buộc phải được thẩm duyệt bởi Quản trị viên.

```typescript
export type ModerationTargetType = 'exam' | 'assignment' | 'question' | 'report';
export type ModerationAction = 'approve' | 'reject' | 'request_changes' | 'archive';

export interface ModerationRecord {
  id: string;
  schemaVersion: 1;
  targetType: ModerationTargetType;
  targetId: string;
  submittedByCodeId: string;
  reviewedByCodeId: string;    // Bắt buộc tham chiếu CodeID của Admin duyệt
  action: ModerationAction;
  reason?: string;             // Lý do từ chối hoặc yêu cầu chỉnh sửa
  previousStatus: string;
  newStatus: string;
  reviewedAt: string;
  metadata?: Record<string, any>;
}
```

#### 5.2 `AnalyticsRecord` (Số liệu phân tích năng lực)

```typescript
export interface AnalyticsRecord {
  id: string;
  schemaVersion: 1;
  targetType: 'student' | 'classroom' | 'exam' | 'topic';
  targetId: string;
  timeWindow: 'weekly' | 'monthly' | 'all_time';
  calculatedAt: string;
  metrics: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    cognitiveLevelBreakdown: {
      recognition: number;
      comprehension: number;
      application: number;
      high_application: number;
    };
    topicWeaknesses?: Array<{ topicId: string; errorRate: number }>;
  };
}
```

#### 5.3 `SystemSetting` (Cấu hình vận hành hệ thống)

```typescript
export interface SystemSetting {
  id: string;                  // e.g. "general", "exam_policies", "feature_flags"
  schemaVersion: 1;
  category: 'general' | 'assessment' | 'security' | 'integrations';
  configPayload: Record<string, any>;
  updatedByCodeId: string;
  updatedAt: string;
}
```

---

## PHẦN II: THIẾT KẾ BỐ CỤC TÀI NGUYÊN FIRESTORE (RESOURCE LAYOUT)

Cơ sở dữ liệu Cloud Firestore trong V3 được phân chia theo cấu trúc Collection chuẩn xác, đảm bảo hiệu năng truy vấn, khả năng bảo mật theo Rules và tuân thủ giới hạn Firestore.

```
Firestore Root
├── subjects/{subjectId}
├── curricula/{curriculumId}
├── textbook_sets/{textbookSetId}
├── grades/{gradeId}
├── topics/{topicId}
├── learning_objectives/{objectiveId}
│
├── question_banks/{bankId}
├── questions/{questionId}
├── question_versions/{versionId}
│
├── exam_blueprints/{blueprintId}
├── exams/{examId}
│
├── classrooms/{classroomId}
├── classroom_members/{memberId}             # Định danh: ${classroomId}_${studentCodeId}
├── assignments/{assignmentId}
│
├── exam_sessions/{sessionId}
├── submissions/{submissionId}               # id === sessionId
├── grading_records/{gradingRecordId}        # id === sessionId
├── results/{resultId}                       # id === sessionId
│
├── moderation_records/{recordId}
├── analytics/{recordId}
└── system_settings/{settingId}
```

### Ma trận Phân quyền & Quản trị Collection

| Tên Collection | Mục đích nghiệp vụ | Chủ sở hữu (Owner) | Quyền Đọc (Read) | Quyền Ghi (Write) | Học sinh | Giáo viên | Quản trị viên |
|---|---|---|---|---|---|---|---|
| `subjects` | Danh mục môn học | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `curricula` | Khung chương trình GD | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `textbook_sets` | Danh mục bộ sách | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `grades` | Danh mục khối lớp | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `topics` | Cây chủ đề môn học | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `learning_objectives` | Ngân hàng YCCĐ | Hệ thống | Public | Server Admin | Đọc | Đọc | Toàn quyền |
| `question_banks` | Ngân hàng câu hỏi | Tác giả (CodeID) | Owner / Shared / Admin | Owner / Admin | Không | Đọc / Ghi của mình | Toàn quyền |
| `questions` | Siêu dữ liệu câu hỏi | Tác giả (CodeID) | Owner / Assigned / Admin | Owner / Admin | Chỉ câu hỏi trong đề được giao | Đọc / Ghi của mình | Toàn quyền |
| `question_versions` | Nội dung & Barem câu hỏi | Tác giả (CodeID) | Rule bảo vệ ranh giới | Server Admin | Chỉ đọc `content` qua Session | Đọc / Ghi của mình | Toàn quyền |
| `exam_blueprints` | Ma trận đặc tả đề thi | Tác giả (CodeID) | Owner / Admin | Owner / Admin | Không | Đọc / Ghi của mình | Toàn quyền |
| `exams` | Đề thi hoàn chỉnh | Tác giả (CodeID) | Phân theo Visibility | Server / Owner | Chỉ đọc đề public hoặc được giao | Đọc / Ghi của mình | Toàn quyền |
| `classrooms` | Lớp học | Giáo viên (CodeID) | Giáo viên & Thành viên lớp | Giáo viên lớp | Đọc lớp mình tham gia | Đọc / Ghi lớp của mình | Toàn quyền |
| `classroom_members` | Thành viên trong lớp | Giáo viên & Học sinh | Thành viên & Giáo viên | Server Function / Giáo viên | Đọc danh sách lớp mình | Quản lý thành viên lớp | Toàn quyền |
| `assignments` | Giao bài thi | Giáo viên (CodeID) | Học sinh được giao & GV | Giáo viên giao bài | Đọc bài giao cho mình | Đọc / Ghi bài của mình | Toàn quyền |
| `exam_sessions` | Phiên làm bài của thí sinh | Thí sinh (CodeID) | Thí sinh & Giáo viên & Admin | **Chỉ Server Cloud Functions** | Đọc phiên của mình | Đọc phiên học sinh lớp mình | Toàn quyền |
| `submissions` | Bài làm nộp lên | Thí sinh (CodeID) | Thí sinh & Giáo viên & Admin | **Chỉ Server Cloud Functions** | Đọc bài nộp của mình | Đọc bài nộp học sinh | Toàn quyền |
| `grading_records` | Bản ghi chấm điểm chi tiết | Hệ thống / Giáo viên | Thí sinh (khi mở) & GV & Admin | **Chỉ Server Cloud Functions** | Đọc điểm bài mình | Chấm bài học sinh | Toàn quyền |
| `results` | Kết quả điểm chính thức | Thí sinh (CodeID) | Thí sinh & Giáo viên & Admin | **Chỉ Server Cloud Functions** | Đọc kết quả của mình | Đọc bảng điểm lớp mình | Toàn quyền |
| `moderation_records`| Nhật ký duyệt nội dung | Quản trị viên | Chỉ Giáo viên gửi & Admin | **Chỉ Server Admin** | Không | Đọc bài mình gửi duyệt | Toàn quyền |
| `analytics` | Thống kê năng lực | Hệ thống | Đối tượng liên quan | Server Background Cron | Đọc năng lực cá nhân | Đọc năng lực lớp mình | Toàn quyền |
| `system_settings` | Cấu hình nền tảng | Chủ sở hữu (Owner) | Public đọc cờ tính năng | **Chỉ Server Admin/Owner** | Chỉ đọc public configs | Chỉ đọc public configs | Toàn quyền |

---

## PHẦN III: THIẾT KẾ TRUY VẤN & CHỈ MỤC TỐI ƯU (INDEX & QUERY DESIGN)

Nhằm ngăn chặn triệt để tình trạng tải toàn bộ Collection về lọc trên trình duyệt (In-browser filtering), các chỉ mục phức hợp (Composite Indexes) bắt buộc phải được khai báo trong `firestore.indexes.json`:

### 1. Chỉ mục cho Ngân hàng Câu hỏi (`questions`)
- Lọc theo Môn học + Khối lớp + Mức độ nhận thức:
  `subjectId ASC, grade ASC, cognitiveLevel ASC, createdAt DESC`
- Lọc theo Môn học + Chủ đề:
  `subjectId ASC, topicId ASC, difficultyScore ASC`
- Lọc câu hỏi của Tác giả:
  `authorCodeId ASC, status ASC, createdAt DESC`

### 2. Chỉ mục cho Đề thi (`exams`)
- Khám phá đề thi công khai trên Trang chủ:
  `visibility ASC, moderationStatus ASC, subjectId ASC, grade ASC, createdAt DESC`
- Quản lý đề thi của Giáo viên:
  `creatorCodeId ASC, status ASC, createdAt DESC`

### 3. Chỉ mục cho Giao bài tập (`assignments`)
- Học sinh tra cứu bài tập của lớp mình:
  `classroomId ASC, status ASC, deadlineTime ASC`

### 4. Chỉ mục cho Phiên thi & Kết quả (`exam_sessions` & `results`)
- Học sinh xem lịch sử làm bài theo đề thi:
  `studentCodeId ASC, examId ASC, startedAt DESC`
- Giáo viên xuất bảng điểm lớp học:
  `classroomId ASC, assignmentId ASC, totalScore DESC, submittedAt ASC`

### 5. Chỉ mục cho Hàng đợi Kiểm duyệt (`moderation_records` & `exams`)
- Quản trị viên lấy danh sách đề thi đang chờ duyệt:
  `moderationStatus ASC, createdAt ASC`

---

## PHẦN IV: TẦNG TƯƠNG THÍCH V2 VÀ BỘ CHUẨN HÓA (COMPATIBILITY & NORMALIZATION ADAPTERS)

Tất cả các thành phần giao diện React của EduSpace V3 sẽ tương tác thông qua lớp Data Access Layer trung gian. Không một component nào phụ thuộc vào hình thái tài liệu gốc.

```
┌──────────────────────────────────────┐
│  Raw Data Source                     │
│  - Legacy static data.js             │
│  - V2 Firestore 'quizzes'            │
│  - V2 Firestore 'attempts'           │
│  - V2 Firestore 'classrooms'         │
│  - V3 Native Firestore Documents    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Version Detector                    │
│  detectSchemaVersion(raw)            │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Normalization Pipeline              │
│  - normalizeExam()                   │
│  - normalizeQuestion()               │
│  - normalizeClassroom()              │
│  - normalizeResult()                 │
│  - normalizeAssignment()             │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Canonical Domain Models (V3)        │
│  (100% Type-Safe TypeScript Model)   │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  React Presentation Layer            │
└──────────────────────────────────────┘
```

### Khế ước hàm chuẩn hóa (Normalization Function Contracts)

```typescript
export interface DataNormalizerContract {
  /** Chuẩn hóa Đề thi từ mọi nguồn (data.js cũ, collection quizzes cũ hoặc V3) */
  normalizeExam(id: string, rawData: any): Exam;

  /** Chuẩn hóa Câu hỏi từ mảng quizData.questions cũ hoặc document V3 */
  normalizeQuestion(id: string, rawData: any, context?: { subjectId?: string; grade?: number }): Question;

  /** Chuẩn hóa Lớp học từ cấu trúc mảng studentUids cũ sang Classroom V3 */
  normalizeClassroom(id: string, rawData: any): Classroom;

  /** Chuẩn hóa Kết quả thi từ attempts cũ sang Result V3 */
  normalizeResult(id: string, rawData: any): Result;

  /** Chuẩn hóa Bài tập */
  normalizeAssignment(id: string, rawData: any): Assignment;
}
```

#### Chi tiết Adapter chuyển đổi dữ liệu V2 hiện hữu:

1. **`data.js` và `quizzes/{quizId}` cũ $\rightarrow$ `Exam` & `Question` V3:**
   - Trường `config.testDuration` (giây) $\rightarrow$ quy đổi thành `durationMinutes` = `Math.round(testDuration / 60)`.
   - Trường `type: "multiple"` $\rightarrow$ chuyển đổi thành `type: "single_choice"`, options dạng mảng chuỗi `["A", "B"]` $\rightarrow$ mảng đối tượng `[{ id: "opt_0", text: "A" }, { id: "opt_1", text: "B" }]`.
   - Trường `type: "truefalse"` $\rightarrow$ chuyển đổi thành `type: "true_false"`, `correctAnswers: [true, false, true, true]` $\rightarrow$ chuyển thành Map `{ item_0: true, item_1: false, item_2: true, item_3: true }`.
   - Trường `type: "short"` $\rightarrow$ chuyển đổi thành `type: "numeric"` (nếu nội dung là số) hoặc `type: "short_answer"`.

2. **`attempts/{attemptId}` cũ $\rightarrow$ `Result` V3:**
   - `studentUid` $\rightarrow$ gán vào `studentCodeId`.
   - `studentNdid` $\rightarrow$ bảo toàn 100% Raw String vào `studentNdid`.
   - `score` $\rightarrow$ gán vào `totalScore`, `totalQuestions * 0.25` $\rightarrow$ `maxScore`.

3. **`classrooms/{classroomId}` cũ $\rightarrow$ `Classroom` & `ClassroomMember` V3:**
   - Trường `studentUids: string[]` phẳng trong document cũ được bộ Normalizer nhận diện và ảo hóa thành danh sách `ClassroomMember` độc lập mà không cần thực hiện migration ghi đè ngay lập tức.

---

## PHẦN V: GIAO KÈO SAO LƯU & AN TOÀN TRƯỚC MIGRATION (BACKUP CONTRACT)

Bất kỳ kế hoạch chạy script nạp hoặc chuyển đổi dữ liệu thực tế nào trong các giai đoạn tiếp theo bắt buộc phải thực thi Giao ước sao lưu (Backup Contract):

1. **Cấu trúc Thư mục Bản sao lưu Đa thế hệ:**
   ```
   backups/
     └── backup_YYYY_MM_DD_HH_MM/
           ├── manifest.json
           ├── schema_version.json
           ├── collections/
           │     ├── users.jsonl
           │     ├── classrooms.jsonl
           │     ├── quizzes.jsonl
           │     ├── attempts.jsonl
           │     └── eduspace_lessons.jsonl
           └── checksum.sha256
   ```

2. **Khế ước Xác thực Bắt buộc (Verification Guard):**
   ```typescript
   export interface BackupManifest {
     backupId: string;
     timestamp: string;
     schemaVersion: number;
     targetCollections: string[];
     totalRecordsCount: number;
     sha256Hash: string;
     offsiteSyncStatus: 'pending' | 'synced_cloudflare_r2' | 'failed';
     verificationStatus: 'unverified' | 'passed' | 'failed';
   }
   ```
   > [!CRITICAL]
   > Quy định bất biến: Nếu bước kiểm tra mã băm `sha256Hash` hoặc kiểm tra số lượng bản ghi của bản sao lưu không đạt trạng thái `passed`, **toàn bộ quy trình migration bị chặn lập tức và huỷ bỏ**.

---

## PHẦN VI: BẢO LƯU PHÂN HỆ CHẤM BÀI TRỰC TUYẾN TƯƠNG LAI (ONLINE JUDGE - OJ)

EduSpace V3 thiết kế trừu tượng hóa phân cấp đối với các dạng đánh giá học thuật:

```
                            ┌──────────────────────────────────────────┐
                            │            Assessment (Base)             │
                            └────────────────────┬─────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
┌──────────────────────────────────────────┐                ┌──────────────────────────────────────────┐
│          StandardExam (V3 Core)          │                │      ProgrammingAssessment (Future OJ)   │
├──────────────────────────────────────────┤                ├──────────────────────────────────────────┤
│ - Các môn văn hóa thông thường           │                │ - Môn Tin học / Khoa học máy tính        │
│ - Trắc nghiệm, Đúng/Sai, Điền số, Tự luận│                │ - Quản lý Test Cases, Time/Memory Limit  │
│ - Chấm điểm máy chủ qua Cloud Functions  │                │ - Gửi qua Message Queue tới Isolated     │
│                                          │                │   Docker Sandbox Runner (Tham chiếu VNOJ)│
└──────────────────────────────────────────┘                └──────────────────────────────────────────┘
```

1. Phân hệ Tin học lập trình trong tương lai sẽ mở rộng từ `QuestionType: 'code_programming'` nhưng cơ chế chấm code sẽ được điều hướng độc lập sang cụm máy chủ chấm thi cô lập (Judge Daemon), tách biệt hoàn toàn khỏi hạ tầng Cloud Functions để bảo đảm an ninh hệ thống.
2. Bộ mã nguồn tham chiếu VNOJ (`d:\Project\WebSite\online-judge-master`) chỉ được sử dụng làm mẫu kiến trúc cho hàng đợi chấm (judge queue) và mã trạng thái phán quyết (`AC`, `WA`, `TLE`, `MLE`, `CE`, `RE`).

---
*Tài liệu này là đặc tả cấu trúc Database chính thức của EduSpace V3. Mọi công việc triển khai cơ sở dữ liệu sẽ tuân thủ tuyệt đối các khế ước trên.*
