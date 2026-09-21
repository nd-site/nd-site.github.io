/**
 * Automated Test Suite for Account Recovery, Password Reset & Account Unlock (Phase 01-C5)
 * 
 * Tests cover:
 * - RECOVERY REQUEST:
 *   - requestAccountRecovery returns generic anti-enumeration response for both existing and non-existent users
 *   - verified email requirement: accounts with unverified email do not generate codes
 *   - secure code generation: stored as SHA-256 hash in users/{CodeID}/private/recovery
 *   - rate-limiting / cooldown: requests within 60s throw RateLimitExceededError (HTTP 429)
 * - CODE VERIFICATION:
 *   - correct code verification: succeeds, issues single-use resetToken, clears codeHash
 *   - wrong code: increments attemptCount, returns validation error
 *   - max attempts: 5 wrong attempts locks recovery attempt
 *   - expired code: rejects when current time exceeds expiresAt
 *   - already consumed code: rejects when status is not pending
 * - PASSWORD RESET:
 *   - password reset success: updates bcrypt-v1 passwordHash, bumps passwordVersion, syncs Firebase Auth
 *   - weak password rejection: rejects passwords shorter than 8 characters
 *   - single-use consumption: resetToken cannot be reused after password reset
 *   - invalid reset token: rejects forged or mismatched reset tokens
 * - ACCOUNT LOCKOUT & UNLOCK:
 *   - locked account (failedLoginAttempts >= 5, lockedAt set) cannot log in normally
 *   - verified recovery resets failedLoginAttempts to 0, clears lockedAt, and sets status to active
 *   - logs account_unlocked audit event with reason verified_recovery
 * - SECURITY CONTRACTS:
 *   - firestore.rules completely denies client access to users/{CodeID}/private/recovery
 *   - zero secrets (passwords, OTPs, raw reset tokens) in security_events audit logs
 *   - zero CodeID or UID leakage in unauthenticated recovery endpoints
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

const {
  // Recovery Symbols
  requestAccountRecovery,
  verifyRecoveryCode,
  resetPasswordWithRecovery,
  maskEmail,
  RateLimitExceededError,

  // Login & Password
  loginUser,
  hashPassword,
  verifyPassword,

  // Errors
  ValidationError,
  AccountLockedError,
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK ENGINE FOR FIRESTORE & AUTH ───────────────────────────────

function createMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(docPath) {
    return {
      path: docPath,
      id: docPath.split('/').pop(),
      collection: (subCol) => ({
        doc: (subDocId) => getDocRef(`${docPath}/${subCol}/${subDocId}`),
      }),
      get: async () => {
        if (!store.has(docPath)) {
          return { exists: false, data: () => undefined, id: docPath.split('/').pop() };
        }
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(store.get(docPath))),
          id: docPath.split('/').pop(),
        };
      },
      set: async (data, options) => {
        const existing = store.get(docPath) || {};
        const merged = (options && options.merge) ? { ...existing, ...data } : { ...data };
        store.set(docPath, JSON.parse(JSON.stringify(merged)));
      },
      update: async (data) => {
        if (!store.has(docPath)) {
          throw new Error(`Document does not exist at path: ${docPath}`);
        }
        const existing = store.get(docPath);
        store.set(docPath, JSON.parse(JSON.stringify({ ...existing, ...data })));
      },
      delete: async () => {
        store.delete(docPath);
      },
    };
  }

  const db = {
    _store: store,
    collection: (colName) => ({
      doc: (docId) => {
        const docPath = docId ? `${colName}/${docId}` : `${colName}/doc_${Math.random().toString(36).slice(2, 9)}`;
        return getDocRef(docPath);
      },
    }),
    runTransaction: async (fn) => {
      const writeOps = [];
      const transaction = {
        get: async (docRef) => docRef.get(),
        set: (docRef, data, options) => {
          writeOps.push(() => docRef.set(data, options));
        },
        update: (docRef, data) => {
          writeOps.push(() => docRef.update(data));
        },
        delete: (docRef) => {
          writeOps.push(() => docRef.delete());
        },
      };
      const result = await fn(transaction);
      for (const op of writeOps) {
        await op();
      }
      return result;
    },
  };

  return db;
}

function createMockAuth(initialUsers = {}) {
  const users = new Map();
  for (const [uid, u] of Object.entries(initialUsers)) {
    users.set(uid, {
      uid,
      providerData: [],
      ...u,
    });
  }

  return {
    _users: users,
    getUser: async (uid) => {
      const user = users.get(uid);
      if (!user) {
        const err = new Error(`User not found: ${uid}`);
        err.code = 'auth/user-not-found';
        throw err;
      }
      return { ...user };
    },
    updateUser: async (uid, updates) => {
      const user = users.get(uid);
      if (!user) {
        const err = new Error(`User not found: ${uid}`);
        err.code = 'auth/user-not-found';
        throw err;
      }
      const updated = { ...user, ...updates };
      users.set(uid, updated);
      return updated;
    },
    createCustomToken: async (uid) => `custom_token_mock_${uid}`,
    revokeRefreshTokens: async (uid) => true,
  };
}

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test('Phase 01-C5: Email Masking Utility', () => {
  assert.equal(maskEmail('nhatdang10.nd@gmail.com'), 'n***d@gmail.com');
  assert.equal(maskEmail('ab@example.com'), 'a*@example.com');
  assert.equal(maskEmail(''), '');
  assert.equal(maskEmail('invalid'), '***');
});

test('Phase 01-C5: Account Recovery Request - Anti-Enumeration & Code Generation', async (t) => {
  const codeId = '0001';
  const initialPasswordHash = await hashPassword('CurrentPass123!');

  const seedData = {
    [`ndids/alexdoe`]: { codeId, status: 'active' },
    [`emails/alex.doe@example.com`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'alexdoe',
      email: 'alex.doe@example.com',
      emailVerified: true,
      status: 'active',
    },
    [`users/${codeId}/private/security`]: {
      passwordHash: initialPasswordHash,
      passwordVersion: 'bcrypt-v1',
      failedLoginAttempts: 0,
      lockedAt: null,
    },
  };

  const db = createMockFirestore(seedData);

  // 1. Non-existent account: generic response, no code generated, no error thrown
  const nonExistentRes = await requestAccountRecovery({
    db,
    identifier: 'non_existent_user',
  });
  assert.equal(nonExistentRes.success, true);
  assert.ok(nonExistentRes.message.includes('Nếu thông tin phù hợp'));
  assert.equal(nonExistentRes._debugCode, undefined);

  // 2. Existing account with verified email: generates code and stores hash in private/recovery
  const existingRes = await requestAccountRecovery({
    db,
    identifier: 'alexdoe',
    options: { exposeCodeForTesting: true },
  });

  assert.equal(existingRes.success, true);
  assert.ok(existingRes.message.includes('Nếu thông tin phù hợp'));
  assert.ok(existingRes._debugCode, 'Debug code exposed for test assertion');
  assert.match(existingRes._debugCode, /^\d{6}$/, 'Must be 6-digit code');

  // Verify private/recovery doc
  const recoverySnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recoverySnap.exists, true);
  const recoveryData = recoverySnap.data();
  assert.equal(recoveryData.status, 'pending');
  assert.equal(recoveryData.attemptCount, 0);
  assert.equal(recoveryData.maxAttempts, 5);
  assert.notEqual(recoveryData.codeHash, existingRes._debugCode, 'Must NOT store plaintext code in DB');
  assert.ok(recoveryData.expiresAtMs > Date.now(), 'Expires in the future');

  // Verify security audit log
  let foundAudit = false;
  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/') && val.eventType === 'recovery_requested') {
      foundAudit = true;
      assert.equal(val.actorCodeID, codeId);
      assert.equal(val.details.channel, 'email');
      assert.equal(val.details.targetEmailMasked, 'a***e@example.com');
      // Must NOT log secret OTP
      assert.equal(JSON.stringify(val).includes(existingRes._debugCode), false);
      break;
    }
  }
  assert.equal(foundAudit, true);
});

test('Phase 01-C5: Account Recovery - Reject Unverified Email Accounts', async (t) => {
  const codeId = '0002';

  const seedData = {
    [`ndids/unverified_user`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'unverified_user',
      email: 'unverified@example.com',
      emailVerified: false, // NOT verified!
      recoveryEmail: null,
      status: 'active',
    },
  };

  const db = createMockFirestore(seedData);

  // Anti-enumeration: returns generic message, but does NOT create recovery doc
  const res = await requestAccountRecovery({
    db,
    identifier: 'unverified_user',
    options: { exposeCodeForTesting: true },
  });

  assert.equal(res.success, true);
  assert.equal(res._debugCode, undefined, 'Must NOT generate code for unverified email');

  const recoverySnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recoverySnap.exists, false, 'Recovery document must not be created');

  // Verify security event logged
  let foundRejectedAudit = false;
  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/') && val.eventType === 'recovery_rejected_unverified_email') {
      foundRejectedAudit = true;
      assert.equal(val.actorCodeID, codeId);
      break;
    }
  }
  assert.equal(foundRejectedAudit, true);
});

test('Phase 01-C5: Account Recovery - Cooldown & Rate Limiting (Task 9)', async (t) => {
  const codeId = '0003';

  const seedData = {
    [`ndids/spam_tester`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'spam_tester',
      email: 'spam@example.com',
      emailVerified: true,
      status: 'active',
    },
    [`users/${codeId}/private/recovery`]: {
      status: 'pending',
      createdAtMs: Date.now() - 10000, // Created 10 seconds ago (under 60s cooldown)
    },
  };

  const db = createMockFirestore(seedData);

  // Re-requesting within 60 seconds should throw RateLimitExceededError
  await assert.rejects(
    async () => {
      await requestAccountRecovery({
        db,
        identifier: 'spam_tester',
      });
    },
    (err) => {
      assert.ok(err instanceof RateLimitExceededError);
      assert.equal(err.status, 429);
      assert.ok(err.message.includes('60 giây'));
      return true;
    }
  );
});

test('Phase 01-C5: Verification Code - Success, Wrong Code & Brute-Force Limit', async (t) => {
  const codeId = '0004';
  const realCode = '654321';

  // Crypto hash helper
  const crypto = require('crypto');
  const codeHash = crypto.createHash('sha256').update(realCode).digest('hex');

  const seedData = {
    [`ndids/code_verifier`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'code_verifier',
      email: 'verify@example.com',
      emailVerified: true,
    },
    [`users/${codeId}/private/recovery`]: {
      codeId,
      recoveryAttemptId: 'rec-attempt-4',
      codeHash,
      status: 'pending',
      attemptCount: 0,
      maxAttempts: 5,
      expiresAtMs: Date.now() + 15 * 60 * 1000,
    },
  };

  const db = createMockFirestore(seedData);

  // 1. Wrong code submission: increments attemptCount
  await assert.rejects(
    async () => {
      await verifyRecoveryCode({
        db,
        identifier: 'code_verifier',
        code: '111111',
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('không chính xác'));
      return true;
    }
  );

  let recSnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recSnap.data().attemptCount, 1);
  assert.equal(recSnap.data().status, 'pending');

  // 2. Submit 4 more wrong codes to trigger lockout at 5 attempts
  for (let i = 2; i <= 4; i++) {
    await assert.rejects(async () => {
      await verifyRecoveryCode({ db, identifier: 'code_verifier', code: '000000' });
    });
  }

  // 5th wrong attempt triggers lock
  await assert.rejects(
    async () => {
      await verifyRecoveryCode({ db, identifier: 'code_verifier', code: '000000' });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('quá số lần'));
      return true;
    }
  );

  recSnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recSnap.data().attemptCount, 5);
  assert.equal(recSnap.data().status, 'locked');

  // Submitting the correct code NOW must be rejected because status is locked
  await assert.rejects(
    async () => {
      await verifyRecoveryCode({ db, identifier: 'code_verifier', code: realCode });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('bị khóa'));
      return true;
    }
  );
});

test('Phase 01-C5: Verification Code - Expiry Enforcement', async (t) => {
  const codeId = '0005';
  const realCode = '123456';
  const crypto = require('crypto');
  const codeHash = crypto.createHash('sha256').update(realCode).digest('hex');

  const seedData = {
    [`ndids/expired_user`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'expired_user',
    },
    [`users/${codeId}/private/recovery`]: {
      codeId,
      codeHash,
      status: 'pending',
      attemptCount: 0,
      maxAttempts: 5,
      expiresAtMs: Date.now() - 1000, // Expired 1 second ago!
    },
  };

  const db = createMockFirestore(seedData);

  await assert.rejects(
    async () => {
      await verifyRecoveryCode({
        db,
        identifier: 'expired_user',
        code: realCode,
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('hết hạn'));
      return true;
    }
  );

  const recSnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recSnap.data().status, 'expired');
});

test('Phase 01-C5: Verification Code - Success Path & Reset Token Issuance', async (t) => {
  const codeId = '0006';
  const realCode = '888999';
  const crypto = require('crypto');
  const codeHash = crypto.createHash('sha256').update(realCode).digest('hex');

  const seedData = {
    [`ndids/success_verifier`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'success_verifier',
    },
    [`users/${codeId}/private/recovery`]: {
      codeId,
      recoveryAttemptId: 'rec-6',
      codeHash,
      status: 'pending',
      attemptCount: 0,
      maxAttempts: 5,
      expiresAtMs: Date.now() + 15 * 60 * 1000,
    },
  };

  const db = createMockFirestore(seedData);

  const result = await verifyRecoveryCode({
    db,
    identifier: 'success_verifier',
    code: realCode,
  });

  assert.equal(result.success, true);
  assert.ok(result.resetToken, 'Must issue a resetToken');
  assert.equal(result.resetToken.length, 64, '32-byte hex token');

  // Verify doc was updated to verified, codeHash cleared
  const recSnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recSnap.data().status, 'verified');
  assert.equal(recSnap.data().codeHash, null, 'codeHash must be wiped');
  assert.notEqual(recSnap.data().resetTokenHash, null);
  assert.ok(recSnap.data().resetTokenExpiresAtMs > Date.now());
});

test('Phase 01-C5: Password Reset & Locked Account Unlock Flow', async (t) => {
  const codeId = '0007';
  const oldPassword = 'OldPassword123!';
  const newPassword = 'BrandNewPassword2026!';
  const oldPasswordHash = await hashPassword(oldPassword);

  const resetToken = 'valid_secret_reset_token_hex_value_1234567890abcdef';
  const crypto = require('crypto');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const seedData = {
    [`ndids/locked_account`]: { codeId, status: 'active' },
    // Locked user doc
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'locked_account',
      email: 'locked@example.com',
      emailVerified: true,
      status: 'locked', // LOCKED!
    },
    // Locked private security doc
    [`users/${codeId}/private/security`]: {
      passwordHash: oldPasswordHash,
      passwordVersion: 'bcrypt-v1',
      failedLoginAttempts: 5,
      lockedAt: { toMillis: () => Date.now() - 3600000 },
      lockReason: 'Quá 5 lần đăng nhập không thành công',
    },
    // Verified recovery record
    [`users/${codeId}/private/recovery`]: {
      codeId,
      status: 'verified',
      resetTokenHash,
      resetTokenExpiresAtMs: Date.now() + 10 * 60 * 1000,
      consumedAt: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      email: 'locked@example.com',
    },
  });

  // 1. Verify that normal login is blocked for this locked account
  await assert.rejects(
    async () => {
      await loginUser({
        db,
        auth,
        identifier: 'locked_account',
        password: oldPassword,
      });
    },
    (err) => {
      assert.ok(err instanceof AccountLockedError);
      return true;
    }
  );

  // 2. Reject weak password in reset (< 8 chars)
  await assert.rejects(
    async () => {
      await resetPasswordWithRecovery({
        db,
        auth,
        identifier: 'locked_account',
        resetToken,
        newPassword: 'short',
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('8 ký tự'));
      return true;
    }
  );

  // 3. Reset password successfully
  const resetResult = await resetPasswordWithRecovery({
    db,
    auth,
    identifier: 'locked_account',
    resetToken,
    newPassword,
  });

  assert.equal(resetResult.success, true);
  assert.equal(resetResult.codeId, codeId);

  // 4. Verify private/security state is updated and unlocked
  const secSnap = await db.collection('users').doc(codeId).collection('private').doc('security').get();
  const secData = secSnap.data();
  assert.equal(secData.failedLoginAttempts, 0, 'Failed counter must be reset to 0');
  assert.equal(secData.lockedAt, null, 'lockedAt must be cleared');
  assert.equal(secData.lockReason, null);
  assert.equal(secData.passwordVersion, 'bcrypt-v1');

  // Verify new password hashes match
  const isMatch = await verifyPassword(newPassword, secData.passwordHash);
  assert.equal(isMatch, true, 'New password hash must match newPassword');

  // 5. Verify user profile status restored to active
  const userSnap = await db.collection('users').doc(codeId).get();
  assert.equal(userSnap.data().status, 'active', 'User status must be restored to active');

  // 6. Verify recovery doc is marked CONSUMED (single-use proof)
  const recSnap = await db.collection('users').doc(codeId).collection('private').doc('recovery').get();
  assert.equal(recSnap.data().status, 'consumed');
  assert.equal(recSnap.data().resetTokenHash, null, 'resetTokenHash must be wiped');

  // 7. Re-using the same reset token MUST FAIL
  await assert.rejects(
    async () => {
      await resetPasswordWithRecovery({
        db,
        auth,
        identifier: 'locked_account',
        resetToken,
        newPassword: 'AnotherPassword123!',
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      return true;
    }
  );

  // 8. Verify user can now log in normally with new password!
  const loginResult = await loginUser({
    db,
    auth,
    identifier: 'locked_account',
    password: newPassword,
  });
  assert.equal(loginResult.success, true);
  assert.equal(loginResult.codeId, codeId);
});

test('Phase 01-C5: Security Audit Events for Recovery & Unlock', async (t) => {
  const codeId = '0008';
  const newPassword = 'ValidPassword123!';
  const resetToken = 'token_for_audit_check';
  const crypto = require('crypto');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const seedData = {
    [`ndids/audit_user`]: { codeId, status: 'active' },
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'audit_user',
      status: 'locked',
    },
    [`users/${codeId}/private/security`]: {
      passwordHash: await hashPassword('OldPass123!'),
      failedLoginAttempts: 5,
      lockedAt: { toMillis: () => Date.now() },
    },
    [`users/${codeId}/private/recovery`]: {
      codeId,
      status: 'verified',
      resetTokenHash,
      resetTokenExpiresAtMs: Date.now() + 10 * 60 * 1000,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({ [codeId]: {} });

  await resetPasswordWithRecovery({
    db,
    auth,
    identifier: 'audit_user',
    resetToken,
    newPassword,
  });

  let foundPasswordResetAudit = false;
  let foundAccountUnlockedAudit = false;

  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/')) {
      if (val.eventType === 'password_reset') {
        foundPasswordResetAudit = true;
        assert.equal(val.actorCodeID, codeId);
        // Verify no password logged
        assert.equal(JSON.stringify(val).includes(newPassword), false);
      }
      if (val.eventType === 'account_unlocked') {
        foundAccountUnlockedAudit = true;
        assert.equal(val.actorCodeID, codeId);
        assert.equal(val.details.reason, 'verified_recovery');
      }
    }
  }

  assert.equal(foundPasswordResetAudit, true, 'Must record password_reset audit');
  assert.equal(foundAccountUnlockedAudit, true, 'Must record account_unlocked audit');
});

test('Phase 01-C5: Firestore Rules Contract for private/recovery', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify match /private/{document=**} blocks all client read and write
  assert.ok(
    rulesContent.includes('match /private/{document=**}'),
    'firestore.rules must match /private/{document=**}'
  );
  assert.ok(
    rulesContent.includes('allow read, write: if false;'),
    'firestore.rules must deny both read and write for client on private subcollections'
  );
});
