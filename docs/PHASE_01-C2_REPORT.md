# PHASE 01-C2 COMPLETION REPORT
## ND Labs / EduSpace: Authentication Foundation
### Canonical Registration + Login + Password Security + NDID/Email Mapping (Phase 01-C2)

> **Software:** Antigravity  
> **Model:** Gemini 3.8 Flash  
> **Role:** Senior Firebase Authentication Engineer + Backend Security Engineer  
> **Date:** 2026-09-05  
> **Scope:** Authentication Foundation Implementation: Centralized Password Hashing (bcrypt-v1) + Unique Mappings (ndids/, emails/) + Private Security Subcollection + Orchestrated Compensating Registration + Canonical Login (NDID/Email) + Anti-Enumeration & Lockout + Automated Tests.  
> **Execution Status:** COMPLETED (Code Implemented Locally & Tested, Zero Migration, Zero Data Modification, Zero Deployment to Production).

---

### Core Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Objective

Phase 01-C2 establishes the core authentication and credential infrastructure for the ND Labs / EduSpace ecosystem. It bridges the foundational identity layer (CodeID and canonical `users/{CodeID}`) established in Phase 01-C1 with an orchestrated, server-authoritative registration and login workflow.

Key targets accomplished:
- Implement a centralized password security engine with bcrypt hashing (`passwordVersion: "bcrypt-v1"`), length constraints, and anti-enumeration timing safety.
- Implement isolated private credential storage under `users/{CodeID}/private/security`.
- Implement server-only uniqueness mapping collections for `ndids/{normalizedNDID}` and `emails/{normalizedEmail}`.
- Implement an orchestrated, compensating registration workflow that creates Firebase Auth accounts where `UID === CodeID`.
- Implement canonical login resolving both NDID and Email into CodeID, verifying status, evaluating lockout limits, and issuing Firebase Custom Tokens.
- Protect all sensitive collections via strict Firestore Security Rules.
- Verify everything via comprehensive automated tests (32/32 tests passing across C1 and C2).

---

## 2. Existing Architecture & Preservation

Phase 01-C2 strictly builds upon and preserves the clean architecture created in Phase 01-C0 and Phase 01-C1:
- **CodeID Allocator:** Retained intact in `functions/src/codeid/*`. Allocations remain atomic, monotonic, zero-padded, and permanently consumed.
- **Canonical User Foundation:** Retained intact in `functions/src/database/users.js` with invariant enforcement `snap.id === data.codeId`.
- **Firebase Admin SDK:** Centralized in `functions/src/firebase/admin.js`, extended with `getAuth()`.
- **Existing User Data:** Legacy user accounts in Firestore and Firebase Auth remain 100% untouched.
- **Existing TimeTable:** All timetable documents, permissions, and test data remain 100% untouched.

---

## 3. Implemented Backend Modules

