# EDUSPACE V3 DOMAIN FOUNDATION, REPOSITORIES & COMPATIBILITY SPECIFICATION
## Kiến trúc Mô hình Nghiệp vụ Chuẩn tắc, Lớp Trừu xuất Truy xuất Dữ liệu & Bộ Chuẩn hóa Tương thích V2

> **Tài liệu tham chiếu:** [docs/eduspace-v3-architecture.md](eduspace-v3-architecture.md), [docs/eduspace-v3-database-schema.md](eduspace-v3-database-schema.md), [docs/eduspace-v3-api-contract.md](eduspace-v3-api-contract.md), [.agents/AGENTS.md](../.agents/AGENTS.md)  
> **Dự án:** EduSpace by ND Labs (Phiên bản V3.0)  
> **Giai đoạn:** Phase 3 — Domain Foundation & Repository Layer  
> **Trạng thái:** HOÀN TẤT & ĐƯỢC BẢO CHỨNG BỞI BỘ KIỂM THỬ TỰ ĐỘNG (24/24 TESTS PASSED)  
> **Ngày:** 16/09/2026  

---

### TỔNG QUAN NỀN TẢNG (EXECUTIVE SUMMARY)

Phase 3 thiết lập toàn bộ nền tảng mã nguồn TypeScript chuẩn tắc cho EduSpace V3, bao gồm:
1. **Hệ thống Mô hình Nghiệp vụ Chuẩn tắc (Canonical Domain Models):** 22 thực thể được định kiểu mạnh (Strongly-typed), phân tách rành mạch theo 6 miền chuyên biệt, loại bỏ hoàn toàn cấu trúc monolithic HTML/JS của V2.
2. **Hệ thống Hằng số & Phân loại học GDPT 2018:** 4 cấp độ tư duy nhận thức, 8 phân loại kỳ thi, 9 loại câu hỏi với cấu hình chấm điểm biệt lập.
3. **Cơ chế Nhận diện Phiên bản Lược đồ (Schema Versioning Isolation):** Phân định rạch ròi giữa dữ liệu kế thừa (`schemaVersion: 0` - V2) và dữ liệu chuẩn tắc (`schemaVersion: 1` - V3).
4. **Bộ Chuyển đổi Tương thích Chỉ Đọc (Read-Only Normalizers & Adapters):** Đọc và chuẩn hóa dữ liệu V2 (đề thi `quizzes`, bài nộp `attempts`, lớp học `classrooms`) sang V3 in-memory mà tuyệt đối **không ghi đè, không làm biến đổi dữ liệu production**.
5. **Bảo tồn Tuyệt đối Quy chuẩn NDID RAW STRING:** Bảo lưu 100% chuỗi ký tự nguyên bản của NDID, nghiêm cấm tự ý chèn tiền tố `@` hoặc dùng regex cắt gọt chuỗi từ Database/Admin.
6. **Lớp Trừu xuất Kho lưu trữ Dữ liệu (Repository Layer):** 10 giao diện kho dữ liệu trừu xuất (Contracts) và bộ hiện thực bộ nhớ (In-Memory Implementation) phục vụ chạy kiểm thử độc lập và tách biệt giao diện UI khỏi Firestore.
7. **Khách hàng API Định kiểu (Typed API Client Layer):** Tuân thủ đặc tả REST/Cloud Functions, bắt lỗi chuẩn tắc và đóng gói trong đối tượng lỗi `EduSpaceError` loại trừ rò rỉ stack trace.
8. **Bộ Trợ thủ Phân quyền (Permission Helpers):** Bảo vệ bất biến Tài khoản Owner CodeID `0000`, Quản trị viên, Giáo viên và Học sinh.

---

### PHẦN I: DANH MỤC THỰC THỂ & CẤU TRÚC MIỀN NGHIỆP VỤ

Mã nguồn được tổ chức mô-đun hóa trong thư mục `src/eduspace/core/`:

