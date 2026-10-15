import React from 'react';
import { 
  Plus, 
  Flame, 
  Bookmark, 
  Compass, 
  Settings, 
  User, 
  Search, 
  BookOpenCheck, 
  ArrowLeft, 
  Home,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  currentTab: 'explore' | 'saved' | 'progress';
  onSelectTab: (tab: 'explore' | 'saved' | 'progress') => void;
  onOpenAddPoem: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTab,
  onSelectTab,
  onOpenAddPoem,
  onOpenSettings,
  onOpenProfile,
  onOpenAuth,
  searchQuery,
  onSearchChange
}) => {
  const isGuest = user.isAnonymous || user.uid.startsWith('guest_');

  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Title */}
          <div 
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-amber-800 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img 
                src="/assets/images/logo.png" 
                alt="ND Labs Logo" 
                className="w-full h-full rounded-[14px] object-contain bg-white p-0.5" 
              />
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span 
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                  className="font-greatvibes text-4xl sm:text-5xl font-normal text-amber-500 group-hover:text-orange-600 transition-colors tracking-wide select-none drop-shadow-xs"
                >
                  Poem
                </span>
                <span className="font-sans font-black text-xl tracking-tight text-orange-600 ml-0.5">
                  ND
                </span>
              </div>
              <div className="text-[10px] tracking-widest uppercase font-semibold text-amber-800/80 -mt-1.5">
                by ND Labs
              </div>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-amber-700/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm tên bài thơ, tác giả, câu thơ bất kỳ..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white/80 rounded-2xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none placeholder:text-stone-400 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Navigation links & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-amber-100/70 p-1 rounded-2xl border border-amber-200/80 text-xs font-semibold">
              <button
                onClick={() => onSelectTab('explore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentTab === 'explore'
                    ? 'bg-white text-orange-700 shadow-xs'
                    : 'text-stone-700 hover:text-orange-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Khám phá
              </button>
              <button
                onClick={() => onSelectTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentTab === 'saved'
                    ? 'bg-white text-orange-700 shadow-xs'
                    : 'text-stone-700 hover:text-orange-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Sổ thơ đã lưu
              </button>
              <button
                onClick={() => onSelectTab('progress')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentTab === 'progress'
                    ? 'bg-white text-orange-700 shadow-xs'
                    : 'text-stone-700 hover:text-orange-700'
                }`}
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                Tiến độ học
              </button>
            </nav>

            {/* Daily Streak Indicator */}
            <div 
              title="Chuỗi ngày học thuộc thơ liên tiếp"
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-orange-100/80 border border-orange-300 text-xs font-bold text-orange-800 shadow-xs"
            >
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500 animate-pulse-subtle" />
              <span>{user.streakDays || 1} ngày</span>
            </div>

            {/* Add Poem with Gemini Button */}
            <button
              onClick={onOpenAddPoem}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm bài thơ</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] uppercase font-black tracking-wider">
                AI
              </span>
            </button>

            {/* Back to ND Labs Homepage */}
            <a
              href="/"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/90 hover:bg-white text-stone-700 hover:text-orange-600 border border-amber-200 transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold active:scale-95"
              title="Về Trang chủ ND Labs"
            >
              <Home className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">Trang chủ</span>
            </a>

            {/* Back to EduSpace */}
            <a
              href="/edu/"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/90 hover:bg-white text-stone-700 hover:text-orange-600 border border-amber-200 transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold active:scale-95"
              title="Về EduSpace"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">EduSpace</span>
            </a>

            {/* Settings & Keys button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-stone-700 hover:text-orange-600 border border-amber-200 transition-colors shadow-xs"
              title="Cài đặt ứng dụng"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Login & Register or Profile Button */}
            {isGuest ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <a
                  href="/auth/login/?redirect=/edu/poem/"
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white hover:bg-orange-50 text-stone-800 hover:text-orange-600 border border-amber-300 font-bold text-xs shadow-xs transition-all active:scale-95"
                  title="Đăng nhập tài khoản ND Labs"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-600" />
                  <span>Đăng nhập</span>
                </a>
                <a
                  href="/auth/register/?redirect=/edu/poem/"
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
                  title="Đăng ký tài khoản NDID mới"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>NDID (Đăng kí)</span>
                </a>
              </div>
            ) : (
              /* User Avatar */
              <button
                onClick={onOpenProfile}
                className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-amber-300 hover:border-orange-500 transition-colors shadow-xs shrink-0"
                title={user.ndid ? `${user.displayName} (${user.ndid})` : user.displayName}
              >
                <img
                  src={user.avatar || '/assets/images/logo.png'}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar & navigation pills */}
        <div className="md:hidden pb-3 pt-1 space-y-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-amber-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm thơ, tác giả..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-around text-xs font-semibold bg-amber-100/60 p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('explore')}
              className={`py-1 px-3 rounded-lg ${currentTab === 'explore' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'}`}
            >
              Khám phá
            </button>
            <button
              onClick={() => onSelectTab('saved')}
              className={`py-1 px-3 rounded-lg ${currentTab === 'saved' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'}`}
            >
              Đã lưu ({user.savedPoemIds?.length || 0})
            </button>
            <button
              onClick={() => onSelectTab('progress')}
              className={`py-1 px-3 rounded-lg ${currentTab === 'progress' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'}`}
            >
              Tiến độ học
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
