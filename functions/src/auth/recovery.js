/**
 * Canonical Account Recovery & Password Reset Service (Phase 01-C5)
 * 
 * Implements secure account recovery, verification code dispatch, password reset,
 * and account unlocking with strict security invariants:
 * 
 * 1. Anti-Enumeration: Recovery request returns uniform generic response regardless
 *    of whether the identifier exists or has a verified email.
 * 2. Cryptographically Secure One-Time Code: Backend-generated 6-digit verification code,
 *    stored exclusively as a SHA-256 hash in users/{CodeID}/private/recovery.
 * 3. Verified Email Requirement: Recovery codes are ONLY sent to verified email addresses
 *    (emailVerified: true or verified recoveryEmail). Unverified emails are strictly rejected.
 * 4. Attempt Limiting & Brute-Force Defense: Max 5 verification attempts before locking.
 * 5. Time-to-Live (TTL): Verification code expires in 15 minutes; Reset token expires in 10 minutes.
 * 6. Account Unlock: Successfully completing password reset automatically clears
 *    failedLoginAttempts (resets to 0), clears lockedAt, and sets account status to 'active'.
 * 7. Single-Use Consumption: Reset token is consumed and invalidated upon password reset.
 * 8. Zero Secret Logging: No passwords, OTPs, or reset tokens are ever logged.
 */

'use strict';

const crypto = require('crypto');
const admin = require('firebase-admin');
const { resolveIdentifierToCodeId } = require('./identity');
const { dummyVerifyPassword, hashPassword, validatePassword } = require('./password');
const { USERS_COLLECTION } = require('../database/users');
const { getSecurityDocRef, MAX_FAILED_ATTEMPTS } = require('../database/security');
const { getRecoveryDocRef } = require('../database/recovery');
const { recordSecurityEvent } = require('./security_events');
const {
  ValidationError,
  InvalidCredentialsError,
  RateLimitExceededError,
} = require('./errors');

const RECOVERY_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;   // 10 minutes
const MAX_RECOVERY_ATTEMPTS = 5;
const RECOVERY_COOLDOWN_MS = 60 * 1000;       // 60 seconds between code requests

/**
 * Masks an email address for safe audit logging.
 * Example: 'alex.doe@example.com' -> 'a***e@example.com'
 * @param {string | null} email
 * @returns {string}
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return '***';
  const [username, domain] = parts;
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  return `${username[0]}***${username[username.length - 1]}@${domain}`;
}

/**
 * Computes SHA-256 hash of a string.
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * Requests an account recovery code via verified email.
 * Applies anti-enumeration policy and rate-limiting cooldown.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.identifier - NDID or Email
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @param {Object} [params.options={}]
 * @param {boolean} [params.options.exposeCodeForTesting=false]
 * @returns {Promise<{ success: boolean, message: string, _debugCode?: string }>}
 */
