/**
 * EduSpace V3 - Master Canonical Normalizers
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Normalizes raw or external Firestore/API data into canonical V3 domain models.
 * - Detects schema version (legacy V2 vs canonical V3).
 * - Tolerates missing optional fields via safe defaults.
 * - Throws controlled EduSpaceError(VALIDATION_ERROR) on invalid required data instead of crashing.
 */

import { SCHEMA_VERSION_CANONICAL, type QuestionType } from '../constants/index.ts';
import { EduSpaceError } from '../errors/EduSpaceError.ts';
import { getSchemaVersion, isLegacySchema } from '../schema/version.ts';
import type { Assignment, Classroom } from '../domain/classroom.ts';
import type { Exam } from '../domain/exam.ts';
import type { Question } from '../domain/question.ts';
import type { Result } from '../domain/session.ts';
import { adaptLegacyV2Attempt } from './v2AttemptAdapter.ts';
import { adaptLegacyV2Classroom } from './v2ClassroomAdapter.ts';
import { adaptLegacyV2Question, adaptLegacyV2Quiz } from './v2QuizAdapter.ts';

/**
 * Normalizes any question data (legacy V2 or canonical V3) into a Canonical Question.
 */
export function normalizeQuestion(id: string, raw: unknown, context?: Record<string, any>): Question {
  if (!raw || typeof raw !== 'object') {
    throw EduSpaceError.validationError(`Invalid question data for id '${id}': expected non-null object`);
  }

  const rawObj = raw as Record<string, any>;

  // Check if legacy schema
  if (isLegacySchema(rawObj) || !rawObj.schemaVersion) {
    // Legacy question format
    const { question } = adaptLegacyV2Question(context?.examId || 'legacy', rawObj, context?.index ?? 0, {
      subjectId: context?.subjectId,
      grade: context?.grade
    });
    return question;
  }

  // Canonical V3 schema validation & normalization
  const prompt = rawObj.prompt || rawObj.activeVersion?.content?.prompt || rawObj.content?.prompt;
  if (!prompt && !rawObj.type) {
    throw EduSpaceError.validationError(`Question '${id}' is missing required fields (prompt/type)`);
  }

  const questionType: QuestionType = rawObj.type || 'single_choice';

  return {
    id: String(rawObj.id || id),
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    questionBankId: rawObj.questionBankId ? String(rawObj.questionBankId) : undefined,
    authorCodeId: String(rawObj.authorCodeId || '0000'),
    type: questionType,
    subjectId: String(rawObj.subjectId || context?.subjectId || 'chung'),
    grade: Number(rawObj.grade || context?.grade || 12),
    curriculumId: rawObj.curriculumId ? String(rawObj.curriculumId) : undefined,
    textbookSetId: rawObj.textbookSetId ? String(rawObj.textbookSetId) : undefined,
    topicId: rawObj.topicId ? String(rawObj.topicId) : undefined,
    learningObjectiveIds: Array.isArray(rawObj.learningObjectiveIds) ? rawObj.learningObjectiveIds.map(String) : [],
    cognitiveLevel: rawObj.cognitiveLevel || 'comprehension',
    difficultyScore: Number(rawObj.difficultyScore || 3),
    tags: Array.isArray(rawObj.tags) ? rawObj.tags.map(String) : [],
    currentVersionId: String(rawObj.currentVersionId || `${id}_v1`),
    currentVersionNumber: Number(rawObj.currentVersionNumber || 1),
    activeVersion: rawObj.activeVersion,
    status: rawObj.status || 'approved',
    createdAt: String(rawObj.createdAt || new Date().toISOString()),
    updatedAt: String(rawObj.updatedAt || new Date().toISOString())
  };
}

/**
 * Normalizes any exam data (legacy V2 quizzes collection, data.js, or canonical V3) into a Canonical Exam.
 */
