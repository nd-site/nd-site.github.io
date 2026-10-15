/**
 * EduSpace V3 - Classroom & Assignment Domain Models
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import type { AssignmentStatus, ClassroomRole, ExamVisibility, ModerationStatus } from '../constants/index.ts';

export interface Classroom {
  id: string;
  schemaVersion: 1;
  className: string;
  subjectId?: string;
  grade: number;
  schoolYear: string;
  schoolName?: string;
  teacherCodeId: string;
  joinCode: string;
  allowSelfEnrollment: boolean;
  memberCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomMember {
  id: string; // `${classroomId}_${studentCodeId}`
  schemaVersion: 1;
  classroomId: string;
  studentCodeId: string;
  cachedNdid: string; // Raw string preserved
  cachedDisplayName: string;
  roleInClass: ClassroomRole;
  joinedAt: string;
  status: 'active' | 'suspended';
  updatedAt: string;
}

export interface Assignment {
  id: string;
  schemaVersion: 1;
  examId: string;
  teacherCodeId: string;
  classroomId: string;
  targetStudentCodeIds?: string[];
  openTime?: string | null;
  deadlineTime?: string | null;
  timeLimitOverrideMinutes?: number | null;
  attemptLimit: number;
  isLocked: boolean;

  visibility: ExamVisibility;
  moderationStatus: ModerationStatus;

  titleOverride?: string;
  instructions?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}
