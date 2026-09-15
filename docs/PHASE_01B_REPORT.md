# Phase 01-B Report

> **Project:** TimeTable – EduSpace by ND Labs
> **Phase:** 01-B — Auth Rules & Architecture Foundation
> **Date:** 2026-08-30 → 2026-09-01
> **Role:** Senior Software Architect + Security Architect + Documentation Engineer

---

## 1. Completed

| Deliverable | File | Size | Status |
|---|---|---|---|
| Project Rules | `/docs/PROJECT_RULES.md` | 5.9 KB | ✅ Created |
| Auth Rules (Source of Truth) | `/docs/AUTH_RULES.md` | 12.3 KB | ✅ Created |
| Auth Architecture (Flow Diagrams) | `/docs/AUTH_ARCHITECTURE.md` | 27.7 KB | ✅ Created |
| Database Schema | `/docs/DATABASE.md` | 10.5 KB | ✅ Created |
| Security Specification | `/docs/SECURITY.md` | 14.2 KB | ✅ Created |
| Architecture Decision Records | `/docs/ARCHITECTURE_DECISIONS.md` | 12.6 KB | ✅ Created |
| Coding Standards §9 Update | `_agent/workflows/coding-standards.md` | Updated | ✅ Modified |
| Phase Report | `/docs/PHASE_01B_REPORT.md` | This file | ✅ Created |

**Total new documentation: ~83 KB across 7 new files + 1 modified file.**

---

## 2. Rules Changed

| Rule | File | Old Content | New Content | Reason |
|---|---|---|---|---|
| §9 NDID Login System | `_agent/workflows/coding-standards.md` | Mandated `@ndsite.web.app` as the required email domain for Firebase Auth. Required fallback for `@ndlabs.com`. | Prohibits ALL fake email conversion. Requires Custom Token auth via trusted backend. Marks legacy auth pages for migration. | Old rule directly contradicted new auth spec. Fake email pattern is a core security/architectural issue being eliminated. |

---

## 3. Rules Removed

| Rule | File | Reason |
|---|---|---|
| "Đuôi email nội bộ phục vụ cho Firebase Auth bắt buộc phải là `@ndsite.web.app`" | `coding-standards.md` §9 | New auth does not use fake emails. NDID → Custom Token, not NDID → fake email → `signInWithEmailAndPassword()`. |
| "Hỗ trợ fallback tương thích ngược tự động cho tài khoản cũ (đuôi `@ndlabs.com`)" | `coding-standards.md` §9 | Legacy compatibility will be handled during migration, not by maintaining fake email patterns in new code. |
| "TUYỆT ĐỐI KHÔNG hiển thị hậu tố tên miền `@ndsite.web.app` lên giao diện" | `coding-standards.md` §9 | No longer relevant — there is no fake email domain to hide. NDID is displayed as-is. |

---

## 4. Rules Added

| Rule | File | Summary |
|---|---|---|
| NDID is NOT email | `PROJECT_RULES.md` §3.4, `AUTH_RULES.md` §1.1 | NDID must never be converted to fake email. |
| Custom Token auth | `AUTH_RULES.md` §3, `AUTH_ARCHITECTURE.md` §3 | All auth goes through trusted backend → Custom Token → `signInWithCustomToken()`. |
| Password hash only | `AUTH_RULES.md` §2, `SECURITY.md` §3 | Only `passwordHash` stored. 12 specific locations where password must never appear. |
| CodeID server-side | `AUTH_RULES.md` §1.2, `DATABASE.md` §6 | Sequential atomic counter, server-only generation. |
| Role model: user/admin | `AUTH_RULES.md` §5 | Replaces member/admin/moderator with user/admin + adminLevel (owner/admin/null). |
| Account status system | `AUTH_RULES.md` §6 | 5 states: active, disabled, banned, locked, pending. Transition rules defined. |
| Lockout: 5 attempts | `AUTH_RULES.md` §7, `SECURITY.md` §4 | Server-side lockout with atomic increment, not clearable by client. |
| Permission matrix | `AUTH_RULES.md` §5.2 | 12-action × 3-role matrix defining who can do what. |
| Firestore Security Rules (proposed) | `SECURITY.md` §5.1 | Detailed rules separating client-writable vs server-only fields. |
| AI AGENT MUST NOT | `PROJECT_RULES.md` §bottom | 16 prohibited behaviors for AI agents. |
| NDID change cooldown | `AUTH_RULES.md` §11, `DATABASE.md` §3 | 30-day reservation on old NDID after change. |
| Security event logging | `AUTH_RULES.md` §10, `DATABASE.md` §7 | 13 event types, admin-readable, append-only. |

