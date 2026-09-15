# DATABASE ARCHITECTURE & SCHEMA
## Database Contract — Canonical Architecture vs Legacy Audit (Phase 01-C1)

> **Project:** TimeTable – EduSpace by ND Labs  
> **Store:** Firebase Firestore (Primary Database), Firebase Realtime Database (Operational Config Only)  
> **Status:** CANONICAL CONTRACT — FOUNDATION IMPLEMENTED IN PHASE 01-C1  
> **Last Updated:** 2026-09-05  
> **References:** [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_RULES.md](AUTH_RULES.md), [SECURITY.md](SECURITY.md)

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

# PART I: CANONICAL DATA MODEL (TARGET SPECIFICATION)

## 1. Overview of Canonical Collections & Implementation Status

| Collection / Path | Purpose | Document Key | Client Access | Server Authority | Implementation Status |
|---|---|---|---|---|---|
| `counters/code_ids` | Atomic Sequential Counter | Fixed `code_ids` | ❌ No read/write | ✅ Admin SDK Only | **IMPLEMENTED IN C1** (`allocateCodeId`, `initializeCounter`) |
| `users/{CodeID}` | Canonical User Profile Foundation | `CodeID` (`"0000"`, `"10042"`) | ✅ Read Authenticated | ✅ Admin SDK Only | **IMPLEMENTED IN C1** (`createCanonicalUserFoundation`) |
| `users/{CodeID}/private/security` | Isolated Credential Subcollection | Fixed `security` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C2** (`functions/src/database/security.js`) |
| `users/{CodeID}/private/recovery` | Recovery State Machine & OTPs | Fixed `recovery` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C5** (`functions/src/database/recovery.js`, `functions/src/auth/recovery.js`) |
| `users/{CodeID}/sessions/{sessionId}` | Canonical Active Sessions | `sessionId` (`sess_...`) | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C6** (`functions/src/database/sessions.js`) |
| `users/{CodeID}/devices/{deviceId}` | Trusted Devices Registry | `deviceId` (`dev_...`) | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C6** (`functions/src/database/devices.js`) |
| `users/{CodeID}/private/integrations` | API Keys (Gemini, R2) | Fixed `integrations` | ✅ Own doc only | ✅ Admin SDK Only | DEFERRED (Integrations Phase) |
| `ndids/{normalizedNDID}` | Handle -> CodeID Mapping | `normalizedNDID` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C2** (`functions/src/auth/identity.js`) |
| `emails/{normalizedEmail}` | Email -> CodeID Mapping | `normalizedEmail` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C2** (`functions/src/auth/identity.js`) |
| `idempotency_keys/{key}` | Registration Replay Protection | `idempotencyKey` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C2** (`functions/src/auth/registration.js`) |
| `google_identities/{sub}` | Google Identity Mapping | Google `sub` | ❌ **FORBIDDEN** | ✅ Admin SDK Only | **IMPLEMENTED IN C4** (`functions/src/auth/google.js`) |
| `security_events/{eventId}` | Immutable Audit Log | Auto-generated ID | ✅ Admin read only | ✅ Admin SDK Only | **IMPLEMENTED IN C2** (`functions/src/auth/security_events.js`) |
| `timetables/{timetableId}` | Canonical TimeTable Document | Custom `timetableId` | ✅ Read rules | Owner / Editor | AUDITED (Untouched in C1/C2) |
| `timetables/{id}/comments/{cId}` | Timetable Comments | Auto ID | ✅ Public | Author | AUDITED (Untouched in C1/C2) |
| `timetables/{id}/presence/{sId}` | Realtime Presence | Session ID | ✅ Public | Authenticated | AUDITED (Untouched in C1/C2) |
| `chats/{chatId}` | Direct & Group Chats | `chat_{minCode}_{maxCode}` | Participants | Participants | AUDITED (Untouched in C1/C2) |
| `classrooms/{classroomId}` | Academic Classrooms | Classroom Join Code | Authenticated | Teacher only | AUDITED (Untouched in C1/C2) |
| `quizzes/{quizId}` | Academic Quizzes | Quiz ID | Authenticated | Teacher only | AUDITED (Untouched in C1/C2) |
| `attempts/{attemptId}` | Student Exam Attempts | `{codeId}_{quizId}_{ts}` | Authenticated | Student only | AUDITED (Untouched in C1/C2) |

---

## 2. Implemented Foundation Schemas (Phase 01-C1)

### 2.1 Counter Document: `counters/code_ids` (IMPLEMENTED)
- **Module:** `functions/src/codeid/allocator.js`
- **Location:** Firestore `counters/code_ids`
- **Access:** Server-side only (Admin SDK). Client read and write are completely blocked.
- **Fields:**
  ```typescript
  interface CodeIdCounterDoc {
    nextNumericValue: number;  // Non-negative integer (starts at 0 -> "0000")
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    initializedBy?: string;    // Diagnostic tracking
  }
  ```
