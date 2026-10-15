import React, { useState, useEffect } from 'react';
import { ArrowRight, Home, KeyRound, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { fetchQuizById } from '../services/firebaseService';
import type { QuizRecord } from '../types';

interface ExamCodeInputScreenProps {
  onSelectExamId: (id: string) => void;
  initialError?: string;
}

export const ExamCodeInputScreen: React.FC<ExamCodeInputScreenProps> = ({
  onSelectExamId,
  initialError = '',
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError);
  const [searching, setSearching] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<QuizRecord | null>(null);

  // Debounce search preview
  useEffect(() => {
    const trimmed = code.trim().toLowerCase();
    if (trimmed.length < 3) {
      setPreviewQuiz(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await fetchQuizById(trimmed);
        if (found) {
          setPreviewQuiz(found);
          setError('');
        } else {
          setPreviewQuiz(null);
        }
      } catch {
        setPreviewQuiz(null);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [code]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã đề thi.');
      return;
    }
    setError('');
    onSelectExamId(trimmed);
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center py-6 px-4">
      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-blue-500/10 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/80 mb-4 shadow-xs">
          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
            Nhập mã đề thi
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Phòng thi trực tuyến EduND</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Nhập mã đề thi (Code ID) do giáo viên cung cấp để vào phòng thi
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Nhập mã đề (ví dụ: thptqg-2026-v1)..."
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl text-center text-sm md:text-base font-mono font-bold tracking-wider text-slate-900 focus:outline-none transition-all placeholder:font-sans placeholder:text-xs placeholder:text-slate-400 placeholder:tracking-normal uppercase"
            />
            {error && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-rose-500 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Realtime Preview */}
          {searching && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Đang tra cứu mã đề...</span>
            </div>
          )}

          {previewQuiz && !searching && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tìm thấy đề thi</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{previewQuiz.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1">
                {[previewQuiz.subject, previewQuiz.grade, previewQuiz.author]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Vào làm bài</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
          <a
            href="/edu"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về Trang chủ EduND</span>
          </a>
        </div>
      </div>
    </div>
  );
};
