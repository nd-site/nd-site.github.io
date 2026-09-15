# AUTH API CONTRACT — ND LABS / EDUSPACE
## Canonical API Specification & Endpoint Contracts (Phase 01-C0)

> **Authority:** Source of Truth for Server-Side Authentication & Identity Operations.  
> **Status:** ACTIVE API CONTRACT (Implemented in Phase 01-C2 & Phase 01-C3: `registerUser`, `loginUser`, `changePassword`, `changeNdid`, and Client Adapter `canonicalAuth`).  
> **Execution Environment:** Trusted Backend (Firebase Cloud Functions / Node.js 20+ with Firebase Admin SDK).  
> **Security Baseline:** Client Untrusted. HTTPS Only. CORS-restricted. Anti-Enumeration.  
> **Last Updated:** 2026-09-05  

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Overview & General Standards

### 1.1 Communication Standard
- All endpoints are HTTPS POST / GET methods hosted on Firebase Cloud Functions (`region: asia-southeast1`).
- Request & Response payload format: `application/json`.
- Character encoding: `UTF-8`.
- Standard timestamp format: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`) or Firestore `Timestamp`.

### 1.2 Unified Identity Standard
- Primary Account Identifier: `CodeID` (string, e.g. `"0000"`, `"10042"`).
- Firebase Auth Minting: All Custom Tokens issued by this API contain `uid: codeId`.
- No client-side password hashing or client-side validation authority.

### 1.3 Error Response Standard
To prevent user enumeration, authentication failure responses MUST be generic and indistinguishable:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_CREDENTIALS_INVALID",
    "message": "Thông tin đăng nhập không chính xác."
  }
}
```

---

## 2. API Endpoints Specification

---

### 2.1 `POST /auth/register` — Account Registration

- **Purpose:** Allocates next sequential `CodeID`, creates canonical user profile, initializes isolated security subcollection, and binds NDID/email mappings atomically.
- **Authentication:** Unauthenticated (Public).
- **Authorization:** System rate limit / CAPTCHA (future).
- **Input Headers:** `Content-Type: application/json`
- **Input Body:**
  ```json
  {
    "ndid": "string",            // required, /^[a-zA-Z0-9_.]+$/
    "password": "string",        // required, min 8 chars
    "email": "string | null",    // optional, normalized email format
    "displayName": "string",     // required, display name
    "role": "user"               // default "user". Client cannot request "admin"
  }
  ```
- **Validation:**
  - `ndid`: 3 to 30 characters, matches `/^[a-zA-Z0-9_.]+$/`, normalized to lowercase.
  - `password`: 8 to 128 characters, reject common weak patterns.
  - `email`: valid RFC 5322 format if provided.
- **Processing Logic:**
  1. Verify `ndids/{normalizedNDID}` does not exist (or status is `"available"`).
  2. If email provided, verify `emails/{normalizedEmail}` does not exist.
  3. Inside Firestore transaction, increment `counters/code_ids` and format `CodeID` (`"0000"` ... `"9999"`, `"10000"` ...).
  4. **CodeID is consumed immediately upon allocation.**
  5. Hash `password` using canonical hashing algorithm (`passwordVersion: 1`).
  6. Write `users/{CodeID}`: profile fields, `status: 'active'` (or `'pending'` if email verification enforced), `role: 'user'`, `adminLevel: null`.
  7. Write `users/{CodeID}/private/security`: `passwordHash`, `passwordVersion: 1`, `failedLoginAttempts: 0`.
  8. Write `ndids/{normalizedNDID}`: `{ codeId: CodeID, status: 'active', createdAt: serverTimestamp() }`.
  9. If email provided, write `emails/{normalizedEmail}`: `{ codeId: CodeID, status: 'active', createdAt: serverTimestamp() }`.
  10. Create Firebase Auth user with `uid: CodeID`.
  11. Mint Firebase Custom Token with `uid: CodeID`.
