/**
 * EduSpace V3 - Central Constants & Enums
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-api-contract.md
 */

// Schema versions
export const SCHEMA_VERSION_LEGACY = 0 as const;
export const SCHEMA_VERSION_CANONICAL = 1 as const;
export type SchemaVersion = typeof SCHEMA_VERSION_LEGACY | typeof SCHEMA_VERSION_CANONICAL;

// Question Types (at minimum 9 core + extensible assessment formats)
export const QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer',
  'essay',
  'matching',
  'ordering',
  'fill_blank',
  'numeric',
  // Extensible types supported by engine
  'reading_comprehension',
  'listening',
  'speaking',
  'grouped',
  'code_programming'
] as const;
export type QuestionType = typeof QUESTION_TYPES[number];

// Cognitive Levels according to GDPT 2018
export const COGNITIVE_LEVELS = [
  'recognition',     // Nhận biết
  'comprehension',   // Thông hiểu
  'application',     // Vận dụng
  'high_application' // Vận dụng cao
] as const;
export type CognitiveLevel = typeof COGNITIVE_LEVELS[number];

// Exam Types
export const EXAM_TYPES = [
  'regular',         // 15-minute / mini test
  'periodic',        // 45-minute periodic test
  'midterm',         // Midterm exam
  'final',           // Final semester exam
  'mock_thpt',       // THPT national practice exam
  'gifted',          // Gifted student exam
  'competency',      // University competency test
  'custom'           // Teacher-created custom test
] as const;
export type ExamType = typeof EXAM_TYPES[number];

// Visibility Levels
export const EXAM_VISIBILITIES = ['private', 'classroom', 'public'] as const;
export type ExamVisibility = typeof EXAM_VISIBILITIES[number];

// Moderation Statuses
export const MODERATION_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'changes_requested',
  'archived'
] as const;
export type ModerationStatus = typeof MODERATION_STATUSES[number];

// Session Statuses (Server-Authoritative State Machine)
export const SESSION_STATUSES = [
  'created',
  'in_progress',
  'submitted',
  'grading',
  'graded',
  'expired',
  'cancelled'
] as const;
export type SessionStatus = typeof SESSION_STATUSES[number];

// Grading Methods
export const GRADING_METHODS = [
  'automatic',
  'manual',
  'ai_assisted',
  'hybrid'
] as const;
export type GradingMethod = typeof GRADING_METHODS[number];

// Assignment Statuses
export const ASSIGNMENT_STATUSES = ['active', 'closed', 'archived'] as const;
export type AssignmentStatus = typeof ASSIGNMENT_STATUSES[number];

// Classroom Member Roles
export const CLASSROOM_ROLES = ['student', 'class_monitor', 'teaching_assistant'] as const;
export type ClassroomRole = typeof CLASSROOM_ROLES[number];

// Canonical Edu Roles in ND Labs users collection
export const EDU_ROLES = ['student', 'teacher', 'lecturer', 'college_student'] as const;
export type EduRole = typeof EDU_ROLES[number];

// System User Roles & Admin Levels
export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = typeof USER_ROLES[number];

export const ADMIN_LEVELS = ['owner', 'admin'] as const;
export type AdminLevel = typeof ADMIN_LEVELS[number] | null;

// Standard Error Codes
export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'SESSION_EXPIRED',
  'SUBMISSION_CLOSED',
  'GRADING_UNAVAILABLE',
  'INTERNAL_ERROR'
] as const;
export type ErrorCode = typeof ERROR_CODES[number];
