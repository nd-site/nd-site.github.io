# SECURITY SPECIFICATION
## Comprehensive Security Architecture & Threat Mitigation (Phase 01-C0)

> **Project:** TimeTable – EduSpace by ND Labs  
> **Status:** ACTIVE SECURITY CONTRACT (Authentication Foundation & Credentials Implemented in Phase 01-C2)  
> **Last Updated:** 2026-09-05  
> **References:** [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md), [AUTH_RULES.md](AUTH_RULES.md)

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Threat Model & Trust Boundaries

```
UNTRUSTED ZONE (CLIENT)           ║ TRUSTED ZONE (SERVER & DATABASE)
───────────────────────────────── ║ ──────────────────────────────────────────────
Browser Environment               ║ Firebase Cloud Functions (Trusted Backend)
- React 19 Frontend               ║ - Firebase Admin SDK (Privileged Authority)
- DevTools / LocalStorage         ║ - API Endpoints (/auth/register, /auth/login)
- Network Inspector               ║ - Atomic Sequential CodeID Counter
- User-modifiable JS state        ║ - Password Hashing & Verification
                                  ║ - Lockout State Evaluation
Anything the client can:          ║
- Forge or replay                 ║ Firestore Security Rules (Data Boundary)
- Tamper with                     ║ - Blocks client read/write to private subcollections
- Inspect in memory               ║ - Restricts writable profile fields
                                  ║ - Enforces immutable roles & admin levels
```

### Core Security Axiom
**The client is UNTRUSTED.** No authorization, role assignment, password validation, lockout counter, or identity allocation decision may ever be made on the client. All security boundaries are enforced strictly by **Firestore Security Rules** and **Firebase Cloud Functions via Admin SDK**.

---

## 2. Password Security & Credential Isolation

### 2.1 Hashing & Salt Standards
- Plaintext password storage is completely eliminated.
- Algorithms: **bcrypt** (cost factor ≥ 10) or **Argon2id** (memory ≥ 64MB, iterations ≥ 3).
- Password algorithm migration is supported via `passwordVersion`:
  - `passwordVersion: 1`: bcrypt (standard deployment)
  - `passwordVersion: 2`: Argon2id (future upgrade)

### 2.2 Physical Subcollection Isolation
Credentials and security state are physically quarantined inside subcollection `users/{CodeID}/private/security`:
- `passwordHash` is never co-located in the public `users/{CodeID}` document.
- Client queries targeting `users/{CodeID}` will **never** receive the hash, preventing accidental exposure in client-side state, dumps, or UI component props.

### 2.3 Comprehensive Secret Handling
Passwords and tokens MUST NEVER appear in:
- Firestore documents accessible to clients
- `localStorage`, `sessionStorage`, or cookies
- URL query parameters, paths, or hash fragments
- `console.log()` or browser DevTools console
- Network error payloads or HTTP stack traces
- Exported CardID canvas/images or clipboard copy operations

---

## 3. Brute Force Defense & Server-Side Atomic Lockout

### 3.1 Lockout Policy
- Threshold: **5 consecutive failed password attempts**.
- Effect: Account status changed to `'locked'`, `lockedAt = serverTimestamp()`.
- Counter: `failedLoginAttempts` incremented atomically using `FieldValue.increment(1)` inside trusted Cloud Function.

### 3.2 Anti-Tamper Guarantees
- Lockout state is stored in `users/{CodeID}/private/security` and mirrored in `users/{CodeID}.status`.
- Clients have zero write permission to `status`, `lockedAt`, or `failedLoginAttempts`.
- Refreshing the browser, clearing cookies, changing IP addresses, or switching devices CANNOT reset the lockout count.
- Reset condition: Successful password recovery via verified email or manual intervention by Owner.

---

## 4. Anti-Enumeration & Mapping Security

### 4.1 Backend-Only Mapping Collections
- The mapping collections `ndids/{normalizedNDID}` and `emails/{normalizedEmail}` are strictly **SERVER-SIDE ONLY**.
- Firestore Security Rules enforce:
  ```javascript
  match /ndids/{normalizedNDID} { allow read, write: if false; }
  match /emails/{normalizedEmail} { allow read, write: if false; }
  ```
- Clients cannot query or check the existence of an NDID or email directly. All checks occur inside trusted Cloud Functions.

