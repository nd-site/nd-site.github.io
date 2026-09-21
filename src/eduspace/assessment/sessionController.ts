/**
 * EduSpace V3 Server-Authoritative Exam Session Controller
 * Source of truth: docs/eduspace-v3-api-contract.md
 * 
 * HTTP / REST / Function Dispatcher for Assessment endpoints:
 * - POST /api/v3/exam-sessions
 * - GET  /api/v3/exam-sessions/:id/resume
 * - POST /api/v3/exam-sessions/:id/autosave
 * - POST /api/v3/exam-sessions/:id/submit
 * - GET  /api/v3/results/:id
 * - POST /api/v3/grading/manual
 */

import { EduSpaceError } from '../core/errors/EduSpaceError.ts';
import type { ExamSessionService } from './sessionService.ts';
import type {
  AutosaveRequest,
  ManualGradeRequest,
  StartSessionRequest,
  SubmitSessionRequest,
  UserSecurityContext
} from './types.ts';

export interface HttpRequest {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
}

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
}

export class ExamSessionController {
  constructor(private readonly service: ExamSessionService) {}

  /**
   * Dispatches an HTTP request to the appropriate service method.
   */
  async handleRequest(
    req: HttpRequest,
    userContext?: UserSecurityContext | null
  ): Promise<HttpResponse> {
    try {
      // 1. Preflight OPTIONS
      if (req.method.toUpperCase() === 'OPTIONS') {
        return {
          statusCode: 204,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: null
        };
      }

      // Check authentication context
      if (!userContext || !userContext.codeId) {
        throw EduSpaceError.unauthenticated('Authentication token missing or invalid');
      }

      const method = req.method.toUpperCase();
      const path = req.path.split('?')[0].replace(/\/+$/, '');

      // Route 1: POST /api/v3/exam-sessions
      if (method === 'POST' && path === '/api/v3/exam-sessions') {
        const body = (req.body || {}) as StartSessionRequest;
        if (!body.examId) {
          throw EduSpaceError.validation('Missing required field: examId');
        }
        const response = await this.service.startSession(userContext, body);
        return this.json(201, response);
      }

      // Route 2: GET /api/v3/exam-sessions/:id/resume
      const resumeMatch = path.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/resume$/);
      if (method === 'GET' && resumeMatch) {
        const sessionId = resumeMatch[1];
        const response = await this.service.resumeSession(userContext, sessionId);
        return this.json(200, response);
      }

      // Route 3: POST /api/v3/exam-sessions/:id/autosave
      const autosaveMatch = path.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/autosave$/);
      if (method === 'POST' && autosaveMatch) {
        const sessionId = autosaveMatch[1];
        const body = (req.body || {}) as AutosaveRequest;
        const response = await this.service.autosave(userContext, sessionId, body);
        return this.json(200, response);
      }

      // Route 4: POST /api/v3/exam-sessions/:id/submit
      const submitMatch = path.match(/^\/api\/v3\/exam-sessions\/([^/]+)\/submit$/);
      if (method === 'POST' && submitMatch) {
        const sessionId = submitMatch[1];
        const body = (req.body || {}) as SubmitSessionRequest;
        const response = await this.service.submit(userContext, sessionId, body);
        return this.json(200, response);
      }

      // Route 5: GET /api/v3/results/:id
      const resultMatch = path.match(/^\/api\/v3\/results\/([^/]+)$/);
      if (method === 'GET' && resultMatch) {
        const resultId = resultMatch[1];
        const result = await this.service.getResult(userContext, resultId);
        return this.json(200, { success: true, result });
      }

      // Route 6: POST /api/v3/grading/manual
      if (method === 'POST' && path === '/api/v3/grading/manual') {
        const body = (req.body || {}) as ManualGradeRequest;
        if (!body.sessionId || !Array.isArray(body.scores)) {
          throw EduSpaceError.validation('Invalid manual grading payload');
        }
        const response = await this.service.manualGrade(userContext, body);
        return this.json(200, response);
      }

      // 404 Route Not Found
      return this.json(404, {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Endpoint not found: ${method} ${path}`
        }
      });
    } catch (err: any) {
      return this.handleError(err);
    }
  }

  private json(statusCode: number, data: any): HttpResponse {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: data
    };
  }

  private handleError(err: any): HttpResponse {
    if (err instanceof EduSpaceError) {
      return this.json(err.httpStatus, err.toResponse());
    }

    return this.json(500, {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err?.message || 'An internal server error occurred',
        retryAllowed: true
      }
    });
  }
}
