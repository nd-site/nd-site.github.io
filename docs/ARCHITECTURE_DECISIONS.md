# Architecture Decision Records (ADRs)
## Canonical Architectural Contracts & Decision Log (Phase 01-C0)

> **Project:** TimeTable – EduSpace by ND Labs  
> **Status:** OFFICIAL ARCHITECTURAL SOURCE OF TRUTH  
> **Last Updated:** 2026-09-05  

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## Decision Summary Table

| ADR | Title | Status | Decided Date |
|---|---|---|---|
| **ADR-001** | Firebase Auth UID = CodeID | **DECIDED** | 2026-09-05 |
| **ADR-002** | CodeID Consumption on Failed Registration | **DECIDED** | 2026-09-05 |
| **ADR-003** | Every Internal User Relationship References Immutable CodeID | **DECIDED** | 2026-09-05 |
| **ADR-004** | User Information Is Dynamically Resolved from users/{CodeID} | **DECIDED** | 2026-09-05 |
| **ADR-005** | First Owner Bootstrap via Trusted Manual/Script Operation | **DECIDED** | 2026-09-05 |
| **ADR-006** | Primary Data Store: Firestore for All User & Auth Data | **DECIDED** | 2026-08-30 |
| **ADR-007** | Password Hashing Algorithm (bcrypt vs Argon2id Benchmark) | **OPEN / PROPOSED** | — |
| **ADR-008** | Account Deletion Semantics & Lifecycle Scope | **OPEN** | — |
| **ADR-009** | Session Token TTL & Custom Revocation Registry | **DECIDED (Phase 01-C6)** | 2026-09-05 |
| **ADR-010** | Email Delivery Provider for Verification & Recovery | **OPEN** | — |
| **ADR-011** | Trusted Device Recognition Mechanism | **DECIDED (Phase 01-C6)** | 2026-09-05 |
| **ADR-012** | Account Recovery Final Protocol & AI Guardrails | **OPEN** | — |
| **ADR-017** | Canonical Session Management, Trusted Devices & Security Control | **DECIDED (Phase 01-C6)** | 2026-09-05 |

---

## ADR-001: Firebase Auth UID = CodeID

### Status: DECIDED

### Context
The system required a decision on whether Firebase Authentication UID should be an arbitrary auto-generated string (requiring a mapping table to CodeID) or identical to the immutable account identifier `CodeID`.

### Decision
**Firebase Auth UID = CodeID.**  
The backend uses Firebase Admin SDK `createCustomToken(codeId)` so that `request.auth.uid === codeId` across all Firebase contexts.

### Rationale
1. Direct 1:1 identity parity between Firebase Auth and Firestore primary documents (`users/{CodeID}`).
2. Eliminates unnecessary mapping layers and token lookup latencies.
3. Simplifies Firestore Security Rules: `request.auth.uid == codeId` directly verifies document ownership.
4. Google OAuth and email logins resolve to the single canonical `CodeID` on the backend and mint custom tokens under that `CodeID`.

---

## ADR-002: CodeID Consumption on Failed Registration

### Status: DECIDED

### Context
CodeID is generated from an atomic sequential counter (`counters/code_ids`). If an account creation process fails or is abandoned after allocating a CodeID, should the number be recycled or consumed?

### Decision
**Allocated CodeID is permanently consumed even if registration later fails.**

### Rationale
1. Prevents race conditions, reservation locks, and cleanup cron overhead.
2. Code space is virtually unlimited (4+ digits expanding naturally: `0000` to `9999`, then `10000`+).
3. Sequence gaps are functionally harmless and cosmetically acceptable.
4. Guarantees that no CodeID is ever recycled, maintaining complete historical auditability.

---

## ADR-003: Every Internal User Relationship References Immutable CodeID

### Status: DECIDED

### Context
Legacy code used an ad-hoc mix of NDIDs, emails, usernames, and random UIDs as foreign keys across TimeTable, chats, and comments, causing cascading breakages whenever a user updated their handle or profile.

### Decision
**Every internal relationship to a user across the entire repository MUST reference the immutable CodeID.**  
Foreign keys must strictly follow canonical naming:
- TimeTable: `ownerCodeID`, `memberCodeID`
- Comments: `authorCodeID`
- Chat: `senderCodeID`, `participants` (array of CodeIDs)
- EduSpace Academic: `creatorCodeID`, `studentCodeID`
- Security Logs: `actorCodeID`, `targetCodeID`