### 4.2 Uniform Error Responses
Authentication endpoints return generic error messages with normalized timing:
- `"Thông tin đăng nhập không chính xác."` (returned for both non-existent identifier and incorrect password).
- `"Nếu tài khoản tồn tại, hướng dẫn đã được gửi qua email."` (returned for recovery requests).

---

## 5. Role Enforcement & Owner Protection

### 5.1 Immutable Role Authority
- `role` (`"user"` | `"admin"`) and `adminLevel` (`null` | `"admin"` | `"owner"`) can only be written by the **Owner**.
- Firestore Security Rules strictly block client modification of `role` and `adminLevel`.
- Regular Admins (`adminLevel: "admin"`) cannot:
  - Grant the Admin role to any user.
  - Elevate their own privileges.
  - Modify, disable, ban, or delete an Owner account (`adminLevel: "owner"`).

### 5.2 Owner Bootstrapping
- The first Owner is **NEVER hard-coded** in source code, frontend files, or client builds.
- The first Owner is bootstrapped via a trusted/manual Firestore write or a one-time trusted backend Admin SDK script.

---

## 6. Account Recovery Security (Phase 01-C5 Implementation)

### 6.1 Multi-Factor Recovery Channels & Verification Code Mechanics
1. **Verified Email Verification Code:**
   - Initiated via `requestAccountRecovery` (HTTP endpoint: `/requestRecoveryCode`).
   - Anti-Enumeration: Returns generic 200 OK message regardless of whether identifier exists or email is verified. Constant-time dummy computation mitigates timing attacks.
   - Verified Email Requirement: Codes are only generated and sent if `emailVerified: true` (or verified recovery email).
   - Cooldown: Enforces a 60-second cooldown between requests per account to prevent email flooding (HTTP 429).
   - Code Generation: Backend generates cryptographically secure 6-digit code (`crypto.randomInt(100000, 1000000)`).
   - Storage: The raw code is **NEVER stored in Firestore**. Only its SHA-256 hash is stored in `users/{CodeID}/private/recovery`.
   - TTL: 15-minute expiration (`expiresAtMs`).
   - Brute-force Protection: Maximum 5 verification attempts (`maxAttempts: 5`). Each wrong submission increments `attemptCount`. At 5 wrong attempts, recovery status becomes `'locked'`, invalidating the attempt.
2. **Single-Use Password Reset Token:**
   - Upon successful verification of the 6-digit code via `verifyRecoveryCode`, the server issues a 32-byte hex `resetToken` (10-minute TTL).
   - The OTP `codeHash` is immediately wiped (`null`), ensuring the OTP can never be reused.
   - The server stores the SHA-256 hash of the `resetToken` in `users/{CodeID}/private/recovery.resetTokenHash`.
   - The user submits `newPassword` and `resetToken` to `/resetPasswordWithRecovery`.
   - Password must satisfy standard validation (min 8 chars).
   - Upon successful reset:
     - New password hashed with bcrypt-v1 and stored in `users/{CodeID}/private/security`.
     - Firebase Auth password synchronized via `auth.updateUser`.
     - All active user sessions revoked via `auth.revokeRefreshTokens(CodeID)`.
     - Recovery document marked `'consumed'` and `resetTokenHash` wiped (`null`), guaranteeing single-use semantics.
3. **Automatic Account Unlock Flow:**
   - If an account was previously locked (`lockedAt != null`, `failedLoginAttempts >= 5`, or `status == 'locked'`), successful password reset through verified recovery automatically:
     - Clears `lockedAt` and `lockReason` in `private/security`.
     - Resets `failedLoginAttempts: 0`.
     - Sets user profile `status: 'active'` in `users/{CodeID}`.
     - Logs an `account_unlocked` security event with `reason: 'verified_recovery'`.
4. **Linked Google Identity:**
   - Identity linked via backend Google OAuth verification (Phase 01-C4). Can authenticate directly without password reset.
5. **Owner Manual Override:**
   - Fallback for lost accounts by system administration.

### 6.2 AI Recovery Guardrails (Future Feature)
If AI-assisted recovery verification is evaluated in future phases:
- AI MUST NOT be the sole authority for account recovery.
- AI evaluation is strictly an advisory risk scoring assistant for human review.
- AI interactions MUST NOT disclose user credentials, recovery emails, or private history.

---

## 7. Sessions & Device Security (Implemented in Phase 01-C6)

