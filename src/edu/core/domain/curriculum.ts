/**
 * EduSpace V3 - Curriculum & Taxonomy Domain Models
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import type { CognitiveLevel } from '../constants/index.ts';

export interface Subject {
  id: string;
  schemaVersion: 1;
  name: string;
  code: string;
  icon: string;
  color: string;
  applicableGrades: number[];
  orderIndex: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Curriculum {
  id: string;
  schemaVersion: 1;
  name: string;
  code: string;
  governingBody: string;
  yearEffective: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TextbookSet {
  id: string;
  schemaVersion: 1;
  curriculumId: string;
  name: string;
  shortName: string;
  publisher: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  schemaVersion: 1;
  numericLevel: number;
  name: string;
  tier: 'tieu_hoc' | 'thcs' | 'thpt';
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  schemaVersion: 1;
  subjectId: string;
  grade: number;
  curriculumId?: string;
  textbookSetId?: string;
  parentTopicId?: string | null;
  name: string;
  code?: string;
  description?: string;
  orderIndex: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface LearningObjective {
  id: string;
  schemaVersion: 1;
  subjectId: string;
  grade: number;
  topicId: string;
  code: string;
  statement: string;
  cognitiveLevel: CognitiveLevel;
  competencies: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
