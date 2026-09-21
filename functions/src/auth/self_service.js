/**
 * Canonical Self-Service Auth Operations (Phase 01-C3)
 * 
 * Implements authenticated self-service operations:
 * 1. changePassword:
 *    - Verifies current password against stored bcrypt hash.
 *    - Validates and hashes new password with bcrypt-v1.
 *    - Updates users/{CodeID}/private/security.
 *    - Logs security audit event.
 * 2. changeNdid:
 *    - Validates new NDID syntax (/^[a-zA-Z0-9_.]+$/).
 *    - Ensures new NDID is available.
 *    - In transaction: reserves new NDID, sets 30-day cooldown reservation on old NDID.
 *    - Updates users/{CodeID}.ndid while preserving CodeID.
 *    - Logs security audit event.
 *    - Invariant: Zero business relationships (TimeTable, Chat, Comments) are touched.
 */

'use strict';

const admin = require('firebase-admin');
const { validatePassword, hashPassword, verifyPassword, getPasswordVersion } = require('./password');
const { validateNDID, normalizeNDID } = require('./validation');
const { NDIDS_COLLECTION } = require('./identity');
const { USERS_COLLECTION } = require('../database/users');
const { getSecurityDocRef } = require('../database/security');
const { recordSecurityEvent } = require('./security_events');
const {
  ValidationError,
  InvalidCredentialsError,
  IdentifierUnavailableError,
} = require('./errors');

const NDID_COOLDOWN_DAYS = 30;

/**
 * Changes password for an authenticated user.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth=null]
 * @param {string} params.codeId
 * @param {string} params.currentPassword
 * @param {string} params.newPassword
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, message: string }>}
 */
async function changePassword({
  db,
  auth = null,
  codeId,
  currentPassword,
  newPassword,
  ip = null,
  userAgent = null,
  options = {},
}) {
  if (!codeId || typeof codeId !== 'string') {
    throw new InvalidCredentialsError('Yêu cầu phiên đăng nhập hợp lệ.');
  }

  // Validate new password rules (min 8, max 128, no silent trimming)
  validatePassword(newPassword);

  if (currentPassword === newPassword) {
    throw new ValidationError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
  }

  const secRef = getSecurityDocRef(db, codeId);
  const secSnap = await secRef.get();

  if (!secSnap.exists) {
    throw new InvalidCredentialsError('Không tìm thấy thông tin bảo mật của tài khoản.');
  }

  const secData = secSnap.data();
  const isMatch = await verifyPassword(currentPassword, secData.passwordHash);

  if (!isMatch) {
    await recordSecurityEvent(db, {
      eventType: 'password_change_failed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: { reason: 'wrong_current_password' },
    });
    throw new InvalidCredentialsError('Mật khẩu hiện tại không chính xác.');
  }

  // Hash new password
  const newHash = await hashPassword(newPassword);
  const serverTime = admin.firestore.FieldValue.serverTimestamp();

  await secRef.update({
    passwordHash: newHash,
    passwordVersion: getPasswordVersion(),
    lastPasswordChangedAt: serverTime,
    failedLoginAttempts: 0,
    updatedAt: serverTime,
  });

  // Keep Firebase Auth in sync if auth instance is provided
  if (auth && typeof auth.updateUser === 'function') {
    try {
      await auth.updateUser(codeId, { password: newPassword });
    } catch (authErr) {
      console.warn('Firebase Auth updateUser failed during changePassword:', authErr.message);
    }
  }

  // Invalidate refresh tokens and revoke other active sessions (Phase 01-C6 Task 8)
  if (auth && typeof auth.revokeRefreshTokens === 'function') {
    try {
      await auth.revokeRefreshTokens(codeId);
    } catch (_) {}
  }
  try {
    const { revokeOtherSessions } = require('../database/sessions');
    await revokeOtherSessions(db, codeId, null, 'password_changed');
  } catch (_) {}

  // Log successful password change
  await recordSecurityEvent(db, {
    eventType: 'password_changed',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
  });

  // Security notification email (Phase 01-C10-FINAL)
  try {
    const userSnap = await db.collection(USERS_COLLECTION).doc(codeId).get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      if (userData.email) {
        const { defaultEmailService } = require('../email/email_service');
        const emailSvc = options.emailService || defaultEmailService;
        const nowFormatted = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        await emailSvc.sendPasswordChangedEmail({
          toEmail: userData.email,
          ndid: userData.ndid || 'bạn',
          codeId,
          eventTime: nowFormatted,
          ipMasked: ip,
          device: userAgent ? (userAgent.length > 50 ? userAgent.slice(0, 50) + '...' : userAgent) : 'Không xác định',
        });
      }
    }
  } catch (secEmailErr) {
    console.warn('[changePassword] Security notification email warning:', secEmailErr.message);
  }

  return {
    success: true,
    codeId,
    message: 'Đổi mật khẩu thành công.',
  };
}

