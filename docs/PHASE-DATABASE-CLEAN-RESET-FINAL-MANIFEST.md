# PHASE DATABASE CLEAN RESET - FINAL SAFETY MANIFEST

**Project ID:** ndlabs-0
**Generated At:** 2026-09-06T13:16:50+07:00
**Status:** READY FOR OWNER-APPROVED DESTRUCTIVE RESET

---

## 1. DATA CLASSIFICATION (KEEP VS DELETE)

- quizzes/* : KEEP (199 documents - EduSpace quiz data preserved)
- users/* : DELETE (14 documents, including private and sessions subcollections)
- ndids/* : DELETE (14 documents)
- emails/* : DELETE (7 documents)
- email_verifications/* : DELETE (9 documents)
- security_events/* : DELETE (61 documents)
- chats/* : DELETE (5 documents)
- timetables/* : DELETE (2 documents)
- classrooms/* : DELETE (1 documents)
- eduspace_lessons/* : DELETE (215 documents)
- code_ids/* : DELETE (8 documents)
- counters/code_ids : RESET to nextNumericValue=0
- Firebase Auth Users : DELETE (12 users)
- Realtime Database : DELETE ALL (13 root keys: config, rooms, system_commands, lotus_bots, notifications, notifications_trigger, mw_chats, mw_maps, mw_messages, mw_organizations, mw_transactions, mw_transaction_types, mw_user_profiles)

---

## 2. FIREBASE AUTH USERS TO BE DELETED (12 USERS)

1. 0006 (vtest_1788672204971@example.com)
2. 0007 (e2e_1788672330888@ndlabs.dev)
3. 0008 (v2_1788672365409@example.com)
4. 0009 (u_1788672396818@example.com)
5. 0010 (v_final_1788673278334@example.com)
6. 0013 (diag_1788674735966@ndlabs.dev)
7. 0014 (user_1788675119@ndlabs.dev)
8. 6cXk6a9Pj3fK3bgsLuLkLgausPH3 (chauchau_tc@ndsite.web.app)
9. AR8b4fcqY9afIOJ7ZvUBKk1yGTi1 (nhatdang10.nd@gmail.com)
10. HqPqx9xcx4ejlYOvAzjU10Vo0VP2 (nhatdang10@ndsite.web.app)
11. UkvNFl0XFHhEJtcYXRsSNR1QQU43 (bkhuyen160503@gmail.com)
12. uZtDX3Wgp9VIYCrcQ8R2NCYPH052 (nhatdang@ndsite.web.app)

---

## 3. REALTIME DATABASE ROOTS TO BE DELETED (13 ROOTS)

- config
- rooms
- system_commands
- lotus_bots
- notifications
- notifications_trigger
- mw_chats
- mw_maps
- mw_messages
- mw_organizations
- mw_transactions
- mw_transaction_types
- mw_user_profiles

---

## 4. CODEID COUNTER RESET TARGET
- Path: counters/code_ids
- Prior: nextNumericValue=15, lastNumber=5
- Target: nextNumericValue=0, lastNumber removed
- Next CodeID allocation will be: 0000