- **Output (201 Created):**
  ```json
  {
    "success": true,
    "codeId": "0000",
    "customToken": "eyJhbGciOi...",
    "user": {
      "codeId": "0000",
      "ndid": "john_doe",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "adminLevel": null,
      "status": "active"
    }
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: `VALIDATION_FAILED` (invalid characters, weak password).
  - `409 Conflict`: `IDENTIFIER_TAKEN` ("Tên tài khoản hoặc email đã được sử dụng.").
  - `500 Server Error`: `REGISTRATION_FAILED` (CodeID remains consumed, gap permitted).
- **Anti-Abuse & Rate-Limiting:** IP-based limit (max 5 registrations per hour per IP).
- **Audit Event:** `security_events`: `{ eventType: "registration_success", targetCodeID: CodeID, ip, userAgent }`.
- **Security Notes:** Plaintext password is never saved or returned.

---

### 2.2 `POST /auth/login/ndid` — Authenticate via NDID

- **Purpose:** Resolves NDID to `CodeID` via private backend mapping, checks lockout state, verifies password hash, and issues Custom Token with `uid = CodeID`.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "ndid": "string",
    "password": "string"
  }
  ```
- **Processing Logic:**
  1. Normalize NDID (lowercase, trim).
  2. Query private mapping `ndids/{normalizedNDID}`.
  3. If not found: perform dummy password comparison (prevent timing attacks) and return generic 401.
  4. Load `users/{CodeID}` and `users/{CodeID}/private/security`.
  5. Check `users/{CodeID}.status`:
     - If `'locked'`: return 403 `ACCOUNT_LOCKED` ("Tài khoản đã bị khóa do nhập sai nhiều lần.").
     - If `'disabled'` / `'banned'`: return 403 `ACCOUNT_DISABLED`.
     - If `'pending'`: return 403 `ACCOUNT_PENDING_ACTIVATION`.
  6. Compare `password` against `passwordHash` (bcrypt.compare or Argon2id.verify).
  7. If comparison fails:
     - Increment `failedLoginAttempts` atomically.
     - If `failedLoginAttempts >= 5`: set `users/{CodeID}.status = 'locked'`, `lockedAt = serverTimestamp()`.
     - Log `login_failed` audit event.
     - Return generic 401.
  8. If comparison succeeds:
     - Reset `failedLoginAttempts = 0`.
     - Update `users/{CodeID}.lastLoginAt = serverTimestamp()`.
     - Mint Custom Token with `uid = CodeID` and custom claims `{ role: user.role, adminLevel: user.adminLevel }`.
     - Log `login_success` audit event.
     - Return Custom Token and user profile.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "customToken": "eyJhbGci...",
    "user": {
      "codeId": "0000",
      "ndid": "john_doe",
      "displayName": "John Doe",
      "email": "john@example.com",
      "photoURL": null,
      "role": "user",
      "adminLevel": null,
      "status": "active"
    }
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: `AUTH_CREDENTIALS_INVALID` ("Thông tin đăng nhập không chính xác.").
  - `403 Forbidden`: `ACCOUNT_LOCKED`, `ACCOUNT_DISABLED`, `ACCOUNT_BANNED`.
- **Anti-Abuse & Rate-Limiting:** Max 10 attempts per IP per 5 minutes; 5 failures locks account.
- **Audit Event:** `login_success` or `login_failed`.

---

### 2.3 `POST /auth/login/email` — Authenticate via Email

- **Purpose:** Resolves real email to `CodeID` via private backend mapping, checks lockout, verifies password hash, and issues Custom Token with `uid = CodeID`.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Processing Logic:**
  1. Normalize email (lowercase, trim).
  2. Query private mapping `emails/{normalizedEmail}`.
  3. Perform same lockout, verification, status check, and token generation as §2.2.
- **Output (200 OK):** Same structure as §2.2.
- **Failure Cases:** Same as §2.2.

---

### 2.4 `POST /auth/password/change` — Authenticated Password Change

