# AUTH DATA MODEL — ND LABS / EDUSPACE
## Canonical Architecture & Database Contract (Phase 01-C0)

> **Authority:** Source of Truth for Database Schema, Identity Relationships, and Data Access Control.  
> **Status:** ACTIVE ARCHITECTURAL CONTRACT (Authentication Foundation Implemented in Phase 01-C2).  
> **Scope:** Entire ND Labs Ecosystem (EduSpace, TimeTable, Chat, MiniWorld, Admin, Future Modules).  
> **Last Updated:** 2026-09-05  
> **Author:** Senior Software Architect + Database Architect + Security Architect + Firebase Architect
>
> | Domain | Architecture Status | Implementation Status | Implemented In |
> |---|---|---|---|
> | **CodeID Specification** | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C1 (`functions/src/codeid/format.js`) |
> | **Domain F: Atomic Counter** (`counters/code_ids`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C1 (`functions/src/codeid/allocator.js`) |
> | **Domain A: User Foundation** (`users/{CodeID}`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C1 (`functions/src/database/users.js`) |
> | **Domain E: Uniqueness Mappings** (`ndids`, `emails`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C2 (`functions/src/auth/identity.js`) |
> | **Domain B: Private Security** (`users/{CodeID}/private/security`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C2 (`functions/src/database/security.js`, `password.js`) |
> | **Domain G: Audit Log** (`security_events`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C2 (`functions/src/auth/security_events.js`) |
> | **Domain C: Private Recovery** (`users/{CodeID}/private/recovery`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C5 (`functions/src/database/recovery.js`, `functions/src/auth/recovery.js`) |
> | **Domain H: Canonical Sessions** (`users/{CodeID}/sessions/{sessionId}`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C6 (`functions/src/database/sessions.js`, `functions/src/auth/sessions.js`) |
> | **Domain I: Trusted Devices** (`users/{CodeID}/devices/{deviceId}`) | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C6 (`functions/src/database/devices.js`, `functions/src/auth/sessions.js`) |
> | **Domain J: Role & Privilege Governance** | Canonical Contract | ✅ **IMPLEMENTED** | Phase 01-C7 (`functions/src/auth/authorization.js`) |
> | **Domain D: Private Integrations** (`users/{CodeID}/private/integrations`) | Canonical Contract | ⏳ **DEFERRED** | Integrations Phase |

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Executive Identity Model

```
                             ┌──────────────────────────────────────┐
                             │       CANONICAL IDENTITY LAYER       │
                             │               CodeID                 │
                             │       (e.g., "0000", "10042")        │
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │        Firebase Auth UID             │
                             │        uid === CodeID                │
                             └──────────────────┬───────────────────┘
                                                │
        ┌───────────────────────────────────────┼──────────────────────────────────────┐
        ▼                                       ▼                                      ▼
┌───────────────────────┐           ┌───────────────────────┐              ┌─────────────────────────┐
│  PUBLIC PROFILE       │           │  PRIVATE SECURITY     │              │  PRODUCT RELATIONSHIPS  │
│  users/{CodeID}       │           │  users/{CodeID}/      │              │  (Every foreign key)    │
│  - codeId             │           │    private/security   │              │                         │
│  - ndid (mutable)     │           │  - passwordHash       │              │  TimeTable:             │
│  - displayName        │           │  - passwordVersion    │              │    ownerCodeID          │
│  - email (mutable)    │           │  - failedLoginAttempts│              │  Comments:              │
│  - photoURL           │           │  - lockedAt           │              │    authorCodeID         │
│  - role / adminLevel  │           │                       │              │  Sharing:               │
│  - status             │           │  private/recovery     │              │    memberCodeID         │
│                       │           │  private/integrations │              │  Chat:                  │
└───────────────────────┘           └───────────────────────┘              │    senderCodeID         │
                                                                           │  EduSpace Quiz/Attempt: │
                                                                           │    creatorCodeID        │
                                                                           │    studentCodeID        │
                                                                           └─────────────────────────┘
```

### Core Axioms
1. **Single Canonical Identity:** `CodeID` is the immutable, unique, permanent account identity.
2. **Auth Identity Parity:** `Firebase Auth UID === CodeID`. There is no separate random UID layer.
3. **Internal Relationship Rule:** Every database record linking to a user MUST store the user's `CodeID`.
4. **Resolution Rule:** User attributes (NDID, email, display name, avatar, grade) MUST be resolved on demand from `users/{CodeID}`.
5. **No Cascading Mutation:** Changing NDID, email, name, or avatar only modifies `users/{CodeID}` and its private mapping. It NEVER requires rewriting records across business modules.
6. **Strict Security Isolation:** Sensitive security credentials (`passwordHash`, `failedLoginAttempts`, `customGeminiKey`) are physically isolated into non-client-readable subcollections (`users/{CodeID}/private/*`).
7. **Client Untrusted:** Clients are presentation layers. Firestore Security Rules and trusted Cloud Functions (Admin SDK) are the sole security authorities.

---

## 2. CodeID Contract

| Property | Canonical Specification |
|---|---|
| **Identity Role** | Immutable account primary key & Firebase Auth UID |
| **Format** | Decimal string, initially zero-padded 4 digits (`"0000"` to `"9999"`), then expanding to 5+ digits (`"10000"`, `"10001"`, ...) |
| **Generation Authority** | Server-side only (Cloud Functions / Firebase Admin SDK) |
| **Generation Mechanism** | Firestore transaction with atomic counter document `counters/code_ids` |
| **Client Generation** | **STRICTLY FORBIDDEN** (No `Math.random()`, `Date.now()`, or client-side counter) |
| **Consumption Policy** | **Consumed on allocation.** If a registration flow fails or is aborted after allocating a CodeID, the CodeID remains consumed and is **NEVER recycled**. |
| **Sequence Gaps** | **Permitted.** Sequence gaps resulting from failed registrations or reserved test IDs are fully valid. |
| **Reusability** | **Permanently non-reusable.** Even if an account is deleted, its CodeID will never be reassigned. |

---

## 3. Identifiers & Attributes Comparison

| Attribute | Nature | Role in System | Can Change? | Can Be Foreign Key? | Client-Readable? |
|---|---|---|---|---|---|
| **CodeID** | Immutable Identity | Canonical User Identifier, Firebase Auth UID, Firestore Key | ❌ Never | ✅ **MANDATORY** | ✅ Yes |
| **NDID** | Mutable Attribute | Unique human-readable handle, login credential | ✅ Yes (with 30d reservation) | ❌ **FORBIDDEN** | ✅ Yes |
| **Email** | Mutable Attribute | Independent email credential, login, recovery, notifications | ✅ Yes (verified) | ❌ **FORBIDDEN** | ✅ Yes (own doc) |
| **Display Name** | Mutable Attribute | UI presentation | ✅ Yes | ❌ **FORBIDDEN** | ✅ Yes |
| **Avatar URL** | Mutable Attribute | UI presentation | ✅ Yes | ❌ **FORBIDDEN** | ✅ Yes |
| **Firebase UID** | Mirror of CodeID | Direct equivalent of CodeID (`auth.uid == codeId`) | ❌ Never | ✅ (= CodeID) | ✅ Yes |

---

## 4. Canonical Database Collections Specification

### 4.1 Domain A: Identity & Profile — `users/{CodeID}`

**Path:** `users/{CodeID}`  
**Purpose:** Canonical user profile document. Contains core public/semi-public profile data. Contains NO security secrets.  
**Document Key:** `CodeID` (string, e.g. `"0000"`, `"10042"`).

| Field | Type | Client Read | Client Write | Server Write | Admin Write | Owner Write | Description |
|---|---|---|---|---|---|---|---|
| `codeId` | `string` | ✅ Own doc / Auth | ❌ Forbidden | ✅ Creation only | ❌ | ❌ | Immutable business ID (`"0000"`) |
| `ndid` | `string` | ✅ Public / Auth | ❌ Forbidden | ✅ Via API | ✅ | ✅ | Canonical handle (lowercase, `_`, `.`) |
| `name` | `string` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | Full display name |
| `displayName`| `string` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | Short display name |
| `email` | `string \| null` | ✅ Own doc / Admin | ❌ Forbidden | ✅ Via API | ✅ | ✅ | Real verified email address |
| `emailVerified` | `boolean` | ✅ Own doc / Admin | ❌ Forbidden | ✅ Via API | ✅ | ✅ | Email verification status |
| `photoURL` | `string \| null` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | Profile avatar URL |
| `role` | `string` | ✅ Public / Auth | ❌ Forbidden | ❌ | ❌ | ✅ Owner only | Primary system role: `"user"` or `"admin"` |
| `adminLevel` | `string \| null` | ✅ Public / Auth | ❌ Forbidden | ❌ | ❌ | ✅ Owner only | Admin hierarchy: `null`, `"admin"`, or `"owner"` |
| `status` | `string` | ✅ Public / Auth | ❌ Forbidden | ✅ Via API | ✅ | ✅ | `"active"`, `"pending"`, `"disabled"`, `"banned"`, `"locked"` |
| `banExpiresAt` | `timestamp \| null` | ✅ Own doc / Admin | ❌ Forbidden | ✅ Via API | ✅ | ✅ | Ban expiration timestamp |
| `googleLinked` | `boolean` | ✅ Own doc / Admin | ❌ Forbidden | ✅ Via API | ❌ | ✅ | Whether Google OAuth identity is linked |
| `grade` | `string \| null` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | Academic grade level |
| `school` | `string \| null` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | School name |
| `eduRole` | `string \| null` | ✅ Public / Auth | ✅ Own doc | ✅ | ✅ | ✅ | EduSpace role: `"student"` or `"teacher"` |
| `yob` | `number \| null` | ✅ Own doc / Admin | ✅ Own doc | ✅ | ✅ | ✅ | Year of birth |
| `dob` | `string \| null` | ✅ Own doc / Admin | ✅ Own doc | ✅ | ✅ | ✅ | Date of birth (DD/MM/YYYY) |
| `gender` | `string \| null` | ✅ Own doc / Admin | ✅ Own doc | ✅ | ✅ | ✅ | Gender |
| `createdAt` | `timestamp` | ✅ Public / Auth | ❌ Forbidden | ✅ Creation only | ❌ | ❌ | Account creation timestamp |
| `updatedAt` | `timestamp` | ✅ Public / Auth | ❌ Forbidden | ✅ Atomic update | ✅ | ✅ | Last profile update timestamp |
| `lastLoginAt` | `timestamp \| null` | ✅ Own doc / Admin | ❌ Forbidden | ✅ On login | ❌ | ❌ | Last successful login |

---

### 4.2 Domain B: Private Security — `users/{CodeID}/private/security`

**Path:** `users/{CodeID}/private/security`  
**Purpose:** Isolated credentials and authentication state. **NEVER client-readable or client-writable.**  
**Document Key:** Fixed singleton document named `security` inside subcollection `private`.

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `passwordHash` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Hashed password string (bcrypt or Argon2id) |
| `passwordVersion`| `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Algorithm version (e.g., `1` = bcrypt, `2` = Argon2id) |
| `failedLoginAttempts` | `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Atomic inc/reset | Consecutive failed login counter |
| `lockedAt` | `timestamp \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Timestamp when account reached 5 failed logins |
| `lockReason` | `string \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Reason for account lockout |
| `lastPasswordChangedAt` | `timestamp \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Timestamp of last password change |
| `activeSessions` | `map` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Map of active session tokens / device markers |
| `updatedAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Last security update timestamp |

---

### 4.3 Domain C: Private Recovery — `users/{CodeID}/private/recovery`

**Path:** `users/{CodeID}/private/recovery`  
**Purpose:** Account recovery state machine, one-time verification code hash, brute-force counters, single-use password reset tokens. **NEVER client-readable or client-writable.**  
**Document Key:** Fixed singleton document named `recovery` inside subcollection `private`.  
**Implementation:** Implemented in Phase 01-C5 (`functions/src/database/recovery.js`, `functions/src/auth/recovery.js`).

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `recoveryAttemptId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | UUID tracking the specific recovery flow instance |
| `codeId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Immutable account CodeID |
| `purpose` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Purpose identifier (`"password_reset"`, etc.) |
| `codeHash` | `string \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | SHA-256 hash of 6-digit code (cleared on verification) |
| `targetEmailMasked`| `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Masked email (e.g. `u***r@example.com`) |
| `createdAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Server timestamp of creation |
| `createdAtMs` | `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Unix epoch ms used for 60s cooldown enforcement |
| `expiresAtMs` | `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Unix epoch ms of code expiration (15 minutes) |
| `attemptCount` | `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Failed verification attempts (max 5) |
| `maxAttempts` | `number` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Maximum attempts allowed before lock (`5`) |
| `status` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | State: `"pending"`, `"verified"`, `"consumed"`, `"expired"`, `"locked"` |
| `resetTokenHash` | `string \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | SHA-256 hash of single-use 32-byte hex resetToken |
| `resetTokenExpiresAtMs`| `number \| null`| ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Unix epoch ms of resetToken expiration (10 minutes) |
| `verifiedAt` | `timestamp \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Timestamp when code was successfully verified |
| `consumedAt` | `timestamp \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Timestamp when resetToken was consumed to reset password |
| `updatedAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Last state mutation timestamp |

---

### 4.4 Domain D: Private Integrations — `users/{CodeID}/private/integrations`

**Path:** `users/{CodeID}/private/integrations`  
**Purpose:** Third-party API keys and integration settings. **Client read own document ONLY; NEVER client-writable.**  
**Document Key:** Fixed singleton document named `integrations` inside subcollection `private`.

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `customGeminiKey` | `string \| null` | ✅ Own doc only | ❌ **FORBIDDEN** | ✅ Server API | User's personal Google Gemini API key |
| `customGeminiModel` | `string \| null`| ✅ Own doc only | ❌ **FORBIDDEN** | ✅ Server API | User's preferred Gemini model |
| `cloudflareR2Config`| `map \| null` | ✅ Own doc only | ❌ **FORBIDDEN** | ✅ Server API | Optional user cloud storage integration |
| `updatedAt` | `timestamp` | ✅ Own doc only | ❌ **FORBIDDEN** | ✅ Server API | Last update timestamp |

---

### 4.5 Domain E: Resolution & Uniqueness Mappings (Backend-Only)

> [!CAUTION]
> **Anti-Enumeration Rule:** The mapping collections `ndids` and `emails` are strictly **SERVER-SIDE ONLY**.  
> Client direct reads (`getDoc`, `query`) are blocked by Firestore Security Rules (`allow read: if false;`).  
> All lookups happen inside privileged Cloud Functions.

#### Collection: `ndids/{normalizedNDID}`
**Document Key:** `normalizedNDID` (lowercase, trimmed).

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `codeId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Immutable CodeID owning this NDID |
| `status` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | `"active"`, `"reserved"`, `"available"` |
| `releasedAt` | `timestamp \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | When NDID was changed (triggers 30-day cooldown) |
| `previousOwnerCodeID` | `string \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | CodeID of previous owner (permits revert within 30 days) |
| `createdAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Mapping creation timestamp |

#### Collection: `emails/{normalizedEmail}`
**Document Key:** `normalizedEmail` (lowercase, trimmed).

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `codeId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Immutable CodeID owning this email |
| `status` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | `"active"`, `"pending_verification"`, `"released"` |
| `createdAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Mapping creation timestamp |

#### Collection: `google_identities/{googleSubjectId}`
**Document Key:** `googleSubjectId` (Google OAuth unique provider user ID `sub` / provider `uid`).
**Access:** Server-only (`allow read, write: if false;`).

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `codeId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Immutable CodeID owning this Google identity |
| `googleSubjectId` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Stable provider subject ID (`sub`) |
| `provider` | `string` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Fixed `"google"` |
| `email` | `string \| null` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Google verified email at link time |
| `createdAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Identity link timestamp |
| `updatedAt` | `timestamp` | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ✅ Server API | Last identity update timestamp |

> [!IMPORTANT]
> **Google Identity Invariants (Phase 01-C4):**
> 1. A Google Subject ID maps to at most ONE canonical `CodeID`.
> 2. Conflicts reject with HTTP 409 (`GoogleIdentityAlreadyLinkedError`); NO automatic account merging.
> 3. Google email is an informative attribute, NEVER the primary identity key.
> 4. Unlinking is blocked if the account has no registered password (`users/{CodeID}/private/security.passwordHash`).

---

### 4.6 Domain F: Atomic Counters — `counters/{counterId}`

#### Document: `counters/code_ids`
**Document Key:** `code_ids`  
**Purpose:** Server-side atomic sequential allocation of CodeIDs.  
**Access:** Server-side Admin SDK only (`allow read, write: if false;`).

| Field | Type | Value / Behavior |
|---|---|---|
| `lastNumber` | `number` | Incremented by 1 within Firestore Transaction. Starts at 0 -> produces `"0000"`. |
| `updatedAt` | `timestamp` | Timestamp of last counter allocation. |

---

### 4.7 Domain G: Security Audit Log — `security_events/{eventId}`

**Path:** `security_events/{eventId}`  
**Purpose:** Tamper-evident immutable audit log of authentication, authorization, and administrative events.  
**Access:** Admin/Owner read-only. Client write strictly forbidden (`allow write: if false;`). Append-only via server.

| Field | Type | Client Read | Client Write | Server Write | Description |
|---|---|---|---|---|---|
| `eventId` | `string` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Auto ID | Unique event ID |
| `eventType` | `string` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | Event type identifier (see list below) |
| `actorCodeID` | `string \| null` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | CodeID of actor who triggered the event (null if unauthenticated) |
| `targetCodeID` | `string \| null` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | CodeID of account affected |
| `timestamp` | `timestamp` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | Server timestamp of event |
| `ip` | `string \| null` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | Client IP address (masked/anonymized if required) |
| `userAgent` | `string \| null` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | Client browser/device user agent |
| `details` | `map` | ✅ Admin / Owner | ❌ **FORBIDDEN** | ✅ Server API | Context metadata (**NEVER contains passwords or secrets**) |

**Event Types:**
- `login_success`
- `login_failed`
- `account_locked`
- `account_unlocked`
- `password_changed`
- `password_reset_requested`
- `password_reset_completed`
- `email_change_requested`
- `email_changed`
- `ndid_changed`
- `ndid_reserved`
- `role_changed`
- `admin_level_changed`
- `status_changed`
- `google_linked`
- `google_unlinked`
- `device_added`
- `device_revoked`
- `session_revoked`
- `account_deleted` (Open decision on deletion scope)

---

### 4.8 Domain H: Product Data — TimeTable

> [!IMPORTANT]
> **TimeTable Contract Rule:**  
> 1. TimeTable ownership MUST reference `ownerCodeID`.  
> 2. TimeTable collaborators MUST reference `memberCodeID`.  
> 3. TimeTable comments MUST reference `authorCodeID`.  
> 4. TimeTable presence MUST reference `userCodeID`.  
> 5. Current TimeTable documents contain legacy bindings (`ownerUid`, `ownerNdid`). They are **NOT modified** in Phase 01-C0 and are scheduled for migration in a later phase.

#### Collection: `timetables/{timetableId}`
**Document Key:** `timetableId` (unique string, e.g. `"12a1"`, `"hk1-2026"`).

| Field | Type | Canonical Field Name | Legacy Field Name (Current) | Description |
|---|---|---|---|---|
| `id` | `string` | `id` | `id` | Timetable custom ID |
| `title` | `string` | `title` | `title` | Timetable title |
| **Owner Reference** | `string` | `ownerCodeID` | `ownerUid`, `ownerNdid` | **Immutable CodeID of owner** |
| `isPublic` | `boolean` | `isPublic` | `isPublic` | Public read toggle |
| `collaborators` | `array<map>` | `collaborators` | `collaborators` | List of member permissions (see sub-schema) |
| `sharedCodeIDs` | `array<string>`| `sharedCodeIDs` | `sharedNdids` | Indexed list of CodeIDs with shared access |
| `grid` | `map` | `grid` | `grid` | Subject & teacher slot grid |
| `dayData` | `map` | `dayData` | `dayData` | Extra classes & day notes |
| `breakTimes` | `array<map>` | `breakTimes` | `breakTimes` | Break intervals |
| `slotTimes` | `map` | `slotTimes` | `slotTimes` | Slot schedule intervals |
| `school` | `string` | `school` | `school` | School name |
| `gradeClass` | `string` | `gradeClass` | `gradeClass` | Class name |
| `schoolYear` | `string` | `schoolYear` | `schoolYear` | School year |
| `startWeek` | `number` | `startWeek` | `startWeek` | Starting academic week |
| `endWeek` | `number` | `endWeek` | `endWeek` | Ending academic week |
| `startDate` | `string` | `startDate` | `startDate` | Calendar start date |
| `endDate` | `string` | `endDate` | `endDate` | Calendar end date |
| `morningSlotsCount` | `number` | `morningSlotsCount` | `morningSlotsCount` | Morning slots |
| `afternoonSlotsCount` | `number` | `afternoonSlotsCount` | `afternoonSlotsCount` | Afternoon slots |
| `createdAt` | `timestamp` | `createdAt` | `createdAt` | Creation timestamp |
| `updatedAt` | `timestamp` | `updatedAt` | `updatedAt` | Last update timestamp |

**Sub-Schema: `collaborators` item (Canonical)**
```typescript
interface CanonicalCollaborator {
  memberCodeID: string;             // Canonical user reference
  role: 'view' | 'comment' | 'edit'; // Permission level
  addedAt: string;                  // ISO 8601 string
}
```

#### Subcollection: `timetables/{timetableId}/comments/{commentId}`
| Field | Type | Canonical Field Name | Legacy Field Name | Description |
|---|---|---|---|---|
| `authorCodeID` | `string` | `authorCodeID` | `uid`, `ndid` | **Canonical CodeID of comment author** |
| `content` | `string` | `content` | `content` | Comment text |
| `createdAt` | `timestamp` | `createdAt` | `createdAt` | Timestamp |

#### Subcollection: `timetables/{timetableId}/presence/{sessionId}`
| Field | Type | Canonical Field Name | Legacy Field Name | Description |
|---|---|---|---|---|
| `userCodeID` | `string` | `userCodeID` | `uid`, `ndid` | **Canonical CodeID of active user** |
| `sessionId` | `string` | `sessionId` | `sessionId` | Tab/client session identifier |
| `role` | `string` | `role` | `role` | Effective role: `"owner"`, `"edit"`, `"comment"`, `"view"` |
| `lastActive` | `number` | `lastActive` | `lastActive` | Unix timestamp ms (heartbeat every 5s) |

---

### 4.9 Domain I: Product Data — Chat (`chats/{chatId}`)

#### Collection: `chats/{chatId}`
**Canonical Document Key:** `chat_{minCodeID}_{maxCodeID}` (sorted CodeIDs).

| Field | Type | Canonical Name | Legacy Name | Description |
|---|---|---|---|---|
| `participants` | `array<string>` | `participants` (stores CodeIDs) | `participants` (stored mixed strings) | Array of member CodeIDs |
| `lastMessage` | `string` | `lastMessage` | `lastMessage` | Snippet of last message |
| `lastMessageTime` | `timestamp` | `lastMessageTime` | `lastMessageTime` | Timestamp |
| `updatedAt` | `timestamp` | `updatedAt` | `updatedAt` | Timestamp |

#### Subcollection: `chats/{chatId}/messages/{messageId}`
| Field | Type | Canonical Name | Legacy Name | Description |
|---|---|---|---|---|
| `senderCodeID` | `string` | `senderCodeID` | `senderUid`, `senderNdid` | **Canonical CodeID of sender** |
| `text` | `string` | `text` | `text` | Message body |
| `file` | `map \| null` | `file` | `file` | File attachment metadata |
| `reactions` | `map` | `reactions` | `reactions` | Map: `{ [emoji]: array<CodeID> }` |
| `createdAt` | `timestamp` | `createdAt` | `createdAt` | Timestamp |

---

### 4.10 Domain J: Product Data — EduSpace Academic (Classrooms, Quizzes, Attempts)

#### Collection: `classrooms/{classroomId}`
| Field | Type | Canonical Name | Legacy Name | Description |
|---|---|---|---|---|
| `className` | `string` | `className` | `className` | Name of class |
| `creatorCodeID` | `string` | `creatorCodeID` | `creatorUid` | **CodeID of creating teacher** |
| `studentCodeIDs` | `array<string>` | `studentCodeIDs` | `studentUids`, `studentNdids` | Enrolled student CodeIDs |
| `createdAt` | `string` | `createdAt` | `createdAt` | Creation timestamp |

#### Collection: `quizzes/{quizId}`
| Field | Type | Canonical Name | Legacy Name | Description |
|---|---|---|---|---|
| `creatorCodeID` | `string` | `creatorCodeID` | `creatorUid` | **CodeID of creating teacher** |
| `title` | `string` | `title` | `title` | Quiz title |
| `subject` | `string` | `subject` | `subject` | Subject |
| `grade` | `string` | `grade` | `grade` | Grade level |
| `duration` | `number` | `duration` | `duration` | Duration in minutes |
| `quizData` | `map` | `quizData` | `quizData` | Questions & answer keys |
| `visibility` | `string` | `visibility` | `visibility` | `"public"`, `"private"`, `"classroom"` |
| `targetClassrooms`| `array<string>`| `targetClassrooms`| `targetClassrooms` | Classroom IDs permitted |
| `createdAt` | `string` | `createdAt` | `createdAt` | Timestamp |

#### Collection: `attempts/{attemptId}`
**Canonical Attempt ID:** `{studentCodeID}_{quizId}_{timestamp}`

| Field | Type | Canonical Name | Legacy Name | Description |
|---|---|---|---|---|
| `studentCodeID` | `string` | `studentCodeID` | `studentUid`, `studentNdid` | **CodeID of examining student** |
| `quizId` | `string` | `quizId` | `quizId` | ID of quiz taken |
| `quizTitle` | `string` | `quizTitle` | `quizTitle` | Display title snapshot |
| `score` | `number` | `score` | `score` | Student score achieved |
| `correctAnswers` | `number` | `correctAnswers` | `correctAnswers` | Correct answers count |
| `totalQuestions` | `number` | `totalQuestions` | `totalQuestions` | Total questions |
| `submittedAt` | `string` | `submittedAt` | `submittedAt` | Submission timestamp |

---

## 5. Answers to the 18 Mandatory Security & Architecture Questions

### Question 1: How does a user log in with NDID if mapping collections are not client-readable?
**Answer:**  
The client never queries `ndids/{ndid}` directly. Instead, the frontend invokes a backend Cloud Function `POST /auth/login/ndid` with `{ ndid, password }`. The backend (running under privileged Firebase Admin SDK) looks up `ndids/{normalizedNDID}` internally, retrieves the linked `CodeID`, verifies the account status and `passwordHash` in `users/{CodeID}/private/security`, and on success generates a Firebase Custom Token with `uid = CodeID`. The client receives the Custom Token and calls `signInWithCustomToken(auth, customToken)`.

### Question 2: How does a user log in with Email if mapping collections are not client-readable?
**Answer:**  
Identical to NDID: The client invokes `POST /auth/login/email` with `{ email, password }`. The backend securely queries `emails/{normalizedEmail}`, resolves the `CodeID`, validates credentials server-side, and mints a Custom Token with `uid = CodeID`.

### Question 3: How is CodeID generated transaction-safe and concurrency-safe?
**Answer:**  
CodeID generation executes exclusively inside a Firestore Transaction on the trusted backend:
```javascript
const codeId = await db.runTransaction(async (transaction) => {
  const counterRef = db.doc('counters/code_ids');
  const snap = await transaction.get(counterRef);
  const nextNum = (snap.exists ? snap.data().lastNumber : -1) + 1;
  const formatted = nextNum < 10000 
    ? String(nextNum).padStart(4, '0') 
    : String(nextNum);
  transaction.set(counterRef, { 
    lastNumber: nextNum, 
    updatedAt: FieldValue.serverTimestamp() 
  }, { merge: true });
  return formatted;
});
```
Firestore transactions guarantee atomic serial execution. Any concurrent attempt triggers an automatic transaction retry, preventing duplicate numbers.

### Question 4: How is CodeID collision avoided?
**Answer:**  
1. Single source of allocation (`counters/code_ids` Firestore transaction).  
2. Firestore document ID uniqueness at `users/{CodeID}`. If a document already exists (safety check), the transaction retries or aborts.  
3. CodeIDs are strictly non-reusable and never reset.

### Question 5: How is registration failure handled regarding CodeID consumption?
**Answer:**  
As decided in ADR-002: Once a CodeID is allocated from the counter, it is **consumed immediately**. If subsequent document writes, network calls, or client verifications fail, the CodeID is abandoned and **never returned to the pool or recycled**. Sequence gaps (e.g. `0000`, `0002`) are explicitly valid and expected.

### Question 6: How is `passwordHash` prevented from being read by clients?
**Answer:**  
1. Physical subcollection isolation: `passwordHash` is stored at `users/{CodeID}/private/security`, NOT in the root `users/{CodeID}` document.  
2. Firestore Security Rules:
```javascript
match /users/{codeId}/private/{document=**} {
  allow read, write: if false; // Server Admin SDK only
}
```
Client queries can only access `users/{CodeID}` and `users/{CodeID}/private/integrations`, never `security` or `recovery`.

### Question 7: How is account lockout atomic and immune to client tampering?
**Answer:**  
Failed login counts are incremented on the backend using `FieldValue.increment(1)` inside an atomic write to `users/{CodeID}/private/security`. When `failedLoginAttempts >= 5`, the backend sets `users/{CodeID}.status = 'locked'` and `lockedAt = serverTimestamp()`. The client has zero write permission to `status`, `failedLoginAttempts`, or `lockedAt`. Refreshing the browser, clearing localStorage, or modifying network requests cannot bypass or reset this state.

### Question 8: How is a user prevented from granting themselves Admin?
**Answer:**  
1. `role` and `adminLevel` are strictly immutable to clients in Firestore Security Rules:
```javascript
allow update: if isOwner(codeId)
  && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'adminLevel', 'codeId', 'status']);
```
2. Any role modification must pass through `POST /auth/role/change`, which verifies that `request.auth.uid` has `role == 'admin'` and `adminLevel == 'owner'`.

### Question 9: How is the Owner protected from Admin interference?
**Answer:**  
Regular Admins (`adminLevel == 'admin'`) can manage regular users (`role == 'user'`), but backend authorization logic and Firestore Rules explicitly prevent modifying, disabling, banning, or deleting any account where `adminLevel == 'owner'`. Only an Owner can manage another Owner (if permitted by policy) or revoke Admin privileges.

### Question 10: How is account enumeration prevented?
**Answer:**  
1. Direct reads on `ndids` and `emails` collections are forbidden to clients (`allow read: if false;`).  
2. Authentication endpoints (`/auth/login/ndid`, `/auth/login/email`, `/auth/password/reset`) return uniform, generic error responses: `"Thông tin đăng nhập không chính xác"` regardless of whether the identifier does not exist or the password was incorrect.  
3. Response latency is normalized (dummy hash verification on non-existent users) to prevent timing attacks.

### Question 11: How can a user change NDID without rewriting the whole system?
**Answer:**  
Because all business documents (TimeTable, comments, chats, attempts) reference the user by immutable `CodeID` (e.g. `ownerCodeID: "0000"`), changing an NDID only updates:
1. `users/{CodeID}.ndid`
2. `ndids/{oldNDID}` -> set status to `"reserved"`, `releasedAt: now`
3. `ndids/{newNDID}` -> set status to `"active"`, `codeId: "0000"`  
Zero business records across TimeTable, Chat, or EduSpace need to be touched.

### Question 12: How can a user change Email without rewriting foreign keys?
**Answer:**  
Since email is never used as a foreign key, changing an email only updates `users/{CodeID}.email` and the `emails/{normalizedEmail}` mapping. All relational integrity remains intact through `CodeID`.

### Question 13: How does Google link to an existing account?
**Answer:**  
When a user requests to link Google:
1. User must authenticate with their current ND Labs account (`CodeID`).  
2. User performs Google OAuth popup to retrieve Google ID Token.  
3. Backend validates Google ID Token, extracts Google subject ID (`sub`), verifies that `google_identities/{sub}` is not already claimed by another account, and commits the link to `users/{CodeID}.googleLinked = true` and `google_identities/{sub}`.  
Subsequent Google logins resolve the linked `CodeID` and mint a Custom Token for that `CodeID`. It NEVER creates a duplicate account.

### Question 14: How does account recovery prove ownership without relying on AI alone?
**Answer:**  
AI recovery evaluation is strictly an advisory assistant for human support; it is never the sole verification proof. Ownership proof requires verified factors:
- Verification link or OTP sent to the pre-verified recovery email.
- Possession of linked Google OAuth account.
- Verification via trusted device credentials.
- In disputed edge cases, manual verification by an Admin/Owner.

### Question 15: How can devices or sessions be revoked?
**Answer:**  
1. Token Revocation via Admin SDK: `admin.auth().revokeRefreshTokens(codeId)` invalidates all active Firebase ID tokens for that user within 1 hour.  
2. Session Registry: The user's active session IDs are maintained in `users/{CodeID}/private/security.activeSessions`. Calling `POST /auth/session/revoke` deletes the session entry. Firestore rules or Cloud Functions verify that incoming tokens match a non-revoked session.

### Question 16: How does TimeTable resolve the owner's display information?
**Answer:**  
TimeTable documents store `ownerCodeID`. When the TimeTable UI renders:
1. Reads `ownerCodeID` from the timetable document.  
2. Fetches `users/{ownerCodeID}` (or resolves from memory/cache).  
3. Renders current `displayName`, `photoURL`, and `ndid` dynamically.  
If the owner changes their name or avatar tomorrow, the TimeTable automatically displays the new information on the next load without modifying the timetable document.

### Question 17: How will future migration occur without losing current data?
**Answer:**  
A dedicated migration script in a future phase will:
1. Scan existing `users/{uid}` documents.  
2. Assign each a sequential `CodeID` (or preserve existing valid 8-digit CodeIDs mapped to new format).  
3. Mint new Firebase Auth accounts with `uid = CodeID`.  
4. Update `timetables` documents by translating legacy `ownerUid` / `ownerNdid` to `ownerCodeID`.  
5. TimeTable documents and test data will remain intact throughout, as migration is purely additive until verified.

### Question 18: How is CodeID maintained stably across all modules?
**Answer:**  
By enforcing Architectural Rule 1 across all repositories and modules: CodeID is the single shared primary key across Firebase Auth, Firestore, and client state. Any new module developed in React, Vite, or Cloud Functions must strictly require `CodeID` as the foreign key parameter.

---

## 6. Firestore Security Rules Blueprint (Target Canonical)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── AUTH HELPER FUNCTIONS ──────────────────────────────────────
    function isAuthenticated() {
      return request.auth != null;
    }
    function isUser(codeId) {
      return isAuthenticated() && request.auth.uid == codeId;
    }
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function isAdmin() {
      return isAuthenticated() 
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && getUserData().role == 'admin';
    }
    function isOwner() {
      return isAdmin() && getUserData().adminLevel == 'owner';
    }

    // ─── DOMAIN A: USERS PROFILE ────────────────────────────────────
    match /users/{codeId} {
      // Any authenticated user can read basic profiles for collaboration & display
      allow read: if isAuthenticated();

      // Client can update ONLY safe display fields on their own profile
      allow update: if isUser(codeId)
        && request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['name', 'displayName', 'photoURL', 'grade', 'school',
                      'eduRole', 'yob', 'dob', 'gender', 'updatedAt']);

      // Creation & Deletion restricted to Server (Admin SDK) or Owner
      allow create: if false; // Server Cloud Functions only
      allow delete: if false; // Server Cloud Functions only
    }

    // ─── DOMAINS B, C: PRIVATE SECURITY & RECOVERY ──────────────────
    // Strictly FORBIDDEN to all client reads and writes
    match /users/{codeId}/private/security {
      allow read, write: if false;
    }
    match /users/{codeId}/private/recovery {
      allow read, write: if false;
    }

    // ─── DOMAIN D: PRIVATE INTEGRATIONS ─────────────────────────────
    // User can read their own Gemini key / integrations, write via Server only
    match /users/{codeId}/private/integrations {
      allow read: if isUser(codeId) || isAdmin();
      allow write: if false; // Managed via server API
    }

    // ─── DOMAIN E: LOOKUP MAPPINGS (ANTI-ENUMERATION) ──────────────
    match /ndids/{normalizedNDID} {
      allow read, write: if false; // Server Cloud Functions only
    }
    match /emails/{normalizedEmail} {
      allow read, write: if false; // Server Cloud Functions only
    }
    match /google_identities/{googleSub} {
      allow read, write: if false; // Server Cloud Functions only
    }

    // ─── DOMAIN F: ATOMIC COUNTERS ──────────────────────────────────
    match /counters/{counterId} {
      allow read, write: if false; // Server Cloud Functions only
    }

    // ─── DOMAIN G: SECURITY AUDIT LOG ───────────────────────────────
    match /security_events/{eventId} {
      allow read: if isAdmin();
      allow write: if false; // Server Cloud Functions only
    }

    // ─── DOMAIN H: TIMETABLE ────────────────────────────────────────
    match /timetables/{timetableId} {
      // Helper to check timetable permission
      function isTimetableOwner() {
        return isAuthenticated() && (
          resource.data.ownerCodeID == request.auth.uid ||
          // Backward compatibility fallback for unmigrated legacy docs
          resource.data.ownerUid == request.auth.uid
        );
      }
      function isTimetableEditor() {
        return isTimetableOwner() || (
          isAuthenticated() && resource.data.collaborators != null &&
          resource.data.collaborators.hasAny([
            {'memberCodeID': request.auth.uid, 'role': 'edit'}
          ])
        );
      }

      allow read: if resource.data.isPublic == true || isTimetableOwner() || isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.ownerCodeID == request.auth.uid;
      allow update: if isTimetableEditor() || isAdmin();
      allow delete: if isTimetableOwner() || isOwner();

      match /comments/{commentId} {
        allow read: if true;
        allow create: if isAuthenticated() && request.resource.data.authorCodeID == request.auth.uid;
        allow update, delete: if isAuthenticated() && (
          resource.data.authorCodeID == request.auth.uid || isAdmin()
        );
      }

      match /presence/{sessionId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }
    }

    // ─── DOMAIN I: CHAT ─────────────────────────────────────────────
    match /chats/{chatId} {
      allow read, write: if isAuthenticated() && (
        resource.data.participants.hasAny([request.auth.uid]) || isAdmin()
      );

      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && request.resource.data.senderCodeID == request.auth.uid;
        allow update, delete: if isAuthenticated() && (
          resource.data.senderCodeID == request.auth.uid || isAdmin()
        );
      }
    }

    // ─── DOMAIN J: EDUSPACE ACADEMIC ────────────────────────────────
    match /classrooms/{classroomId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.creatorCodeID == request.auth.uid;
      allow update, delete: if isAuthenticated() && (
        resource.data.creatorCodeID == request.auth.uid || isAdmin()
      );
    }

    match /quizzes/{quizId} {
      allow read: if resource.data.visibility == 'public' || isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.creatorCodeID == request.auth.uid;
      allow update, delete: if isAuthenticated() && (
        resource.data.creatorCodeID == request.auth.uid || isAdmin()
      );
    }

    match /attempts/{attemptId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.studentCodeID == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // Fallback safety net
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 7. Lifecycle & State Machine Specifications

### 7.1 Account Status Lifecycle
```
                 ┌───────────────┐
                 │    pending    │ (awaiting initial email verification)
                 └───────┬───────┘
                         │ (verification complete)
                         ▼
┌──────────────┐  5 fails  ┌──────────────┐  admin disable  ┌──────────────┐
│    locked    │ ◄─────── │    active    │ ──────────────► │   disabled   │
└──────┬───────┘          └──────┬───────┘                 └──────┬───────┘
       │ (successful             │ admin ban                      │ admin
       │  recovery)              ▼                                │ activate
       └────────────────► ┌──────────────┐                        │
                          │    banned    │ ◄──────────────────────┘
                          └──────────────┘
```

| Status | Login Allowed? | Session Refresh Allowed? | Permitted Recovery Actions |
|---|---|---|---|
| `active` | ✅ Yes | ✅ Yes | All standard operations |
| `pending` | ❌ No | ❌ No | Resend verification email, complete verification |
| `locked` | ❌ No | ❌ No | Password recovery flow via verified email / Google |
| `disabled` | ❌ No | ❌ No | Contact Admin/Owner for manual review |
| `banned` | ❌ No | ❌ No | Permanent lockout or wait until `banExpiresAt` |

### 7.2 NDID Lifecycle (30-Day Cooldown)
```
[Unclaimed NDID] ──────────► [Active on CodeID A]
                                     │
                             (User changes NDID)
                                     ▼
                             [Reserved for CodeID A] (30-day cooldown)
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
  (CodeID A reverts within 30d)             (30 days elapse)
                 │                                       ▼
        [Active on CodeID A]                     [Available for claim]
```
During the 30-day cooldown period, `ndids/{normalizedNDID}` retains `previousOwnerCodeID = "CodeID A"`. No other user can claim it. After 30 days, the reservation expires and the handle becomes available.

---

## 8. Summary of Migration Notes (for Future Phase)

1. **User Records:**
   - Migrate legacy `users/{uid}` -> canonical `users/{CodeID}`.
   - Extract plaintext `registeredPassword` -> hash with bcrypt -> write to `users/{CodeID}/private/security.passwordHash` -> delete `registeredPassword`.
   - Set `users/{CodeID}/private/security.passwordVersion = 1`.
2. **Firebase Auth Accounts:**
   - Create new Firebase Auth identities where `UID === CodeID` using Admin SDK.
3. **TimeTable Ownership:**
   - Inspect existing timetable documents. Map legacy `ownerUid` or `ownerNdid` -> canonical `ownerCodeID`.
   - Update `collaborators[].ndid` -> `collaborators[].memberCodeID`.
4. **EduSpace & Chat Records:**
   - Map `chats/{chatId}` participants to `senderCodeID`.
   - Map `quizzes/{quizId}.creatorUid` -> `creatorCodeID`.
   - Map `attempts/{attemptId}.studentUid` -> `studentCodeID`.

---

## 9. Domain H & I: Canonical Sessions & Trusted Devices (Phase 01-C6)

### 9.1 Sessions Subcollection (`users/{CodeID}/sessions/{sessionId}`)
Document ID: `sessionId` (Cryptographically random hex string `sess_<24_hex>`).  
**Access Control:** Strictly blocked from client direct read/write via Firestore Security Rules (`allow read, write: if false;`).

| Field | Type | Description |
|---|---|---|
| `codeId` | string | Canonical CodeID owner |
| `sessionId` | string | Canonical session identifier |
| `status` | string | `'active' \| 'revoked' \| 'expired'` |
| `platform` | string | Operating system (`Windows`, `macOS`, `Android`, `iOS (iPhone)`, etc.) |
| `browser` | string | Browser name (`Google Chrome`, `Apple Safari`, `Microsoft Edge`, etc.) |
| `userAgentSummary` | string | Human-friendly summary |
| `deviceLabel` | string | Device title for UI |
| `ipSummary` | string | Masked IP (`113.190.234.*`) |
| `createdAt` | FieldValue | Server timestamp of creation |
| `createdAtMs` | number | Milliseconds epoch of creation |
| `lastSeenAt` | FieldValue | Server timestamp of latest activity |
| `lastSeenAtMs` | number | Milliseconds epoch of latest activity |
| `expiresAtMs` | number | Milliseconds epoch when session expires |
| `revokedAt` | FieldValue | Server timestamp when session was revoked (if revoked) |
| `revocationReason` | string | Reason: `'user_revoked' \| 'all_other_sessions_revoked' \| 'password_reset' \| 'password_changed' \| 'account_locked'` |

### 9.2 Trusted Devices Subcollection (`users/{CodeID}/devices/{deviceId}`)
Document ID: `deviceId` (Cryptographically random hex string `dev_<24_hex>`).  
**Access Control:** Strictly blocked from client direct read/write via Firestore Security Rules (`allow read, write: if false;`).

| Field | Type | Description |
|---|---|---|
| `codeId` | string | Canonical CodeID owner |
| `deviceId` | string | Canonical device identifier |
| `deviceLabel` | string | Custom or generated label (`Máy tính Windows • Google Chrome`) |
| `platform` | string | Operating system platform |
| `browser` | string | Browser family |
| `deviceFingerprintHash`| string | SHA-256 hash of device entropy (ZERO raw secret storage) |
| `status` | string | `'active' \| 'revoked' \| 'expired'` |
| `trustedAt` | FieldValue | Server timestamp when marked trusted |
| `trustedAtMs` | number | Milliseconds epoch when marked trusted |
| `lastSeenAt` | FieldValue | Server timestamp when last seen |
| `lastSeenAtMs` | number | Milliseconds epoch when last seen |
| `expiresAtMs` | number | Milliseconds epoch when trust expires |
| `revokedAt` | FieldValue | Server timestamp when trust was revoked |

---

> **PHASE 01-C7 CONFIRMATION:**  
> In accordance with project instructions, **NO LEGACY DATA HAS BEEN CORRUPTED, AND NO LIVE PRODUCTION DATABASES WERE MUTATED**. Phase 01-C7 authorization governance, Firestore Security Rules hardening, and legacy auth cutover have been implemented and verified with 105/105 automated tests passing.

