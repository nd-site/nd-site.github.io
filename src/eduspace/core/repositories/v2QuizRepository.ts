/**
 * EduSpace V3 - Legacy V2 Quiz Repository (Read-Only)
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Provides read-only access to legacy Firestore `quizzes/{quizId}` documents.
 * READ-ONLY: Never writes, alters or deletes legacy data.
 */

import type { V2QuizRawData } from '../normalizers/v2QuizAdapter.ts';
import type { FirestoreDatabase } from './firestoreRepository.ts';

export interface V2QuizReader {
  getQuizById(quizId: string): Promise<V2QuizRawData | null>;
  listQuizzes(limit?: number): Promise<Array<{ id: string; data: V2QuizRawData }>>;
}

export class FirestoreV2QuizRepository implements V2QuizReader {
  constructor(private readonly db: FirestoreDatabase) {}

  async getQuizById(quizId: string): Promise<V2QuizRawData | null> {
    if (!this.db) return null;
    try {
      const snap = await this.db.collection('quizzes').doc(quizId).get();
      if (!snap || !snap.exists) return null;
      return snap.data() as V2QuizRawData;
    } catch {
      return null;
    }
  }

  async listQuizzes(limit = 50): Promise<Array<{ id: string; data: V2QuizRawData }>> {
    if (!this.db) return [];
    try {
      let q = this.db.collection('quizzes');
      if (limit > 0) {
        q = q.limit(limit);
      }
      const snap = await q.get();
      const results: Array<{ id: string; data: V2QuizRawData }> = [];
      snap.forEach((doc: any) => {
        results.push({
          id: doc.id,
          data: doc.data() as V2QuizRawData
        });
      });
      return results;
    } catch {
      return [];
    }
  }
}
