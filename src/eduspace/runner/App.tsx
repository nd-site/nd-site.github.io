import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v3ApiClient } from './services/v3ApiClient.ts';
import type { OfficialResult, SanitizedQuestion, SessionData, SubmittedAnswerDto, SourceSet, ChoiceGroup } from './types.ts';
import { Header } from './components/Header.tsx';
import { QuestionMap } from './components/QuestionMap.tsx';
import { QuestionCard } from './components/QuestionCard.tsx';
import { SubmitConfirmModal } from './components/SubmitConfirmModal.tsx';
import { ResultView } from './components/ResultView.tsx';
import { SourceContextPanel } from './components/SourceContextPanel.tsx';
import { AlertCircle, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [examId, setExamId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [session, setSession] = useState<SessionData | null>(null);
  const [result, setResult] = useState<OfficialResult | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [selectedChoiceQuestionIds, setSelectedChoiceQuestionIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Parse URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('examId') || 'A111';
    const resultParam = params.get('resultId');
    const sessionParam = params.get('sessionId');

    setExamId(idParam);

    if (resultParam) {
      loadResult(resultParam);
    } else if (sessionParam) {
      resumeSession(sessionParam);
    } else if (idParam) {
      initSession(idParam);
    } else {
      setIsLoading(false);
      setErrorMessage('Không tìm thấy mã đề thi hợp lệ.');
    }
  }, []);

  async function loadResult(resId: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await v3ApiClient.getResult(resId);
      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải kết quả bài thi.');
    } finally {
      setIsLoading(false);
    }
  }

  async function resumeSession(sId: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await v3ApiClient.resumeSession(sId);
      setSession(data.session);
      setSessionId(data.session.sessionId);
      if (data.savedAnswers) {
        setAnswers(data.savedAnswers);
      }
      if (Array.isArray(data.selectedChoiceQuestionIds)) {
        setSelectedChoiceQuestionIds(data.selectedChoiceQuestionIds);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể khôi phục phiên làm bài.');
    } finally {
      setIsLoading(false);
    }
  }

  async function initSession(id: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await v3ApiClient.startSession(id);
      setSession(data);
      setSessionId(data.sessionId);

      // Default select required count questions for each choiceGroup
      const defaultChoiceIds: string[] = [];
      const choiceGroups = [
        ...(data.exam.choiceGroups || []),
        ...(data.exam.sections || []).flatMap((s: any) => s.choiceGroups || [])
      ];
      for (const cg of choiceGroups) {
        const required = cg.requiredCount || 1;
        const candidates = cg.questionIds || [];
        defaultChoiceIds.push(...candidates.slice(0, required));
      }
      setSelectedChoiceQuestionIds(defaultChoiceIds);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể khởi tạo phiên thi.');
    } finally {
      setIsLoading(false);
    }
  }

  // Flatten questions from all sections
  const allQuestions: SanitizedQuestion[] = useMemo(() => {
    if (!session?.exam?.sections) return [];
    return session.exam.sections.flatMap((sec) => sec.questions);
  }, [session]);

  const currentQuestion = allQuestions[currentIndex] || null;

  // Collect all Choice Groups
  const allChoiceGroups: ChoiceGroup[] = useMemo(() => {
    if (!session?.exam) return [];
    return [
      ...(session.exam.choiceGroups || []),
      ...(session.exam.sections || []).flatMap((s) => s.choiceGroups || [])
    ];
  }, [session]);

  // Current question choiceGroup details
  const currentChoiceGroup = useMemo(() => {
    if (!currentQuestion?.choiceGroupId) return null;
    return allChoiceGroups.find((cg) => cg.id === currentQuestion.choiceGroupId) || null;
  }, [currentQuestion, allChoiceGroups]);

  const isCurrentChoiceSelected = useMemo(() => {
    if (!currentQuestion?.choiceGroupId) return true;
    return selectedChoiceQuestionIds.includes(currentQuestion.questionId);
  }, [currentQuestion, selectedChoiceQuestionIds]);

  const selectedCountInCurrentChoiceGroup = useMemo(() => {
    if (!currentChoiceGroup) return 0;
    return (currentChoiceGroup.questionIds || []).filter((qid) => selectedChoiceQuestionIds.includes(qid)).length;
  }, [currentChoiceGroup, selectedChoiceQuestionIds]);

  // Current question sourceSet details
  const currentSourceSet: SourceSet | null = useMemo(() => {
    if (!session?.exam || !currentQuestion?.sourceSetId) return null;
    return (session.exam.sourceSets || []).find((ss) => ss.id === currentQuestion.sourceSetId) || null;
  }, [session, currentQuestion]);

  // Toggle question selection in choice group
  function handleToggleChoiceSelect() {
    if (!currentQuestion || !currentChoiceGroup) return;
    const qid = currentQuestion.questionId;
    setSelectedChoiceQuestionIds((prev) => {
      const next = prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid];
      triggerAutosave(answers, next);
      return next;
    });
  }

  // Answer handler
  function handleAnswerChange(newAnswer: any) {
    if (!currentQuestion) return;
    const qId = currentQuestion.questionId;
    setAnswers((prev) => {
      const updated = { ...prev, [qId]: newAnswer };
      if (currentQuestion.choiceGroupId && !selectedChoiceQuestionIds.includes(qId)) {
        setSelectedChoiceQuestionIds((choicePrev) => {
          const nextChoices = [...choicePrev, qId];
          triggerAutosave(updated, nextChoices);
          return nextChoices;
        });
      } else {
        triggerAutosave(updated, selectedChoiceQuestionIds);
      }
      return updated;
    });
  }

  // Flag toggle handler
  function handleToggleFlag() {
    if (!currentQuestion) return;
    const qId = currentQuestion.questionId;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  // Autosave with debounce
  const autosaveTimeoutRef = useRef<any>(null);
  function triggerAutosave(currentAnswers: Record<string, any>, currentChoiceIds?: string[]) {
    if (!sessionId) return;
    setAutosaveStatus('saving');
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await v3ApiClient.autosave(sessionId, currentAnswers, currentChoiceIds ?? selectedChoiceQuestionIds);
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus('error');
      }
    }, 1200);
  }

  // Count answered questions
  const answeredCount = useMemo(() => {
    return allQuestions.filter((q) => {
      const a = answers[q.questionId];
      if (a === undefined || a === null) return false;
      if (q.type === 'single_choice' || q.type === 'multiple_choice') {
        return !!a.selectedOptionId || (Array.isArray(a.selectedOptionIds) && a.selectedOptionIds.length > 0);
      }
      if (q.type === 'true_false') {
        const map = a.answers || a;
        return typeof map === 'object' && Object.keys(map).length > 0;
      }
      if (q.type === 'numeric' || q.type === 'short_answer') {
        const val = typeof a === 'object' ? (a.value ?? a.text) : a;
        return val !== undefined && val !== null && String(val).trim().length > 0;
      }
      if (q.type === 'essay') {
        const text = typeof a === 'object' ? a.text : a;
        return typeof text === 'string' && text.trim().length > 0;
      }
      if (q.type === 'multi_part' || (Array.isArray(q.parts) && q.parts.length > 0)) {
        return typeof a === 'object' && Object.keys(a).length > 0;
      }
      return false;
    }).length;
  }, [allQuestions, answers]);

  // Submit session
  async function handleSubmit() {
    if (!sessionId || !session) return;
    setIsSubmitting(true);
    try {
      const dtoArray: SubmittedAnswerDto[] = allQuestions.map((q) => ({
        questionId: q.questionId,
        questionVersionId: q.questionVersionId,
        responsePayload: answers[q.questionId] ?? null
      }));

      const submitRes = await v3ApiClient.submitSession(sessionId, dtoArray, selectedChoiceQuestionIds);
      if (submitRes.resultId) {
        const officialRes = await v3ApiClient.getResult(submitRes.resultId);
        setResult(officialRes);
      }
      setIsSubmitModalOpen(false);
    } catch (err: any) {
      alert(`Lỗi nộp bài: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <div className="text-sm font-semibold text-slate-700">Đang khởi tạo bài thi EduSpace V3 Beta...</div>
          <div className="text-xs text-slate-400">Đang chuẩn bị phiên làm bài server-authoritative</div>
        </div>
      </div>
    );
  }

  // Render Error State
  if (errorMessage && !session && !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Không thể tải bài thi</h2>
          <p className="text-xs text-slate-500 mb-6">{errorMessage}</p>
          <div className="flex gap-2 justify-center">
            <a
              href="/eduspace/v3/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về V3 Hub</span>
            </a>
            <button
              type="button"
              onClick={() => initSession(examId || 'A111')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Official Result View
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ResultView
          result={result}
          examTitle={session?.exam?.title}
          onRetake={() => {
            setResult(null);
            setSession(null);
            setAnswers({});
            setFlaggedIds(new Set());
            initSession(examId || 'A111');
          }}
        />
      </div>
    );
  }

  // Render Active Exam Taking Runner
  if (session && currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header
          title={session.exam.title}
          expiresAt={session.expiresAt}
          serverNow={session.serverNow}
          autosaveStatus={autosaveStatus}
          answeredCount={answeredCount}
          totalQuestions={allQuestions.length}
          onSubmitClick={() => setIsSubmitModalOpen(true)}
          onTimerExpire={() => handleSubmit()}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left: Question Card & Shared Context (3 cols) */}
            <div className="lg:col-span-3">
              {currentSourceSet && (
                <SourceContextPanel sourceSet={currentSourceSet} />
              )}

              <QuestionCard
                question={currentQuestion}
                index={currentIndex}
                total={allQuestions.length}
                currentAnswer={answers[currentQuestion.questionId]}
                isFlagged={flaggedIds.has(currentQuestion.questionId)}
                choiceGroup={currentChoiceGroup}
                isChoiceSelected={isCurrentChoiceSelected}
                selectedCountInChoiceGroup={selectedCountInCurrentChoiceGroup}
                onToggleChoiceSelect={handleToggleChoiceSelect}
                onAnswerChange={handleAnswerChange}
                onToggleFlag={handleToggleFlag}
                onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                onNext={() => setCurrentIndex((prev) => Math.min(allQuestions.length - 1, prev + 1))}
              />
            </div>

            {/* Right: Question Map palette (1 col) */}
            <div className="lg:col-span-1">
              <QuestionMap
                questions={allQuestions}
                currentIndex={currentIndex}
                answers={answers}
                flaggedIds={flaggedIds}
                selectedChoiceQuestionIds={selectedChoiceQuestionIds}
                onSelectIndex={(idx) => setCurrentIndex(idx)}
              />
            </div>
          </div>
        </main>

        <SubmitConfirmModal
          isOpen={isSubmitModalOpen}
          totalQuestions={allQuestions.length}
          answeredCount={answeredCount}
          choiceGroups={allChoiceGroups}
          selectedChoiceQuestionIds={selectedChoiceQuestionIds}
          isSubmitting={isSubmitting}
          onCancel={() => setIsSubmitModalOpen(false)}
          onConfirm={handleSubmit}
        />
      </div>
    );
  }

  return null;
};
