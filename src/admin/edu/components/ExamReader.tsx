import React, { useState, useEffect, useRef } from 'react';
import {
  Timer as TimerIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send,
  RotateCcw,
  Sparkles,
  BookOpen,
  Layers,
  Check,
  Award,
  Paperclip,
  Upload,
  Trash2,
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import { AudioPlayer } from './AudioPlayer';
import { VideoEmbed } from './VideoEmbed';
import { RunnerResultModal } from './modals/RunnerResultModal';
import { normalizeShortDecimalAnswer } from '../services/aiService';
import type { Question, ExamStructure, PassageContext } from '../types';

interface ExamReaderProps {
  quizTitle: string;
  grade?: string;
  subject?: string;
  examType?: string;
  author?: string;
  matrixDuration: number;
  fullDuration?: number;
  structure?: ExamStructure;
  passages?: PassageContext[];
  questions: Question[];
  isStudentMode?: boolean;
  initialSamplingMode?: 'matrix' | 'full';
  initialRunnerMode?: 'practice' | 'exam';
  onBack?: () => void;
  onToast?: (msg: string, isError?: boolean) => void;
}

export const ExamReader: React.FC<ExamReaderProps> = ({
  quizTitle,
  grade,
  subject,
  examType,
  author,
  matrixDuration,
  fullDuration = 90,
  structure,
  passages = [],
  questions,
  isStudentMode = false,
  initialSamplingMode,
  initialRunnerMode,
  onBack,
  onToast,
}) => {
  const [testSamplingMode, setTestSamplingMode] = useState<'matrix' | 'full'>(
    initialSamplingMode || 'matrix'
  );
  const [runnerMode, setRunnerMode] = useState<'practice' | 'exam'>(
    initialRunnerMode || 'exam'
  );
  const [checkedPractice, setCheckedPractice] = useState<boolean[]>([]);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User answers & state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [essayAttachments, setEssayAttachments] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(matrixDuration * 60);
  const timerRef = useRef<any>(null);

  // Results
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalScore10, setFinalScore10] = useState('0.00');
  const [totalAchieved, setTotalAchieved] = useState(0);
  const [totalPossible, setTotalPossible] = useState(10);
  const [countCorrect, setCountCorrect] = useState(0);
  const [countWrong, setCountWrong] = useState(0);
  const [timeSpentStr, setTimeSpentStr] = useState('00:00');

  // Prepare questions for session
  const prepareQuestionsForSession = (
    rawList: Question[],
    struct?: ExamStructure,
    samplingMode: 'matrix' | 'full' = 'matrix'
  ): Question[] => {
    if (!rawList || rawList.length === 0) return [];

    let mList = rawList.filter((q) => q.type === 'multiple').map((q) => ({ ...q }));
    let tfList = rawList.filter((q) => q.type === 'truefalse').map((q) => ({ ...q }));
    let sList = rawList.filter((q) => q.type === 'short').map((q) => ({ ...q }));
    let matchingList = rawList.filter((q) => q.type === 'matching').map((q) => ({ ...q }));
    let clozeList = rawList.filter((q) => q.type === 'cloze').map((q) => ({ ...q }));
    let orderingList = rawList.filter((q) => q.type === 'ordering').map((q) => ({ ...q }));
    let eList = rawList.filter((q) => q.type === 'essay').map((q) => ({ ...q }));

    const shuffleArray = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    if (samplingMode === 'matrix' && struct && (struct.enabled ?? true)) {
      if (struct.shuffleWithinType) {
        mList = shuffleArray(mList);
        tfList = shuffleArray(tfList);
        sList = shuffleArray(sList);
        matchingList = shuffleArray(matchingList);
        clozeList = shuffleArray(clozeList);
        orderingList = shuffleArray(orderingList);
        eList = shuffleArray(eList);
      }
      const c = struct.counts;
      if (c) {
        if (c.multiple !== undefined && c.multiple >= 0) mList = mList.slice(0, c.multiple);
        if (c.truefalse !== undefined && c.truefalse >= 0) tfList = tfList.slice(0, c.truefalse);
        if (c.short !== undefined && c.short >= 0) sList = sList.slice(0, c.short);
        if (c.matching !== undefined && c.matching >= 0) matchingList = matchingList.slice(0, c.matching);
        if (c.cloze !== undefined && c.cloze >= 0) clozeList = clozeList.slice(0, c.cloze);
        if (c.ordering !== undefined && c.ordering >= 0) orderingList = orderingList.slice(0, c.ordering);
        if (c.essay !== undefined && c.essay >= 0) eList = eList.slice(0, c.essay);
      }
    }

    const allSelected = [
      ...mList,
      ...tfList,
      ...sList,
      ...matchingList,
      ...clozeList,
      ...orderingList,
      ...eList,
    ];

    // Group questions by passageId so questions of the same passage remain contiguous
    // If passage.shuffleQuestions is true, shuffle questions within that passage among themselves
    const passageMap = new Map<string, Question[]>();
    passages.forEach((p) => {
      let group = allSelected.filter((q) => q.passageId === p.id);
      if (group.length > 0) {
        if (p.shuffleQuestions) {
          group = shuffleArray(group);
        }
        passageMap.set(p.id, group);
      }
    });

    const resultList: Question[] = [];
    const processedPassages = new Set<string>();

    allSelected.forEach((q) => {
      if (!q.passageId) {
        resultList.push(q);
      } else if (!processedPassages.has(q.passageId)) {
        processedPassages.add(q.passageId);
        const pQuestions = passageMap.get(q.passageId) || [];
        resultList.push(...pQuestions);
      }
    });

    return resultList;
  };

  const initSession = (samplingMode: 'matrix' | 'full') => {
    const prepared = prepareQuestionsForSession(questions, structure, samplingMode);
    const duration = samplingMode === 'matrix' ? matrixDuration : fullDuration;

    setActiveQuestions(prepared);
    setCurrentIndex(0);
    const initialAnswers = prepared.map((q) => {
      if (q.type === 'ordering' && Array.isArray((q as any).items)) {
        const ids = (q as any).items.map((it: any) => it.id);
        const shuffled = [...ids];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }
      return null;
    });
    setUserAnswers(initialAnswers);
    setEssayAttachments({});
    setFlagged(new Array(prepared.length).fill(false));
    setCheckedPractice(new Array(prepared.length).fill(false));
    setIsSubmitted(false);
    setShowResultModal(false);
    setSecondsRemaining(duration * 60);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    initSession(testSamplingMode);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testSamplingMode, questions]);

  useEffect(() => {
    if (secondsRemaining === 0 && !isSubmitted && activeQuestions.length > 0) {
      if (onToast) onToast('Hết thời gian làm bài! Hệ thống tự động thu bài.', true);
      handleSubmitExam();
    }
  }, [secondsRemaining, isSubmitted, activeQuestions.length]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit and grade
  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);

    let achieved = 0;
    let possible = 0;
    let correct = 0;
    let wrong = 0;

    activeQuestions.forEach((q, idx) => {
      const qType = q.type;
      const ua = userAnswers[idx];
      const qPoints =
        q.points !== undefined
          ? Number(q.points)
          : qType === 'truefalse'
          ? 1.0
          : qType === 'short'
          ? 0.5
          : qType === 'essay'
          ? 2.0
          : 0.25;

      if (qType === 'multiple') {
        possible += qPoints;
        if (ua === q.correct) {
          achieved += qPoints;
          correct++;
        } else if (ua !== null && ua !== undefined) {
          wrong++;
        }
      } else if (qType === 'truefalse') {
        possible += qPoints;
        const cAnswers = (q as any).correctAnswers || [];
        let numCorrectSub = 0;
        let hasAnsweredAny = false;

        if (Array.isArray(ua)) {
          cAnswers.forEach((ans: boolean, i: number) => {
            if (ua[i] !== null && ua[i] !== undefined) hasAnsweredAny = true;
            if (ua[i] === ans) numCorrectSub++;
          });
        }

        let ratio = 0;
        if (numCorrectSub === 1) ratio = 0.1;
        else if (numCorrectSub === 2) ratio = 0.25;
        else if (numCorrectSub === 3) ratio = 0.5;
        else if (numCorrectSub === 4) ratio = 1.0;

        achieved += qPoints * ratio;
        if (numCorrectSub === 4) correct++;
        else if (hasAnsweredAny) wrong++;
      } else if (qType === 'short') {
        possible += qPoints;
        const normUser = normalizeShortDecimalAnswer(String(ua || ''));
        const normKey = normalizeShortDecimalAnswer(String((q as any).correct || ''));

        if (normUser && normKey && normUser === normKey) {
          achieved += qPoints;
          correct++;
        } else if (ua && String(ua).trim() !== '') {
          wrong++;
        }
      } else if (qType === 'matching') {
        possible += qPoints;
        const pairs = (q as any).pairs || [];
        let numCorrectPairs = 0;
        let hasAnsweredAny = false;
        pairs.forEach((pair: any) => {
          const chosen = ua?.[pair.id];
          if (chosen) hasAnsweredAny = true;
          if (chosen === pair.id) numCorrectPairs++;
        });
        const ratio = pairs.length > 0 ? numCorrectPairs / pairs.length : 0;
        achieved += qPoints * ratio;
        if (ratio === 1) correct++;
        else if (hasAnsweredAny) wrong++;
      } else if (qType === 'cloze') {
        possible += qPoints;
        const blanks = (q as any).blanks || [];
        let numCorrectBlanks = 0;
        let hasAnsweredAny = false;
        blanks.forEach((blank: any) => {
          const userText = String(ua?.[blank.id] || '').trim().toLowerCase();
          const keyText = String(blank.correct || '').trim().toLowerCase();
          if (userText) hasAnsweredAny = true;
          if (userText && userText === keyText) numCorrectBlanks++;
        });
        const ratio = blanks.length > 0 ? numCorrectBlanks / blanks.length : 0;
        achieved += qPoints * ratio;
        if (ratio === 1) correct++;
        else if (hasAnsweredAny) wrong++;
      } else if (qType === 'ordering') {
        possible += qPoints;
        const items = (q as any).items || [];
        const correctOrder = items.map((it: any) => it.id).join(',');
        const userOrder = Array.isArray(ua) ? ua.join(',') : '';
        if (userOrder && userOrder === correctOrder) {
          achieved += qPoints;
          correct++;
        } else if (userOrder) {
          wrong++;
        }
      } else if (qType === 'essay') {
        possible += qPoints;
      }
    });

    achieved = Math.round(achieved * 100) / 100;
    possible = Math.round(possible * 100) / 100;

    const final10 = possible > 0 ? ((achieved / possible) * 10).toFixed(2) : '0.00';
    setFinalScore10(final10);
    setTotalAchieved(achieved);
    setTotalPossible(possible);
    setCountCorrect(correct);
    setCountWrong(wrong);

    const totalSeconds = (testSamplingMode === 'matrix' ? matrixDuration : fullDuration) * 60;
    const spentSecs = Math.max(0, totalSeconds - secondsRemaining);
    setTimeSpentStr(formatTimer(spentSecs));

    setShowResultModal(true);

    // Save to localStorage history
    try {
      const history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
      const newEntry = {
        date: new Date().toLocaleString('vi-VN'),
        title: quizTitle || 'Đề thi trực tuyến',
        score: final10,
        correct: `${correct}/${activeQuestions.length}`,
        mode: runnerMode,
      };
      const updated = [newEntry, ...history.filter((h: any) => h && h.date !== newEntry.date)].slice(0, 50);
      localStorage.setItem('quiz_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage history', e);
    }
  };

  const currentQ = activeQuestions[currentIndex];
  const currentPassage = currentQ?.passageId
    ? passages.find((p) => p.id === currentQ.passageId)
    : null;
  const passageQuestions = currentPassage
    ? activeQuestions
        .map((q, idx) => ({ q, idx }))
        .filter((item) => item.q.passageId === currentPassage.id)
    : [];

  const renderSingleQuestion = (q: Question, qIdx: number) => {
    return (
      <div
        key={qIdx}
        id={`question-card-${qIdx}`}
        className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
              Câu {qIdx + 1} / {activeQuestions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
              {q.type === 'multiple'
                ? 'Trắc nghiệm 4 lựa chọn'
                : q.type === 'truefalse'
                ? 'Đúng / Sai'
                : q.type === 'short'
                ? 'Trả lời ngắn'
                : q.type === 'matching'
                ? 'Nối cặp'
                : q.type === 'cloze'
                ? 'Điền khuyết'
                : q.type === 'ordering'
                ? 'Sắp xếp'
                : 'Tự luận'}
            </span>
            {q.points !== undefined && (
              <span className="text-xs font-bold text-slate-400">
                ({q.points} điểm)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setFlagged((prev) => {
                const next = [...prev];
                next[qIdx] = !next[qIdx];
                return next;
              });
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              flagged[qIdx]
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flagged[qIdx] ? 'Đã đặt cờ' : 'Đặt cờ'}</span>
          </button>
        </div>

        <div className="text-slate-900 font-semibold text-sm leading-relaxed">
          <LatexRenderer text={q.question} />
        </div>

        {q.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50 flex items-center justify-center">
            <img
              src={q.imageUrl}
              alt="Hình ảnh câu hỏi"
              className="max-h-72 object-contain"
            />
          </div>
        )}
        {q.audioUrl && (
          <AudioPlayer url={q.audioUrl} maxPlays={q.maxAudioPlays} />
        )}
        {q.videoUrl && <VideoEmbed url={q.videoUrl} />}

        {/* Options / Input based on question type */}
        <div className="pt-2">
          {q.type === 'multiple' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(q.options || []).map((opt, oIdx) => {
                const letter = ['A', 'B', 'C', 'D'][oIdx] || `${oIdx + 1}`;
                const isSelected = userAnswers[qIdx] === oIdx;
                const isCorrectAnswer = (q as any).correct === oIdx;

                let styleClass =
                  'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700';
                const isCheckedPractice = runnerMode === 'practice' && checkedPractice[qIdx];
                if (isSubmitted || isCheckedPractice) {
                  if (isCorrectAnswer) {
                    styleClass =
                      'bg-emerald-50 border-emerald-500 font-bold text-emerald-900';
                  } else if (isSelected && !isCorrectAnswer) {
                    styleClass = 'bg-rose-50 border-rose-500 font-bold text-rose-900';
                  }
                } else if (isSelected) {
                  styleClass =
                    'bg-blue-50 border-blue-600 font-bold text-blue-900 shadow-sm';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => {
                      setUserAnswers((prev) => {
                        const next = [...prev];
                        next[qIdx] = oIdx;
                        return next;
                      });
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${styleClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 pt-0.5 leading-snug">
                      <LatexRenderer text={opt} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'truefalse' && (
            <div className="space-y-2">
              {(q.options || []).map((stmt, sIdx) => {
                const letter = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                const curVal = userAnswers[qIdx]?.[sIdx];

                return (
                  <div
                    key={sIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-extrabold text-blue-600 uppercase text-xs pt-0.5">
                        {letter})
                      </span>
                      <div className="text-slate-800 font-medium">
                        <LatexRenderer text={stmt} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setUserAnswers((prev) => {
                            const next = [...prev];
                            const cur = Array.isArray(next[qIdx])
                              ? [...next[qIdx]]
                              : [null, null, null, null];
                            cur[sIdx] = true;
                            next[qIdx] = cur;
                            return next;
                          });
                        }}
                        className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                          curVal === true
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setUserAnswers((prev) => {
                            const next = [...prev];
                            const cur = Array.isArray(next[qIdx])
                              ? [...next[qIdx]]
                              : [null, null, null, null];
                            cur[sIdx] = false;
                            next[qIdx] = cur;
                            return next;
                          });
                        }}
                        className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                          curVal === false
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
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

          {q.type === 'short' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Điền câu trả lời:</span>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={userAnswers[qIdx] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserAnswers((prev) => {
                      const next = [...prev];
                      next[qIdx] = val;
                      return next;
                    });
                  }}
                  placeholder="Nhập số kết quả (dấu . hoặc ,)..."
                  className="w-48 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {isSubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                  Đáp án chuẩn:{' '}
                  <span className="font-mono text-sm">{(q as any).correct}</span>
                </div>
              )}
            </div>
          )}

          {q.type === 'matching' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Nối từng mục ở Cột A với nội dung phù hợp ở Cột B:
              </p>
              <div className="space-y-2">
                {(q.pairs || []).map((pair, pIdx) => {
                  const userChoice = userAnswers[qIdx]?.[pair.id];
                  const isCorrect = isSubmitted && userChoice === pair.id;
                  const isWrong = isSubmitted && userChoice && userChoice !== pair.id;

                  return (
                    <div
                      key={pair.id || pIdx}
                      className={`p-3 rounded-2xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-slate-50 border-slate-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                            {pIdx + 1}
                          </span>
                          <div className="text-xs font-bold text-slate-800 pt-0.5">
                            <LatexRenderer text={pair.left} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400 font-bold text-xs">⇄</span>
                          <select
                            disabled={isSubmitted}
                            value={userChoice || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserAnswers((prev) => {
                                const next = [...prev];
                                const cur = { ...(next[qIdx] || {}) };
                                cur[pair.id] = val;
                                next[qIdx] = cur;
                                return next;
                              });
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[240px]"
                          >
                            <option value="">-- Chọn nội dung ghép --</option>
                            {(q.pairs || []).map((pRight, rIdx) => (
                              <option key={rIdx} value={pRight.id}>
                                {pRight.right}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {isSubmitted && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ghép đúng
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Ghép sai
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 font-medium">
                            Đáp án chuẩn: <span className="font-bold text-slate-900">{pair.right}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {q.type === 'cloze' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Điền hoặc chọn từ thích hợp vào các chỗ trống bên dưới:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(q.blanks || []).map((blank, bIdx) => {
                  const blankKey = blank.id || `${bIdx + 1}`;
                  const userChoice = userAnswers[qIdx]?.[blankKey] || '';
                  const isCorrect =
                    isSubmitted &&
                    String(userChoice).trim().toLowerCase() ===
                      String(blank.correct || '').trim().toLowerCase();
                  const isWrong = isSubmitted && userChoice && !isCorrect;
                  const hasOptions = Array.isArray(blank.options) && blank.options.length > 0;

                  return (
                    <div
                      key={blankKey}
                      className={`p-3 rounded-2xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-slate-50 border-slate-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shrink-0">
                          [{bIdx + 1}]
                        </span>
                        {hasOptions ? (
                          <select
                            disabled={isSubmitted}
                            value={userChoice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserAnswers((prev) => {
                                const next = [...prev];
                                const cur = { ...(next[qIdx] || {}) };
                                cur[blankKey] = val;
                                next[qIdx] = cur;
                                return next;
                              });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Chọn từ phù hợp --</option>
                            {blank.options.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            disabled={isSubmitted}
                            value={userChoice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserAnswers((prev) => {
                                const next = [...prev];
                                const cur = { ...(next[qIdx] || {}) };
                                cur[blankKey] = val;
                                next[qIdx] = cur;
                                return next;
                              });
                            }}
                            placeholder="Nhập từ..."
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>

                      {isSubmitted && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Sai
                              </>
                            )}
                          </span>
                          <span className="text-slate-600 font-medium">
                            Chuẩn: <span className="font-bold text-slate-900">{blank.correct}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {q.type === 'ordering' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Sắp xếp các bước/nội dung dưới đây theo đúng trình tự lô-gic:
              </p>
              <div className="space-y-2">
                {(
                  (Array.isArray(userAnswers[qIdx]) && userAnswers[qIdx].length > 0
                    ? userAnswers[qIdx]
                    : (q.items || []).map((it) => it.id)) as string[]
                ).map((itemId, oIdx, arr) => {
                  const itemObj = (q.items || []).find((it) => it.id === itemId);
                  return (
                    <div
                      key={itemId || oIdx}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-black text-xs flex items-center justify-center shrink-0">
                          {oIdx + 1}
                        </span>
                        <span className="font-bold text-slate-800">
                          <LatexRenderer text={itemObj?.text || itemId} />
                        </span>
                      </div>

                      {!isSubmitted && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={oIdx === 0}
                            onClick={() => {
                              const nextArr = [...arr];
                              const temp = nextArr[oIdx - 1];
                              nextArr[oIdx - 1] = nextArr[oIdx];
                              nextArr[oIdx] = temp;
                              setUserAnswers((prev) => {
                                const next = [...prev];
                                next[qIdx] = nextArr;
                                return next;
                              });
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={oIdx === arr.length - 1}
                            onClick={() => {
                              const nextArr = [...arr];
                              const temp = nextArr[oIdx + 1];
                              nextArr[oIdx + 1] = nextArr[oIdx];
                              nextArr[oIdx] = temp;
                              setUserAnswers((prev) => {
                                const next = [...prev];
                                next[qIdx] = nextArr;
                                return next;
                              });
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                  <span className="font-bold text-slate-700 block">Thứ tự đúng chuẩn:</span>
                  <div className="space-y-1 pl-2">
                    {(q.items || []).map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-800">
                        <span className="font-black text-cyan-700">{idx + 1}.</span>
                        <span>{it.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {q.type === 'essay' && (
            <div className="space-y-3">
              <textarea
                rows={5}
                disabled={isSubmitted}
                value={userAnswers[qIdx] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserAnswers((prev) => {
                    const next = [...prev];
                    next[qIdx] = val;
                    return next;
                  });
                }}
                placeholder="Thí sinh trình bày bài làm tự luận trực tiếp tại đây..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />

              {/* Attachments for handwritten paper (HSG / Olympic / Teacher allowed) */}
              {(q.allowAttachments ||
                examType?.includes('HSG') ||
                examType?.includes('Olympic')) && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ảnh chụp bài làm viết tay</span>
                    </span>
                    {!isSubmitted && (
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh bài làm</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setEssayAttachments((prev) => ({
                                  ...prev,
                                  [qIdx]: reader.result as string,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {essayAttachments[qIdx] && (
                    <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50">
                      <img
                        src={essayAttachments[qIdx]}
                        alt="Ảnh bài làm viết tay"
                        className="max-h-60 rounded-2xl object-contain"
                      />
                      {!isSubmitted && (
                        <button
                          type="button"
                          onClick={() =>
                            setEssayAttachments((prev) => {
                              const next = { ...prev };
                              delete next[qIdx];
                              return next;
                            })
                          }
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer transition-all"
                          title="Xóa ảnh đính kèm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rubric */}
              {q.rubric && q.rubric.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                    Tiêu chí chấm điểm tự luận (Barem Rubric):
                  </span>
                  <div className="space-y-1.5">
                    {q.rubric.map((r) => (
                      <div
                        key={r.step}
                        className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-slate-200/80"
                      >
                        <span className="text-slate-700 font-medium">
                          <b>Bước {r.step}:</b> {r.description}
                        </span>
                        <span className="font-black text-blue-600 shrink-0 ml-2">
                          +{r.points} điểm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Practice Mode check button */}
        {runnerMode === 'practice' && !isSubmitted && (
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            {!checkedPractice[qIdx] ? (
              <button
                type="button"
                onClick={() => {
                  setCheckedPractice((prev) => {
                    const next = [...prev];
                    next[qIdx] = true;
                    return next;
                  });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kiểm tra đáp án</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã kiểm tra</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCheckedPractice((prev) => {
                      const next = [...prev];
                      next[qIdx] = false;
                      return next;
                    });
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Làm lại câu này
                </button>
              </div>
            )}
          </div>
        )}

        {/* Explanation in review mode or practice checked mode */}
        {(isSubmitted || (runnerMode === 'practice' && checkedPractice[qIdx])) && q.explanation && (
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs space-y-1 animate-in fade-in">
            <span className="font-extrabold text-indigo-900 block">Lời giải chi tiết:</span>
            <div className="text-indigo-950 leading-relaxed font-normal">
              <LatexRenderer text={q.explanation} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase">
              {isStudentMode ? 'Phòng thi trực tuyến' : 'Chế độ thử làm đề'}
            </span>
            {subject && <span className="text-xs font-bold text-slate-500">• {subject}</span>}
            {grade && <span className="text-xs font-bold text-slate-500">• {grade}</span>}
            {examType && <span className="text-xs font-bold text-slate-500">• {examType}</span>}
          </div>
          <h1 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">
            {quizTitle || 'Đề kiểm tra trực tuyến'}
          </h1>
          {author && (
            <p className="text-xs text-slate-400 font-medium mt-1">
              Người ra đề: <span className="text-slate-700 font-bold">{author}</span>
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setTestSamplingMode('matrix')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                testSamplingMode === 'matrix'
                  ? 'bg-white text-blue-600 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma trận ({matrixDuration}p)
            </button>
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setTestSamplingMode('full')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                testSamplingMode === 'full'
                  ? 'bg-white text-blue-600 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả câu ({fullDuration}p)
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl font-mono text-sm font-black shadow-inner">
            <TimerIcon className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitExam}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => initSession(testSamplingMode)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
          )}

          {onBack && (
            <button
              type="button"
              onClick={() => {
                if (!isSubmitted && activeQuestions.length > 0) {
                  setShowExitConfirmModal(true);
                } else if (onBack) {
                  onBack();
                }
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>

      {activeQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-extrabold text-sm text-slate-700">Đề thi chưa có câu hỏi nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Main Question Display (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {currentPassage && passageQuestions.length > 0 ? (
              <div className="space-y-4">
                {/* Shared Passage Box */}
                <div className="p-6 bg-gradient-to-b from-indigo-50/70 to-white rounded-3xl border-2 border-indigo-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-xs font-black uppercase text-indigo-900 tracking-wider">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{currentPassage.title || 'Ngữ liệu chung'}</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-3 py-1 rounded-full">
                      Áp dụng cho các câu từ {passageQuestions[0].idx + 1} đến{' '}
                      {passageQuestions[passageQuestions.length - 1].idx + 1} ({passageQuestions.length} câu)
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 leading-relaxed font-normal">
                    <LatexRenderer text={currentPassage.content} />
                  </div>

                  {currentPassage.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-indigo-100 max-h-72 bg-white flex items-center justify-center">
                      <img
                        src={currentPassage.imageUrl}
                        alt="Hình ngữ liệu"
                        className="max-h-72 object-contain"
                      />
                    </div>
                  )}
                  {currentPassage.audioUrl && (
                    <AudioPlayer
                      url={currentPassage.audioUrl}
                      maxPlays={currentPassage.maxAudioPlays}
                    />
                  )}
                  {currentPassage.videoUrl && <VideoEmbed url={currentPassage.videoUrl} />}
                </div>

                {/* All Questions belonging to this Passage rendered on the SAME page (không tách trang) */}
                <div className="space-y-4">
                  {passageQuestions.map(({ q, idx }) => renderSingleQuestion(q, idx))}
                </div>

                {/* Navigation for Passage Group */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={passageQuestions[0].idx === 0}
                    onClick={() => setCurrentIndex(Math.max(0, passageQuestions[0].idx - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Phần trước</span>
                  </button>

                  <span className="text-xs font-extrabold text-indigo-900">
                    Chùm câu theo ngữ liệu ({passageQuestions[0].idx + 1} -{' '}
                    {passageQuestions[passageQuestions.length - 1].idx + 1} / {activeQuestions.length})
                  </span>

                  <button
                    type="button"
                    disabled={
                      passageQuestions[passageQuestions.length - 1].idx === activeQuestions.length - 1
                    }
                    onClick={() =>
                      setCurrentIndex(
                        Math.min(
                          activeQuestions.length - 1,
                          passageQuestions[passageQuestions.length - 1].idx + 1
                        )
                      )
                    }
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <span>Phần kế tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              currentQ && (
                <div className="space-y-4">
                  {renderSingleQuestion(currentQ, currentIndex)}

                  {/* Single Question Navigation */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Câu trước</span>
                    </button>

                    <span className="text-xs font-bold text-slate-400">
                      {currentIndex + 1} / {activeQuestions.length}
                    </span>

                    <button
                      type="button"
                      disabled={currentIndex === activeQuestions.length - 1}
                      onClick={() =>
                        setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <span>Câu kế tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Question Map (1 col) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Bản đồ câu hỏi
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {activeQuestions.length} câu
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {activeQuestions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isFlag = flagged[idx];
                const hasPassage = Boolean(q.passageId);
                const hasAnswer =
                  Boolean(essayAttachments[idx]) ||
                  (userAnswers[idx] !== null &&
                    userAnswers[idx] !== undefined &&
                    (Array.isArray(userAnswers[idx])
                      ? userAnswers[idx].some((v: any) => v !== null)
                      : typeof userAnswers[idx] === 'object'
                      ? Object.values(userAnswers[idx]).some((v: any) => v !== null && v !== '')
                      : String(userAnswers[idx]).trim() !== ''));

                let bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isCurrent) {
                  bgClass = 'bg-blue-600 text-white border-blue-600 shadow-sm font-black';
                } else if (hasAnswer) {
                  bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setTimeout(() => {
                        document.getElementById('question-card-' + idx)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }, 50);
                    }}
                    className={`relative h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${bgClass}`}
                  >
                    {idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                    {hasPassage && (
                      <span
                        className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full ${
                          isCurrent ? 'bg-amber-300' : 'bg-indigo-500'
                        }`}
                        title="Câu thuộc chùm ngữ liệu"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300" />
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Đã đặt cờ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1.5 rounded-full bg-indigo-500" />
                <span>Câu theo ngữ liệu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <RunnerResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        finalScore10={finalScore10}
        totalAchieved={totalAchieved}
        totalPossible={totalPossible}
        countCorrect={countCorrect}
        countWrong={countWrong}
        timeSpentStr={timeSpentStr}
        onReviewMode={() => setShowResultModal(false)}
        onRestartExam={() => initSession(testSamplingMode)}
      />

      {/* Exit Confirmation Modal */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3 text-2xl">
              ⚠️
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">Dừng làm bài?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn quay lại màn hình ban đầu? Tiến trình và kết quả làm bài hiện tại sẽ không được lưu.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Tiếp tục làm
              </button>
              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setShowExitConfirmModal(false);
                  if (onBack) onBack();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Dừng làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
