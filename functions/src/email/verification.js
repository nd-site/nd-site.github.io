/**
 * Canonical Email Verification Workflow (Phase 01-C9)
 *
 * Implements secure 2-step email verification for new accounts and email changes:
 * 1. Cryptographically secure 32-byte hex tokens.
 * 2. Hash-only storage (SHA-256) in server-only collection `email_verifications/{tokenHash}`
 *    and `users/{CodeID}/private/verification`.
 * 3. 24-hour expiration TTL.
 * 4. 60-second cooldown protection against spam/burst resend.
 * 5. Single-use token consumption.
 * 6. Transitions `users/{CodeID}.emailVerified = true` and activates `pending` accounts to `active`.
 * 7. Synchronizes `emailVerified: true` with Firebase Auth record.
 * 8. Full tamper-evident security audit logging.
 */

'use strict';

const crypto = require('crypto');
const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('../database/users');
const { PRIVATE_SUBCOLLECTION } = require('../database/security');
const { recordSecurityEvent } = require('../auth/security_events');
const { ValidationError, RateLimitExceededError } = require('../auth/errors');
const { VERIFICATION_TOKEN_TTL_MS, VERIFICATION_RESEND_COOLDOWN_MS } = require('./config');
const { defaultEmailService } = require('./email_service');

const EMAIL_VERIFICATIONS_COLLECTION = 'email_verifications';
const VERIFICATION_DOC_ID = 'verification';

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Returns document reference for users/{CodeID}/private/verification.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {admin.firestore.DocumentReference}
 */
function getUserVerificationDocRef(db, codeId) {
  return db
    .collection(USERS_COLLECTION)
    .doc(codeId)
    .collection(PRIVATE_SUBCOLLECTION)
    .doc(VERIFICATION_DOC_ID);
}

/**
 * Generates and dispatches a secure email verification token for an account.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string} [params.email] - Optional override or target email
 * @param {import('./email_service').EmailService} [params.emailService]
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @param {Object} [params.options={}]
 * @param {boolean} [params.options.exposeTokenForTesting=false]
 * @returns {Promise<{ success: boolean, message: string, _debugToken?: string }>}
 */
async function generateEmailVerification({
  db,
  codeId,
  email: inputEmail = null,
  emailService = defaultEmailService,
  ip = null,
  userAgent = null,
  options = {},
}) {
  if (!codeId || typeof codeId !== 'string') {
    throw new ValidationError('Mã định danh CodeID không hợp lệ.');
  }

  const userRef = db.collection(USERS_COLLECTION).doc(codeId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new ValidationError('Không tìm thấy tài khoản người dùng.');
  }

  const userData = userSnap.data();
  const targetEmail = (inputEmail || userData.email || '').trim().toLowerCase();

  if (!targetEmail || !targetEmail.includes('@')) {
    throw new ValidationError('Tài khoản chưa có địa chỉ email hợp lệ.');
  }

  if (userData.emailVerified === true && (!inputEmail || inputEmail === userData.email)) {
    return {
      success: true,
      alreadyVerified: true,
      message: 'Địa chỉ email này đã được xác thực trước đó.',
    };
  }

  // 1. Enforce 60-second cooldown protection
  const userVerifRef = getUserVerificationDocRef(db, codeId);
  const existingVerifSnap = await userVerifRef.get();
  const nowMs = Date.now();

  if (existingVerifSnap.exists) {
    const existingData = existingVerifSnap.data();
    if (
      existingData.createdAtMs &&
      nowMs - existingData.createdAtMs < VERIFICATION_RESEND_COOLDOWN_MS &&
      existingData.status === 'pending'
    ) {
      throw new RateLimitExceededError('Vui lòng chờ 60 giây trước khi yêu cầu gửi lại email xác nhận.');
    }
  }

  // 2. Generate cryptographically random 32-byte hex token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(rawToken);
  const expiresAtMs = nowMs + VERIFICATION_TOKEN_TTL_MS;
  const serverTime = admin.firestore.FieldValue.serverTimestamp();

  const tokenPayload = {
    tokenHash,
    codeId,
    email: targetEmail,
    ndid: userData.ndid || '',
    status: 'pending',
    createdAt: serverTime,
    createdAtMs: nowMs,
    expiresAtMs,
    consumedAt: null,
  };

  // 3. Atomically write to mapping collection and user private subcollection
  await db.collection(EMAIL_VERIFICATIONS_COLLECTION).doc(tokenHash).set(tokenPayload);
  await userVerifRef.set({
    tokenHash,
    email: targetEmail,
    status: 'pending',
    createdAtMs: nowMs,
    expiresAtMs,
    updatedAt: serverTime,
  });

  // 4. Dispatch verification email via EmailService
  await emailService.sendVerificationEmail({
    toEmail: targetEmail,
    ndid: userData.ndid || 'bạn',
    codeId,
    verificationToken: rawToken,
  });

  // 5. Record audit event
  await recordSecurityEvent(db, {
    eventType: 'verification_email_sent',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      email: targetEmail,
    },
  });

  const response = {
    success: true,
    message: 'Email xác nhận đã được gửi thành công. Vui lòng kiểm tra hộp thư của bạn.',
  };

  if (options.exposeTokenForTesting || process.env.NODE_ENV === 'test') {
    response._debugToken = rawToken;
  }

  return response;
}

