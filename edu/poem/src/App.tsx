import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  Filter, 
  FolderHeart
} from 'lucide-react';
import { Poem, UserProfile, StudyProgress } from './types';
import { Header } from './components/Header';
import { PoemCard } from './components/PoemCard';
import { PoemDetailModal } from './components/PoemDetailModal';
import { AddPoemModal } from './components/AddPoemModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { SharePoemModal } from './components/SharePoemModal';
import { StudyProgressView } from './components/StudyProgressView';
import { StudyStudio } from './components/study/StudyStudio';
import { 
  initLocalData, 
  subscribePoems, 
  createPoem, 
  deletePoemById, 
  getUserProfile, 
  getAllUserProgress,
  syncFirebaseUserProfile,
  canUserViewPoem
} from './services/storage';
import { onAuthChange } from './services/firebase';

export function App() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [user, setUser] = useState<UserProfile>(getUserProfile());
  const [userProgressMap, setUserProgressMap] = useState<Record<string, StudyProgress>>({});
  
  // Navigation & Modal states
  const [currentTab, setCurrentTab] = useState<'explore' | 'saved' | 'progress'>('explore');
  const [selectedPoemForStudy, setSelectedPoemForStudy] = useState<Poem | null>(null);
  const [selectedPoemForDetail, setSelectedPoemForDetail] = useState<Poem | null>(null);
  const [selectedPoemForShare, setSelectedPoemForShare] = useState<Poem | null>(null);
  const [isAddPoemOpen, setIsAddPoemOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hasResolvedInitialRoute, setHasResolvedInitialRoute] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Load and subscribe to poems and auth state
  useEffect(() => {
    initLocalData();
    const initialUser = getUserProfile();
    setUser(initialUser);

    const unsubscribe = subscribePoems((updatedPoems) => {
      setPoems(updatedPoems);
    });

    const unsubAuth = onAuthChange(async (fbUser) => {
      if (fbUser) {
        const synced = await syncFirebaseUserProfile(fbUser);
        setUser(synced);
      }
    });

    // Synchronize with ND Labs global accounts & session
    const syncNDLabsAccount = () => {
      const u = getUserProfile();
      setUser(u);
      getAllUserProgress(u.uid).then(setUserProgressMap);
    };

    window.addEventListener('storage', syncNDLabsAccount);
    window.addEventListener('nd-accounts-changed', syncNDLabsAccount);
    window.addEventListener('nd-user-logged-in', syncNDLabsAccount);

    getAllUserProgress(initialUser.uid).then(setUserProgressMap);

    return () => {
      unsubscribe();
      unsubAuth();
      window.removeEventListener('storage', syncNDLabsAccount);
      window.removeEventListener('nd-accounts-changed', syncNDLabsAccount);
      window.removeEventListener('nd-user-logged-in', syncNDLabsAccount);
    };
  }, []);

  // Deep Link Resolution: Handle URL routes on load (e.g. /edu/poem/<ndid>/<slug> or /edu/poem/<id>)
  useEffect(() => {
    if (poems.length === 0 || hasResolvedInitialRoute) return;

    try {
      const pathname = window.location.pathname;
      // Strip base prefix
      const cleanPath = pathname.replace(/^\/edu\/poem\/?/, '').replace(/\/+$/, '');
      const segments = cleanPath ? cleanPath.split('/') : [];

      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get('id') || searchParams.get('poemId');
      const querySlug = searchParams.get('p') || searchParams.get('slug');

      let targetPoem: Poem | undefined;

      if (segments.length >= 2) {
        // Author link: /edu/poem/<ndid>/<slug_or_id>
        const authorParam = decodeURIComponent(segments[0]);
        const slugParam = decodeURIComponent(segments[1]);
        targetPoem = poems.find(p => 
          (p.authorNdid === authorParam || p.createdBy?.ndid === authorParam) &&
          (p.slug === slugParam || p.id === slugParam)
        ) || poems.find(p => p.slug === slugParam || p.id === slugParam);
      } else if (segments.length === 1 && segments[0] !== 'index.html' && segments[0] !== '') {
        // System permanent link: /edu/poem/<system_id_or_slug>
        const idOrSlug = decodeURIComponent(segments[0]);
        targetPoem = poems.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      } else if (queryId || querySlug) {
        targetPoem = poems.find(p => 
          (queryId && p.id === queryId) || 
          (querySlug && (p.slug === querySlug || p.id === querySlug))
        );
      }

      if (targetPoem) {
        if (!canUserViewPoem(targetPoem, user)) {
          alert('Bài thơ này được đặt ở chế độ riêng tư, bạn không có quyền truy cập.');
        } else {
          setSelectedPoemForDetail(targetPoem);
        }
      }
    } catch (e) {
      console.warn('Deep link resolution error', e);
    } finally {
      setHasResolvedInitialRoute(true);
    }
  }, [poems, user, hasResolvedInitialRoute]);

  // Refresh progress when exiting study studio
  const handleExitStudy = () => {
    setSelectedPoemForStudy(null);
    getAllUserProgress(user.uid).then(setUserProgressMap);
  };

  const handleSaveNewPoem = async (poemData: any) => {
    const created = await createPoem(poemData, user);
    setSelectedPoemForStudy(created); // Direct launch into learning!
  };

  const handleDeletePoem = async (id: string) => {
    await deletePoemById(id);
  };

  const handleResetData = () => {
    localStorage.removeItem('poemnd_poems_v1');
    localStorage.removeItem('poemnd_progress_v1_' + user.uid);
    window.location.reload();
  };

  // Filter poems according to permissions and user selection
  const filteredPoems = poems.filter((poem) => {
    // Privacy filter on Explore: only public poems or authored/collaborated poems are shown
    if (currentTab === 'explore') {
      const isMine = 
        poem.createdBy?.uid === user.uid || 
        (Boolean(user.ndid) && (poem.authorNdid === user.ndid || poem.createdBy?.ndid === user.ndid || (poem.collaboratorNdids || []).includes(user.ndid!)));
      if (poem.visibility === 'private' && !isMine) return false;
      if (poem.visibility === 'unlisted' && !isMine) return false;
    }

    const matchesSearch = 
      poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poem.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poem.stanzas.some(s => s.lines.some(l => l.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (currentTab === 'saved') {
      return (user.savedPoemIds || []).includes(poem.id);
    }

    if (selectedCategory === 'Tất cả') return true;
    if (selectedCategory === 'THPT') return poem.category?.includes('THPT') || poem.tags?.some(t => t.includes('Văn'));
    if (selectedCategory === '7 Chữ') return poem.genre?.includes('7') || poem.stanzas[0]?.rhythm === '4/3';
    if (selectedCategory === '5 Chữ') return poem.genre?.includes('5') || poem.stanzas[0]?.rhythm === '2/3';
    if (selectedCategory === 'Tự Do') return poem.genre?.includes('tự do');

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/60 text-stone-800 font-sans">
      {/* Top Header */}
      <Header
        user={user}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedPoemForStudy(null);
          setCurrentTab(tab);
        }}
        onOpenAddPoem={() => setIsAddPoemOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedPoemForStudy ? (
          /* ACTIVE STUDY STUDIO */
          <StudyStudio
            poem={selectedPoemForStudy}
            user={user}
            onBack={handleExitStudy}
            onOpenComments={() => setSelectedPoemForDetail(selectedPoemForStudy)}
            onOpenShare={(p) => setSelectedPoemForShare(p)}
          />
        ) : currentTab === 'progress' ? (
          /* PROGRESS & STREAK VIEW */
          <StudyProgressView
            poems={poems}
            user={user}
            onSelectPoem={(poem) => setSelectedPoemForStudy(poem)}
          />
        ) : (
          /* EXPLORE & SAVED POEMS FEED */
          <div className="space-y-8">
            {/* Hero Banner (Only on Explore tab without search) */}
            {currentTab === 'explore' && !searchQuery && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 p-8 sm:p-12 text-white shadow-warm-lg">
                {/* Background decorative poetic shapes */}
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute right-12 top-6 opacity-20 pointer-events-none hidden md:block">
                  <span 
                    style={{ fontFamily: "'Great Vibes', cursive" }}
                    className="font-greatvibes text-9xl text-amber-200"
                  >
                    Poem
                  </span>
                </div>

                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-amber-100">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    Học thuộc thơ theo phương pháp khoa học & AI
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-bold font-poem leading-tight">
                    Khơi nguồn hồn thơ, <br />
                    Ghi nhớ sâu sắc và bền lâu.
                  </h1>

                  <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-sans">
                    PoemND by ND Labs kết hợp <strong>bóc tách nhịp phách</strong>, <strong>sơ đồ vần điệu</strong>, <strong>flashcard hình tượng nghệ thuật</strong> và <strong>Gemini AI</strong> giúp bạn thuộc làu bất kỳ bài thơ nào chỉ trong vài phút.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsAddPoemOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-white text-orange-700 font-bold text-xs sm:text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm bài thơ với Gemini AI
                    </button>

                    <button
                      onClick={() => {
                        if (poems.length > 0) {
                          setSelectedPoemForStudy(poems[0]);
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-orange-700/60 hover:bg-orange-700/80 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Luyện tập ngay bài Tây Tiến
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter Pills & Search summary */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5 text-orange-600" />
                  Bộ lọc:
                </span>
                {(['Tất cả', 'THPT', '7 Chữ', '5 Chữ', 'Tự Do'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white/80 text-stone-600 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-500 font-medium">
                {currentTab === 'saved' ? 'Sổ tay: ' : 'Kho bài thơ: '}
                <strong className="text-stone-800">{filteredPoems.length}</strong> tác phẩm
              </div>
            </div>

            {/* Poems Grid */}
            {filteredPoems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoems.map((poem) => (
                  <PoemCard
                    key={poem.id}
                    poem={poem}
                    user={user}
                    progress={userProgressMap[poem.id]}
                    onSelectPoem={(p) => setSelectedPoemForStudy(p)}
                    onOpenDetail={(p) => setSelectedPoemForDetail(p)}
                    onOpenShare={(p) => setSelectedPoemForShare(p)}
                    onDeletePoem={handleDeletePoem}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white/70 rounded-3xl border border-amber-200/80 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <FolderHeart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-poem text-stone-800">
                  {currentTab === 'saved' 
                    ? 'Bạn chưa lưu bài thơ nào vào Sổ tay' 
                    : 'Không tìm thấy bài thơ nào phù hợp'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {currentTab === 'saved'
                    ? 'Hãy khám phá kho thơ và bấm biểu tượng bookmark để đưa các bài thơ yêu thích vào đây!'
                    : 'Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "+ Thêm bài thơ" để nạp tác phẩm mới qua Gemini AI!'}
                </p>
                {currentTab === 'saved' ? (
                  <button
                    onClick={() => setCurrentTab('explore')}
                    className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                  >
                    Khám phá kho thơ
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddPoemOpen(true)}
                    className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                  >
                    Thêm bài thơ ngay
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/80 bg-white/60 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-baseline gap-1">
            <span 
              style={{ fontFamily: "'Great Vibes', cursive" }}
              className="font-greatvibes text-3xl font-normal text-amber-600"
            >
              Poem
            </span>
            <span className="font-sans font-black text-base text-orange-600 ml-0.5">ND</span>
            <span className="text-[11px] text-amber-900/80 font-semibold ml-1.5">— Nền tảng học thuộc thơ thông minh by ND Labs</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Học thuộc thông minh</span>
            <span>•</span>
            <span>Trí tuệ nhân tạo AI</span>
            <span>•</span>
            <span>Gợi nhớ hình tượng</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PoemDetailModal
        poem={selectedPoemForDetail}
        isOpen={Boolean(selectedPoemForDetail)}
        onClose={() => setSelectedPoemForDetail(null)}
        user={user}
        onStartStudy={(poem) => {
          setSelectedPoemForDetail(null);
          setSelectedPoemForStudy(poem);
        }}
        onOpenShare={(poem) => setSelectedPoemForShare(poem)}
      />

      <SharePoemModal
        poem={selectedPoemForShare}
        isOpen={Boolean(selectedPoemForShare)}
        onClose={() => setSelectedPoemForShare(null)}
        user={user}
        onPoemUpdated={(updated) => {
          setPoems(prev => prev.map(p => p.id === updated.id ? updated : p));
          if (selectedPoemForDetail?.id === updated.id) setSelectedPoemForDetail(updated);
          if (selectedPoemForStudy?.id === updated.id) setSelectedPoemForStudy(updated);
        }}
      />

      <AddPoemModal
        isOpen={isAddPoemOpen}
        onClose={() => setIsAddPoemOpen(false)}
        onSavePoem={handleSaveNewPoem}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
}
export default App;