### Rationale
1. Complete decoupling between immutable account identity (`CodeID`) and mutable display handles (`NDID`, `email`, `displayName`).
2. Absolute immutability of historical relationships.

---

## ADR-004: User Information Is Dynamically Resolved from users/{CodeID}

### Status: DECIDED

### Context
Whether business documents should denormalize user display names, avatars, and NDIDs or resolve them on demand.

### Decision
**User information MUST be resolved dynamically from `users/{CodeID}`.**  
Business records do not store denormalized user handles or display names as canonical data. If a performance display snapshot is ever introduced in the future, it must be explicitly flagged as `DENORMALIZED_DISPLAY_SNAPSHOT` and never used as an authority for ownership or permissions.

### Rationale
1. Zero global rewrites when a user changes their NDID, email, name, or photo.
2. Acceptance criterion: A user update only modifies `users/{CodeID}`.

---

## ADR-005: First Owner Bootstrap via Trusted Manual/Script Operation

### Status: DECIDED

### Context
The first Owner account cannot be created via standard UI because only an Owner can grant Admin privileges.

### Decision
**The first Owner account is bootstrapped via a trusted/manual Firestore write or a one-time trusted Firebase Admin SDK script.**  
Hardcoding Owner email, CodeID, or UID in frontend code is strictly prohibited.

---

## ADR-006: Primary Data Store: Firestore for All User & Auth Data

### Status: DECIDED

### Context
Whether user records should reside in Realtime Database or Firestore.

### Decision
**Firestore is the exclusive primary store for user accounts, profiles, credentials, mappings, and security events.** Realtime Database is retained exclusively for operational configuration (Gemini API keys, bot parameters).

---

## ADR-007: Password Hashing Algorithm (bcrypt vs Argon2id Benchmark)

### Status: DECIDED (Phase 01-C2)

### Context
Choosing between bcrypt (via `bcryptjs`) and Argon2id for server-side credential hashing.

### Decision
**Select `bcryptjs` with 10 salt rounds and version identifier `"bcrypt-v1"`.**

### Rationale
1. **Zero Native Build Hazards:** `bcryptjs` is 100% pure JavaScript, completely eliminating native C++ compilation/toolchain issues across Windows development environments, Docker containers, and Cloud Functions Node 20 runtime.
2. **Deterministic Serverless Performance:** Benchmarked at ~54ms per hash, providing optimal cryptographic work factor without causing serverless function timeouts or degraded cold-start performance.
3. **OWASP Compliance:** 10 salt rounds conforms to standard security recommendations for Web and API backends.
4. **Future-Proof Upgradability:** Every password hash stores `passwordVersion: "bcrypt-v1"` in `users/{CodeID}/private/security`, allowing transparent algorithm upgrades on subsequent logins.

---

## ADR-008: Account Deletion Semantics & Lifecycle Scope

### Status: OPEN

### Context
Owner-initiated account deletion has cross-cutting implications:
1. `CodeID` is permanent and can never be reassigned.
2. Timetables owned by the deleted account (transfer ownership vs archive).
3. Audit events in `security_events` must remain immutable.
4. Old NDID cooldown reservation.
5. Email unlinking.

### Options
- **Option A: Soft Delete (Recommended):** Set `status: 'deleted'`, anonymize PII (name, email), retain `codeId` and structural references.
- **Option B: Phased Delete:** Immediate soft delete followed by 30-day purge of private subcollections.
- **Option C: Hard Delete:** Deletes profile; retains stub in `code_ids`.

### Status
**OPEN.** Requires final Owner policy sign-off before implementation.

---

## ADR-009: Session Token TTL & Custom Revocation Registry

### Status: OPEN

### Context
Firebase ID tokens have a fixed 1-hour expiration. Refresh tokens can be revoked server-side via `admin.auth().revokeRefreshTokens()`. Whether an in-memory or Firestore-based active session registry is needed for instantaneous multi-device revocation.

### Status
**OPEN.** Default Firebase SDK refresh behavior is accepted as foundation; custom session registry will be evaluated during implementation.

