import React from 'react';
import { Send, CloudCheck, CloudUpload, AlertTriangle } from 'lucide-react';
import { Timer } from './Timer.tsx';

interface HeaderProps {
  title: string;
  expiresAt: string;
  serverNow?: string;
  autosaveStatus: 'saved' | 'saving' | 'error';
  answeredCount: number;
  totalQuestions: number;
  onSubmitClick: () => void;
  onTimerExpire: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  expiresAt,
  serverNow,
  autosaveStatus,
  answeredCount,
  totalQuestions,
  onSubmitClick,
  onTimerExpire
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/eduspace/v3/"
            className="flex items-center gap-2 group shrink-0"
            title="Về EduSpace V3 Hub"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition">
              V3
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 tracking-tight leading-tight flex items-center gap-1.5">
                EduSpace Exam V3
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-md">
                  BETA • Thử nghiệm
                </span>
              </div>
            </div>
          </a>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          <h1 className="text-sm md:text-base font-semibold text-slate-800 truncate" title={title}>
            {title}
          </h1>
        </div>

        {/* Right: Autosave Status, Timer & Submit */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0">
          {/* Autosave status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500" title="Trạng thái tự động lưu">
            {autosaveStatus === 'saving' && (
              <>
                <CloudUpload className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="hidden sm:inline text-indigo-600">Đang lưu...</span>
              </>
            )}
            {autosaveStatus === 'saved' && (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline text-slate-500">Đã lưu đám mây</span>
              </>
            )}
            {autosaveStatus === 'error' && (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline text-amber-600">Lưu chưa hoàn tất</span>
              </>
            )}
          </div>

          {/* Question progress */}
          <div className="hidden lg:flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            <span>Đã làm:</span>
            <span className="ml-1 font-bold text-indigo-600">{answeredCount}</span>
            <span className="mx-0.5">/</span>
            <span>{totalQuestions}</span>
          </div>

          {/* Timer */}
          <Timer
            expiresAt={expiresAt}
            serverNow={serverNow}
            onExpire={onTimerExpire}
          />

          {/* Submit button */}
          <button
            type="button"
            onClick={onSubmitClick}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold shadow-sm transition active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>
    </header>
  );
};
