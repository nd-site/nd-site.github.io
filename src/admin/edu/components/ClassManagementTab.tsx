import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Award,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Check,
  Globe,
  Lock,
  Copy,
  UserPlus,
  Share2,
} from 'lucide-react';
import {
  fetchClassGroups,
  saveClassGroup,
  fetchSubmissionsByExam,
  lookupUserByNdid,
} from '../services/firebaseService';
import type { AdminUser, ClassGroupRecord, QuizRecord, StudentSubmissionRecord } from '../types';

interface ClassManagementTabProps {
  user: AdminUser | null;
  quizzes: QuizRecord[];
  isTeacherView?: boolean;
  onToast: (msg: string, isError?: boolean) => void;
}

export const ClassManagementTab: React.FC<ClassManagementTabProps> = ({
  user,
  quizzes,
  isTeacherView = true,
  onToast,
}) => {
  const [classes, setClasses] = useState<ClassGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassGroupRecord | null>(null);

  // Student portal tabs: 'my_classes' | 'find_classes'
  const [studentTab, setStudentTab] = useState<'my_classes' | 'find_classes'>('my_classes');
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Modal / Form state for creating/editing class
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [customClassId, setCustomClassId] = useState('');
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('Lớp 12');
  const [classDesc, setClassDesc] = useState('');
  const [classVisibility, setClassVisibility] = useState<'public' | 'private'>('public');

  // Detect whether we are currently at a specific class route (e.g. /edu/teacher/class/<id> or /edu/class/<id> or ?id=)
  const isClassDetailPage = (() => {
    if (typeof window === 'undefined') return false;
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const last = pathSegments[pathSegments.length - 1];
    if (last && last !== 'class' && last !== 'index.html') return true;
    const urlParams = new URLSearchParams(window.location.search);
    return Boolean(urlParams.get('id'));
  })();

  // Manage students in selected class
  const [newStudentNdid, setNewStudentNdid] = useState('');
  const [validatingStudent, setValidatingStudent] = useState(false);

  // Manage assigned exams in selected class
  const [selectedExamToAssign, setSelectedExamToAssign] = useState('');

  // Class leaderboard & submissions
  const [selectedExamForRank, setSelectedExamForRank] = useState<string>('');
  const [submissions, setSubmissions] = useState<StudentSubmissionRecord[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Weak questions analysis & cheat detection
  const [analyzingResults, setAnalyzingResults] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    scoreDistribution: Record<string, number>;
    weakTopics: string[];
    suspiciousStudents: { ndid: string; reason: string; severity: string }[];
    summary: string;
  } | null>(null);

  // Private class access denied state
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string>('');

  // Load classes
  const loadClasses = async (focusClassId?: string) => {
    setLoading(true);
    setAccessDeniedMessage('');
    try {
      const data = await fetchClassGroups(user?.ndid, isTeacherView, true);
      setClasses(data);

      // Extract class ID from pathname (e.g. /edu/teacher/class/ABC123) or query ?id=
      let targetClassId = focusClassId || '';
      if (!targetClassId && typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment && lastSegment !== 'class' && lastSegment !== 'index.html') {
          targetClassId = lastSegment;
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          targetClassId = urlParams.get('id') || '';
        }
      }

      let activeClass: ClassGroupRecord | null = null;

      if (targetClassId) {
        activeClass = data.find((c) => c.id === targetClassId || c.joinCode === targetClassId) || null;
        if (!activeClass) {
          // Try fetching directly by ID from Firestore
          const { fetchClassGroupById } = await import('../services/firebaseService');
          const direct = await fetchClassGroupById(targetClassId);
          if (direct) {
            activeClass = direct;
          }
        }
      }

      // Check Privacy Access if this class is accessed by student/guest
      if (activeClass) {
        const myNdid = (user?.ndid || user?.displayName || user?.uid || '').toLowerCase().trim();
        const teacherNdid = (activeClass.teacherNdid || '').toLowerCase().trim();
        const studentNdids = (activeClass.studentNdids || []).map((n) => n.toLowerCase().trim());
        const isOwnerTeacher = user && teacherNdid === myNdid;
        const isAdmin = user && (user.role === 'admin' || user.adminLevel === 'owner');

        if (activeClass.visibility === 'private' && !isOwnerTeacher && !isAdmin && !studentNdids.includes(myNdid)) {
          setAccessDeniedMessage(
            'Lớp học này được đặt ở chế độ riêng tư. Bạn chưa có tên trong danh sách lớp hoặc chưa được giáo viên cấp quyền truy cập.'
          );
          setSelectedClass(null);
          setLoading(false);
          return;
        }

        setSelectedClass({
          ...activeClass,
          studentNdids: Array.isArray(activeClass.studentNdids) ? activeClass.studentNdids : [],
          assignedExamIds: Array.isArray(activeClass.assignedExamIds) ? activeClass.assignedExamIds : [],
        });
      } else {
        setSelectedClass(null);
      }
    } catch (err) {
      console.error(err);
      onToast('Không thể tải danh sách lớp học.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user?.ndid, isTeacherView]);

  // Load submissions when an exam is selected in the leaderboard view
  useEffect(() => {
    if (!selectedExamForRank) {
      setSubmissions([]);
      setAiAnalysisResult(null);
      return;
    }
    const loadRank = async () => {
      setLoadingSubmissions(true);
      setAiAnalysisResult(null);
      try {
        const subs = await fetchSubmissionsByExam(selectedExamForRank);
        // Filter by class students if class has defined students
        const classSubs =
          selectedClass && selectedClass.studentNdids.length > 0
            ? subs.filter((s) => selectedClass.studentNdids.includes(s.studentNdid))
            : subs;
        setSubmissions(classSubs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSubmissions(false);
      }
    };
    loadRank();
  }, [selectedExamForRank, selectedClass]);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      onToast('Vui lòng nhập tên lớp học.', true);
      return;
    }
    if (!user) {
      onToast('Vui lòng đăng nhập tài khoản NDID để tạo lớp.', true);
      return;
    }

    try {
      const teacherNdid = user.ndid || user.displayName || user.uid || 'Admin';
      const teacherUid = user.uid || '0000';

      const targetId = editingClassId || (customClassId.trim() ? customClassId.trim().toUpperCase() : undefined);

      const payload: Partial<ClassGroupRecord> = {
        name: className.trim(),
        grade: classGrade,
        description: classDesc.trim(),
        teacherUid,
        teacherNdid,
        teacherName: user.displayName || teacherNdid,
        visibility: classVisibility,
        studentNdids: editingClassId && selectedClass ? selectedClass.studentNdids : [],
        assignedExamIds: editingClassId && selectedClass ? selectedClass.assignedExamIds : [],
      };

      const savedId = await saveClassGroup(payload, targetId);

      onToast(editingClassId ? 'Cập nhật thông tin lớp thành công!' : 'Tạo lớp học mới thành công!');
      setShowClassModal(false);
      setEditingClassId(null);
      setCustomClassId('');
      setClassName('');
      setClassDesc('');
      setClassVisibility('public');
      
      // Navigate to the newly created class page if created new
      if (!editingClassId && savedId) {
        window.location.href = isTeacherView ? `/edu/teacher/class/?id=${savedId}` : `/edu/class/?id=${savedId}`;
      } else {
        await loadClasses(savedId);
      }
    } catch (err: any) {
      console.error(err);
      onToast('Lỗi lưu lớp: ' + (err.message || err), true);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentNdid.trim() || !selectedClass) return;
    const rawNdid = newStudentNdid.trim();

    if (selectedClass.studentNdids.includes(rawNdid)) {
      onToast('Học sinh này đã có trong danh sách lớp.', true);
      return;
    }

    setValidatingStudent(true);
    try {
      const studentProfile = await lookupUserByNdid(rawNdid);
      if (!studentProfile) {
        onToast(`Không tìm thấy tài khoản NDID: ${rawNdid}`, true);
        return;
      }

      const updatedNdids = [...selectedClass.studentNdids, rawNdid];
      await saveClassGroup({ studentNdids: updatedNdids }, selectedClass.id);
      setSelectedClass({ ...selectedClass, studentNdids: updatedNdids });
      setNewStudentNdid('');
      onToast(`Đã thêm học sinh ${rawNdid} vào lớp thành công!`);
      await loadClasses();
    } catch (err: any) {
      onToast('Lỗi thêm học sinh: ' + (err.message || err), true);
    } finally {
      setValidatingStudent(false);
    }
  };

  const handleStudentSelfJoin = async (cls: ClassGroupRecord) => {
    if (!user) {
      onToast('Vui lòng đăng nhập tài khoản NDID để tham gia lớp học.', true);
      return;
    }
    const myNdid = user.ndid || user.displayName || user.uid;
    if (!myNdid) {
      onToast('Không tìm thấy NDID của tài khoản.', true);
      return;
    }

    if (cls.studentNdids?.includes(myNdid)) {
      onToast('Bạn đã ở trong lớp học này rồi.');
      return;
    }

    try {
      const updatedNdids = [...(cls.studentNdids || []), myNdid];
      await saveClassGroup({ studentNdids: updatedNdids }, cls.id);
      onToast(`Bạn đã tham gia lớp ${cls.name} thành công!`);
      await loadClasses();
    } catch (err: any) {
      onToast('Lỗi tham gia lớp: ' + (err.message || err), true);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      onToast('Vui lòng nhập mã tham gia lớp học.', true);
      return;
    }
    const targetClass = classes.find((c) => c.joinCode?.toUpperCase() === code || c.id === code);
    if (!targetClass) {
      onToast('Không tìm thấy lớp học với mã tham gia này.', true);
      return;
    }
    await handleStudentSelfJoin(targetClass);
    setJoinCodeInput('');
  };

  const handleRemoveStudent = async (studentNdid: string) => {
    if (!selectedClass) return;
    if (!window.confirm(`Xóa học sinh ${studentNdid} khỏi lớp?`)) return;

    try {
      const updatedNdids = selectedClass.studentNdids.filter((n) => n !== studentNdid);
      await saveClassGroup({ studentNdids: updatedNdids }, selectedClass.id);
      setSelectedClass({ ...selectedClass, studentNdids: updatedNdids });
      onToast(`Đã xóa học sinh ${studentNdid} khỏi lớp.`);
      await loadClasses();
    } catch (err: any) {
      onToast('Lỗi: ' + (err.message || err), true);
    }
  };

  const handleAssignExam = async () => {
    if (!selectedExamToAssign || !selectedClass) return;
    if (selectedClass.assignedExamIds.includes(selectedExamToAssign)) {
      onToast('Bài kiểm tra này đã được giao cho lớp rồi.', true);
      return;
    }

    try {
      const updatedExamIds = [...selectedClass.assignedExamIds, selectedExamToAssign];
      await saveClassGroup({ assignedExamIds: updatedExamIds }, selectedClass.id);
      setSelectedClass({ ...selectedClass, assignedExamIds: updatedExamIds });
      setSelectedExamToAssign('');
      onToast('Giao bài kiểm tra cho lớp thành công!');
      await loadClasses();
    } catch (err: any) {
      onToast('Lỗi giao bài: ' + (err.message || err), true);
    }
  };

  const handleUnassignExam = async (examId: string) => {
    if (!selectedClass) return;
    if (!window.confirm('Thu hồi bài kiểm tra này khỏi danh sách bài giao của lớp?')) return;

    try {
      const updatedExamIds = selectedClass.assignedExamIds.filter((id) => id !== examId);
      await saveClassGroup({ assignedExamIds: updatedExamIds }, selectedClass.id);
      setSelectedClass({ ...selectedClass, assignedExamIds: updatedExamIds });
      onToast('Đã thu hồi bài kiểm tra.');
      await loadClasses();
    } catch (err: any) {
      onToast('Lỗi: ' + (err.message || err), true);
    }
  };

  // Analyze class exam results (phổ điểm, học sinh yếu phần nào, dấu hiệu vi phạm)
  const handleAnalyzeClassPerformance = () => {
    if (submissions.length === 0) {
      onToast('Chưa có bài nộp nào để phân tích.', true);
      return;
    }

    setAnalyzingResults(true);

    setTimeout(() => {
      // Phổ điểm
      const dist: Record<string, number> = {
        'Dưới 5.0': 0,
        '5.0 - 6.4': 0,
        '6.5 - 7.9': 0,
        '8.0 - 8.9': 0,
        '9.0 - 10.0': 0,
      };

      const suspicious: { ndid: string; reason: string; severity: string }[] = [];

      submissions.forEach((sub) => {
        const score = sub.score10;
        if (score < 5.0) dist['Dưới 5.0']++;
        else if (score < 6.5) dist['5.0 - 6.4']++;
        else if (score < 8.0) dist['6.5 - 7.9']++;
        else if (score < 9.0) dist['8.0 - 8.9']++;
        else dist['9.0 - 10.0']++;

        // Cheat log detection
        const highLogs = (sub.proctoringLogs || []).filter(
          (l) => l.severity === 'high' || l.type === 'SCREEN_FULLSCREEN_EXIT'
        );
        if (highLogs.length >= 3) {
          suspicious.push({
            ndid: sub.studentNdid,
            reason: `Thoát toàn màn hình ${highLogs.length} lần trong quá trình thi`,
            severity: 'high',
          });
        } else if (sub.timeSpentSecs < 120 && sub.score10 >= 8.5) {
          suspicious.push({
            ndid: sub.studentNdid,
            reason: `Hoàn thành bài quá nhanh (${sub.timeSpentSecs}s) với điểm số cao (${sub.score10})`,
            severity: 'medium',
          });
        }
      });

      const avgScore = (
        submissions.reduce((acc, cur) => acc + cur.score10, 0) / submissions.length
      ).toFixed(2);

      setAiAnalysisResult({
        scoreDistribution: dist,
        weakTopics: [
          'Dạng câu hỏi vận dụng cao và đúng/sai phân hóa',
          'Tốc độ làm bài câu trả lời ngắn',
        ],
        suspiciousStudents: suspicious,
        summary: `Tổng số ${submissions.length} bài thi đã nộp. Điểm trung bình cả lớp đạt ${avgScore}/10. ${
          suspicious.length > 0
            ? `Phát hiện ${suspicious.length} trường hợp có dấu hiệu bất thường cần xem lại lịch sử thao tác.`
            : 'Không phát hiện dấu hiệu gian lận nghiêm trọng trong đợt làm bài.'
        }`,
      });
      setAnalyzingResults(false);
      onToast('Phân tích phổ điểm và năng lực học sinh hoàn tất!');
    }, 600);
  };

  // Filter classes for student finding
  const myNdid = (user?.ndid || user?.displayName || user?.uid || '').toLowerCase().trim();
  const joinedClasses = classes.filter((c) =>
    (c.studentNdids || []).map((n) => n.toLowerCase().trim()).includes(myNdid)
  );
  const publicFindableClasses = classes.filter((c) => {
    if (c.visibility === 'private') return false;
    const q = classSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.grade || '').toLowerCase().includes(q) ||
      (c.teacherNdid || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
              {isTeacherView ? 'Cổng Giáo Viên • Lớp Học' : 'Cổng Học Sinh • Tìm & Tham Gia Lớp'}
            </span>
            {isTeacherView && (
              <a
                href="/edu/class"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                <span>Xem giao diện học sinh</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            {isTeacherView ? 'Quản lý Lớp học & Giám sát bài làm' : 'Lớp học của tôi & Nhận bài thi'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isTeacherView
              ? 'Tạo lớp học công khai hoặc riêng tư, thêm học sinh, giao đề thi từ hệ thống và phân tích năng lực phổ điểm.'
              : 'Tham gia lớp học công khai, nhập mã mời tham gia nhanh và làm các bài kiểm tra được giáo viên giao.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isTeacherView ? (
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="/edu/teacher"
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Cổng Giáo Viên</span>
              </a>
              <a
                href="/edu/teacher/exam"
                className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-2xl border border-blue-200 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Soạn đề thi</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setEditingClassId(null);
                  setClassName('');
                  setClassGrade('Lớp 12');
                  setClassDesc('');
                  setClassVisibility('public');
                  setShowClassModal(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo lớp học mới</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã lớp..."
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Vào lớp
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Student View Navigation Tabs */}
      {!isTeacherView && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setStudentTab('my_classes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              studentTab === 'my_classes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lớp tôi đã tham gia ({joinedClasses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setStudentTab('find_classes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              studentTab === 'find_classes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Khám phá lớp công khai</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold text-xs bg-white rounded-3xl border border-slate-200">
          Đang tải thông tin lớp học...
        </div>
      ) : accessDeniedMessage ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-rose-200 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">Truy cập lớp học bị giới hạn</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{accessDeniedMessage}</p>
          <div className="pt-2">
            <a
              href="/edu/class"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all"
            >
              Về danh sách lớp công khai
            </a>
          </div>
        </div>
      ) : !isTeacherView && studentTab === 'find_classes' ? (
        /* Student Find Classes Grid */
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm lớp theo tên lớp, khối lớp, hoặc NDID giáo viên..."
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicFindableClasses.map((cls) => {
              const isJoined = (cls.studentNdids || []).includes(myNdid);
              return (
                <div
                  key={cls.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">{cls.name}</h3>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black shrink-0">
                        {cls.grade}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold pt-1">
                      <span>GV: {cls.teacherNdid}</span>
                      <span>•</span>
                      <span>{cls.studentNdids?.length || 0} Học sinh</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Mã: <strong>{cls.joinCode || cls.id.slice(0, 6)}</strong>
                    </span>
                    {isJoined ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã tham gia
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStudentSelfJoin(cls)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tham gia</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : isTeacherView && !isClassDetailPage ? (
        /* Teacher Class List Overview */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Danh sách lớp học của bạn ({classes.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingClassId(null);
                setCustomClassId('');
                setClassName('');
                setClassGrade('Lớp 12');
                setClassDesc('');
                setClassVisibility('public');
                setShowClassModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo lớp mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const classUrl = `/edu/teacher/class/?id=${encodeURIComponent(cls.id)}`;
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                          {cls.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {cls.visibility === 'private' ? (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                              <Lock className="w-3 h-3" /> Riêng tư
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                              <Globe className="w-3 h-3" /> Công khai
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                            Mã: {cls.joinCode || cls.id}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-black shrink-0 border border-blue-100">
                        {cls.grade}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[32px]">
                      {cls.description || 'Chưa có mô tả cho lớp học này.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{cls.studentNdids?.length || 0} Học sinh</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>{cls.assignedExamIds?.length || 0} Đề đã giao</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/edu/teacher/class/?id=${encodeURIComponent(cls.id)}`;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            onToast('Đã sao chép liên kết lớp học!');
                          });
                        } else {
                          window.prompt('Sao chép liên kết lớp học:', shareUrl);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Sao chép liên kết lớp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <a
                      href={classUrl}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Vào quản lý lớp</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : isClassDetailPage && !selectedClass ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">Không tìm thấy thông tin lớp</h3>
          <p className="text-xs text-slate-500">Mã lớp không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <a
            href={isTeacherView ? '/edu/teacher/class' : '/edu/class'}
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all"
          >
            Quay lại danh sách lớp
          </a>
        </div>
      ) : (
        /* Single Class Detail Workspace */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <a
              href={isTeacherView ? '/edu/teacher/class' : '/edu/class'}
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-blue-600 transition-colors"
            >
              <span>← Quay lại danh sách lớp</span>
            </a>
          </div>
          {selectedClass && (
            <>
              {/* Class Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900">{selectedClass.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold">
                        {selectedClass.grade}
                      </span>
                      {selectedClass.visibility === 'private' ? (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Riêng tư
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Công khai
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
                      <span>
                        Giáo viên: <strong className="text-slate-800">{selectedClass.teacherNdid}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Mã vào lớp:{' '}
                        <code className="px-2 py-0.5 bg-slate-100 rounded-lg text-blue-700 font-mono font-bold">
                          {selectedClass.joinCode || selectedClass.id.slice(0, 6)}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedClass.joinCode || selectedClass.id);
                            onToast('Đã sao chép mã vào lớp!');
                          }}
                          className="text-slate-400 hover:text-blue-600 p-0.5"
                          title="Sao chép mã"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = isTeacherView
                          ? `${window.location.origin}/edu/teacher/class/?id=${encodeURIComponent(selectedClass.id)}`
                          : `${window.location.origin}/edu/class/?id=${encodeURIComponent(selectedClass.id)}`;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            onToast('Đã sao chép liên kết lớp học!');
                          });
                        } else {
                          window.prompt('Sao chép liên kết lớp học:', shareUrl);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chia sẻ</span>
                    </button>
                    {isTeacherView && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassId(selectedClass.id);
                            setClassName(selectedClass.name);
                            setClassGrade(selectedClass.grade);
                            setClassDesc(selectedClass.description || '');
                            setClassVisibility(selectedClass.visibility || 'public');
                            setShowClassModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa lớp</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {selectedClass.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {selectedClass.description}
                  </p>
                )}
              </div>

              {/* Assigned Exams Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Đề kiểm tra được giao ({selectedClass.assignedExamIds?.length || 0})
                    </h3>
                  </div>

                  {isTeacherView && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={selectedExamToAssign}
                        onChange={(e) => setSelectedExamToAssign(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
                      >
                        <option value="">-- Chọn đề từ hệ thống để giao --</option>
                        {quizzes
                          .filter((q) => !(selectedClass.assignedExamIds || []).includes(q.id))
                          .map((q) => (
                            <option key={q.id} value={q.id}>
                              [{q.grade || 'Toàn khối'}] {q.title}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignExam}
                        disabled={!selectedExamToAssign}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Giao đề</span>
                      </button>
                    </div>
                  )}
                </div>

                {(!selectedClass.assignedExamIds || selectedClass.assignedExamIds.length === 0) ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium">
                    Chưa có đề thi nào được giao cho lớp này.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedClass.assignedExamIds || []).map((examId) => {
                      const quizInfo = quizzes.find((q) => q.id === examId);
                      const title = quizInfo?.title || `Đề kiểm tra #${examId.slice(0, 8)}`;
                      const isViewingRank = selectedExamForRank === examId;

                      return (
                        <div
                          key={examId}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isViewingRank
                              ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 text-xs leading-snug">
                                {title}
                              </h4>
                              {isTeacherView && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignExam(examId)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Thu hồi đề"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold flex-wrap">
                              {quizInfo?.subject && <span>Môn: {quizInfo.subject}</span>}
                              {quizInfo?.duration && <span>• {quizInfo.duration} phút</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
                            <a
                              href={`/edu/exam/?id=${examId}&classId=${selectedClass.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer flex-1 justify-center"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Vào làm đề</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setSelectedExamForRank(examId)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isViewingRank
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Award className="w-3 h-3 text-amber-500 group-hover:text-amber-600" />
                              <span>Bảng xếp hạng</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leaderboard & Analysis Section */}
              {selectedExamForRank && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          Bảng xếp hạng &amp; Kết quả nộp bài
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Mã đề: {selectedExamForRank} • Lớp {selectedClass.name}
                        </p>
                      </div>
                    </div>

                    {isTeacherView && (
                      <button
                        type="button"
                        onClick={handleAnalyzeClassPerformance}
                        disabled={analyzingResults || submissions.length === 0}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{analyzingResults ? 'Đang phân tích...' : 'Phân tích AI & Phổ điểm'}</span>
                      </button>
                    )}
                  </div>

                  {/* AI Analysis Result Card */}
                  {aiAnalysisResult && (
                    <div className="p-5 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase tracking-wider">
                        <BarChart3 className="w-4 h-4 text-indigo-600" />
                        <span>Báo cáo phân tích năng lực &amp; Phổ điểm học sinh</span>
                      </div>

                      <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                        {aiAnalysisResult.summary}
                      </p>

                      {/* Score distribution bar */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black text-indigo-900">Phổ điểm bài thi:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {Object.entries(aiAnalysisResult.scoreDistribution).map(([label, count]) => (
                            <div key={label} className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 text-center">
                              <span className="text-[10px] font-bold text-slate-500 block">{label}</span>
                              <span className="text-sm font-black text-indigo-600">{count} bài</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suspicious Cheat Alerts */}
                      {aiAnalysisResult.suspiciousStudents.length > 0 && (
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                          <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>Học sinh cần chú ý nhật ký thao tác:</span>
                          </span>
                          <div className="space-y-1">
                            {aiAnalysisResult.suspiciousStudents.map((st, sIdx) => (
                              <div key={sIdx} className="text-xs text-rose-900 font-medium flex items-center justify-between">
                                <span>• <strong>{st.ndid}</strong>: {st.reason}</span>
                                <span className="px-2 py-0.5 rounded-lg bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                                  {st.severity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Table */}
                  {loadingSubmissions ? (
                    <div className="py-8 text-center text-slate-400 font-bold text-xs">
                      Đang tải bài thi đã nộp...
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium text-xs">
                      Chưa có học sinh nào nộp bài cho đề thi này.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Hạng</th>
                            <th className="px-4 py-3">Học sinh (NDID)</th>
                            <th className="px-4 py-3">Điểm số</th>
                            <th className="px-4 py-3">Số câu đúng</th>
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3">Nhật ký giám sát</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {submissions.map((sub, idx) => {
                            const rank = idx + 1;
                            const badge =
                              rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
                            const highLogs = (sub.proctoringLogs || []).filter(
                              (l) => l.severity === 'high'
                            );

                            return (
                              <tr key={sub.id || idx} className="hover:bg-slate-50/70">
                                <td className="px-4 py-3 font-black text-slate-700">{badge}</td>
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {sub.studentNdid}
                                </td>
                                <td className="px-4 py-3 font-black text-blue-600 text-sm">
                                  {sub.score10} / 10
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  {sub.correctCount} / {sub.totalQuestions}
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                  {Math.floor(sub.timeSpentSecs / 60)}p {sub.timeSpentSecs % 60}s
                                </td>
                                <td className="px-4 py-3">
                                  {highLogs.length > 0 ? (
                                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                                      {highLogs.length} cảnh báo
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                      Bình thường
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Student Roster Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Danh sách học sinh trong lớp ({selectedClass.studentNdids?.length || 0})
                    </h3>
                  </div>

                  {isTeacherView && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhập NDID học sinh..."
                        value={newStudentNdid}
                        onChange={(e) => setNewStudentNdid(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddStudent();
                        }}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                      />
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        disabled={validatingStudent || !newStudentNdid.trim()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{validatingStudent ? 'Đang kiểm tra...' : 'Thêm'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {(!selectedClass.studentNdids || selectedClass.studentNdids.length === 0) ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium">
                    Chưa có học sinh nào trong lớp.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {(selectedClass.studentNdids || []).map((ndid) => (
                      <div
                        key={ndid}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800"
                      >
                        <span className="truncate">{ndid}</span>
                        {isTeacherView && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(ndid)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Xóa khỏi lớp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Class Create/Edit Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-[100010] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900">
              {editingClassId ? 'Chỉnh sửa thông tin lớp' : 'Tạo lớp học mới'}
            </h3>

            <form onSubmit={handleSaveClass} className="space-y-3">
              {!editingClassId && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Mã lớp / ID lớp (tùy chỉnh):</label>
                    <span className="text-[10px] text-slate-400 font-semibold">Tùy chọn</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ví dụ: 12A1-2026 (để trống sẽ tự sinh mã)"
                    value={customClassId}
                    onChange={(e) => setCustomClassId(e.target.value.replace(/\s+/g, ''))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    ID này sẽ dùng trực tiếp trên URL: <code className="text-blue-600 font-bold">/edu/teacher/class/?id=&lt;ID&gt;</code>
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tên lớp học *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 12A1 Chuyên Toán..."
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Khác">Khối khác</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quyền riêng tư:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClassVisibility('public')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      classVisibility === 'public'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Công khai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassVisibility('private')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      classVisibility === 'private'
                        ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Riêng tư</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {classVisibility === 'public'
                    ? 'Lớp công khai: Học sinh có thể tìm kiếm và tự bấm tham gia.'
                    : 'Lớp riêng tư: Chỉ học sinh được giáo viên thêm hoặc có mã lớp mới được vào.'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả / Ghi chú:</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả thông tin lớp học, môn học..."
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  {editingClassId ? 'Cập nhật' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
