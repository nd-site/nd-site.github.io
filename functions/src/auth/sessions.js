/**
 * Canonical Session Management & Trusted Device Business Logic (Phase 01-C6)
 * 
 * Implements:
 * 1. Active session registration and tracking.
 * 2. Session revocation (current session, specific session, all other sessions).
 * 3. Interaction with account lock and password reset (fail-closed, revoke on lock).
 * 4. Trusted device registration with hashed fingerprints.
 * 5. Safe security activity audit aggregation without credential leakage.
 */

'use strict';

const crypto = require('crypto');
const admin = require('firebase-admin');
const { isValidCodeId } = require('../codeid/format');
const { getCanonicalUserFoundation } = require('../database/users');
const {
  createSession,
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
} = require('../database/sessions');
const {
  registerTrustedDeviceDoc,
  getTrustedDeviceDoc,
  getTrustedDevices,
  revokeTrustedDeviceDoc,
} = require('../database/devices');
const { recordSecurityEvent, SECURITY_EVENTS_COLLECTION } = require('./security_events');
const { parseUserAgent, sanitizeIp, formatRelativeTimeVi } = require('./device_parser');
const { ValidationError, AccountLockedError, InvalidCredentialsError } = require('./errors');

/**
 * Generates a cryptographically secure random session ID.
 * @returns {string}
 */
function generateSessionId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

/**
 * Generates a cryptographically secure device ID if not provided.
 * @returns {string}
 */
function generateDeviceId() {
  return `dev_${crypto.randomBytes(12).toString('hex')}`;
}

/**
 * Hashes a device fingerprint string with SHA-256.
 * @param {string} fingerprint
 * @returns {string}
 */
function hashFingerprint(fingerprint) {
  return crypto.createHash('sha256').update(String(fingerprint).trim()).digest('hex');
}

/**
 * Registers an active session for an authenticated user.
 * Enforces account lock check: if user is locked, rejects and revokes active sessions.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId - Canonical CodeID
 * @param {string} [params.sessionId] - Optional client session ID or server generated
 * @param {string | null} [params.deviceId=null]
 * @param {string | null} [params.deviceLabel=null]
 * @param {string | null} [params.userAgent=null]
 * @param {string | null} [params.ip=null]
 * @returns {Promise<{ success: boolean, session: Object }>}
 */
async function registerSession({
  db,
  codeId,
  sessionId = null,
  deviceId = null,
  deviceLabel = null,
  userAgent = null,
  ip = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  // 1. Check account lifecycle status (Task 9)
  const userProfile = await getCanonicalUserFoundation(db, codeId);
  if (!userProfile) {
    throw new InvalidCredentialsError('Không tìm thấy thông tin tài khoản.');
  }

  if (userProfile.status === 'locked') {
    // Revoke any existing active sessions immediately
    await revokeAllSessions(db, codeId, 'account_locked');
    throw new AccountLockedError('Tài khoản đã bị tạm khóa do nhập sai mật khẩu quá nhiều lần.');
  }

  if (userProfile.status === 'disabled' || userProfile.status === 'banned') {
    await revokeAllSessions(db, codeId, `account_${userProfile.status}`);
    throw new ValidationError('Tài khoản đã bị vô hiệu hóa hoặc bị cấm.');
  }

  // 2. Parse User-Agent & IP
  const uaMeta = parseUserAgent(userAgent);
  const ipSummary = sanitizeIp(ip);
  const finalSessionId = sessionId && typeof sessionId === 'string' && sessionId.trim()
    ? sessionId.trim()
    : generateSessionId();

  const finalDeviceLabel = deviceLabel && typeof deviceLabel === 'string' && deviceLabel.trim()
    ? deviceLabel.trim()
    : uaMeta.deviceLabel;

  // 3. Create session record
  const created = await createSession(db, {
    codeId,
    sessionId: finalSessionId,
    deviceLabel: finalDeviceLabel,
    platform: uaMeta.platform,
    browser: uaMeta.browser,
    userAgentSummary: `${uaMeta.platform} • ${uaMeta.browser}`,
    ip,
    ipSummary,
    deviceId: deviceId || null,
  });

  // 4. Audit Log
  await recordSecurityEvent(db, {
    eventType: 'session_created',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      sessionId: finalSessionId,
      deviceLabel: finalDeviceLabel,
      platform: uaMeta.platform,
      browser: uaMeta.browser,
      deviceId: deviceId || null,
    },
  });

  return {
    success: true,
    session: {
      sessionId: created.sessionId,
      codeId: created.codeId,
      deviceLabel: created.deviceLabel,
      platform: created.platform,
      browser: created.browser,
      createdAtMs: created.createdAtMs,
      lastSeenAtMs: created.lastSeenAtMs,
      expiresAtMs: created.expiresAtMs,
      ipSummary: created.ipSummary,
      status: created.status,
    },
  };
}