```
src/eduspace/core/
├── constants/
│   └── index.ts                 # Enums & Constants chuẩn tắc
├── domain/
│   ├── curriculum.ts            # Subject, Curriculum, TextbookSet, Grade, Topic, LearningObjective
│   ├── question.ts              # Question, QuestionVersion, QuestionBank & Payloads
│   ├── exam.ts                  # ExamBlueprint, BlueprintSection, Exam, ExamSection, ExamPolicy
│   ├── session.ts               # ExamSession, SecurityContext, Submission, GradingRecord, Result
│   ├── classroom.ts             # Classroom, ClassroomMember, Assignment
│   ├── governance.ts            # ModerationRecord, AnalyticsRecord, SystemSetting
│   └── index.ts                 # Domain Barrel Export
├── schema/
│   └── version.ts               # Nhận diện phiên bản schemaVersion (0 vs 1)
├── errors/
│   └── EduSpaceError.ts         # 10 mã lỗi chuẩn tắc, status code & envelope
├── permissions/
│   └── helpers.ts               # isOwner, isAdmin, isTeacher, isStudent, canEdit...
├── normalizers/
│   ├── v2QuizAdapter.ts         # Adapter đề thi V2 (Firestore & data.js)
│   ├── v2AttemptAdapter.ts      # Adapter lịch sử làm bài attempts V2
│   ├── v2ClassroomAdapter.ts    # Adapter lớp học classrooms V2
│   ├── normalizers.ts           # Master normalizers với fallback an toàn
│   └── index.ts                 # Normalizers Barrel Export
├── repositories/
│   ├── interfaces.ts            # Hợp đồng 10 Repositories & Bộ lọc (Filters)
│   ├── memoryRepository.ts      # Bộ hiện thực in-memory phục vụ test & offline preview
│   └── index.ts                 # Repositories Barrel Export
├── api/
│   ├── client.ts                # EduSpaceApiClient định kiểu mạnh
│   └── index.ts                 # API Barrel Export
└── index.ts                     # Core Master Barrel Export
```

#### Chi tiết 22 Thực thể Nghiệp vụ Chuẩn tắc:
| Miền (Domain) | Thực thể (Entities) | Vai trò & Mục đích |
|---|---|---|
| **Chương trình học (Curriculum)** | `Subject`, `Curriculum`, `TextbookSet`, `Grade`, `Topic`, `LearningObjective` | Mô hình hóa chuẩn GDPT 2018 theo bộ sách (KNTT, Cánh Diều, Chân Trời Sáng Tạo), phân cấp chủ đề và yêu cầu cần đạt. |
| **Câu hỏi (Question)** | `QuestionBank`, `Question`, `QuestionVersion`, `QuestionMediaAsset` | Ngân hàng câu hỏi, phiên bản hóa lịch sử câu hỏi (`revisions`), tách biệt hoàn toàn nội dung (`content`) khỏi barem đáp án (`gradingConfig`). |
| **Đề thi (Exam)** | `ExamBlueprint`, `BlueprintSectionSpecification`, `Exam`, `ExamSection`, `ExamSectionQuestionRef`, `ExamPolicy` | Ma trận đề thi bám sát tỷ lệ nhận thức, đề thi chính thức với danh sách phần thi và chính sách phòng thi. |
| **Phiên thi & Chấm thi (Session)** | `ExamSession`, `SessionSecurityContext`, `Submission`, `GradingRecord`, `QuestionGradingDetail`, `Result`, `SectionScore` | Phiên làm bài máy chủ bảo chứng (`serverNow`, `expiresAt`), bài nộp bất biến (`idempotent`), hồ sơ chấm điểm tự động/bán tự động và bảng điểm kết quả. |
| **Lớp học & Bài tập (Classroom)** | `Classroom`, `ClassroomMember`, `Assignment` | Quản lý lớp học qua mã `joinCode`, bản ghi học sinh thành viên độc lập (không dùng mảng phẳng không giới hạn), giao bài tập có thời hạn. |
| **Quản trị & Kiểm duyệt (Governance)** | `ModerationRecord`, `AnalyticsRecord`, `SystemSetting` | Nhật ký duyệt đề thi cộng đồng, thống kê phân tích câu hỏi/đề thi, cấu hình hệ thống toàn cục. |

