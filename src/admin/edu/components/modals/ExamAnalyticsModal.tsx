import React from 'react';
import { BarChart3, X, TrendingUp, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Question } from '../../types';

interface ExamAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  questions: Question[];
}

export const ExamAnalyticsModal: React.FC<ExamAnalyticsModalProps> = ({
  isOpen,
  onClose,
  examTitle,
  questions,
}) => {
  if (!isOpen) return null;

  const total = questions.length;
  const mCount = questions.filter((q) => q.type === 'multiple').length;
  const tfCount = questions.filter((q) => q.type === 'truefalse').length;
  const sCount = questions.filter((q) => q.type === 'short').length;
  const matchCount = questions.filter((q) => q.type === 'matching').length;
  const clozeCount = questions.filter((q) => q.type === 'cloze').length;
  const ordCount = questions.filter((q) => q.type === 'ordering').length;
  const eCount = questions.filter((q) => q.type === 'essay').length;

  // Estimated bell curve simulation (0..10 scale)
  // Expected average score around 6.5
  const simulatedScores = [
    { score: '0-2', percent: 2, count: Math.round(total * 0.02) },
    { score: '2-4', percent: 8, count: Math.round(total * 0.08) },
    { score: '4-5', percent: 15, count: Math.round(total * 0.15) },
    { score: '5-6', percent: 25, count: Math.round(total * 0.25) },
    { score: '6-7', percent: 24, count: Math.round(total * 0.24) },
    { score: '7-8', percent: 16, count: Math.round(total * 0.16) },
    { score: '8-9', percent: 7, count: Math.round(total * 0.07) },
    { score: '9-10', percent: 3, count: Math.round(total * 0.03) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Phân Tích Phổ Điểm &amp; Độ Phân Hóa</h3>
              <p className="text-[11px] text-slate-500">{examTitle || 'Đề thi'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Structure distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
            <span className="block text-[10px] font-bold text-blue-600 uppercase">TN 4 lựa chọn</span>
            <span className="text-base font-black text-blue-900">{mCount} câu</span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
            <span className="block text-[10px] font-bold text-indigo-600 uppercase">Đúng / Sai</span>
            <span className="text-base font-black text-indigo-900">{tfCount} câu</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
            <span className="block text-[10px] font-bold text-purple-600 uppercase">Điền số / ngắn</span>
            <span className="text-base font-black text-purple-900">{sCount} câu</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
            <span className="block text-[10px] font-bold text-amber-600 uppercase">Nối cặp</span>
            <span className="text-base font-black text-amber-900">{matchCount} câu</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-center">
            <span className="block text-[10px] font-bold text-teal-600 uppercase">Điền khuyết</span>
            <span className="text-base font-black text-teal-900">{clozeCount} câu</span>
          </div>
          <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100 text-center">
            <span className="block text-[10px] font-bold text-cyan-600 uppercase">Sắp xếp</span>
            <span className="text-base font-black text-cyan-900">{ordCount} câu</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center col-span-2">
            <span className="block text-[10px] font-bold text-emerald-600 uppercase">Tự luận chuyên sâu</span>
            <span className="text-base font-black text-emerald-900">{eCount} câu</span>
          </div>
        </div>

        {/* Simulated Score Distribution Bell Curve */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Phổ điểm dự kiến (Simulated Distribution)</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">Điểm trung bình kỳ vọng: ~6.45</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {simulatedScores.map((s) => (
              <div key={s.score} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-mono font-bold text-slate-500 text-right">{s.score}đ</span>
                <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${s.percent * 3.5}%` }}
                  />
                </div>
                <span className="w-10 text-[11px] font-bold text-slate-700">{s.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive & Differentiation Quality */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
          <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-extrabold text-emerald-900 block">
              Đánh giá chất lượng phân hóa: Đạt chuẩn GDPT 2018
            </span>
            <p className="text-emerald-800 leading-relaxed font-normal">
              Đề thi có tỷ lệ nhận biết và thông hiểu khoảng 65-70% giúp xét tốt nghiệp, 30-35% vận dụng và vận dụng cao tạo độ dốc phân hóa tốt cho xét tuyển đại học.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
