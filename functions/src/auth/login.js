/**
 * Canonical Login Service (Phase 01-C2)
 * 
 * Authenticates users via either NDID or Email.
 * Flow:
 * 1. Identifier determination (Email vs NDID) and normalization.
 * 2. Lookup CodeID via private server mappings (ndids/ or emails/).
 * 3. Constant-time dummy verification if identifier is not found (anti-enumeration).
 * 4. Load users/{CodeID} and users/{CodeID}/private/security.
 * 5. Lifecycle status verification (active, pending, disabled, banned, locked).
 * 6. Cryptographic password verification with bcrypt-v1.
 * 7. Atomic failed login attempt tracking with automatic lockout at 5 failures.
 * 8. Success: reset failed attempts, update lastLoginAt, mint Firebase Custom Token (UID === CodeID).
 * 9. Log audit events in security_events.
 */

'use strict';

const admin = require('firebase-admin');
const { verifyPassword, dummyVerifyPassword } = require('./password');
const { resolveIdentifierToCodeId } = require('./identity');
const { getCanonicalUserFoundation, USERS_COLLECTION } = require('../database/users');
const {
  getPrivateSecurityDoc,
  handleFailedLoginAttempt,
  resetFailedLoginAttempts,
  MAX_FAILED_ATTEMPTS,
} = require('../database/security');
const { recordSecurityEvent } = require('./security_events');
const {
  InvalidCredentialsError,
  AccountLockedError,
  AccountDisabledError,
  AccountBannedError,
  AccountPendingError,
} = require('./errors');

/**
 * Authenticates a user with NDID or Email and issues a Firebase Custom Token.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} params.auth
 * @param {string} params.identifier - Raw NDID or email
 * @param {string} params.password - Plaintext password
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, customToken: string, user: Object }>}
 */
async function loginUser({
  db,
  auth,
  identifier,
  password,
  ip = null,
  userAgent = null,
}) {
  // 1. Basic input validation
  if (!identifier || typeof identifier !== 'string' || !identifier.trim() ||
      !password || typeof password !== 'string') {
    await dummyVerifyPassword(password);
    throw new InvalidCredentialsError();
  }

  // 2. Resolve Identifier to CodeID
  const resolved = await resolveIdentifierToCodeId(db, identifier.trim());
  if (!resolved) {
    // Constant-time dummy comparison to defeat timing-based enumeration
    await dummyVerifyPassword(password);
    await recordSecurityEvent(db, {
      eventType: 'login_failed',
      actorCodeID: null,
      targetCodeID: null,
      ip,
      userAgent,
      details: { reason: 'identifier_not_found' },
    });
    throw new InvalidCredentialsError();
  }

  const { codeId, type: identifierType } = resolved;

  // 3. Load user foundation document & private security document
  const [userProfile, securityData] = await Promise.all([
    getCanonicalUserFoundation(db, codeId),
    getPrivateSecurityDoc(db, codeId),
  ]);

  if (!userProfile || !securityData || !securityData.passwordHash) {
    await dummyVerifyPassword(password);
    await recordSecurityEvent(db, {
      eventType: 'login_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: { reason: 'missing_user_or_security_record' },
    });
    throw new InvalidCredentialsError();
  }

  // 4. Check account status in users/{CodeID}
  switch (userProfile.status) {
    case 'locked':
      throw new AccountLockedError();
    case 'disabled':
      throw new AccountDisabledError();
    case 'banned':
      throw new AccountBannedError();
    case 'pending':
      throw new AccountPendingError();
    case 'active':
      break;
    default:
      throw new InvalidCredentialsError();
  }

  // 5. Check lockout in private/security
  const failedAttempts = typeof securityData.failedLoginAttempts === 'number' ? securityData.failedLoginAttempts : 0;
  if (failedAttempts >= MAX_FAILED_ATTEMPTS || securityData.lockedAt) {
    throw new AccountLockedError();
  }

  // 6. Verify password
  const isMatch = await verifyPassword(password, securityData.passwordHash);

  if (!isMatch) {
    // Increment failed attempts atomically
    const { newCount, isLocked } = await handleFailedLoginAttempt(db, codeId);

    await recordSecurityEvent(db, {
      eventType: isLocked ? 'account_locked' : 'login_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        reason: 'invalid_password',
        failedAttempts: newCount,
        locked: isLocked,
      },
    });

    if (isLocked) {
      throw new AccountLockedError();
    }
    throw new InvalidCredentialsError();
  }

  // 7. Successful Authentication
  // Reset failed attempts & update lastLoginAt
  await resetFailedLoginAttempts(db, codeId);

  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.collection(USERS_COLLECTION).doc(codeId).update({
    lastLoginAt: now,
  });

  // 8. Mint Custom Token (UID === CodeID)
  const customClaims = {
    role: userProfile.role || 'user',
    adminLevel: userProfile.adminLevel || null,
  };
  const customToken = await auth.createCustomToken(codeId, customClaims);

  // 9. Log success audit event
  await recordSecurityEvent(db, {
    eventType: 'login_success',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      identifierType,
    },
  });

  return {
    success: true,
    codeId,
    customToken,
    user: {
      codeId: userProfile.codeId,
      ndid: userProfile.ndid,
      displayName: userProfile.displayName || userProfile.name,
      name: userProfile.name,
      email: userProfile.email || null,
      photoURL: userProfile.photoURL || null,
      role: userProfile.role || 'user',
      adminLevel: userProfile.adminLevel || null,
      status: 'active',
    },
  };
}

module.exports = {
  loginUser,
};
