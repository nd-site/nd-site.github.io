# EDUSPACE V3 API CONTRACT & ENDPOINT SPECIFICATION
## Server-Authoritative API Contracts, Security Boundaries & Error Semantics

> **Authority:** Source of Truth for Server-Side HTTP / Cloud Functions API Operations in EduSpace V3.  
> **Project:** EduSpace by ND Labs (Version 3.0)  
> **Status:** CANONICAL CONTRACT (Phase 2 Specification)  
> **Execution Environment:** Trusted Backend (Firebase Cloud Functions / Node.js 20+ with Firebase Admin SDK).  
> **Security Baseline:** Client Untrusted. HTTPS Only. Server-Authoritative Time & Grading. Strict Anti-Tampering.  
> **Date:** 16/09/2026  
> **References:** [eduspace-v3-architecture.md](eduspace-v3-architecture.md), [eduspace-v3-database-schema.md](eduspace-v3-database-schema.md), [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md), [SECURITY.md](SECURITY.md), [PROJECT_RULES.md](PROJECT_RULES.md)

---

### CÁC NGUYÊN TẮC THIẾT KẾ BẮT BUỘC (MANDATORY API RULES)

1. **CLIENT HOÀN TOÀN KHÔNG ĐƯỢC TIN CẬY (CLIENT UNTRUSTED):**
   - Trình duyệt chỉ là tầng trình diễn giao diện (Presentation Layer).
   - Client **tuyệt đối không có quyền** tự quyết định điểm số bài thi, tự đặt thời gian hết hạn của phiên thi (`expiresAt`), hoặc tự gán vai trò (`role`).
   - Mọi thao tác tính điểm, duyệt bài, phân quyền và xác nhận nộp bài **bắt buộc phải chạy phía Server**.

2. **BẢO MẬT ĐÁP ÁN TUYỆT ĐỐI (ANSWER KEY ISOLATION):**
   - Trong suốt quá trình thí sinh đang làm bài thi, API tuyệt đối không được trả về đáp án đúng (`correctAnswers`, `gradingPayload`) hoặc lời giải chi tiết (`explanation`) trong payload gửi về trình duyệt.
   - Đáp án đúng chỉ được nạp tại Cloud Functions khi chấm điểm hoặc trả về sau khi kỳ thi đã kết thúc và được giáo viên cho phép xem lại.

3. **BẢO TOÀN DANH TÍNH CANONICAL & NDID:**
   - Mọi yêu cầu API có xác thực đều trích xuất `CodeID` từ `decodedToken.uid` (`request.auth.uid === CodeID`).
   - Mọi thông tin `ndid` trả về từ API phải giữ nguyên 100% Raw String từ cơ sở dữ liệu; tuyệt đối không tự ý chèn tiền tố `@`.
   - Tài khoản Owner `CodeID = "0000"` và phân hệ Thời khóa biểu `TimeTable` nằm ngoài phạm vi can thiệp của các API này.

4. **KHÔNG TẠO API XÓA TRẮNG NGUY HIỂM (NO DESTRUCTIVE WIPE APIS):**
   - Tuyệt đối không cung cấp bất kỳ endpoint nào cho phép xóa toàn bộ collection hoặc drop database.

---

## PHẦN I: TIÊU CHUẨN KỸ THUẬT CHUNG & BỐI CẢNH XÁC THỰC

### 1.1 Chuẩn giao tiếp (Communication Standard)
- **Giao thức:** HTTPS duy nhất (TLS 1.3).
- **Định dạng dữ liệu:** `application/json; charset=utf-8`.
- **Cấu hình CORS:** Chỉ chấp nhận các Origin hợp lệ của hệ thống ND Labs (`https://nd-site.github.io`, `http://localhost:3000`, `http://127.0.0.1:5500`...).
- **Định dạng thời gian:** Chuẩn ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### 1.2 Bối cảnh Xác thực (Authentication Context)
Mọi request yêu cầu xác thực phải gửi kèm Header:
```http
Authorization: Bearer <Firebase_ID_Token>
```