- **Purpose:** Allows an active user to change password by verifying their current password.
- **Authentication:** Required (Bearer Firebase ID token where `auth.uid == CodeID`).
- **Authorization:** Own account only (`actorCodeID === targetCodeID`).
- **Input Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Validation:** `newPassword` length ≥ 8, different from `currentPassword`.
- **Processing Logic:**
  1. Extract `CodeID` from verified `request.auth.uid`.
  2. Read `users/{CodeID}/private/security`.
  3. Verify `currentPassword` against stored `passwordHash`.
  4. Hash `newPassword` with current `passwordVersion`.
  5. Update `users/{CodeID}/private/security`: `passwordHash`, `lastPasswordChangedAt = serverTimestamp()`.
  6. Revoke existing refresh tokens via `admin.auth().revokeRefreshTokens(CodeID)`.
  7. Mint a new Custom Token for current device session.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đổi mật khẩu thành công.",
    "newCustomToken": "eyJhbGci..."
  }
  ```
- **Audit Event:** `security_events`: `{ eventType: "password_changed", actorCodeID: CodeID, targetCodeID: CodeID }`.

---

### 2.5 `POST /auth/recovery/start` — Initiate Account Recovery / Unlock

- **Purpose:** Generates a secure, time-limited OTP or recovery link and sends it to the verified email.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "identifier": "string" // NDID or Email
  }
  ```
- **Processing Logic:**
  1. Resolve `identifier` to `CodeID` via `ndids` or `emails` mapping.
  2. If user not found or user has no verified email: return generic 200 response ("Nếu tài khoản tồn tại và có email xác thực, hướng dẫn khôi phục đã được gửi.").
  3. Generate cryptographically random 6-digit OTP or 32-byte recovery token.
  4. Hash OTP with SHA-256 and store in `users/{CodeID}/private/recovery`:
     - `otpHash`: hash(otp)
     - `otpExpiresAt`: `now + 15 minutes`
     - `otpAttempts`: 0
  5. Dispatch email via trusted backend email service.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "message": "Nếu thông tin chính xác, mã xác nhận đã được gửi đến email khôi phục."
  }
  ```
- **Anti-Abuse:** Max 3 requests per hour per account. Generic response prevents user enumeration.
- **Audit Event:** `password_reset_requested`.

---

### 2.5 `POST /requestRecoveryCode` — Request Account Recovery Code

- **Purpose:** Initiates account recovery flow. Generates a 6-digit one-time code for verified emails.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "identifier": "string" // NDID or Email
  }
  ```
- **Processing Logic:**
  1. Validate `identifier` parameter.
  2. Resolve `identifier` -> `CodeID` via `ndids/` or `emails/`.
  3. Anti-Enumeration: If user not found, perform constant-time dummy verify and return 200 OK generic response.
  4. Verify email status: Must have `emailVerified: true` (or verified recovery email). If unverified, return 200 OK generic response (never send code to unverified emails).
  5. Cooldown: Enforce 60-second cooldown between recovery requests. Return 429 `RATE_LIMIT_EXCEEDED` if under cooldown.
  6. Generate cryptographically secure 6-digit code (`crypto.randomInt(100000, 1000000)`).
  7. Compute SHA-256 hash of code and store in `users/{CodeID}/private/recovery`.
  8. Log security event: `recovery_requested` with masked target email.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "message": "Nếu thông tin phù hợp với một tài khoản và có email hợp lệ, mã xác thực khôi phục sẽ được gửi tới email của bạn."
  }
  ```
- **Audit Event:** `recovery_requested`.

---

### 2.6 `POST /verifyRecoveryCode` — Verify Recovery Code & Issue Reset Token

- **Purpose:** Validates 6-digit recovery code, enforces brute-force lockout, and issues a single-use `resetToken`.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "identifier": "string",
    "code": "string" // 6 digits
  }
  ```