---

## ADR-010: Email Delivery Provider for Verification & Recovery

### Status: OPEN

### Context
Email delivery is required for password recovery, email verification, and security notifications.

### Candidates
- Firebase Auth built-in email action links
- SendGrid
- Resend
- AWS SES / Custom SMTP

### Status
**OPEN.** Cost, deliverability, and domain authentication (SPF/DKIM) will be evaluated during implementation.

---

## ADR-011: Trusted Device Recognition Mechanism

### Status: OPEN

### Context
Enabling multi-device trust tokens for expedited login or recovery verification.

### Status
**OPEN.** Deferred to future feature roadmap. Architecture accommodates device storage in `private/security.activeSessions`.

---

## ADR-012: Account Recovery Final Protocol & AI Guardrails

### Status: OPEN

### Context
Establishing strict ownership evaluation when primary recovery email is inaccessible.

### Status
**OPEN.** Core architectural boundary decided: AI evaluation is advisory only and never the sole authority. Multi-factor email verification remains primary.

---

## ADR-013: Orchestrated Compensating Registration Flow (Decoupled Auth & Firestore)

### Status: DECIDED (Phase 01-C2)

### Context
Firebase Authentication and Cloud Firestore are decoupled systems without distributed 2-phase commit (2PC) transactions. A naive implementation that assumes both can be atomically committed or rolled back in a single boundary will cause split-brain states if one fails.

### Decision
**Implement an orchestrated, compensating registration workflow:**
1. **Atomic Pre-Allocation:** Inside a Firestore transaction, check uniqueness of NDID and Email mappings, and allocate CodeID. Once allocated, CodeID is **consumed permanently** and never recycled.
2. **Side Effect Step (Firebase Auth):** Create the Firebase Auth user (`uid = CodeID`). If this fails, release the NDID/email mappings so the user can re-register, while preserving the consumed CodeID as an intentional sequence gap.
3. **Canonical Firestore Creation:** Establish `users/{CodeID}`, `users/{CodeID}/private/security`, and finalize mappings. If this fails, compensate by deleting the newly created Firebase Auth user (`admin.auth().deleteUser(CodeID)`) to prevent orphan auth records, and release the mappings.
4. **Idempotency Replay:** Support `idempotencyKey` tracking to safely replay identical requests without duplicate account or allocation errors.

---

## ADR-014: Canonical Frontend Auth Integration, Fail-Closed Identity Invariant, & Self-Service 30-Day Handle Cooldown

### Status: DECIDED & IMPLEMENTED (Phase 01-C3)

### Context
Frontend pages previously relied on client-side generation of random 8-digit CodeIDs, stored passwords in plaintext inside Firestore (`registeredPassword`), synthesized fake emails (`${ndid}@ndsite.web.app`), and looped across candidate emails on login and password reset. Furthermore, user sessions relied on `localStorage` as an unverified security authority without validating whether Firebase Auth UID matches canonical CodeID.

### Decision
1. **Centralized Client Adapter (`canonicalAuth`):**
   - Provide `assets/js/canonical-auth.js` as the single authoritative frontend client library.
   - All login, registration, password changes, NDID changes, and logout operations flow through `canonicalAuth`.
   - Replaces all fake emails (`@ndsite.web.app`) with canonical login identifier resolution (`ndid` or `email`).
   - Replaces all client-side `Math.random()` CodeID generation with server-allocated immutable CodeIDs.
2. **Fail-Closed UID === CodeID Verification:**
   - Any client session where `firebaseUser.uid !== canonicalCodeId` is treated as a security violation and immediately terminated (`signOut` + local cache cleared).
3. **Elimination of Plaintext Passwords:**
   - Mật khẩu chỉ được băm một chiều (bcrypt-v1) trên máy chủ đáng tin cậy.
   - Hoàn toàn loại bỏ tính năng "Xem mật khẩu" và trường `registeredPassword` trên toàn bộ UI frontend và backend.
   - Giao diện Thẻ Căn Cước hiển thị mật khẩu đã được che giấu cố định (`••••••••`) và cung cấp nút "Đổi mật khẩu" an toàn.
