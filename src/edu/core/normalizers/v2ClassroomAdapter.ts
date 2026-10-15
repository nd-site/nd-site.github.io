/**
 * EduSpace V3 - Legacy V2 Classroom Adapter (Read-Only)
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Safely adapts legacy V2 classroom documents from Firestore 'classrooms' collection
 * (containing flat arrays studentUids and studentNdids) into canonical V3 Classroom
 * and ClassroomMember domain models.
 * 
 * READ-ONLY: Does not modify or rewrite existing classroom documents.
 */

import { SCHEMA_VERSION_CANONICAL } from '../constants/index.ts';
import type { Classroom, ClassroomMember } from '../domain/classroom.ts';

export interface V2ClassroomRawData {
  className?: string;
  creatorUid?: string;
  studentUids?: string[];
  studentNdids?: string[];
  createdAt?: string | { toDate?: () => Date };
  [key: string]: any;
}

/**
 * Converts a legacy V2 classroom document into a canonical Classroom model.
 */
export function adaptLegacyV2Classroom(id: string, raw: V2ClassroomRawData): Classroom {
  const teacherCodeId = raw.creatorUid || '0000';
  const studentUids = Array.isArray(raw.studentUids) ? raw.studentUids : [];

  let createdAtStr = new Date().toISOString();
  if (raw.createdAt) {
    if (typeof raw.createdAt === 'string') {
      createdAtStr = raw.createdAt;
    } else if (typeof raw.createdAt.toDate === 'function') {
      createdAtStr = raw.createdAt.toDate().toISOString();
    }
  }

  return {
    id,
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    className: raw.className || `Lớp học ${id}`,
    grade: 12, // Default fallback
    schoolYear: '2025-2026',
    teacherCodeId,
    joinCode: id, // In V2, document ID is the 6-digit joinCode
    allowSelfEnrollment: true,
    memberCount: studentUids.length,
    status: 'active',
    createdAt: createdAtStr,
    updatedAt: createdAtStr
  };
}

/**
 * Derives canonical ClassroomMember records from the legacy studentUids/studentNdids arrays.
 */
export function adaptLegacyV2ClassroomMembers(classroomId: string, raw: V2ClassroomRawData): ClassroomMember[] {
  const studentUids = Array.isArray(raw.studentUids) ? raw.studentUids : [];
  const studentNdids = Array.isArray(raw.studentNdids) ? raw.studentNdids : [];
  const studentNames = Array.isArray(raw.studentNames) ? raw.studentNames : [];

  const members: ClassroomMember[] = studentUids.map((uid, index) => {
    // Preserve NDID Raw String without modification
    const rawNdid = studentNdids[index] || uid;
    const displayName = studentNames[index] || rawNdid;
    return {
      id: `${classroomId}_${uid}`,
      schemaVersion: SCHEMA_VERSION_CANONICAL,
      classroomId,
      studentCodeId: uid,
      cachedNdid: rawNdid, // RAW STRING PRESERVED
      cachedDisplayName: displayName,
      roleInClass: 'student',
      joinedAt: new Date().toISOString(),
      status: 'active',
      updatedAt: new Date().toISOString()
    };
  });

  return members;
}

/**
 * Adapts a legacy classroom and returns both the Classroom model and ClassroomMember array.
 */
export function adaptLegacyV2ClassroomBundle(
  id: string,
  raw: V2ClassroomRawData
): { classroom: Classroom; members: ClassroomMember[] } {
  const classroom = adaptLegacyV2Classroom(id, raw);
  const members = adaptLegacyV2ClassroomMembers(id, raw);
  return { classroom, members };
}

