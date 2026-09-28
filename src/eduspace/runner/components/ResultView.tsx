import React from 'react';
import { Award, CheckCircle, Clock, RotateCcw, ShieldCheck, User } from 'lucide-react';
import type { OfficialResult } from '../types.ts';

interface ResultViewProps {
  result: OfficialResult;
  examTitle?: string;
  onRetake?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, examTitle, onRetake }) => {
  const percentage = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0;
  const isPass = percentage >= 50;

  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;
  const timeFormatted = `${minutes} phút ${seconds} giây`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Beta Notice Banner */}
      <div className="mb-6 bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs text-indigo-900">
            <span className="font-bold">EduSpace Exam V3 Beta</span> • Kết quả được tính toán và lưu trữ bởi Server-Authoritative Engine.
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-200/60 text-indigo-800 rounded-md shrink-0">
          BETA • Thử nghiệm
        </span>
      </div>

      {/* Main Score Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
          {examTitle || `Bài thi: ${result.examId}`}
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Mã kết quả: <span className="font-mono text-slate-700">{result.id}</span>
        </p>

        <div className="inline-flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-6 min-w-[200px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Điểm số đạt được
          </span>
          <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 font-mono">
            {result.totalScore.toFixed(2)}
            <span className="text-xl md:text-2xl font-normal text-slate-400"> / {result.maxScore.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-600">
            Tỉ lệ hoàn thành: <span className="font-bold text-slate-800">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Candidate & Metadata details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-xs mb-6">
          <div>
            <div className="text-slate-400 font-medium">NDID</div>
            {/* Raw string invariant: 100% untouched without @ prefix */}
            <div className="font-mono font-bold text-slate-800 truncate" title={result.studentNdid}>
              {result.studentNdid}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">CodeID</div>
            <div className="font-mono font-bold text-slate-800">{result.studentCodeId}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Thời gian làm</div>
            <div className="font-semibold text-slate-800">{timeFormatted}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Trạng thái</div>
            <div className="font-bold text-emerald-600 capitalize">{result.status}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/eduspace/v3/"
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs md:text-sm font-semibold transition"
          >
            Về trang chủ V3 Beta
          </a>
          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold shadow-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài thi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