/**
 * Lists active sessions for a user with safe sanitization.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string | null} [params.currentSessionId=null]
 * @returns {Promise<{ success: boolean, sessions: Array<Object> }>}
 */
async function listActiveSessions({
  db,
  codeId,
  currentSessionId = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  const rawSessions = await getActiveSessions(db, codeId);

  const safeSessions = rawSessions.map((s) => ({
    sessionId: s.sessionId,
    deviceLabel: s.deviceLabel,
    platform: s.platform,
    browser: s.browser,
    userAgentSummary: s.userAgentSummary,
    ipSummary: s.ipSummary,
    createdAtMs: s.createdAtMs,
    lastSeenAtMs: s.lastSeenAtMs,
    expiresAtMs: s.expiresAtMs,
    status: s.status,
    isCurrent: currentSessionId ? s.sessionId === currentSessionId : false,
    relativeCreatedAt: formatRelativeTimeVi(s.createdAtMs),
    relativeLastSeen: formatRelativeTimeVi(s.lastSeenAtMs),
  }));

  return {
    success: true,
    sessions: safeSessions,
  };
}

/**
 * Revokes a specific session belonging to the authenticated user.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth]
 * @param {string} params.codeId - Verified authenticated CodeID
 * @param {string} params.sessionId - Target session ID
 * @param {string | null} [params.currentSessionId=null]
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, message: string, isCurrentRevoked: boolean }>}
 */
async function revokeUserSession({
  db,
  auth = null,
  codeId,
  sessionId,
  currentSessionId = null,
  ip = null,
  userAgent = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new ValidationError('Vui lòng cung cấp mã phiên cần hủy (sessionId).');
  }

  const targetSession = await getSession(db, codeId, sessionId.trim());
  if (!targetSession) {
    throw new ValidationError('Không tìm thấy phiên đăng nhập hoặc phiên đã bị hủy.');
  }

  // Verify ownership invariant: session belongs strictly to this CodeID
  if (targetSession.codeId !== codeId) {
    throw new ValidationError('Không thể hủy phiên đăng nhập của tài khoản khác.');
  }

  await revokeSession(db, codeId, sessionId.trim(), 'user_revoked');

  const isCurrentRevoked = currentSessionId ? sessionId.trim() === currentSessionId : false;

  // Revoke refresh token if current session was revoked
  if (isCurrentRevoked && auth && typeof auth.revokeRefreshTokens === 'function') {
    try {
      await auth.revokeRefreshTokens(codeId);
    } catch (_) {}
  }

  await recordSecurityEvent(db, {
    eventType: 'session_revoked',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      sessionId: sessionId.trim(),
      deviceLabel: targetSession.deviceLabel,
      isCurrentRevoked,
    },
  });

  return {
    success: true,
    message: 'Hủy phiên đăng nhập thành công.',
    isCurrentRevoked,
  };
}

/**
 * Revokes all active sessions for a user EXCEPT the current session.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth]
 * @param {string} params.codeId - Verified authenticated CodeID
 * @param {string | null} [params.currentSessionId=null] - Current session to preserve
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, revokedCount: number, message: string }>}
 */
async function revokeOtherUserSessions({
  db,
  auth = null,
  codeId,
  currentSessionId = null,
  ip = null,
  userAgent = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  const count = await revokeOtherSessions(db, codeId, currentSessionId, 'revoke_other_sessions');

  // Invalidate refresh tokens so other devices must reauthenticate
  if (auth && typeof auth.revokeRefreshTokens === 'function') {
    try {
      await auth.revokeRefreshTokens(codeId);
    } catch (_) {}
  }

  await recordSecurityEvent(db, {
    eventType: 'all_other_sessions_revoked',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      preservedSessionId: currentSessionId,
      revokedCount: count,
    },
  });

  return {
    success: true,
    revokedCount: count,
    message: `Đã đăng xuất thành công khỏi ${count} thiết bị khác.`,
  };
}