---

### PHẦN II: CƠ CHẾ BẢO MẬT ĐÁP ÁN & ĐỘNG CƠ CÂU HỎI GDPT 2018

1. **Ranh giới Cô lập Đáp án (Answer Key Isolation):**
   Trong thực thể `QuestionVersion`:
   - Trường `content`: Chứa câu hỏi (`prompt`), hình ảnh/video (`mediaAssets`), và nội dung hiển thị các phương án (`options`, `items`, `placeholder`). Đây là phần duy nhất được phép gửi về trình duyệt khi thí sinh đang trong phiên làm bài thi (`ExamSession`).
   - Trường `gradingConfig`: Chứa đáp án đúng (`correctOptionId`, `correctAnswers`, `acceptableAnswers`), thang điểm từng phần (`partialScoreLadder`), hướng dẫn chấm tự luận (`rubricGuide`) và lời giải chi tiết (`explanation`). Trường này **chỉ được truy xuất trên máy chủ/Cloud Functions** khi thực hiện chấm điểm hoặc sau khi kỳ thi đã đóng và giáo viên cho phép xem lại.

2. **Cấu trúc Câu hỏi Đúng/Sai GDPT 2018 (True/False Ladder):**
   Tuân thủ thang điểm Bộ GD&ĐT quy định cho 1 câu gồm 4 ý:
   $$\text{Đúng 1 ý} \rightarrow 0.1\text{ điểm}; \quad \text{Đúng 2 ý} \rightarrow 0.25\text{ điểm}; \quad \text{Đúng 3 ý} \rightarrow 0.5\text{ điểm}; \quad \text{Đúng 4 ý} \rightarrow 1.0\text{ điểm}$$
   Được mô hình hóa chuẩn xác trong `TrueFalseGradingPayload`:
   ```typescript
   export interface TrueFalseGradingPayload {
     correctAnswers: Record<string, boolean>;
     partialScoreLadder: [number, number, number, number]; // [0.1, 0.25, 0.5, 1.0]
   }
   ```

---

### PHẦN III: QUY CHUẨN XỬ LÝ & BẢO TỒN NDID RAW STRING (3 NGUYÊN TẮC)

Tất cả các bộ chuyển đổi tương thích (`v2AttemptAdapter`, `v2ClassroomAdapter`, `normalizers`) đều tuân thủ nghiêm ngặt 3 nguyên tắc cốt lõi:

1. **Bảo tồn 100% Chuỗi Gốc (Raw String Verbatim):**
   Dữ liệu `studentNdid` từ Database hoặc Admin có thể chứa các ký tự đặc biệt như `@`, `#`, `$`, dấu cách. Bộ normalizer giữ nguyên bản chuỗi gốc:
   ```typescript
   const studentNdidRaw = raw.studentNdid || studentCodeId; // Giữ nguyên 100%
   ```
2. **Tuyệt đối Không Tự Chèn Tiền Tố (Prefix "@"):**
   Nghiêm cấm cộng thêm tiền tố `@` vào đầu chuỗi nếu trong cơ sở dữ liệu không có.
   - ❌ Sai: `@${studentNdid}`
   - ✅ Đúng: `${studentNdid}`
   *(Nếu trong DB chuỗi lưu sẵn là `admin@nd` thì hiển thị đúng `admin@nd`, không biến thành `@@admin@nd`).*
3. **Không Chạy Hàm Lọc Xóa Ký Tự (No Stripping):**
   Không chạy regex sanitize đối với biến NDID đã có sẵn trong hệ thống khi đọc dữ liệu hoặc render.

---