export function normalizeExam(id: string, raw: unknown): Exam {
  if (!raw || typeof raw !== 'object') {
    throw EduSpaceError.validationError(`Invalid exam data for id '${id}': expected non-null object`);
  }

  const rawObj = raw as Record<string, any>;

  // Detect legacy V2 (schemaVersion missing or 0, or legacy fields present)
  if (isLegacySchema(rawObj) || rawObj.quizData || rawObj.config?.examLayout) {
    return adaptLegacyV2Quiz(id, rawObj);
  }

  // Canonical V3
  if (!rawObj.title) {
    throw EduSpaceError.validationError(`Exam '${id}' is missing required field 'title'`);
  }

  return {
    id: String(rawObj.id || id),
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    title: String(rawObj.title),
    description: String(rawObj.description || ''),
    subjectId: String(rawObj.subjectId || 'chung'),
    grade: Number(rawObj.grade || 12),
    curriculumId: rawObj.curriculumId ? String(rawObj.curriculumId) : undefined,
    textbookSetId: rawObj.textbookSetId ? String(rawObj.textbookSetId) : undefined,
    blueprintId: rawObj.blueprintId ? String(rawObj.blueprintId) : undefined,
    examType: rawObj.examType || 'periodic',
    durationMinutes: Number(rawObj.durationMinutes || 45),
    totalPoints: Number(rawObj.totalPoints || 10.0),
    passPoints: rawObj.passPoints ? Number(rawObj.passPoints) : undefined,
    sections: Array.isArray(rawObj.sections) ? rawObj.sections : [],
    visibility: rawObj.visibility || 'public',
    moderationStatus: rawObj.moderationStatus || (rawObj.visibility === 'public' ? 'approved' : 'draft'),
    creatorCodeId: String(rawObj.creatorCodeId || rawObj.creatorUid || '0000'),
    targetClassroomIds: Array.isArray(rawObj.targetClassroomIds) ? rawObj.targetClassroomIds.map(String) : undefined,
    policy: {
      shuffleQuestions: !!rawObj.policy?.shuffleQuestions,
      shuffleOptions: !!rawObj.policy?.shuffleOptions,
      maxAttempts: Number(rawObj.policy?.maxAttempts ?? 0),
      allowReviewAfterSubmit: rawObj.policy?.allowReviewAfterSubmit ?? rawObj.policy?.allowReview ?? true,
      showExplanationsImmediately: rawObj.policy?.showExplanationsImmediately ?? true,
      requireContinuousFocus: !!rawObj.policy?.requireContinuousFocus,
      allowRetake: rawObj.policy?.allowRetake ?? true
    },
    stats: rawObj.stats,
    status: rawObj.status || 'active',
    createdAt: String(rawObj.createdAt || new Date().toISOString()),
    updatedAt: String(rawObj.updatedAt || new Date().toISOString())
  };
}

/**
 * Normalizes any classroom data (legacy V2 classrooms collection or canonical V3) into a Canonical Classroom.
 */
export function normalizeClassroom(id: string, raw: unknown): Classroom {
  if (!raw || typeof raw !== 'object') {
    throw EduSpaceError.validationError(`Invalid classroom data for id '${id}': expected non-null object`);
  }

  const rawObj = raw as Record<string, any>;

  // Check for legacy V2 (has studentUids array or missing schemaVersion)
  if (isLegacySchema(rawObj) || Array.isArray(rawObj.studentUids)) {
    return adaptLegacyV2Classroom(id, rawObj);
  }

  // Canonical V3
  if (!rawObj.className) {
    throw EduSpaceError.validationError(`Classroom '${id}' is missing required field 'className'`);
  }

  return {
    id: String(rawObj.id || id),
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    className: String(rawObj.className),
    subjectId: rawObj.subjectId ? String(rawObj.subjectId) : undefined,
    grade: Number(rawObj.grade || 12),
    schoolYear: String(rawObj.schoolYear || '2025-2026'),
    schoolName: rawObj.schoolName ? String(rawObj.schoolName) : undefined,
    teacherCodeId: String(rawObj.teacherCodeId || rawObj.creatorUid || '0000'),
    joinCode: String(rawObj.joinCode || id),
    allowSelfEnrollment: rawObj.allowSelfEnrollment ?? true,
    memberCount: Number(rawObj.memberCount || 0),
    status: rawObj.status || 'active',
    createdAt: String(rawObj.createdAt || new Date().toISOString()),
    updatedAt: String(rawObj.updatedAt || new Date().toISOString())
  };
}

/**
 * Normalizes any assignment data into a Canonical Assignment.
 */