Server xác thực Token bằng `admin.auth().verifyIdToken(token)`:
- `uid`: Khóa chính định danh `CodeID` của người dùng (`"0000"`, `"10042"`...).
- Sau khi giải mã Token, hệ thống truy xuất bản ghi `users/{CodeID}` để xác định bối cảnh:
  ```typescript
  export interface RequestSecurityContext {
    codeId: string;                    // Invariant: decodedToken.uid === codeId
    ndid: string;                      // Canonical Handle (Raw string)
    displayName: string;
    role: 'user' | 'admin';            // Role hệ thống chung
    adminLevel: 'owner' | 'admin' | null;
    eduRole: 'student' | 'teacher' | 'lecturer' | 'college_student'; // Vai trò trong EduSpace
    school?: string;
    grade?: string;
  }
  ```

---

## PHẦN II: GIAO ƯỚC MÃ LỖI THỐNG NHẤT (ERROR CONTRACT)

Mọi phản hồi lỗi từ API của EduSpace V3 đều tuân thủ cấu trúc JSON tiêu chuẩn:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không đúng định dạng.",
    "details": [],
    "retryAllowed": false
  }
}
```

### Bảng Danh mục Mã lỗi Chuẩn tắc (Standard Error Codes)

| Mã lỗi (`code`) | HTTP Status | Thông điệp người dùng an toàn | Cho phép thử lại (`retryAllowed`) | Tình huống kích hoạt |
|---|---|---|---|---|
| `VALIDATION_ERROR` | 400 Bad Request | "Dữ liệu yêu cầu không hợp lệ hoặc thiếu trường bắt buộc." | `false` | Payload không vượt qua kiểm tra schema (Zod validation). |
| `UNAUTHENTICATED` | 401 Unauthorized | "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." | `false` | Thiếu hoặc token không hợp lệ / hết hạn. |
| `FORBIDDEN` | 403 Forbidden | "Bạn không có quyền thực hiện thao tác này." | `false` | Học sinh truy cập đề riêng tư của lớp khác; giáo viên sửa đề người khác. |
| `NOT_FOUND` | 404 Not Found | "Tài nguyên yêu cầu không tồn tại trên hệ thống." | `false` | Không tìm thấy mã đề thi, bài tập hoặc lớp học. |
| `CONFLICT` | 409 Conflict | "Dữ liệu đã tồn tại hoặc trạng thái tài nguyên bị xung đột." | `false` | Học sinh đã tham gia lớp trước đó; trùng mã đề. |
| `RATE_LIMITED` | 429 Too Many Requests | "Thao tác quá nhanh. Vui lòng thử lại sau giây lát." | `true` | Vượt ngưỡng giới hạn tần suất gọi API (Rate limit). |
| `SESSION_EXPIRED` | 410 Gone | "Phiên làm bài đã quá thời gian quy định và đã tự động đóng." | `false` | Nộp bài sau khi thời điểm `expiresAt` máy chủ đã trôi qua. |
| `SUBMISSION_CLOSED` | 423 Locked | "Bài thi hoặc bài tập này đã bị khóa nhận bài." | `false` | Giáo viên đã đóng bài tập hoặc bài thi đã được nộp trước đó. |
| `GRADING_UNAVAILABLE` | 503 Service Unavailable | "Hệ thống chấm điểm tự động đang bận. Vui lòng thử lại sau." | `true` | Quá tải kết nối AI proxy hoặc dịch vụ chấm. |
| `INTERNAL_ERROR` | 500 Internal Error | "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau." | `true` | Lỗi không mong muốn trong Cloud Functions (được ẩn chi tiết kỹ thuật). |

---

## PHẦN III: ĐẶC TẢ CHI TIẾT CÁC NHÓM API (ENDPOINT SPECIFICATIONS)

```
API Endpoints Overview
├── 1. Question Banks API          (/api/v3/question-banks)
├── 2. Questions & Revisions API   (/api/v3/questions)
├── 3. Exam Blueprints API         (/api/v3/exam-blueprints)
├── 4. Exams API                   (/api/v3/exams)
├── 5. Exam Sessions API           (/api/v3/exam-sessions)
├── 6. Submissions & Grading API   (/api/v3/submissions & /api/v3/grading)
├── 7. Results & Gradebook API     (/api/v3/results & /api/v3/classrooms/.../gradebook)
├── 8. Assignments API             (/api/v3/assignments)
├── 9. Classrooms API              (/api/v3/classrooms)
├── 10. Moderation API             (/api/v3/moderation)
└── 11. Admin Management API       (/api/v3/admin)
```

---

### 1. Nhóm API Quản lý Ngân hàng Câu hỏi (Question Banks API)

#### 1.1 `GET /api/v3/question-banks` — Danh sách Ngân hàng câu hỏi
- **Mục đích:** Lấy danh sách các ngân hàng câu hỏi mà người dùng có quyền xem (ngân hàng cá nhân, được chia sẻ hoặc công khai).
- **Xác thực:** Yêu cầu đăng nhập (`role: 'user'` hoặc `'admin'`, `eduRole: 'teacher'`).
- **Query Parameters:**
  - `subjectId` (string, optional)
  - `grade` (number, optional)
  - `scope` (string, optional: `'personal' | 'shared' | 'public'`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "bank_toan_10_kntt",
        "schemaVersion": 1,
        "title": "Ngân hàng Toán 10 KNTT - Học kỳ 1",
        "subjectId": "toan",
        "grade": 10,
        "ownerCodeId": "10042",
        "scope": "personal",
        "questionCount": 125,
        "createdAt": "2026-09-10T08:00:00.000Z"
      }
    ]
  }
  ```