4. **Self-Service Handle Cooldown (30 Days):**
   - Khi người dùng đổi NDID qua endpoint `changeNdid`, NDID mới được xác thực cú pháp (`/^[a-zA-Z0-9_.]+$/`, không chứa `admin`), gán cho `CodeID` hiện tại.
   - NDID cũ được lưu trữ trạng thái `reserved` với thời gian bảo lưu 30 ngày (`reservedUntil = now + 30 days`), ngăn chặn mọi người dùng khác chiếm đoạt tài khoản hoặc mạo danh.
   - `CodeID` và `uid` của tài khoản giữ nguyên 100%, không ảnh hưởng đến bất kỳ quan hệ khóa ngoại nào (TimeTable, EduSpace, Chat).

---

## ADR-015: Canonical Google Identity Linking, 1-to-1 Subject Mapping, & Account Lockout Prevention

### Status: DECIDED & IMPLEMENTED (Phase 01-C4)

### Context
Legacy implementation allowed client code to directly call `linkWithPopup`, read `result.user.email`, and directly perform client-side Firestore writes (`updateDoc(doc(db, 'users', uid), { googleEmail, emails: arrayUnion(...) })`). This created severe security and architectural risks:
1. Client could claim any Google identity without server verification.
2. Multiple accounts could claim the same Google identity or email without conflict detection.
3. Users could unlink Google even if they had no alternative password, creating orphaned accounts unable to authenticate (account lockout).
4. Unlinking could be performed by anyone guessing OTP or reading plaintext passwords from cache.

### Decision
1. **Canonical Identity Mapping Keyed by Google Subject ID:**
   - External Google provider identities are keyed exclusively by Google OAuth `sub` (`googleSubjectId` / provider `uid`) in server-only collection `google_identities/{googleSubjectId}`.
   - Email is an attribute, NOT the identity mapping key. Re-created Google accounts with the same email but different `sub` are treated as distinct external identities.
2. **Strict 1-to-1 Provider-to-Account Invariant:**
   - A Google identity can belong to at most ONE canonical `CodeID`.
   - Idempotent re-linking by the same account is accepted as a clean no-op.
   - Conflicting links (already mapped to a different `CodeID`) are rejected with `GoogleIdentityAlreadyLinkedError` (HTTP 409).
   - **NO automatic account merging:** Conflicting accounts are never silently merged; the user's existing account identity is preserved.
3. **Lockout Prevention Guard on Unlink:**
   - Unlinking Google is strictly blocked server-side if `users/{CodeID}/private/security.passwordHash` is absent.
   - The user must establish a registered password before unlinking Google, ensuring the account is never left without an active authentication method.
4. **Server-Side Verification & Client Deny Rules:**
   - `google_identities/` has client read = DENY, client write = DENY in `firestore.rules`.
   - Cloud Functions `linkGoogleIdentity` and `unlinkGoogleIdentity` verify Bearer ID tokens, validate provider identity against Firebase Auth server records, and maintain atomic database consistency with audit logging.

---

## ADR-016: Canonical Account Recovery State Machine, Anti-Enumeration, One-Time Codes, and Lockout Resolution

### Status: DECIDED & IMPLEMENTED (Phase 01-C5)

### Context
Legacy code suffered from major security vulnerabilities and broken UX:
1. Client-side OTP generation via `Math.random()` logged OTPs directly to client browser console logs (`console.log(generatedLoginOtp)`).
2. Direct client-side Firestore queries on `ndids/{ndid}` exposed account emails and existence to attackers.
3. Calls to `sendPasswordResetEmail` were made with synthesize fake emails (`${ndid}@ndsite.web.app`) or unverified emails.
4. Accounts locked out after 5 consecutive failed login attempts had no automated, verified recovery path to restore access.

### Decision
1. **Server-Side Cryptographic One-Time Codes with SHA-256 Hashing:**
   - Raw verification codes are generated strictly on the server using `crypto.randomInt(100000, 1000000)`.
   - The raw code is **NEVER stored in Firestore**. Only its SHA-256 hash is saved in `users/{CodeID}/private/recovery.codeHash`.
   - Codes expire strictly after 15 minutes (`expiresAtMs`).