- **Processing Logic:**
  1. Validate inputs (identifier, 6-digit code format).
  2. Resolve `identifier` -> `CodeID`.
  3. In atomic transaction on `users/{CodeID}/private/recovery`:
     - Validate status is `'pending'`.
     - Validate code expiry (`now < expiresAtMs`, 15-minute TTL). If expired, mark `'expired'` and reject.
     - Validate attempt count (`attemptCount < 5`). If exceeded, mark `'locked'` and reject.
     - Compare SHA-256 hash of input code against stored `codeHash`.
     - If mismatch: increment `attemptCount`. If attempts reach 5, set `status: 'locked'`. Log `recovery_failed` and reject.
     - If match: generate 32-byte hex `resetToken`, store SHA-256 hash in `resetTokenHash`, set `resetTokenExpiresAtMs` (10-minute TTL), set `status: 'verified'`, wipe `codeHash`.
  4. Log audit event: `recovery_code_verified`.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "resetToken": "hex_token_string",
    "message": "Xác thực mã thành công. Vui lòng thiết lập mật khẩu mới."
  }
  ```
- **Audit Event:** `recovery_code_verified`, `recovery_failed`.

---

### 2.6.1 `POST /resetPasswordWithRecovery` — Secure Password Reset & Account Unlock

- **Purpose:** Resets password using single-use `resetToken`, marks token consumed, unlocks account if locked, and revokes sessions.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "identifier": "string",
    "resetToken": "string",
    "newPassword": "string"
  }
  ```
- **Processing Logic:**
  1. Validate inputs and password complexity rules (min 8 characters).
  2. Hash `newPassword` using bcrypt-v1.
  3. In atomic transaction across `users/{CodeID}/private/recovery`, `users/{CodeID}/private/security`, and `users/{CodeID}`:
     - Verify recovery doc status is `'verified'`.
     - Verify `resetToken` hash match and expiry (`now < resetTokenExpiresAtMs`).
     - Update `users/{CodeID}/private/security`: new `passwordHash`, `passwordVersion: 'bcrypt-v1'`, `failedLoginAttempts: 0`, `lockedAt: null`, `lockReason: null`.
     - Unlock user profile in `users/{CodeID}`: set `status: 'active'` if status was `'locked'` or `'pending'`.
     - Mark recovery record as consumed: set `status: 'consumed'`, `consumedAt: serverTimestamp()`, wipe `resetTokenHash`.
  4. Sync password with Firebase Auth (`auth.updateUser`).
  5. Revoke all existing sessions (`auth.revokeRefreshTokens`).
  6. Log security audit events: `password_reset`, and `account_unlocked` (if account was locked).
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "0001",
    "message": "Đặt lại mật khẩu thành công. Tài khoản của bạn đã được mở khóa."
  }
  ```
- **Audit Event:** `password_reset`, `account_unlocked`.

---

### 2.7 `POST /auth/ndid/change` — Change NDID with 30-Day Reservation

- **Purpose:** Modifies account handle. Enforces 30-day reservation on old handle. Does NOT affect any foreign keys.
- **Authentication:** Required (Bearer token where `auth.uid == CodeID`).
- **Authorization:** Own account OR Admin/Owner.
- **Input Body:**
  ```json
  {
    "targetCodeID": "string", // own CodeID or target CodeID if Admin
    "newNdid": "string"
  }
  ```
- **Processing Logic:**
  1. Validate `newNdid` format `/^[a-zA-Z0-9_.]+$/`.
  2. Verify authorization (`request.auth.uid === targetCodeID` OR caller has `role == 'admin'`).
  3. Normalize `newNdid`.
  4. Check `ndids/{normalizedNew}`:
     - If exists and `status == 'active'`: reject with 409 Conflict.
     - If exists and `status == 'reserved'` and `previousOwnerCodeID !== targetCodeID`: reject with 409 (cooldown active).
  5. Fetch current user document to retrieve `oldNdid`.
  6. Execute atomic batch write:
     - Update `users/{targetCodeID}.ndid = newNdid`.
     - Update `ndids/{oldNdid}`: `{ status: 'reserved', releasedAt: serverTimestamp(), previousOwnerCodeID: targetCodeID }`.
     - Set `ndids/{normalizedNew}`: `{ codeId: targetCodeID, status: 'active', createdAt: serverTimestamp() }`.
  7. **Notice:** No TimeTable, chat, or quiz records are modified. All foreign keys remain `targetCodeID`.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "0000",
    "newNdid": "new_handle",
    "reservedOldNdid": "old_handle",
    "cooldownDays": 30
  }
  ```
