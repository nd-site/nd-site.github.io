# AUTH ARCHITECTURE
## Canonical Authentication & Identity Architecture (Phase 01-C0)

> **Project:** TimeTable – EduSpace by ND Labs  
> **Status:** CANONICAL ARCHITECTURAL SPECIFICATION (Phase 01-C0)  
> **Last Updated:** 2026-09-05  
> **References:** [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md), [AUTH_RULES.md](AUTH_RULES.md), [DATABASE.md](DATABASE.md), [SECURITY.md](SECURITY.md)

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. System Overview & Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARIES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐     UNTRUSTED                     │
│  │   React Frontend     │     (Browser Environment)         │
│  │   ┌────────────────┐ │                                   │
│  │   │ Login Form     │ │                                   │
│  │   │ Route Guards   │ │                                   │
│  │   │ UI Presentation│ │                                   │
│  │   │ localStorage   │ │                                   │
│  │   └────────────────┘ │                                   │
│  └──────────┬───────────┘                                   │
│             │ HTTPS POST (API Endpoints)                    │
│  ═══════════╪═══════════════════════════════════════════    │
│             │          SECURITY TRUST BOUNDARY              │
│  ═══════════╪═══════════════════════════════════════════    │
│             ▼                                               │
│  ┌──────────────────────┐     TRUSTED                       │
│  │ Cloud Functions      │     (Server Execution)            │
│  │   ┌────────────────┐ │                                   │
│  │   │ /auth/login    │ │                                   │
│  │   │ /auth/register │ │                                   │
│  │   │ /auth/recovery │ │                                   │
│  │   │ /auth/ndid     │ │                                   │
│  │   └────────────────┘ │                                   │
│  └──────────┬───────────┘                                   │
│             │ Firebase Admin SDK (Privileged Authority)     │
│             ▼                                               │
│  ┌──────────────────────┐     TRUSTED                       │
│  │ Firebase Services    │     (Infrastructure)              │
│  │   ┌────────────────┐ │                                   │
│  │   │ Firestore      │ │                                   │
│  │   │ Firebase Auth  │ │                                   │
│  │   │ Security Rules │ │                                   │
│  │   └────────────────┘ │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical Registration Flow

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Frontend │    │ Cloud Func   │    │  Firestore   │    │ Firebase │
│ (React)  │    │(/auth/regist)│    │             │    │   Auth   │
└────┬─────┘    └──────┬───────┘    └──────┬──────┘    └────┬─────┘
     │                 │                   │                │
     │ POST {ndid,     │                   │                │
     │  name, email,   │                   │                │
     │  password}      │                   │                │
     │────────────────>│                   │                │
     │                 │ Validate inputs   │                │
     │                 │ Check NDID unique │                │
     │                 │ Check email unique│                │
     │                 │──────────────────>│                │
     │                 │ ndids/{ndid}?     │                │
     │                 │ emails/{email}?   │                │
     │                 │<──────────────────│                │
     │                 │                   │                │
     │                 │ Transaction:      │                │
     │                 │ Increment counter │                │
     │                 │ counters/code_ids │                │
     │                 │──────────────────>│                │
     │                 │ -> Allocate CodeID│                │
     │                 │<──────────────────│                │
     │                 │ (CodeID consumed) │                │
     │                 │                   │                │
     │                 │ Hash password     │                │
     │                 │ (bcrypt/Argon2)   │                │
     │                 │                   │                │
     │                 │ Write user docs:  │                │
     │                 │ users/{CodeID}    │                │
     │                 │ users/{CodeID}/   │                │
     │                 │   private/security│                │
     │                 │ ndids/{ndid}      │                │
     │                 │ emails/{email}    │                │
     │                 │──────────────────>│                │
     │                 │<──────────────────│                │
     │                 │                   │                │
     │                 │ Admin SDK:        │                │
     │                 │ Create Auth user  │                │
     │                 │ uid = CodeID      │                │
     │                 │───────────────────│───────────────>│
     │                 │                   │                │
     │                 │ Mint Custom Token │                │
     │                 │ uid = CodeID      │                │
     │                 │<──────────────────│────────────────│
     │                 │                   │                │
     │  {customToken,  │                   │                │
     │   userProfile}  │                   │                │
     │<────────────────│                   │                │
     │                 │                   │                │
     │ signInWith      │                   │                │
     │ CustomToken()   │                   │                │
     │─────────────────│───────────────────│───────────────>│
     │                 │                   │                │
     │ Session OK      │                   │                │
     │ (uid == CodeID) │                   │                │
     │<────────────────│───────────────────│────────────────│