2. **Anti-Enumeration Protection:**
   - Recovery request endpoint (`/requestRecoveryCode`) always returns uniform HTTP 200 OK with generic response: *"Nếu thông tin phù hợp với một tài khoản và có email hợp lệ, mã xác thực khôi phục sẽ được gửi tới email của bạn."*
   - Non-existent identifiers and accounts with unverified emails perform constant-time dummy password verification to defeat timing attacks.
3. **Strict Rate Limiting & Brute-Force Lockout:**
   - A 60-second cooldown is enforced between recovery code requests per account (HTTP 429 `RateLimitExceededError`).
   - Maximum 5 attempts allowed per recovery session (`maxAttempts: 5`). Each invalid code submission atomically increments `attemptCount`. At 5 wrong attempts, recovery status is set to `'locked'`, terminating the attempt.
4. **Single-Use Password Reset Token (Ephemeral Proof):**
   - Code verification wipes `codeHash` and issues a cryptographically secure 32-byte hex `resetToken` (10-minute TTL).
   - Only the SHA-256 hash of the `resetToken` is stored on the server.
   - Using the `resetToken` to reset password marks the recovery doc as `'consumed'`, wipes `resetTokenHash`, hashes the new password with bcrypt-v1, and revokes all active user sessions (`auth.revokeRefreshTokens`).
5. **Automatic Server-Controlled Account Unlock:**
   - Account unlock is never a standalone client action. It is strictly a server-side consequence of verified recovery.
   - Successful password reset via verified recovery resets `failedLoginAttempts: 0`, clears `lockedAt` and `lockReason`, and restores user profile status to `'active'`.
6. **Immutable Audit Trail:**
   - Emits structured security events to `security_events`: `recovery_requested`, `recovery_code_verified`, `recovery_failed`, `password_reset`, `account_unlocked`.
   - Never exposes plaintext passwords or raw OTPs in logs.

---

## ADR-017: Canonical Session Tracking, Device Fingerprint Hashing, & Fail-Closed Session Revocation

### Status: DECIDED & IMPLEMENTED (Phase 01-C6)

### Context
Legacy authentication relied purely on client localStorage without server-side active session awareness or multi-device revocation capability. When a password was changed or an account was compromised, existing active client sessions remained fully operational until token expiration (up to 1 hour). Furthermore, there was no recognition of trusted devices or sanitized security audit view for users.

### Decision
1. **Subcollection Isolation (`users/{CodeID}/sessions` & `users/{CodeID}/devices`):**
   - Active sessions are stored under `users/{CodeID}/sessions/{sessionId}`.
   - Trusted devices are stored under `users/{CodeID}/devices/{deviceId}`.
   - Both subcollections are strictly denied to direct client access via Firestore rules (`match /sessions/{document=**} { allow read, write: if false; }`, `match /devices/{document=**} { allow read, write: if false; }`).
2. **Zero Raw Secret Storage for Device Fingerprints:**
   - Client entropy/fingerprints are hashed with SHA-256 (`deviceFingerprintHash`). Raw fingerprint secrets are NEVER stored or returned.
3. **Fail-Closed Integration:**
   - Password reset automatically executes `revokeAllSessions` and `admin.auth().revokeRefreshTokens(CodeID)`.
   - Self-service password change executes `revokeOtherSessions` and `admin.auth().revokeRefreshTokens(CodeID)`.
   - Account lockout immediately executes `revokeAllSessions` and fails closed against new session registrations.
4. **Privacy-Preserving UI Presentation:**
   - All network IPs are masked at subnet granularity (`113.190.234.*`).
   - Timestamps are presented as relative Vietnamese strings to prevent timing correlation analysis.
   - The Auth Security Center in `auth/settings/index.html` gives users full transparency over active sessions, trusted devices, and recent security events.

---

## ADR-018: Canonical Role Governance, Firestore Security Hardening, & Legacy Auth Cutover

### Status: DECIDED & IMPLEMENTED (Phase 01-C7)

### Context
Legacy system allowed client-side Firestore writes to `users/{userId}` without verifying immutability of `role` or `adminLevel`, enabling client self-promotion to Administrator. Legacy Firestore rules contained hard-coded emails (`nhatdang10.nd@gmail.com`) and uppercase roles (`SUPER_ADMIN`, `ADMIN`). Additionally, the login page (`auth/login/index.html`) retained legacy OTP tabs utilizing plaintext `registeredPassword`, client-side `Math.random()` OTPs, fake email syntheses (`@ndsite.web.app`), and unverified `localStorage` session writes.