#### 1.2 `POST /api/v3/question-banks` — Khởi tạo Ngân hàng mới
- **Xác thực:** Yêu cầu quyền Giáo viên (`eduRole: 'teacher'` hoặc `role: 'admin'`).
- **Request Body:**
  ```json
  {
    "title": "Ngân hàng Vật lí 11 - Động lực học",
    "description": "Các bài toán chuyên đề Động lực học",
    "subjectId": "vatly",
    "grade": 11,
    "scope": "personal"
  }
  ```
- **Response (201 Created):** Trả về đối tượng `QuestionBank` hoàn chỉnh kèm `id`.

---

### 2. Nhóm API Câu hỏi & Phiên bản Lịch sử (Questions API)

#### 2.1 `GET /api/v3/questions` — Tra cứu Câu hỏi
- **Xác thực:** Giáo viên chỉ đọc được câu hỏi trong ngân hàng của mình / công khai. Học sinh không được phép gọi endpoint danh mục thô này.
- **Query Parameters:** `subjectId`, `grade`, `topicId`, `cognitiveLevel`, `type`, `status`, `limit`, `startAfter`.
- **Response (200 OK):** Danh sách mảng câu hỏi kèm metadata.

#### 2.2 `GET /api/v3/questions/:id` — Chi tiết Câu hỏi
- **Bảo mật phân quyền:**
  - Giáo viên sở hữu / Admin: Nhận đầy đủ `content`, `gradingConfig` (đáp án đúng) và `explanation`.
  - Học sinh: **BỊ CHẶN (403 FORBIDDEN)**. Học sinh chỉ được tiếp nhận nội dung câu hỏi thông qua phiên thi `ExamSession`.

#### 2.3 `POST /api/v3/questions` — Tạo câu hỏi mới (Khởi tạo Version 1)
- **Xác thực:** Giáo viên (`eduRole: 'teacher'`) hoặc Admin.
- **Request Body:**
  ```json
  {
    "questionBankId": "bank_toan_10_kntt",
    "type": "single_choice",
    "subjectId": "toan",
    "grade": 10,
    "topicId": "toan-10-menh-de",
    "learningObjectiveIds": ["YCCD-TOAN-10-01"],
    "cognitiveLevel": "comprehension",
    "difficultyScore": 2,
    "tags": ["mệnh đề", "phủ định"],
    "content": {
      "prompt": "Mệnh đề phủ định của mệnh đề $P: \\forall x \\in \\mathbb{R}, x^2 + 1 > 0$ là:",
      "payload": {
        "options": [
          { "id": "opt_a", "text": "$\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0$" },
          { "id": "opt_b", "text": "$\\exists x \\in \\mathbb{R}, x^2 + 1 < 0$" },
          { "id": "opt_c", "text": "$\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0$" },
          { "id": "opt_d", "text": "$\\forall x \\in \\mathbb{R}, x^2 + 1 < 0$" }
        ]
      }
    },
    "gradingConfig": {
      "payload": {
        "correctOptionId": "opt_a"
      },
      "explanation": "Phủ định của $\\forall$ là $\\exists$, phủ định của $>$ là $\\le$."
    }
  }
  ```
- **Xử lý phía Server:**
  1. Tạo `Question` document với `currentVersionId = "${questionId}_v1"`, `currentVersionNumber = 1`.
  2. Tạo `QuestionVersion` document lưu trữ độc lập nội dung và cấu hình chấm điểm.
- **Response (201 Created):** Trả về ID câu hỏi đã tạo.