```

---

## 3. Canonical Login Flow (NDID or Email)

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Frontend │    │ Cloud Func   │    │  Firestore   │    │ Firebase │
│ (React)  │    │(/auth/login) │    │             │    │   Auth   │
└────┬─────┘    └──────┬───────┘    └──────┬──────┘    └────┬─────┘
     │                 │                   │                │
     │ POST {identifier│                   │                │
     │  password}      │                   │                │
     │────────────────>│                   │                │
     │                 │ Resolve CodeID:   │                │
     │                 │ ndids/ or emails/ │                │
     │                 │ (Server-only map) │                │
     │                 │──────────────────>│                │
     │                 │<──────────────────│                │
     │                 │                   │                │
     │                 │ [Not found?]      │                │
     │                 │ Dummy hash check  │                │
     │                 │ Generic 401 err   │                │
     │  {error}        │                   │                │
     │<────────────────│                   │                │
     │                 │                   │                │
     │                 │ Load doc:         │                │
     │                 │ users/{CodeID}    │                │
     │                 │ private/security  │                │
     │                 │──────────────────>│                │
     │                 │<──────────────────│                │
     │                 │                   │                │
     │                 │ Check status:     │                │
     │                 │ locked/disabled?  │                │
     │                 │ [Blocked?]        │                │
     │  {error}        │ Reject 403        │                │
     │<────────────────│                   │                │
     │                 │                   │                │
     │                 │ Verify password   │                │
     │                 │ against hash      │                │
     │                 │                   │                │
     │                 │ [Mismatch?]       │                │
     │                 │ failedAttempts++  │                │
     │                 │ if >= 5: lock!    │                │
     │                 │──────────────────>│                │
     │  {error}        │ Generic 401 err   │                │
     │<────────────────│                   │                │
     │                 │                   │                │
     │                 │ [Match Success]   │                │
     │                 │ failedAttempts = 0│                │
     │                 │ lastLogin = now() │                │
     │                 │──────────────────>│                │
     │                 │                   │                │
     │                 │ Mint Custom Token │                │
     │                 │ uid = CodeID      │                │
     │                 │───────────────────│───────────────>│
     │                 │<──────────────────│────────────────│
     │                 │                   │                │
     │  {customToken,  │                   │                │
     │   userProfile}  │                   │                │
     │<────────────────│                   │                │
     │                 │                   │                │
     │ signInWith      │                   │                │
     │ CustomToken()   │                   │                │
     │─────────────────│───────────────────│───────────────>│
     │                 │                   │                │
     │ Session OK      │                   │                │
     │<────────────────│───────────────────│────────────────│
```

---

## 4. Universal Identity & Resolution Architecture

```
                    ┌───────────────────────────┐
                    │      LOGIN IDENTIFIER     │
                    │      (NDID or Email)      │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   PRIVATE LOOKUP MAPPING  │
                    │   ndids/ or emails/       │
                    │   (Server-side only)      │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │      IMMUTABLE CODEID     │
                    │      (e.g., "0000")       │
                    └──────┬─────────────┬──────┘
                           │             │
              ┌────────────┘             └────────────┐
              ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│     AUTHENTICATION        │           │    CANONICAL PROFILE      │
│   Firebase Auth UID       │           │    users/{CodeID}         │
│   uid === CodeID          │           │    (Public / Safe Doc)    │
└───────────────────────────┘           └─────────────┬─────────────┘
                                                      │
                                                      ▼
                                        ┌───────────────────────────┐
                                        │    ISOLATED CREDENTIALS   │
                                        │    users/{CodeID}/        │
                                        │      private/security     │
                                        │    - passwordHash         │
                                        │    - failedLoginAttempts  │
                                        │    (Server-only)          │
                                        └───────────────────────────┘
```

---

> **PHASE 01-C0 CONFIRMATION:**  
> This architectural design reflects the decided canonical specifications.  
> **NO MIGRATION OR CODE REWRITES PERFORMED IN THIS PHASE.**