- **Audit Event:** `ndid_changed`, `ndid_reserved`.

---

### 2.8 `POST /auth/email/change/request` & `verify` — Backend-Controlled Email Change

- **Purpose:** Safely updates email address following 2-step verification.
- **Flow:**
  1. `POST /auth/email/change/request`: Caller provides `newEmail` and `currentPassword`. Backend verifies password, checks `emails/{normalizedNewEmail}` uniqueness, generates email verification token, and sends confirmation link to `newEmail`.
  2. `POST /auth/email/change/verify`: Caller provides verification token. Backend updates `users/{CodeID}.email = newEmail`, `users/{CodeID}.emailVerified = true`, releases old email mapping, and registers new email in `emails/{normalizedNewEmail}`.
- **Audit Event:** `email_change_requested`, `email_changed`.

---

---

### 2.9 `POST /linkGoogleIdentity` & `POST /unlinkGoogleIdentity` — Google OAuth Identity Management (Phase 01-C4)

#### 2.9.1 `POST /linkGoogleIdentity`
- **Purpose:** Links a verified Google identity to the caller's canonical account without altering `CodeID` or Firebase Auth `UID`.
- **Authentication:** Required (Bearer ID Token in `Authorization` header, where `auth.uid == CodeID`).
- **Input Body:**
  ```json
  {
    "googleSubjectId": "string (optional if linked on client Firebase Auth)",
    "googleEmail": "string (optional)"
  }
  ```
- **Processing Logic:**
  1. Authenticate caller via `admin.auth().verifyIdToken()`. Extract `codeId = decodedToken.uid`.
  2. If `googleSubjectId` is omitted, query `admin.auth().getUser(codeId)` and extract `providerData.find(p => p.providerId === 'google.com')`.
  3. Anti-spoofing check: If `googleSubjectId` is supplied, ensure it matches the user's Google provider in Firebase Auth.
  4. Run Firestore Transaction:
     - Verify `users/{CodeID}` exists.
     - Inspect `google_identities/{googleSubjectId}`:
       - **Case A (New):** Write `google_identities/{googleSubjectId}` with `{ codeId, googleSubjectId, provider: 'google', email, createdAt, updatedAt }`. Update `users/{CodeID}` with `{ googleSubjectId, googleEmail }`. Log audit `google_identity_linked`.
       - **Case B (Same CodeID):** Return idempotent success (`noOp: true`).
       - **Case C (Conflict):** Reject with HTTP 409 (`GOOGLE_IDENTITY_ALREADY_LINKED`). Unlink `google.com` on caller's Auth account. Log security event `google_link_failed`. **NO auto-merge.**
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "00000010",
    "googleSubjectId": "10987654321",
    "googleEmail": "user@gmail.com",
    "message": "Liên kết tài khoản Google thành công."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Token invalid or expired.
  - `409 Conflict`: `GOOGLE_IDENTITY_ALREADY_LINKED` ("Tài khoản Google này đã được liên kết với một tài khoản khác.").

