/**
 * EduSpace V3 - Server-Authoritative Backend HTTP Dispatcher & Adapter
 * Source of truth: docs/eduspace-v3-architecture.md & docs/eduspace-v3-exam-session.md
 * 
 * Provides the real server-side HTTP adapter:
 * Client
 *   ↓
 * Existing API Adapter (/api/v3 or Vercel Function)
 *   ↓
 * Backend HTTP Handler (handleAssessmentApi)
 *   ↓
 * Authentication / Authorization Boundary (Firebase Auth UID === CodeID & users/{CodeID}.ndid)
 *   ↓
 * V3 Assessment Service (ExamSessionService)
 *   ↓
 * Authoritative Repository Layer (FirestoreRepository / MemoryRepository)
 *   ↓
 * Database (Firestore Admin SDK Authority)
 */

import {
  FirestoreExamRepository,
  FirestoreExamSessionRepository,
  FirestoreQuestionRepository,
  FirestoreResultRepository,
  FirestoreSubmissionRepository
} from '../core/repositories/firestoreRepository.ts';
import type {
  ExamRepository,
  ExamSessionRepository,
  QuestionRepository,
  ResultRepository,
  SubmissionRepository
} from '../core/repositories/interfaces.ts';
import { EduSpaceError } from '../core/errors/EduSpaceError.ts';
import { ExamSessionService } from '../assessment/sessionService.ts';
import type { UserSecurityContext } from '../assessment/types.ts';

export interface AssessmentBackendOptions {
  db?: any;
  auth?: any;
  examRepo?: ExamRepository;
  questionRepo?: QuestionRepository;
  sessionRepo?: ExamSessionRepository;
  submissionRepo?: SubmissionRepository;
  resultRepo?: ResultRepository;
  service?: ExamSessionService;
}

export interface NodeHttpRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: any;
  socket?: { remoteAddress?: string };
  on?: (event: string, callback: (...args: any[]) => void) => void;
}

export interface NodeHttpResponse {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (chunk?: string) => void;
}

const ALLOWED_ORIGINS = [
  'https://ndsite.web.app',
  'https://nd-site.github.io',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500'
];

function setCORSHeaders(req: NodeHttpRequest, res: NodeHttpResponse): void {
  const origin = (req.headers?.origin as string) || '';
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://ndsite.web.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJson(res: NodeHttpResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function parseRequestBody(req: NodeHttpRequest): Promise<any> {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return {};
  }

  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return {};
  }

  if (typeof req.on === 'function') {
    if ((req as any).readableEnded || (req as any).complete) {
      return {};
    }

    return new Promise(resolve => {
      let bodyStr = '';
      const timer = setTimeout(() => {
        resolve({});
      }, 1000);

      req.on!('data', chunk => {
        bodyStr += chunk;
      });
      req.on!('end', () => {
        clearTimeout(timer);
        try {
          resolve(bodyStr ? JSON.parse(bodyStr) : {});
        } catch {
          resolve({});
        }
      });
      req.on!('error', () => {
        clearTimeout(timer);
        resolve({});
      });
    });
  }
  return {};
}

/**
 * Real Server-Authoritative Identity Resolver:
 * 1. Extracts Authorization: Bearer <idToken>
 * 2. Verifies ID Token using Firebase Admin Auth
 * 3. Resolves CodeID (strictly decoded.uid === CodeID)
 * 4. Resolves canonical user record from users/{CodeID}
 * 5. Preserves canonical NDID 100% RAW STRING without '@' prefix
 */