| Module Path | Primary Responsibilities |
|---|---|
| [`functions/src/auth/password.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/password.js) | Password hashing (bcryptjs, 10 rounds), verification, versioning (`"bcrypt-v1"`), length validation (8-128 chars), no silent trimming, dummy verify for timing safety. |
| [`functions/src/auth/validation.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/validation.js) | Strict validation & normalization separating Raw Input, Storage Value, and Normalized Lookup Keys for NDID, Email, and Name. |
| [`functions/src/auth/identity.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/identity.js) | Server-side resolution of identifiers (NDID or Email) to CodeID; atomic transactional reservations; compensation release of mappings. |
| [`functions/src/auth/errors.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/errors.js) | Standardized error classes (`InvalidCredentialsError`, `IdentifierUnavailableError`, `AccountLockedError`, `ValidationError`, etc.) preventing account enumeration. |
| [`functions/src/database/security.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/database/security.js) | Data access for `users/{CodeID}/private/security`; atomic increment of failed attempts; automatic lockout at 5 failures; reset on successful login. |
| [`functions/src/auth/security_events.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/security_events.js) | Tamper-evident append-only audit trail logger with automatic credential sanitization (passwords and tokens never recorded). |
| [`functions/src/auth/registration.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/registration.js) | Multi-step orchestrated registration with automatic compensation, idempotency replay, and permanent CodeID consumption. |
| [`functions/src/auth/login.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/login.js) | Canonical authentication service resolving NDID or Email, checking status, evaluating locks, comparing bcrypt hash, and minting Custom Tokens with UID === CodeID. |
| [`functions/src/index.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/index.js) | Centralized export barrel for all foundation and authentication services. |
| [`functions/index.js`](file:///d:/Project/WebSite/ND%20Labs/functions/index.js) | Public Cloud Functions: `registerUser` and `loginUser` HTTPS endpoints with CORS, rate limit foundations, and sanitized error responses. |

---

## 4. Registration Architecture: Orchestrated & Compensating Workflow

### Architectural Reality
Firebase Auth user creation (`admin.auth().createUser`) and Cloud Firestore writes cannot participate in a shared, distributed two-phase commit (2PC) transaction. Therefore, registration is designed as an **orchestrated flow with compensating transactions**:

```
[Client POST /registerUser]
           │
           ▼
[Step 1: Input Validation] ──── (Invalid) ───► Throw ValidationError (400)
           │ (Valid)
           ▼
[Step 2: Firestore Transaction]
   ├── Check ndids/{normalizedNDID} availability
   ├── Check emails/{normalizedEmail} availability
   ├── Atomic CodeID Allocation (counters/code_ids)  ◄─── CODEID IS CONSUMED PERMANENTLY!
   └── Write active reservation to ndids/ and emails/
           │
           ▼
[Step 3: Password Hashing] ──── (bcrypt-v1, 10 salt rounds)
           │
           ▼
[Step 4: Firebase Auth Creation]
   admin.auth().createUser({ uid: codeId, email, displayName })
           │
           ├── (FAILS) ──► COMPENSATION:
           │                 1. Delete ndids/ & emails/ reservations (allow re-registration)
           │                 2. CodeID remains consumed (creates intentional sequence gap)
           │                 3. Log registration_failed audit event
           │                 4. Throw RegistrationCompensationError (500)
           │
           ▼ (SUCCEEDS)
[Step 5: Canonical Firestore Documents]
   ├── users/{CodeID} (Foundation profile)
   └── users/{CodeID}/private/security (Hashed credentials)
           │
           ├── (FAILS) ──► COMPENSATION:
           │                 1. Delete created Firebase Auth user (admin.auth().deleteUser(codeId))
           │                 2. Delete ndids/ & emails/ reservations
           │                 3. CodeID remains consumed
           │                 4. Throw RegistrationCompensationError (500)
           │
           ▼ (SUCCEEDS)
[Step 6: Mint Firebase Custom Token]
   admin.auth().createCustomToken(codeId, { role: "user" })
           │
           ▼
[Step 7: Log Audit Event]
   security_events: { eventType: "registration_success", actorCodeID: codeId }
           │
           ▼
[Step 8: 201 Created Response]
   Return { success: true, codeId, customToken, user }
```

---

## 5. Firebase Auth Integration: Strict `UID === CodeID`

- In the canonical architecture, Firebase Auth is an authentication token authority, **not an independent identity authority**.
- When creating an account:
  ```javascript
  await auth.createUser({
    uid: codeId, // Strictly equals allocated CodeID (e.g., "0000", "0042")
    email: normalizedEmail || undefined,
    displayName: validatedDisplayName,
    disabled: false,
  });
  ```
- **Prohibitions Upheld:**
  - Zero random UIDs generated for new accounts.
  - No `uid = ndid` or `uid = email`.
  - No fake email identities (`${ndid}@ndsite.web.app`).

---

## 6. Firestore Integration & Physical Isolation

The canonical Firestore structure now encapsulates:
1. `users/{CodeID}`: Public/semi-public user foundation record. Invariant enforced: `snap.id === data.codeId`.
2. `users/{CodeID}/private/security`: Physically isolated credential record containing `passwordHash`, `passwordVersion`, `failedLoginAttempts`, `lockedAt`.
3. `ndids/{normalizedNDID}`: Server-controlled unique index mapping handle to `codeId`.
4. `emails/{normalizedEmail}`: Server-controlled unique index mapping email to `codeId`.
5. `security_events/{eventId}`: Tamper-evident append-only security log.
6. `idempotency_keys/{key}`: Request replay prevention store.

All subcollections under `users/{CodeID}/private/*`, `counters/*`, `ndids/*`, and `emails/*` are protected with `allow read, write: if false;` in [`firestore.rules`](file:///d:/Project/WebSite/ND%20Labs/firestore.rules).

---

## 7. Password Security & Hashing Decision

- **Selected Algorithm:** `bcryptjs` with **10 salt rounds** (ADR-007 DECIDED).
- **Version Tag:** `"bcrypt-v1"`.
- **Benchmark Evaluation:** 10 rounds executes in ~54ms in Node.js, providing an optimal security work factor without risking serverless timeouts.
- **Strict Whitespace Policy:** Passwords are never trimmed silently. If a user provides leading or trailing spaces, they are preserved as part of the password entropy.
- **Length Constraints:** Minimum 8 characters, maximum 128 characters.
- **Timing Attack Mitigation:** A constant-time `dummyVerifyPassword` function is called whenever an identifier or account does not exist, equalizing server response latency.

---

## 8. NDID Contract & Normalization

- **Rule 1 (Form Input):** Validated with `/^[a-zA-Z0-9_.]+$/`, length 3 to 30 characters.
- **Rule 2 (Storage):** Preserves RAW casing in `users/{CodeID}.ndid` (e.g., `"Alice_Wonder"`).
- **Rule 3 (Lookup Key):** Normalized to lowercase for index document key `ndids/{normalizedNDID}` (e.g., `"alice_wonder"`).
- **Rule 4 (No Prefix):** No `@` prefix is added. No fake domain is appended.

---

## 9. Email Contract & Normalization

- Email is completely decoupled from NDID.
- Validated via RFC 5322 regex, maximum 254 characters.
- Normalized via `email.trim().toLowerCase()` for document key `emails/{normalizedEmail}`.
- Used exclusively for login, recovery, notifications, and verification.

---

## 10. Login Architecture: Unified Identifier Resolution

The login flow ([`functions/src/auth/login.js`](file:///d:/Project/WebSite/ND%20Labs/functions/src/auth/login.js)) handles both NDID and Email seamlessly:

1. **Auto-Detection:** If the identifier string contains `@`, it is classified as an Email; otherwise, it is classified as an NDID.
2. **Normalized Lookup:** Look up `emails/{normalized}` or `ndids/{normalized}` to retrieve the owning `CodeID`.
3. **Anti-Enumeration Guard:** If identifier does not exist, run `dummyVerifyPassword()` and throw generic `InvalidCredentialsError("Thông tin đăng nhập không chính xác.")`.
4. **Lifecycle Status Gating:**
   - `'active'`: Allowed to authenticate.
   - `'locked'`: Throws `AccountLockedError` (403).
   - `'disabled'`: Throws `AccountDisabledError` (403).
   - `'banned'`: Throws `AccountBannedError` (403).
   - `'pending'`: Throws `AccountPendingError` (403).
5. **Lockout Check:** If `failedLoginAttempts >= 5` or `lockedAt != null`, authentication is blocked.
6. **Password Verification:** Compare password against `passwordHash`.
7. **Failure Branch:**
   - Atomically increment `failedLoginAttempts`.
   - If count reaches 5: set `users/{CodeID}.status = 'locked'`, set `lockedAt = now()`, log `account_locked` event.
   - Log `login_failed` event.
   - Throw generic `InvalidCredentialsError`.
8. **Success Branch:**
   - Reset `failedLoginAttempts = 0`.
   - Update `users/{CodeID}.lastLoginAt = now()`.
   - Mint Firebase Custom Token (`uid = CodeID`, custom claims: `{ role, adminLevel }`).
   - Log `login_success` event.
   - Return authenticated result.

---

## 11. Failure Compensation Details

When downstream steps fail during registration:
1. **CodeID Never Recycled:** The allocated CodeID remains consumed forever. Sequence gaps (e.g. `0000`, `0002` with `0001` gap) are valid, expected, and harmless.
2. **Mapping Release:** `ndids/{normalizedNDID}` and `emails/{normalizedEmail}` are deleted via compensating batch so the user can immediately re-attempt registration with their desired credentials.
3. **Orphan Auth Account Cleanup:** If Firebase Auth user was created but Firestore document write failed, `admin.auth().deleteUser(codeId)` is executed immediately.

---

## 12. Idempotency & Retry Safety

- Supports optional `idempotencyKey` parameter.
- Stores request status in `idempotency_keys/{key}`.
- If a client retries due to a network blip or duplicate button click:
  - Completed request: Returns the existing user data and mints a fresh custom token without allocating a new CodeID or creating a duplicate user.
  - In-progress request: Throws a clean waiting message (`"Yêu cầu đăng ký này đang được xử lý, vui lòng chờ trong giây lát."`).

---

## 13. Security Controls & Protections

| Threat | Security Control Implemented |
|---|---|
| **Account Enumeration** | Identical generic error message (`"Thông tin đăng nhập không chính xác."`) for non-existent users and wrong passwords. Dummy bcrypt verification normalizes response timing. |
| **Identifier Collision / Race** | Transactional check-and-set in Firestore transaction. Tested under concurrent requests: only 1 succeeds, 1 blocked. |
| **Brute Force Passwords** | Automatic account lockout after 5 consecutive failures via atomic Firestore transaction. |
| **Credential Leakage** | `passwordHash` quarantined in `users/{CodeID}/private/security`. Firestore rules block all client reads. Password sanitized from all audit logs. |
| **Privilege Escalation** | Client cannot grant roles (`role: "user"` is hardcoded on server registration; admin roles can only be granted by Owner). Firestore rules forbid client writes to roles. |

---

## 14. Automated Test Suite

A dedicated automated test suite was implemented in [`tests/auth_foundation.test.js`](file:///d:/Project/WebSite/ND%20Labs/tests/auth_foundation.test.js), utilizing an in-memory transactional mock of Firestore and Firebase Admin Auth:
- **Test Command:** `node --test tests/auth_foundation.test.js`
- **Total Tests in Suite:** 16 tests
- **Passed:** 16 / 16 (100%)
- **Combined Test Total (C1 + C2):** 32 / 32 (100% pass rate)

---

## 15. Test Results Summary

```text
✔ PASSWORD: hashing and verification with bcrypt-v1 (220.0581ms)
✔ PASSWORD: validation constraints and whitespace preservation (0.4321ms)
✔ NDID: validation, normalization, and policy enforcement (0.2002ms)
✔ EMAIL: validation and normalization (0.2302ms)
✔ REGISTRATION: full canonical registration flow with UID === CodeID (119.0672ms)
✔ REGISTRATION: duplicate NDID is rejected atomically (53.2955ms)
✔ REGISTRATION: duplicate Email is rejected atomically (52.976ms)
✔ REGISTRATION: failure downstream permanently consumes CodeID (never recycled) (158.8237ms)
✔ REGISTRATION: idempotency key replays exact result without duplicate account (52.9377ms)
✔ LOGIN: authenticate successfully via NDID (106.0144ms)
✔ LOGIN: authenticate successfully via Email (103.1449ms)
✔ LOGIN: wrong password increments failed count and locks after 5 attempts (314.606ms)
✔ LOGIN: successful login resets failed counter to zero (209.5664ms)
✔ LOGIN: rejects accounts with disabled or banned status (53.6101ms)
✔ SECURITY & ANTI-ENUMERATION: generic error message for non-existent users (102.5015ms)
✔ CONCURRENCY: 2 simultaneous registrations with same NDID only permits 1 (52.6314ms)

ℹ tests 16
ℹ pass 16
ℹ fail 0
ℹ duration_ms 1697.8438
```

---

## 16. Existing User Impact: ZERO IMPACT

- No existing accounts have been modified, migrated, or deleted.
- Existing Firebase Auth users continue to authenticate via their existing tokens.
- No legacy user documents in `users/` have been altered.

---

## 17. TimeTable Impact: ZERO IMPACT

- Every TimeTable schedule, lesson, subject, and permission binding remains 100% untouched.
- No `timetableId` or ownership fields were modified.

---

## 18. Migration Deferred

- Account migration is strictly deferred to Phase 01-C4.
- No scripts were executed against live data.

---

## 19. Known Limitations (Intentionally Deferred)

- ❌ **No UI Refactor:** HTML forms in `auth/login/index.html` and `auth/register/index.html` still run their legacy code. Client UI migration belongs to Phase 01-C3.
- ❌ **No Email Change / Verification Flow:** Sending verification emails and changing email address belongs to Phase 01-C3.
- ❌ **No NDID Change (30-day cooldown):** Self-service handle updates belong to Phase 01-C3.
- ❌ **No Google OAuth UI Linking:** Google authentication frontend integration belongs to Phase 01-C3.
- ❌ **No Production Deployment:** Cloud Functions were not deployed (`firebase deploy` not executed).

---

## 20. Next Phase Proposal: Phase 01-C3 (Auth Client Integration & Self-Service)

With the backend authentication foundation complete, tested, and secured, the recommended next phase is **Phase 01-C3**:
1. **Frontend Auth Client SDK Adapter:** Implement canonical client auth service in `assets/js/canonical-auth.js` that calls `/registerUser` and `/loginUser`, signs in with Custom Tokens via Firebase Web SDK, and manages session state.
2. **Registration & Login UI Migration:** Connect `auth/register/index.html` and `auth/login/index.html` to the canonical endpoints, eliminating legacy fake-email registration.
3. **Self-Service Profile & Security:** Implement password change, handle update with 30-day reservation cooldown, and Google OAuth identity linking.
4. **Navbar & Session Sync:** Update `assets/js/nd-navbar.js` to resolve user display attributes from canonical `users/{CodeID}`.
