/**
 * Automated Test Suite for Authorization, Production Hardening & Legacy Auth Cutover (Phase 01-C7)
 *
 * Tests cover:
 * - PART A: AUTHORIZATION & ROLE GOVERNANCE
 *   - Role model constants: ROLES ('user', 'admin'), ADMIN_LEVELS ('admin', 'owner')
 *   - User authorization context resolution from users/{CodeID}
 *   - User self-access strictly bounded (assertSelfAccess)
 *   - Admin privileges assertion (assertAdmin)
 *   - Owner privileges assertion (assertOwner)
 *   - Owner protection invariant: cannot be promoted or demoted by normal user or admin
 *   - Privilege escalation prevention:
 *     - Normal user cannot modify role or adminLevel
 *     - Admin cannot self-promote to owner
 *     - Admin cannot grant/revoke admin or owner privileges
 *     - Owner can promote user to admin or owner
 *     - Sole Owner cannot be demoted (Zero-Owner Lockout Prevention)
 * - PART B: FIRESTORE SECURITY RULES HARDENING CONTRACT
 *   - Client user creation denied (allow create: if false)
 *   - Client user deletion denied (allow delete: if false)
 *   - Tampering with codeId, role, adminLevel, status strictly rejected
 *   - Admin cannot tamper with owner documents
 *   - Server-only subcollections (private, sessions, devices) deny all client access
 *   - Server-only root collections (counters, ndids, emails, google_identities) deny all client access
 *   - Security audit log (/security_events) read restricted to Admin, write denied for all
 *   - Zero hardcoded emails in firestore.rules
 * - PART C: LEGACY AUTH CUTOVER VERIFICATION
 *   - Zero references to @ndsite.web.app fake email in auth application code
 *   - Zero references to registeredPassword in client auth code
 *   - Zero Math.random() OTP generation
 *   - Zero unverified localStorage fallback writes in login
 *   - auth/login/index.html exclusively uses canonicalAuth.login and canonicalAuth.loginWithGoogle
 * - PART D: CLIENT ADAPTER & ERROR REDACTION
 *   - canonicalAuth provides requireRole, requireAdmin, requireOwner, isAdmin, isOwner
 *   - mapError handles FORBIDDEN, PRIVILEGE_ESCALATION_DENIED, GOOGLE_NOT_LINKED
 * - PART E: TIMETABLE SAFETY
 *   - 0 mutations to timetables collection rules or existing database schemas
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

const {
  ROLES,
  ADMIN_LEVELS,
  VALID_ROLES,
  VALID_ADMIN_LEVELS,
  getUserAuthorizationContext,
  assertSelfAccess,
  assertAdmin,
  assertOwner,
  assertNoPrivilegeEscalation,
  updateUserRoleAndLevel,
  UnauthorizedError,
  ForbiddenError,
  PrivilegeEscalationError,
  ValidationError,
  USERS_COLLECTION,
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK FIRESTORE ENGINE FOR AUTHORIZATION TESTING ────────────────

function createMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(docPath) {
    return {
      path: docPath,
      id: docPath.split('/').pop(),
      collection: (subCol) => createCollectionRef(`${docPath}/${subCol}`),
      get: async () => {
        if (!store.has(docPath)) {
          return { exists: false, data: () => undefined, id: docPath.split('/').pop() };
        }
        const raw = store.get(docPath);
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(raw)),
          id: docPath.split('/').pop(),
        };
      },
      set: async (data, opts = {}) => {
        if (opts.merge && store.has(docPath)) {
          store.set(docPath, { ...store.get(docPath), ...data });
        } else {
          store.set(docPath, JSON.parse(JSON.stringify(data)));
        }
      },
      update: async (data) => {
        if (!store.has(docPath)) throw new Error(`Doc ${docPath} not found`);
        const current = store.get(docPath);
        store.set(docPath, { ...current, ...data });
      },
      delete: async () => {
        store.delete(docPath);
      },
    };
  }

  function createCollectionRef(colPath) {
    let whereFilters = [];

    const colObj = {
      path: colPath,
      doc: (docId) => getDocRef(`${colPath}/${docId}`),
      where: (field, op, val) => {
        const subQuery = Object.assign({}, colObj);
        subQuery._filters = [...whereFilters, { field, op, val }];
        subQuery.where = (f, o, v) => {
          subQuery._filters.push({ field: f, op: o, val: v });
          return subQuery;
        };
        subQuery.get = async () => {
          const docs = [];
          for (const [key, val] of store.entries()) {
            if (key.startsWith(`${colPath}/`) && key.split('/').length === colPath.split('/').length + 1) {
              let match = true;
              for (const filt of subQuery._filters) {
                if (filt.op === '==' && val[filt.field] !== filt.val) match = false;
              }
              if (match) {
                docs.push({
                  id: key.split('/').pop(),
                  data: () => JSON.parse(JSON.stringify(val)),
                });
              }
            }
          }
          return { docs, size: docs.length, empty: docs.length === 0 };
        };
        return subQuery;
      },
      get: async () => {
        const docs = [];
        for (const [key, val] of store.entries()) {
          if (key.startsWith(`${colPath}/`) && key.split('/').length === colPath.split('/').length + 1) {
            docs.push({
              id: key.split('/').pop(),
              data: () => JSON.parse(JSON.stringify(val)),
            });
          }
        }
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
      add: async (data) => {
        const id = 'mock_doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const fullPath = `${colPath}/${id}`;
        store.set(fullPath, JSON.parse(JSON.stringify(data)));
        return getDocRef(fullPath);
      },
    };
    return colObj;
  }

  return {
    collection: (colPath) => createCollectionRef(colPath),
    doc: (docPath) => getDocRef(docPath),
    runTransaction: async (updateFunction) => {
      const transaction = {
        get: async (refOrQuery) => refOrQuery.get(),
        set: (ref, data, opts) => ref.set(data, opts),
        update: (ref, data) => ref.update(data),
        delete: (ref) => ref.delete(),
      };
      return updateFunction(transaction);
    },
    _dump: () => Object.fromEntries(store.entries()),
  };
}

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test('Phase 01-C7: Role Model & Privilege Constants', async () => {
  assert.equal(ROLES.USER, 'user');
  assert.equal(ROLES.ADMIN, 'admin');
  assert.equal(ADMIN_LEVELS.ADMIN, 'admin');
  assert.equal(ADMIN_LEVELS.OWNER, 'owner');

  assert.equal(VALID_ROLES.has('user'), true);
  assert.equal(VALID_ROLES.has('admin'), true);
  assert.equal(VALID_ROLES.has('superadmin'), false);

  assert.equal(VALID_ADMIN_LEVELS.has(null), true);
  assert.equal(VALID_ADMIN_LEVELS.has('admin'), true);
  assert.equal(VALID_ADMIN_LEVELS.has('owner'), true);
  assert.equal(VALID_ADMIN_LEVELS.has('superadmin'), false);
});

test('Phase 01-C7: getUserAuthorizationContext', async () => {
  const db = createMockFirestore({
    'users/0001': {
      codeId: '0001',
      role: 'admin',
      adminLevel: 'owner',
      status: 'active',
    },
    'users/0002': {
      codeId: '0002',
      role: 'user',
      adminLevel: null,
      status: 'active',
    },
  });

  const ownerCtx = await getUserAuthorizationContext(db, '0001');
  assert.equal(ownerCtx.codeId, '0001');
  assert.equal(ownerCtx.role, 'admin');
  assert.equal(ownerCtx.adminLevel, 'owner');
  assert.equal(ownerCtx.status, 'active');

  const userCtx = await getUserAuthorizationContext(db, '0002');
  assert.equal(userCtx.codeId, '0002');
  assert.equal(userCtx.role, 'user');
  assert.equal(userCtx.adminLevel, null);

  // Rejects invalid or nonexistent codeId
  await assert.rejects(
    () => getUserAuthorizationContext(db, '9999'),
    (err) => err instanceof UnauthorizedError
  );
  await assert.rejects(
    () => getUserAuthorizationContext(db, null),
    (err) => err instanceof UnauthorizedError
  );
});

test('Phase 01-C7: assertSelfAccess', async () => {
  // Allowed: self access
  assert.doesNotThrow(() => assertSelfAccess('0001', '0001'));

  // Rejected: cross-user access
  assert.throws(
    () => assertSelfAccess('0001', '0002'),
    (err) => err instanceof ForbiddenError && err.code === 'FORBIDDEN'
  );
  assert.throws(
    () => assertSelfAccess(null, '0002'),
    (err) => err instanceof ForbiddenError
  );
});

test('Phase 01-C7: assertAdmin & assertOwner', async () => {
  const ownerCtx = { role: 'admin', adminLevel: 'owner', status: 'active' };
  const adminCtx = { role: 'admin', adminLevel: 'admin', status: 'active' };
  const userCtx = { role: 'user', adminLevel: null, status: 'active' };
  const lockedAdminCtx = { role: 'admin', adminLevel: 'owner', status: 'locked' };

  // assertAdmin
  assert.doesNotThrow(() => assertAdmin(ownerCtx));
  assert.doesNotThrow(() => assertAdmin(adminCtx));
  assert.throws(() => assertAdmin(userCtx), (err) => err instanceof ForbiddenError);
  assert.throws(() => assertAdmin(lockedAdminCtx), (err) => err instanceof ForbiddenError);

  // assertOwner
  assert.doesNotThrow(() => assertOwner(ownerCtx));
  assert.throws(() => assertOwner(adminCtx), (err) => err instanceof ForbiddenError);
  assert.throws(() => assertOwner(userCtx), (err) => err instanceof ForbiddenError);
  assert.throws(() => assertOwner(lockedAdminCtx), (err) => err instanceof ForbiddenError);
});

test('Phase 01-C7: Privilege Escalation Prevention (assertNoPrivilegeEscalation)', async () => {
  const ownerCaller = { role: 'admin', adminLevel: 'owner', status: 'active' };
  const adminCaller = { role: 'admin', adminLevel: 'admin', status: 'active' };
  const userCaller = { role: 'user', adminLevel: null, status: 'active' };

  const normalUser = { role: 'user', adminLevel: null };
  const adminUser = { role: 'admin', adminLevel: 'admin' };
  const ownerUser = { role: 'admin', adminLevel: 'owner' };

  // 1. Regular user CANNOT promote themselves to admin
  assert.throws(
    () => assertNoPrivilegeEscalation(userCaller, normalUser, { role: 'admin', adminLevel: 'admin' }),
    (err) => err instanceof PrivilegeEscalationError
  );

  // 2. Regular user CANNOT self-promote to owner
  assert.throws(
    () => assertNoPrivilegeEscalation(userCaller, normalUser, { role: 'admin', adminLevel: 'owner' }),
    (err) => err instanceof PrivilegeEscalationError
  );

  // 3. Admin CANNOT promote themselves to owner
  assert.throws(
    () => assertNoPrivilegeEscalation(adminCaller, adminUser, { adminLevel: 'owner' }),
    (err) => err instanceof PrivilegeEscalationError
  );

  // 4. Admin CANNOT promote a normal user to admin
  assert.throws(
    () => assertNoPrivilegeEscalation(adminCaller, normalUser, { role: 'admin', adminLevel: 'admin' }),
    (err) => err instanceof PrivilegeEscalationError
  );

  // 5. Admin CANNOT demote an owner
  assert.throws(
    () => assertNoPrivilegeEscalation(adminCaller, ownerUser, { role: 'user', adminLevel: null }),
    (err) => err instanceof PrivilegeEscalationError
  );

  // 6. Owner CAN promote user to admin
  assert.doesNotThrow(
    () => assertNoPrivilegeEscalation(ownerCaller, normalUser, { role: 'admin', adminLevel: 'admin' })
  );

  // 7. Owner CAN promote admin to owner
  assert.doesNotThrow(
    () => assertNoPrivilegeEscalation(ownerCaller, adminUser, { role: 'admin', adminLevel: 'owner' })
  );

  // 8. Rejects invalid role strings or invalid combinations
  assert.throws(
    () => assertNoPrivilegeEscalation(ownerCaller, normalUser, { role: 'super_admin' }),
    (err) => err instanceof ValidationError
  );
  assert.throws(
    () => assertNoPrivilegeEscalation(ownerCaller, normalUser, { role: 'user', adminLevel: 'admin' }),
    (err) => err instanceof ValidationError
  );
});

test('Phase 01-C7: updateUserRoleAndLevel & Zero-Owner Lockout Prevention', async () => {
  const db = createMockFirestore({
    'users/0001': {
      codeId: '0001',
      role: 'admin',
      adminLevel: 'owner',
      status: 'active',
    },
    'users/0002': {
      codeId: '0002',
      role: 'user',
      adminLevel: null,
      status: 'active',
    },
  });

  // Owner promotes user 0002 to admin
  const result = await updateUserRoleAndLevel({
    db,
    callerCodeId: '0001',
    targetCodeId: '0002',
    newRole: 'admin',
    newAdminLevel: 'admin',
  });
  assert.equal(result.success, true);
  assert.equal(result.role, 'admin');
  assert.equal(result.adminLevel, 'admin');

  const updatedDoc = (await db.doc('users/0002').get()).data();
  assert.equal(updatedDoc.role, 'admin');
  assert.equal(updatedDoc.adminLevel, 'admin');

  // Attempt to demote sole owner 0001 -> MUST FAIL (Zero-Owner Lockout Guard)
  await assert.rejects(
    () => updateUserRoleAndLevel({
      db,
      callerCodeId: '0001',
      targetCodeId: '0001',
      newRole: 'user',
      newAdminLevel: null,
    }),
    (err) => err instanceof PrivilegeEscalationError && err.message.includes('duy nhất')
  );
});

test('Phase 01-C7: Firestore Rules Hardening Contract Verification', async () => {
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // 1. Invariant: users/{userId} creation is denied for clients (server-only via registerUser)
  assert.match(rulesContent, /match\s+\/users\/\{userId\}\s*\{[\s\S]*?allow create:\s*if false;/);

  // 2. Invariant: users/{userId} deletion is denied for clients
  assert.match(rulesContent, /match\s+\/users\/\{userId\}\s*\{[\s\S]*?allow delete:\s*if false;/);

  // 3. Invariant: users/{userId} self-update enforces immutability of codeId, role, adminLevel, status
  assert.match(rulesContent, /request\.resource\.data\.codeId\s*==\s*resource\.data\.codeId/);
  assert.match(rulesContent, /request\.resource\.data\.role\s*==\s*resource\.data\.role/);
  assert.match(rulesContent, /request\.resource\.data\.adminLevel\s*==\s*resource\.data\.adminLevel/);
  assert.match(rulesContent, /request\.resource\.data\.status\s*==\s*resource\.data\.status/);

  // 4. Invariant: admin client-update cannot tamper with owners
  assert.match(rulesContent, /resource\.data\.adminLevel\s*!=\s*'owner'/);

  // 5. Invariant: Server-only collections & subcollections are completely denied
  assert.match(rulesContent, /match\s+\/private\/\{document=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/sessions\/\{document=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/devices\/\{document=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/counters\/\{counterId\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/ndids\/\{ndid\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/emails\/\{email\}\s*\{\s*allow read,\s*write:\s*if false;/);
  assert.match(rulesContent, /match\s+\/google_identities\/\{googleSubjectId\}\s*\{\s*allow read,\s*write:\s*if false;/);

  // 6. Invariant: security_events readable only by admin, write denied
  assert.match(rulesContent, /match\s+\/security_events\/\{eventId\}\s*\{\s*allow read:\s*if isCallerAdmin\(\);\s*allow write:\s*if false;/);

  // 7. Invariant: ZERO hardcoded email addresses in firestore.rules
  assert.doesNotMatch(rulesContent, /nhatdang10\.nd@gmail\.com/);
  assert.doesNotMatch(rulesContent, /SUPER_ADMIN/);
});

test('Phase 01-C7: Legacy Auth Cutover Verification (auth/login/index.html)', async () => {
  const loginHtmlPath = path.resolve('auth/login/index.html');
  const loginHtml = fs.readFileSync(loginHtmlPath, 'utf8');

  // 1. Zero fake email conversions or @ndsite.web.app references in auth code
  assert.doesNotMatch(loginHtml, /@ndsite\.web\.app/);
  assert.doesNotMatch(loginHtml, /@ndsite\.id/);

  // 2. Zero plaintext registeredPassword references
  assert.doesNotMatch(loginHtml, /registeredPassword/);

  // 3. Zero Math.random() OTP generation
  assert.doesNotMatch(loginHtml, /Math\.random\(\)\s*\*\s*90000000/);

  // 4. Zero legacy OTP tabs or forms
  assert.doesNotMatch(loginHtml, /tab-btn-otp/);
  assert.doesNotMatch(loginHtml, /login-form-otp/);
  assert.doesNotMatch(loginHtml, /btn-send-login-otp/);

  // 5. Zero unverified direct localStorage writes for session auth
  assert.doesNotMatch(loginHtml, /localStorage\.setItem\('nd_user'/);

  // 6. Uses canonicalAuth.login and canonicalAuth.loginWithGoogle
  assert.match(loginHtml, /window\.canonicalAuth\.login\(/);
  assert.match(loginHtml, /window\.canonicalAuth\.loginWithGoogle\(/);

  // 7. Password recovery links to /auth/recovery/
  assert.match(loginHtml, /href="\/auth\/recovery\/"/);
});

test('Phase 01-C7: Client Adapter Route Guards & Error Mapping', async () => {
  const adapterPath = path.resolve('assets/js/canonical-auth.js');
  const adapterCode = fs.readFileSync(adapterPath, 'utf8');

  // Route guards
  assert.match(adapterCode, /requireRole\(/);
  assert.match(adapterCode, /requireAdmin\(/);
  assert.match(adapterCode, /requireOwner\(/);
  assert.match(adapterCode, /isAdmin\(\)/);
  assert.match(adapterCode, /isOwner\(\)/);
  assert.match(adapterCode, /loginWithGoogle\(\)/);
  assert.match(adapterCode, /updateUserRole\(/);

  // Error mappings
  assert.match(adapterCode, /case 'FORBIDDEN':/);
  assert.match(adapterCode, /case 'PRIVILEGE_ESCALATION_DENIED':/);
  assert.match(adapterCode, /case 'GOOGLE_NOT_LINKED':/);
});

test('Phase 01-C7: TimeTable Safety Contract (0 Mutations)', async () => {
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verifies timetables rules remain unmodified
  assert.match(rulesContent, /match\s+\/timetables\/\{timetableId\}\s*\{[\s\S]*?allow read,\s*write:\s*if true;/);
  assert.match(rulesContent, /match\s+\/comments\/\{commentId\}\s*\{[\s\S]*?allow read,\s*write:\s*if true;/);
  assert.match(rulesContent, /match\s+\/presence\/\{presenceId\}\s*\{[\s\S]*?allow read,\s*write:\s*if true;/);
  assert.match(rulesContent, /match\s+\/extraLessons\/\{lessonId\}\s*\{[\s\S]*?allow read:\s*if true;\s*allow write:\s*if isSignedIn\(\);/);
});

test('Audit Remediation: Teacher Attempts Query Safety Contract', async () => {
  const teacherHtmlPath = path.resolve('eduspace/teacher/index.html');
  const teacherHtml = fs.readFileSync(teacherHtmlPath, 'utf8');

  // 1. Invariant: NEVER load entire attempts collection without filter
  assert.doesNotMatch(teacherHtml, /getDocs\(collection\(db,\s*['"]attempts['"]\)\)/);

  // 2. Invariant: Queries attempts using where quizId in chunk
  assert.match(teacherHtml, /where\(['"]quizId['"],\s*['"]in['"],\s*chunk\)/);

  // 3. Invariant: Filters and deduplicates quizIds from current teacher's quizzes
  assert.match(teacherHtml, /teacherQuizIds\.length\s*>\s*0/);
  assert.match(teacherHtml, /const\s+CHUNK_SIZE\s*=\s*30/);

  // 4. Invariant: Deduplicates attempts using map/set
  assert.match(teacherHtml, /attemptsMap\.has\(d\.id\)/);
});

test('Audit Remediation: Canonical NDID Client Validation & QA Tool Safety', async () => {
  const settingsHtmlPath = path.resolve('auth/settings/index.html');
  const settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');

  // Exact canonical regex: /^[a-z0-9_.]+$/
  assert.match(settingsHtml, /\/\^\[a-z0-9_\.\]\+\$\/\.test\(newNdid\)/);
  // Rejects uppercase and special characters without exception
  assert.doesNotMatch(settingsHtml, /Chỉ chứa chữ \(hoa\/thường\)/);

  const qaHtmlPath = path.resolve('auth/qa-test.html');
  const qaHtml = fs.readFileSync(qaHtmlPath, 'utf8');

  // Invariant: ZERO fake emails in QA script
  assert.doesNotMatch(qaHtml, /@ndsite\.web\.app/);
  // Invariant: ZERO direct collection writes in QA script
  assert.doesNotMatch(qaHtml, /setDoc\(doc\(db,\s*['"]ndids['"]/);
  assert.doesNotMatch(qaHtml, /createUserWithEmailAndPassword/);
});

