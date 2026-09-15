# PHASE DATABASE CLEAN RESET — FINAL REPORT

**Project ID:** ndlabs-0
**Executed At:** 2026-09-06T17:28:00+07:00
**Executed By:** Canonical Auth System — Owner Approved
**Mode:** DESTRUCTIVE EXECUTION

---

## STATUS

PHASE A (Safety Check): COMPLETE
PHASE B (Execution): COMPLETE
PHASE C (Verification): COMPLETE — ALL CHECKS PASS
PHASE D (Backend Sanity): COMPLETE

---

## DELETED AUTH USERS (13 USERS DELETED)

- 0006 (vtest_1788672204971@example.com)
- 0007 (e2e_1788672330888@ndlabs.dev)
- 0008 (v2_1788672365409@example.com)
- 0009 (u_1788672396818@example.com)
- 0010 (v_final_1788673278334@example.com)
- 0013 (diag_1788674735966@ndlabs.dev)
- 0014 (user_1788675119@ndlabs.dev)
- 0021 (appeared during cleanup, also deleted)
- 6cXk6a9Pj3fK3bgsLuLkLgausPH3 (chauchau_tc@ndsite.web.app)
- AR8b4fcqY9afIOJ7ZvUBKk1yGTi1 (nhatdang10.nd@gmail.com)
- HqPqx9xcx4ejlYOvAzjU10Vo0VP2 (nhatdang10@ndsite.web.app)
- UkvNFl0XFHhEJtcYXRsSNR1QQU43 (bkhuyen160503@gmail.com)
- uZtDX3Wgp9VIYCrcQ8R2NCYPH052 (nhatdang@ndsite.web.app)

---

## DELETED FIRESTORE DATA

- users: 15 documents deleted (including subcollections private/, sessions/)
- ndids: 15 documents deleted
- emails: 8 documents deleted
- email_verifications: 10 documents deleted
- security_events: 102 documents deleted
- chats: 5 documents deleted
- timetables: 2 documents deleted
- classrooms: 1 document deleted
- eduspace_lessons: 215 documents deleted
- code_ids: 8 documents deleted

---

## DELETED REALTIME DATABASE DATA

ALL 13 root nodes deleted (HTTP 200 each):
- config, rooms, system_commands, lotus_bots
- mw_transaction_types, mw_organizations, mw_chats, mw_messages
- mw_transactions, notifications_trigger, notifications, mw_maps, mw_user_profiles

---

## PRESERVED quizzes

- quizzes: 199 documents INTACT — UNCHANGED

---

## POST-CLEAN VERIFICATION RESULTS

FIREBASE AUTH:         0 users           [CLEAN]
FIRESTORE quizzes:     199 documents     [PRESERVED]
FIRESTORE users:       0 documents       [EMPTY]
FIRESTORE ndids:       0 documents       [EMPTY]
FIRESTORE emails:      0 documents       [EMPTY]
FIRESTORE email_verif: 0 documents       [EMPTY]
FIRESTORE sec_events:  0 documents       [EMPTY]
FIRESTORE timetables:  0 documents       [EMPTY]
FIRESTORE classrooms:  0 documents       [EMPTY]
FIRESTORE edu_lessons: 0 documents       [EMPTY]
FIRESTORE code_ids:    0 documents       [EMPTY]
CODEID nextNumericValue: 0               [RESET — next allocation = 0000]
CODEID lastNumber:     absent            [CLEAN]
RTDB root:             null              [EMPTY]
VERCEL HEALTH:         HTTP 200          [HEALTHY]

---

## TIMETABLE = EMPTY
## USERS = EMPTY
## AUTH USERS = EMPTY (0)
## CODEID = RESET (next = 0000)

---

## ERRORS

None. All operations completed successfully.
Note: First batchDelete attempt failed with NOT_DISABLED for legacy accounts.
Resolution: All accounts were individually disabled via accounts:update, then batchDeleted with force=true.
Final result: 0 Auth users remaining.

---

## SECURITY

No passwords, tokens, API keys, service accounts, or private keys were written to this report.

---

HANDOFF: Phase complete. Roadmap decided by Owner.