---

## 5. Architecture Decisions

| ADR | Title | Status | Summary |
|---|---|---|---|
| ADR-001 | Firebase UID vs CodeID | **PROPOSED** | Recommends UID = CodeID for simpler Firestore rules. Awaiting user confirmation. |
| ADR-002 | CodeID consumption on failed registration | **OPEN** | 3 options analyzed. Recommended: consume on allocation (simplest). Needs implementation evaluation. |
| ADR-003 | Password hashing algorithm | **PROPOSED** | Recommends bcrypt via `bcryptjs`. Needs Cloud Functions performance verification. |
| ADR-004 | NDID change and cooldown policy | **PROPOSED** | 30-day cooldown via `ndids/{ndid}` status field. |
| ADR-005 | Account deletion scope | **OPEN** | Hard vs soft vs phased delete. Requires dependency analysis. |
| ADR-006 | Session token TTL and refresh | **OPEN** | Deferred — Firebase SDK handles by default. |
| ADR-007 | Email delivery service | **OPEN** | Not evaluated. Blocked until implementation phase. |
| ADR-008 | Trusted device mechanism | **OPEN** | Not designed. Architecture leaves room for future. |
| ADR-009 | Owner bootstrapping | **PROPOSED** | First Owner via direct Firestore write or Admin SDK script. |
| ADR-010 | Realtime DB vs Firestore | **DECIDED** | Firestore for all user/auth data. RTDB for config only. |

---

## 6. Open Decisions

These items require user input or implementation-phase evaluation before they can be finalized:

1. **ADR-001: Firebase UID = CodeID?** — Strongly recommended but impacts migration strategy. Needs explicit approval.
2. **ADR-002: CodeID on failed registration** — Consume (waste code) or transactional (complex)?
3. **ADR-005: Account deletion** — Hard, soft, or phased? Depends on TimeTable data dependencies.
4. **ADR-006: Session TTL** — Use Firebase defaults or customize?
5. **ADR-007: Email service** — Which provider for OTP/recovery emails?
6. **ADR-008: Trusted devices** — Design deferred. No schema impact if planned correctly.
7. **Password minimum length** — Not specified in prompt. Recommended ≥ 8 characters.
8. **Registration flow** — Is self-registration open or admin-only? Prompt says "admin creates NDID" but also mentions a registration flow.

---

## 7. Security Improvements

| Area | Before (Current) | After (New Spec) |
|---|---|---|
| Password storage | Plaintext `registeredPassword` in Firestore | `passwordHash` (bcrypt), server-only |
| Authentication | Fake email `signInWithEmailAndPassword()` | Custom Token via trusted backend |
| CodeID generation | `Math.random()` client-side | Atomic counter server-side |
| Role enforcement | localStorage check (client-only) | Firestore Security Rules + backend |
| OTP | Client-generated, never sent | Server-generated, sent via email |
| Lockout | None | 5 attempts → locked, server-side |
| Account status | None | 5 states with defined transitions |
| Sensitive field protection | Client can write all fields | 16 fields server-write-only |
| Admin password | Plaintext in RTDB with fallback "123456" | Firebase Auth + Custom Token |
| Firestore rules | Not version-controlled | `firestore.rules` in repo (proposed) |

---

