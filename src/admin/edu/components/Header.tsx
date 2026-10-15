import React from 'react';
import {
  Sparkles,
  Key,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Radio,
  GraduationCap,
} from 'lucide-react';
import type { AdminUser } from '../types';

interface HeaderProps {
  user: AdminUser | null;
  isRealtimeConnected: boolean;
  totalSyncedExams: number;
  onOpenAIGen: () => void;
  onOpenGeminiKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isRealtimeConnected,
  totalSyncedExams,
  onOpenAIGen,
  onOpenGeminiKey,
}) => {
  const isOwner = user?.adminLevel === 'owner';
  const roleLabel = isOwner
    ? 'Chủ sở hữu'
    : user?.role === 'admin'
    ? 'Quản trị viên'
    : 'Giáo viên';

  // NDID: strictly preserve raw string, never prefix '@'
  const displayNdid = user?.ndid || user?.displayName || user?.uid || 'Admin';

  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
      <div>
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 mb-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-blue-600 font-extrabold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            EduND Central
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span
              className={`text-[11px] font-bold ${
                isRealtimeConnected ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {isRealtimeConnected ? `Realtime Sync (${totalSyncedExams} đề)` : 'Ngoại tuyến'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <span>Quản trị &amp; Khảo thí EduND</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Hệ thống biên soạn đề thi chuẩn GDPT 2018, đồng bộ Firestore thời gian thực và phòng thi mô phỏng.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* User profile tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
            {displayNdid.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-slate-800 block text-xs">{displayNdid}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{roleLabel}</span>
          </div>
        </div>

        {/* AI Action button */}
        <button
          onClick={onOpenAIGen}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Tạo câu hỏi</span>
        </button>

        {/* Gemini key setup */}
        <button
          onClick={onOpenGeminiKey}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
          title="Cài đặt Gemini API Key cá nhân"
        >
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span>Gemini Key</span>
        </button>

        {/* Back to main Admin */}
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Admin</span>
        </a>

        {/* View Home */}
        <a
          href="/edu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          <span>Edu</span>
        </a>
      </div>
    </header>
  );
};
