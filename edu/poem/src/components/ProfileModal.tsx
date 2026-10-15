import React, { useState } from 'react';
import { 
  X, 
  User, 
  Flame, 
  Bookmark, 
  Edit2,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react';
import type { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';
import { signOutFirebase } from '../services/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onOpenAuth: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenAuth
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [ndid, setNdid] = useState(user.ndid || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isGuest = user.isAnonymous || user.uid.startsWith('guest_');

  const handleSave = () => {
    // NDID Regex validation on user input form
    if (ndid.trim()) {
      const regex = /^[a-zA-Z0-9_.]+$/;
      if (!regex.test(ndid.trim())) {
        setErrorMessage('NDID chỉ được chứa các ký tự chữ cái, số, gạch dưới (_) và dấu chấm (.).');
        return;
      }
    }

    setErrorMessage('');
    const updated: UserProfile = {
      ...user,
      displayName: displayName.trim() || 'Bạn đọc PoemND',
      ndid: ndid.trim() || undefined,
      avatar: selectedAvatar
    };
    saveUserProfile(updated);
    onUpdateUser(updated);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    const guestUser: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Khách yêu thơ',
      email: 'guest@poemnd.vn',
      streakDays: 1,
      savedPoemIds: [],
      lastActiveDate: new Date().toISOString().split('T')[0],
      isAnonymous: true
    };
    saveUserProfile(guestUser);
    onUpdateUser(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/60 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold font-poem text-stone-900">
              Hồ sơ Người dùng PoemND
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Avatar and name display */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-amber-200 shadow-md">
              <img
                src={selectedAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {errorMessage && (
              <div className="w-full p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block text-left mb-1">
                    Tên hiển thị:
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full px-3.5 py-2 font-bold text-xs bg-amber-50 rounded-xl border border-amber-300 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block text-left mb-1">
                    Mã NDID:
                  </label>
                  <input
                    type="text"
                    value={ndid}
                    onChange={(e) => setNdid(e.target.value)}
                    placeholder="ndid.username"
                    className="w-full px-3.5 py-2 font-mono text-xs bg-amber-50 rounded-xl border border-amber-300 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-stone-400 block text-left mt-0.5">
                    Hỗ trợ: chữ cái, số, gạch dưới và dấu chấm.
                  </span>
                </div>

                <div className="text-xs text-stone-500 text-left">Chọn ảnh đại diện:</div>
                <div className="flex justify-center gap-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedAvatar === av ? 'border-orange-500 scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setErrorMessage(''); }}
                    className="flex-1 py-1.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-bold text-stone-900">{user.displayName}</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-lg text-stone-400 hover:text-orange-600 transition-colors"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {user.ndid && (
                  <div className="text-xs font-mono font-semibold text-orange-700 bg-orange-100/70 inline-block px-2.5 py-0.5 rounded-full mt-1">
                    NDID: {user.ndid}
                  </div>
                )}

                <p className="text-xs text-stone-500 mt-1">{user.email || 'Khách vãng lai'}</p>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-200 text-center">
              <Flame className="w-5 h-5 text-orange-600 fill-orange-500 mx-auto mb-1 animate-pulse-subtle" />
              <div className="text-xl font-black text-stone-800">{user.streakDays || 1} Ngày</div>
              <div className="text-[11px] text-stone-500">Chuỗi học tập</div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
              <Bookmark className="w-5 h-5 text-amber-700 mx-auto mb-1" />
              <div className="text-xl font-black text-stone-800">{user.savedPoemIds?.length || 0}</div>
              <div className="text-[11px] text-stone-500">Bài thơ đã lưu sổ</div>
            </div>
          </div>

          {/* Auth Status & Switch Account */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-stone-800">
                {isGuest ? 'Chế độ Khách (Chưa đăng nhập)' : 'Tài khoản chính thức'}
              </div>
              <div className="text-[11px] text-stone-500">
                {isGuest ? 'Đăng nhập để lưu sổ thơ & theo dõi tiến độ học' : (user.email || user.displayName)}
              </div>
            </div>

            {isGuest ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 flex items-center gap-1 transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng nhập
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