### Decision
1. **Strict Role & Hierarchy Governance:**
   - Define canonical roles: `role: 'user' | 'admin'`, and `adminLevel: null | 'admin' | 'owner'`.
   - Regular users have `role: 'user'`, `adminLevel: null`.
   - Admins have `role: 'admin'`, `adminLevel: 'admin'`.
   - System Owners have `role: 'admin'`, `adminLevel: 'owner'`.
   - Zero-Owner Lockout Prevention: The system enforces that the last remaining active System Owner can NEVER be demoted or removed.
   - Non-owners (users or admins) CANNOT promote/demote anyone or alter administrative privileges.
2. **Firestore Rules Hardening:**
   - Eliminate all hardcoded emails (`nhatdang10.nd@gmail.com`) and legacy uppercase role checks.
   - Completely deny direct client creation (`allow create: if false;`) and deletion (`allow delete: if false;`) on `users/{userId}`.
   - Self-updates on `users/{userId}` enforce strict immutability of `codeId`, `role`, `adminLevel`, and `status`.
   - Admin updates on `users/{userId}` are limited to non-privileged fields on non-owner users. All role promotions/demotions MUST be processed through Cloud Functions.
   - All server-only collections (`private/**`, `sessions/**`, `devices/**`, `counters/**`, `ndids/**`, `emails/**`, `google_identities/**`) deny all client access.
3. **Legacy Auth Decommissioning & Cutover:**
   - Remove legacy OTP tabs (`tab-btn-otp`, `login-form-otp`) and handlers from `auth/login/index.html`.
   - Eliminate all usage of fake email `@ndsite.web.app` and `@ndsite.id` across auth application code.
   - Eliminate all references to plaintext `registeredPassword`.
   - Canonical Auth is the primary and sole authentication path across the entire web platform.
4. **Route Guards as Pure UX Layer:**
   - Client-side route guards (`requireRole`, `requireAdmin`, `requireOwner`) prevent UI flicker and redirect unauthenticated/unauthorized users.
   - Server-side Firestore Rules and Cloud Functions remain the sole authoritative security enforcement layer.

---

## ADR-019: Canonical Auth Finalization & Production Readiness Verification

### Status: DECIDED & IMPLEMENTED (Phase 01-C8)

### Context
Following phases C0 through C7, the Canonical Authentication system was comprehensively designed and implemented. Phase 01-C8 serves as the final audit and production readiness milestone to ensure end-to-end operational integrity, zero regressions, absolute security rule enforcement, complete legacy auth cutover, and 100% test coverage across the entire system matrix.

### Decision
1. **End-to-End Production Verification Matrix:**
   - Formalized and verified 10 core lifecycle domains in `tests/production_readiness_audit.test.js`:
     1. Registration & Canonical Identity Invariant (`UID === CodeID`).
     2. Login via NDID, Email, wrong password lockout, disabled/banned account rejection.
     3. Password recovery, cryptographic verification, single-use reset tokens, and automatic account unlocking.
     4. Self-service password change and NDID 30-day cooldown enforcement.
     5. Google identity linking and permanent preservation of CodeID.
     6. Session lifecycle, multi-session management, revocation (single, others, all), and cross-user isolation.
     7. Trusted devices lifecycle, SHA-256 fingerprint hashing, and zero raw secret exposure.
     8. Authorization hierarchy, role governance, and Zero-Owner Lockout Prevention.
     9. Firestore Security Rules deny contracts (private subcollections, server-only counters/mappings, client create/delete deny).
     10. Legacy cutover verification (zero fake emails, zero plaintext passwords, zero `Math.random()` OTPs) and TimeTable safety contract (0 mutations).
2. **Single Authoritative Identity System:**
   - The current website (`auth/login/`, `auth/register/`, `auth/recovery/`, `auth/settings/`, `assets/js/nd-navbar.js`) operates exclusively on Canonical Auth (`canonical-auth.js`) and Firebase Auth.
   - There is zero fallback to legacy auth mechanisms.
