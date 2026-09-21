/**
 * Canonical Session Data Access Service (Phase 01-C6)
 * 
 * Manages server-controlled session records under:
 * `users/{CodeID}/sessions/{sessionId}`
 * 
 * Invariants:
 * - NEVER client-readable or client-writable (blocked by Firestore Security Rules).
 * - NEVER stores plaintext passwords, raw refresh tokens, or ID tokens.
 * - Session ownership is strictly bound to CodeID (verified against Firebase Auth UID === CodeID).
 * - Full lifecycle support: active, revoked, expired.
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('./users');

const SESSIONS_SUBCOLLECTION = 'sessions';
const DEFAULT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Returns reference to a specific session document.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} sessionId
 * @returns {admin.firestore.DocumentReference}
 */
function getSessionDocRef(db, codeId, sessionId) {
  return db.collection(USERS_COLLECTION).doc(codeId).collection(SESSIONS_SUBCOLLECTION).doc(sessionId);
}

/**
 * Returns reference to the sessions collection for a user.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {admin.firestore.CollectionReference}
 */
function getSessionsCollectionRef(db, codeId) {
  return db.collection(USERS_COLLECTION).doc(codeId).collection(SESSIONS_SUBCOLLECTION);
}

/**
 * Creates or registers a new active session record.
 * 
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId
 * @param {string} params.sessionId
 * @param {string} [params.deviceLabel]
 * @param {string} [params.platform]
 * @param {string} [params.browser]
 * @param {string} [params.userAgentSummary]
 * @param {string} [params.ip]
 * @param {string} [params.ipSummary]
 * @param {string} [params.deviceId]
 * @param {number} [params.ttlMs=DEFAULT_SESSION_TTL_MS]
 * @param {admin.firestore.Transaction} [params.transaction]
 * @returns {Promise<Object>} Created session payload
 */
async function createSession(db, {
  codeId,
  sessionId,
  deviceLabel = 'Thiết bị không xác định',
  platform = 'Khác',
  browser = 'Trình duyệt web',
  userAgentSummary = '',
  ip = null,
  ipSummary = null,
  deviceId = null,
  ttlMs = DEFAULT_SESSION_TTL_MS,
  transaction = null,
}) {
  const docRef = getSessionDocRef(db, codeId, sessionId);
  const nowMs = Date.now();
  const serverTime = admin.firestore.FieldValue.serverTimestamp();
  const expiresAtMs = nowMs + ttlMs;

  const sessionPayload = {
    sessionId,
    codeId,
    deviceLabel,
    platform,
    browser,
    userAgentSummary: userAgentSummary || `${platform} • ${browser}`,
    ip: ip || null,
    ipSummary: ipSummary || (ip ? ip : null),
    deviceId: deviceId || null,
    status: 'active',
    createdAt: serverTime,
    createdAtMs: nowMs,
    lastSeenAt: serverTime,
    lastSeenAtMs: nowMs,
    expiresAtMs,
    revokedAt: null,
    revocationReason: null,
    updatedAt: serverTime,
  };

  if (transaction) {
    transaction.set(docRef, sessionPayload);
  } else {
    await docRef.set(sessionPayload);
  }

  return sessionPayload;
}

/**
 * Fetches a session record by sessionId.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} sessionId
 * @returns {Promise<Object | null>}
 */
async function getSession(db, codeId, sessionId) {
  const docRef = getSessionDocRef(db, codeId, sessionId);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * Lists all active sessions for a canonical CodeID.
 * Automatically marks expired sessions if their expiresAtMs is past.
 * 
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<Array<Object>>}
 */
async function getActiveSessions(db, codeId) {
  const colRef = getSessionsCollectionRef(db, codeId);
  const snap = await colRef.get();
  if (snap.empty) return [];

  const nowMs = Date.now();
  const activeSessions = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    // Expiration check
    if (data.status === 'active' && data.expiresAtMs && nowMs > data.expiresAtMs) {
      // Background update to expired
      doc.ref.update({
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
      continue;
    }

    if (data.status === 'active') {
      activeSessions.push(data);
    }
  }

  // Sort descending by lastSeenAtMs or createdAtMs
  activeSessions.sort((a, b) => (b.lastSeenAtMs || 0) - (a.lastSeenAtMs || 0));
  return activeSessions;
}

/**
 * Revokes a specific session.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} sessionId
 * @param {string} [reason='user_revoked']
 * @returns {Promise<boolean>}
 */
async function revokeSession(db, codeId, sessionId, reason = 'user_revoked') {
  const docRef = getSessionDocRef(db, codeId, sessionId);
  const snap = await docRef.get();
  if (!snap.exists) return false;

  await docRef.update({
    status: 'revoked',
    revokedAt: admin.firestore.FieldValue.serverTimestamp(),
    revocationReason: reason,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return true;
}

/**
 * Revokes all active sessions for a user EXCEPT a designated current session.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string | null} [currentSessionId=null]
 * @param {string} [reason='revoke_other_sessions']
 * @returns {Promise<number>} Count of sessions revoked
 */
async function revokeOtherSessions(db, codeId, currentSessionId = null, reason = 'revoke_other_sessions') {
  const active = await getActiveSessions(db, codeId);
  let revokedCount = 0;

  const serverTime = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch ? db.batch() : null;
  const updates = [];

  for (const session of active) {
    if (currentSessionId && session.sessionId === currentSessionId) {
      continue; // Preserve current session
    }

    const docRef = getSessionDocRef(db, codeId, session.sessionId);
    const updateData = {
      status: 'revoked',
      revokedAt: serverTime,
      revocationReason: reason,
      updatedAt: serverTime,
    };

    if (batch) {
      batch.update(docRef, updateData);
    } else {
      updates.push(docRef.update(updateData));
    }
    revokedCount++;
  }

  if (batch) {
    await batch.commit();
  } else if (updates.length > 0) {
    await Promise.all(updates);
  }

  return revokedCount;
}

/**
 * Revokes ALL active sessions for a user (e.g. upon password reset or account lockout).
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} [reason='all_sessions_revoked']
 * @returns {Promise<number>}
 */
async function revokeAllSessions(db, codeId, reason = 'all_sessions_revoked') {
  return revokeOtherSessions(db, codeId, null, reason);
}

module.exports = {
  SESSIONS_SUBCOLLECTION,
  DEFAULT_SESSION_TTL_MS,
  getSessionDocRef,
  getSessionsCollectionRef,
  createSession,
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
};
