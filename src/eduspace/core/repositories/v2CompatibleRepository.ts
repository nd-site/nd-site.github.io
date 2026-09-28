/**
 * EduSpace V3 - V2 Compatibility Repositories
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-architecture.md
 * 
 * Allows EduSpace V3 to read and execute legacy V2 quizzes on-the-fly without database duplication.
 * Primary operations check V3 canonical collections first, then fallback to V2 quizzes.
 * All mutations (create, update, session, submission) target strictly canonical V3 collections.
 * 
 * READ-ONLY for legacy collections: Never mutates or writes to `quizzes` or `attempts`.
 */

import type { Exam } from '../domain/exam.ts';
import type { Question, QuestionVersion } from '../domain/question.ts';
import type {
  ExamFilter,
  ExamRepository,
  QuestionFilter,
  QuestionRepository
} from './interfaces.ts';
import { adaptLegacyV2QuizBundle } from '../normalizers/v2QuizAdapter.ts';
import type { V2QuizReader } from './v2QuizRepository.ts';
export type { V2QuizReader };

export interface V2QuizBundle {
  exam: Exam;
  questions: Map<string, Question>;
  versions: Map<string, QuestionVersion>;
}

export class V2QuizBundleCache {
  private readonly cache = new Map<string, V2QuizBundle>();

  get(examId: string): V2QuizBundle | undefined {
    return this.cache.get(examId);
  }

  set(examId: string, bundle: { exam: Exam; questions: Question[]; versions: QuestionVersion[] }): V2QuizBundle {
    const qMap = new Map<string, Question>();
    for (const q of bundle.questions) {
      qMap.set(q.id, q);
    }
    const vMap = new Map<string, QuestionVersion>();
    for (const v of bundle.versions) {
      vMap.set(v.id, v);
    }
    const entry: V2QuizBundle = {
      exam: bundle.exam,
      questions: qMap,
      versions: vMap
    };
    this.cache.set(examId, entry);
    return entry;
  }

  findQuestion(questionId: string): Question | undefined {
    for (const bundle of this.cache.values()) {
      const q = bundle.questions.get(questionId);
      if (q) return q;
    }
    return undefined;
  }

  findVersion(versionId: string): QuestionVersion | undefined {
    for (const bundle of this.cache.values()) {
      const v = bundle.versions.get(versionId);
      if (v) return v;
    }
    return undefined;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class V2CompatibleExamRepository implements ExamRepository {
  constructor(
    private readonly primaryRepo: ExamRepository,
    private readonly v2Reader: V2QuizReader,
    private readonly cache: V2QuizBundleCache = new V2QuizBundleCache()
  ) {}

  getCache(): V2QuizBundleCache {
    return this.cache;
  }

  async getById(id: string): Promise<Exam | null> {
    // 1. Check primary V3 exams collection
    const primary = await this.primaryRepo.getById(id);
    if (primary) return primary;

    // 2. Check in-memory cache
    const cached = this.cache.get(id);
    if (cached) return cached.exam;

    // 3. Fallback: read legacy quiz from Firestore 'quizzes'
    const raw = await this.v2Reader.getQuizById(id);
    if (!raw) return null;

    // 4. Adapt and cache
    const bundle = adaptLegacyV2QuizBundle(id, raw);
    this.cache.set(id, bundle);
    return bundle.exam;
  }

  async list(filter?: ExamFilter): Promise<Exam[]> {
    const primaryList = await this.primaryRepo.list(filter);
    if (primaryList && primaryList.length > 0) {
      return primaryList;
    }

    // Fallback: adapt available V2 quizzes
    const legacyList = await this.v2Reader.listQuizzes(filter?.limit || 50);
    const adaptedExams: Exam[] = [];
    for (const item of legacyList) {
      const bundle = adaptLegacyV2QuizBundle(item.id, item.data);
      this.cache.set(item.id, bundle);
      adaptedExams.push(bundle.exam);
    }
    return adaptedExams;
  }

  async create(exam: Exam): Promise<void> {
    return this.primaryRepo.create(exam);
  }

  async update(id: string, updates: Partial<Exam>): Promise<void> {
    return this.primaryRepo.update(id, updates);
  }

  async publish(id: string): Promise<void> {
    return this.primaryRepo.publish(id);
  }

  async archive(id: string): Promise<void> {
    return this.primaryRepo.archive(id);
  }
}

export class V2CompatibleQuestionRepository implements QuestionRepository {
  constructor(
    private readonly primaryRepo: QuestionRepository,
    private readonly v2Reader: V2QuizReader,
    private readonly cache: V2QuizBundleCache
  ) {}

  private extractQuizId(id: string): string | null {
    // Legacy question IDs are generated as: ${quizId}_q_${index}
    const match = id.match(/^(.+)_q_\d+/);
    return match ? match[1] : null;
  }

  async getById(id: string): Promise<Question | null> {
    // 1. Check primary V3 questions collection
    const primary = await this.primaryRepo.getById(id);
    if (primary) return primary;

    // 2. Check in-memory cache
    const cached = this.cache.findQuestion(id);
    if (cached) return cached;

    // 3. Fallback: extract quizId and fetch from V2
    const quizId = this.extractQuizId(id);
    if (quizId) {
      const raw = await this.v2Reader.getQuizById(quizId);
      if (raw) {
        const bundle = adaptLegacyV2QuizBundle(quizId, raw);
        this.cache.set(quizId, bundle);
        return this.cache.findQuestion(id) || null;
      }
    }

    return null;
  }

  async getVersion(questionId: string, versionId: string): Promise<QuestionVersion | null> {
    // 1. Check primary V3 question versions
    const primary = await this.primaryRepo.getVersion(questionId, versionId);
    if (primary) return primary;

    // 2. Check in-memory cache
    const cached = this.cache.findVersion(versionId);
    if (cached) return cached;

    // 3. Fallback: extract quizId and fetch from V2
    const quizId = this.extractQuizId(questionId) || this.extractQuizId(versionId);
    if (quizId) {
      const raw = await this.v2Reader.getQuizById(quizId);
      if (raw) {
        const bundle = adaptLegacyV2QuizBundle(quizId, raw);
        this.cache.set(quizId, bundle);
        return this.cache.findVersion(versionId) || null;
      }
    }

    return null;
  }

  async list(filter?: QuestionFilter): Promise<Question[]> {
    return this.primaryRepo.list(filter);
  }

  async create(question: Question, initialVersion: QuestionVersion): Promise<void> {
    return this.primaryRepo.create(question, initialVersion);
  }

  async addVersion(questionId: string, version: QuestionVersion): Promise<void> {
    return this.primaryRepo.addVersion(questionId, version);
  }

  async archive(id: string): Promise<void> {
    return this.primaryRepo.archive(id);
  }
}
