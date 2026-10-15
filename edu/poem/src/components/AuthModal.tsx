import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  Settings,
  ShieldCheck
} from 'lucide-react';
import { 
  signInWithGoogleAuth, 
  signInWithEmail, 
  signUpWithEmail, 
  isLiveFirebase 
} from '../services/firebase';
import { syncFirebaseUserProfile } from '../services/storage';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenSettings: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSettings
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ndid, setNdid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isLive = isLiveFirebase();

  // Validate NDID if entered on registration
  const validateNdid = (val: string): boolean => {
    if (!val.trim()) return true; // optional
    const regex = /^[a-zA-Z0-9_.]+$/;
    return regex.test(val.trim());
  };

  const handleGoogleSignIn = async () => {
    if (!isLive) {
      setErrorMessage('Đang thiết lập cổng đăng nhập trực tuyến, vui lòng thử lại sau.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const fbUser = await signInWithGoogleAuth();
      const profile = await syncFirebaseUserProfile(fbUser);
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập Google không thành công. Hãy thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLive) {
      setErrorMessage('Đang thiết lập cổng đăng nhập trực tuyến, vui lòng thử lại sau.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (tab === 'signup' && ndid.trim() && !validateNdid(ndid)) {
      setErrorMessage('NDID chỉ được chứa các chữ cái, số, dấu gạch dưới (_) và dấu chấm (.).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (tab === 'signin') {
        const fbUser = await signInWithEmail(email, password);
        const profile = await syncFirebaseUserProfile(fbUser);
        onSuccess(profile);
        onClose();
      } else {
        const fbUser = await signUpWithEmail(email, password, displayName);
        const profile = await syncFirebaseUserProfile({
          ...fbUser,
          displayName: displayName.trim() || 'Thành viên mới',
          ndid: ndid.trim() || undefined
        });
        onSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      let msg = err.message || 'Xác thực không thành công.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được sử dụng bởi một tài khoản khác.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu quá ngắn, vui lòng đặt ít nhất 6 ký tự.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/60 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-poem text-stone-900">
                {tab === 'signin' ? 'Đăng nhập PoemND' : 'Tạo tài khoản PoemND'}
              </h2>
              <p className="text-xs text-stone-500">
                Lưu trữ tiến độ học thuộc và kết nối cộng đồng thi ca
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-amber-100 text-xs font-bold bg-amber-50/40">
          <button
            type="button"
            onClick={() => { setTab('signin'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'signin'
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'signup'
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">


          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign In 1-Click */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isLive}
            className="w-full py-2.5 px-4 rounded-2xl border border-amber-200 bg-white hover:bg-amber-50/70 text-stone-700 font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Tiếp tục với tài khoản Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-[1px] bg-amber-200" />
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Hoặc</span>
            <div className="flex-1 h-[1px] bg-amber-200" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Họ và tên hiển thị:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Nhật Duật"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-amber-50/40 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mã NDID (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={ndid}
                    onChange={(e) => setNdid(e.target.value)}
                    placeholder="ví dụ: nhatduat.nd"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-amber-50/40 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Định dạng: a-z, A-Z, 0-9, dấu gạch dưới và dấu chấm.
                  </span>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Địa chỉ Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-amber-50/40 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-amber-50/40 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLive}
              className="w-full mt-2 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {tab === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isLoading ? 'Đang xử lý...' : tab === 'signin' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}</span>
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Bảo mật tài khoản tiêu chuẩn ND Labs
          </span>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