/**
 * Registers a trusted device for the authenticated user.
 * Stores cryptographically hashed fingerprint (NEVER raw secret).
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string} [params.deviceId]
 * @param {string} [params.deviceLabel]
 * @param {string} [params.deviceFingerprint]
 * @param {string | null} [params.userAgent=null]
 * @param {string | null} [params.ip=null]
 * @returns {Promise<{ success: boolean, device: Object }>}
 */
async function registerTrustedDeviceForUser({
  db,
  codeId,
  deviceId = null,
  deviceLabel = null,
  deviceFingerprint = null,
  userAgent = null,
  ip = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  const finalDeviceId = deviceId && typeof deviceId === 'string' && deviceId.trim()
    ? deviceId.trim()
    : generateDeviceId();

  const uaMeta = parseUserAgent(userAgent);
  const finalDeviceLabel = deviceLabel && typeof deviceLabel === 'string' && deviceLabel.trim()
    ? deviceLabel.trim()
    : `Thiết bị tin cậy • ${uaMeta.deviceLabel}`;

  const fingerprintHash = deviceFingerprint
    ? hashFingerprint(deviceFingerprint)
    : hashFingerprint(`${uaMeta.platform}-${uaMeta.browser}-${finalDeviceId}`);

  const device = await registerTrustedDeviceDoc(db, {
    codeId,
    deviceId: finalDeviceId,
    deviceLabel: finalDeviceLabel,
    platform: uaMeta.platform,
    browser: uaMeta.browser,
    deviceFingerprintHash: fingerprintHash,
  });

  await recordSecurityEvent(db, {
    eventType: 'device_registered',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      deviceId: finalDeviceId,
      deviceLabel: finalDeviceLabel,
      platform: uaMeta.platform,
    },
  });

  return {
    success: true,
    device: {
      deviceId: device.deviceId,
      deviceLabel: device.deviceLabel,
      platform: device.platform,
      browser: device.browser,
      trustedAtMs: device.trustedAtMs,
      lastSeenAtMs: device.lastSeenAtMs,
      expiresAtMs: device.expiresAtMs,
      status: device.status,
    },
  };
}

/**
 * Lists all trusted devices for the authenticated user.
 * Excludes raw cryptographic hashes from client view.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string | null} [params.currentDeviceId=null]
 * @returns {Promise<{ success: boolean, devices: Array<Object> }>}
 */