export async function authenticateServerRequest(
  req: NodeHttpRequest,
  db: any,
  auth: any
): Promise<UserSecurityContext> {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization) as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw EduSpaceError.unauthenticated('Authorization header missing or malformed');
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    throw EduSpaceError.unauthenticated('Bearer token empty');
  }

  let codeId = '';
  try {
    // If auth mock or real admin auth provided
    const decoded = await auth.verifyIdToken(idToken);
    codeId = decoded.uid;
  } catch (err: any) {
    throw EduSpaceError.unauthenticated(`Invalid authentication token: ${err.message}`);
  }

  if (!codeId) {
    throw EduSpaceError.unauthenticated('Failed to resolve CodeID from authenticated token');
  }

  // Load canonical user foundation from users/{CodeID}
  const userDocRef = db.collection('users').doc(codeId);
  const userSnap = await userDocRef.get();

  if (!userSnap || !userSnap.exists) {
    throw EduSpaceError.unauthenticated(`User account '${codeId}' does not exist on the server`);
  }

  const userData = userSnap.data() || {};

  // Canonical RAW NDID preservation (never prepend '@', never strip chars)
  const canonicalNdid = String(userData.ndid || userData.username || codeId);

  const ip = ((req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
  const userAgent = (req.headers?.['user-agent'] as string) || '';

  return {
    codeId,
    ndid: canonicalNdid, // RAW STRING 100%
    role: userData.role === 'admin' ? 'admin' : 'user',
    eduRole: userData.eduRole === 'teacher' ? 'teacher' : 'student',
    adminLevel: userData.adminLevel || 'none',
    displayName: userData.displayName || userData.name || `User ${codeId}`,
    clientIp: ip,
    userAgent
  };
}

/**
 * Creates the production-ready ExamSessionService wired to Firestore Admin SDK
 */
export function createProductionSessionService(db: any): ExamSessionService {
  return new ExamSessionService({
    examRepo: new FirestoreExamRepository(db),
    questionRepo: new FirestoreQuestionRepository(db),
    sessionRepo: new FirestoreExamSessionRepository(db),
    submissionRepo: new FirestoreSubmissionRepository(db),
    resultRepo: new FirestoreResultRepository(db)
  });
}

/**
 * Master Server-Authoritative HTTP Request Listener for EduSpace V3
 */
export async function handleAssessmentApi(
  req: NodeHttpRequest,
  res: NodeHttpResponse,
  options: AssessmentBackendOptions = {}
): Promise<void> {
  setCORSHeaders(req, res);

  const method = (req.method || 'GET').toUpperCase();

  // 1. OPTIONS Preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // Parse URL & Path
    const rawUrl = req.url || '/';
    const host = (req.headers?.host as string) || 'localhost';
    const urlObj = new URL(rawUrl, `http://${host}`);
    let pathname = urlObj.pathname.replace(/\/+$/, '');

    // Allow path rewrite via query parameter 'endpoint' or 'action' if forwarded by vercel rewrite
    const endpointParam = urlObj.searchParams.get('endpoint') || urlObj.searchParams.get('action');
    if (endpointParam && (!pathname.startsWith('/api/v3') || pathname === '/api/v3')) {
      pathname = `/api/v3/${endpointParam.replace(/^\/+/, '')}`;
    }

    // Health check endpoint
    if (method === 'GET' && (pathname === '/api/v3/health' || pathname === '/api/v3')) {
      sendJson(res, 200, {
        status: 'ok',
        service: 'eduspace-v3-assessment-backend',
        authority: 'server-authoritative',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Resolve Database and Auth
    const db = options.db;
    const auth = options.auth;

    if (!db || !auth) {
      throw EduSpaceError.internal('Backend infrastructure not initialized: db or auth missing');
    }

    // Resolve Server-Authoritative User Identity
    const userContext = await authenticateServerRequest(req, db, auth);

    // Resolve Service (custom/injected or Firestore-backed)
    const service = options.service || (
      options.examRepo && options.sessionRepo
        ? new ExamSessionService({
            examRepo: options.examRepo,
            questionRepo: options.questionRepo!,
            sessionRepo: options.sessionRepo!,
            submissionRepo: options.submissionRepo!,
            resultRepo: options.resultRepo!
          })
        : createProductionSessionService(db)
    );

    const body = await parseRequestBody(req);

    // Route 1: POST /api/v3/exam-sessions
    if (method === 'POST' && pathname === '/api/v3/exam-sessions') {
      if (!body.examId) {
        throw EduSpaceError.validation('Missing required field: examId');
      }
      const result = await service.startSession(userContext, body);
      sendJson(res, 201, result);
      return;
    }

    // Route 2: GET /api/v3/exam-sessions/:id/resume
    const resumeMatch = pathname.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/resume$/);
    if (method === 'GET' && resumeMatch) {
      const sessionId = resumeMatch[1];
      const result = await service.resumeSession(userContext, sessionId);
      sendJson(res, 200, result);
      return;
    }

    // Route 3: POST /api/v3/exam-sessions/:id/autosave
    const autosaveMatch = pathname.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/autosave$/);
    if (method === 'POST' && autosaveMatch) {
      const sessionId = autosaveMatch[1];
      const result = await service.autosave(userContext, sessionId, body);
      sendJson(res, 200, result);
      return;
    }

    // Route 4: POST /api/v3/exam-sessions/:id/submit
    const submitMatch = pathname.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/submit$/);
    if (method === 'POST' && submitMatch) {
      const sessionId = submitMatch[1];
      const result = await service.submit(userContext, sessionId, body);
      sendJson(res, 200, result);
      return;
    }

    // Route 5: GET /api/v3/results/:id
    const resultMatch = pathname.match(/^\/api\/v3\/results\/([^/]+)$/);
    if (method === 'GET' && resultMatch) {
      const resultId = resultMatch[1];
      const result = await service.getResult(userContext, resultId);
      sendJson(res, 200, { success: true, result });
      return;
    }

    // Route 6: POST /api/v3/grading/manual
    if (method === 'POST' && pathname === '/api/v3/grading/manual') {
      if (!body.sessionId || !Array.isArray(body.scores)) {
        throw EduSpaceError.validation('Invalid manual grading payload');
      }
      const result = await service.manualGrade(userContext, body);
      sendJson(res, 200, result);
      return;
    }

    // Endpoint Not Found
    sendJson(res, 404, {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint not found: ${method} ${pathname}`,
        retryAllowed: false
      }
    });
  } catch (err: any) {
    if (err instanceof EduSpaceError) {
      sendJson(res, err.httpStatus, err.toResponse());
      return;
    }

    sendJson(res, 500, {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err?.message || 'Internal server error occurred',
        retryAllowed: true
      }
    });
  }
}