3. **Defensive Error Handling:**
   - Standardized error codes and safe localized messages prevent timing attacks and enumeration of user existence or credentials.
4. **Zero-Mutation TimeTable Invariant:**
   - Confirmed 0 modifications to TimeTable database records, schemas, or security rules.

---

## ADR-020: Transactional Email Infrastructure & Production Activation

### Status: DECIDED & IMPLEMENTED (Phase 01-C9)

### Context
Canonical authentication operations require reliable transactional email delivery for account email verification, account recovery OTP dispatch, and security alerts (password changed, account unlocked). The implementation must satisfy strict security invariants:
1. Zero hardcoded secrets, passwords, or vendor API keys in repository source code.
2. Agent autonomy constraint: The Agent must NOT choose an external email provider on behalf of the Owner; provider selection remains an **OPEN DECISION** until configured by the System Owner.
3. Pluggable provider architecture that operates reliably in local development, testing, and production environments.
4. Non-fatal delivery resiliency: email delivery errors must never crash or rollback core authentication transactions.
5. Absolute preservation of TimeTable invariants (0 schema mutations, 0 data modifications, 0 ownership shifts).

### Decision
1. **Unified EmailService Abstraction:**
   - Centralized `EmailService` singleton (`functions/src/email/email_service.js`) coordinates all application-level email dispatching.
   - Core application modules (`registration.js`, `recovery.js`, `self_service.js`) communicate exclusively through `EmailService` and never instantiate vendor SDKs.
   - Implements 3-second in-memory transient duplicate burst suppression to prevent rapid resend loops.
2. **Decoupled Provider Adapter Architecture:**
   - Abstract `EmailProvider` base class defines the standardized `send({ to, from, replyTo, subject, html, text, metadata })` contract.
   - Concrete implementations:
     - `MockEmailProvider`: In-memory capture for automated testing (`sentMessages`).
     - `ConsoleEmailProvider`: Safe masked stdout logging for local development and staging environments.
     - `GenericHttpEmailProvider`: Production HTTP API adapter using native `fetch` (Node 20 runtime), avoiding vendor lock-in.
3. **Open Decision Contract for Production Provider:**
   - System Owner configures the provider at runtime via environment variables: `EMAIL_PROVIDER`, `EMAIL_PROVIDER_API_KEY`, `EMAIL_PROVIDER_ENDPOINT`, `EMAIL_SENDER_ADDRESS`, `EMAIL_REPLY_TO`, and `EMAIL_APP_BASE_URL`.
   - When unconfigured, the system safely falls back to `console` (in dev) or `mock` (in test) without throwing unhandled exceptions.
4. **Safe Configuration Diagnostics:**
   - `validateEmailConfig()` evaluates runtime configuration and outputs safe diagnostics with zero secret leakage (API keys are masked or reported as boolean flags).
5. **Two-Step Email Verification Workflow:**
   - Cryptographically random 32-byte hex token generated server-side.
   - Stored strictly as a SHA-256 hash in server-only collection `email_verifications/{tokenHash}` and private subcollection `users/{CodeID}/private/verification`.
   - Enforces a 24-hour expiration TTL and 60-second cooldown rate limit between resend requests.
   - Single-use consumption: upon verification, updates `users/{CodeID}.emailVerified = true`, promotes `pending` accounts to `active`, synchronizes Firebase Auth, and marks token consumed.
6. **Recovery & Security Notification Integration:**
   - Account recovery OTPs are dispatched strictly to verified email addresses, preserving the anti-enumeration invariant.
   - Dispatches security notification emails upon successful recovery password reset and self-service password changes.
7. **Firestore Rules Hardening:**
   - `match /email_verifications/{tokenHash} { allow read, write: if false; }` enforces absolute server-only authority.
8. **TimeTable Zero Mutation Invariant:**
   - Zero modifications to timetables, ownerUid, schemas, or security rules.

---

## ADR-021: Resend Free Formal Production Provider Decision & Activation

### Status: DECIDED & IMPLEMENTED (Phase 01-C10)

### Context
In Prompt 01-C10, the System Owner resolved the open decision from C9 by explicitly selecting **Resend Free** ($0/month, 3,000 emails/month, 100 emails/day, up to 3 domains) as the official production transactional email provider for ND Labs / EduSpace.