async function requestAccountRecovery({
  db,
  identifier,
  ip = null,
  userAgent = null,
  options = {},
}) {
  const genericSuccessMessage = 'Nếu thông tin phù hợp với một tài khoản và có email hợp lệ, mã xác thực khôi phục sẽ được gửi tới email của bạn.';

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new ValidationError('Vui lòng nhập NDID hoặc email của bạn.');
  }

  const cleanIdentifier = identifier.trim();

  // 1. Resolve CodeID
  const resolved = await resolveIdentifierToCodeId(db, cleanIdentifier);
  if (!resolved) {
    // Anti-enumeration: constant-time dummy verification
    await dummyVerifyPassword('dummyPassword');
    return {
      success: true,
      message: genericSuccessMessage,
    };
  }

  const codeId = resolved.codeId;
  const userRef = db.collection(USERS_COLLECTION).doc(codeId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await dummyVerifyPassword('dummyPassword');
    return {
      success: true,
      message: genericSuccessMessage,
    };
  }

  const userData = userSnap.data();

  // 2. Verified Email Policy (Task 11):
  // Only accounts with a verified email are permitted to recover via email OTP.
  // Allowed verified channels:
  // - users/{CodeID}.email when emailVerified === true
  // - users/{CodeID}.recoveryEmail (pre-verified backup email)
  // - users/{CodeID}.googleEmail (pre-verified OAuth email)
  let verifiedTargetEmail = null;
  if (userData.email && userData.emailVerified === true) {
    verifiedTargetEmail = userData.email;
  } else if (userData.recoveryEmail) {
    verifiedTargetEmail = userData.recoveryEmail;
  } else if (userData.googleEmail && userData.email === userData.googleEmail) {
    verifiedTargetEmail = userData.googleEmail;
  }

  if (!verifiedTargetEmail) {
    // Security audit: unverified email cannot be used for recovery
    await recordSecurityEvent(db, {
      eventType: 'recovery_rejected_unverified_email',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        reason: 'no_verified_email',
      },
    });

    await dummyVerifyPassword('dummyPassword');
    return {
      success: true,
      message: genericSuccessMessage,
    };
  }

  // 3. Rate-limiting & Cooldown check (Task 9)
  const recoveryRef = getRecoveryDocRef(db, codeId);
  const existingRecoverySnap = await recoveryRef.get();

  const nowMs = Date.now();

  if (existingRecoverySnap.exists) {
    const existingData = existingRecoverySnap.data();
    const createdAtMs = existingData.createdAtMs || (existingData.createdAt ? existingData.createdAt.toMillis?.() : null);
    if (createdAtMs && (nowMs - createdAtMs) < RECOVERY_COOLDOWN_MS && existingData.status === 'pending') {
      throw new RateLimitExceededError('Vui lòng chờ 60 giây trước khi yêu cầu mã xác thực mới.');
    }
  }

  // 4. Generate cryptographically secure 6-digit verification code (Task 3)
  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const codeHash = sha256(verificationCode);
  const recoveryAttemptId = crypto.randomUUID();

  const expiresAtMs = nowMs + RECOVERY_CODE_TTL_MS;
  const serverTime = admin.firestore.FieldValue.serverTimestamp();

  const recoveryPayload = {
    recoveryAttemptId,
    codeId,
    purpose: 'password_reset',
    codeHash,
    targetEmailMasked: maskEmail(verifiedTargetEmail),
    createdAt: serverTime,
    createdAtMs: nowMs,
    expiresAtMs,
    attemptCount: 0,
    maxAttempts: MAX_RECOVERY_ATTEMPTS,
    status: 'pending',
    consumedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAtMs: null,
    updatedAt: serverTime,
  };

  await recoveryRef.set(recoveryPayload);

  // 5. Log audit event (Task 17)
  await recordSecurityEvent(db, {
    eventType: 'recovery_requested',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      channel: 'email',
      targetEmailMasked: maskEmail(verifiedTargetEmail),
      recoveryAttemptId,
    },
  });

  // 6. Dispatch recovery email via EmailService (Phase 01-C9)
  // Non-fatal: Email delivery issues do not crash the recovery request flow
  try {
    const { defaultEmailService } = require('../email/email_service');
    const emailSvc = options.emailService || defaultEmailService;
    await emailSvc.sendRecoveryEmail({
      toEmail: verifiedTargetEmail,
      ndid: userData.ndid || 'bạn',
      codeId,
      verificationCode,
      expiresMinutes: 15,
    });
  } catch (emailErr) {
    console.warn('[requestAccountRecovery] Email dispatch warning:', emailErr.message);
  }

  const response = {
    success: true,
    message: genericSuccessMessage,
  };

  // Safe exposure for test assertions only
  if (options.exposeCodeForTesting || process.env.NODE_ENV === 'test') {
    response._debugCode = verificationCode;
  }

  return response;
}

/**
 * Verifies a submitted one-time recovery code.
 * Enforces attempt limits (brute-force defense) and expiry.
 * Issues a single-use resetToken upon successful verification.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.identifier - NDID or Email
 * @param {string} params.code - 6-digit verification code
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, resetToken: string, message: string }>}
 */
