/**
 * Vercel Serverless Function Adapter for EduSpace V3 Server-Authoritative Assessment API
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

const canonicalFoundation = require('../functions/src/index');
import { handleAssessmentApi } from './dist/eduspace.mjs';

/**
 * Vercel Serverless Function Handler
 */
export default async function handleV3Assessment(req, res, customOptions = {}) {
  const db = customOptions.db || canonicalFoundation.getFirestoreDb();
  const auth = customOptions.auth || canonicalFoundation.getAuth();

  await handleAssessmentApi(req, res, {
    db,
    auth,
    ...customOptions
  });
}

export { handleV3Assessment };