### PHẦN IV: HỆ THỐNG MÃ LỖI CHUẨN TẮC & TRỢ THỦ PHÂN QUYỀN

#### 1. Bảng Mã Lỗi `EduSpaceError`
| Mã lỗi (`code`) | HTTP Status | Retry Allowed | Mô tả nghiệp vụ |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | `false` | Dữ liệu đầu vào không hợp lệ hoặc thiếu trường bắt buộc |
| `UNAUTHENTICATED` | 401 | `false` | Chưa đăng nhập hoặc Firebase ID Token đã hết hạn |
| `FORBIDDEN` | 403 | `false` | Không có quyền truy cập đề thi/lớp học của người khác |
| `NOT_FOUND` | 404 | `false` | Không tìm thấy mã đề thi, bài tập hoặc lớp học |
| `CONFLICT` | 409 | `false` | Đã tham gia lớp học trước đó hoặc trùng mã định danh |
| `RATE_LIMITED` | 429 | `true` | Thao tác quá nhanh, vượt ngưỡng an toàn |
| `SESSION_EXPIRED` | 410 | `false` | Phiên làm bài đã quá thời gian `expiresAt` của máy chủ |
| `SUBMISSION_CLOSED` | 423 | `false` | Bài thi hoặc bài tập đã bị khóa nhận bài |
| `GRADING_UNAVAILABLE` | 503 | `true` | Dịch vụ chấm điểm tự động / AI proxy đang bận |
| `INTERNAL_ERROR` | 500 | `true` | Lỗi máy chủ nội bộ (ẩn stack trace) |

#### 2. Trợ thủ Phân quyền & Bất biến Owner 0000
- `isOwner(user)`: Kiểm tra bắt buộc đồng thời `user.codeId === '0000'` VÀ `user.adminLevel === 'owner'`. Ngăn chặn hoàn toàn việc giả mạo CodeID 0000.
- `isAdmin(user)`: Kiểm tra `user.role === 'admin'`.
- `isTeacher(user)`: Kiểm tra `user.eduRole === 'teacher' | 'lecturer'`.
- `isStudent(user)`: Kiểm tra `user.eduRole === 'student' | 'college_student'`.
- `canEditExam(user, exam)`: Cho phép chỉnh sửa nếu là Admin, Owner hoặc chính người tạo đề (`creatorCodeId`). Hỗ trợ truyền tham số linh hoạt cả hai thứ tự `(user, exam)` và `(exam, user)`.

---

### PHẦN V: LỚP KHO LƯU TRỮ (REPOSITORY LAYER) & KHÁCH HÀNG API

1. **Hợp đồng Kho lưu trữ (Interfaces):**
   Bao gồm 10 giao diện trừu xuất: `SubjectRepository`, `QuestionRepository`, `QuestionBankRepository`, `ExamBlueprintRepository`, `ExamRepository`, `ExamSessionRepository`, `SubmissionRepository`, `ResultRepository`, `ClassroomRepository`, `AssignmentRepository`.
   Tất cả các thao tác đều truyền nhận Canonical Domain Types, loại bỏ hoàn toàn sự phụ thuộc trực tiếp của UI vào SDK Firestore.

2. **Hiện thực Bộ nhớ (In-Memory Repository):**
   Cung cấp qua factory `createInMemoryRepositories()`, hỗ trợ clone sâu (Deep clone) độc lập, phục vụ chạy kiểm thử unit test tốc độ cao và preview ngoại tuyến.

3. **Khách hàng API (EduSpaceApiClient):**
   Cung cấp giao tiếp HTTP định kiểu cho tất cả 8 nhóm endpoint nghiệp vụ: Question Banks, Questions, Blueprints, Exams, Sessions (Start, Resume, Autosave, Submit), Grading, Classrooms & Moderation. Tự động chuyển đổi phản hồi lỗi thành `EduSpaceError`.

---

### PHẦN VI: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (VERIFICATION MATRIX)

Bộ kiểm thử được viết tại `tests/eduspace/v3-domain-foundation.test.ts` và thực thi trực tiếp qua `npx tsx --test`:

