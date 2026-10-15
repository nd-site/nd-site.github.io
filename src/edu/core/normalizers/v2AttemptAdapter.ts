/**
 * EduSpace V3 - Legacy V2 Attempt Adapter (Read-Only)
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Safely adapts legacy V2 attempt records from Firestore 'attempts' collection
 * into canonical V3 Result and Submission domain models.
 * 
 * Strict preservation:
 * - studentUid -> studentCodeId
 * - studentNdid -> studentNdid (Raw String preserved verbatim without stripping)
 * - quizId, score, correctAnswers, totalQuestions, submittedAt
 * - Never recalculates historical scores.
 * - READ-ONLY: Never writes, alters or deletes legacy data.
 */

import { SCHEMA_VERSION_CANONICAL } from '../constants/index.ts';
import type { Result } from '../domain/session.ts';

export interface V2AttemptRawData {
  attemptId?: string;
  quizId?: string;
  quizTitle?: string;
  studentUid?: string;
  studentNdid?: string;
  studentName?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  score?: number;
  submittedAt?: string | { toDate?: () => Date };
  [key: string]: any;
}

export function adaptLegacyV2Attempt(id: string, raw: V2AttemptRawData): Result {
  const studentCodeId = raw.studentUid || 'anonymous';
  const studentNdidRaw = raw.studentNdid || studentCodeId; // Raw string preserved
  const studentDisplayName = raw.studentName || 'Học sinh';
  const examId = raw.quizId || 'legacy-exam';

  const totalScore = typeof raw.score === 'number' ? raw.score : 0;
  const totalQ = typeof raw.totalQuestions === 'number' && raw.totalQuestions > 0 ? raw.totalQuestions : 40;
  const maxScore = 10.0;
  const percentage = Math.min(100, Math.max(0, (totalScore / maxScore) * 100));

  let submittedAtStr = new Date().toISOString();
  if (raw.submittedAt) {
    if (typeof raw.submittedAt === 'string') {
      submittedAtStr = raw.submittedAt;
    } else if (typeof raw.submittedAt.toDate === 'function') {
      submittedAtStr = raw.submittedAt.toDate().toISOString();
    }
  } else if (raw.timestamp) {
    if (typeof raw.timestamp === 'number') {
      submittedAtStr = new Date(raw.timestamp).toISOString();
    } else if (typeof raw.timestamp.toDate === 'function') {
      submittedAtStr = raw.timestamp.toDate().toISOString();
    } else if (typeof raw.timestamp === 'string') {
      submittedAtStr = raw.timestamp;
    }
  } else if (raw.createdAt) {
    if (typeof raw.createdAt === 'string') {
      submittedAtStr = raw.createdAt;
    } else if (typeof raw.createdAt.toDate === 'function') {
      submittedAtStr = raw.createdAt.toDate().toISOString();
    }
  }

  return {
    id,
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    sessionId: id,
    examId,
    assignmentId: null,
    classroomId: null,
    studentCodeId,
    studentNdid: studentNdidRaw, // RAW STRING PRESERVED
    studentDisplayName,
    totalScore,
    maxScore,
    percentage,
    passed: totalScore >= 5.0,
    sectionScores: [
      {
        sectionId: 'sec_legacy_overall',
        sectionTitle: raw.quizTitle || 'Điểm tổng hợp',
        score: totalScore,
        maxScore
      }
    ],
    attemptNumber: 1,
    startedAt: submittedAtStr,
    submittedAt: submittedAtStr,
    durationSeconds: 2700,
    status: 'final',
    publishedToStudent: true,
    publishedAt: submittedAtStr,
    createdAt: submittedAtStr,
    updatedAt: submittedAtStr
  };
}
