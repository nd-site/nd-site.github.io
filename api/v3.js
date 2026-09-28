/**
 * Vercel Serverless Function & Local Dev Adapter for EduSpace V3 Server-Authoritative Assessment API
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-exam-session.md
 * 
 * Routes:
 * - POST /api/v3/exam-sessions
 * - GET  /api/v3/exam-sessions/:id/resume
 * - POST /api/v3/exam-sessions/:id/autosave
 * - POST /api/v3/exam-sessions/:id/submit
 * - GET  /api/v3/results/:id
 * - POST /api/v3/grading/manual
 */

'use strict';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { handleAssessmentApi } from './dist/eduspace.mjs';

// In-memory store for local development session lifecycle
const devStore = new Map();

function decodeFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in val) {
    const res = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = decodeFirestoreValue(v);
    }
    return res;
  }
  return val;
}

function createLocalDevDb() {
  function createColRef(colPath) {
    return {
      doc(docId) {
        return {
          async get() {
            const key = `${colPath}/${docId}`;
            if (devStore.has(key)) {
              return {
                exists: true,
                data: () => devStore.get(key)
              };
            }
            if (colPath === 'users') {
              const isOwner = docId === '0000';
              const mockUser = {
                codeId: docId,
                ndid: isOwner ? 'owner_nd' : `student_${docId}`,
                role: isOwner ? 'admin' : 'user',
                eduRole: 'student',
                displayName: isOwner ? 'ND Labs Owner' : `Học sinh ${docId}`
              };
              devStore.set(key, mockUser);
              return {
                exists: true,
                data: () => mockUser
              };
            }
            if (colPath === 'quizzes') {
              try {
                const res = await fetch(`https://firestore.googleapis.com/v1/projects/ndlabs-0/databases/(default)/documents/quizzes/${docId}`);
                if (!res.ok) return { exists: false, data: () => null };
                const docJson = await res.json();
                if (!docJson.fields) return { exists: false, data: () => null };
                const decoded = {};
                for (const [k, v] of Object.entries(docJson.fields)) {
                  decoded[k] = decodeFirestoreValue(v);
                }
                devStore.set(key, decoded);
                return {
                  exists: true,
                  data: () => decoded
                };
              } catch {
                return { exists: false, data: () => null };
              }
            }
            return { exists: false, data: () => null };
          },
          async set(data, options = {}) {
            const key = `${colPath}/${docId}`;
            if (options.merge && devStore.has(key)) {
              devStore.set(key, { ...devStore.get(key), ...data });
            } else {
              devStore.set(key, data);
            }
          },
          collection(subCol) {
            return createColRef(`${colPath}/${docId}/${subCol}`);
          }
        };
      },
      async get() {
        const results = [];
        for (const [key, data] of devStore.entries()) {
          if (key.startsWith(`${colPath}/`)) {
            const parts = key.slice(colPath.length + 1).split('/');
            if (parts.length === 1) {
              results.push({
                id: parts[0],
                data: () => data
              });
            }
          }
        }
        return results;
      },
      where() {
        return this;
      },
      limit() {
        return this;
      }
    };
  }

  return {
    collection(colName) {
      return createColRef(colName);
    }
  };
}

function createLocalDevAuth() {
  return {
    async verifyIdToken(token) {
      if (token.startsWith('dev_token_')) {
        return { uid: token.replace('dev_token_', '') };
      }
      if (token.startsWith('valid_token_for_')) {
        return { uid: token.replace('valid_token_for_', '') };
      }
      // If client sends any token during local testing, default to '0000' or student
      return { uid: '0000' };
    }
  };
}

/**
 * Master V3 Assessment API Handler
 */
export default async function handleV3Assessment(req, res, customOptions = {}) {
  let db = customOptions.db;
  let auth = customOptions.auth;

  if (!db || !auth) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const canonicalFoundation = require('../functions/src/index');
        db = db || canonicalFoundation.getFirestoreDb();
        auth = auth || canonicalFoundation.getAuth();
      } catch (err) {
        console.warn('[V3Assessment] Fallback to local dev context due to Admin SDK error:', err.message);
        db = db || createLocalDevDb();
        auth = auth || createLocalDevAuth();
      }
    } else {
      db = db || createLocalDevDb();
      auth = auth || createLocalDevAuth();
    }
  }

  await handleAssessmentApi(req, res, {
    db,
    auth,
    ...customOptions
  });
}

export { handleV3Assessment };
