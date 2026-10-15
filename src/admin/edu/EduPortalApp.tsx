import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  Flame,
  ShieldCheck,
  Play,
  ArrowRight,
  Filter,
  Sparkles,
  ExternalLink,
  Lock,
  FileEdit,
  Calendar,
  KeyRound,
  Keyboard,
  Languages,
  X,
} from 'lucide-react';
import { Toast } from './components/Toast';
import {
  listenToAdminAuth,
  subscribeToQuizzesRealtime,
  subscribeToCategoriesRealtime,
  canUserViewQuiz,
  DEFAULT_CATEGORIES,
} from './services/firebaseService';
import type { QuizRecord, AdminUser, EduCategoriesConfig, ToastMessage } from './types';

export const EduPortalApp: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [categories, setCategories] = useState<EduCategoriesConfig>(DEFAULT_CATEGORIES);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'verified' | 'hot'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Code Modal state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [quickExamCode, setQuickExamCode] = useState('');
  const [quickCodeError, setQuickCodeError] = useState('');

  const handleQuickCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickExamCode.trim();
    if (!trimmed) {
      setQuickCodeError('Vui lòng nhập mã đề thi.');
      return;
    }
    window.location.href = `/edu/exam/?id=${encodeURIComponent(trimmed)}`;
  };

  // Tools list for EduND portal (extensible for future tools)
  const eduTools = useMemo(() => [
    {
      id: 'create-exam',
      title: 'Tạo đề thi',
      desc: 'Soạn đề GDPT 2018',
      icon: FileEdit,
      href: '/edu/teacher/exam',
      badge: 'Giáo viên',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-500/10 text-blue-600',
      borderColor: 'hover:border-blue-400 hover:shadow-blue-500/10',
    },
    {
      id: 'exam-by-code',
      title: 'Vào bằng mã đề',
      desc: 'Nhập mã vào thi ngay',
      icon: KeyRound,
      onClick: () => setShowCodeModal(true),
      badge: 'Thi nhanh',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500/10 text-amber-600',
      borderColor: 'hover:border-amber-400 hover:shadow-amber-500/10',
    },
    {
      id: 'timetable',
      title: 'Thời khóa biểu',
      desc: 'Lịch học trực tuyến',
      icon: Calendar,
      href: '/edu/timetable/',
      badge: 'TimeTable',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      borderColor: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    },
    {
      id: 'poem',
      title: 'PoemND',
      desc: 'Học thuộc thơ thông minh',
      icon: BookOpen,
      href: '/edu/poem/',
      badge: 'Học thơ',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-500/10 text-purple-600',
      borderColor: 'hover:border-purple-400 hover:shadow-purple-500/10',
    },
    {
      id: 'typing',
      title: 'Luyện gõ phím',
      desc: 'Gõ 10 ngón tốc độ cao',
      icon: Keyboard,
      href: '/edu/typing-master/',
      badge: 'Kỹ năng',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: 'bg-sky-500/10 text-sky-600',
      borderColor: 'hover:border-sky-400 hover:shadow-sky-500/10',
    },
    {
      id: 'voc',
      title: 'EduVoc',
      desc: 'Từ vựng Flashcard AI',
      icon: Languages,
      href: '/edu/voc/',
      badge: 'Từ vựng',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-500/10 text-rose-600',
      borderColor: 'hover:border-rose-400 hover:shadow-rose-500/10',
    },
  ], []);

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

  // 1. Auth Listener
  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    listenToAdminAuth((authedUser) => {
      setUser(authedUser);
    }).then((u) => {
      unsubAuth = u;
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // 2. Realtime Categories
  useEffect(() => {
    let unsubCat: (() => void) | null = null;
    subscribeToCategoriesRealtime((cat) => {
      setCategories(cat);
    }).then((u) => {
      unsubCat = u;
    });

    return () => {
      if (unsubCat) unsubCat();
    };
  }, []);

  // 3. Realtime Quizzes
  useEffect(() => {
    let unsubQuiz: (() => void) | null = null;
    subscribeToQuizzesRealtime(
      (remoteQuizzes) => {
        setQuizzes(remoteQuizzes);
        setIsRealtimeConnected(true);
      },
      () => {
        setIsRealtimeConnected(false);
      }
    ).then((u) => {
      unsubQuiz = u;
    });

    return () => {
      if (unsubQuiz) unsubQuiz();
    };
  }, []);

  // Visible quizzes (public, unlisted, or private if user is allowed)
  const accessibleQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (q.visibility === 'private') {
        return canUserViewQuiz(user, q);
      }
      return true;
    });
  }, [quizzes, user]);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();

    return accessibleQuizzes.filter((item) => {
      const g = (item.grade || item.class || item.quizData?.grade || item.quizData?.class || '').trim();
      const s = (item.subject || item.quizData?.subject || '').trim();
      const t = (item.examType || item.quizData?.examType || '').trim();
      const title = (item.title || item.quizData?.title || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const author = (item.author || item.quizData?.author || '').toLowerCase();

      if (selectedGrade && g !== selectedGrade) return false;
      if (selectedSubject && s !== selectedSubject) return false;
      if (selectedExamType && t !== selectedExamType) return false;

      if (selectedTab === 'verified' && !item.isVerified) return false;
      if (selectedTab === 'hot' && !item.isHot) return false;

      if (qLower) {
        const matches =
          id.includes(qLower) ||
          title.includes(qLower) ||
          s.toLowerCase().includes(qLower) ||
          g.toLowerCase().includes(qLower) ||
          author.includes(qLower);
        if (!matches) return false;
      }

      return true;
    });
  }, [accessibleQuizzes, selectedGrade, selectedSubject, selectedExamType, selectedTab, searchQuery]);

  const displayNdid = user?.ndid || user?.displayName || user?.uid || '';
  const isTeacherOrAdmin =
    user?.role === 'teacher' ||
    user?.eduRole === 'teacher' ||
    user?.role === 'admin' ||
    user?.adminLevel === 'owner';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Hero Header - Light & Vibrant Modern Theme */}
      <header className="relative bg-gradient-to-b from-blue-50/90 via-sky-50/60 to-slate-50 border-b border-slate-200/80 overflow-hidden">
        {/* Soft Ambient Glow Orbs */}
        <div 
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl pointer-events-none -z-10" 
          aria-hidden="true"
        />
        <div 
          className="absolute top-12 right-0 w-96 h-96 rounded-full bg-sky-200/25 blur-3xl pointer-events-none -z-10" 
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide text-slate-900 block">
                  EduND • Khảo Thí &amp; Ôn Luyện
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Hệ thống kiểm tra trực tuyến chuẩn GDPT 2018
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Realtime indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-slate-600 border border-slate-200/90 shadow-2xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span>{isRealtimeConnected ? `Realtime (${quizzes.length} đề)` : 'Ngoại tuyến'}</span>
              </div>

              {/* User NDID raw string */}
              {displayNdid && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-2xl border border-slate-200/90 text-xs shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {displayNdid.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-800 text-xs font-mono">{displayNdid}</span>
                </div>
              )}

              {/* Link to Teacher Exam Authoring */}
              <a
                href="/edu/teacher/exam"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Cổng Giáo Viên</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              {/* Link to Admin if admin */}
              {(user?.role === 'admin' || user?.adminLevel === 'owner') && (
                <a
                  href="/admin/edu"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </a>
              )}
            </div>
          </div>

          {/* Banner Title */}
          <div className="max-w-3xl pt-1 space-y-1.5">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Phòng Thi &amp; Ngân Hàng Đề Thi <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">Trực Tuyến</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
              Luyện tập và thi thử các bộ đề kiểm tra thường xuyên, giữa kì, cuối kì và đề thi tốt nghiệp THPT chuẩn cấu trúc mới.
            </p>
          </div>

          {/* Quick Tools Row */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Công cụ học tập &amp; Khảo thí
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {eduTools.length} công cụ
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {eduTools.map((tool) => {
                const IconComponent = tool.icon;
                const cardInner = (
                  <div className={`h-full bg-white/95 hover:bg-white rounded-2xl p-3.5 border border-slate-200/80 ${tool.borderColor} shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer text-left`}>
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <div className={`w-8 h-8 rounded-xl ${tool.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {tool.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors block truncate">
                        {tool.title}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                        {tool.desc}
                      </span>
                    </div>
                  </div>
                );

                if (tool.onClick) {
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={tool.onClick}
                      className="block text-left w-full h-full focus:outline-none"
                    >
                      {cardInner}
                    </button>
                  );
                }

                return (
                  <a
                    key={tool.id}
                    href={tool.href}
                    className="block text-left h-full no-underline focus:outline-none"
                  >
                    {cardInner}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[100010] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Vào thi bằng mã đề</h3>
                  <p className="text-xs text-slate-500">Nhập mã đề hoặc mã phòng thi được cung cấp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCodeModal(false);
                  setQuickCodeError('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã đề thi</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={quickExamCode}
                    onChange={(e) => {
                      setQuickExamCode(e.target.value);
                      if (quickCodeError) setQuickCodeError('');
                    }}
                    placeholder="VD: toan-10-gk1, vatly-12-tx1..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                {quickCodeError && (
                  <p className="text-xs font-bold text-rose-600 mt-1">{quickCodeError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                >
                  Vào làm bài thi
                </button>
                <a
                  href="/edu/exam/"
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  title="Mở phòng thi chuyên dụng"
                >
                  Phòng thi
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-slate-200/90 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đề, tên đề, tác giả..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Grade Selector */}
            <div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả khối lớp</option>
                {categories.grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả môn học</option>
                {categories.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type Selector */}
            <div>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại bài kiểm tra</option>
                {categories.examTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả đề ({accessibleQuizzes.length})
            </button>

            <button
              onClick={() => setSelectedTab('verified')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'verified'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã kiểm duyệt ({accessibleQuizzes.filter((q) => q.isVerified).length})</span>
            </button>

            <button
              onClick={() => setSelectedTab('hot')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'hot'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Đề nổi bật ({accessibleQuizzes.filter((q) => q.isHot).length})</span>
            </button>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const qData = quiz.quizData || (quiz as any);
            const qCount = qData.questions?.length || quiz.questions?.length || 0;
            // Display duration according to matrix duration
            const displayDuration =
              quiz.matrixDuration || qData.matrixDuration || quiz.duration || qData.duration || 45;
            const authorName = quiz.author || qData.author || '';

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header of card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                        {quiz.id}
                      </span>
                      {(quiz.grade || quiz.class) && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {quiz.grade || quiz.class}
                        </span>
                      )}
                      {quiz.subject && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {quiz.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {quiz.isVerified && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold"
                          title="Đề thi đã được kiểm duyệt và chứng nhận đạt chuẩn"
                        >
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Chuẩn GDPT</span>
                        </span>
                      )}
                      {quiz.isHot && (
                        <span
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold"
                          title="Đề nổi bật"
                        >
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Hot</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {quiz.title || qData.title || 'Đề thi không có tiêu đề'}
                  </h3>

                  {quiz.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>
                  )}

                  {/* Details */}
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{displayDuration} phút</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{qCount} câu</span>
                    </span>
                    {authorName && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[120px] text-slate-600" title={`Tác giả: ${authorName}`}>
                          {authorName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {quiz.examType && (
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {quiz.examType}
                    </span>
                  )}

                  <a
                    href={`/edu/exam?id=${encodeURIComponent(quiz.id)}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all ml-auto cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Làm bài thi</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-extrabold text-sm text-slate-700">Chưa tìm thấy đề thi phù hợp</p>
            <p className="text-xs">Thử chọn khối lớp hoặc môn học khác.</p>
          </div>
        )}
      </main>
    </div>
  );
};
