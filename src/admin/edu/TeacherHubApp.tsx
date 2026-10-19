import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileEdit,
  Users,
  BarChart3,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Key,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Layers,
  Settings,
  FolderKanban,
  FileQuestion,
  UserCheck
} from 'lucide-react';
import { listenToAdminAuth } from './services/firebaseService';
import type { AdminUser } from './types';
import { GeminiKeyModal } from './components/modals/GeminiKeyModal';

export const TeacherHubApp: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isGeminiKeyOpen, setIsGeminiKeyOpen] = useState(false);

  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    listenToAdminAuth((authedUser) => {
      setUser(authedUser);
      setAuthChecking(false);
    }).then((u) => {
      unsubAuth = u;
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const displayNdid = user?.ndid || user?.displayName || user?.uid || 'Giáo viên';
  const isAdmin =
    user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';
  const isTeacher =
    isAdmin ||
    user?.eduRole === 'teacher' ||
    user?.role === 'teacher' ||
    user?.role === 'manager';

  const teacherTools = [
    {
      id: 'teacher-exam',
      title: 'Biên soạn & Quản lý Đề thi',
      badge: 'Công cụ cốt lõi',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Soạn thảo đề thi chuẩn cấu trúc GDPT 2018 (Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn, Tự luận), hỗ trợ ngữ liệu chung, đa phương tiện và phòng thi mô phỏng.',
      icon: FileEdit,
      iconBg: 'bg-blue-500/10 text-blue-600',
      actionText: 'Mở Trình Soạn Đề',
      actionUrl: '/edu/teacher/exam',
      features: [
        'Soạn đề thủ công hoặc nạp từ file Word (.docx) & JSON',
        'Tạo đề thi tự động bằng trí tuệ nhân tạo Gemini AI',
        'Cấu hình giám sát thi toàn diện (Cam, Mic, Chặn rời tab)',
        'Cộng tác đồng tác giả & phân quyền theo CodeID',
      ],
    },
    {
      id: 'teacher-class',
      title: 'Quản lý Lớp học & Giám sát',
      badge: 'Không gian lớp học',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Tổ chức các lớp học trực tuyến riêng tư hoặc công khai, thêm học sinh theo NDID, giao đề thi trực tiếp và theo dõi lịch sử làm bài chi tiết.',
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      actionText: 'Quản Lý Lớp Học',
      actionUrl: '/edu/teacher/class',
      features: [
        'Tạo lớp học công khai hoặc mã mời tham gia nhanh',
        'Giao đề thi đã xuất bản cho từng lớp chỉ với 1 click',
        'Bảng xếp hạng thời gian thực và lịch sử thao tác của thí sinh',
        'Phân tích phổ điểm và phát hiện gian lận bằng AI',
      ],
    },
    {
      id: 'exam-analytics',
      title: 'Thống kê & Phân tích Đề thi',
      badge: 'Báo cáo năng lực',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Báo cáo chi tiết các đợt làm bài, tỷ lệ câu đúng/sai theo từng ma trận nhận thức, phân loại mức độ học sinh và cảnh báo gian lận khách quan.',
      icon: BarChart3,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      actionText: 'Xem Thống Kê Điểm',
      actionUrl: '/edu/teacher/class',
      features: [
        'Phổ điểm trực quan và điểm trung bình lớp học',
        'Xác định các dạng câu hỏi học sinh còn yếu',
        'Lịch sử thoát toàn màn hình và hành vi bất thường',
        'Xuất dữ liệu kết quả phục vụ chấm thi',
      ],
    },
    {
      id: 'edu-portal',
      title: 'Cổng Khám phá & Làm thử Đề',
      badge: 'Góc nhìn học sinh',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Truy cập cổng EduND trung tâm để trải nghiệm toàn bộ kho đề thi đã xuất bản công khai từ góc nhìn của học sinh.',
      icon: BookOpen,
      iconBg: 'bg-amber-500/10 text-amber-600',
      actionText: 'Về Cổng EduND',
      actionUrl: '/edu/',
      features: [
        'Duyệt đề thi theo khối lớp (Lớp 10, 11, 12, ĐH...) và môn học',
        'Kiểm tra đề thi có gắn nhãn Đạt chuẩn GDPT 2018',
        'Vào phòng thi nhanh bằng mã đề hoặc đường dẫn rút gọn',
      ],
    },
  ];

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang kiểm tra tài khoản Giáo viên...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-900">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Khu vực này chỉ dành cho giáo viên và người ra đề thi. Vui lòng đăng nhập bằng tài khoản NDID để tiếp tục.
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

  // Logged in but not teacher
  if (!isTeacher) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-amber-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Không có quyền truy cập Cổng Giáo viên</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Tài khoản <span className="font-bold text-slate-800">{displayNdid}</span> chưa được cấp quyền Giáo viên. Để được kích hoạt vai trò này và sử dụng các công cụ biên soạn đề thi, vui lòng liên hệ quản trị viên thông qua mục hỗ trợ trên thanh điều hướng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/edu/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
            >
              Về cổng EduND
            </a>
            <a
              href="/edu/class/"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
            >
              Lớp học của tôi
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black tracking-wide uppercase border border-blue-200">
                  <GraduationCap className="w-4 h-4" />
                  Cổng Giáo Viên • Teacher Hub
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-black border border-purple-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Không Gian Dành Cho Giáo Viên &amp; Người Ra Đề
              </h1>
              <p className="text-xs md:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
                Nền tảng công cụ giáo dục toàn diện của ND Labs: Quản lý kho đề thi chuẩn GDPT 2018, tổ chức lớp học, giám sát phòng thi thông minh và phân tích kết quả bài làm.
              </p>
            </div>

            {/* Quick Actions / User Info */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  {displayNdid.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-slate-900 text-xs block truncate max-w-[150px]">
                    {displayNdid}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên đã duyệt' : 'Người dùng NDID'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGeminiKeyOpen(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                title="Cài đặt API Key Gemini cá nhân"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Gemini Key</span>
              </button>

              {isAdmin && (
                <a
                  href="/admin/edu"
                  className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Edu</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tools Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-8">
        {/* Verification Alert if not teacher/admin */}
        {!isTeacher && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-black text-amber-900">
                  Bạn muốn kích hoạt vai trò Giáo viên chính thức?
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Để xuất bản đề thi công khai và dùng các công cụ nâng cao, bạn có thể gửi yêu cầu hỗ trợ tới Quản trị viên thông qua nút Trợ giúp trên thanh điều hướng.
                </p>
              </div>
            </div>
            <a
              href="/edu/teacher/exam"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shrink-0 text-center shadow-xs transition-all"
            >
              Thử soạn đề ngay
            </a>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teacherTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </h2>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black border mt-0.5 ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {tool.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tính năng nổi bật:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tool.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Đường dẫn: {tool.actionUrl}
                  </span>
                  <a
                    href={tool.actionUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all group-hover:translate-x-0.5 cursor-pointer"
                  >
                    <span>{tool.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links Footer Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cần tìm hiểu cấu trúc GDPT 2018?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Xem hướng dẫn quy chuẩn 3 phần ma trận: Trắc nghiệm 4 lựa chọn, Đúng/Sai đa ý và Trả lời ngắn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/edu/teacher/exam"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Xem ma trận đề
            </a>
            <a
              href="/edu/class"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Khám phá lớp học
            </a>
          </div>
        </div>
      </div>

      {/* Gemini API Key Modal */}
      <GeminiKeyModal
        isOpen={isGeminiKeyOpen}
        onClose={() => setIsGeminiKeyOpen(false)}
        onSaved={() => {
          // Toast or state update if needed
        }}
      />
    </div>
  );
};
