/**
 * EduSpace V3 - Typed API Client Layer
 * Source of truth: docs/eduspace-v3-api-contract.md
 * 
 * Provides a strongly-typed HTTP client for communicating with EduSpace V3 API endpoints.
 * - Handles authentication headers via token provider.
 * - Enforces standard error handling and transforms failed responses into EduSpaceError.
 * - Client untrusted boundary: only sends permitted requests.
 */

import type { ErrorCode } from '../constants/index.ts';
import { EduSpaceError } from '../errors/EduSpaceError.ts';
import type { SubmittedAnswerItem } from '../domain/session.ts';

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => Promise<string | null>;
  fetchFn?: typeof fetch;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: unknown[];
    retryAllowed?: boolean;
  };
  [key: string]: any;
}

export class EduSpaceApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private fetchFn: typeof fetch;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.getToken = config.getToken;
    this.fetchFn = config.fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : (undefined as any));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.fetchFn) {
      throw EduSpaceError.internalError('Fetch function is not available in current environment');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (this.getToken) {
      try {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        throw EduSpaceError.unauthenticated('Failed to retrieve authentication token');
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    let response: Response;
    try {
      response = await this.fetchFn(url, {
        ...options,
        headers
      });
    } catch (networkError: any) {
      throw EduSpaceError.internalError(`Network request failed: ${networkError?.message || 'Unknown network error'}`);
    }

    let body: any;
    const text = await response.text();
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      throw EduSpaceError.internalError(`Invalid JSON response from server (${response.status})`);
    }

    if (!response.ok || body.success === false) {
      const errPayload = body.error || {};
      const code: ErrorCode = errPayload.code || this.mapHttpStatusToErrorCode(response.status);
      const message = errPayload.message || `API request failed with status ${response.status}`;
      throw new EduSpaceError({
        code,
        message,
        status: response.status,
        details: errPayload.details,
        retryAllowed: errPayload.retryAllowed ?? false
      });
    }

    return body as T;
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400: return 'VALIDATION_ERROR';
      case 401: return 'UNAUTHENTICATED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 410: return 'SESSION_EXPIRED';
      case 423: return 'SUBMISSION_CLOSED';
      case 429: return 'RATE_LIMITED';
      case 503: return 'GRADING_UNAVAILABLE';
      default: return 'INTERNAL_ERROR';
    }
  }

  // ----------------------------------------------------------------------
  // 1. Question Banks API (/api/v3/question-banks)
  // ----------------------------------------------------------------------

  async getQuestionBanks(params?: { subjectId?: string; grade?: number; scope?: string }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params?.grade) searchParams.set('grade', String(params.grade));
    if (params?.scope) searchParams.set('scope', params.scope);
    const query = searchParams.toString();
    return this.request(`/api/v3/question-banks${query ? `?${query}` : ''}`);
  }

  async createQuestionBank(data: { title: string; description?: string; subjectId: string; grade: number; scope?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/question-banks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ----------------------------------------------------------------------
  // 2. Questions API (/api/v3/questions)
  // ----------------------------------------------------------------------

  async getQuestions(params?: Record<string, any>): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    const query = searchParams.toString();
    return this.request(`/api/v3/questions${query ? `?${query}` : ''}`);
  }

  async getQuestion(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/questions/${encodeURIComponent(id)}`);
  }

  async createQuestion(data: Record<string, any>): Promise<ApiResponse<{ id: string }>> {
    return this.request('/api/v3/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createQuestionVersion(questionId: string, data: { content: any; gradingConfig: any; changeSummary?: string }): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/questions/${encodeURIComponent(questionId)}/versions`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ----------------------------------------------------------------------
  // 3. Exam Blueprints API (/api/v3/exam-blueprints)
  // ----------------------------------------------------------------------

  async createExamBlueprint(data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/api/v3/exam-blueprints', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getExamBlueprint(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/exam-blueprints/${encodeURIComponent(id)}`);
  }

  // ----------------------------------------------------------------------
  // 4. Exams API (/api/v3/exams)
  // ----------------------------------------------------------------------

  async getExams(params?: Record<string, any>): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    const query = searchParams.toString();
    return this.request(`/api/v3/exams${query ? `?${query}` : ''}`);
  }

  async getExam(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/exams/${encodeURIComponent(id)}`);
  }

  async publishExam(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/exams/${encodeURIComponent(id)}/publish`, {
      method: 'POST'
    });
  }

  // ----------------------------------------------------------------------
  // 5. Exam Sessions API (/api/v3/exam-sessions)
  // ----------------------------------------------------------------------

  async startExamSession(dto: { examId: string; assignmentId?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/exam-sessions', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  async resumeExamSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/exam-sessions/${encodeURIComponent(sessionId)}/resume`);
  }

  async autosaveExamSession(sessionId: string, answersPayload: Record<string, any>): Promise<ApiResponse<{ success: boolean; savedAt: string }>> {
    return this.request(`/api/v3/exam-sessions/${encodeURIComponent(sessionId)}/autosave`, {
      method: 'POST',
      body: JSON.stringify({ answersPayload })
    });
  }

  async submitExamSession(sessionId: string, answers: SubmittedAnswerItem[]): Promise<ApiResponse<{ success: boolean; sessionId: string; status: string; submittedAt: string }>> {
    return this.request(`/api/v3/exam-sessions/${encodeURIComponent(sessionId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  // ----------------------------------------------------------------------
  // 6. Grading & Results API (/api/v3/grading & /api/v3/results)
  // ----------------------------------------------------------------------

  async submitManualGrading(dto: {
    submissionId: string;
    questionScores: Array<{ questionId: string; awardedPoints: number; teacherFeedback?: string }>;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/grading/manual', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  async requestAiGradingAssist(dto: { submissionId: string; questionId: string }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/grading/ai-assist', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  async getResult(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/results/${encodeURIComponent(id)}`);
  }

  // ----------------------------------------------------------------------
  // 7. Classrooms & Assignments API (/api/v3/classrooms & /api/v3/assignments)
  // ----------------------------------------------------------------------

  async createClassroom(dto: {
    className: string;
    subjectId: string;
    grade: number;
    schoolYear: string;
    schoolName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/classrooms', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  async joinClassroom(joinCode: string): Promise<ApiResponse<any>> {
    return this.request('/api/v3/classrooms/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode })
    });
  }

  async createAssignment(dto: {
    examId: string;
    classroomId: string;
    targetStudentCodeIds?: string[];
    openTime?: string;
    deadlineTime?: string;
    attemptLimit?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/assignments', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  // ----------------------------------------------------------------------
  // 8. Moderation API (/api/v3/moderation)
  // ----------------------------------------------------------------------

  async getModerationQueue(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v3/moderation/queue');
  }

  async decideModeration(dto: {
    targetType: 'exam' | 'question';
    targetId: string;
    action: 'approve' | 'reject' | 'request_changes';
    reason?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v3/moderation/decide', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }
}