async function listTrustedDevicesForUser({
  db,
  codeId,
  currentDeviceId = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  const rawDevices = await getTrustedDevices(db, codeId);

  const safeDevices = rawDevices.map((d) => ({
    deviceId: d.deviceId,
    deviceLabel: d.deviceLabel,
    platform: d.platform,
    browser: d.browser,
    trustedAtMs: d.trustedAtMs,
    lastSeenAtMs: d.lastSeenAtMs,
    expiresAtMs: d.expiresAtMs,
    status: d.status,
    isCurrentDevice: currentDeviceId ? d.deviceId === currentDeviceId : false,
    relativeTrustedAt: formatRelativeTimeVi(d.trustedAtMs),
    relativeLastSeen: formatRelativeTimeVi(d.lastSeenAtMs),
  }));

  return {
    success: true,
    devices: safeDevices,
  };
}

/**
 * Revokes trust for a specific device.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {string} params.deviceId
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function revokeTrustedDeviceForUser({
  db,
  codeId,
  deviceId,
  ip = null,
  userAgent = null,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
    throw new ValidationError('Vui lòng cung cấp mã thiết bị cần hủy tin cậy (deviceId).');
  }

  const targetDevice = await getTrustedDeviceDoc(db, codeId, deviceId.trim());
  if (!targetDevice) {
    throw new ValidationError('Không tìm thấy thiết bị tin cậy.');
  }

  if (targetDevice.codeId !== codeId) {
    throw new ValidationError('Không thể hủy thiết bị tin cậy của tài khoản khác.');
  }

  await revokeTrustedDeviceDoc(db, codeId, deviceId.trim());

  await recordSecurityEvent(db, {
    eventType: 'device_revoked',
    actorCodeID: codeId,
    targetCodeID: codeId,
    ip,
    userAgent,
    details: {
      deviceId: deviceId.trim(),
      deviceLabel: targetDevice.deviceLabel,
    },
  });

  return {
    success: true,
    deviceId: deviceId.trim(),
    message: 'Hủy thiết bị tin cậy thành công.',
  };
}

/**
 * Fetches recent security activity for the authenticated user.
 * Filters and sanitizes events to ensure ZERO credential leakage.
 * 
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.codeId
 * @param {number} [params.limit=20]
 * @returns {Promise<{ success: boolean, events: Array<Object> }>}
 */
async function getRecentSecurityActivityForUser({
  db,
  codeId,
  limit = 20,
}) {
  if (!isValidCodeId(codeId)) {
    throw new ValidationError(`Mã định danh CodeID '${codeId}' không hợp lệ.`);
  }

  const colRef = db.collection(SECURITY_EVENTS_COLLECTION);
  let snap;

  try {
    if (typeof colRef.where === 'function') {
      snap = await colRef
        .where('targetCodeID', '==', codeId)
        .limit(limit)
        .get();
    } else {
      snap = await colRef.get();
    }
  } catch {
    snap = await colRef.get();
  }

  const SAFE_EVENT_TYPES = [
    'login_success',
    'login_failed',
    'account_locked',
    'account_unlocked',
    'password_changed',
    'password_reset',
    'ndid_changed',
    'recovery_requested',
    'recovery_code_verified',
    'recovery_failed',
    'google_linked',
    'google_unlinked',
    'session_created',
    'session_revoked',
    'all_other_sessions_revoked',
    'device_registered',
    'device_revoked',
  ];

  const EVENT_DESCRIPTIONS = {
    login_success: 'Đăng nhập thành công',
    login_failed: 'Đăng nhập không thành công',
    account_locked: 'Tài khoản bị tạm khóa',
    account_unlocked: 'Tài khoản được mở khóa',
    password_changed: 'Đổi mật khẩu thành công',
    password_reset: 'Đặt lại mật khẩu khôi phục',
    ndid_changed: 'Thay đổi NDID',
    recovery_requested: 'Yêu cầu mã khôi phục tài khoản',
    recovery_code_verified: 'Xác thực mã khôi phục thành công',
    recovery_failed: 'Xác thực khôi phục thất bại',
    google_linked: 'Liên kết tài khoản Google',
    google_unlinked: 'Hủy liên kết tài khoản Google',
    session_created: 'Phiên đăng nhập mới được thiết lập',
    session_revoked: 'Hủy phiên đăng nhập',
    all_other_sessions_revoked: 'Đăng xuất khỏi các thiết bị khác',
    device_registered: 'Thêm thiết bị tin cậy mới',
    device_revoked: 'Hủy thiết bị tin cậy',
  };

  const rawDocs = snap.docs ? snap.docs.map(d => d.data()) : (snap.empty ? [] : []);
  const matching = [];

  for (const doc of rawDocs) {
    const isUserEvent = doc.targetCodeID === codeId || doc.actorCodeID === codeId;
    if (!isUserEvent) continue;

    if (!SAFE_EVENT_TYPES.includes(doc.eventType)) continue;

    const timeMs = doc.timestamp?.toMillis
      ? doc.timestamp.toMillis()
      : (typeof doc.timestampMs === 'number' ? doc.timestampMs : Date.now());

    const uaMeta = parseUserAgent(doc.userAgent);
    const ipSummary = sanitizeIp(doc.ip);

    matching.push({
      eventId: doc.eventId,
      eventType: doc.eventType,
      title: EVENT_DESCRIPTIONS[doc.eventType] || 'Hoạt động bảo mật',
      timestampMs: timeMs,
      relativeTime: formatRelativeTimeVi(timeMs),
      platform: uaMeta.platform,
      browser: uaMeta.browser,
      ipSummary,
      detailsSummary: doc.details?.deviceLabel || doc.details?.reason || null,
    });
  }

  // Sort descending by timestampMs
  matching.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

  return {
    success: true,
    events: matching.slice(0, limit),
  };
}

module.exports = {
  generateSessionId,
  generateDeviceId,
  hashFingerprint,
  registerSession,
  listActiveSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  registerTrustedDeviceForUser,
  listTrustedDevicesForUser,
  revokeTrustedDeviceForUser,
  getRecentSecurityActivityForUser,
};
