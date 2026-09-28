/**
 * EduSpace V3 - V2 Compatibility Repositories
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-architecture.md
 * 
 * Allows EduSpace V3 to read and execute V2 quizzes directly from the shared
 * quizzes collection without duplicating their definitions.
 * Native V3 exam mutations are saved back into that shared quiz aggregate.
 * 
 * V2 quiz payloads remain unchanged; session and result activity stays separate.
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
    // 1. Resolve every active V2/V3 exam from the shared quizzes collection.
    const cached = this.cache.get(id);
    if (cached) return cached.exam;

    const raw = await this.v2Reader.getQuizById(id);
    if (raw) {
      const bundle = adaptLegacyV2QuizBundle(id, raw);
      this.cache.set(id, bundle);
      return bundle.exam;
    }

    // Temporary read compatibility for exams saved before the shared-bank migration.
    return this.primaryRepo.getById(id);
  }

  async list(filter?: ExamFilter): Promise<Exam[]> {
    const legacyList = await this.v2Reader.listQuizzes(filter?.limit || 50);
    const adaptedExams: Exam[] = [];
    for (const item of legacyList) {
      const bundle = adaptLegacyV2QuizBundle(item.id, item.data);
      // List reads contain only catalog metadata for V3 docs; their protected
      // question versions are loaded on demand by getById().
      if (!item.data.eduspaceV3) this.cache.set(item.id, bundle);
      adaptedExams.push(bundle.exam);
    }
    if (adaptedExams.length > 0) return adaptedExams;

    // Temporary read compatibility for exams saved before the shared-bank migration.
    return this.primaryRepo.list(filter);
  }

  async create(exam: Exam): Promise<void> {
    if (!this.v2Reader.saveV3Bundle) throw new Error('Shared quiz storage is unavailable');
    await this.v2Reader.saveV3Bundle(exam, []);
  }

  async update(id: string, updates: Partial<Exam>): Promise<void> {
    const raw = await this.v2Reader.getQuizById(id);
    if (!raw?.eduspaceV3?.exam) {
      throw new Error('V2 quiz records must be edited in the V2 authoring tool');
    }
    if (!this.v2Reader.saveV3Bundle) throw new Error('Shared quiz storage is unavailable');
    const bundle = adaptLegacyV2QuizBundle(id, raw);
    const currentQuestions = (raw.eduspaceV3.questions || []) as Array<{ question: Question; version: QuestionVersion }>;
    await this.v2Reader.saveV3Bundle({ ...bundle.exam, ...updates, id }, currentQuestions);
  }

  async publish(id: string): Promise<void> {
    return this.update(id, { moderationStatus: 'approved', status: 'active' });
  }

  async archive(id: string): Promise<void> {
    return this.update(id, { status: 'archived' });
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
    // 1. Check the bundle cached when its shared quiz document was loaded.
    const cached = this.cache.findQuestion(id);
    if (cached) return cached;

    // 2. Resolve legacy V2 question IDs from their parent quiz document.
    const quizId = this.extractQuizId(id);
    if (quizId) {
      const raw = await this.v2Reader.getQuizById(quizId);
      if (raw) {
        const bundle = adaptLegacyV2QuizBundle(quizId, raw);
        this.cache.set(quizId, bundle);
        return this.cache.findQuestion(id) || null;
      }
    }

    // 3. Temporary read compatibility for pre-migration V3 questions.
    return this.primaryRepo.getById(id);
  }

  async getVersion(questionId: string, versionId: string): Promise<QuestionVersion | null> {
    // 1. Check the bundle cached when its shared quiz document was loaded.
    const cached = this.cache.findVersion(versionId);
    if (cached) return cached;

    // 2. Resolve legacy V2 versions from their parent quiz document.
    const quizId = this.extractQuizId(questionId) || this.extractQuizId(versionId);
    if (quizId) {
      const raw = await this.v2Reader.getQuizById(quizId);
      if (raw) {
        const bundle = adaptLegacyV2QuizBundle(quizId, raw);
        this.cache.set(quizId, bundle);
        return this.cache.findVersion(versionId) || null;
      }
    }

    // 3. Temporary read compatibility for pre-migration V3 question versions.
    return this.primaryRepo.getVersion(questionId, versionId);
  }

  async list(filter?: QuestionFilter): Promise<Question[]> {
    return this.primaryRepo.list(filter);
  }

  async create(question: Question, initialVersion: QuestionVersion): Promise<void> {
    throw new Error(`Question ${question.id} must be saved with its parent exam in the shared quiz bank`);
  }

  async addVersion(questionId: string, version: QuestionVersion): Promise<void> {
    throw new Error(`Question ${questionId} versions must be saved with their parent exam in the shared quiz bank`);
  }

  async archive(id: string): Promise<void> {
    throw new Error(`Question ${id} must be archived through its parent exam in the shared quiz bank`);
  }
}