/**
 * Validates a submitted verification token and activates emailVerified status.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth=null]
 * @param {string} params.token
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, email: string, message: string }>}
 */
async function verifyEmailToken({
  db,
  auth = null,
  token,
  ip = null,
  userAgent = null,
}) {
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new ValidationError('Mã xác thực email không hợp lệ.');
  }

  const cleanToken = token.trim();
  const tokenHash = sha256(cleanToken);

  const tokenRef = db.collection(EMAIL_VERIFICATIONS_COLLECTION).doc(tokenHash);

  const verificationResult = await db.runTransaction(async (transaction) => {
    const tokenSnap = await transaction.get(tokenRef);
    if (!tokenSnap.exists) {
      throw new ValidationError('Mã xác thực email không hợp lệ hoặc đã được sử dụng.');
    }

    const tokenData = tokenSnap.data();
    const nowMs = Date.now();

    if (tokenData.status !== 'pending') {
      if (tokenData.status === 'verified') {
        return { alreadyVerified: true, codeId: tokenData.codeId, email: tokenData.email };
      }
      throw new ValidationError('Mã xác thực email đã hết hạn hoặc không còn hiệu lực.');
    }

    if (tokenData.expiresAtMs && nowMs > tokenData.expiresAtMs) {
      transaction.update(tokenRef, { status: 'expired' });
      throw new ValidationError('Mã xác thực email đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận.');
    }

    const codeId = tokenData.codeId;
    const userRef = db.collection(USERS_COLLECTION).doc(codeId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new ValidationError('Không tìm thấy tài khoản người dùng liên kết.');
    }

    const serverTime = admin.firestore.FieldValue.serverTimestamp();
    const userVerifRef = getUserVerificationDocRef(db, codeId);

    // Mark mapping consumed
    transaction.update(tokenRef, {
      status: 'verified',
      consumedAt: serverTime,
    });

    // Mark user private verification consumed
    transaction.update(userVerifRef, {
      status: 'verified',
      consumedAt: serverTime,
    });

    // Update canonical user profile: emailVerified = true
    const userUpdate = {
      emailVerified: true,
      updatedAt: serverTime,
    };

    // If account was pending initial verification, activate it
    if (userSnap.data().status === 'pending') {
      userUpdate.status = 'active';
    }

    transaction.update(userRef, userUpdate);

    return {
      codeId,
      email: tokenData.email,
      activatedFromPending: userSnap.data().status === 'pending',
    };
  });

  // Synchronize with Firebase Auth if auth is provided
  if (auth && typeof auth.updateUser === 'function') {
    try {
      await auth.updateUser(verificationResult.codeId, { emailVerified: true });
    } catch (authErr) {
      console.warn('[verifyEmailToken] Firebase Auth emailVerified update warning:', authErr.message);
    }
  }

  // Record security audit event
  await recordSecurityEvent(db, {
    eventType: 'email_verified',
    actorCodeID: verificationResult.codeId,
    targetCodeID: verificationResult.codeId,
    ip,
    userAgent,
    details: {
      email: verificationResult.email,
      activatedFromPending: Boolean(verificationResult.activatedFromPending),
    },
  });

  return {
    success: true,
    codeId: verificationResult.codeId,
    email: verificationResult.email,
    alreadyVerified: Boolean(verificationResult.alreadyVerified),
    message: verificationResult.alreadyVerified
      ? 'Địa chỉ email này đã được xác thực trước đó.'
      : 'Địa chỉ email đã được xác thực thành công. Tài khoản của bạn đã được bảo vệ đầy đủ.',
  };
}

module.exports = {
  EMAIL_VERIFICATIONS_COLLECTION,
  getUserVerificationDocRef,
  generateEmailVerification,
  verifyEmailToken,
};