#### 2.9.2 `POST /unlinkGoogleIdentity`
- **Purpose:** Safely unlinks a Google identity from the caller's canonical account.
- **Authentication:** Required (Bearer ID Token where `auth.uid == CodeID`).
- **Input Body:** `{}`
- **Processing Logic:**
  1. Authenticate caller via `verifyIdToken()`.
  2. **Account Lockout Prevention Guard:** Query `users/{CodeID}/private/security`. If `passwordHash` is absent/null, immediately reject with HTTP 400 (`VALIDATION_ERROR`: "Không thể hủy liên kết Google vì tài khoản chưa thiết lập mật khẩu đăng nhập...").
  3. Run Firestore Transaction:
     - Retrieve `googleSubjectId` from `users/{CodeID}` (or Auth record).
     - If unlinked already, return idempotent success (`noOp: true`).
     - Delete `google_identities/{googleSubjectId}`.
     - Update `users/{CodeID}`: `{ googleSubjectId: null, googleEmail: null }`.
     - Log audit event `google_identity_unlinked`.
  4. Unlink provider in Firebase Auth: `admin.auth().updateUser(codeId, { providersToUnlink: ['google.com'] })`.
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "00000010",
    "message": "Đã hủy liên kết Google thành công."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `VALIDATION_ERROR` (account has no registered password).
  - `401 Unauthorized`: Session expired or invalid.

---

### 2.10 `GET /users/resolve/{codeId}` — User Information Resolution API

- **Purpose:** Resolves display attributes (name, NDID, avatar, grade) for any given `CodeID`.
- **Authentication:** Required (Authenticated user or public read if permitted by policy).
- **Input Params:** `codeId` (string).
- **Output (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "0000",
    "ndid": "john_doe",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "role": "user",
    "grade": "12",
    "school": "THPT Demo"
  }
  ```
- **Security Rule:** Does NOT return email, security subcollections, or private integration settings.

---

### 2.11 Session Management, Trusted Devices & Security Activity (Phase 01-C6)

All endpoints below require a valid Firebase Auth ID token in the `Authorization: Bearer <idToken>` header or `idToken` in the JSON body. The caller's `CodeID` is extracted strictly via `verifyIdToken(idToken)` asserting `UID === CodeID`. Arbitrary client-supplied CodeIDs are rejected.

#### 2.11.1 `POST /registerSession`
- **Purpose:** Registers or touches an active session for the authenticated account.
- **Request Body:**
  ```json
  {
    "sessionId": "sess_optional_client_id",
    "deviceId": "dev_optional",
    "deviceLabel": "Custom or UA label"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "session": {
      "sessionId": "sess_...",
      "deviceLabel": "Máy tính Windows • Google Chrome",
      "platform": "Windows",
      "browser": "Google Chrome",
      "ipSummary": "113.190.234.*",
      "status": "active"
    }
  }
  ```

#### 2.11.2 `GET / POST /getActiveSessions`
- **Purpose:** Lists active sessions for the authenticated account, flagging the current session.
- **Request Query/Body:** `currentSessionId` (optional, string).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "sessions": [
      {
        "sessionId": "sess_1",
        "deviceLabel": "Máy tính Windows • Google Chrome",
        "platform": "Windows",
        "browser": "Google Chrome",
        "ipSummary": "113.190.234.*",
        "isCurrent": true,
        "relativeCreatedAt": "1 giờ trước",
        "relativeLastSeen": "Vừa xong",
        "status": "active"
      }
    ]
  }
  ```

#### 2.11.3 `POST /revokeSession`
- **Purpose:** Revokes a specific session belonging to the authenticated account.
- **Request Body:** `{ "sessionId": "sess_target", "currentSessionId": "sess_current" }`
- **Response (200 OK):** `{ "success": true, "message": "Hủy phiên đăng nhập thành công.", "isCurrentRevoked": false }`
- **Note:** If `sessionId === currentSessionId`, Firebase Auth refresh tokens are also revoked via `admin.auth().revokeRefreshTokens(codeId)`.

#### 2.11.4 `POST /revokeOtherSessions`
- **Purpose:** Revokes all active sessions except the current session.
- **Request Body:** `{ "currentSessionId": "sess_current" }`
- **Response (200 OK):** `{ "success": true, "message": "Đã đăng xuất 2 phiên làm việc khác.", "revokedCount": 2 }`

#### 2.11.5 `POST /registerTrustedDevice`
- **Purpose:** Registers a trusted device with SHA-256 fingerprint hash (zero raw secret storage).
- **Request Body:** `{ "deviceName": "Laptop cá nhân", "deviceFingerprint": "entropy_string" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "device": {
      "deviceId": "dev_...",
      "deviceLabel": "Laptop cá nhân",
      "platform": "Windows",
      "browser": "Google Chrome",
      "status": "active"
    }
  }
  ```

