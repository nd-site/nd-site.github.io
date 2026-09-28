/**
 * EduSpace V3 Beta Runner - API Client
 * Connects client frontend to server-authoritative assessment endpoints.
 */

import type { OfficialResult, SessionData, SubmittedAnswerDto } from '../types.ts';

// Static pages are served from Firebase Hosting while the server-authoritative
// assessment API is deployed on Vercel. Keep requests same-origin in local
// development so the Vite middleware can provide the isolated test backend.
const IS_LOCAL_DEVELOPMENT = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const V3_API_BASE_URL = IS_LOCAL_DEVELOPMENT
  ? ''
  : (import.meta.env.VITE_V3_API_BASE_URL || 'https://nd-puce.vercel.app');

const apiUrl = (path: string) => `${V3_API_BASE_URL}${path}`;

async function waitForFirebaseAuth(): Promise<any | null> {
  const existing = (window as any).firebaseAuth;
  if (existing) return existing;

  await new Promise<void>((resolve) => {
    window.addEventListener('firebase-ready', () => resolve(), { once: true });
    window.setTimeout(resolve, 5000);
  });
  return (window as any).firebaseAuth || null;
}

async function getFirebaseUser(auth: any): Promise<any | null> {
  if (auth?.currentUser) return auth.currentUser;
  if (!auth?.onAuthStateChanged) return null;

  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe: (() => void) | undefined;
    const finish = (user: any | null) => {
      if (settled) return;
      settled = true;
      unsubscribe?.();
      window.clearTimeout(timeout);
      resolve(user);
    };
    const timeout = window.setTimeout(() => finish(auth.currentUser || null), 5000);
    unsubscribe = auth.onAuthStateChanged((user: any) => finish(user));
    if (settled) unsubscribe?.();
  });
}

export async function getAuthToken(): Promise<string> {
  // 1. Wait for the same Firebase bootstrap used by the V2 page. The V3 React
  // bundle can execute before firebase-init.js has restored the signed-in user.
  try {
    const auth = await waitForFirebaseAuth();
    const user = await getFirebaseUser(auth);
    if (user) {
      const token = await user.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[V3ApiClient] Failed to get token from firebaseAuth:', err);
  }

  // 2. Local storage / session storage tokens
  const stored = localStorage.getItem('nd_auth_token') || sessionStorage.getItem('nd_auth_token');
  if (stored) return stored;

  // 3. The mock identity is strictly local. A deployed runner must authenticate
  // with Firebase instead of sending a token that a production backend could
  // accidentally accept.
  return IS_LOCAL_DEVELOPMENT ? 'dev_token_0000' : '';
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
    const res = await requestJson<any>(apiUrl('/api/v3/exam-sessions'), {
      method: 'POST',
      body: JSON.stringify({ examId })
    });
    return res as SessionData;
  },

  async resumeSession(sessionId: string): Promise<{ session: SessionData; savedAnswers?: Record<string, any>; selectedChoiceQuestionIds?: string[] }> {
    const res = await requestJson<any>(apiUrl(`/api/v3/exam-sessions/${sessionId}/resume`), {
      method: 'GET'
    });
    return {
      session: res as SessionData,
      savedAnswers: res.autosaveState?.answersPayload,
      selectedChoiceQuestionIds: res.autosaveState?.selectedChoiceQuestionIds
    };
  },

  async autosave(sessionId: string, answersPayload: Record<string, any>, selectedChoiceQuestionIds?: string[]): Promise<any> {
    return requestJson(apiUrl(`/api/v3/exam-sessions/${sessionId}/autosave`), {
      method: 'POST',
      body: JSON.stringify({ answersPayload, selectedChoiceQuestionIds })
    });
  },

  async submitSession(sessionId: string, answers: SubmittedAnswerDto[], selectedChoiceQuestionIds?: string[]): Promise<{ resultId: string; status: string }> {
    const res = await requestJson<any>(apiUrl(`/api/v3/exam-sessions/${sessionId}/submit`), {
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
    const res = await requestJson<any>(apiUrl(`/api/v3/results/${resultId}`), {
      method: 'GET'
    });
    return res.result as OfficialResult;
  },

  // Authoring API methods
  async saveAuthorExam(exam: any, questions?: any[]): Promise<{ success: boolean; examId: string; message: string }> {
    return requestJson(apiUrl('/api/v3/author/exams'), {
      method: 'POST',
      body: JSON.stringify({ exam, questions })
    });
  },

  async getAuthorExam(examId: string): Promise<{ success: boolean; exam: any; questions: any[] }> {
    return requestJson(apiUrl(`/api/v3/author/exams/${examId}`), {
      method: 'GET'
    });
  },

  async validateAuthorExam(exam: any): Promise<{ success: boolean; valid: boolean; errors: string[]; warnings: string[]; summary: any }> {
    return requestJson(apiUrl('/api/v3/author/validate'), {
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
    return requestJson(apiUrl('/api/v3/author/ai-assist'), {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