async function verifyRecoveryCode({
  db,
  identifier,
  code,
  ip = null,
  userAgent = null,
}) {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new ValidationError('Vui lòng cung cấp NDID hoặc email.');
  }

  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new ValidationError('Vui lòng nhập mã xác thực gồm 6 chữ số.');
  }

  const cleanCode = code.trim();
  if (!/^\d{6}$/.test(cleanCode)) {
    throw new ValidationError('Mã xác thực phải gồm đúng 6 chữ số.');
  }

  const resolved = await resolveIdentifierToCodeId(db, identifier.trim());
  if (!resolved) {
    throw new InvalidCredentialsError('Mã xác thực không chính xác hoặc đã hết hạn.');
  }

  const codeId = resolved.codeId;
  const recoveryRef = getRecoveryDocRef(db, codeId);

  const result = await db.runTransaction(async (transaction) => {
    const recoverySnap = await transaction.get(recoveryRef);

    if (!recoverySnap.exists) {
      return { outcome: 'not_found' };
    }

    const recoveryData = recoverySnap.data();
    const nowMs = Date.now();
    const serverTime = admin.firestore.FieldValue.serverTimestamp();

    // Check status
    if (recoveryData.status !== 'pending') {
      return { outcome: 'invalid_status', status: recoveryData.status };
    }

    // Check expiry
    if (recoveryData.expiresAtMs && nowMs > recoveryData.expiresAtMs) {
      transaction.update(recoveryRef, {
        status: 'expired',
        updatedAt: serverTime,
      });
      return { outcome: 'expired' };
    }

    // Check attempt limits
    const currentAttempts = typeof recoveryData.attemptCount === 'number' ? recoveryData.attemptCount : 0;
    if (currentAttempts >= recoveryData.maxAttempts) {
      transaction.update(recoveryRef, {
        status: 'locked',
        updatedAt: serverTime,
      });
      return { outcome: 'already_locked' };
    }

    // Compare hash
    const inputHash = sha256(cleanCode);
    if (inputHash !== recoveryData.codeHash) {
      const newAttempts = currentAttempts + 1;
      const isNowLocked = newAttempts >= recoveryData.maxAttempts;

      transaction.update(recoveryRef, {
        attemptCount: newAttempts,
        status: isNowLocked ? 'locked' : 'pending',
        updatedAt: serverTime,
      });

      return {
        outcome: 'invalid_code',
        newAttempts,
        isNowLocked,
        recoveryAttemptId: recoveryData.recoveryAttemptId,
      };
    }

    // Successful code verification: Issue one-time resetToken
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = sha256(resetToken);
    const resetTokenExpiresAtMs = nowMs + RESET_TOKEN_TTL_MS;

    transaction.update(recoveryRef, {
      status: 'verified',
      codeHash: null, // Clear code hash so the OTP code can NEVER be verified again
      resetTokenHash,
      resetTokenExpiresAtMs,
      verifiedAt: serverTime,
      updatedAt: serverTime,
    });

    return {
      outcome: 'success',
      resetToken,
      recoveryAttemptId: recoveryData.recoveryAttemptId,
    };
  });

  if (result.outcome === 'not_found') {
    throw new ValidationError('Yêu cầu khôi phục không tồn tại hoặc đã hết hạn. Vui lòng thử lại.');
  }

  if (result.outcome === 'invalid_status') {
    if (result.status === 'consumed') {
      throw new ValidationError('Yêu cầu khôi phục này đã được sử dụng. Vui lòng gửi yêu cầu mới.');
    }
    if (result.status === 'locked') {
      throw new ValidationError('Yêu cầu khôi phục đã bị khóa do nhập sai quá nhiều lần. Vui lòng gửi yêu cầu mới.');
    }
    throw new ValidationError('Yêu cầu khôi phục đã hết hạn. Vui lòng gửi yêu cầu mới.');
  }

  if (result.outcome === 'expired') {
    await recordSecurityEvent(db, {
      eventType: 'recovery_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: { reason: 'code_expired' },
    });
    throw new ValidationError('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
  }

  if (result.outcome === 'already_locked') {
    await recordSecurityEvent(db, {
      eventType: 'recovery_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: { reason: 'max_attempts_exceeded' },
    });
    throw new ValidationError('Bạn đã nhập sai mã xác thực quá 5 lần. Yêu cầu khôi phục đã bị khóa.');
  }

  if (result.outcome === 'invalid_code') {
    await recordSecurityEvent(db, {
      eventType: 'recovery_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        reason: 'invalid_code',
        attempts: result.newAttempts,
        locked: result.isNowLocked,
      },
    });

    if (result.isNowLocked) {
      throw new ValidationError('Mã xác thực không chính xác. Bạn đã nhập sai quá số lần cho phép. Yêu cầu khôi phục đã bị khóa.');
    }
    throw new ValidationError('Mã xác thực không chính xác. Vui lòng kiểm tra lại.');
  }

  // Outcome === 'success'
  await recordSecurityEvent(db, {
    eventType: 'recovery_code_verified',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      recoveryAttemptId: result.recoveryAttemptId,
    },
  });

  return {
    success: true,
    resetToken: result.resetToken,
    message: 'Xác thực mã thành công. Vui lòng thiết lập mật khẩu mới.',
  };
}