## 8. Remaining Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Existing users have fake email Firebase Auth identities | HIGH | Migration plan needed (implementation phase) |
| Existing `registeredPassword` plaintext in Firestore | CRITICAL | Must hash during migration before removing |
| No `firestore.rules` in production yet | HIGH | Deploy during implementation phase, test with emulator first |
| Legacy auth pages still use old patterns | MEDIUM | Marked as legacy in coding-standards.md; will be replaced by React |
| `database.rules.json` still validates `member|admin|moderator` | LOW | Update during implementation when new auth is deployed |
| `config/adminPassword` with fallback "123456" still exists | HIGH | Remove during Cloud Functions auth implementation |
| Number of existing users unknown | MEDIUM | Must audit Firestore before migration |
| AGENT.md and .cursorrules still reference old NDID rules only | LOW | Compatible with new rules (they don't mention fake email) |

---

## 9. Files Modified

### New Files Created (Documentation Only)

| File | Purpose |
|---|---|
| `docs/PROJECT_RULES.md` | Project-wide rules with AI agent prohibitions |
| `docs/AUTH_RULES.md` | Definitive auth specification (source of truth) |
| `docs/AUTH_ARCHITECTURE.md` | Flow diagrams for all auth operations |
| `docs/DATABASE.md` | Firestore schema with field-level access control |
| `docs/SECURITY.md` | Threat model, trust boundaries, Firestore rules |
| `docs/ARCHITECTURE_DECISIONS.md` | 10 ADRs with status tracking |
| `docs/PHASE_01B_REPORT.md` | This report |

### Files Modified (Documentation/Rules Only)

| File | Change |
|---|---|
| `_agent/workflows/coding-standards.md` | §9 replaced: fake email rule → Custom Token auth rule |

### Source Code Files Modified

**NONE.** No source code was touched.

---

## 10. Confirmation

- ✅ **No authentication implementation** — no React components, no Cloud Functions, no auth logic written.
- ✅ **No database migration** — no Firestore documents changed, no collections created.
- ✅ **No production deployment** — no `firebase deploy`, no GitHub push.
- ✅ **No password migration** — existing `registeredPassword` fields untouched.
- ✅ **No source-code implementation** — only documentation and rule files created/modified.
- ✅ **No package.json changes** — no dependencies added.
- ✅ **No Firebase rules deployed** — proposed rules are in documentation only.
- ✅ **No `database.rules.json` modified** — legacy rules left as-is for now.

---

## Old Rules Compatibility Table

| Old Rule | File | Status | New Rule | Action |
|---|---|---|---|---|
| Version format `ver:X.M.D.HHMM` | AGENT.md §1 | **KEEP** | Same | No change |
| NDID regex on forms only | AGENT.md §2.1 | **KEEP** | Same in AUTH_RULES.md §1.1 | Compatible |
| NDID raw string from DB | AGENT.md §2.2 | **KEEP** | Same in PROJECT_RULES.md §3.2 | Compatible |
| No `@` prefix on NDID | AGENT.md §2.3 | **KEEP** | Same in PROJECT_RULES.md §3.3 | Compatible |
| UI text rules (no AI buzzwords) | AGENT.md §3 | **KEEP** | Same in PROJECT_RULES.md §4 | Compatible |
| .cursorrules (all rules) | .cursorrules | **KEEP** | Duplicate of AGENT.md | Compatible |
| .agents/AGENTS.md (all rules) | .agents/AGENTS.md | **KEEP** | Duplicate of AGENT.md | Compatible |
| §1 Project structure (template.html) | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §2 Backward compatibility | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §3 Exam layout config | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §4 UI/UX aesthetics | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §5 Local history | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §6 AI & Math support | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §7 Subject naming | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| §8 Version control | coding-standards.md | **KEEP** | Duplicate of AGENT.md §1 | Compatible |
| §9 NDID login & domain | coding-standards.md | **REPLACE** | New §9 prohibits fake email, requires Custom Token | **Changed in this phase** |
| §10 Exam metadata & routing | coding-standards.md | **KEEP** | EduSpace quiz specific | Not auth-related |
| RTDB role validation: member\|admin\|moderator | database.rules.json L21 | **UPDATE** (deferred) | New: user\|admin | Will update during implementation when new auth deploys |
| RTDB users/{uid} keying | database.rules.json L8 | **UPDATE** (deferred) | New: users/{CodeID} in Firestore | Legacy RTDB rules kept until Firestore migration completes |