#### 2.4 `POST /api/v3/questions/:id/versions` — Cập nhật phiên bản câu hỏi (Revisions)
- **Mục đích:** Sửa đổi câu hỏi mà không làm hỏng dữ liệu các đề thi trong quá khứ.
- **Request Body:** Gửi `content`, `gradingConfig` mới kèm trường `changeSummary: "Sửa lỗi chính tả phương án C"`.
- **Xử lý:** Tăng `versionNumber` lên $N+1$, tạo `QuestionVersion` mới và cập nhật `currentVersionId` của `Question`. Các đề thi cũ giữ nguyên tham chiếu đến phiên bản cũ.

---

### 3. Nhóm API Ma trận Đề thi (Exam Blueprints API)

#### 3.1 `POST /api/v3/exam-blueprints` — Tạo Ma trận Đề thi
- **Xác thực:** Giáo viên hoặc Admin.
- **Request Body:**
  ```json
  {
    "title": "Ma trận Kiểm tra Cuối kì 1 Toán 10 KNTT",
    "subjectId": "toan",
    "grade": 10,
    "examType": "final",
    "totalDurationMinutes": 90,
    "totalPoints": 10.0,
    "sections": [
      {
        "id": "sec_1",
        "title": "Phần I: Trắc nghiệm 4 lựa chọn",
        "questionType": "single_choice",
        "questionCount": 12,
        "pointsPerQuestion": 0.25,
        "distribution": { "recognition": 6, "comprehension": 6, "application": 0, "high_application": 0 }
      },
      {
        "id": "sec_2",
        "title": "Phần II: Trắc nghiệm Đúng/Sai",
        "questionType": "true_false",
        "questionCount": 4,
        "pointsPerQuestion": 1.0,
        "partialScoreLadder": [0.1, 0.25, 0.5, 1.0],
        "distribution": { "recognition": 1, "comprehension": 2, "application": 1, "high_application": 0 }
      },
      {
        "id": "sec_3",
        "title": "Phần III: Trắc nghiệm Trả lời ngắn",
        "questionType": "numeric",
        "questionCount": 6,
        "pointsPerQuestion": 0.5,
        "distribution": { "recognition": 0, "comprehension": 2, "application": 3, "high_application": 1 }
      }
    ]
  }
  ```
- **Xác thực hợp lệ (Validation Rules):**
  $$\sum (\text{questionCount} \times \text{pointsPerQuestion}) = \text{totalPoints} = 10.00$$
  Nếu tổng điểm lệch khỏi 10.00, API trả lỗi `VALIDATION_ERROR`.

---

### 4. Nhóm API Đề thi Hoàn chỉnh (Exams API)

#### 4.1 `GET /api/v3/exams` — Khám phá Đề thi
- **Xác thực:** Công khai hoặc học sinh/giáo viên.
- **Quy tắc lọc hiển thị:**
  - Nếu là khách / học sinh chưa đăng nhập: Chỉ trả về đề `visibility === 'public'` và `moderationStatus === 'approved'`.
  - Nếu là giáo viên: Trả về thêm các đề do chính mình tạo (`creatorCodeId === currentCodeId`).
- **Response (200 OK):** Danh sách đề thi (không chứa nội dung câu trả lời).

#### 4.2 `GET /api/v3/exams/:id` — Chi tiết Đề thi
- **Bảo mật:**
  - Trả về cấu trúc đề, danh sách các phần thi (`sections`), tiêu đề và thời lượng.
  - **TUYỆT ĐỐI KHÔNG TRẢ VỀ ĐÁP ÁN ĐÚNG.**

#### 4.3 `POST /api/v3/exams/:id/publish` — Yêu cầu Xuất bản Đề thi
- **Quy tắc kiểm duyệt:**
  - Nếu `visibility: 'classroom'`: Giáo viên được xuất bản trực tiếp, trạng thái chuyển ngay sang `approved`.
  - Nếu `visibility: 'public'`: Trạng thái chuyển sang `pending_review` và đẩy vào hàng đợi kiểm duyệt của Admin.

---

### 5. Nhóm API Phiên thi Máy chủ Bảo chứng (Exam Sessions API)

