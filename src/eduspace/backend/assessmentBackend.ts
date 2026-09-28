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
import { FirestoreV2QuizRepository } from '../core/repositories/v2QuizRepository.ts';
import type { V2QuizReader, V3QuizQuestionBundle } from '../core/repositories/v2QuizRepository.ts';
import { migrateLegacyV3ExamsToSharedQuizzes } from './sharedQuizMigration.ts';
import {
  V2CompatibleExamRepository,
  V2CompatibleQuestionRepository,
  V2QuizBundleCache
} from '../core/repositories/v2CompatibleRepository.ts';
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
  quizRepo?: V2QuizReader;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJson(res: NodeHttpResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/**
 * The public catalogue deliberately contains only display metadata.  Keeping this
 * normalization at the API boundary lets V2, V3 and Edu Admin use one light,
 * consistent reader instead of each browser downloading the entire `quizzes`
 * collection and attempting to interpret old document shapes on its own.
 */
function normalizeCatalogText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi-VN')
    .trim();
}

function normalizeCatalogGrade(value: unknown): string {
  const raw = String(value ?? '').trim();
  const match = raw.match(/(?:lop|lớp|khoi|khối)?\s*(\d{1,2})/i);
  return match ? match[1] : raw;
}

function publicQuizMetadata(doc: any): any {
  const data = doc.data() || {};
  const v3Exam = data.eduspaceV3?.exam || {};
  const legacyData = data.quizData || data;
  const grade = normalizeCatalogGrade(data.grade || data.class || v3Exam.grade || legacyData.grade || legacyData.class || '');
  const duration = Number(data.duration || v3Exam.durationMinutes || legacyData.duration || 45);

  return {
    id: String(data.id || doc.id),
    title: data.title || v3Exam.title || legacyData.title || `Đề ${doc.id}`,
    description: data.description || v3Exam.description || legacyData.description || '',
    subject: String(data.subject || v3Exam.subjectId || legacyData.subject || '').trim(),
    grade,
    duration: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 45,
    visibility: data.visibility || v3Exam.visibility || 'public',
    tag: data.tag || legacyData.tag || '',
    isHot: Boolean(data.isHot || legacyData.isHot),
    isComingSoon: Boolean(data.isComingSoon || legacyData.isComingSoon)
  };
}

let publicQuizCatalogCache: { expiresAt: number; quizzes: any[] } | null = null;

