import React, { useState, useEffect } from 'react';
import { Toast } from './components/Toast';
import { ClassManagementTab } from './components/ClassManagementTab';
import {
  listenToAdminAuth,
  subscribeToQuizzesRealtime,
  subscribeToCategoriesRealtime,
  DEFAULT_CATEGORIES,
} from './services/firebaseService';
import type { AdminUser, QuizRecord, ToastMessage, EduCategoriesConfig } from './types';

interface ClassEduAppProps {
  isTeacherMode?: boolean;
}

export const ClassEduApp: React.FC<ClassEduAppProps> = ({ isTeacherMode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, isError = false) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type: isError ? 'error' : 'success' }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let unsubQuizzes: (() => void) | null = null;

    const unsubAuth = listenToAdminAuth(async (currentUser, error) => {
      setAuthChecking(false);
      setUser(currentUser);
      if (currentUser) {
        unsubQuizzes = subscribeToQuizzesRealtime(
          (updated) => setQuizzes(updated),
          () => {}
        );
      }
    });

    return () => {
      unsubAuth();
      if (unsubQuizzes) unsubQuizzes();
    };
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-black">
            🔒
          </div>
          <h2 className="text-lg font-black text-slate-900">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Vui lòng đăng nhập tài khoản NDID để truy cập danh sách lớp học và các bài kiểm tra được giao.
          </p>
          <a
            href={`/auth/login/?redirect=${encodeURIComponent(window.location.pathname)}`}
            className="inline-block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-xs"
          >
            Đăng nhập tài khoản NDID
          </a>
        </div>
      </div>
    );
  }

  const isUserTeacher =
    user.eduRole === 'teacher' ||
    user.role === 'teacher' ||
    user.role === 'admin' ||
    user.adminLevel === 'owner' ||
    user.adminLevel === 'admin' ||
    user.role === 'manager';

  const isTeacherRoute = isTeacherMode !== undefined ? isTeacherMode : window.location.pathname.includes('/teacher');

  if (isTeacherRoute && !isUserTeacher) {
    const displayNdid = user.ndid || user.displayName || user.uid || 'Người dùng';
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-amber-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-900">Không có quyền giáo viên</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Tài khoản <span className="font-bold text-slate-800">{displayNdid}</span> chưa được cấp quyền quản lý lớp học dành cho Giáo viên. Vui lòng liên hệ quản trị viên để được cấp quyền hoặc sử dụng Cổng lớp học học sinh.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/edu/teacher"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
            >
              Về Cổng Giáo viên
            </a>
            <a
              href="/edu/class/"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
            >
              Cổng lớp học sinh
            </a>
          </div>
        </div>
      </div>
    );
  }

  const effectiveIsTeacher = isTeacherRoute;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        <ClassManagementTab
          user={user}
          quizzes={quizzes}
          isTeacherView={effectiveIsTeacher}
          onToast={addToast}
        />
      </div>
    </div>
  );
};