export function normalizeAssignment(id: string, raw: unknown): Assignment {
  if (!raw || typeof raw !== 'object') {
    throw EduSpaceError.validationError(`Invalid assignment data for id '${id}': expected non-null object`);
  }

  const rawObj = raw as Record<string, any>;

  if (!rawObj.examId || !rawObj.classroomId) {
    throw EduSpaceError.validationError(`Assignment '${id}' is missing required fields (examId/classroomId)`);
  }

  return {
    id: String(rawObj.id || id),
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    examId: String(rawObj.examId),
    teacherCodeId: String(rawObj.teacherCodeId || '0000'),
    classroomId: String(rawObj.classroomId),
    targetStudentCodeIds: Array.isArray(rawObj.targetStudentCodeIds) ? rawObj.targetStudentCodeIds.map(String) : undefined,
    openTime: rawObj.openTime ? String(rawObj.openTime) : null,
    deadlineTime: rawObj.deadlineTime ? String(rawObj.deadlineTime) : null,
    timeLimitOverrideMinutes: rawObj.timeLimitOverrideMinutes ? Number(rawObj.timeLimitOverrideMinutes) : null,
    attemptLimit: Number(rawObj.attemptLimit ?? 1),
    isLocked: !!rawObj.isLocked,
    visibility: rawObj.visibility || 'classroom',
    moderationStatus: rawObj.moderationStatus || 'approved',
    titleOverride: rawObj.titleOverride ? String(rawObj.titleOverride) : undefined,
    instructions: rawObj.instructions ? String(rawObj.instructions) : undefined,
    status: rawObj.status || 'active',
    createdAt: String(rawObj.createdAt || new Date().toISOString()),
    updatedAt: String(rawObj.updatedAt || new Date().toISOString())
  };
}

/**
 * Normalizes any result data (legacy V2 attempts or canonical V3) into a Canonical Result.
 */
export function normalizeResult(id: string, raw: unknown): Result {
  if (!raw || typeof raw !== 'object') {
    throw EduSpaceError.validationError(`Invalid result data for id '${id}': expected non-null object`);
  }

  const rawObj = raw as Record<string, any>;

  // Check for legacy V2 attempts
  if (isLegacySchema(rawObj) || rawObj.studentUid || typeof rawObj.correctAnswers === 'number') {
    return adaptLegacyV2Attempt(id, rawObj);
  }

  // Canonical V3
  if (typeof rawObj.totalScore !== 'number') {
    throw EduSpaceError.validationError(`Result '${id}' is missing required field 'totalScore'`);
  }

  return {
    id: String(rawObj.id || id),
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    sessionId: String(rawObj.sessionId || id),
    examId: String(rawObj.examId || 'unknown-exam'),
    assignmentId: rawObj.assignmentId ? String(rawObj.assignmentId) : null,
    classroomId: rawObj.classroomId ? String(rawObj.classroomId) : null,
    studentCodeId: String(rawObj.studentCodeId || '0000'),
    studentNdid: String(rawObj.studentNdid || rawObj.studentCodeId || 'unknown'), // RAW STRING PRESERVED
    studentDisplayName: String(rawObj.studentDisplayName || 'Học sinh'),
    totalScore: Number(rawObj.totalScore),
    maxScore: Number(rawObj.maxScore || 10.0),
    percentage: Number(rawObj.percentage || ((rawObj.totalScore / (rawObj.maxScore || 10.0)) * 100)),
    passed: rawObj.passed ?? (rawObj.totalScore >= 5.0),
    sectionScores: Array.isArray(rawObj.sectionScores) ? rawObj.sectionScores : [],
    attemptNumber: Number(rawObj.attemptNumber || 1),
    startedAt: String(rawObj.startedAt || new Date().toISOString()),
    submittedAt: String(rawObj.submittedAt || new Date().toISOString()),
    durationSeconds: Number(rawObj.durationSeconds || 2700),
    status: rawObj.status || 'final',
    publishedToStudent: rawObj.publishedToStudent ?? true,
    publishedAt: rawObj.publishedAt ? String(rawObj.publishedAt) : null,
    createdAt: String(rawObj.createdAt || new Date().toISOString()),
    updatedAt: String(rawObj.updatedAt || new Date().toISOString())
  };
}