- **Session Subcollection Isolation:** Active sessions are isolated under `users/{CodeID}/sessions/{sessionId}` with client read/write strictly forbidden by Firestore rules (`allow read, write: if false;`). All lifecycle transitions are mediated by Cloud Functions via Firebase Admin SDK.
- **Device Fingerprint Hashing:** Trusted devices stored in `users/{CodeID}/devices/{deviceId}` record only the SHA-256 hash of client entropy (`deviceFingerprintHash`). Raw fingerprint secrets are NEVER stored or transmitted back to clients.
- **Fail-Closed Revocation:**
  - **Password Reset:** Triggers `revokeAllSessions` with reason `password_reset` and executes `admin.auth().revokeRefreshTokens(CodeID)`.
  - **Password Change:** Triggers `revokeOtherSessions` with reason `password_changed` and executes `admin.auth().revokeRefreshTokens(CodeID)`.
  - **Account Lockout:** Triggers `revokeAllSessions` with reason `account_locked` and immediately fails closed against new session registration requests.
  - **Individual Revocation:** Calling `revokeSession` on the active session immediately revokes refresh tokens.
- **Privacy & IP Sanitization:** Network IPs are masked at the subnet level (`113.190.234.*` for IPv4; suffix masked for IPv6) before storage and projection. Relative time formatting in Vietnamese prevents precise timestamp correlation attacks.
- **Zero Client Authority:** All endpoints verify caller identity via `getAuthenticatedCodeId(req, auth)` asserting `UID === CodeID`. Cross-user session or device manipulation is structurally rejected.

---

## 8. Secrets Management Matrix

| Secret / Credential | Safe Storage | Prohibited Location |
|---|---|---|
| Firebase Service Account Key | Cloud Functions Environment / Secret Manager | Repository, frontend bundles, git history |
| Gemini API Key | Realtime DB `/config/geminiKey` (server-read only), Functions Env | Frontend code, client-readable Firestore |
| User Password Hashes | `users/{CodeID}/private/security` | Public user doc, frontend state |
| Custom Gemini Keys | `users/{CodeID}/private/integrations` | Public user doc, logs |
| Firebase Client Config | `config.js` (Public Web SDK parameters) | Contains only public project IDs |

---

## 9. Security Audit Logging

All security-critical actions generate immutable audit log entries in `security_events/{eventId}`:
- `login_success`, `login_failed`
- `account_locked`, `account_unlocked`
- `password_changed`, `password_reset_requested`, `password_reset_completed`
- `ndid_changed`, `ndid_reserved`
- `role_changed`, `admin_level_changed`, `status_changed`
- `google_identity_linked`, `google_identity_unlinked`, `google_link_failed`
- `session_revoked`, `device_revoked`

Audit records contain `actorCodeID`, `targetCodeID`, `eventType`, `timestamp`, `ip`, `userAgent`, and non-sensitive metadata. Clients have zero write or delete permissions to audit logs.

---

## 10. Authorization & Production Hardening (Phase 01-C7)

- **Role Hierarchy & Invariant Boundary:**
  - `role`: `'user'` (default member), `'admin'` (administrator).
  - `adminLevel`: `null` (regular user), `'admin'` (standard admin), `'owner'` (system owner).
  - Regular users can never access administrative endpoints or mutate roles.
  - Administrators cannot grant/revoke admin or owner privileges, nor self-promote.
  - System Owners are protected against promotion or demotion by normal users or administrators.
  - Zero-Owner Lockout Prevention guarantees the system never reaches a zero-owner state.
- **Firestore Rules Hardening:**
  - All direct client creation (`allow create: if false;`) and deletion (`allow delete: if false;`) on `/users/{userId}` are blocked.
  - User self-updates enforce strict immutability of `codeId`, `role`, `adminLevel`, and `status`.
  - Subcollections `/private/**`, `/sessions/**`, `/devices/**` and root mapping collections `/counters/**`, `/ndids/**`, `/emails/**`, `/google_identities/**` deny 100% client read/write.
  - Zero hardcoded emails or personal credentials exist in `firestore.rules`.
- **Legacy Auth Decommissioning & Cutover:**
  - Fake email domains (`@ndsite.web.app`, `@ndsite.id`) in authentication code are completely decommissioned.
  - Plaintext `registeredPassword` in client code is completely decommissioned.
  - Client-side `Math.random()` OTP generation is completely decommissioned.
  - Canonical Auth is the single authoritative entry point for authentication.

---

> **PHASE 01-C7 CONFIRMATION:**  
> Phase 01-C7 (Authorization, Production Hardening, Legacy Auth Cutover) is fully implemented, verified with 105/105 automated tests passing, and documented.
