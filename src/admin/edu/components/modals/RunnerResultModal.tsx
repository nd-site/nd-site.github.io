import React from 'react';
import { Trophy, RotateCcw, Eye, X } from 'lucide-react';

interface RunnerResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalScore10: string;
  totalAchieved: number;
  totalPossible: number;
  correctCount: number;
  wrongCount: number;
  timeSpent: string;
  onEnterReviewMode: () => void;
  onRestartExam: () => void;
}

export const RunnerResultModal: React.FC<RunnerResultModalProps> = ({
  isOpen,
  onClose,
  finalScore10,
  totalAchieved,
  totalPossible,
  correctCount,
  wrongCount,
  timeSpent,
  onEnterReviewMode,
  onRestartExam,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900">Kết quả bài kiểm tra</h3>
          <p className="text-xs text-slate-500 mt-1">Chuẩn hóa điểm số theo thang điểm 10 GDPT 2018</p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            Điểm số quy đổi (Hệ 10)
          </div>
          <div className="text-5xl font-black text-blue-600 font-mono tracking-tight">
            {finalScore10}
          </div>
          <div className="text-xs font-bold text-slate-600 mt-2 flex items-center justify-center gap-1.5">
            <span>Điểm thực tế:</span>
            <span className="font-black text-amber-700 font-mono">
              {totalAchieved} / {totalPossible} điểm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100">
            <div className="text-lg font-black">{correctCount}</div>
            <div>Đúng</div>
          </div>
          <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-100">
            <div className="text-lg font-black">{wrongCount}</div>
            <div>Sai</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-2.5 rounded-xl border border-slate-200">
            <div className="text-lg font-black">{timeSpent}</div>
            <div>Thời gian</div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onEnterReviewMode}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Xem lại bài làm</span>
          </button>
          <button
            type="button"
            onClick={onRestartExam}
            className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