/**
 * Changes NDID for an authenticated user with 30-day reservation cooldown on old handle.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string} params.newNdid
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, oldNdid: string, newNdid: string, cooldownDays: number, noOp?: boolean }>}
 */
async function changeNdid({
  db,
  codeId,
  newNdid,
  ip = null,
  userAgent = null,
}) {
  if (!codeId || typeof codeId !== 'string') {
    throw new InvalidCredentialsError('Yêu cầu phiên đăng nhập hợp lệ.');
  }

  const rawNewNdid = validateNDID(newNdid);
  const normalizedNewNdid = normalizeNDID(rawNewNdid);

  return db.runTransaction(async (transaction) => {
    const userRef = db.collection(USERS_COLLECTION).doc(codeId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new InvalidCredentialsError('Không tìm thấy tài khoản người dùng.');
    }

    const userData = userSnap.data();
    const currentNdid = userData.ndid;
    const normalizedCurrentNdid = currentNdid ? normalizeNDID(currentNdid) : null;

    if (normalizedCurrentNdid === normalizedNewNdid) {
      return {
        success: true,
        codeId,
        oldNdid: currentNdid,
        newNdid: rawNewNdid,
        noOp: true,
        cooldownDays: NDID_COOLDOWN_DAYS,
      };
    }

    // Check availability of new NDID
    const newNdidRef = db.collection(NDIDS_COLLECTION).doc(normalizedNewNdid);
    const newNdidSnap = await transaction.get(newNdidRef);

    if (newNdidSnap.exists) {
      const data = newNdidSnap.data();
      const isReservedForThisUser = (data.status === 'reserved' || data.active === false) &&
        (data.previousOwnerCodeID === codeId || data.reservedBy === codeId);

      let isExpired = false;
      const expireField = data.reservationExpiresAt || data.reservedUntil;
      if (expireField) {
        const expireDate = expireField.toDate ? expireField.toDate() : new Date(expireField);
        if (!isNaN(expireDate.getTime()) && expireDate < new Date()) {
          isExpired = true;
        }
      }

      const isActive = data.status === 'active' || data.active === true;
      if (isActive && data.codeId !== codeId) {
        throw new IdentifierUnavailableError('NDID này đã có người sử dụng hoặc đang trong thời gian bảo lưu.');
      }
      if (!isActive && !isReservedForThisUser && !isExpired) {
        throw new IdentifierUnavailableError('NDID này đã có người sử dụng hoặc đang trong thời gian bảo lưu.');
      }
    }

    const serverTime = admin.firestore.FieldValue.serverTimestamp();
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() + NDID_COOLDOWN_DAYS);

    // 1. Reserve new NDID for user
    transaction.set(newNdidRef, {
      codeId,
      reservedBy: codeId,
      status: 'active',
      active: true,
      createdAt: serverTime,
      updatedAt: serverTime,
    });

    // 2. Cooldown reservation on old NDID (30 days)
    if (normalizedCurrentNdid) {
      const oldNdidRef = db.collection(NDIDS_COLLECTION).doc(normalizedCurrentNdid);

      transaction.set(oldNdidRef, {
        codeId: null,
        reservedBy: codeId,
        previousOwnerCodeID: codeId,
        status: 'reserved',
        active: false,
        releasedAt: serverTime,
        reservationExpiresAt: admin.firestore.Timestamp ? admin.firestore.Timestamp.fromDate(cooldownDate) : cooldownDate.toISOString(),
        reservedUntil: cooldownDate.toISOString(),
        updatedAt: serverTime,
      });
    }

    // 3. Update users/{CodeID}.ndid (preserve raw casing)
    transaction.update(userRef, {
      ndid: rawNewNdid,
      updatedAt: serverTime,
    });

    // 4. Log security audit event
    await recordSecurityEvent(db, {
      eventType: 'ndid_changed',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        oldNdid: normalizedCurrentNdid,
        newNdid: normalizedNewNdid,
        cooldownDays: NDID_COOLDOWN_DAYS,
      },
      transaction,
    });

    return {
      success: true,
      codeId,
      oldNdid: currentNdid,
      newNdid: rawNewNdid,
      cooldownDays: NDID_COOLDOWN_DAYS,
    };
  });
}

module.exports = {
  NDID_COOLDOWN_DAYS,
  changePassword,
  changeNdid,
};
