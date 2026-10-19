import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Timer,
  Layers,
  ArrowRight,
  ArrowLeft,
  Share2,
  QrCode,
  Copy,
  Check,
  HelpCircle,
  History,
  Trash2,
  X,
  KeyRound,
  Home,
  CheckCircle2,
} from 'lucide-react';
import type { QuizRecord } from '../types';

interface ExamStartScreenProps {
  quiz: QuizRecord;
  onStartExam: (mode: 'practice' | 'exam', sampling: 'matrix' | 'full') => void;
  onEnterNewCode: () => void;
}

interface QuizHistoryItem {
  date: string;
  title: string;
  score: string;
  correct: string;
  mode: string;
}

export const ExamStartScreen: React.FC<ExamStartScreenProps> = ({
  quiz,
  onStartExam,
  onEnterNewCode,
}) => {
  const [step, setStep] = useState<'start' | 'sampling-select' | 'mode-select'>('start');
  const [selectedSampling, setSelectedSampling] = useState<'matrix' | 'full'>('matrix');
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam'>('practice');

  // Modals state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [historyList, setHistoryList] = useState<QuizHistoryItem[]>([]);

  // Load history from localStorage
  const loadHistory = () => {
    try {
      const raw = localStorage.getItem('quiz_history');
      if (raw) {
        setHistoryList(JSON.parse(raw));
      } else {
        setHistoryList([]);
      }
    } catch {
      setHistoryList([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('quiz_history');
      setHistoryList([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Extract quiz metadata
  const qData = quiz.quizData || (quiz as any);
  const examInfo = qData.examInfo || (quiz as any).examInfo || {};
  const author = quiz.author || qData.author || examInfo.author || '';
  let rawSchool = quiz.school || qData.school || examInfo.school || '';
  if (!rawSchool || rawSchool === 'EduSpace by ND Labs') {
    rawSchool = 'EduND by ND Labs';
  }
  const school = rawSchool;
  const grade =
    quiz.grade || quiz.class || qData.grade || qData.class || examInfo.grade || examInfo.class || '';
  const subject = quiz.subject || qData.subject || examInfo.subject || '';
  const book = quiz.book || qData.book || examInfo.book || '';
  const lesson = quiz.lesson || qData.lesson || examInfo.lesson || '';
  const year = quiz.year || qData.year || examInfo.year || '';
  const department = quiz.department || qData.department || examInfo.department || '';
  const examName = quiz.examName || qData.examName || examInfo.examName || '';
  const attempt = quiz.attempt || qData.attempt || examInfo.attempt || '';

  // Format created date
  let createdDateStr = '';
  const rawCreatedAt = quiz.createdAt || qData.createdAt || quiz.updatedAt || qData.updatedAt;
  if (rawCreatedAt) {
    try {
      if (typeof rawCreatedAt.toDate === 'function') {
        createdDateStr = rawCreatedAt.toDate().toLocaleDateString('vi-VN');
      } else if (rawCreatedAt.seconds) {
        createdDateStr = new Date(rawCreatedAt.seconds * 1000).toLocaleDateString('vi-VN');
      } else {
        const d = new Date(rawCreatedAt);
        if (!isNaN(d.getTime())) {
          createdDateStr = d.toLocaleDateString('vi-VN');
        }
      }
    } catch {
      createdDateStr = '';
    }
  }

  const metaFields = [
    { label: 'Tác giả', value: author, icon: '👤' },
    { label: 'Nơi tạo đề', value: school, icon: '🏫' },
    { label: 'Đơn vị', value: department, icon: '🏛️' },
    { label: 'Kỳ thi', value: examName, icon: '📋' },
    { label: 'Loại đề', value: attempt, icon: '📄' },
    { label: 'Lớp / Khối', value: grade, icon: '🎒' },
    { label: 'Môn học', value: subject, icon: '📚' },
    { label: 'Sách giáo khoa', value: book, icon: '📖' },
    { label: 'Bài học', value: lesson, icon: '📝' },
    { label: 'Năm học', value: year, icon: '📅' },
    { label: 'Ngày tạo đề', value: createdDateStr, icon: '🕒' },
  ].filter((f) => f.value && String(f.value).trim() !== '');

  const questions = qData.questions || quiz.questions || [];
  const struct = qData.examStructure || quiz.quizData?.examStructure;
  const matrixDuration =
    quiz.matrixDuration || qData.matrixDuration || quiz.duration || qData.duration || 45;
  const fullDuration = quiz.fullDuration || qData.fullDuration || 90;

  const hasConfiguredCounts = Boolean(
    struct &&
      struct.counts &&
      Object.values(struct.counts).some((v) => Number(v) > 0)
  );

  const matrixCount = hasConfiguredCounts
    ? (Number(struct.counts.multiple) || 0) +
      (Number(struct.counts.truefalse) || 0) +
      (Number(struct.counts.short) || 0) +
      (Number(struct.counts.matching) || 0) +
      (Number(struct.counts.cloze) || 0) +
      (Number(struct.counts.ordering) || 0) +
      (Number(struct.counts.essay) || 0)
    : questions.length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center py-6 px-4">
      {/* Background ambient decorative blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Start Screen */}
      {step === 'start' && (
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-blue-500/10 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden transition-all duration-300">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100/80 mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              EduND Exam
            </span>
          </div>

          {/* Quiz Title */}
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
            {quiz.title || qData.title || 'Đề kiểm tra trực tuyến'}
          </h1>

          {/* Description */}
          <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-xl mx-auto leading-relaxed">
            {quiz.description ||
              qData.description ||
              'Hệ thống đã chuẩn bị đầy đủ câu hỏi và cấu trúc đề thi. Chúc bạn hoàn thành bài kiểm tra với kết quả tốt nhất.'}
          </p>

          {/* Metadata Section (if available) */}
          {metaFields.length > 0 && (
            <div className="w-full max-w-md mx-auto my-5 p-4.5 bg-slate-50/90 rounded-2xl border border-slate-200/60 shadow-xs text-left">
              <div className="space-y-2 text-xs">
                {metaFields.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 py-1 border-b border-slate-200/50 last:border-0"
                  >
                    <span className="text-slate-400 font-semibold shrink-0">
                      {f.icon} {f.label}:
                    </span>
                    <span className="font-extrabold text-slate-800 break-words">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="my-6 py-4 px-6 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-center gap-4 md:gap-8 text-slate-400 flex-wrap">
            <div className="flex flex-col items-center">
              <span className="text-base md:text-lg font-black text-slate-800">
                {matrixCount} câu <span className="text-xs font-bold text-blue-600">({matrixDuration}p)</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Theo ma trận
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-base md:text-lg font-black text-slate-800">
                {questions.length} câu <span className="text-xs font-bold text-indigo-600">({fullDuration}p)</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tất cả câu
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-base md:text-lg font-black text-blue-600">AI</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hỗ trợ giải thích
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep('mode-select')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Bắt đầu làm bài</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                loadHistory();
                setShowHistoryModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Lịch sử làm bài</span>
            </button>
          </div>

          {/* Quick Utility Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs">
            <button
              type="button"
              onClick={onEnterNewCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quay lại Nhập mã đề</span>
            </button>
            <a
              href="/edu"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Về Trang chủ EduND</span>
            </a>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Chia sẻ / Mã QR</span>
            </button>
          </div>

          {/* Guide link */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hướng dẫn sử dụng</span>
            </button>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              © 2026 EduND by ND Labs.
            </p>
          </div>
        </div>
      )}

      {/* Bước 1 / 2: Chọn Chế độ làm bài (Luyện tập hoặc Thi thử) */}
      {step === 'mode-select' && (
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-blue-500/10 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden transition-all duration-300">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100 text-xs font-black text-purple-700 uppercase mb-3">
            <span>Bước 1 / 2 • Chế độ làm bài</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Chọn dạng làm bài</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-6">
            Chọn mục tiêu ôn tập hoặc thi thử của bạn trước khi chọn cấu trúc đề
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            {/* Practice Mode */}
            <div
              onClick={() => {
                setSelectedMode('practice');
                setStep('sampling-select');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1.5">Luyện tập</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Kiểm tra đáp án ngay từng câu. Cho phép xem giải thích chi tiết và làm lại câu chưa đúng.
                </p>
              </div>
              <div className="flex items-center text-emerald-600 font-extrabold text-xs">
                <span>Chọn chế độ Luyện tập</span>
                <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>

            {/* Exam Mode */}
            <div
              onClick={() => {
                setSelectedMode('exam');
                setStep('sampling-select');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-rose-500 bg-white hover:bg-rose-50/30 hover:shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  ⏱️
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1.5">Thi thử</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Mô phỏng kỳ thi nghiêm túc. Cấm AI, cấm làm lại, cấm xem trước đáp án cho đến khi nộp bài.
                </p>
              </div>
              <div className="flex items-center text-rose-600 font-extrabold text-xs">
                <span>Chọn chế độ Thi thử</span>
                <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('start')}
            className="mt-6 text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại thông tin đề</span>
          </button>
        </div>
      )}

      {/* Bước 2 / 2: Chọn Cách kiểm tra (Ma trận hoặc Tất cả câu) */}
      {step === 'sampling-select' && (
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-blue-500/10 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden transition-all duration-300">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100 text-xs font-black text-blue-700 uppercase mb-3">
            <span>Bước 2 / 2 • Cấu trúc đề</span>
          </div>

          <div className="mb-3">
            <span className={`text-xs font-extrabold px-3.5 py-1 rounded-full border ${
              selectedMode === 'exam'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Chế độ đã chọn: {selectedMode === 'exam' ? '⏱️ Thi thử nghiêm túc' : '📖 Luyện tập tự do'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Chọn loại ma trận câu hỏi</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-6">
            Bạn muốn làm bài rút gọn theo ma trận chuẩn hay toàn bộ câu hỏi?
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            {/* Matrix */}
            <div
              onClick={() => {
                setSelectedSampling('matrix');
                onStartExam(selectedMode, 'matrix');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <h3 className="text-lg font-black text-slate-900">Theo ma trận đề</h3>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    {matrixCount} câu • {matrixDuration}p
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Rút trích số lượng câu theo cấu hình ma trận chuẩn. Thời gian làm bài theo cấu hình kiểm tra ({matrixDuration} phút).
                </p>
              </div>
              <div className="flex items-center text-blue-600 font-extrabold text-xs">
                <span>Vào làm bài ngay</span>
                <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>

            {/* All Questions */}
            <div
              onClick={() => {
                setSelectedSampling('full');
                onStartExam(selectedMode, 'full');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  ♾️
                </div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <h3 className="text-lg font-black text-slate-900">Tất cả câu hỏi</h3>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                    {questions.length} câu • {fullDuration}p
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Làm toàn bộ {questions.length} câu hỏi có trong ngân hàng đề. Thời gian làm bài theo chế độ tất cả câu ({fullDuration} phút).
                </p>
              </div>
              <div className="flex items-center text-indigo-600 font-extrabold text-xs">
                <span>Vào làm bài ngay</span>
                <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('mode-select')}
            className="mt-6 text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại chọn dạng làm bài</span>
          </button>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Lịch sử làm bài</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {historyList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Chưa có lịch sử làm bài nào được lưu.
                </div>
              ) : (
                historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:border-blue-400 transition-all text-xs"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-black text-blue-600 uppercase">
                        {item.date}
                      </span>
                      <span className="text-sm font-black text-slate-900">{item.score}đ</span>
                    </div>
                    <p className="font-bold text-slate-800 line-clamp-1 mb-1">{item.title}</p>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Chế độ: {item.mode === 'practice' ? 'Luyện tập' : 'Thi thử'}</span>
                      <span>Đúng: {item.correct}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {historyList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa lịch sử</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Mã QR & Chia sẻ</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Quét mã QR dưới đây bằng điện thoại hoặc máy tính bảng để truy cập nhanh bài thi này
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mb-4 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  window.location.href
                )}`}
                alt="QR Code"
                className="w-48 h-48 rounded-xl object-contain bg-white p-2 shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 truncate select-all">
                {window.location.href}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép liên kết</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help / Guidance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Hướng dẫn làm bài</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="font-black text-emerald-900 block mb-1">📖 Chế độ Luyện tập</span>
                <p className="text-emerald-950">
                  Bạn có thể nhấn nút <strong>Kiểm tra</strong> sau khi chọn phương án để xem đáp án đúng, đọc lời giải chi tiết và gợi ý từ trợ lý ảo.
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
                <span className="font-black text-rose-900 block mb-1">⏱️ Chế độ Thi thử</span>
                <p className="text-rose-950">
                  Thời gian làm bài sẽ đếm ngược liên tục. Điểm số và lời giải chỉ hiển thị sau khi bạn bấm <strong>Nộp bài</strong> hoặc khi hết thời gian.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-black text-slate-800 block mb-1">🚩 Tiện ích trong phòng thi</span>
                <ul className="list-disc list-inside space-y-1">
                  <li>Sử dụng bản đồ câu hỏi bên phải để di chuyển nhanh giữa các câu.</li>
                  <li>Bấm <strong>Đặt cờ</strong> để lưu ý các câu chưa chắc chắn.</li>
                  <li>Hệ thống tự động lưu bài làm và tự động nộp bài khi hết giờ.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-right">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
