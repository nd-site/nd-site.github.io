/**
 * EduSpace V3 Beta Runner - API Client
 * Connects client frontend to server-authoritative assessment endpoints.
 */

import type { OfficialResult, SessionData, SubmittedAnswerDto } from '../types.ts';

export async function getAuthToken(): Promise<string> {
  // 1. Firebase modular / compat Auth on window
  try {
    const auth = (window as any).firebaseAuth;
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[V3ApiClient] Failed to get token from firebaseAuth:', err);
  }

  // 2. Local storage / session storage tokens
  const stored = localStorage.getItem('nd_auth_token') || sessionStorage.getItem('nd_auth_token');
  if (stored) return stored;

  // 3. Fallback dev token for testing
  return 'dev_token_0000';
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errMessage = data.error?.message || `HTTP ${response.status}: Request failed`;
    throw new Error(errMessage);
  }

  return data as T;
}

export const v3ApiClient = {
  async startSession(examId: string): Promise<SessionData> {
    const res = await requestJson<any>('/api/v3/exam-sessions', {
      method: 'POST',
      body: JSON.stringify({ examId })
    });
    return res as SessionData;
  },

  async resumeSession(sessionId: string): Promise<{ session: SessionData; savedAnswers?: Record<string, any>; selectedChoiceQuestionIds?: string[] }> {
    const res = await requestJson<any>(`/api/v3/exam-sessions/${sessionId}/resume`, {
      method: 'GET'
    });
    return {
      session: res as SessionData,
      savedAnswers: res.autosaveState?.answersPayload,
      selectedChoiceQuestionIds: res.autosaveState?.selectedChoiceQuestionIds
    };
  },

  async autosave(sessionId: string, answersPayload: Record<string, any>, selectedChoiceQuestionIds?: string[]): Promise<any> {
    return requestJson(`/api/v3/exam-sessions/${sessionId}/autosave`, {
      method: 'POST',
      body: JSON.stringify({ answersPayload, selectedChoiceQuestionIds })
    });
  },

  async submitSession(sessionId: string, answers: SubmittedAnswerDto[], selectedChoiceQuestionIds?: string[]): Promise<{ resultId: string; status: string }> {
    const res = await requestJson<any>(`/api/v3/exam-sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers,
        selectedChoiceQuestionIds,
        clientReportedTime: new Date().toISOString()
      })
    });
    return {
      resultId: res.resultId,
      status: res.status
    };
  },

  async getResult(resultId: string): Promise<OfficialResult> {
    const res = await requestJson<any>(`/api/v3/results/${resultId}`, {
      method: 'GET'
    });
    return res.result as OfficialResult;
  },

  // Authoring API methods
  async saveAuthorExam(exam: any, questions?: any[]): Promise<{ success: boolean; examId: string; message: string }> {
    return requestJson('/api/v3/author/exams', {
      method: 'POST',
      body: JSON.stringify({ exam, questions })
    });
  },

  async getAuthorExam(examId: string): Promise<{ success: boolean; exam: any; questions: any[] }> {
    return requestJson(`/api/v3/author/exams/${examId}`, {
      method: 'GET'
    });
  },

  async validateAuthorExam(exam: any): Promise<{ success: boolean; valid: boolean; errors: string[]; warnings: string[]; summary: any }> {
    return requestJson('/api/v3/author/validate', {
      method: 'POST',
      body: JSON.stringify({ exam })
    });
  },

  async aiAssistAuthor(params: {
    task?: string;
    subjectId?: string;
    grade?: number;
    topic?: string;
    cognitiveLevel?: string;
    prompt?: string;
  }): Promise<{ success: boolean; aiGeneratedDraft: any; disclaimer: string }> {
    return requestJson('/api/v3/author/ai-assist', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
