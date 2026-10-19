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
import { SilentProctoring } from './SilentProctoring';
import { normalizeShortDecimalAnswer } from '../services/aiService';
import type { Question, ExamStructure, PassageContext, ExamProctoringConfig } from '../types';

interface ExamReaderProps {
  quizTitle: string;
  grade?: string;
  subject?: string;
  examType?: string;
  author?: string;
  school?: string;
  year?: string;
  createdAt?: any;
  matrixDuration: number;
  fullDuration?: number;
  structure?: ExamStructure;
  passages?: PassageContext[];
  questions: Question[];
  proctoring?: ExamProctoringConfig;
  isStudentMode?: boolean;
  initialSamplingMode?: 'matrix' | 'full';
  initialRunnerMode?: 'practice' | 'exam';
  onBack?: () => void;
  onToast?: (msg: string, isError?: boolean) => void;
  onFinishSubmission?: (data: {
    final10: string;
    achieved: number;
    possible: number;
    correct: number;
    wrong: number;
    timeSpentSecs: number;
    userAnswers: any[];
    proctoringLogs: any[];
    runnerMode: 'exam' | 'practice';
    testSamplingMode: 'matrix' | 'full';
  }) => void;
}

export const ExamReader: React.FC<ExamReaderProps> = ({
  quizTitle,
  grade,
  subject,
  examType,
  author,
  school,
  year,
  createdAt,
  matrixDuration,
  fullDuration = 90,
  structure,
  passages = [],
  questions,
  proctoring,
  isStudentMode = false,
  initialSamplingMode,
  initialRunnerMode,
  onBack,
  onToast,
  onFinishSubmission,
}) => {
  const [testSamplingMode, setTestSamplingMode] = useState<'matrix' | 'full'>(
    initialSamplingMode || 'matrix'
  );
  const [runnerMode, setRunnerMode] = useState<'practice' | 'exam'>(
    initialRunnerMode || 'exam'
  );
  const [checkedPractice, setCheckedPractice] = useState<boolean[]>([]);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [mapFilter, setMapFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionProctoringLogs, setSessionProctoringLogs] = useState<
    { timestamp: string; type: string; detail: string; severity: 'low' | 'medium' | 'high' }[]
  >([]);

  // User answers & state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [essayAttachments, setEssayAttachments] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestions.length]);

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
    let msList = rawList.filter((q) => q.type === 'multiselect').map((q) => ({ ...q }));
    let groupList = rawList.filter((q) => q.type === 'grouping').map((q) => ({ ...q }));
    let errList = rawList.filter((q) => q.type === 'error_identification').map((q) => ({ ...q }));
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
        msList = shuffleArray(msList);
        groupList = shuffleArray(groupList);
        errList = shuffleArray(errList);
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
        if (c.multiselect !== undefined && c.multiselect >= 0) msList = msList.slice(0, c.multiselect);
        if (c.grouping !== undefined && c.grouping >= 0) groupList = groupList.slice(0, c.grouping);
        if (c.error_identification !== undefined && c.error_identification >= 0) errList = errList.slice(0, c.error_identification);
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
      ...msList,
      ...groupList,
      ...errList,
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
      if (q.type === 'multiselect') {
        return [];
      }
      if (q.type === 'grouping') {
        return {};
      }
      if (q.type === 'error_identification') {
        return { selectedUnderline: '', correction: '' };
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
    // Cấm AI tuyệt đối ở chế độ kiểm tra/thi thử (exam mode)
    // Chỉ cho phép mở trợ lý AI ở chế độ luyện tập (practice mode)
    if (runnerMode === 'exam' && !isSubmitted) {
      (window as any).eduAIShowOverride = false;
      (window as any).eduAIExamModeGate = true;
    } else {
      (window as any).eduAIShowOverride = true;
      (window as any).eduAIExamModeGate = false;
    }

    if (typeof (window as any).EduAI_Assistant?.updateVisibility === 'function') {
      (window as any).EduAI_Assistant.updateVisibility();
    }
    if (typeof (window as any).NDAI_Assistant?.updateVisibility === 'function') {
      (window as any).NDAI_Assistant.updateVisibility();
    }

    return () => {
      (window as any).eduAIShowOverride = undefined;
      (window as any).eduAIExamModeGate = false;
      if (typeof (window as any).EduAI_Assistant?.updateVisibility === 'function') {
        (window as any).EduAI_Assistant.updateVisibility();
      }
    };
  }, [runnerMode, isSubmitted]);

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
      } else if (qType === 'multiselect') {
        possible += qPoints;
        const correctIndices: number[] = Array.isArray((q as any).correct) ? (q as any).correct : [];
        const userSelected: number[] = Array.isArray(ua) ? ua : [];
        const hasAnsweredAny = userSelected.length > 0;

        const isExactMatch =
          userSelected.length === correctIndices.length &&
          userSelected.every((idx) => correctIndices.includes(idx));

        if (isExactMatch) {
          achieved += qPoints;
          correct++;
        } else if ((q as any).partialCredit && correctIndices.length > 0) {
          let cCount = 0;
          let wCount = 0;
          userSelected.forEach((idx) => {
            if (correctIndices.includes(idx)) cCount++;
            else wCount++;
          });
          const net = Math.max(0, cCount - wCount);
          const ratio = net / correctIndices.length;
          achieved += qPoints * ratio;
          if (hasAnsweredAny) wrong++;
        } else if (hasAnsweredAny) {
          wrong++;
        }
      } else if (qType === 'grouping') {
        possible += qPoints;
        const items = (q as any).items || [];
        let numCorrectItems = 0;
        let hasAnsweredAny = false;
        items.forEach((item: any) => {
          const chosenCategory = ua?.[item.id];
          if (chosenCategory) hasAnsweredAny = true;
          if (chosenCategory === item.categoryId) numCorrectItems++;
        });
        const ratio = items.length > 0 ? numCorrectItems / items.length : 0;
        achieved += qPoints * ratio;
        if (ratio === 1) correct++;
        else if (hasAnsweredAny) wrong++;
      } else if (qType === 'error_identification') {
        possible += qPoints;
        const underlines = (q as any).underlines || [];
        const errorUnd = underlines.find((u: any) => u.isError);
        const userChoice = ua?.selectedUnderline;
        const userCorrection = String(ua?.correction || '').trim().toLowerCase();
        const keyCorrection = String((q as any).correctCorrection || '').trim().toLowerCase();

        let earned = 0;
        let hasAnsweredAny = false;
        if (userChoice) hasAnsweredAny = true;

        if (errorUnd && userChoice === errorUnd.id) {
          earned += 0.5 * qPoints;
          if (keyCorrection) {
            if (userCorrection && userCorrection === keyCorrection) {
              earned += 0.5 * qPoints;
            }
          } else {
            earned += 0.5 * qPoints;
          }
        }
        achieved += earned;
        if (earned === qPoints) correct++;
        else if (hasAnsweredAny) wrong++;
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

    if (onFinishSubmission) {
      onFinishSubmission({
        final10,
        achieved,
        possible,
        correct,
        wrong,
        timeSpentSecs: spentSecs,
        userAnswers,
        proctoringLogs: sessionProctoringLogs,
        runnerMode,
        testSamplingMode,
      });
    }
  };

  const isQuestionAnswered = (idx: number) => {
    return Boolean(essayAttachments[idx]) ||
      (userAnswers[idx] !== null &&
        userAnswers[idx] !== undefined &&
        (Array.isArray(userAnswers[idx])
          ? userAnswers[idx].some((v: any) => v !== null && v !== undefined)
          : typeof userAnswers[idx] === 'object'
          ? Object.values(userAnswers[idx]).some((v: any) => v !== null && v !== '')
          : String(userAnswers[idx]).trim() !== ''));
  };

  const countAnswered = activeQuestions.filter((_, i) => isQuestionAnswered(i)).length;
  const countUnanswered = activeQuestions.length - countAnswered;
  const countFlagged = flagged.filter(Boolean).length;

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
                : q.type === 'multiselect'
                ? 'Nhiều đáp án'
                : q.type === 'grouping'
                ? 'Phân nhóm'
                : q.type === 'error_identification'
                ? 'Tìm lỗi sai'
                : 'Tự luận'}
            </span>
            {q.cognitiveLevel && (
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg uppercase ${
                q.cognitiveLevel === 'nhan_biet' ? 'bg-sky-100 text-sky-700' :
                q.cognitiveLevel === 'thong_hieu' ? 'bg-emerald-100 text-emerald-700' :
                q.cognitiveLevel === 'van_dung' ? 'bg-amber-100 text-amber-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {q.cognitiveLevel === 'nhan_biet' ? 'Nhận biết' :
                 q.cognitiveLevel === 'thong_hieu' ? 'Thông hiểu' :
                 q.cognitiveLevel === 'van_dung' ? 'Vận dụng' : 'Vận dụng cao'}
              </span>
            )}
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
                    {(isSubmitted || isCheckedPractice) && (
                      <div className="shrink-0 pt-0.5">
                        {isCorrectAnswer ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" /> Đúng
                          </span>
                        ) : isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-lg">
                            <XCircle className="w-3.5 h-3.5" /> Đã chọn sai
                          </span>
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'truefalse' && (
            <div className="space-y-2.5">
              {(q.options || []).map((stmt, sIdx) => {
                const letter = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                const curVal = userAnswers[qIdx]?.[sIdx];
                const isCheckedPractice = runnerMode === 'practice' && checkedPractice[qIdx];
                const isRevealed = isSubmitted || isCheckedPractice;
                const correctVal = Array.isArray((q as any).correctAnswers) ? (q as any).correctAnswers[sIdx] : undefined;
                const isUserCorrect = isRevealed && curVal !== undefined && curVal !== null && curVal === correctVal;
                const isUserWrong = isRevealed && curVal !== undefined && curVal !== null && curVal !== correctVal;

                return (
                  <div
                    key={sIdx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl border text-xs transition-all ${
                      isRevealed
                        ? isUserCorrect
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                          : isUserWrong
                          ? 'bg-rose-50/70 border-rose-400 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-extrabold text-blue-600 uppercase text-xs pt-0.5 shrink-0">
                        {letter})
                      </span>
                      <div className="text-slate-800 font-medium leading-relaxed">
                        <LatexRenderer text={stmt} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
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
                            ? isRevealed
                              ? isUserCorrect
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                                : 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                              : 'bg-emerald-600 text-white shadow-sm'
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
                            ? isRevealed
                              ? isUserCorrect
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                                : 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                              : 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        Sai
                      </button>

                      {isRevealed && correctVal !== undefined && (
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 ${
                          isUserCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isUserCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chính xác</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Đáp án đúng: <strong>{correctVal ? 'Đúng' : 'Sai'}</strong></span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {q.type === 'short' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
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
                  className={`w-48 px-3.5 py-2 border rounded-xl text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    (isSubmitted || (runnerMode === 'practice' && checkedPractice[qIdx]))
                      ? normalizeShortDecimalAnswer(String(userAnswers[qIdx] || '')) === normalizeShortDecimalAnswer(String((q as any).correct || ''))
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-rose-50 border-rose-500 text-rose-900'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              {(isSubmitted || (runnerMode === 'practice' && checkedPractice[qIdx])) && (
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                  normalizeShortDecimalAnswer(String(userAnswers[qIdx] || '')) === normalizeShortDecimalAnswer(String((q as any).correct || ''))
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {normalizeShortDecimalAnswer(String(userAnswers[qIdx] || '')) === normalizeShortDecimalAnswer(String((q as any).correct || '')) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đã trả lời đúng!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Bạn đã trả lời chưa chính xác.</span>
                      </>
                    )}
                  </div>
                  <div>
                    Đáp án chuẩn:{' '}
                    <span className="font-mono text-sm underline font-black">{(q as any).correct}</span>
                  </div>
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

          {q.type === 'multiselect' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Chọn một hoặc nhiều đáp án đúng (tối đa {q.options?.length || 4}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(q.options || []).map((opt, oIdx) => {
                  const letter = ['A', 'B', 'C', 'D', 'E', 'F'][oIdx] || `${oIdx + 1}`;
                  const userArr: number[] = Array.isArray(userAnswers[qIdx]) ? userAnswers[qIdx] : [];
                  const isSelected = userArr.includes(oIdx);
                  const correctArr: number[] = Array.isArray((q as any).correct) ? (q as any).correct : [];
                  const isCorrectAnswer = correctArr.includes(oIdx);

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
                      'bg-indigo-50 border-indigo-600 font-bold text-indigo-900 shadow-sm';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => {
                        const nextArr = isSelected
                          ? userArr.filter((i) => i !== oIdx)
                          : [...userArr, oIdx];
                        setUserAnswers((prev) => {
                          const next = [...prev];
                          next[qIdx] = nextArr;
                          return next;
                        });
                      }}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${styleClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {isSelected ? '✓' : letter}
                      </span>
                      <div className="flex-1 pt-0.5 leading-snug">
                        <LatexRenderer text={opt} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {q.type === 'grouping' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Phân loại các mục dưới đây vào đúng nhóm tương ứng:
              </p>
              <div className="space-y-2.5">
                {((q as any).items || []).map((item: any, itIdx: number) => {
                  const userChosen = userAnswers[qIdx]?.[item.id];
                  const isCorrect = userChosen === item.categoryId;
                  const isCheckedPractice = runnerMode === 'practice' && checkedPractice[qIdx];
                  const isRevealed = isSubmitted || isCheckedPractice;

                  const correctCategoryName =
                    ((q as any).categories || []).find((c: any) => c.id === item.categoryId)?.name ||
                    item.categoryId;

                  return (
                    <div
                      key={itIdx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border text-xs transition-all ${
                        isRevealed
                          ? isCorrect
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                            : 'bg-rose-50/70 border-rose-300 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          <LatexRenderer text={item.text} />
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          disabled={isSubmitted}
                          value={userChosen || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserAnswers((prev) => {
                              const next = [...prev];
                              next[qIdx] = { ...(next[qIdx] || {}), [item.id]: val };
                              return next;
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isRevealed
                              ? isCorrect
                                ? 'bg-white border-emerald-500 text-emerald-800'
                                : 'bg-white border-rose-400 text-rose-800'
                              : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="">-- Chọn nhóm phân loại --</option>
                          {((q as any).categories || []).map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>

                        {isRevealed && !isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                            Đúng: {correctCategoryName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {q.type === 'error_identification' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Nhấp chọn phần gạch chân bị sai trong câu và điền phương án sửa lại:
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {((q as any).underlines || []).map((und: any, uIdx: number) => {
                  const isSelected = userAnswers[qIdx]?.selectedUnderline === und.id;
                  const isCheckedPractice = runnerMode === 'practice' && checkedPractice[qIdx];
                  const isRevealed = isSubmitted || isCheckedPractice;

                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (isRevealed) {
                    if (und.isError) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-extrabold shadow-sm';
                    } else if (isSelected && !und.isError) {
                      btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-sm';
                  }

                  return (
                    <button
                      key={uIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => {
                        setUserAnswers((prev) => {
                          const next = [...prev];
                          next[qIdx] = { ...(next[qIdx] || {}), selectedUnderline: und.id };
                          return next;
                        });
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-black mr-1.5 text-slate-400">[{und.id}]</span>
                      <span className="underline decoration-slate-400 underline-offset-4 font-bold">{und.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    Sửa lại thành:
                  </span>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    placeholder="Điền từ/cụm từ đúng sau khi sửa..."
                    value={userAnswers[qIdx]?.correction || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserAnswers((prev) => {
                        const next = [...prev];
                        next[qIdx] = { ...(next[qIdx] || {}), correction: val };
                        return next;
                      });
                    }}
                    className="flex-1 max-w-sm px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(isSubmitted || (runnerMode === 'practice' && checkedPractice[qIdx])) &&
                  (q as any).correctCorrection && (
                    <div className="text-xs pt-1 flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đáp án sửa chuẩn: {(q as any).correctCorrection}</span>
                    </div>
                  )}
              </div>
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

                {/* Nút Hỏi NDAI trợ giúp học sinh (chỉ khả dụng ở chế độ luyện tập, cấm ở thi thử) */}
                <button
                  type="button"
                  onClick={() => {
                    const letterMap = ['A', 'B', 'C', 'D'];
                    const userAns = userAnswers[qIdx];
                    let userAnsText = '';
                    if (q.type === 'multiple') {
                      userAnsText = userAns !== null && userAns !== undefined ? `${letterMap[userAns] || userAns}` : 'Chưa chọn';
                    } else if (q.type === 'truefalse') {
                      userAnsText = Array.isArray(userAns) ? userAns.map((v, i) => `${letterMap[i]}: ${v ? 'Đúng' : 'Sai'}`).join(', ') : 'Chưa chọn';
                    } else {
                      userAnsText = String(userAns || 'Chưa nhập');
                    }

                    let promptText = `Em cần giải thích chi tiết câu hỏi này:\n`;
                    promptText += `• Câu hỏi: ${q.question}\n`;
                    if (q.options && q.options.length > 0) {
                      promptText += `• Các lựa chọn: ${q.options.map((opt, i) => `${letterMap[i]}. ${opt}`).join(' | ')}\n`;
                    }
                    if ((q as any).correct !== undefined) {
                      const corr = (q as any).correct;
                      const corrText = typeof corr === 'number' ? (letterMap[corr] || corr) : JSON.stringify(corr);
                      promptText += `• Đáp án chuẩn của đề: ${corrText}\n`;
                    }
                    promptText += `• Lựa chọn/câu trả lời của em: ${userAnsText}\n`;
                    if (q.explanation) {
                      promptText += `• Lời giải có sẵn: ${q.explanation}\n`;
                    }
                    promptText += `Nhờ NDAI hướng dẫn phương pháp giải, phân tích vì sao đáp án đúng và giúp em củng cố kiến thức nhé!`;

                    const doAsk = () => {
                      if (typeof (window as any).eduAI_ask === 'function') {
                        (window as any).eduAI_ask(promptText);
                      } else if (typeof (window as any).EduAI_Assistant?.toggle === 'function') {
                        (window as any).EduAI_Assistant.toggle();
                        const inp = document.getElementById('ai-input') as HTMLInputElement;
                        if (inp) {
                          inp.value = promptText;
                          (window as any).EduAI_Assistant.send?.();
                        }
                      } else if (typeof (window as any).NDAI_Assistant?.toggle === 'function') {
                        (window as any).NDAI_Assistant.toggle();
                        const inp = (document.getElementById('ai-input') || document.getElementById('nd-ai-input')) as HTMLInputElement;
                        if (inp) {
                          inp.value = promptText;
                          (window as any).NDAI_Assistant.send?.();
                        }
                      }
                    };

                    if (typeof (window as any).eduAI_ask === 'function') {
                      doAsk();
                    } else {
                      // Dynamically ensure script is loaded
                      let s = document.querySelector('script[src*="edu_ai.js"]') as HTMLScriptElement;
                      if (!s) {
                        s = document.createElement('script');
                        s.src = '/assets/js/edu_ai.js';
                        s.defer = true;
                        document.head.appendChild(s);
                      }
                      if (onToast) onToast('Đang kết nối trợ lý học tập NDAI...', false);
                      setTimeout(doAsk, 400);
                    }
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="Gửi câu hỏi và kết quả làm bài sang NDAI để được hướng dẫn giải chi tiết"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hỏi NDAI</span>
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

  // Display school fallback
  let displaySchool = school || '';
  if (!displaySchool || displaySchool === 'EduSpace by ND Labs') {
    displaySchool = 'EduND by ND Labs';
  }

  // Format created date
  let createdDateFormatted = '';
  if (createdAt) {
    try {
      if (typeof createdAt.toDate === 'function') {
        createdDateFormatted = createdAt.toDate().toLocaleDateString('vi-VN');
      } else if (createdAt.seconds) {
        createdDateFormatted = new Date(createdAt.seconds * 1000).toLocaleDateString('vi-VN');
      } else {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime())) {
          createdDateFormatted = d.toLocaleDateString('vi-VN');
        }
      }
    } catch {
      createdDateFormatted = '';
    }
  }

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
            {year && <span className="text-xs font-bold text-slate-500">• Năm học {year}</span>}
          </div>
          <h1 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">
            {quizTitle || 'Đề kiểm tra trực tuyến'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1.5 flex-wrap">
            {author && (
              <span>
                Người ra đề: <strong className="text-slate-700 font-bold">{author}</strong>
              </span>
            )}
            {displaySchool && (
              <>
                <span>•</span>
                <span>
                  Nơi tạo đề: <strong className="text-slate-700 font-bold">{displaySchool}</strong>
                </span>
              </>
            )}
            {createdDateFormatted && (
              <>
                <span>•</span>
                <span>
                  Ngày tạo: <strong className="text-slate-700 font-bold">{createdDateFormatted}</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mode Indicators (Khóa chuyển chế độ giữa chừng) */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <span
              className={`px-3 py-1.5 rounded-xl ${
                runnerMode === 'exam'
                  ? 'bg-rose-50 text-rose-700 font-extrabold border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200'
              }`}
            >
              {runnerMode === 'exam' ? '⏱️ Thi thử' : '📖 Luyện tập'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white text-blue-600 shadow-xs font-extrabold border border-slate-200">
              {testSamplingMode === 'matrix' ? `Ma trận (${matrixDuration}p)` : `Tất cả câu (${fullDuration}p)`}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl font-mono text-sm font-black shadow-inner">
            <TimerIcon className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => setShowSubmitConfirmModal(true)}
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
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Bản đồ câu hỏi
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {countAnswered} / {activeQuestions.length} đã làm
              </span>
            </div>

            {/* Filter tabs on Question Map */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setMapFilter('all')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  mapFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                Tất cả ({activeQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setMapFilter('unanswered')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  mapFilter === 'unanswered'
                    ? 'bg-white text-amber-900 shadow-xs font-black'
                    : 'hover:text-amber-800'
                }`}
              >
                Chưa làm ({countUnanswered})
              </button>
              <button
                type="button"
                onClick={() => setMapFilter('flagged')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  mapFilter === 'flagged'
                    ? 'bg-white text-indigo-900 shadow-xs font-black'
                    : 'hover:text-indigo-800'
                }`}
              >
                Cờ ({countFlagged})
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {activeQuestions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isFlag = flagged[idx];
                const hasPassage = Boolean(q.passageId);
                const hasAnswer = isQuestionAnswered(idx);

                // Filter opacity
                const isDimmed =
                  (mapFilter === 'unanswered' && hasAnswer) ||
                  (mapFilter === 'flagged' && !isFlag);

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
                    className={`relative h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${bgClass} ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    }`}
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

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            {countUnanswered > 0 ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3 text-2xl font-black">
                  ⚠️
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Chưa hoàn thành bài thi!</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Bạn vẫn còn <b className="text-amber-600 font-extrabold">{countUnanswered}</b> câu hỏi chưa trả lời (trên tổng số {activeQuestions.length} câu). Bạn có muốn kiểm tra lại trước khi nộp không?
                </p>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-5 text-left">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">Các câu chưa trả lời:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {activeQuestions.map((_, i) => {
                      if (!isQuestionAnswered(i)) {
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCurrentIndex(i);
                              setShowSubmitConfirmModal(false);
                              setTimeout(() => {
                                document.getElementById('question-card-' + i)?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center',
                                });
                              }, 50);
                            }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[11px] rounded-lg cursor-pointer"
                          >
                            Câu {i + 1}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirmModal(false);
                      setMapFilter('unanswered');
                    }}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    Làm tiếp câu còn lại
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirmModal(false);
                      handleSubmitExam();
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Vẫn nộp bài
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3 text-2xl font-black">
                  ✓
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Xác nhận nộp bài thi</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Bạn đã trả lời đầy đủ tất cả <b>{activeQuestions.length}</b> câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirmModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Kiểm tra lại
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirmModal(false);
                      handleSubmitExam();
                    }}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Nộp bài ngay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Silent Proctoring: ngầm hoàn toàn, không PIP, không báo trước khi chụp/ghi âm */}
      {proctoring && (
        <SilentProctoring
          config={proctoring}
          runnerMode={runnerMode}
          isSubmitted={isSubmitted}
          onViolationLog={(item) => {
            setSessionProctoringLogs((prev) => [...prev, item].slice(-100));
          }}
          onBlockAccess={(reason) => {
            if (onToast) onToast(`Bị chặn vào phòng thi: ${reason}`, true);
          }}
          onAutoSubmitExam={(banReason) => {
            if (onToast) onToast(banReason, true);
            handleSubmitExam();
          }}
        />
      )}
    </div>
  );
};
