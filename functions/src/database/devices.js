/**
 * Canonical Trusted Device Data Access Service (Phase 01-C6)
 * 
 * Manages trusted device records under:
 * `users/{CodeID}/devices/{deviceId}`
 * 
 * Invariants:
 * - NEVER client-readable or client-writable directly (blocked by Firestore Security Rules).
 * - NEVER stores plaintext tokens or raw device secrets. Only cryptographically hashed fingerprints.
 * - Device ownership strictly bound to CodeID (verified against Firebase Auth UID === CodeID).
 * - Full lifecycle support: active, revoked, expired.
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('./users');

const DEVICES_SUBCOLLECTION = 'devices';
const DEFAULT_DEVICE_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days default trusted TTL

/**
 * Returns reference to a specific trusted device document.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} deviceId
 * @returns {admin.firestore.DocumentReference}
 */
function getDeviceDocRef(db, codeId, deviceId) {
  return db.collection(USERS_COLLECTION).doc(codeId).collection(DEVICES_SUBCOLLECTION).doc(deviceId);
}

/**
 * Returns reference to the devices collection for a user.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {admin.firestore.CollectionReference}
 */
function getDevicesCollectionRef(db, codeId) {
  return db.collection(USERS_COLLECTION).doc(codeId).collection(DEVICES_SUBCOLLECTION);
}

/**
 * Registers or updates a trusted device for an authenticated user.
 * 
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId
 * @param {string} params.deviceId
 * @param {string} [params.deviceLabel]
 * @param {string} [params.platform]
 * @param {string} [params.browser]
 * @param {string} [params.deviceFingerprintHash] - SHA-256 hash of fingerprint (NEVER raw secret)
 * @param {number} [params.ttlMs=DEFAULT_DEVICE_TTL_MS]
 * @param {admin.firestore.Transaction} [params.transaction]
 * @returns {Promise<Object>} Created device record
 */
async function registerTrustedDeviceDoc(db, {
  codeId,
  deviceId,
  deviceLabel = 'Thiết bị tin cậy',
  platform = 'Khác',
  browser = 'Trình duyệt web',
  deviceFingerprintHash = null,
  ttlMs = DEFAULT_DEVICE_TTL_MS,
  transaction = null,
}) {
  const docRef = getDeviceDocRef(db, codeId, deviceId);
  const nowMs = Date.now();
  const serverTime = admin.firestore.FieldValue.serverTimestamp();
  const expiresAtMs = nowMs + ttlMs;

  const devicePayload = {
    deviceId,
    codeId,
    deviceLabel,
    platform,
    browser,
    deviceFingerprintHash: deviceFingerprintHash || null,
    status: 'active',
    trustedAt: serverTime,
    trustedAtMs: nowMs,
    lastSeenAt: serverTime,
    lastSeenAtMs: nowMs,
    expiresAtMs,
    revokedAt: null,
    updatedAt: serverTime,
  };

  if (transaction) {
    transaction.set(docRef, devicePayload, { merge: true });
  } else {
    await docRef.set(devicePayload, { merge: true });
  }

  return devicePayload;
}

/**
 * Fetches a device record by deviceId.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} deviceId
 * @returns {Promise<Object | null>}
 */
async function getTrustedDeviceDoc(db, codeId, deviceId) {
  const docRef = getDeviceDocRef(db, codeId, deviceId);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * Lists all trusted devices for a canonical CodeID.
 * Automatically marks expired devices if their expiresAtMs is past.
 * 
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<Array<Object>>}
 */
async function getTrustedDevices(db, codeId) {
  const colRef = getDevicesCollectionRef(db, codeId);
  const snap = await colRef.get();
  if (snap.empty) return [];

  const nowMs = Date.now();
  const devices = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    // Check expiration
    if (data.status === 'active' && data.expiresAtMs && nowMs > data.expiresAtMs) {
      doc.ref.update({
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
      data.status = 'expired';
    }

    if (data.status === 'active') {
      devices.push(data);
    }
  }

  // Sort descending by trustedAtMs
  devices.sort((a, b) => (b.trustedAtMs || 0) - (a.trustedAtMs || 0));
  return devices;
}

/**
 * Revokes trust for a specific device.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {string} deviceId
 * @returns {Promise<boolean>}
 */
async function revokeTrustedDeviceDoc(db, codeId, deviceId) {
  const docRef = getDeviceDocRef(db, codeId, deviceId);
  const snap = await docRef.get();
  if (!snap.exists) return false;

  await docRef.update({
    status: 'revoked',
    revokedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return true;
}

module.exports = {
  DEVICES_SUBCOLLECTION,
  DEFAULT_DEVICE_TTL_MS,
  getDeviceDocRef,
  getDevicesCollectionRef,
  registerTrustedDeviceDoc,
  getTrustedDeviceDoc,
  getTrustedDevices,
  revokeTrustedDeviceDoc,
};
