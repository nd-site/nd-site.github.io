import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  List,
  Play,
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Key,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Toast } from './components/Toast';
import { EditorTab } from './components/EditorTab';
import { PostsTab } from './components/PostsTab';
import { RunnerTab } from './components/RunnerTab';
import { ClassManagementTab } from './components/ClassManagementTab';
import { AIGenModal } from './components/modals/AIGenModal';
import { AIReviewModal } from './components/modals/AIReviewModal';
import { AIExplanationModal } from './components/modals/AIExplanationModal';
import { GeminiKeyModal } from './components/modals/GeminiKeyModal';
import {
  listenToAdminAuth,
  subscribeToQuizzesRealtime,
  subscribeToCategoriesRealtime,
  publishQuizToFirestore,
  deleteQuizFromFirestore,
  fetchQuizById,
  DEFAULT_CATEGORIES,
} from './services/firebaseService';
import { isValidShortDecimalAnswer } from './services/aiService';
import type {
  AdminUser,
  QuizRecord,
  Question,
  ExamStructure,
  PassageContext,
  EduCategoriesConfig,
  ToastMessage,
  ExamProctoringConfig,
} from './types';

const TEACHER_DRAFT_KEY = 'edu_teacher_editor_draft_v3';

export const TeacherEduApp: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');

  // Active tab: 'editor' | 'posts' | 'runner'
  const [activeTab, setActiveTab] = useState<'editor' | 'posts' | 'runner'>('editor');

  // Realtime system categories
  const [categories, setCategories] = useState<EduCategoriesConfig>(DEFAULT_CATEGORIES);

  // Realtime quizzes
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Editor metadata state
  const [pubId, setPubId] = useState<string>('');
  const [pubTitle, setPubTitle] = useState<string>('');
  const [pubClass, setPubClass] = useState<string>('');
  const [pubSubject, setPubSubject] = useState<string>('');
  const [examType, setExamType] = useState<string>('');
  const [matrixDuration, setMatrixDuration] = useState<number>(45);
  const [fullDuration, setFullDuration] = useState<number>(90);
  const [pubTag, setPubTag] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collaboratorCodeIds, setCollaboratorCodeIds] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<'all' | 'restricted'>('all');
  const [allowedCodeIds, setAllowedCodeIds] = useState<string[]>([]);
  const [metaYear, setMetaYear] = useState<string>('');
  const [metaSchool, setMetaSchool] = useState<string>('EduND by ND Labs');
  const [metaBook, setMetaBook] = useState<string>('');
  const [pubDesc, setPubDesc] = useState<string>('');
  const [pubHot, setPubHot] = useState<boolean>(false);
  const [pubComingSoon, setPubComingSoon] = useState<boolean>(false);
  const [editorViewMode, setEditorViewMode] = useState<'visual' | 'json'>('visual');
  const [proctoring, setProctoring] = useState<ExamProctoringConfig>({
    enabled: false,
    appliedModes: 'exam_only',
    requireLogin: true,
    requireCamera: true,
    recordAudio: true,
    recordScreenLog: true,
    randomSnapshots: true,
  });

  // Structure & Passages & Questions
  const [structure, setStructure] = useState<ExamStructure>({
    enabled: true,
    counts: { multiple: 12, truefalse: 4, short: 6, essay: 0 },
    shuffleWithinType: true,
    matrixDuration: 45,
    fullDuration: 90,
  });
  const [structPoints, setStructPoints] = useState({
    multiple: 0.25,
    truefalse: 1.0,
    short: 0.5,
    essay: 2.0,
    matching: 1.0,
    cloze: 1.0,
    ordering: 1.0,
    multiselect: 1.0,
    grouping: 1.0,
    error_identification: 0.5,
  });
  const [passages, setPassages] = useState<PassageContext[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Modals
  const [isAIGenOpen, setIsAIGenOpen] = useState(false);
  const [isAIReviewOpen, setIsAIReviewOpen] = useState(false);
  const [isAIExplanationOpen, setIsAIExplanationOpen] = useState(false);
  const [isGeminiKeyOpen, setIsGeminiKeyOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, isError = false, type?: 'success' | 'error' | 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalType = type || (isError ? 'error' : 'success');
    setToasts((prev) => [...prev, { id, text, type: finalType }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore Draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEACHER_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.pubId) setPubId(d.pubId);
        if (d.pubTitle) setPubTitle(d.pubTitle);
        if (d.pubClass) setPubClass(d.pubClass);
        if (d.pubSubject) setPubSubject(d.pubSubject);
        if (d.examType) setExamType(d.examType);
        if (d.matrixDuration) setMatrixDuration(d.matrixDuration);
        if (d.fullDuration) setFullDuration(d.fullDuration);
        if (d.pubTag) setPubTag(d.pubTag);
        if (d.metaAuthor !== undefined) setMetaAuthor(d.metaAuthor);
        if (Array.isArray(d.collaborators)) setCollaborators(d.collaborators);
        if (d.metaYear) setMetaYear(d.metaYear);
        if (d.metaSchool) setMetaSchool(d.metaSchool);
        if (d.metaBook) setMetaBook(d.metaBook);
        if (d.pubDesc) setPubDesc(d.pubDesc);
        if (d.proctoring) setProctoring(d.proctoring);
        if (d.structure) setStructure(d.structure);
        if (d.structPoints) setStructPoints(d.structPoints);
        if (Array.isArray(d.passages)) setPassages(d.passages);
        if (Array.isArray(d.questions) && d.questions.length > 0) setQuestions(d.questions);
      }
    } catch (_) {}
  }, []);

  // Autosave Draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (questions.length > 0 || pubTitle) {
        const payload = {
          pubId,
          pubTitle,
          pubClass,
          pubSubject,
          examType,
          matrixDuration,
          fullDuration,
          pubTag,
          metaAuthor,
          collaborators,
          metaYear,
          metaSchool,
          metaBook,
          pubDesc,
          proctoring,
          structure,
          structPoints,
          passages,
          questions,
        };
        try {
          localStorage.setItem(TEACHER_DRAFT_KEY, JSON.stringify(payload));
        } catch (_) {}
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    pubId,
    pubTitle,
    pubClass,
    pubSubject,
    examType,
    matrixDuration,
    fullDuration,
    pubTag,
    metaAuthor,
    collaborators,
    metaYear,
    metaSchool,
    metaBook,
    pubDesc,
    structure,
    structPoints,
    passages,
    questions,
  ]);

  // Auth gate listener
  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    listenToAdminAuth((authedUser, authorized, err) => {
      setUser(authedUser);
      setIsAuthorized(authorized);
      setAuthChecking(false);
      if (err) setAuthError(err);

      // Mặc định gắn thẻ bản thân cho người tạo đề nếu chưa có
      if (authedUser) {
        setMetaAuthor((prev) => {
          if (!prev || prev.trim() === '') {
            return authedUser.ndid || authedUser.displayName || authedUser.uid || 'Nhật Đăng - Admin';
          }
          return prev;
        });
      }
    }).then((u) => {
      unsubAuth = u;
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Realtime categories listener
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

  // Realtime quizzes listener
  useEffect(() => {
    let unsubQuizzes: (() => void) | null = null;
    if (isAuthorized) {
      subscribeToQuizzesRealtime(
        (remoteQuizzes) => {
          setQuizzes(remoteQuizzes);
          setIsRealtimeConnected(true);
        },
        (err) => {
          console.warn('Lỗi Firestore Quizzes:', err);
          setIsRealtimeConnected(false);
        }
      ).then((u) => {
        unsubQuizzes = u;
      });
    }

    return () => {
      if (unsubQuizzes) unsubQuizzes();
    };
  }, [isAuthorized]);

  // Publish Quiz
  const handlePublish = async () => {
    let id = pubId.trim().toLowerCase();
    if (!id) {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < 6; i++) res += chars[Math.floor(Math.random() * chars.length)];
      id = res;
      setPubId(id);
    }

    if (!pubTitle.trim()) {
      addToast('Vui lòng nhập Tiêu đề đề thi.', true);
      return;
    }

    if (questions.length === 0) {
      addToast('Đề thi phải có ít nhất 1 câu hỏi.', true);
      return;
    }

    // Validate short answers
    const invalidShort = questions.findIndex(
      (q) => q.type === 'short' && !isValidShortDecimalAnswer((q as any).correct)
    );
    if (invalidShort >= 0) {
      addToast(`Câu ${invalidShort + 1}: đáp án trả lời ngắn phải là số thập phân.`, true);
      return;
    }

    setIsPublishing(true);
    try {
      addToast('Đang đồng bộ dữ liệu đề thi lên Firestore...', false, 'info');

      // Check existing permissions
      const existing = await fetchQuizById(id);
      if (existing) {
        const isOwnerOrAdmin =
          user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';
        const isCreator =
          (existing.creatorUid && existing.creatorUid === user?.uid) ||
          (existing.creatorNdid && user?.ndid && existing.creatorNdid.toLowerCase() === user.ndid.toLowerCase());
        const isCollaborator =
          Array.isArray(existing.collaborators) &&
          user?.ndid &&
          existing.collaborators.some((c) => c.toLowerCase() === user.ndid?.toLowerCase());

        if (!isOwnerOrAdmin && !isCreator && !isCollaborator) {
          addToast(
            `Mã đề "${id.toUpperCase()}" đã được tạo bởi người khác và bạn không nằm trong danh sách cộng tác viên. Vui lòng đổi mã đề khác.`,
            true
          );
          setIsPublishing(false);
          return;
        }
      }

      // Calculate points
      let calcPoints = questions.reduce((sum, q) => {
        const p =
          q.points !== undefined
            ? Number(q.points)
            : q.type === 'truefalse'
            ? structPoints.truefalse
            : q.type === 'short'
            ? structPoints.short
            : q.type === 'essay'
            ? structPoints.essay
            : structPoints.multiple;
        return sum + (isNaN(p) ? 0 : p);
      }, 0);
      calcPoints = Math.round(calcPoints * 100) / 100;

      const examLayout = {
        multiple: { count: structure.counts.multiple, pointsPerQ: structPoints.multiple },
        truefalse: { count: structure.counts.truefalse, pointsPerQ: structPoints.truefalse },
        short: { count: structure.counts.short, pointsPerQ: structPoints.short },
        essay: { count: structure.counts.essay, pointsPerQ: structPoints.essay },
      };

      const quizDataObj = {
        title: pubTitle.trim(),
        class: pubClass.trim(),
        grade: pubClass.trim(),
        subject: pubSubject.trim(),
        examType: examType.trim(),
        duration: matrixDuration,
        matrixDuration,
        fullDuration,
        author: metaAuthor.trim(),
        school: metaSchool.trim() || 'EduND by ND Labs',
        collaborators,
        collaboratorCodeIds,
        accessType,
        allowedCodeIds,
        year: metaYear.trim(),
        book: metaBook.trim(),
        totalPoints: calcPoints,
        examStructure: {
          ...structure,
          matrixDuration,
          fullDuration,
        },
        config: {
          testDuration: matrixDuration * 60,
          matrixDuration,
          fullDuration,
          examLayout,
          proctoring,
        },
        proctoring,
        passages,
        questions,
      };

      const quizRecord: QuizRecord = {
        id: id.toUpperCase(),
        creatorUid: user?.uid || '0000',
        creatorNdid: user?.ndid || '0000',
        creatorCodeId: user?.codeId || user?.uid || '0000',
        author: metaAuthor.trim(),
        school: metaSchool.trim() || 'EduND by ND Labs',
        collaborators,
        collaboratorCodeIds,
        accessType,
        allowedCodeIds,
        title: pubTitle.trim(),
        description: pubDesc.trim(),
        grade: pubClass.trim(),
        class: pubClass.trim(),
        subject: pubSubject.trim(),
        examType: examType.trim(),
        duration: matrixDuration,
        matrixDuration,
        fullDuration,
        tag: pubTag.trim(),
        isHot: pubHot,
        isComingSoon: pubComingSoon,
        visibility: 'public',
        proctoring,
        passages,
        quizData: quizDataObj,
      };

      await publishQuizToFirestore(quizRecord, user);
      addToast(`Đã xuất bản đề "${pubTitle}" lên Firestore thành công!`);
      setActiveTab('posts');
    } catch (err: any) {
      addToast('Lỗi xuất bản đề: ' + (err?.message || err), true);
    } finally {
      setIsPublishing(false);
    }
  };

  // Load post back to editor
  const handleLoadPostToEditor = async (id: string) => {
    try {
      addToast('Đang nạp đề vào trình soạn thảo...', false, 'info');
      const record = await fetchQuizById(id);
      if (!record) {
        addToast('Không tìm thấy đề thi trên Firestore.', true);
        return;
      }

      const qData = record.quizData || (record as any);
      setPubId(record.id.toLowerCase());
      setPubTitle(qData.title || record.title || '');
      setPubClass(qData.class || qData.grade || record.grade || record.class || '');
      setPubSubject(qData.subject || record.subject || '');
      setExamType(qData.examType || record.examType || '');
      setMatrixDuration(record.matrixDuration || qData.matrixDuration || record.duration || 45);
      setFullDuration(record.fullDuration || qData.fullDuration || 90);
      setPubTag(record.tag || '');
      setMetaAuthor(record.author || qData.author || '');
      setCollaborators(Array.isArray(record.collaborators) ? record.collaborators : []);
      setCollaboratorCodeIds(
        Array.isArray(record.collaboratorCodeIds)
          ? record.collaboratorCodeIds
          : Array.isArray(qData.collaboratorCodeIds)
          ? qData.collaboratorCodeIds
          : []
      );
      setAccessType(record.accessType || qData.accessType || 'all');
      setAllowedCodeIds(
        Array.isArray(record.allowedCodeIds)
          ? record.allowedCodeIds
          : Array.isArray(qData.allowedCodeIds)
          ? qData.allowedCodeIds
          : []
      );
      setMetaYear(qData.year || '');
      setMetaSchool(record.school || qData.school || 'EduND by ND Labs');
      setMetaBook(qData.book || '');
      setPubDesc(record.description || qData.description || '');
      setPubHot(Boolean(record.isHot));
      setPubComingSoon(Boolean(record.isComingSoon));
      if (record.proctoring || qData.proctoring || qData.config?.proctoring) {
        setProctoring(record.proctoring || qData.proctoring || qData.config?.proctoring);
      }

      if (qData.examStructure) {
        setStructure(qData.examStructure);
      }
      if (Array.isArray(record.passages || qData.passages)) {
        setPassages(record.passages || qData.passages || []);
      }
      setQuestions(qData.questions || record.questions || []);

      setActiveTab('editor');
      addToast('Đã nạp đề vào trình soạn thảo thành công.');
    } catch (err: any) {
      addToast('Lỗi nạp đề: ' + (err?.message || err), true);
    }
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đề thi mã "${id}" khỏi hệ thống?`)) {
      return;
    }
    try {
      addToast('Đang xóa đề thi...', false, 'info');
      await deleteQuizFromFirestore(id);
      addToast('Đã xóa đề thi thành công.');
    } catch (err: any) {
      addToast('Lỗi xóa đề: ' + (err?.message || err), true);
    }
  };

  const handleCopyShareLink = (id: string) => {
    const url = `${window.location.origin}/edu/exam/?id=${encodeURIComponent(id)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        addToast('Đã sao chép liên kết làm bài vào bộ nhớ tạm.');
      });
    } else {
      window.prompt('Sao chép liên kết làm bài thi:', url);
    }
  };

  const handleExportJson = () => {
    if (questions.length === 0) {
      addToast('Chưa có câu hỏi nào để xuất.', true);
      return;
    }
    const data = {
      title: pubTitle || 'EduND Quiz',
      subject: pubSubject,
      grade: pubClass,
      examType,
      author: metaAuthor,
      collaborators,
      matrixDuration,
      fullDuration,
      examStructure: structure,
      passages,
      questions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${pubId || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Đã tải tệp JSON về máy.');
  };

  // NDID: raw string preservation
  const displayNdid = user?.ndid || user?.displayName || user?.uid || 'Giáo viên';
  const isAdmin =
    user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';

  const isTeacher =
    isAdmin ||
    user?.eduRole === 'teacher' ||
    user?.role === 'teacher' ||
    user?.role === 'manager';

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang kiểm tra quyền truy cập Cổng Giáo viên...</p>
        </div>
      </div>
    );
  }

  // Require Login
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-900">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Công cụ soạn và quản lý đề thi chỉ dành cho giáo viên đã đăng nhập tài khoản NDID.
          </p>
          <a
            href={`/auth/login/?redirect=${encodeURIComponent(window.location.pathname)}`}
            className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-xs"
          >
            Đăng nhập tài khoản NDID
          </a>
        </div>
      </div>
    );
  }

  // Require Teacher Role
  if (!isTeacher) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-amber-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Không có quyền truy cập</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Tài khoản <span className="font-bold text-slate-800">{displayNdid}</span> chưa được cấp quyền Giáo viên để sử dụng công cụ soạn đề thi. Vui lòng gửi yêu cầu hỗ trợ tới quản trị viên để được phê duyệt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/edu/teacher"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
            >
              Về Cổng Giáo viên
            </a>
            <a
              href="/edu/"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
            >
              Về Cổng EduND
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-blue-600 font-extrabold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                Cổng Giáo Viên • EduND
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
                  {isRealtimeConnected ? `Realtime Sync (${quizzes.length} đề)` : 'Ngoại tuyến'}
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Biên Soạn &amp; Quản Lý Đề Thi
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Soạn thảo đề thi chuẩn GDPT 2018, hỗ trợ ngữ liệu chung, đa phương tiện và phòng thi mô phỏng.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* User Profile */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                {displayNdid.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-slate-800 block text-xs">{displayNdid}</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {isAdmin ? 'Quản trị viên' : 'Giáo viên'}
                </span>
              </div>
            </div>

            {/* AI Generator Button */}
            <button
              onClick={() => setIsAIGenOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tạo câu hỏi</span>
            </button>

            {/* Gemini Key */}
            <button
              onClick={() => setIsGeminiKeyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Cài đặt khóa cá nhân Gemini"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Gemini Key</span>
            </button>

            {/* Link to Dedicated Class Management */}
            <a
              href="/edu/teacher/class"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 transition-all shadow-xs"
              title="Quản lý lớp học và giám sát bài làm"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quản lý Lớp học</span>
            </a>

            {/* Link to Teacher Hub */}
            <a
              href="/edu/teacher"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all shadow-xs"
              title="Về trung tâm công cụ Giáo viên"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cổng Giáo Viên</span>
            </a>

            {/* Admin Portal Link (if admin) */}
            {isAdmin && (
              <a
                href="/admin/edu"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 transition-all"
                title="Đến trang quản trị Edu dành riêng cho Admin/Owner"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Edu</span>
              </a>
            )}

            {/* Back to Home Edu */}
            <a
              href="/edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Học tập</span>
            </a>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Soạn Đề Thi (Split View)</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Kho Đề &amp; Cộng Tác</span>
          </button>

          <button
            onClick={() => setActiveTab('runner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === 'runner'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Thử Làm Đề Đang Tạo</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'editor' && (
          <EditorTab
            user={user}
            categories={categories}
            pubId={pubId}
            setPubId={setPubId}
            pubTitle={pubTitle}
            setPubTitle={setPubTitle}
            pubClass={pubClass}
            setPubClass={setPubClass}
            pubSubject={pubSubject}
            setPubSubject={setPubSubject}
            examType={examType}
            setExamType={setExamType}
            matrixDuration={matrixDuration}
            setMatrixDuration={setMatrixDuration}
            fullDuration={fullDuration}
            setFullDuration={setFullDuration}
            pubTag={pubTag}
            setPubTag={setPubTag}
            metaAuthor={metaAuthor}
            setMetaAuthor={setMetaAuthor}
            collaborators={collaborators}
            setCollaborators={setCollaborators}
            collaboratorCodeIds={collaboratorCodeIds}
            setCollaboratorCodeIds={setCollaboratorCodeIds}
            accessType={accessType}
            setAccessType={setAccessType}
            allowedCodeIds={allowedCodeIds}
            setAllowedCodeIds={setAllowedCodeIds}
            metaYear={metaYear}
            setMetaYear={setMetaYear}
            metaSchool={metaSchool}
            setMetaSchool={setMetaSchool}
            metaBook={metaBook}
            setMetaBook={setMetaBook}
            pubDesc={pubDesc}
            setPubDesc={setPubDesc}
            pubHot={pubHot}
            setPubHot={setPubHot}
            pubComingSoon={pubComingSoon}
            setPubComingSoon={setPubComingSoon}
            proctoring={proctoring}
            setProctoring={setProctoring}
            structure={structure}
            setStructure={setStructure}
            structPoints={structPoints}
            setStructPoints={setStructPoints}
            passages={passages}
            setPassages={setPassages}
            questions={questions}
            setQuestions={setQuestions}
            isPublishing={isPublishing}
            onPublish={handlePublish}
            onTestInRunner={() => setActiveTab('runner')}
            onExportJson={handleExportJson}
            onOpenAIGen={() => setIsAIGenOpen(true)}
            onOpenAIReview={() => setIsAIReviewOpen(true)}
            onOpenAIExplanation={() => setIsAIExplanationOpen(true)}
            onToast={addToast}
            editorViewMode={editorViewMode}
            setEditorViewMode={setEditorViewMode}
            onClearDraft={() => {
              try {
                localStorage.removeItem(TEACHER_DRAFT_KEY);
              } catch (_) {}
            }}
          />
        )}

        {activeTab === 'posts' && (
          <PostsTab
            quizzes={quizzes}
            user={user}
            isRealtimeConnected={isRealtimeConnected}
            onLoadToEditor={handleLoadPostToEditor}
            onDeleteQuiz={handleDeletePost}
            onCopyShareLink={handleCopyShareLink}
          />
        )}

        {activeTab === 'runner' && (
          <RunnerTab
            editorQuestions={questions}
            editorTitle={pubTitle}
            editorGrade={pubClass}
            editorSubject={pubSubject}
            matrixDuration={matrixDuration}
            fullDuration={fullDuration}
            editorStructure={structure}
            passages={passages}
            proctoring={proctoring}
            onToast={addToast}
            onBackToEditor={() => setActiveTab('editor')}
          />
        )}
      </div>

      {/* Modals */}
      <AIGenModal
        isOpen={isAIGenOpen}
        onClose={() => setIsAIGenOpen(false)}
        onAddQuestions={(newQs, passage) => {
          if (passage) {
            setPassages((prev) => [...prev, passage]);
          }
          setQuestions((prev) => [...prev, ...newQs]);
          addToast(
            `Đã thêm thành công ${newQs.length} câu hỏi${
              passage ? ' và 1 ngữ liệu đọc hiểu' : ''
            } do AI tạo vào đề thi!`
          );
        }}
        currentGrade={pubClass}
        currentSubject={pubSubject}
        examTitle={pubTitle}
        examType={examType}
        matrixDuration={matrixDuration}
        structure={structure}
        structPoints={structPoints}
        onSwitchToJsonMode={() => {
          setActiveTab('editor');
          setEditorViewMode('json');
        }}
        onToast={addToast}
      />

      <AIReviewModal
        isOpen={isAIReviewOpen}
        onClose={() => setIsAIReviewOpen(false)}
        questions={questions}
        examTitle={pubTitle}
      />

      <AIExplanationModal
        isOpen={isAIExplanationOpen}
        onClose={() => setIsAIExplanationOpen(false)}
        questions={questions}
        onUpdateExplanations={(updated) => {
          setQuestions(updated);
          addToast('Đã áp dụng các lời giải AI vào toàn bộ đề thi thành công!');
        }}
      />

      <GeminiKeyModal
        isOpen={isGeminiKeyOpen}
        onClose={() => setIsGeminiKeyOpen(false)}
        user={user}
        onKeySaved={() => addToast('Đã lưu khóa cá nhân Gemini thành công!')}
      />
    </div>
  );
};
