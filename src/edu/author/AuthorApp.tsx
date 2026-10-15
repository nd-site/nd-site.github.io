import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Layers,
  Lightbulb,
  Music,
  Plus,
  Save,
  Send,
  Settings,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { v3ApiClient } from '../runner/services/v3ApiClient.ts';
import type { ChoiceGroup, ContentBlock, SourceSet } from '../runner/types.ts';

interface AuthorQuestion {
  id: string;
  sectionId: string;
  type: string;
  prompt: string;
  allocatedPoints: number;
  cognitiveLevel: 'recognition' | 'comprehension' | 'application' | 'high_application';
  choiceGroupId?: string;
  sourceSetId?: string;
  blocks?: ContentBlock[];
  parts?: any[];
  contentPayload: any;
  gradingPayload: any;
  explanation?: string;
}

interface AuthorSection {
  id: string;
  title: string;
  sectionOrder: number;
  questionType: string;
  description?: string;
  required?: boolean;
}

function normalizeShortDecimalAnswer(value: unknown): string {
  const raw = String(value ?? '').trim().replace(',', '.').replace(/[^0-9.\-]/g, '');
  const hasMinus = raw.startsWith('-');
  const unsigned = raw.replace(/-/g, '');
  const parts = unsigned.split('.');
  const normalized = `${hasMinus ? '-' : ''}${parts[0] || ''}${parts.length > 1 ? `.${parts.slice(1).join('')}` : ''}`;
  return normalized.slice(0, 4);
}

function isValidShortDecimalAnswer(value: unknown): boolean {
  const normalized = normalizeShortDecimalAnswer(value);
  return normalized === String(value ?? '').trim().replace(',', '.')
    && /^-?(?:\d+|\d*\.\d+)$/.test(normalized);
}