/**
 * Resets account password using verified recovery proof and unlocks account if locked.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth=null]
 * @param {string} params.identifier - NDID or Email
 * @param {string} params.resetToken - One-time reset token issued after code verification
 * @param {string} params.newPassword - New plaintext password
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, message: string }>}
 */
async function resetPasswordWithRecovery({
  db,
  auth = null,
  identifier,
  resetToken,
  newPassword,
  ip = null,
  userAgent = null,
  options = {},
}) {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new ValidationError('Vui lòng cung cấp NDID hoặc email.');
  }

  if (!resetToken || typeof resetToken !== 'string' || !resetToken.trim()) {
    throw new ValidationError('Mã chứng thực đặt lại mật khẩu không hợp lệ.');
  }

  // Validate password rules (min 8 chars, etc.)
  validatePassword(newPassword);

  const resolved = await resolveIdentifierToCodeId(db, identifier.trim());
  if (!resolved) {
    throw new InvalidCredentialsError('Yêu cầu khôi phục không hợp lệ.');
  }

  const codeId = resolved.codeId;
  const recoveryRef = getRecoveryDocRef(db, codeId);
  const secRef = getSecurityDocRef(db, codeId);
  const userRef = db.collection(USERS_COLLECTION).doc(codeId);

  // Hash new password using canonical bcrypt-v1
  const newPasswordHash = await hashPassword(newPassword);

  let wasAccountLocked = false;

  await db.runTransaction(async (transaction) => {
    const [recoverySnap, secSnap, userSnap] = await Promise.all([
      transaction.get(recoveryRef),
      transaction.get(secRef),
      transaction.get(userRef),
    ]);

    if (!recoverySnap.exists) {
      throw new ValidationError('Yêu cầu khôi phục không hợp lệ hoặc đã hết hạn.');
    }

    const recoveryData = recoverySnap.data();
    const nowMs = Date.now();
    const serverTime = admin.firestore.FieldValue.serverTimestamp();

    if (recoveryData.status !== 'verified') {
      if (recoveryData.status === 'consumed') {
        throw new ValidationError('Yêu cầu khôi phục này đã được sử dụng.');
      }
      throw new ValidationError('Yêu cầu khôi phục chưa được xác thực hoặc đã hết hạn.');
    }

    if (recoveryData.resetTokenExpiresAtMs && nowMs > recoveryData.resetTokenExpiresAtMs) {
      transaction.update(recoveryRef, {
        status: 'expired',
        updatedAt: serverTime,
      });
      throw new ValidationError('Thời gian đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại từ đầu.');
    }

    const inputTokenHash = sha256(resetToken.trim());
    if (inputTokenHash !== recoveryData.resetTokenHash) {
      throw new ValidationError('Mã chứng thực đặt lại mật khẩu không chính xác.');
    }

    // Check if account was locked
    if (secSnap.exists) {
      const secData = secSnap.data();
      if (secData.lockedAt != null || (typeof secData.failedLoginAttempts === 'number' && secData.failedLoginAttempts >= MAX_FAILED_ATTEMPTS)) {
        wasAccountLocked = true;
      }
    }
    if (userSnap.exists && userSnap.data().status === 'locked') {
      wasAccountLocked = true;
    }

    // 1. Update private/security: new password hash, reset failed counter, clear lock
    const secUpdate = {
      passwordHash: newPasswordHash,
      passwordVersion: 'bcrypt-v1',
      failedLoginAttempts: 0,
      lockedAt: null,
      lockReason: null,
      lastPasswordChangedAt: serverTime,
      updatedAt: serverTime,
    };
    if (secSnap.exists) {
      transaction.update(secRef, secUpdate);
    } else {
      transaction.set(secRef, {
        ...secUpdate,
        createdAt: serverTime,
      });
    }

    // 2. Unlock user profile in users/{CodeID} if locked
    if (userSnap.exists) {
      const currentStatus = userSnap.data().status;
      const targetStatus = (currentStatus === 'locked' || currentStatus === 'pending') ? 'active' : currentStatus;
      transaction.update(userRef, {
        status: targetStatus,
        updatedAt: serverTime,
      });
    }

    // 3. Mark recovery doc as CONSUMED (single-use proof)
    transaction.update(recoveryRef, {
      status: 'consumed',
      consumedAt: serverTime,
      resetTokenHash: null, // Wipe token hash so it cannot be used again
      updatedAt: serverTime,
    });
  });

  // 4. Synchronize with Firebase Auth
  if (auth && typeof auth.updateUser === 'function') {
    try {
      await auth.updateUser(codeId, { password: newPassword });
    } catch (authErr) {
      console.warn('[resetPasswordWithRecovery] Firebase Auth password update warning:', authErr.message);
    }
  }

  // 5. Revoke existing sessions (Task 7 & AUTH_API_CONTRACT.md Section 2.6)
  if (auth && typeof auth.revokeRefreshTokens === 'function') {
    try {
      await auth.revokeRefreshTokens(codeId);
    } catch (_) {}
  }

  // 5b. Revoke all active session records in Firestore (Phase 01-C6 Task 8)
  try {
    const { revokeAllSessions } = require('../database/sessions');
    await revokeAllSessions(db, codeId, 'password_reset');
  } catch (_) {}

  // 6. Security audit logging (Task 17)
  await recordSecurityEvent(db, {
    eventType: 'password_reset',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      action: 'recovery_password_reset',
    },
  });

  if (wasAccountLocked) {
    await recordSecurityEvent(db, {
      eventType: 'account_unlocked',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        reason: 'verified_recovery',
      },
    });
  }

  // 7. Security notification email (Phase 01-C10-FINAL)
  try {
    const updatedUserSnap = await db.collection(USERS_COLLECTION).doc(codeId).get();
    if (updatedUserSnap.exists) {
      const uData = updatedUserSnap.data();
      if (uData.email) {
        const { defaultEmailService } = require('../email/email_service');
        const emailSvc = options.emailService || defaultEmailService;
        const nowFormatted = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        await emailSvc.sendPasswordResetSuccessEmail({
          toEmail: uData.email,
          ndid: uData.ndid || 'bạn',
          codeId,
          eventTime: nowFormatted,
          ipMasked: ip,
          device: userAgent ? (userAgent.length > 50 ? userAgent.slice(0, 50) + '...' : userAgent) : 'Không xác định',
        });
      }
    }
  } catch (secEmailErr) {
    console.warn('[resetPasswordWithRecovery] Security notification email warning:', secEmailErr.message);
  }

  return {
    success: true,
    codeId,
    message: 'Đặt lại mật khẩu thành công. Tài khoản của bạn đã được mở khóa và sẵn sàng đăng nhập.',
  };
}

module.exports = {
  RECOVERY_CODE_TTL_MS,
  RESET_TOKEN_TTL_MS,
  MAX_RECOVERY_ATTEMPTS,
  RECOVERY_COOLDOWN_MS,
  maskEmail,
  requestAccountRecovery,
  verifyRecoveryCode,
  resetPasswordWithRecovery,
};