#### 5.1 `POST /api/v3/exam-sessions` — Bắt đầu Phiên thi mới
- **Mục đích:** Thí sinh bấm vào làm bài. Máy chủ thiết lập mốc thời gian chính thức và chốt đề thi.
- **Xác thực:** Yêu cầu học sinh đăng nhập.
- **Request Body:**
  ```json
  {
    "examId": "CK1-TOAN-10-2526",
    "assignmentId": "asg_lop_10a1_ck1" // Tùy chọn nếu làm theo bài tập
  }
  ```
- **Quy trình xử lý máy chủ:**
  1. Xác thực quyền làm đề của thí sinh (kiểm tra lớp học, kiểm tra số lần đã thi `attemptCount < maxAttempts`, kiểm tra thời hạn `openTime` và `deadlineTime`).
  2. Ghi nhận thời điểm hiện tại của Server: `startedAt = new Date().toISOString()`.
  3. Tính toán thời điểm hết hạn chính thức:
     $$\text{expiresAt} = \text{startedAt} + \text{durationMinutes} \times 60 + 30\text{s (buffer mạng)}$$
  4. Sinh chuỗi ngẫu nhiên `attemptSeed`.
  5. Cố định danh sách các câu hỏi kèm `questionVersionId` tương ứng.
  6. Tạo bản ghi `exam_sessions/{sessionId}` với `status: 'in_progress'`.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "sessionId": "ses_9941_ck1_toan_10",
    "startedAt": "2026-09-16T12:30:00.000Z",
    "expiresAt": "2026-09-16T14:00:30.000Z",
    "serverNow": "2026-09-16T12:30:00.120Z",
    "attemptSeed": "seed_7a8f9b",
    "exam": {
      "id": "CK1-TOAN-10-2526",
      "title": "Kiểm tra Cuối học kì 1 Toán 10",
      "durationMinutes": 90,
      "sections": [
        {
          "id": "sec_1",
          "title": "Phần I: Trắc nghiệm 4 lựa chọn",
          "questions": [
            {
              "questionId": "q_001",
              "questionVersionId": "q_001_v1",
              "prompt": "Mệnh đề nào sau đây là đúng?",
              "type": "single_choice",
              "options": [
                { "id": "opt_a", "text": "Phương án A" },
                { "id": "opt_b", "text": "Phương án B" }
              ]
            }
          ]
        }
      ]
    }
  }
  ```
  *(Lưu ý: Không hề chứa trường `correctOptionId` hoặc barem điểm).*

#### 5.2 `GET /api/v3/exam-sessions/:id/resume` — Khôi phục Phiên thi đang chạy
- **Mục đích:** Khi thí sinh tải lại trang web, mất kết nối mạng hoặc đổi thiết bị.
- **Xử lý:** Kiểm tra `status === 'in_progress'`. Nếu `serverNow >= expiresAt`, tự động chuyển trạng thái thành `expired` và trả lỗi `SESSION_EXPIRED`. Nếu còn hạn, trả về dữ liệu đề và mảng câu trả lời đã autosave lần gần nhất.

#### 5.3 `POST /api/v3/exam-sessions/:id/autosave` — Tự động lưu bài tạm thời
- **Tần suất gọi:** Định kỳ mỗi 30 giây một lần từ client.
- **Request Body:** `{ "answersPayload": { "q_001": "opt_a", "q_002": { "a": true, "b": false } } }`.
- **Response (200 OK):** `{ "success": true, "savedAt": "..." }`.

#### 5.4 `POST /api/v3/exam-sessions/:id/submit` — Nộp bài chính thức
- **Mục đích:** Thí sinh bấm nộp bài. Khóa phiên thi vĩnh viễn và chuyển sang động cơ chấm điểm.
- **Xác thực:** Bắt buộc `request.auth.uid === session.studentCodeId`.
- **Request Body:**
  ```json
  {
    "answers": [
      {
        "questionId": "q_001",
        "questionVersionId": "q_001_v1",
        "responsePayload": { "selectedOptionId": "opt_a" }
      },
      {
        "questionId": "q_002",
        "questionVersionId": "q_002_v1",
        "responsePayload": { "tfAnswers": { "a": true, "b": false, "c": true, "d": true } }
      }
    ]
  }
  ```
- **Kiểm soát máy chủ:**
  1. Kiểm tra trạng thái phiên: nếu `session.status !== 'in_progress'`, trả lỗi `SUBMISSION_CLOSED`.
  2. Kiểm tra thời gian: Nếu `serverNow > session.expiresAt + 15s`, đánh dấu là nộp muộn (`late`) hoặc hết giờ (`expired`).
  3. Cập nhật phiên thi: `status: 'submitted'`, `submittedAt = serverNow`.
  4. Ghi tài liệu `submissions/{sessionId}` (sử dụng sessionId làm Khóa chống ghi đè Idempotency).
  5. Kích hoạt Động cơ chấm điểm tự động ngầm (Trigger Auto-grading).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "sessionId": "ses_9941_ck1_toan_10",
    "status": "submitted",
    "submittedAt": "2026-09-16T13:45:10.000Z"
  }
  ```