export const AuthorApp: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'questions' | 'sources' | 'choices' | 'settings'>('questions');

  // Exam Metadata
  const [examId, setExamId] = useState<string>('');
  const [title, setTitle] = useState<string>('Đề thi Khảo sát Năng lực GDPT 2018');
  const [description, setDescription] = useState<string>('Đề thi chuẩn hóa theo ma trận năng lực');
  const [subjectId, setSubjectId] = useState<string>('toan');
  const [grade, setGrade] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [totalPoints, setTotalPoints] = useState<number>(10);
  const [mode, setMode] = useState<'full' | 'structured'>('structured');
  const [blueprintCounts, setBlueprintCounts] = useState<Record<string, number>>({});
  const [blueprintShuffle, setBlueprintShuffle] = useState<boolean>(true);

  // Core Assessment Entities
  const [sections, setSections] = useState<AuthorSection[]>([
    { id: 'sec_1', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', sectionOrder: 1, questionType: 'single_choice' },
    { id: 'sec_2', title: 'Phần II. Trắc nghiệm Đúng / Sai', sectionOrder: 2, questionType: 'true_false' },
    { id: 'sec_3', title: 'Phần III. Tự chọn / Trả lời ngắn', sectionOrder: 3, questionType: 'short_answer' }
  ]);

  const [questions, setQuestions] = useState<AuthorQuestion[]>([
    {
      id: 'q_1',
      sectionId: 'sec_1',
      type: 'single_choice',
      prompt: 'Cho hàm số y = f(x) có bảng biến thiên như hình vẽ. Hàm số đồng biến trên khoảng nào?',
      allocatedPoints: 0.25,
      cognitiveLevel: 'recognition',
      contentPayload: {
        options: [
          { id: 'a', text: '(-∞; 0)' },
          { id: 'b', text: '(0; 2)' },
          { id: 'c', text: '(2; +∞)' },
          { id: 'd', text: '(-1; 1)' }
        ]
      },
      gradingPayload: { correctOptionId: 'b' },
      explanation: 'Dựa vào bảng biến thiên, f\'(x) > 0 trên (0; 2).'
    }
  ]);

  const [sourceSets, setSourceSets] = useState<SourceSet[]>([]);
  const [choiceGroups, setChoiceGroups] = useState<ChoiceGroup[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [aiCognitiveLevel, setAiCognitiveLevel] = useState<string>('comprehension');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiGeneratedDrafts, setAiGeneratedDrafts] = useState<any[]>([]);

  // Validation modal
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Initialize from existing exam if ?id= is given
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const existingId = params.get('id');
    if (existingId) {
      setExamId(existingId);
      loadExamForAuthoring(existingId);
    } else {
      setExamId(`exam_${Date.now().toString(36)}`);
    }
  }, []);

  async function loadExamForAuthoring(id: string) {
    try {
      const data = await v3ApiClient.getAuthorExam(id);
      if (data?.exam) {
        setTitle(data.exam.title || '');
        setDescription(data.exam.description || '');
        setSubjectId(data.exam.subjectId || 'toan');
        setGrade(data.exam.grade || 10);
        setDurationMinutes(data.exam.durationMinutes || 45);
        setTotalPoints(data.exam.totalPoints || 10);
        setMode(data.exam.mode || 'full');
        if (Array.isArray(data.exam.blueprint?.sections)) {
          setBlueprintCounts(Object.fromEntries(data.exam.blueprint.sections.map((section: any) => [
            section.id,
            Math.max(0, Number(section.questionSelection?.count) || 0)
          ])));
          setBlueprintShuffle(data.exam.blueprint.sections.some(
            (section: any) => section.questionSelection?.strategy !== 'fixed'
          ));
        }
        if (Array.isArray(data.exam.sections)) {
          setSections(data.exam.sections);
        }
        if (Array.isArray(data.exam.sourceSets)) {
          setSourceSets(data.exam.sourceSets);
        }
        if (Array.isArray(data.exam.choiceGroups)) {
          setChoiceGroups(data.exam.choiceGroups);
        }
      }
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        const mappedQuestions: AuthorQuestion[] = data.questions.map((q: any) => ({
          id: q.id,
          sectionId: q.sectionId || 'sec_1',
          type: q.type || 'single_choice',
          prompt: q.activeVersion?.content?.prompt || q.prompt || '',
          allocatedPoints: q.allocatedPoints || 1.0,
          cognitiveLevel: q.cognitiveLevel || 'comprehension',
          choiceGroupId: q.choiceGroupId,
          sourceSetId: q.sourceSetId || q.activeVersion?.content?.sourceSetId,
          blocks: q.activeVersion?.content?.blocks,
          parts: q.activeVersion?.content?.parts,
          contentPayload: q.activeVersion?.content?.payload || {},
          gradingPayload: q.activeVersion?.gradingConfig?.payload || {},
          explanation: q.activeVersion?.gradingConfig?.explanation
        }));
        setQuestions(mappedQuestions);
      }
    } catch (err: any) {
      console.warn('Could not load existing exam:', err);
    }
  }

  // Calculate live effective points
  const calculatedPoints = React.useMemo(() => {
    let total = 0;
    const handledGroups = new Set<string>();

    for (const q of questions) {
      if (!q.choiceGroupId) {
        total += Number(q.allocatedPoints || 0);
      } else {
        const cg = choiceGroups.find(c => c.id === q.choiceGroupId);
        if (cg && !handledGroups.has(cg.id)) {
          handledGroups.add(cg.id);
          const groupQs = questions.filter(item => item.choiceGroupId === cg.id);
          const sumPts = groupQs.reduce((acc, curr) => acc + Number(curr.allocatedPoints || 0), 0);
          const avgPts = groupQs.length > 0 ? sumPts / groupQs.length : 0;
          total += avgPts * (cg.requiredCount || 1);
        }
      }
    }
    return Number(total.toFixed(2));
  }, [questions, choiceGroups]);

  function buildBlueprint() {
    if (mode !== 'structured') return undefined;
    const now = new Date().toISOString();
    return {
      id: `blueprint_${examId}`,
      schemaVersion: 1 as const,
      title: `Ma trận ${title || examId}`,
      description: 'Cấu trúc đề được tạo trong EduSpace V3.',
      subjectId,
      grade,
      examType: 'custom',
      mode: 'structured' as const,
      durationMinutes,
      totalPoints,
      sections: sections.map(section => {
        const candidates = questions.filter(question => question.sectionId === section.id);
        const requested = blueprintCounts[section.id];
        const count = Math.max(0, Math.min(candidates.length, Number.isFinite(requested) ? Math.floor(requested) : candidates.length));
        const averagePoints = candidates.length > 0
          ? candidates.reduce((sum, question) => sum + Number(question.allocatedPoints || 0), 0) / candidates.length
          : 0;
        return {
          id: section.id,
          title: section.title,
          description: section.description,
          sectionOrder: section.sectionOrder,
          required: count > 0,
          totalPoints: Number((averagePoints * count).toFixed(3)),
          questionType: section.questionType,
          questionSelection: {
            count,
            pointsPerQuestion: Number(averagePoints.toFixed(3)),
            strategy: blueprintShuffle ? 'random' as const : 'fixed' as const,
            questionIds: candidates.map(question => question.id)
          }
        };
      }),
      creatorCodeId: 'current-user',
      status: 'active' as const,
      createdAt: now,
      updatedAt: now
    };
  }

  // Add Question
  function handleAddQuestion(sectionId: string, type: string = 'single_choice') {
    const newQ: AuthorQuestion = {
      id: `q_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`,
      sectionId,
      type,
      prompt: 'Nội dung câu hỏi mới...',
      allocatedPoints: type === 'true_false' ? 1.0 : (type === 'essay' ? 2.0 : 0.25),
      cognitiveLevel: 'comprehension',
      contentPayload: type === 'single_choice' ? {
        options: [
          { id: 'a', text: 'Phương án A' },
          { id: 'b', text: 'Phương án B' },
          { id: 'c', text: 'Phương án C' },
          { id: 'd', text: 'Phương án D' }
        ]
      } : (type === 'true_false' ? {
        items: [
          { id: 'a', text: 'Ý a' },
          { id: 'b', text: 'Ý b' },
          { id: 'c', text: 'Ý c' },
          { id: 'd', text: 'Ý d' }
        ]
      } : {}),
      gradingPayload: type === 'single_choice' ? { correctOptionId: 'a' } : (
        type === 'true_false' ? {
          correctAnswers: { a: true, b: false, c: true, d: false },
          partialScoreLadder: [0.1, 0.25, 0.5, 1.0]
        } : (type === 'short_answer' ? {
          acceptableAnswers: ['0'],
          caseSensitive: false,
          trimWhitespace: true
        } : {})
      )
    };
    setQuestions([...questions, newQ]);
  }

  // Duplicate Question
  function handleDuplicateQuestion(q: AuthorQuestion) {
    const clone: AuthorQuestion = {
      ...JSON.parse(JSON.stringify(q)),
      id: `q_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`,
      prompt: `${q.prompt} (Bản sao)`
    };
    setQuestions([...questions, clone]);
  }

  // Delete Question
  function handleDeleteQuestion(id: string) {
    setQuestions(questions.filter(q => q.id !== id));
  }

  // Save Exam
  async function handleSaveExam() {
    const invalidShortQuestionIndex = questions.findIndex(question =>
      question.type === 'short_answer'
      && !isValidShortDecimalAnswer(question.gradingPayload?.acceptableAnswers?.[0])
    );
    if (invalidShortQuestionIndex >= 0) {
      alert(`Câu ${invalidShortQuestionIndex + 1}: đáp án trả lời ngắn phải là số thập phân, tối đa 4 ký tự.`);
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const examPayload = {
        id: examId,
        title,
        description,
        subjectId,
        grade,
        durationMinutes,
        totalPoints,
        mode,
        blueprint: buildBlueprint(),
        sections: sections.map(s => ({
          ...s,
          questions: questions
            .filter(q => q.sectionId === s.id)
            .map((q, idx) => ({
              questionId: q.id,
              questionVersionId: `${q.id}_v1`,
              allocatedPoints: q.allocatedPoints,
              orderIndex: idx,
              choiceGroupId: q.choiceGroupId,
              sourceSetId: q.sourceSetId
            }))
        })),
        sourceSets,
        choiceGroups
      };

      const questionEntities = questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        type: q.type,
        cognitiveLevel: q.cognitiveLevel,
        difficultyScore: 2,
        allocatedPoints: q.allocatedPoints,
        sourceSetId: q.sourceSetId,
        choiceGroupId: q.choiceGroupId,
        blocks: q.blocks,
        parts: q.parts,
        contentPayload: q.contentPayload,
        gradingPayload: q.gradingPayload,
        explanation: q.explanation
      }));

      const res = await v3ApiClient.saveAuthorExam(examPayload, questionEntities);
      setSaveSuccessMsg(res.message || 'Lưu đề thi thành công!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Lỗi lưu đề thi: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  // Validate Exam
  async function handleValidateExam() {
    setIsValidating(true);
    try {
      const examPayload = {
        id: examId,
        title,
        durationMinutes,
        totalPoints,
        mode,
        blueprint: buildBlueprint(),
        sections: sections.map(s => ({
          ...s,
          questions: questions
            .filter(q => q.sectionId === s.id)
            .map(q => ({
              questionId: q.id,
              questionVersionId: `${q.id}_v1`,
              allocatedPoints: q.allocatedPoints,
              choiceGroupId: q.choiceGroupId
            }))
        })),
        sourceSets,
        choiceGroups
      };

      const rep = await v3ApiClient.validateAuthorExam(examPayload);
      setValidationReport(rep);
    } catch (err: any) {
      alert(`Lỗi kiểm tra: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  }

  // AI Assist Draft
  async function handleGenerateAiDraft() {
    setIsAiGenerating(true);
    try {
      const res = await v3ApiClient.aiAssistAuthor({
        task: 'generate_questions',
        subjectId,
        grade,
        topic: aiPromptTopic || 'Hàm số và đồ thị',
        cognitiveLevel: aiCognitiveLevel
      });
      if (res?.aiGeneratedDraft?.suggestions) {
        setAiGeneratedDrafts(res.aiGeneratedDraft.suggestions);
      }
    } catch (err: any) {
      alert(`Lỗi AI Assistant: ${err.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  }

  // Insert AI draft into exam
  function handleInsertAiDraft(suggestion: any) {
    const targetSection = sections[0]?.id || 'sec_1';
    const newQ: AuthorQuestion = {
      id: `q_ai_${Date.now().toString(36)}`,
      sectionId: targetSection,
      type: suggestion.type || 'single_choice',
      prompt: suggestion.prompt || 'Câu hỏi do AI gợi ý',
      allocatedPoints: 0.25,
      cognitiveLevel: (aiCognitiveLevel as any) || 'comprehension',
      contentPayload: {
        options: suggestion.options || []
      },
      gradingPayload: {
        correctOptionId: suggestion.correctOptionId || 'opt_b'
      },
      explanation: suggestion.explanation || ''
    };
    setQuestions([...questions, newQ]);
    setIsAiDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Authoring Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              V3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Soạn thảo đề thi V3</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {mode === 'structured' ? 'Theo cấu trúc ma trận' : 'Làm full đề'}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-base font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden px-1"
                placeholder="Tiêu đề đề thi..."
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/admin/edu/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 border border-violet-200 transition"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Kho đề Edu Admin</span>
            </a>
            {/* Live Point Balance Indicator */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              Math.abs(calculatedPoints - totalPoints) < 0.01
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span>Tổng: {calculatedPoints} / {totalPoints} đ</span>
              {Math.abs(calculatedPoints - totalPoints) < 0.01 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>

            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={() => setIsAiDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">AI Soạn đề</span>
            </button>

            {/* Validate Button */}
            <button
              type="button"
              disabled={isValidating}
              onClick={handleValidateExam}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              <span>Kiểm tra</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu đề thi'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'questions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Câu hỏi ({questions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sources' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ngữ liệu chung ({sourceSets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('choices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'choices' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Nhóm tự chọn ({choiceGroups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt ma trận đề</span>
          </button>
        </div>
      </header>

      {/* Main Authoring Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {saveSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: Questions & Sections Editor */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {sections.map((sec, secIdx) => {
              const secQuestions = questions.filter(q => q.sectionId === sec.id);

              return (
                <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {secIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={e => {
                          const updated = [...sections];
                          updated[secIdx].title = e.target.value;
                          setSections(updated);
                        }}
                        className="font-bold text-slate-800 text-sm md:text-base border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={sec.questionType}
                        onChange={e => {
                          const updated = [...sections];
                          updated[secIdx].questionType = e.target.value;
                          setSections(updated);
                        }}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
                      >
                        <option value="single_choice">Trắc nghiệm nhiều lựa chọn</option>
                        <option value="true_false">Trắc nghiệm Đúng/Sai 4 ý</option>
                        <option value="short_answer">Trả lời ngắn</option>
                        <option value="numeric">Điền kết quả số</option>
                        <option value="essay">Tự luận</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(sec.id, sec.questionType)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm câu hỏi</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Cards List */}
                  {secQuestions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Chưa có câu hỏi nào trong phần này. Nhấn "Thêm câu hỏi" để bắt đầu.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {secQuestions.map((q, qIdx) => (
                        <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition">
                          {/* Question Card Header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                Câu {qIdx + 1}
                              </span>
                              <select
                                value={q.cognitiveLevel}
                                onChange={e => {
                                  const updated = [...questions];
                                  const item = updated.find(x => x.id === q.id);
                                  if (item) item.cognitiveLevel = e.target.value as any;
                                  setQuestions(updated);
                                }}
                                className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700"
                              >
                                <option value="recognition">Nhận biết</option>
                                <option value="comprehension">Thông hiểu</option>
                                <option value="application">Vận dụng</option>
                                <option value="high_application">Vận dụng cao</option>
                              </select>
                              {/* Choice Group Selector */}
                              {choiceGroups.length > 0 && (
                                <select
                                  value={q.choiceGroupId || ''}
                                  onChange={e => {
                                    const updated = [...questions];
                                    const item = updated.find(x => x.id === q.id);
                                    if (item) item.choiceGroupId = e.target.value || undefined;
                                    setQuestions(updated);
                                  }}
                                  className="text-xs border border-amber-300 bg-amber-50 text-amber-800 rounded-md px-2 py-1 font-medium"
                                >
                                  <option value="">-- Không tự chọn --</option>
                                  {choiceGroups.map(cg => (
                                    <option key={cg.id} value={cg.id}>{cg.title}</option>
                                  ))}
                                </select>
                              )}
                              {/* Source Set Selector */}
                              {sourceSets.length > 0 && (
                                <select
                                  value={q.sourceSetId || ''}
                                  onChange={e => {
                                    const updated = [...questions];
                                    const item = updated.find(x => x.id === q.id);
                                    if (item) item.sourceSetId = e.target.value || undefined;
                                    setQuestions(updated);
                                  }}
                                  className="text-xs border border-indigo-300 bg-indigo-50 text-indigo-800 rounded-md px-2 py-1 font-medium"
                                >
                                  <option value="">-- Không có ngữ liệu --</option>
                                  {sourceSets.map(ss => (
                                    <option key={ss.id} value={ss.id}>{ss.title}</option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <span>Điểm:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={q.allocatedPoints}
                                  onChange={e => {
                                    const updated = [...questions];
                                    const item = updated.find(x => x.id === q.id);
                                    if (item) item.allocatedPoints = parseFloat(e.target.value) || 0;
                                    setQuestions(updated);
                                  }}
                                  className="w-16 px-1.5 py-1 text-xs border border-slate-300 rounded-md font-mono text-center bg-white"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDuplicateQuestion(q)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="Nhân bản câu hỏi"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-rose-400 hover:text-rose-600 p-1"
                                title="Xóa câu hỏi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Question Prompt Editor */}
                          <div className="mb-3">
                            <textarea
                              rows={2}
                              value={q.prompt}
                              onChange={e => {
                                const updated = [...questions];
                                const item = updated.find(x => x.id === q.id);
                                if (item) item.prompt = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder="Nhập nội dung đề bài..."
                              className="w-full text-xs md:text-sm p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Single Choice Options Editor */}
                          {q.type === 'single_choice' && (
                            <div className="space-y-2">
                              {(q.contentPayload?.options || []).map((opt: any, optIdx: number) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const isCorrect = q.gradingPayload?.correctOptionId === opt.id;

                                return (
                                  <div key={opt.id} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        const item = updated.find(x => x.id === q.id);
                                        if (item) item.gradingPayload = { correctOptionId: opt.id };
                                        setQuestions(updated);
                                      }}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                      }`}
                                      title={isCorrect ? 'Đáp án đúng' : 'Nhấp để đặt làm đáp án đúng'}
                                    >
                                      {letter}
                                    </button>
                                    <input
                                      type="text"
                                      value={opt.text}
                                      onChange={e => {
                                        const updated = [...questions];
                                        const item = updated.find(x => x.id === q.id);
                                        if (item && item.contentPayload?.options) {
                                          item.contentPayload.options[optIdx].text = e.target.value;
                                        }
                                        setQuestions(updated);
                                      }}
                                      placeholder={`Nội dung phương án ${letter}...`}
                                      className={`flex-1 px-3 py-1.5 text-xs border rounded-lg bg-white ${
                                        isCorrect ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                                      }`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* True / False Statements Editor */}
                          {q.type === 'true_false' && (
                            <div className="space-y-2">
                              {(q.contentPayload?.items || []).map((item: any, itemIdx: number) => {
                                const letter = String.fromCharCode(97 + itemIdx);
                                const currentBool = q.gradingPayload?.correctAnswers?.[item.id] ?? true;

                                return (
                                  <div key={item.id} className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                      {letter}
                                    </span>
                                    <input
                                      type="text"
                                      value={item.text}
                                      onChange={e => {
                                        const updated = [...questions];
                                        const targetQ = updated.find(x => x.id === q.id);
                                        if (targetQ && targetQ.contentPayload?.items) {
                                          targetQ.contentPayload.items[itemIdx].text = e.target.value;
                                        }
                                        setQuestions(updated);
                                      }}
                                      placeholder={`Mệnh đề ${letter}...`}
                                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...questions];
                                          const targetQ = updated.find(x => x.id === q.id);
                                          if (targetQ) {
                                            targetQ.gradingPayload.correctAnswers[item.id] = true;
                                          }
                                          setQuestions(updated);
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                          currentBool === true ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        Đúng
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...questions];
                                          const targetQ = updated.find(x => x.id === q.id);
                                          if (targetQ) {
                                            targetQ.gradingPayload.correctAnswers[item.id] = false;
                                          }
                                          setQuestions(updated);
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                          currentBool === false ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        Sai
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Short-answer key: numeric decimal, maximum four characters */}
                          {q.type === 'short_answer' && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Đáp án số thập phân <span className="font-normal text-slate-400">(tối đa 4 ký tự)</span>
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                maxLength={4}
                                pattern="-?[0-9]*[.,]?[0-9]*"
                                title="Chỉ nhập số thập phân, tối đa 4 ký tự."
                                value={normalizeShortDecimalAnswer(q.gradingPayload?.acceptableAnswers?.[0] || '')}
                                onChange={e => {
                                  const updated = [...questions];
                                  const targetQ = updated.find(x => x.id === q.id);
                                  if (targetQ) {
                                    targetQ.gradingPayload = {
                                      ...targetQ.gradingPayload,
                                      acceptableAnswers: [normalizeShortDecimalAnswer(e.target.value)],
                                      caseSensitive: false,
                                      trimWhitespace: true
                                    };
                                  }
                                  setQuestions(updated);
                                }}
                                placeholder="vd: -1.5"
                                className="w-full sm:w-72 px-3 py-2 text-xs border border-amber-300 rounded-lg bg-amber-50/40 text-amber-900 font-mono focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          )}

                          {/* Explanation field */}
                          <div className="mt-3 pt-2 border-t border-slate-200/50">
                            <input
                              type="text"
                              value={q.explanation || ''}
                              onChange={e => {
                                const updated = [...questions];
                                const item = updated.find(x => x.id === q.id);
                                if (item) item.explanation = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder="Lời giải thích / hướng dẫn chấm..."
                              className="w-full text-xs px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg bg-white/70 italic text-slate-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SourceSets (Shared reading passages & audio) */}
        {activeTab === 'sources' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Ngữ liệu dùng chung (SourceSets)</h3>
                <p className="text-xs text-slate-500">Đoạn văn đọc hiểu, file âm thanh nghe, tài liệu lịch sử dùng chung cho nhiều câu hỏi.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSource: SourceSet = {
                    id: `source_${Date.now().toString(36)}`,
                    title: 'Đoạn văn đọc hiểu mới',
                    description: 'Trích nguồn văn bản...',
                    blocks: [
                      {
                        id: `b_${Date.now()}`,
                        type: 'text',
                        content: 'Nhập nội dung đoạn trích văn bản hoặc ngữ liệu ở đây...'
                      }
                    ]
                  };
                  setSourceSets([...sourceSets, newSource]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm ngữ liệu</span>
              </button>
            </div>

            {sourceSets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Chưa có ngữ liệu dùng chung nào. Nhấn "Thêm ngữ liệu" để tạo đoạn văn hoặc audio nghe.
              </div>
            ) : (
              <div className="space-y-6">
                {sourceSets.map((ss, sIdx) => (
                  <div key={ss.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={ss.title}
                        onChange={e => {
                          const updated = [...sourceSets];
                          updated[sIdx].title = e.target.value;
                          setSourceSets(updated);
                        }}
                        className="font-bold text-sm text-slate-800 border-b border-slate-300 px-1 py-0.5 bg-white rounded-md"
                        placeholder="Tiêu đề ngữ liệu..."
                      />
                      <button
                        type="button"
                        onClick={() => setSourceSets(sourceSets.filter(item => item.id !== ss.id))}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold"
                      >
                        Xóa ngữ liệu
                      </button>
                    </div>

                    <div className="space-y-3">
                      {ss.blocks?.map((block, bIdx) => (
                        <div key={block.id} className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wider">Khối nội dung #{bIdx + 1} ({block.type})</span>
                          </div>
                          <textarea
                            rows={4}
                            value={block.content || ''}
                            onChange={e => {
                              const updated = [...sourceSets];
                              updated[sIdx].blocks[bIdx].content = e.target.value;
                              setSourceSets(updated);
                            }}
                            placeholder="Nhập nội dung khối văn bản..."
                            className="w-full text-xs font-serif leading-relaxed p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Choice Groups Manager */}
        {activeTab === 'choices' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Nhóm câu hỏi tự chọn (Choice Groups)</h3>
                <p className="text-xs text-slate-500">Cấu hình câu hỏi tùy chọn (ví dụ: học sinh chọn 2 trong 3 câu, chỉ chấm các câu được chọn).</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCg: ChoiceGroup = {
                    id: `cg_${Date.now().toString(36)}`,
                    title: 'Phần tự chọn',
                    description: 'Học sinh chọn 2 trong 3 câu hỏi sau đây.',
                    questionIds: [],
                    requiredCount: 2,
                    totalCount: 3
                  };
                  setChoiceGroups([...choiceGroups, newCg]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm nhóm tự chọn</span>
              </button>
            </div>

            {choiceGroups.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Chưa có nhóm tự chọn nào. Nhấn "Thêm nhóm tự chọn" để tạo nhóm câu hỏi 2/3 hoặc 1/2.
              </div>
            ) : (
              <div className="space-y-4">
                {choiceGroups.map((cg, cgIdx) => {
                  const candidateQuestions = questions.filter(q => q.choiceGroupId === cg.id);

                  return (
                    <div key={cg.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={cg.title}
                            onChange={e => {
                              const updated = [...choiceGroups];
                              updated[cgIdx].title = e.target.value;
                              setChoiceGroups(updated);
                            }}
                            className="font-bold text-sm text-slate-800 border-b border-slate-300 px-1 py-0.5 bg-white rounded-md w-full sm:w-80"
                            placeholder="Tiêu đề nhóm tự chọn..."
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span>Quy tắc: Chọn</span>
                            <input
                              type="number"
                              min="1"
                              value={cg.requiredCount}
                              onChange={e => {
                                const updated = [...choiceGroups];
                                updated[cgIdx].requiredCount = parseInt(e.target.value, 10) || 1;
                                setChoiceGroups(updated);
                              }}
                              className="w-12 px-1.5 py-1 text-xs border border-slate-300 rounded-md font-mono text-center bg-white"
                            />
                            <span>trong số</span>
                            <input
                              type="number"
                              min="1"
                              value={cg.totalCount}
                              onChange={e => {
                                const updated = [...choiceGroups];
                                updated[cgIdx].totalCount = parseInt(e.target.value, 10) || 1;
                                setChoiceGroups(updated);
                              }}
                              className="w-12 px-1.5 py-1 text-xs border border-slate-300 rounded-md font-mono text-center bg-white"
                            />
                            <span>câu</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setChoiceGroups(choiceGroups.filter(item => item.id !== cg.id))}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3">
                        <div className="font-semibold mb-1">Các câu hỏi thuộc nhóm này ({candidateQuestions.length} câu):</div>
                        {candidateQuestions.length === 0 ? (
                          <span className="text-slate-400 italic">Vào tab "Câu hỏi" và chọn nhóm này ở menu câu hỏi để gán.</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {candidateQuestions.map((q, idx) => (
                              <span key={q.id} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md text-[11px] font-bold">
                                Câu {idx + 1} ({q.allocatedPoints}đ)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Exam Settings & Blueprint */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Cài đặt thông tin & Ma trận đề thi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="toan">Toán học</option>
                  <option value="van">Ngữ văn</option>
                  <option value="anh">Tiếng Anh</option>
                  <option value="ly">Vật lí</option>
                  <option value="hoa">Hóa học</option>
                  <option value="sinh">Sinh học</option>
                  <option value="su">Lịch sử</option>
                  <option value="dia">Địa lí</option>
                  <option value="tin">Tin học</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(parseInt(e.target.value, 10))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tổng điểm đề thi</label>
                  <input
                    type="number"
                    step="0.5"
                    value={totalPoints}
                    onChange={e => setTotalPoints(parseFloat(e.target.value) || 10)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chế độ thực thi đề</label>
                  <select
                    value={mode}
                    onChange={e => setMode(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="structured">Theo cấu trúc ma trận (Structured)</option>
                    <option value="full">Làm full đề thi (Full)</option>
                  </select>
                </div>
              </div>

              {mode === 'structured' && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-950">Ma trận lấy câu hỏi</div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-800">
                        Mỗi lần làm bài chỉ dùng số câu đã cấu hình cho từng phần. Câu nguồn vẫn được giữ trong kho đề chung.
                      </p>
                    </div>
                    <label className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-indigo-900">
                      <input
                        type="checkbox"
                        checked={blueprintShuffle}
                        onChange={e => setBlueprintShuffle(e.target.checked)}
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Rút ngẫu nhiên
                    </label>
                  </div>

                  <div className="space-y-2">
                    {sections.map(section => {
                      const available = questions.filter(question => question.sectionId === section.id).length;
                      const configured = blueprintCounts[section.id];
                      return (
                        <label key={section.id} className="flex items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-white px-3 py-2">
                          <span className="min-w-0 text-xs font-semibold text-slate-700 truncate">{section.title}</span>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap">
                            Lấy
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={configured === undefined ? available : configured}
                              onChange={e => setBlueprintCounts(previous => ({
                                ...previous,
                                [section.id]: Math.max(0, Math.min(available, parseInt(e.target.value, 10) || 0))
                              }))}
                              className="w-14 rounded-md border border-slate-300 px-1.5 py-1 text-center font-mono text-xs text-slate-800"
                            />
                            / {available} câu
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả bài thi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  placeholder="Ghi chú thêm về cấu trúc đề, hướng dẫn học sinh..."
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Authoring Assistant Slide-over Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col border-l border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Trợ lý Soạn đề AI</h3>
                  <p className="text-[11px] text-slate-500">Hỗ trợ giáo viên soạn thảo bản thảo câu hỏi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề / Bài học</label>
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={e => setAiPromptTopic(e.target.value)}
                  placeholder="Ví dụ: Định luật II Newton, Phương trình bậc hai..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                <select
                  value={aiCognitiveLevel}
                  onChange={e => setAiCognitiveLevel(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="recognition">Nhận biết</option>
                  <option value="comprehension">Thông hiểu</option>
                  <option value="application">Vận dụng</option>
                  <option value="high_application">Vận dụng cao</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleGenerateAiDraft}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiGenerating ? 'Đang tạo bản thảo...' : 'Tạo câu hỏi gợi ý'}</span>
              </button>

              {/* Suggestions List */}
              {aiGeneratedDrafts.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bản thảo gợi ý</h4>
                  {aiGeneratedDrafts.map((sug, sIdx) => (
                    <div key={sIdx} className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-xs space-y-2">
                      <p className="font-semibold text-slate-800 leading-relaxed">{sug.prompt}</p>
                      <div className="space-y-1">
                        {(sug.options || []).map((o: any) => (
                          <div key={o.id} className={`p-1.5 rounded-md ${o.id === sug.correctOptionId ? 'bg-emerald-100 font-bold text-emerald-800' : 'bg-white'}`}>
                            {o.text}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInsertAiDraft(sug)}
                        className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Thêm vào đề thi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Result Modal */}
      {validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Kết quả kiểm tra cấu trúc đề</h3>
              <button
                type="button"
                onClick={() => setValidationReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {validationReport.valid ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cấu trúc đề thi hoàn toàn hợp lệ theo chuẩn V3!</span>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Phát hiện lỗi cấu trúc:</span>
                  </div>
                  {validationReport.errors?.map((err: string, i: number) => (
                    <div key={i} className="pl-5">• {err}</div>
                  ))}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                <div>Tổng số câu hỏi: <span className="font-bold">{validationReport.summary?.totalQuestions}</span></div>
                <div>Điểm đề thi mục tiêu: <span className="font-bold">{validationReport.summary?.totalPoints}</span></div>
                <div>Điểm đã phân bổ: <span className="font-bold">{validationReport.summary?.allocatedPoints}</span></div>
                <div>Số nhóm tự chọn: <span className="font-bold">{validationReport.summary?.choiceGroupsCount}</span></div>
                <div>Số ngữ liệu dùng chung: <span className="font-bold">{validationReport.summary?.sourceSetsCount}</span></div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setValidationReport(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