async function readPublicQuizCatalog(db: any, forceRefresh = false): Promise<any[]> {
  // The three consecutive catalogue requests (grades → subjects → exams) often
  // land on the same warm function.  A short cache avoids rereading the entire
  // shared bank while still surfacing newly published exams promptly.
  if (!forceRefresh && publicQuizCatalogCache && publicQuizCatalogCache.expiresAt > Date.now()) {
    return publicQuizCatalogCache.quizzes;
  }

  const collectionRef = db.collection('quizzes');
  // Do not transfer `quizData.questions` just to draw a card.  Legacy entries
  // place every question beneath quizData, so a field projection is material to
  // first-load latency even though the result has only a few hundred documents.
  const metadataFields = [
    'id', 'title', 'description', 'subject', 'grade', 'class', 'duration', 'visibility', 'tag', 'isHot', 'isComingSoon',
    'eduspaceV3.exam',
    'quizData.title', 'quizData.description', 'quizData.subject', 'quizData.grade', 'quizData.class', 'quizData.duration',
    'quizData.tag', 'quizData.isHot', 'quizData.isComingSoon'
  ];
  const metadataQuery = typeof collectionRef.select === 'function'
    ? collectionRef.select(...metadataFields)
    : collectionRef;
  const quizSnapshot = await metadataQuery.limit(5000).get();
  const quizzes = (quizSnapshot.docs || []).map((doc: any) => publicQuizMetadata(doc));
  const sorted = quizzes.sort((left, right) => {
    const gradeOrder = Number(left.grade) - Number(right.grade);
    if (Number.isFinite(gradeOrder) && gradeOrder !== 0) return gradeOrder;
    return `${left.title} ${left.id}`.localeCompare(`${right.title} ${right.id}`, 'vi');
  });
  publicQuizCatalogCache = { quizzes: sorted, expiresAt: Date.now() + 30_000 };
  return sorted;
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
    if (process.env.NODE_ENV !== 'production' && idToken.startsWith('dev_token_')) {
      codeId = idToken.replace('dev_token_', '');
    } else {
      throw EduSpaceError.unauthenticated(`Invalid authentication token: ${err.message}`);
    }
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
  const cache = new V2QuizBundleCache();
  const v2Reader = new FirestoreV2QuizRepository(db);
  const examRepo = new V2CompatibleExamRepository(new FirestoreExamRepository(db), v2Reader, cache);
  const questionRepo = new V2CompatibleQuestionRepository(new FirestoreQuestionRepository(db), v2Reader, cache);

  return new ExamSessionService({
    examRepo,
    questionRepo,
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

    // Public catalogue facets.  Level 1 returns grades only; subjects are read
    // only after a grade is selected.  This is intentionally separate from the
    // exam endpoint so landing pages do not transfer a full quiz list upfront.
    if (method === 'GET' && pathname === '/api/v3/exam-facets') {
      const db = options.db;
      if (!db) throw EduSpaceError.internal('Backend database is not initialized');
      const quizzes = await readPublicQuizCatalog(db, urlObj.searchParams.get('refresh') === '1');
      const requestedGrade = normalizeCatalogGrade(urlObj.searchParams.get('grade') || '');

      if (!requestedGrade) {
        const gradeCounts = new Map<string, number>();
        quizzes.forEach(quiz => {
          if (!quiz.grade) return;
          gradeCounts.set(quiz.grade, (gradeCounts.get(quiz.grade) || 0) + 1);
        });
        const grades = [...gradeCounts.entries()]
          .sort(([left], [right]) => Number(left) - Number(right) || left.localeCompare(right, 'vi'))
          .map(([value, count]) => ({ value, label: /^\d+$/.test(value) ? `Lớp ${value}` : value, count }));
        sendJson(res, 200, { success: true, grades, total: quizzes.length });
        return;
      }

      const subjectCounts = new Map<string, number>();
      quizzes
        .filter(quiz => normalizeCatalogGrade(quiz.grade) === requestedGrade)
        .forEach(quiz => {
          if (!quiz.subject) return;
          subjectCounts.set(quiz.subject, (subjectCounts.get(quiz.subject) || 0) + 1);
        });
      const subjects = [...subjectCounts.entries()]
        .sort(([left], [right]) => left.localeCompare(right, 'vi'))
        .map(([value, count]) => ({ value, label: value, count }));
      sendJson(res, 200, { success: true, grade: requestedGrade, subjects });
      return;
    }

    // Public exam catalogue: metadata only, filtered and paginated on the
    // server.  Full question content and answer keys never leave through here.
    if (method === 'GET' && pathname === '/api/v3/exams') {
      const db = options.db;
      if (!db) throw EduSpaceError.internal('Backend database is not initialized');
      const grade = normalizeCatalogGrade(urlObj.searchParams.get('grade') || '');
      const subject = String(urlObj.searchParams.get('subject') || '').trim();
      const queryText = normalizeCatalogText(urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '');
      const requestedLimit = Number(urlObj.searchParams.get('limit') || 12);
      const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : 12, 24));
      const requestedCursor = Number(urlObj.searchParams.get('cursor') || 0);
      const offset = Math.max(0, Number.isFinite(requestedCursor) ? Math.floor(requestedCursor) : 0);
      const catalog = await readPublicQuizCatalog(db, urlObj.searchParams.get('refresh') === '1');
      const quizzes = catalog.filter(quiz => {
        const matchesGrade = !grade || normalizeCatalogGrade(quiz.grade) === grade;
        const matchesSubject = !subject || normalizeCatalogText(quiz.subject) === normalizeCatalogText(subject);
        const searchable = normalizeCatalogText([quiz.id, quiz.title, quiz.description, quiz.subject, quiz.grade].join(' '));
        return matchesGrade && matchesSubject && (!queryText || searchable.includes(queryText));
      });
      const page = quizzes.slice(offset, offset + limit);
      const nextOffset = offset + page.length;
      sendJson(res, 200, {
        success: true,
        quizzes: page,
        total: quizzes.length,
        nextCursor: nextOffset < quizzes.length ? String(nextOffset) : null
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

    if (method === 'POST' && pathname === '/api/v3/admin/migrate-shared-quizzes') {
      if (userContext.role !== 'admin' && userContext.codeId !== '0000' && userContext.adminLevel !== 'owner') {
        throw EduSpaceError.forbidden('Only administrators can migrate the shared quiz bank');
      }
      const report = await migrateLegacyV3ExamsToSharedQuizzes(db, {
        cursor: body.cursor,
        pageSize: body.pageSize
      });
      sendJson(res, 200, { success: true, report });
      return;
    }

    const adminQuizDeleteMatch = pathname.match(/^\/api\/v3\/admin\/quizzes\/([^/]+)$/);
    if (method === 'DELETE' && adminQuizDeleteMatch) {
      if (userContext.role !== 'admin' && userContext.codeId !== '0000' && userContext.adminLevel !== 'owner') {
        throw EduSpaceError.forbidden('Only administrators can delete shared quizzes');
      }
      const quizId = decodeURIComponent(adminQuizDeleteMatch[1]);
      const quizRef = db.collection('quizzes').doc(quizId);
      const quizSnapshot = await quizRef.get();
      if (!quizSnapshot?.exists) throw EduSpaceError.notFound(`Quiz not found: ${quizId}`);
      if (typeof db.recursiveDelete === 'function') {
        await db.recursiveDelete(quizRef);
      } else {
        const questionSnapshot = await quizRef.collection('questionBank').get();
        for (const questionDoc of questionSnapshot.docs || []) {
          const versionSnapshot = await questionDoc.ref.collection('versions').get();
          for (const versionDoc of versionSnapshot.docs || []) await versionDoc.ref.delete();
          await questionDoc.ref.delete();
        }
        await quizRef.delete();
      }
      sendJson(res, 200, { success: true, quizId });
      return;
    }

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

    // Resolve repositories for authoring operations
    const authorCache = new V2QuizBundleCache();
    const sharedQuizRepo = options.quizRepo || new FirestoreV2QuizRepository(db);
    const authorExamRepo = options.examRepo || new V2CompatibleExamRepository(
      new FirestoreExamRepository(db),
      sharedQuizRepo,
      authorCache
    );
    const authorQuestionRepo = options.questionRepo || new V2CompatibleQuestionRepository(
      new FirestoreQuestionRepository(db),
      sharedQuizRepo,
      authorCache
    );

    // Route 7: POST /api/v3/author/exams (Create / Update Exam Definition)
    if (method === 'POST' && pathname === '/api/v3/author/exams') {
      const isTeacherOrAdmin = userContext.role === 'admin' || userContext.eduRole === 'teacher' || userContext.codeId === '0000';
      if (!isTeacherOrAdmin) {
        throw EduSpaceError.forbidden('Only teachers or administrators can author exams');
      }

      const examData = body.exam || body;
      if (!examData || !examData.title?.trim()) {
        throw EduSpaceError.validation('Exam title is required');
      }

      const examId = examData.id || `exam_${Date.now()}_${Math.floor(Math.random() * 1e4).toString(36)}`;
      const nowStr = new Date().toISOString();

      // Keep this V3 exam and its versioned question records in one shared-bank document.
      const questionBundles: V3QuizQuestionBundle[] = [];
      if (Array.isArray(body.questions)) {
        for (const q of body.questions) {
          if (!q.id) continue;
          const versionId = q.currentVersionId || `${q.id}_v1`;
          const versionData = q.activeVersion || {
            id: versionId,
            schemaVersion: 1,
            questionId: q.id,
            versionNumber: 1,
            content: {
              prompt: q.prompt || '',
              mediaAssets: q.mediaAssets,
              blocks: q.blocks,
              sourceSetId: q.sourceSetId,
              groupId: q.groupId,
              parts: q.parts,
              payload: q.contentPayload || {}
            },
            gradingConfig: {
              payload: q.gradingPayload || {},
              explanation: q.explanation,
              rubricGuide: q.rubricGuide
            },
            createdByCodeId: userContext.codeId,
            createdAt: nowStr
          };
          const questionEntity = {
            id: q.id,
            schemaVersion: 1 as const,
            authorCodeId: userContext.codeId,
            type: q.type || 'single_choice',
            subjectId: examData.subjectId || 'general',
            grade: examData.grade || 10,
            learningObjectiveIds: q.learningObjectiveIds || [],
            cognitiveLevel: q.cognitiveLevel || 'recognition',
            difficultyScore: q.difficultyScore || 1,
            tags: q.tags || [],
            currentVersionId: versionId,
            currentVersionNumber: 1,
            status: 'draft' as const,
            createdAt: nowStr,
            updatedAt: nowStr
          };
          questionBundles.push({ question: questionEntity, version: versionData });
        }
      }

      const canonicalExam = {
        id: examId,
        schemaVersion: 1 as const,
        title: examData.title.trim(),
        description: examData.description || '',
        subjectId: examData.subjectId || 'general',
        grade: examData.grade || 10,
        examType: examData.examType || 'custom',
        visibility: examData.visibility || 'classroom',
        moderationStatus: examData.moderationStatus || 'draft',
        status: examData.status || 'active',
        durationMinutes: Number(examData.durationMinutes) || 45,
        totalPoints: Number(examData.totalPoints) || 10,
        passPoints: Number(examData.passPoints) || 5,
        mode: examData.mode || 'full',
        sections: examData.sections || [],
        sourceSets: examData.sourceSets || [],
        questionGroups: examData.questionGroups || [],
        choiceGroups: examData.choiceGroups || [],
        questionPools: examData.questionPools || [],
        blueprint: examData.blueprint,
        policy: examData.policy || {
          allowReviewAfterSubmit: true,
          shuffleQuestions: false,
          shuffleOptions: false,
          maxAttempts: 1,
          showExplanationsImmediately: false,
          requireContinuousFocus: false,
          allowRetake: false
        },
        creatorCodeId: userContext.codeId,
        createdAt: examData.createdAt || nowStr,
        updatedAt: nowStr
      };

      if (!sharedQuizRepo.saveV3Bundle) {
        throw EduSpaceError.internal('The shared quiz repository cannot save V3 exam bundles');
      }
      await sharedQuizRepo.saveV3Bundle(canonicalExam, questionBundles);

      sendJson(res, 200, {
        success: true,
        examId,
        message: 'Đề thi đã được lưu thành công'
      });
      return;
    }

    // Route 8: GET /api/v3/author/exams/:id
    const authorExamMatch = pathname.match(/^\/api\/v3\/author\/exams\/([^/]+)$/);
    if (method === 'GET' && authorExamMatch) {
      const examId = authorExamMatch[1];
      const exam = await authorExamRepo.getById(examId);
      if (!exam) {
        throw EduSpaceError.notFound(`Exam not found: ${examId}`);
      }
      const canManageExam = userContext.role === 'admin' || userContext.eduRole === 'teacher' ||
        userContext.adminLevel === 'owner' || userContext.codeId === '0000' || userContext.codeId === exam.creatorCodeId;
      if (!canManageExam) throw EduSpaceError.forbidden('Only the exam author or an administrator can view answer keys');

      // Fetch referenced questions with version content for visual editor
      const questionsWithVersions: any[] = [];
      for (const section of exam.sections || []) {
        for (const qRef of section.questions || []) {
          const q = await authorQuestionRepo.getById(qRef.questionId);
          const v = await authorQuestionRepo.getVersion(qRef.questionId, qRef.questionVersionId);
          if (q && v) {
            questionsWithVersions.push({
              ...q,
              activeVersion: v,
              allocatedPoints: qRef.allocatedPoints,
              sectionId: section.id,
              choiceGroupId: qRef.choiceGroupId
            });
          }
        }
      }

      sendJson(res, 200, {
        success: true,
        exam,
        questions: questionsWithVersions
      });
      return;
    }

    // Route 9: POST /api/v3/author/validate (Validate exam blueprint & question allocations)
    if (method === 'POST' && (pathname === '/api/v3/author/validate' || pathname.startsWith('/api/v3/author/exams/'))) {
      const examToValidate = body.exam || body;
      const issues: string[] = [];
      const warnings: string[] = [];

      if (!examToValidate || typeof examToValidate !== 'object') {
        throw EduSpaceError.validation('Exam object missing');
      }

      let totalAllocated = 0;
      let questionCount = 0;
      const sections = Array.isArray(examToValidate.sections) ? examToValidate.sections : [];

      for (const sec of sections) {
        const questions = Array.isArray(sec.questions) ? sec.questions : [];
        questionCount += questions.length;
        for (const q of questions) {
          totalAllocated += Number(q.allocatedPoints || 0);
        }
      }

      const blueprintSections = examToValidate.mode === 'structured' && Array.isArray(examToValidate.blueprint?.sections)
        ? examToValidate.blueprint.sections
        : [];
      const hasBlueprintSubset = blueprintSections.some((blueprintSection: any) => {
        const sourceSection = sections.find((section: any) => section.id === blueprintSection.id);
        return sourceSection && Number(blueprintSection.questionSelection?.count) < (sourceSection.questions || []).length;
      });
      if (hasBlueprintSubset) {
        questionCount = blueprintSections.reduce(
          (sum: number, blueprintSection: any) => sum + Math.max(0, Number(blueprintSection.questionSelection?.count) || 0),
          0
        );
        totalAllocated = blueprintSections.reduce(
          (sum: number, blueprintSection: any) => sum + Math.max(0, Number(blueprintSection.totalPoints) || 0),
          0
        );
        warnings.push('Đang kiểm tra điểm của tập câu hỏi được ma trận chọn, không phải toàn bộ kho câu hỏi.');
      }

      const totalTarget = Number(examToValidate.totalPoints || 10);
      const choiceGroups = [
        ...(Array.isArray(examToValidate.choiceGroups) ? examToValidate.choiceGroups : []),
        ...sections.flatMap((s: any) => Array.isArray(s.choiceGroups) ? s.choiceGroups : [])
      ];

      if (choiceGroups.length === 0 && Math.abs(totalAllocated - totalTarget) > 0.01) {
        issues.push(`Tổng điểm các câu hỏi (${totalAllocated.toFixed(2)}) chưa khớp với điểm tối đa của đề (${totalTarget.toFixed(2)})`);
      }

      sendJson(res, 200, {
        success: true,
        valid: issues.length === 0,
        errors: issues,
        warnings,
        summary: {
          totalQuestions: questionCount,
          totalPoints: totalTarget,
          allocatedPoints: totalAllocated,
          choiceGroupsCount: choiceGroups.length,
          sourceSetsCount: (examToValidate.sourceSets || []).length
        }
      });
      return;
    }

    // Route 10: POST /api/v3/author/ai-assist (Draft generator for Teacher Authoring)
    // STRICT RULE: AI is ONLY an authoring assistant for teachers. Exam execution is 100% deterministic with NO AI!
    if (method === 'POST' && pathname === '/api/v3/author/ai-assist') {
      const isTeacherOrAdmin = userContext.role === 'admin' || userContext.eduRole === 'teacher' || userContext.codeId === '0000';
      if (!isTeacherOrAdmin) {
        throw EduSpaceError.forbidden('Only teachers can access AI authoring assistance');
      }

      const { task, subjectId, grade, topic, cognitiveLevel, prompt: userPrompt } = body;

      // Deterministic draft template generation according to GDPT 2018 Vietnamese curriculum
      const draftResult: any = {
        task: task || 'generate_questions',
        subjectId: subjectId || 'toan',
        grade: grade || 10,
        topic: topic || 'Hàm số và đồ thị',
        cognitiveLevel: cognitiveLevel || 'comprehension',
        suggestions: [
          {
            prompt: `[Bản thảo do AI gợi ý cho giáo viên] Về chủ đề: ${topic || 'Kiến thức chung'} - Cấp độ: ${cognitiveLevel || 'Thông hiểu'}`,
            type: 'single_choice',
            options: [
              { id: 'opt_a', text: 'Phương án A (Gợi ý)' },
              { id: 'opt_b', text: 'Phương án B (Gợi ý đúng)' },
              { id: 'opt_c', text: 'Phương án C (Gợi ý gây nhiễu)' },
              { id: 'opt_d', text: 'Phương án D (Gợi ý gây nhiễu)' }
            ],
            correctOptionId: 'opt_b',
            explanation: 'Giải thích chi tiết các bước giải theo chương trình GDPT 2018.',
            note: 'Giáo viên vui lòng kiểm tra và duyệt lại nội dung trước khi xuất bản.'
          }
        ]
      };

      sendJson(res, 200, {
        success: true,
        aiGeneratedDraft: draftResult,
        disclaimer: 'Bản thảo do AI hỗ trợ. Quyền thẩm định và công nhận cuối cùng thuộc về giáo viên.'
      });
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