---

### 6. Nhóm API Chấm điểm & Kết quả (Grading & Results API)

#### 6.1 `POST /api/v3/grading/manual` — Giáo viên Chấm bài Tự luận
- **Xác thực:** Giáo viên phụ trách lớp học hoặc Admin.
- **Request Body:**
  ```json
  {
    "submissionId": "ses_9941_ck1_toan_10",
    "questionScores": [
      {
        "questionId": "q_essay_01",
        "awardedPoints": 2.5,
        "teacherFeedback": "Lập luận chặt chẽ, tuy nhiên bước tính cuối cùng còn nhầm dấu."
      }
    ]
  }
  ```
- **Xử lý:** Cập nhật `grading_records`, tính toán lại `totalScore` và cập nhật bản ghi `results` chính thức.

#### 6.2 `POST /api/v3/grading/ai-assist` — Gợi ý Chấm bài Tự luận bằng AI
- **Xác thực:** Giáo viên phụ trách lớp học.
- **Cơ chế:** Cloud Functions đọc đề, barem chấm trong `QuestionVersion` và nội dung bài làm của học sinh, gửi yêu cầu tới Gemini API (thông qua Proxy bảo mật).
- **Ranh giới an toàn:** Trả về điểm số gợi ý và giải thích để **giáo viên tham khảo và phê duyệt**, AI **tuyệt đối không tự ý chốt điểm** vào bảng điểm chính thức.

#### 6.3 `GET /api/v3/results/:id` — Tra cứu Kết quả Làm bài
- **Bảo mật:**
  - Thí sinh chỉ xem được bài của chính mình (`studentCodeId === currentCodeId`).
  - Giáo viên xem được bài của học sinh trong các lớp mình phụ trách.
  - Phụ thuộc cấu hình đề thi (`policy.allowReviewAfterSubmit`): Nếu đề thi chưa cho phép xem lại, chỉ trả về điểm số tổng quan mà không hiển thị chi tiết câu trả lời đúng sai.

---

### 7. Nhóm API Lớp học & Bài tập (Classrooms & Assignments API)

#### 7.1 `POST /api/v3/classrooms` — Tạo Lớp học mới
- **Xác thực:** Giáo viên (`eduRole: 'teacher'`).
- **Request Body:**
  ```json
  {
    "className": "Lớp 10A1 - Toán Chuyên",
    "subjectId": "toan",
    "grade": 10,
    "schoolYear": "2025-2026",
    "schoolName": "THPT Chuyên"
  }
  ```
- **Xử lý:** Tự động sinh mã vào lớp 6 chữ số ngẫu nhiên duy nhất (`joinCode`), tạo bản ghi trong `classrooms`.

#### 7.2 `POST /api/v3/classrooms/join` — Học sinh Tham gia Lớp học bằng Mã
- **Xác thực:** Học sinh (`role: 'user'`).
- **Request Body:** `{ "joinCode": "724915" }`.
- **Xử lý phía Server (Transaction):**
  1. Tìm lớp học có `joinCode === "724915"`. Nếu không thấy, trả lỗi `NOT_FOUND`.
  2. Kiểm tra `classroom_members/${classroomId}_${studentCodeId}`. Nếu đã tồn tại, trả lỗi `CONFLICT`.
  3. Tạo bản ghi `ClassroomMember`.
  4. Tăng trường `memberCount` của `Classroom` lên 1.
- **Response (200 OK):** Thông báo tham gia lớp thành công.

#### 7.3 `POST /api/v3/assignments` — Giao Đề thi cho Lớp học
- **Xác thực:** Giáo viên phụ trách lớp học.
- **Request Body:**
  ```json
  {
    "examId": "CK1-TOAN-10-2526",
    "classroomId": "class_10a1",
    "targetStudentCodeIds": [], // Rỗng = cả lớp
    "openTime": "2026-09-20T07:00:00.000Z",
    "deadlineTime": "2026-09-20T09:00:00.000Z",
    "attemptLimit": 1
  }
  ```
