/**
 * EduSpace V3 - Legacy V2 Quiz Adapter (Read-Only)
 * Source of truth: docs/eduspace-v3-database-schema.md
 * 
 * Safely parses and adapts legacy V2 quiz documents (from Firestore 'quizzes' collection
 * or static data.js files) into canonical V3 Exam, Question, and QuestionVersion domain models.
 * 
 * READ-ONLY: Never writes, alters or deletes legacy data.
 */

import { SCHEMA_VERSION_CANONICAL, type QuestionType } from '../constants/index.ts';
import type { Exam, ExamSection, ExamSectionQuestionRef } from '../domain/exam.ts';
import type { ExamBlueprintSpecification } from '../domain/assessmentStructure.ts';
import type { Question, QuestionVersion } from '../domain/question.ts';

export interface V2QuizRawQuestion {
  type?: string; // 'multiple' | 'truefalse' | 'short' | 'essay'
  question?: string;
  options?: Array<string | { text: string; [key: string]: any }>;
  correct?: number | boolean[] | string | number[];
  correctAnswers?: boolean[];
  explanation?: string;
  points?: number;
  [key: string]: any;
}

export interface V2QuizRawData {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string | number;
  duration?: number; // In minutes (Firestore) or in config.testDuration (seconds)
  visibility?: 'public' | 'private' | 'classroom';
  creatorUid?: string;
  targetClassrooms?: string[];
  config?: {
    testDuration?: number; // In seconds
    examLayout?: Record<string, any>;
    pointsList?: number[];
  };
  examStructure?: {
    enabled?: boolean;
    counts?: {
      multiple?: number;
      truefalse?: number;
      short?: number;
      essay?: number;
      [key: string]: number | undefined;
    };
    shuffleWithinType?: boolean;
  };
  questions?: V2QuizRawQuestion[];
  quizData?: {
    title?: string;
    config?: {
      testDuration?: number;
      examLayout?: Record<string, any>;
      pointsList?: number[];
    };
    questions?: V2QuizRawQuestion[];
    examInfo?: {
      subject?: string;
      grade?: string;
      examName?: string;
      author?: string;
      school?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  examInfo?: Record<string, any>;
  createdAt?: any;
  [key: string]: any;
}

const LEGACY_MATRIX_TYPES: Record<string, QuestionType> = {
  multiple: 'single_choice',
  truefalse: 'true_false',
  short: 'short_answer',
  essay: 'essay'
};

function buildLegacyMatrixBlueprint(
  examId: string,
  raw: V2QuizRawData,
  quizData: V2QuizRawData,
  sections: ExamSection[],
  subjectId: string,
  grade: number,
  durationMinutes: number,
  totalPoints: number,
  createdAt: string
): ExamBlueprintSpecification | undefined {
  const structure = quizData.examStructure || raw.examStructure;
  if (!structure?.enabled) return undefined;

  const sectionsByType = new Map(sections.map(section => [section.questionType, section]));
  const matrixSections = Object.entries(LEGACY_MATRIX_TYPES).flatMap(([legacyType, questionType]) => {
    const section = sectionsByType.get(questionType);
    if (!section) return [];
    const requested = Number(structure.counts?.[legacyType]);
    if (!Number.isFinite(requested)) return [];
    const questionCount = Math.max(0, Math.min(section.questions.length, Math.floor(requested)));
    const totalSectionPoints = section.questions.reduce((sum, question) => sum + question.allocatedPoints, 0);
    const pointsPerQuestion = section.questions.length > 0
      ? Number((totalSectionPoints / section.questions.length).toFixed(3))
      : 0;
    return [{
      id: section.id,
      title: section.title,
      description: 'Ma trận được chuyển đổi tự động từ Edu Admin (V2).',
      sectionOrder: section.sectionOrder,
      required: questionCount > 0,
      totalPoints: Number((pointsPerQuestion * questionCount).toFixed(3)),
      questionType,
      questionSelection: {
        count: questionCount,
        pointsPerQuestion,
        strategy: structure.shuffleWithinType ? 'random' as const : 'fixed' as const,
        questionIds: section.questions.map(question => question.questionId)
      }
    }];
  });

  return {
    id: `legacy_matrix_${examId}`,
    schemaVersion: 1,
    title: `Ma trận đề ${examId}`,
    description: 'Ma trận đề V2 được dùng trực tiếp bởi bộ máy V3.',
    subjectId,
    grade,
    examType: 'periodic',
    mode: 'structured',
    durationMinutes,
    totalPoints,
    sections: matrixSections,
    creatorCodeId: raw.creatorUid || '0000',
    status: 'active',
    createdAt,
    updatedAt: createdAt
  };
}

/**
 * Maps legacy question type string to canonical QuestionType
 */
export function mapLegacyQuestionType(v2Type?: string, questionText?: string, correctVal?: unknown): QuestionType {
  const t = (v2Type || '').toLowerCase();
  if (t === 'multiple') {
    return 'single_choice';
  }
  if (t === 'truefalse') {
    return 'true_false';
  }
  if (t === 'short') {
    // If correct value looks numeric or can be parsed as float, mark as numeric
    if (typeof correctVal === 'number') return 'numeric';
    if (typeof correctVal === 'string' && !isNaN(parseFloat(correctVal.replace(',', '.')))) {
      return 'numeric';
    }
    return 'short_answer';
  }
  if (t === 'essay') {
    return 'essay';
  }
  return 'single_choice'; // Default fallback
}

/**
 * Converts a raw legacy question object into canonical Question & QuestionVersion models.
 */
export function adaptLegacyV2Question(
  examId: string,
  rawQ: V2QuizRawQuestion,
  index: number,
  context?: { subjectId?: string; grade?: number }
): { question: Question; version: QuestionVersion } {
  const questionId = `${examId}_q_${index + 1}`;
  const versionId = `${questionId}_v1`;
  const canonicalType = mapLegacyQuestionType(rawQ.type, rawQ.question || rawQ.title || rawQ.prompt, rawQ.correct ?? rawQ.answer);
  const promptText = (rawQ.question || rawQ.title || rawQ.prompt || '').trim();

  // Content Payload & Grading Payload building
  let contentPayload: Record<string, any> = {};
  let gradingPayload: Record<string, any> = {};

  if (canonicalType === 'single_choice') {
    const rawOpts = Array.isArray(rawQ.options) ? rawQ.options : (Array.isArray(rawQ.choices) ? rawQ.choices : []);
    const options = rawOpts.map((opt, i) => ({
      id: `opt_${i}`,
      text: typeof opt === 'string' ? opt : (opt?.text || String(opt))
    }));
    contentPayload = { options, shuffleOptions: false };

    const correctVal = rawQ.correct !== undefined ? rawQ.correct : (rawQ.answer !== undefined ? rawQ.answer : 0);
    const correctIdx = typeof correctVal === 'number' ? correctVal : 0;
    gradingPayload = { correctOptionId: `opt_${correctIdx}` };
  } else if (canonicalType === 'true_false') {
    const rawItems = Array.isArray(rawQ.items) ? rawQ.items : (Array.isArray(rawQ.options) ? rawQ.options : []);
    const items = rawItems.map((item, i) => ({
      id: `item_${i}`,
      text: typeof item === 'string' ? item : (item?.text || item?.content || String(item))
    }));
    contentPayload = { items };

    // V2 correct answers can be in item.isCorrect, rawQ.correctAnswers or rawQ.correct
    const rawCorrectArr = Array.isArray(rawQ.correctAnswers)
      ? rawQ.correctAnswers
      : (Array.isArray(rawQ.correct) ? rawQ.correct : []);
    
    const correctMap: Record<string, boolean> = {};
    items.forEach((item, idx) => {
      const rawItem = rawItems[idx];
      if (typeof rawItem === 'object' && rawItem !== null && typeof rawItem.isCorrect === 'boolean') {
        correctMap[item.id] = rawItem.isCorrect;
      } else if (rawCorrectArr.length > 0) {
        correctMap[item.id] = !!rawCorrectArr[idx];
      } else {
        correctMap[item.id] = true;
      }
    });

    gradingPayload = {
      correctAnswers: correctMap,
      partialScoreLadder: [0.1, 0.25, 0.5, 1.0]
    };
  } else if (canonicalType === 'numeric') {
    contentPayload = { placeholder: 'Nhập kết quả số...' };
    const numVal = rawQ.correct !== undefined ? rawQ.correct : rawQ.answer;
    const parsedNum = typeof numVal === 'number'
      ? numVal
      : parseFloat(String(numVal || '0').replace(',', '.'));
    gradingPayload = {
      exactValue: isNaN(parsedNum) ? 0 : parsedNum,
      tolerance: 0.01
    };
  } else if (canonicalType === 'short_answer') {
    contentPayload = { placeholder: 'Nhập câu trả lời ngắn...' };
    const ansVal = rawQ.correct !== undefined ? rawQ.correct : (rawQ.answer !== undefined ? rawQ.answer : '');
    gradingPayload = {
      acceptableAnswers: [String(ansVal || '').trim()],
      caseSensitive: false,
      trimWhitespace: true
    };
  } else if (canonicalType === 'essay') {
    contentPayload = { minWords: 0 };
    gradingPayload = { rubricCriteria: [] };
  }

  const version: QuestionVersion = {
    id: versionId,
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    questionId,
    versionNumber: 1,
    content: {
      prompt: promptText,
      payload: contentPayload
    },
    gradingConfig: {
      payload: gradingPayload,
      explanation: rawQ.explanation || rawQ.explain || undefined
    },
    changeSummary: 'Auto-adapted from legacy V2 quiz',
    createdByCodeId: '0000',
    createdAt: new Date().toISOString()
  };

  const question: Question = {
    id: questionId,
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    authorCodeId: '0000',
    type: canonicalType,
    subjectId: context?.subjectId || 'chung',
    grade: context?.grade || 12,
    learningObjectiveIds: [],
    cognitiveLevel: 'comprehension',
    difficultyScore: 3,
    tags: [],
    currentVersionId: versionId,
    currentVersionNumber: 1,
    activeVersion: version,
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { question, version };
}

/**
 * Adapts an entire legacy V2 quiz document into a CanonicalExam V3.
 */
export function adaptLegacyV2Quiz(id: string, raw: V2QuizRawData): Exam {
  // Extract nested quizData if present (common Firestore V2 wrapper pattern)
  const qd = raw.quizData || raw;
  const rawQuestions: V2QuizRawQuestion[] = Array.isArray(qd.questions) ? qd.questions : (Array.isArray(raw.questions) ? raw.questions : []);
  
  // Extract duration in minutes
  let durationMinutes = 45;
  if (typeof raw.duration === 'number' && raw.duration > 0) {
    durationMinutes = raw.duration;
  } else if (typeof qd.config?.testDuration === 'number' && qd.config.testDuration > 0) {
    durationMinutes = Math.max(1, Math.round(qd.config.testDuration / 60));
  } else if (typeof raw.config?.testDuration === 'number' && raw.config.testDuration > 0) {
    durationMinutes = Math.max(1, Math.round(raw.config.testDuration / 60));
  }

  // Parse subject & grade
  const subjectStr = String(raw.subject || qd.examInfo?.subject || raw.examInfo?.subject || 'chung').trim().toLowerCase();
  let gradeNum = 12;
  const rawGrade = raw.grade || qd.examInfo?.grade || raw.examInfo?.grade || raw.class;
  if (rawGrade) {
    const matched = String(rawGrade).match(/\d+/);
    if (matched) gradeNum = parseInt(matched[0], 10);
  }

  // Group questions by canonical question type into sections
  const sectionMap = new Map<QuestionType, ExamSectionQuestionRef[]>();
  let calculatedSumPoints = 0;

  rawQuestions.forEach((q, idx) => {
    const qType = mapLegacyQuestionType(q.type, q.question || q.title || q.prompt, q.correct ?? q.answer);
    if (!sectionMap.has(qType)) {
      sectionMap.set(qType, []);
    }
    const rawPoints = typeof q.points === 'number' && q.points > 0 ? q.points : (typeof q.score === 'number' && q.score > 0 ? q.score : 0.25);
    const points = Number(rawPoints.toFixed(3));
    calculatedSumPoints += points;
    sectionMap.get(qType)!.push({
      questionId: `${id}_q_${idx + 1}`,
      questionVersionId: `${id}_q_${idx + 1}_v1`,
      allocatedPoints: points,
      orderIndex: idx
    });
  });

  const sections: ExamSection[] = [];
  let secIndex = 1;
  for (const [qType, qList] of sectionMap.entries()) {
    let sectionTitle = 'Phần I: Trắc nghiệm lựa chọn';
    if (qType === 'true_false') sectionTitle = `Phần ${secIndex}: Trắc nghiệm Đúng / Sai`;
    else if (qType === 'numeric' || qType === 'short_answer') sectionTitle = `Phần ${secIndex}: Trả lời ngắn / Số học`;
    else if (qType === 'essay') sectionTitle = `Phần ${secIndex}: Tự luận`;
    else sectionTitle = `Phần ${secIndex}: Trắc nghiệm (${qType})`;

    sections.push({
      id: `sec_legacy_${secIndex}`,
      title: sectionTitle,
      sectionOrder: secIndex,
      questionType: qType,
      questions: qList
    });
    secIndex++;
  }

  if (sections.length === 0) {
    sections.push({
      id: 'sec_legacy_1',
      title: 'Phần thi',
      sectionOrder: 1,
      questionType: 'single_choice',
      questions: []
    });
  }

  const totalPoints = calculatedSumPoints > 0 ? Number(calculatedSumPoints.toFixed(2)) : 10.0;

  // Safe timestamps
  let createdAtStr = new Date().toISOString();
  if (raw.createdAt) {
    if (typeof raw.createdAt.toDate === 'function') {
      createdAtStr = raw.createdAt.toDate().toISOString();
    } else if (typeof raw.createdAt === 'string') {
      createdAtStr = raw.createdAt;
    }
  }

  const blueprint = buildLegacyMatrixBlueprint(
    id,
    raw,
    qd,
    sections,
    subjectStr,
    gradeNum,
    durationMinutes,
    totalPoints,
    createdAtStr
  );

  return {
    id,
    schemaVersion: SCHEMA_VERSION_CANONICAL,
    title: raw.title || qd.title || id,
    description: raw.description || qd.examInfo?.examName || '',
    subjectId: subjectStr,
    grade: gradeNum,
    examType: 'periodic',
    durationMinutes,
    totalPoints,
    sections,
    mode: blueprint ? 'structured' : 'full',
    blueprint,
    visibility: raw.visibility || 'public',
    moderationStatus: raw.visibility === 'public' ? 'approved' : 'draft',
    creatorCodeId: raw.creatorUid || '0000',
    targetClassroomIds: Array.isArray(raw.targetClassrooms) ? raw.targetClassrooms : undefined,
    policy: {
      shuffleQuestions: false,
      shuffleOptions: false,
      maxAttempts: 0,
      allowReviewAfterSubmit: true,
      showExplanationsImmediately: true,
      requireContinuousFocus: false,
      allowRetake: true
    },
    status: 'active',
    createdAt: createdAtStr,
    updatedAt: createdAtStr
  };
}

/**
 * Adapts an entire legacy V2 quiz document into an Exam bundle along with Question and QuestionVersion lists.
 */
export function adaptLegacyV2QuizBundle(
  id: string,
  raw: V2QuizRawData
): { exam: Exam; questions: Question[]; versions: QuestionVersion[] } {
  const nativeV3Bundle = raw.eduspaceV3;
  if (nativeV3Bundle?.exam) {
    const questions: Question[] = [];
    const versions: QuestionVersion[] = [];
    for (const entry of Array.isArray(nativeV3Bundle.questions) ? nativeV3Bundle.questions : []) {
      if (entry?.question) questions.push(entry.question as Question);
      if (entry?.version) versions.push(entry.version as QuestionVersion);
    }
    const exam = {
      ...(nativeV3Bundle.exam as Exam),
      title: raw.title || nativeV3Bundle.exam.title,
      description: raw.description || nativeV3Bundle.exam.description,
      subjectId: raw.subject || nativeV3Bundle.exam.subjectId,
      grade: Number(raw.grade || nativeV3Bundle.exam.grade),
      durationMinutes: Number(raw.duration || nativeV3Bundle.exam.durationMinutes),
      visibility: raw.visibility || nativeV3Bundle.exam.visibility,
      targetClassroomIds: Array.isArray(raw.targetClassrooms)
        ? raw.targetClassrooms
        : nativeV3Bundle.exam.targetClassroomIds,
      status: raw.status || nativeV3Bundle.exam.status
    } as Exam;
    return {
      exam,
      questions,
      versions
    };
  }

  const exam = adaptLegacyV2Quiz(id, raw);
  const qd = raw.quizData || raw;
  const rawQuestions: V2QuizRawQuestion[] = Array.isArray(qd.questions) ? qd.questions : (Array.isArray(raw.questions) ? raw.questions : []);

  const questions: Question[] = [];
  const versions: QuestionVersion[] = [];

  rawQuestions.forEach((rawQ, idx) => {
    const { question, version } = adaptLegacyV2Question(id, rawQ, idx, {
      subjectId: exam.subjectId,
      grade: exam.grade
    });
    questions.push(question);
    versions.push(version);
  });

  return { exam, questions, versions };
}