#### 2.11.6 `GET / POST /getTrustedDevices`
- **Purpose:** Lists all active trusted devices for the account with safe metadata.
- **Response (200 OK):** `{ "success": true, "devices": [ ... ] }`

#### 2.11.7 `POST /revokeTrustedDevice`
- **Purpose:** Revokes trust for a specific device.
- **Request Body:** `{ "deviceId": "dev_..." }`
- **Response (200 OK):** `{ "success": true, "deviceId": "dev_...", "message": "Hủy thiết bị tin cậy thành công." }`

#### 2.11.8 `GET / POST /getSecurityActivity`
- **Purpose:** Retrieves sanitized security activity timeline (zero credential or hash leakage).
- **Request Query/Body:** `{ "limit": 10 }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "events": [
      {
        "eventId": "ev_...",
        "eventType": "all_other_sessions_revoked",
        "title": "Đăng xuất khỏi các thiết bị khác",
        "relativeTime": "10 phút trước",
        "ipSummary": "113.190.234.*",
        "platform": "Windows",
        "browser": "Google Chrome"
      }
    ]
  }
  ```

---

### 2.12 `POST /updateUserRole` — Manage User Role & Admin Hierarchy (Phase 01-C7)

- **Purpose:** Securely manages user roles (`user`, `admin`) and administrative hierarchy (`null`, `admin`, `owner`).
- **Authorization:** Authenticated Bearer ID token. Requires caller to be an active System Owner (`admin` + `owner`).
- **Input Body:**
  ```json
  {
    "targetCodeId": "string",
    "role": "user" | "admin",
    "adminLevel": null | "admin" | "owner"
  }
  ```
- **Processing Logic:**
  1. Authenticate caller via `UID === CodeID`.
  2. Verify caller context: caller MUST have `role === 'admin'` and `adminLevel === 'owner'`.
  3. Validate target context and invariant rules:
     - Normal user cannot have `adminLevel != null`.
     - Admin must have `adminLevel in ['admin', 'owner']`.
     - Non-owners cannot promote/demote anyone.
     - Demoting the last remaining active System Owner is strictly blocked (Zero-Owner Lockout Prevention).
  4. Atomically update target user document with new role, adminLevel, and timestamp.
  5. Emit immutable audit event `role_or_privilege_updated` to `security_events`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "targetCodeId": "string",
    "role": "string",
    "adminLevel": "string" | null,
    "message": "Cập nhật vai trò và cấp quản trị thành công."
  }
  ```

---

### 2.13 `POST /loginWithGoogle` — Login via Linked Google Provider (Phase 01-C7)

- **Purpose:** Resolves external Google Subject ID to canonical `CodeID` and mints Firebase Custom Token preserving `UID === CodeID`.
- **Authentication:** Unauthenticated.
- **Input Body:**
  ```json
  {
    "googleSubjectId": "string",
    "googleEmail": "string" | null
  }
  ```
- **Processing Logic:**
  1. Validate `googleSubjectId`.
  2. Query server-only mapping `google_identities/{googleSubjectId}`.
  3. If unlinked: emit `google_login_failed` and reject with 401 (`GOOGLE_NOT_LINKED`).
  4. If linked: fetch `users/{CodeID}`, verify status (must not be `locked`, `disabled`, or `banned`).
  5. Mint Firebase Custom Token with `UID = CodeID`.
  6. Emit audit event `google_login_success` and update `lastLoginAt`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "string",
    "customToken": "string",
    "user": {
      "codeId": "string",
      "ndid": "string",
      "displayName": "string",
      "role": "string",
      "adminLevel": "string" | null
    }
  }
  ```

---

### 2.14 `POST /sendVerificationEmail` — Send Account Email Verification (Phase 01-C9)