- **Response (201 Created):** Trả về ID bài tập đã tạo.

---

### 8. Nhóm API Kiểm duyệt Cộng đồng (Moderation API)

#### 8.1 `GET /api/v3/moderation/queue` — Danh sách Chờ duyệt
- **Xác thực:** Quản trị viên (`role: 'admin'` hoặc `adminLevel === 'owner'`).
- **Response (200 OK):** Danh sách các đề thi công khai đang ở trạng thái `pending_review`.

#### 8.2 `POST /api/v3/moderation/decide` — Ra quyết định Kiểm duyệt
- **Xác thực:** Quản trị viên.
- **Request Body:**
  ```json
  {
    "targetType": "exam",
    "targetId": "CK1-TOAN-10-2526",
    "action": "approve", // 'approve' | 'reject' | 'request_changes'
    "reason": "Đề thi bám sát ma trận GDPT 2018, chất lượng câu hỏi tốt."
  }
  ```
- **Xử lý:**
  1. Cập nhật `moderationStatus` của đề thi thành `'approved'` (nếu approve) hoặc `'rejected'`.
  2. Tạo bản ghi bất biến trong `moderation_records`.
  3. Ghi log vào `admin_logs`.

---

### 9. Nhóm API Quản trị Hệ thống (Admin Management API)

#### 9.1 `PUT /api/v3/admin/settings/:id` — Cập nhật Cấu hình Nền tảng
- **Xác thực:** Chỉ Quản trị viên cấp cao (`adminLevel: 'owner'` hoặc `'admin'`).
- **Ràng buộc an toàn:** Mọi thao tác cấu hình đều phải lưu lịch sử người sửa `updatedByCodeId`.

#### 9.2 `GET /api/v3/admin/audit-logs` — Truy xuất Nhật ký Kiểm toán
- **Xác thực:** Chỉ Admin.
- **Truy xuất:** Đọc từ collection `admin_logs`, phục vụ việc điều tra và truy vết hành động.

---

## PHẦN IV: RANH GIỚI BẢO MẬT & QUYỀN HẠN (SECURITY BOUNDARIES)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MA TRẬN PHÂN QUYỀN API V3                                    │
├─────────────────────────┬──────────────┬──────────────┬──────────────┬───────────────────────┤
│ Hành động nghiệp vụ     │ Học sinh     │ Giáo viên    │ Quản trị viên│ Ghi chú bảo mật       │
├─────────────────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ Xem đề thi Public       │ ✅ Đọc       │ ✅ Đọc       │ ✅ Đọc       │ Đã duyệt mới xem được │
│ Xem đề chỉ định lớp     │ ✅ Nếu thuộc │ ✅ Nếu là GV │ ✅ Toàn quyền│ Kiểm tra enrollment   │
│ Khởi tạo phiên thi      │ ✅ Cho mình  │ ✅ Thử nghiệm│ ✅ Thử nghiệm│ Server ghi startedAt  │
│ Nộp bài thi             │ ✅ Cho mình  │ ❌           │ ❌           │ Khóa phiên ngay lập tức│
│ Chấm điểm tự luận       │ ❌           │ ✅ Lớp mình  │ ✅ Toàn quyền│ Ghi vào grading_records│
│ Xem đáp án trước khi nộp│ ❌ CẤM       │ ❌           │ ❌           │ Ranh giới bảo mật     │
│ Duyệt bài thi công khai │ ❌           │ ❌           │ ✅ Bắt buộc  │ Phải qua moderation   │
│ Quản lý danh mục học thuật│ ❌         │ ❌           │ ✅ Bắt buộc  │ Chỉ Admin quản trị    │
│ Can thiệp TimeTable     │ ❌ CẤM       │ ❌ CẤM       │ ❌ CẤM       │ Bất biến (Rule 39)    │
│ Thay đổi Owner 0000     │ ❌ CẤM       │ ❌ CẤM       │ ❌ CẤM       │ Bất biến (Rule 40)    │
└─────────────────────────┴──────────────┴──────────────┴──────────────┴───────────────────────┘
```

---
*Tài liệu này là đặc tả giao ước API chính thức của EduSpace V3. Mọi công việc triển khai Cloud Functions và tích hợp Frontend sẽ tuân thủ tuyệt đối các khế ước trên.*
