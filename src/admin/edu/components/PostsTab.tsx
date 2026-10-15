import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Link,
  Layers,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle,
  Users,
  Settings2,
} from 'lucide-react';
import { canUserEditQuiz, canUserDeleteQuiz } from '../services/firebaseService';
import type { QuizRecord, AdminUser } from '../types';

interface PostsTabProps {
  quizzes: QuizRecord[];
  user: AdminUser | null;
  isRealtimeConnected: boolean;
  onLoadToEditor: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onCopyShareLink: (id: string) => void;
  onToggleHot?: (id: string, currentVal: boolean) => void;
  onToggleVerified?: (id: string, currentVal: boolean) => void;
  onOpenCategoryManager?: () => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  quizzes,
  user,
  isRealtimeConnected,
  onLoadToEditor,
  onDeleteQuiz,
  onCopyShareLink,
  onToggleHot,
  onToggleVerified,
  onOpenCategoryManager,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'hot' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdmin =
    user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';

  // Extract dynamic grades with counts from realtime quizzes
  const gradeFacets = useMemo(() => {
    const map = new Map<string, number>();
    quizzes.forEach((q) => {
      const g = (q.grade || q.class || q.quizData?.grade || q.quizData?.class || '').trim();
      if (g) {
        map.set(g, (map.get(g) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true }));
  }, [quizzes]);

  // Extract dynamic subjects
  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      const s = (q.subject || q.quizData?.subject || '').trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [quizzes]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();

    return quizzes.filter((item) => {
      const g = (item.grade || item.class || item.quizData?.grade || item.quizData?.class || '').trim();
      const s = (item.subject || item.quizData?.subject || '').trim();
      const title = (item.title || item.quizData?.title || '').toLowerCase();
      const desc = (item.description || item.quizData?.description || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const author = (item.author || item.quizData?.author || '').toLowerCase();

      if (selectedGrade && g !== selectedGrade) return false;
      if (selectedSubject && s !== selectedSubject) return false;

      // Status filter
      if (selectedStatus === 'verified' && !item.isVerified) return false;
      if (selectedStatus === 'hot' && !item.isHot) return false;
      if (selectedStatus === 'mine') {
        const isMine =
          (item.creatorUid && item.creatorUid === user?.uid) ||
          (item.creatorNdid && user?.ndid && item.creatorNdid.toLowerCase() === user.ndid.toLowerCase()) ||
          (Array.isArray(item.collaborators) &&
            user?.ndid &&
            item.collaborators.some((c) => c.toLowerCase() === user.ndid?.toLowerCase()));
        if (!isMine) return false;
      }

      if (qLower) {
        const matches =
          id.includes(qLower) ||
          title.includes(qLower) ||
          desc.includes(qLower) ||
          s.toLowerCase().includes(qLower) ||
          g.toLowerCase().includes(qLower) ||
          author.includes(qLower);
        if (!matches) return false;
      }

      return true;
    });
  }, [quizzes, selectedGrade, selectedSubject, selectedStatus, searchQuery, user]);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/90 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {isAdmin ? 'Quản lý toàn bộ đề thi' : 'Kho đề thi & Cộng tác'}
              </h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime ({quizzes.length} đề)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đồng bộ dữ liệu trực tiếp với Firestore theo thời gian thực.
            </p>
          </div>

          {isAdmin && onOpenCategoryManager && (
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm w-fit"
            >
              <Settings2 className="w-4 h-4 text-blue-600" />
              <span>Quản lý danh mục</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đề, tiêu đề, môn học, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {gradeFacets.map(({ grade, count }) => (
                <option key={grade} value={grade}>
                  {grade} ({count})
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
              {subjectOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400">Trạng thái:</span>
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({quizzes.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('verified')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'verified'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đã kiểm duyệt ({quizzes.filter((q) => q.isVerified).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('hot')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'hot'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Nổi bật ({quizzes.filter((q) => q.isHot).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('mine')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'mine'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Đề của tôi & Cộng tác</span>
          </button>
        </div>
      </div>

      {/* Quizzes List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.map((quiz) => {
          const qData = quiz.quizData || (quiz as any);
          const qCount =
            qData.questions?.length || quiz.questions?.length || 0;
          const displayDuration =
            quiz.matrixDuration || qData.matrixDuration || quiz.duration || qData.duration || 45;
          const authorName = quiz.author || qData.author || '';
          const hasCollaborators = Array.isArray(quiz.collaborators) && quiz.collaborators.length > 0;

          const canEdit = canUserEditQuiz(user, quiz);
          const canDelete = canUserDeleteQuiz(user, quiz);

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
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

                  {/* Status Badges */}
                  <div className="flex items-center gap-1">
                    {quiz.isVerified && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold"
                        title="Đề thi đã được kiểm duyệt và chứng nhận đạt chuẩn"
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Đã kiểm duyệt</span>
                      </span>
                    )}

                    {quiz.isHot && (
                      <span
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold"
                        title="Đề thi nổi bật"
                      >
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>Hot</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                  {quiz.title || qData.title || 'Đề thi không có tiêu đề'}
                </h3>

                {quiz.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>
                )}

                {/* Metadata details */}
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

                {hasCollaborators && (
                  <div className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Cộng tác: {quiz.collaborators?.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Admin Quick Toggles */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-600">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Quản trị:
                  </span>
                  <div className="flex items-center gap-2">
                    {onToggleVerified && (
                      <button
                        type="button"
                        onClick={() => onToggleVerified(quiz.id, Boolean(quiz.isVerified))}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          quiz.isVerified
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Bật/Tắt chứng nhận đạt chuẩn"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{quiz.isVerified ? 'Bỏ duyệt' : 'Duyệt chuẩn'}</span>
                      </button>
                    )}

                    {onToggleHot && (
                      <button
                        type="button"
                        onClick={() => onToggleHot(quiz.id, Boolean(quiz.isHot))}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          quiz.isHot
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Bật/Tắt thẻ nổi bật"
                      >
                        <Flame className="w-3 h-3" />
                        <span>{quiz.isHot ? 'Bỏ Hot' : 'Gắn Hot'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  {/* Edit in editor */}
                  <button
                    type="button"
                    onClick={() => onLoadToEditor(quiz.id)}
                    disabled={!canEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    title={canEdit ? 'Nạp vào trình soạn thảo để sửa' : 'Bạn không có quyền sửa đề này'}
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sửa</span>
                  </button>

                  {/* Copy Share Link */}
                  <button
                    type="button"
                    onClick={() => onCopyShareLink(quiz.id)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                    title="Sao chép link làm bài"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </button>

                  {/* Open Student Exam in new tab */}
                  <a
                    href={`/edu/exam?${quiz.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                    title="Mở giao diện phòng thi học sinh"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Delete button (Admin can delete all; teacher can only delete their own) */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteQuiz(quiz.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Xóa đề thi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-extrabold text-sm text-slate-700">Không tìm thấy đề thi phù hợp</p>
          <p className="text-xs">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}
    </div>
  );
};