### Decision
1. **Official Provider Assignment:**
   - `EMAIL_PROVIDER=resend` is designated as the primary production provider.
   - Provider resolution in `config.js` and `provider_adapter.js` natively recognizes `resend` with default canonical endpoint `https://api.resend.com/emails`.
2. **Native HTTP Fetch Architecture:**
   - Utilizes `ResendEmailProvider` extending `GenericHttpEmailProvider` via Node 20 native `fetch`.
   - Avoids installing vendor-specific npm packages (no `@resend/node` or vendor SDK bloat).
   - Maps standard email payload (`from`, `to`, `reply_to`, `subject`, `html`, `text`) cleanly to Resend's REST API contract.
3. **Secret Governance:**
   - `EMAIL_PROVIDER_API_KEY` / `RESEND_API_KEY` is loaded strictly server-side via environment variables / Secret Manager.
   - Zero hardcoded secrets in source code, client bundles, or test suites.
4. **Sender Verification & Quota Invariants:**
   - Sender domain verification in Resend Dashboard is required for arbitrary recipient delivery. If sender domain is unverified by Owner, delivery to arbitrary addresses is marked **BLOCKED** without modifying DNS or domains.
   - Quota limits of Resend Free tier (100 emails/day, 3,000 emails/month) are respected; HTTP 429 errors are gracefully handled without crashing application flows.
5. **Zero Mutation TimeTable Invariant:**
   - Zero modifications to TimeTable schemas, records, or ownership.

---

## ADR-022: Canonical Transactional Email 10-Template Suite & Production Email Contract

### Status: DECIDED & IMPLEMENTED (Phase 01-C10-FINAL)

### Context
Transactional email communications in ND Labs / EduSpace must strictly conform to the Owner's official design contract ("BẢN KHẾ ƯỚC THIẾT KẾ EMAIL GIAO DỊCH CHÍNH THỨC — ND LABS (FINAL CONTRACT)"):
1. Standardized 10-Template Architecture:
   - 01 Verify Email (`buildVerificationEmail`)
   - 02 Recovery Code (`buildRecoveryEmail`)
   - 03 Password Reset Success (`buildPasswordResetSuccessEmail`)
   - 04 Password Changed (`buildPasswordChangedEmail`)
   - 05 Security Alert / New Login (`buildNewLoginSecurityEmail`)
   - 06 Google Linked (`buildGoogleLinkedEmail`)
   - 07 Google Unlinked (`buildGoogleUnlinkedEmail`)
   - 08 Account Unlocked (`buildAccountUnlockedEmail`)
   - 09 Email Change (`buildEmailChangeEmail`)
   - 10 Generic Security Notice (`buildGenericSecurityNoticeEmail`)
2. Brand Identity & Colors:
   - Primary: `#0070F3`, Secondary: `#0026FB`, `#008CE7`, Text: `#261A2D`, Background: `#F6F8FA`, Card: `#FFFFFF`, Inner Info: `#F8FAFC` / `#F0F6FF`.
   - Logo: `https://ndsite.web.app/assets/images/logo.png` (link: `https://ndsite.web.app`).
   - Footer: `https://ndsite.web.app` (label: `ndsite.web.app`).
3. Strict Security Invariants:
   - Anti-enumeration: OTP/recovery codes must NEVER appear in Subject or Preheader; exclusively rendered in the stylized OTP body block.
   - NDID Preservation: Rendered strictly as raw canonical string `${ndid}`, never prepended with `@`.
   - Zero Credential Exposure: Never transmit passwords, password hashes, reset tokens, session tokens, API keys, or private keys.
   - Dual Format: Every template delivers both responsive table-based HTML and clean plain text.
   - Zero marketing slogans, zero social media bloat.

### Decision
1. Implemented all 10 canonical template generators in `functions/src/email/templates.js` using table-based responsive HTML and inline CSS.
2. Centralized dispatch methods for all 10 templates in `EmailService` with 3-second transient duplicate protection and non-fatal error isolation.
3. Integrated security email dispatch into `google.js` (linked/unlinked events), `recovery.js` (password reset success), and `self_service.js` (password changed).
4. Verified 100% compliance across automated test suite (`tests/email_contract_10_templates.test.js`) and repository-wide security scan.


