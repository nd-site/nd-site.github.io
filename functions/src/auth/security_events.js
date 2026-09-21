/**
 * Canonical Security Event Logger (Phase 01-C2)
 * 
 * Records append-only, tamper-evident audit trails for authentication,
 * authorization, and security-relevant actions into `security_events/{eventId}`.
 * 
 * Strict Security Invariant:
 * Passwords, password hashes, and raw token credentials are NEVER stored.
 */

'use strict';

const admin = require('firebase-admin');

const SECURITY_EVENTS_COLLECTION = 'security_events';

/**
 * Sanitizes details metadata to prevent accidental leak of sensitive credentials.
 * @param {Record<string, unknown>} [details]
 * @returns {Record<string, unknown>}
 */
function sanitizeEventDetails(details = {}) {
  const safe = {};
  const forbiddenKeys = ['password', 'passwordHash', 'token', 'customToken', 'credential', 'secret'];
  for (const [key, val] of Object.entries(details)) {
    if (forbiddenKeys.some(f => key.toLowerCase().includes(f))) {
      continue; // Filter out sensitive key
    }
    safe[key] = val;
  }
  return safe;
}

/**
 * Appends a new security event to the audit collection.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.eventType
 * @param {string | null} [params.actorCodeID=null]
 * @param {string | null} [params.targetCodeID=null]
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @param {Record<string, unknown>} [params.details={}]
 * @param {admin.firestore.Transaction} [params.transaction=null]
 * @returns {Promise<string>} Created event ID
 */
async function recordSecurityEvent(db, {
  eventType,
  actorCodeID = null,
  targetCodeID = null,
  ip = null,
  userAgent = null,
  details = {},
  transaction = null,
}) {
  const docRef = db.collection(SECURITY_EVENTS_COLLECTION).doc();
  const eventPayload = {
    eventId: docRef.id,
    eventType,
    actorCodeID: actorCodeID || null,
    targetCodeID: targetCodeID || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: ip || null,
    userAgent: userAgent || null,
    details: sanitizeEventDetails(details),
  };

  if (transaction) {
    transaction.set(docRef, eventPayload);
  } else {
    await docRef.set(eventPayload);
  }

  return docRef.id;
}

module.exports = {
  SECURITY_EVENTS_COLLECTION,
  recordSecurityEvent,
  sanitizeEventDetails,
};