- **Purpose:** Generates a secure 32-byte hex verification token, stores its SHA-256 hash in server-only Firestore collections with 24-hour TTL, and dispatches an email verification link.
- **Authentication:** Authenticated Bearer ID token (`UID === CodeID`).
- **Input Body (optional):**
  ```json
  {
    "email": "string | null"
  }
  ```
- **Processing Logic:**
  1. Authenticate caller via Bearer ID token (`UID === CodeID`).
  2. Verify target email address.
  3. Enforce 60-second cooldown rate-limiting against rapid resend abuse.
  4. Generate cryptographically secure 32-byte hex token; compute SHA-256 hash.
  5. Store token payload atomically in server-only `email_verifications/{tokenHash}` and `users/{CodeID}/private/verification`.
  6. Dispatch verification email via `EmailService` (non-fatal error resiliency).
  7. Log audit event `verification_email_sent` in `security_events`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Email xác nhận đã được gửi thành công. Vui lòng kiểm tra hộp thư của bạn."
  }
  ```

---

### 2.15 `POST /verifyEmail` — Verify Email Token (Phase 01-C9)

- **Purpose:** Verifies a submitted email verification token, marks the token consumed, sets `users/{CodeID}.emailVerified = true`, and promotes `pending` accounts to `active`.
- **Authentication:** Public endpoint (invoked from email link with token).
- **Input Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Processing Logic:**
  1. Validate token syntax and compute SHA-256 hash.
  2. Query `email_verifications/{tokenHash}` in Firestore transaction.
  3. Verify token status (`pending`) and expiration (24 hours).
  4. If token is already verified: return idempotent success (`alreadyVerified: true`).
  5. Mark token `status = 'verified'` in `email_verifications/{tokenHash}` and `users/{CodeID}/private/verification`.
  6. Atomically update `users/{CodeID}.emailVerified = true`. If account was `pending`, update `status = 'active'`.
  7. Synchronize Firebase Auth user record (`emailVerified: true`).
  8. Log audit event `email_verified` in `security_events`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "codeId": "string",
    "email": "string",
    "alreadyVerified": false,
    "message": "Địa chỉ email đã được xác thực thành công. Tài khoản của bạn đã được bảo vệ đầy đủ."
  }
  ```

---

## 3. Threat Mitigations Matrix

| Attack Vector | Vulnerability in Legacy | Mitigation in Canonical Contract |
|---|---|---|
| **User Enumeration** | Client queries `/ndids/{ndid}` directly | Mappings are backend-only. Login errors are generic and constant-time. |
| **Brute Force Passwords** | No server lockout | Server-side atomic counter locks account at 5 failed attempts. |
| **Privilege Escalation** | Client writes `role` to Firestore doc | Firestore rules block client writes to `role`, `adminLevel`, `status`. Cloud Function enforces Owner-only privilege updates. |
| **Credential Exfiltration** | Passwords stored plaintext in Firestore | Passwords hashed with bcrypt-v1; stored in non-readable subcollection. |
| **Identity Tampering** | Changing NDID breaks relationships | Internal relationships use immutable `CodeID`. NDID change only updates profile. |
| **Account Hijacking via Recovery** | OTP generated in client DevTools | OTP generated server-side, hashed in private subcollection, sent via email. |
| **Duplicate Google Accounts** | Direct `signInWithPopup` creates random user | Google tokens verified server-side; linked to existing canonical `CodeID`. |
| **Legacy Fake Email Infiltration** | Fake email `@ndsite.web.app` in client login | Cutover complete: All fake emails and legacy OTP tabs decommissioned. |
| **Email Verification Spoofing** | Client declares email verified | Server-only 32-byte hex token, SHA-256 hash storage, 24h TTL, 60s cooldown. |
| **Hardcoded Secret Leakage** | Secrets in source repository | Automated scan verified: 0 hardcoded secrets. Pluggable provider adapter. |

---

> **PHASE 01-C9 CONFIRMATION:**  
> Phase 01-C9 (Transactional Email + Production Configuration) is fully implemented, verified with 148/148 automated tests passing, and documented.