```
▶ EduSpace V3 Constants & Enums
  ✔ should define all 10 canonical error codes (0.4878ms)
  ✔ should define GDPT 2018 cognitive levels (0.45ms)
  ✔ should define schema versions correctly (0.0958ms)
✔ EduSpace V3 Constants & Enums (1.5785ms)
▶ Schema Version Detection & Isolation
  ✔ detects canonical V3 schema (schemaVersion === 1) (0.1055ms)
  ✔ detects legacy V2 schema when schemaVersion is missing or 0 (0.0682ms)
  ✔ safely handles non-object or nullish inputs (0.066ms)
✔ Schema Version Detection & Isolation (0.3508ms)
▶ Question Normalization & V2 Adapter
  ✔ normalizes legacy V2 single choice question (0.8806ms)
  ✔ normalizes legacy V2 true/false question with GDPT 2018 ladder (0.1779ms)
  ✔ normalizes canonical V3 question preserving structure (0.1766ms)
  ✔ throws EduSpaceError with VALIDATION_ERROR on malformed question data (0.3452ms)
✔ Question Normalization & V2 Adapter (1.7315ms)
▶ Exam Normalization & V2 Quiz Adapter
  ✔ adapts legacy V2 quiz into canonical Exam and questions (0.4827ms)
  ✔ normalizes canonical V3 exam directly (0.2377ms)
✔ Exam Normalization & V2 Quiz Adapter (0.8237ms)
▶ Classroom Normalization & NDID Raw String Rules
  ✔ preserves NDID 100% untouched as Raw String without prefix @ (0.2588ms)
✔ Classroom Normalization & NDID Raw String Rules (0.3054ms)
▶ Attempt / Result Normalization & Raw String NDID
  ✔ maps legacy attempt to canonical Result preserving raw studentNdid (0.1581ms)
✔ Attempt / Result Normalization & Raw String NDID (0.1948ms)
▶ EduSpaceError Canonical Error System
  ✔ generates correct status and structure for all 10 error factories (0.2501ms)
  ✔ toResponse() serializes public envelope without stack trace leak (0.0557ms)
✔ EduSpaceError Canonical Error System (0.343ms)
▶ Domain Permission & Identity Helpers
  ✔ protects Owner CodeID 0000 invariant (0.0782ms)
  ✔ validates teacher and student role permissions (0.056ms)
  ✔ verifies exam and classroom ownership edit rights (0.0475ms)
✔ Domain Permission & Identity Helpers (0.2232ms)
▶ In-Memory Repository Contracts & Operations
  ✔ performs complete Question and Version lifecycle (0.3314ms)
  ✔ manages classroom enrollment and members counter (0.1504ms)
✔ In-Memory Repository Contracts & Operations (0.5227ms)
▶ EduSpaceApiClient Error Mapping & Request Handling
  ✔ handles successful API request with auth token (12.6968ms)
  ✔ maps HTTP 403 response to EduSpaceError FORBIDDEN (0.3391ms)
  ✔ maps HTTP 410 response to EduSpaceError SESSION_EXPIRED (0.2571ms)
✔ EduSpaceApiClient Error Mapping & Request Handling (13.3801ms)
ℹ tests 24
ℹ suites 10
ℹ pass 24
ℹ fail 0
```

- **Kiểm tra TypeScript Compiler (`tsc --noEmit`):** Đạt 0 lỗi biên dịch trên toàn bộ dự án (`exit code 0`).
- **Bảo vệ Hệ thống Độc lập:** Không có bất kỳ tác động nào tới Thời khóa biểu (`TimeTable`), cơ sở dữ liệu `quizzes` V2, tài khoản Owner `0000`, hoặc quy tắc phân quyền cơ bản.
- **Cập nhật Phiên bản Toàn cục:** `assets/js/version.js` đã được cập nhật chính xác thành `ver:1.9.16.1220`.
