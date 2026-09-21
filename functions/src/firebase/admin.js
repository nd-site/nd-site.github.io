/**
 * Centralized Firebase Admin SDK Initializer & Factory (Phase 01-C1)
 * 
 * Provides trusted server-side Admin SDK authority for Firestore.
 * Supports emulator injection and custom DB instances for unit/integration testing.
 */

'use strict';

const admin = require('firebase-admin');

/**
 * Ensures Firebase Admin is initialized once and returns the default app.
 * @param {admin.AppOptions} [options]
 * @returns {admin.app.App}
 */
function getAdminApp(options) {
  if (!admin.apps.length) {
    let finalOptions = options;
    if (!finalOptions && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        const serviceAccount = JSON.parse(raw);
        finalOptions = {
          credential: admin.credential.cert(serviceAccount),
        };
      } catch (err) {
        console.warn('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
      }
    }
    admin.initializeApp(finalOptions);
  }
  return admin.app();
}

/**
 * Returns the Firestore database instance from Firebase Admin SDK.
 * @param {admin.app.App} [app] - Optional specific app instance
 * @returns {FirebaseFirestore.Firestore}
 */
function getFirestoreDb(app) {
  const currentApp = app || getAdminApp();
  return currentApp.firestore();
}

/**
 * Returns the Auth service instance from Firebase Admin SDK.
 * @param {admin.app.App} [app] - Optional specific app instance
 * @returns {admin.auth.Auth}
 */
function getAuth(app) {
  const currentApp = app || getAdminApp();
  return currentApp.auth();
}

module.exports = {
  admin,
  getAdminApp,
  getFirestoreDb,
  getAuth,
};
