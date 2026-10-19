import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Lock, RefreshCw, KeyRound } from 'lucide-react';
import { ExamReader } from './components/ExamReader';
import { ExamStartScreen } from './components/ExamStartScreen';
import { ExamCodeInputScreen } from './components/ExamCodeInputScreen';
import { Toast } from './components/Toast';
import {
  listenToAdminAuth,
  fetchQuizById,
  canUserViewQuiz,
  canUserTakeQuiz,
  getStudentAttemptCount,
  submitStudentExam,
} from './services/firebaseService';
import type { QuizRecord, AdminUser, ToastMessage, StudentSubmissionRecord } from './types';

export const StudentExamApp: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [examId, setExamId] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Step state: 'input-code' | 'start-screen' | 'running'
  const [appStep, setAppStep] = useState<'input-code' | 'start-screen' | 'running'>('start-screen');
  const [runnerMode, setRunnerMode] = useState<'practice' | 'exam'>('practice');
  const [samplingMode, setSamplingMode] = useState<'matrix' | 'full'>('matrix');

  const addToast = (text: string, isError = false) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type: isError ? 'error' : 'success' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Listen to Auth
  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    listenToAdminAuth((authedUser) => {
      setUser(authedUser);
      setAuthLoading(false);
    }).then((u) => {
      unsubAuth = u;
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // 2. Parse Exam ID from URL & load exam only after Auth is resolved
  useEffect(() => {
    if (authLoading) return;

    const search = window.location.search.substring(1);
    let id = '';
    if (search.startsWith('id=')) {
      id = search.substring(3).split('&')[0];
    } else if (search) {
      id = search.split('&')[0];
    }

    if (!id) {
      setAppStep('input-code');
      setLoading(false);
      return;
    }

    setExamId(id);
    loadExamData(id, user);
  }, [authLoading]);

  const loadExamData = async (id: string, currentUser: AdminUser | null) => {
    setLoading(true);
    setError('');
    try {
      const record = await fetchQuizById(id);
      if (!record) {
        setError(`Không tìm thấy đề thi với mã "${id.toUpperCase()}".`);
        return;
      }

      // Tất cả các bài khi làm đều phải đăng nhập tài khoản NDID
      if (!currentUser) {
        setError('Vui lòng đăng nhập tài khoản NDID để làm bài kiểm tra.');
        return;
      }

      // Check view permissions
      if (record.visibility === 'private') {
        const canView = canUserViewQuiz(currentUser, record);
        if (!canView) {
          setError('Đề thi này được cài đặt ở chế độ riêng tư bởi người ra đề.');
          return;
        }
      }

      // Check access permission (giới hạn người làm đề theo CodeID)
      const canTake = canUserTakeQuiz(currentUser, record);
      if (!canTake) {
        setError('Đề thi này được giới hạn danh sách người làm bài. Tài khoản của bạn không nằm trong danh sách được cấp quyền.');
        return;
      }

      // Check maxAttempts limit if user is logged in
      const qProctoring = record.proctoring || record.quizData?.proctoring || record.quizData?.config?.proctoring;
      if (qProctoring?.maxAttempts && qProctoring.maxAttempts > 0 && currentUser?.ndid) {
        try {
          const attempts = await getStudentAttemptCount(record.id, currentUser.ndid);
          if (attempts >= qProctoring.maxAttempts) {
            setError(`Bạn đã làm bài thi này ${attempts}/${qProctoring.maxAttempts} lần và đã đạt giới hạn tối đa cho phép của giáo viên.`);
            return;
          }
        } catch (_) {}
      }

      setQuiz(record);
      setAppStep('start-screen');
      setError('');
    } catch (e: any) {
      setError('Lỗi tải dữ liệu đề thi: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Đang tải cấu trúc đề thi...</p>
        </div>
      </div>
    );
  }

  // Code input view
  if (appStep === 'input-code') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <ExamCodeInputScreen
          initialError={error}
          onSelectExamId={(newId) => {
            setExamId(newId);
            window.history.pushState({}, '', `?id=${encodeURIComponent(newId)}`);
            loadExamData(newId);
          }}
        />
      </div>
    );
  }

  // Error state view
  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            {error.includes('riêng tư') ? (
              <Lock className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-lg font-black text-slate-800">Không thể mở phòng thi</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            {examId && (
              <button
                type="button"
                onClick={() => loadExamData(examId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setError('');
                setAppStep('input-code');
                window.history.pushState({}, '', window.location.pathname);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Nhập mã đề khác</span>
            </button>
          </div>
          <div className="pt-2">
            <a
              href="/edu"
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về kho đề thi EduND</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Start Screen view
  if (appStep === 'start-screen') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <ExamStartScreen
          quiz={quiz}
          onStartExam={(mode, sampling) => {
            setRunnerMode(mode);
            setSamplingMode(sampling);
            setAppStep('running');
          }}
          onEnterNewCode={() => {
            setAppStep('input-code');
            window.history.pushState({}, '', window.location.pathname);
          }}
        />
      </div>
    );
  }

  // Active Runner view
  const qData = quiz.quizData || (quiz as any);
  const questions = qData.questions || quiz.questions || [];
  const passages = qData.passages || quiz.passages || [];
  const matrixDuration =
    quiz.matrixDuration || qData.matrixDuration || quiz.duration || qData.duration || 45;
  const fullDuration = quiz.fullDuration || qData.fullDuration || 90;
  const struct = qData.examStructure || quiz.quizData?.examStructure;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        <ExamReader
          quizTitle={quiz.title || qData.title || 'Đề thi trực tuyến'}
          grade={quiz.grade || quiz.class || qData.grade}
          subject={quiz.subject || qData.subject}
          examType={quiz.examType || qData.examType}
          author={quiz.author || qData.author}
          school={quiz.school || qData.school}
          year={quiz.year || qData.year}
          createdAt={quiz.createdAt || qData.createdAt}
          matrixDuration={matrixDuration}
          fullDuration={fullDuration}
          structure={struct}
          passages={passages}
          questions={questions}
          proctoring={quiz.proctoring || qData.proctoring || qData.config?.proctoring}
          isStudentMode={true}
          initialSamplingMode={samplingMode}
          initialRunnerMode={runnerMode}
          onBack={() => {
            setAppStep('start-screen');
          }}
          onToast={addToast}
          onFinishSubmission={async (subData) => {
            if (!quiz?.id) return;
            try {
              const studentNdid = user?.ndid || 'Thí sinh tự do';
              const studentName = user?.fullname || user?.displayName || user?.ndid || 'Học sinh';
              await submitStudentExam({
                examId: quiz.id,
                examTitle: quiz.title || qData.title || 'Đề thi trực tuyến',
                studentNdid,
                studentName,
                studentCodeId: user?.codeId || user?.uid || '',
                score10: parseFloat(subData.final10) || 0,
                achievedPoints: subData.achieved,
                totalPoints: subData.possible,
                correctCount: subData.correct,
                wrongCount: subData.wrong,
                totalQuestions: questions.length,
                timeSpentSecs: subData.timeSpentSecs,
                answers: subData.userAnswers,
                userAnswers: subData.userAnswers,
                proctoringLogs: subData.proctoringLogs,
                runnerMode: subData.runnerMode,
                testSamplingMode: subData.testSamplingMode,
              });
              addToast('Đã lưu kết quả bài thi thành công vào hệ thống!', false);
            } catch (err: any) {
              console.warn('Lỗi lưu bài thi học sinh:', err);
            }
          }}
        />
      </div>
    </div>
  );
};