- **Behavior & Invariants:**
  - When the counter document does not exist, the first allocation initializes `nextNumericValue = 0`, commits `nextNumericValue = 1`, and returns `"0000"`.
  - Sequential allocations increment monotonically: `0000` -> `0001` -> ... -> `9999` -> `10000` -> `10001` ...
  - Corruption defense: If `nextNumericValue` is negative, non-integer, NaN, or corrupted, `allocateCodeId()` throws `CounterCorruptedError` immediately without falling back to random numbers or timestamps.
  - No reuse: Once allocated, the CodeID is permanently consumed. Even if a subsequent registration step fails, the counter is never rolled back.

### 2.2 Canonical User Foundation Document: `users/{CodeID}` (IMPLEMENTED)
- **Module:** `functions/src/database/users.js`
- **Location:** Firestore `users/{CodeID}`
- **Access:** Server-side creation via `createCanonicalUserFoundation()`.
- **Fields (Foundation):**
  ```typescript
  interface CanonicalUserFoundation {
    codeId: string;            // Invariant: MUST match document ID
    status: 'active' | 'pending' | 'disabled' | 'banned' | 'locked';
    role: 'user' | 'admin';
    adminLevel: 'owner' | 'admin' | null;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    displayName?: string;
    name?: string;
    ndid?: string;
    email?: string;
    emailVerified?: boolean;
    photoURL?: string | null;
    grade?: string | null;
    school?: string | null;
    eduRole?: string | null;
    googleLinked: boolean;
  }
  ```
- **Critical Invariant:**
  `snap.id === data.codeId`. Document ID is the canonical primary key; `data.codeId` is stored for query convenience but must strictly match. Any mismatch throws `InvariantViolationError`.

### 2.3 Google Identity Mapping Document: `google_identities/{googleSubjectId}` (IMPLEMENTED IN C4)
- **Module:** `functions/src/auth/google.js`
- **Location:** Firestore `google_identities/{googleSubjectId}`
- **Access:** Server-side only (Admin SDK). Client read and write are strictly denied (`allow read, write: if false;`).
- **Fields:**
  ```typescript
  interface GoogleIdentityMappingDoc {
    codeId: string;            // Invariant: Immutable canonical CodeID owning this identity
    googleSubjectId: string;   // Google OAuth 'sub' / provider uid
    provider: 'google';
    email: string | null;      // Verified Google email at link time
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
  }
  ```
- **Invariants & Policies:**
  - 1-to-1 Mapping: A Google Subject ID can belong to at most ONE CodeID.
  - Conflict Rejection: Attempting to link an already-linked Google identity to a different CodeID is rejected with HTTP 409 (`GoogleIdentityAlreadyLinkedError`). No automatic account merging is performed.
  - Lockout Prevention: Unlinking is denied if the account lacks a password in `users/{CodeID}/private/security`.

---

# PART II: LEGACY / MIGRATION SOURCE (CURRENT REPOSITORY STATE)

> [!WARNING]
> The structures below represent the **active legacy schema** discovered during the audit.  
> They are preserved for backward compatibility and **MUST NOT be modified or deleted** during Phase 01-C1.

## 3. Legacy Firestore Schemas
- `users/{randomUid}`: Legacy accounts keyed by random Firebase Auth UID. Plaintext passwords in `registeredPassword` (to be migrated in Phase C2/C3).
- `timetables/{timetableId}`: Active schedules using `ownerUid` and `ownerNdid` (preserved untouched).
- `chats/{chatId}`: Active chat rooms (preserved untouched).
- `quizzes/{quizId}` & `attempts/{attemptId}`: Active exam records (preserved untouched).

---

## 4. Hardened Collections & Permissions Summary (Phase 01-C7)

| Collection Path | Read Access | Write Access | Purpose |
|---|---|---|---|
| `users/{codeId}` | Authenticated (`isSignedIn()`) | Self-update (restricted); Admin update (non-privileged) | Canonical user profiles |
| `users/{codeId}/private/**` | **DENY ALL** | Server-only (Admin SDK) | Credentials, password hashes, recovery state |
| `users/{codeId}/sessions/**` | **DENY ALL** | Server-only (Admin SDK) | Multi-device active sessions |
| `users/{codeId}/devices/**` | **DENY ALL** | Server-only (Admin SDK) | Trusted device fingerprint hashes |
| `counters/{counterId}` | **DENY ALL** | Server-only (Admin SDK) | Atomic monotonic CodeID allocation |
| `ndids/{ndid}` | **DENY ALL** | Server-only (Admin SDK) | Unique NDID resolution |
| `emails/{email}` | **DENY ALL** | Server-only (Admin SDK) | Unique email resolution |
| `google_identities/{googleSubjectId}` | **DENY ALL** | Server-only (Admin SDK) | External Google provider resolution |
| `security_events/{eventId}` | Admin Only (`isCallerAdmin()`) | Server-only (Admin SDK) | Tamper-evident security audit log |
| `timetables/{timetableId}` | Unrestricted (`true`) | Unrestricted (`true`) | Preserved untouched (0 mutations) |

---

## 5. Phase 01-C7 Confirmation

> **EXPLICIT CONFIRMATION:**  
> The canonical authorization system, hardened Firestore Security Rules, and legacy auth cutover have been completed.  
> **NO LEGACY DATABASE WAS PURGED, NO LIVE TIMETABLES WERE TOUCHED, AND NO LIVE PRODUCTION DEPLOYMENTS WERE EXECUTED.**
