import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Bell,
  Bookmark,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  FileText,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Info,
  LibraryBig,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  MonitorPlay,
  Pause,
  Play,
  QrCode,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Timer,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Account = {
  uid?: string;
  ndid?: string;
  displayName?: string;
  fullname?: string;
  email?: string;
  photoURL?: string;
  role?: string;
  eduRole?: string;
  grade?: string;
  codeId?: string;
};

type AccountState = {
  active: Account | null;
  accounts: Account[];
  activeIndex: number;
};

type HubItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  label: string;
  color: string;
  icon: LucideIcon;
  kind: 'learning' | 'social' | 'game' | 'tool' | 'post';
  meta?: string;
  hot?: boolean;
};

type AdminPost = {
  id: string;
  title: string;
  description: string;
  href: string;
  label: string;
  type?: string;
  subject?: string;
  class?: string;
  hot?: boolean;
  comingSoon?: boolean;
  source?: 'firebase' | 'fallback';
};

type Notice = {
  id: string;
  title: string;
  info: string;
  date: string;
  time: string;
  stt: number;
  color: string;
};

type Toast = {
  id: number;
  title: string;
  message: string;
  tone?: 'info' | 'success' | 'warning';
};

declare global {
  interface Window {
    NDAccounts?: {
      getActiveIndexFromUrl: () => number;
      getAllAccounts: () => Account[];
      getActiveAccount: () => Account | null;
      switchAccount: (index: number) => void;
      removeAccount: (index: number) => Promise<void>;
      removeAllAccounts: () => Promise<void>;
      buildUrlWithAccount: (urlStr: string, targetIndex?: number | null) => string;
      syncActiveAccountToSession: () => void;
    };
    firebaseFirestore?: unknown;
    getEduKeys?: () => Promise<{ fbDatabaseURL?: string | null }>;
  }
}

const fallbackPosts: AdminPost[] = [
  {
    id: 'thpt-2026',
    title: 'Ôn thi tốt nghiệp THPT 2026',
    description: 'Tổng hợp đề thi thử, bài luyện tập và lộ trình ôn tập theo cấu trúc mới.',
    href: '/eduspace/thptqg/2026/',
    label: 'THPT 2026',
    type: 'lesson',
    subject: 'Tổng hợp',
    class: '12',
    hot: true,
    source: 'fallback',
  },
  {
    id: 'taode-ai',
    title: 'Tạo đề nâng cao bằng AI',
    description: 'Phân tích file Word, TXT hoặc nội dung thô để tạo bài kiểm tra nhanh hơn.',
    href: '/eduspace/taode/',
    label: 'Công cụ học tập',
    type: 'tool',
    subject: 'AI',
    source: 'fallback',
  },
  {
    id: 'speaking-unit-9',
    title: 'Speaking practice - Tiếng Anh 10',
    description: 'Luyện nói theo chủ đề, mẫu câu và phản xạ trả lời ngắn.',
    href: '/eduspace/tienganh/speaking/v1/',
    label: 'Tiếng Anh',
    type: 'lesson',
    subject: 'Tiếng Anh',
    class: '10',
    source: 'fallback',
  },
];

const learningItems: HubItem[] = [
  {
    id: 'eduspace',
    title: 'EduSpace',
    description: 'Kho bài học, đề thi và lộ trình ôn tập theo lớp.',
    href: '/eduspace/',
    label: 'Học tập',
    color: 'blue',
    icon: GraduationCap,
    kind: 'learning',
    hot: true,
  },
  {
    id: 'ai-exam',
    title: 'Tạo đề AI',
    description: 'Tạo đề, nhập dữ liệu và xuất bài luyện tập nhanh.',
    href: '/eduspace/taode/',
    label: 'AI',
    color: 'green',
    icon: Bot,
    kind: 'learning',
  },
  {
    id: 'typing',
    title: 'Typing Master',
    description: 'Luyện gõ nhanh, chính xác và theo dõi tiến bộ.',
    href: '/eduspace/typing-master/',
    label: 'Kỹ năng',
    color: 'violet',
    icon: LibraryBig,
    kind: 'learning',
  },
  {
    id: 'periodic',
    title: 'Bảng tuần hoàn',
    description: 'Học hóa học bằng cách ghi nhớ trực quan.',
    href: '/eduspace/hoc-bang-tuan-hoan-hoa-hoc/',
    label: 'Hóa học',
    color: 'rose',
    icon: Boxes,
    kind: 'learning',
  },
  {
    id: 'scan2word',
    title: 'Scan2Word',
    description: 'Chuyển hình ảnh thành văn bản bằng AI.',
    href: '/scan2word/',
    label: 'OCR',
    color: 'amber',
    icon: FileText,
    kind: 'learning',
  },
];

const socialItems: HubItem[] = [
  {
    id: 'chatnd',
    title: 'ChatND',
    description: 'Không gian trò chuyện và kết nối của ND Labs.',
    href: '/chat/',
    label: 'Kết nối',
    color: 'blue',
    icon: MessageCircle,
    kind: 'social',
    hot: true,
  },
  {
    id: 'quick-share',
    title: 'Quick Share',
    description: 'Chia sẻ file, ảnh và liên kết nhanh trong hệ sinh thái.',
    href: '/media/share/',
    label: 'Share',
    color: 'violet',
    icon: Share2,
    kind: 'social',
  },
  {
    id: 'video-hub',
    title: 'Video Hub',
    description: 'Kho video học tập, giải trí và nội dung cộng đồng.',
    href: '/media/video/',
    label: 'Media',
    color: 'rose',
    icon: MonitorPlay,
    kind: 'social',
  },
  {
    id: 'feedback',
    title: 'Hộp góp ý',
    description: 'Gửi ý tưởng, báo lỗi hoặc lời nhắn cho đội ngũ ND Labs.',
    href: '/thung-thu-gop-y/',
    label: 'Góp ý',
    color: 'green',
    icon: Heart,
    kind: 'social',
  },
];

const gameItems: HubItem[] = [
  {
    id: 'miniworld',
    title: 'Mini World',
    description: 'Quản lý bản đồ, tổ chức, giao dịch và chat thời gian thực.',
    href: '/games/miniworld/',
    label: 'New',
    color: 'blue',
    icon: Compass,
    kind: 'game',
    hot: true,
  },
  {
    id: 'dino',
    title: 'Dino Game',
    description: 'Game khủng long huyền thoại, nhẹ và rất dễ nghiện.',
    href: '/games/dino/',
    label: 'Classic',
    color: 'stone',
    icon: Gamepad2,
    kind: 'game',
  },
  {
    id: 'lucky-wheel',
    title: 'Lucky Wheel',
    description: 'Vòng quay may mắn cho lớp học, nhóm bạn hoặc sự kiện.',
    href: '/games/lucky/vong-quay-may-man.html',
    label: 'Random',
    color: 'amber',
    icon: Sparkles,
    kind: 'game',
  },
  {
    id: 'countdown',
    title: 'Đếm giờ',
    description: 'Đồng hồ đếm ngược cho thử thách, deadline và sự kiện.',
    href: '/games/dem-gio/',
    label: 'Timer',
    color: 'green',
    icon: Timer,
    kind: 'game',
  },
  {
    id: 'tinh-khoi',
    title: 'Tính khối',
    description: 'Công cụ trò chơi hóa cho tính toán hình khối.',
    href: '/games/tinh-khoi/',
    label: '3D',
    color: 'violet',
    icon: Boxes,
    kind: 'game',
  },
  {
    id: 'o-an-quan',
    title: 'Ô ăn quan',
    description: 'Trò chơi dân gian trí tuệ Việt Nam.',
    href: '/games/o_an_quan/',
    label: 'Việt Nam',
    color: 'rose',
    icon: Brain,
    kind: 'game',
  },
];

const toolItems: HubItem[] = [
  {
    id: 'search-ai',
    title: 'Search AI',
    description: 'Tìm nhanh nội dung trong hệ thống và mở rộng ra web.',
    href: '/utils/search/',
    label: 'Search',
    color: 'blue',
    icon: Search,
    kind: 'tool',
  },
  {
    id: 'tts',
    title: 'Text to Speech',
    description: 'Chuyển văn bản thành giọng nói tự nhiên.',
    href: '/utils/tts/',
    label: 'Audio',
    color: 'amber',
    icon: Volume2,
    kind: 'tool',
  },
  {
    id: 'qr',
    title: 'QR Code',
    description: 'Tạo mã QR nhanh cho link, văn bản hoặc tài liệu.',
    href: '/utils/qr/',
    label: 'QR',
    color: 'stone',
    icon: QrCode,
    kind: 'tool',
  },
  {
    id: 'pastel-bg',
    title: 'Pastel Background',
    description: 'Kho nền gradient pastel cho slide và nội dung số.',
    href: '/utils/nen-gradient-pastel/',
    label: 'Design',
    color: 'rose',
    icon: Sparkles,
    kind: 'tool',
  },
  {
    id: 'morse',
    title: 'Morse',
    description: 'Mã hóa, giải mã và luyện tín hiệu Morse.',
    href: '/morse/',
    label: 'Code',
    color: 'green',
    icon: Bot,
    kind: 'tool',
  },
  {
    id: 'docs',
    title: 'Docs Viewer',
    description: 'Xem tài liệu Word và PowerPoint đã chia sẻ.',
    href: '/media/docs/',
    label: 'Docs',
    color: 'violet',
    icon: FileText,
    kind: 'tool',
  },
];

const noticesFallback: Notice[] = [
  {
    id: 'n1',
    title: 'EduSpace THPT 2026 đã sẵn sàng',
    info: 'Bộ đề và bài ôn tập mới đã được đưa lên khu THPT 2026.',
    date: '28/08/2026',
    time: '19:30',
    stt: 3,
    color: '#0070f3',
  },
  {
    id: 'n2',
    title: 'Beta homepage',
    info: 'Giao diện trang chủ React mới đang chạy thử trong thư mục beta.',
    date: '28/08/2026',
    time: '19:10',
    stt: 2,
    color: '#16a34a',
  },
];

const searchScopes = [
  { id: 'all', label: 'Tất cả' },
  { id: 'learning', label: 'Học tập' },
  { id: 'post', label: 'Bài đăng' },
  { id: 'game', label: 'Trò chơi' },
  { id: 'tool', label: 'Công cụ' },
] as const;

const navLinks = [
  { id: 'home', label: 'Trang chủ', href: '/beta/', icon: Home },
  { id: 'learning', label: 'Học tập', href: '/eduspace/', icon: GraduationCap },
  { id: 'social', label: 'Kết nối', href: '/chat/', icon: MessageCircle },
  { id: 'games', label: 'Trò chơi', href: '/games/', icon: Gamepad2 },
  { id: 'tools', label: 'Công cụ', href: '/utils/', icon: Wrench },
  { id: 'about', label: 'Giới thiệu', href: '#about', icon: Info },
  { id: 'terms', label: 'Điều khoản', href: '/privacy/', icon: ShieldCheck },
];

function readAccountState(): AccountState {
  try {
    window.NDAccounts?.syncActiveAccountToSession();
    const accounts = window.NDAccounts?.getAllAccounts() || [];
    const activeIndex = window.NDAccounts?.getActiveIndexFromUrl() || 0;
    const active = window.NDAccounts?.getActiveAccount() || accounts[activeIndex] || accounts[0] || null;
    return { accounts, active, activeIndex };
  } catch (_) {
    try {
      const rawAccounts = localStorage.getItem('nd_accounts');
      const accounts = rawAccounts ? JSON.parse(rawAccounts).slice(0, 10) : [];
      const activeIndex = Number(localStorage.getItem('nd_active_index') || 0);
      const active = accounts[activeIndex] || JSON.parse(localStorage.getItem('nd_user') || 'null');
      return { accounts, active, activeIndex };
    } catch (_) {
      return { accounts: [], active: null, activeIndex: 0 };
    }
  }
}

function accountName(account: Account | null) {
  if (!account) return 'Khách ND Labs';
  return account.displayName || account.fullname || account.ndid || account.email || 'ND Member';
}

function roleLabels(account: Account | null) {
  if (!account) return [];
  const labels: string[] = [];
  if (account.role) labels.push(account.role === 'admin' ? 'Admin' : capitalize(account.role));
  if (account.eduRole && account.eduRole !== account.role) {
    labels.push(roleName(account.eduRole));
  }
  return [...new Set(labels)].filter(Boolean);
}

function roleName(role: string) {
  const map: Record<string, string> = {
    teacher: 'Giáo viên',
    student: 'Học viên',
    member: 'Thành viên',
    lecturer: 'Giảng viên',
  };
  return map[role] || capitalize(role);
}

function capitalize(value: string) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildInternalHref(href: string) {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  try {
    return window.NDAccounts?.buildUrlWithAccount(href) || href;
  } catch (_) {
    return href;
  }
}

function stripMarkdownLinks(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1');
}

function extractFirstMarkdownLink(text: string) {
  const match = text.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
  return match?.[2] || '';
}

function useAccounts() {
  const [state, setState] = useState<AccountState>(() => readAccountState());

  useEffect(() => {
    const refresh = () => setState(readAccountState());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('firebase-ready', refresh);
    const timer = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('firebase-ready', refresh);
      window.clearInterval(timer);
    };
  }, []);

  return state;
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((title: string, message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.round(Math.random() * 1000);
    setToasts((items) => [...items, { id, title, message, tone }].slice(-4));
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 4600);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}

function useAdminPosts() {
  const [posts, setPosts] = useState<AdminPost[]>(fallbackPosts);
  const [source, setSource] = useState<'firebase' | 'fallback'>('fallback');

  useEffect(() => {
    let cancelled = false;

    const waitForFirestore = async () => {
      if (window.firebaseFirestore) return true;
      return new Promise<boolean>((resolve) => {
        const finish = (value: boolean) => {
          window.removeEventListener('firebase-ready', onReady);
          window.removeEventListener('firebase-missing', onMissing);
          window.clearTimeout(timer);
          resolve(value);
        };
        const onReady = () => finish(true);
        const onMissing = () => finish(false);
        const timer = window.setTimeout(() => finish(Boolean(window.firebaseFirestore)), 3600);
        window.addEventListener('firebase-ready', onReady, { once: true });
        window.addEventListener('firebase-missing', onMissing, { once: true });
      });
    };

    const load = async () => {
      const ready = await waitForFirestore();
      if (!ready || !window.firebaseFirestore || cancelled) return;

      try {
        const firestoreUrl = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
        const firestore = await import(/* @vite-ignore */ firestoreUrl);
        const q = firestore.query(
          firestore.collection(window.firebaseFirestore, 'eduspace_lessons'),
          firestore.orderBy('createdAt', 'desc'),
          firestore.limit(12),
        );
        const snap = await firestore.getDocs(q);
        const next: AdminPost[] = [];
        snap.forEach((docSnap: { id: string; data: () => Record<string, unknown> }) => {
          const data = docSnap.data();
          const id = String(data.id || docSnap.id);
          next.push({
            id,
            title: String(data.title || 'Bài đăng EduSpace'),
            description: String(data.description || 'Nội dung học tập mới từ hệ thống admin.'),
            href: String(data.url || `/eduspace/exam?${id}`),
            label: String(data.tag || data.subject || 'EduSpace'),
            type: String(data.type || ''),
            subject: String(data.subject || ''),
            class: String(data.class || ''),
            hot: Boolean(data.isHot),
            comingSoon: Boolean(data.isComingSoon),
            source: 'firebase',
          });
        });

        if (!cancelled && next.length) {
          setPosts(next);
          setSource('firebase');
        }
      } catch (error) {
        console.warn('Could not load admin posts for beta homepage:', error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, source };
}

function useNotifications() {
  const [items, setItems] = useState<Notice[]>(noticesFallback);
  const [lastRead, setLastRead] = useState(() => Number(localStorage.getItem('nd_beta_last_read_stt') || 0));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }

      try {
        const keys = await window.getEduKeys?.();
        const base = (keys?.fbDatabaseURL || 'https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app').replace(/\/$/, '');
        const response = await fetch(`${base}/notifications.json?nocache=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (!data || cancelled) return;

        const now = Date.now();
        const next = Object.entries(data)
          .map(([id, raw]) => {
            const item = raw as Record<string, unknown>;
            return {
              id,
              title: String(item.title || 'Thông báo'),
              info: String(item.info || ''),
              date: String(item.date || 'Thông báo'),
              time: String(item.time || ''),
              stt: Number(item.stt || 0),
              color: String(item.color || '#0070f3'),
              scheduled: Boolean(item.scheduled),
              scheduledTimestamp: Number(item.scheduledTimestamp || 0),
            };
          })
          .filter((item) => !item.scheduled || !item.scheduledTimestamp || item.scheduledTimestamp <= now)
          .sort((a, b) => b.stt - a.stt)
          .slice(0, 20)
          .map(({ scheduled, scheduledTimestamp, ...item }) => item);

        if (next.length && !cancelled) setItems(next);
      } catch (error) {
        console.warn('Could not load beta notifications:', error);
      }
    };

    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const markRead = () => {
    const max = Math.max(0, ...items.map((item) => item.stt));
    localStorage.setItem('nd_beta_last_read_stt', String(max));
    setLastRead(max);
  };

  return {
    items,
    unreadCount: items.filter((item) => item.stt > lastRead).length,
    markRead,
  };
}

function App() {
  const accountState = useAccounts();
  const { toasts, pushToast, dismissToast } = useToasts();
  const { posts, source } = useAdminPosts();
  const notifications = useNotifications();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [locationKey, setLocationKey] = useState(() => `${window.location.pathname}${window.location.hash}`);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<(typeof searchScopes)[number]>(searchScopes[0]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const refresh = () => setLocationKey(`${window.location.pathname}${window.location.hash}`);
    window.addEventListener('hashchange', refresh);
    window.addEventListener('popstate', refresh);
    return () => {
      window.removeEventListener('hashchange', refresh);
      window.removeEventListener('popstate', refresh);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const postItems = useMemo<HubItem[]>(
    () =>
      posts.map((post) => ({
        id: `post-${post.id}`,
        title: post.title,
        description: post.description,
        href: post.href,
        label: post.label,
        color: post.hot ? 'amber' : 'blue',
        icon: post.type === 'quiz' ? FileText : BookOpen,
        kind: 'post',
        meta: [post.subject, post.class ? `Lớp ${post.class}` : ''].filter(Boolean).join(' - '),
        hot: post.hot,
      })),
    [posts],
  );

  const allItems = useMemo(
    () => [...learningItems, ...socialItems, ...gameItems, ...toolItems, ...postItems],
    [postItems],
  );

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return allItems
      .filter((item) => {
        const matchesScope = scope.id === 'all' || item.kind === scope.id;
        const haystack = `${item.title} ${item.description} ${item.label} ${item.meta || ''}`.toLowerCase();
        return matchesScope && haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [allItems, query, scope]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
        pushToast('Nhạc nền', 'Đã bật nhạc nền cho phiên này.', 'success');
      } else {
        audio.pause();
        setIsPlaying(false);
        pushToast('Nhạc nền', 'Đã tạm dừng nhạc nền.', 'info');
      }
    } catch (_) {
      pushToast('Trình duyệt cần tương tác', 'Bấm lại nút phát để bắt đầu nhạc nền.', 'warning');
    }
  };

  const shareLink = async (href: string, title: string) => {
    const url = new URL(buildInternalHref(href), window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      pushToast('Đã sao chép liên kết', title, 'success');
    } catch (_) {
      pushToast('Không thể sao chép', url, 'warning');
    }
  };

  const openFirstSearchResult = () => {
    if (searchResults[0]) {
      window.location.href = buildInternalHref(searchResults[0].href);
    }
  };

  const toggleSaved = (id: string, title: string) => {
    setSaved((current) => {
      const next = !current[id];
      pushToast(next ? 'Đã lưu' : 'Đã bỏ lưu', title, 'success');
      return { ...current, [id]: next };
    });
  };

  const toggleLike = (id: string, title: string) => {
    setLiked((current) => {
      const next = !current[id];
      pushToast(next ? 'Đã thích' : 'Đã bỏ thích', title, 'info');
      return { ...current, [id]: next };
    });
  };

  return (
    <div className="appShell">
      <audio ref={audioRef} src="/assets/audio/nhacnen.mp3" loop preload="none" />
      <Navbar
        accountState={accountState}
        accountOpen={accountOpen}
        setAccountOpen={setAccountOpen}
        noticeOpen={noticeOpen}
        setNoticeOpen={(open) => {
          setNoticeOpen(open);
          if (open) notifications.markRead();
        }}
        unreadCount={notifications.unreadCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        locationKey={locationKey}
        pushToast={pushToast}
      />

      <main className="mainCanvas">
        <Hero
          query={query}
          setQuery={setQuery}
          scope={scope}
          setScope={setScope}
          scopeOpen={scopeOpen}
          setScopeOpen={setScopeOpen}
          searchResults={searchResults}
          openFirstSearchResult={openFirstSearchResult}
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          volume={volume}
          setVolume={setVolume}
          postsCount={posts.length}
          source={source}
          account={accountState.active}
        />

        <section className="quickPulse" aria-label="Tổng quan nhanh">
          <Metric icon={GraduationCap} label="Bài học" value={`${learningItems.length + postItems.length}`} />
          <Metric icon={MessageCircle} label="Kết nối" value={`${socialItems.length}`} />
          <Metric icon={Gamepad2} label="Game" value={`${gameItems.length}`} />
          <Metric icon={Wrench} label="Công cụ" value={`${toolItems.length}`} />
        </section>

        <ContentRow
          title="Công cụ học tập"
          subtitle="Từ EduSpace cũ đến các tiện ích AI mới"
          items={learningItems}
          saved={saved}
          onSave={toggleSaved}
          onShare={shareLink}
        />
        <ContentRow
          title="Không gian kết nối"
          subtitle="ChatND, chia sẻ nhanh và nội dung cộng đồng"
          items={socialItems}
          saved={saved}
          onSave={toggleSaved}
          onShare={shareLink}
        />
        <ContentRow
          title="Trò chơi"
          subtitle="Các game đang có trong mục games"
          items={gameItems}
          saved={saved}
          onSave={toggleSaved}
          onShare={shareLink}
        />
        <ContentRow
          title="Công cụ"
          subtitle="Các tiện ích cũ trong utils, đưa lên một hàng dễ tìm"
          items={toolItems}
          saved={saved}
          onSave={toggleSaved}
          onShare={shareLink}
        />

        <AdminFeed
          posts={posts}
          source={source}
          liked={liked}
          saved={saved}
          onLike={toggleLike}
          onSave={toggleSaved}
          onShare={shareLink}
        />

        <section id="about" className="aboutBand">
          <div>
            <p className="eyebrow">ND Labs Beta</p>
            <h2>Trang chủ mới làm trung tâm điều hướng cho học, chơi, chat và công cụ.</h2>
          </div>
          <p>
            Navbar, account switcher, notification center và các hàng nội dung được viết thành React component để dùng
            lại cho các trang beta tiếp theo.
          </p>
        </section>
      </main>

      <NotificationPanel
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        notices={notifications.items}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <footer className="footerBar">
        <span>EduSpace Beta by ND Labs</span>
        <a href={buildInternalHref('/privacy/')}>Điều khoản & quyền riêng tư</a>
      </footer>
    </div>
  );
}

type NavbarProps = {
  accountState: AccountState;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  noticeOpen: boolean;
  setNoticeOpen: (open: boolean) => void;
  unreadCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  locationKey: string;
  pushToast: (title: string, message: string, tone?: Toast['tone']) => void;
};

function Navbar({
  accountState,
  accountOpen,
  setAccountOpen,
  noticeOpen,
  setNoticeOpen,
  unreadCount,
  mobileOpen,
  setMobileOpen,
  locationKey,
  pushToast,
}: NavbarProps) {
  const active = accountState.active;
  const labels = roleLabels(active);
  const isAdmin = active?.role === 'admin';

  const logoutActive = async () => {
    try {
      if (window.NDAccounts && accountState.accounts.length) {
        await window.NDAccounts.removeAccount(accountState.activeIndex);
      } else {
        localStorage.removeItem('nd_user');
        localStorage.removeItem('nd_accounts');
        localStorage.removeItem('nd_active_index');
        window.location.href = '/auth/login/';
      }
    } catch (_) {
      pushToast('Chưa đăng xuất được', 'Vui lòng thử lại sau vài giây.', 'warning');
    }
  };

  const logoutAll = async () => {
    try {
      if (window.NDAccounts) {
        await window.NDAccounts.removeAllAccounts();
      } else {
        localStorage.removeItem('nd_user');
        localStorage.removeItem('nd_accounts');
        localStorage.removeItem('nd_active_index');
        window.location.href = '/auth/login/';
      }
    } catch (_) {
      pushToast('Chưa đăng xuất được', 'Vui lòng thử lại sau vài giây.', 'warning');
    }
  };

  return (
    <header className="navbarShell">
      <div className="navbarInner">
        <a className="brandLockup" href={buildInternalHref('/beta/')} aria-label="EduSpace Beta">
          <img src="/assets/images/logo.png" alt="ND Labs" />
          <span>EduSpace</span>
          <small>Beta</small>
        </a>

        <nav className={`navLinks ${mobileOpen ? 'open' : ''}`} aria-label="Điều hướng chính">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isCurrent = isActiveNav(link.id, link.href, locationKey);
            return (
              <a
                key={link.id}
                className={`navTab ${isCurrent ? 'active' : ''}`}
                href={link.href.startsWith('#') ? link.href : buildInternalHref(link.href)}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="navActions">
          <button
            className="iconButton"
            type="button"
            aria-label="Thông báo"
            onClick={() => setNoticeOpen(!noticeOpen)}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="badgeDot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {active && (
            <a className="iconButton" href={buildInternalHref('/auth/settings/')} aria-label="Cài đặt">
              <Settings size={19} />
            </a>
          )}
          <button className="menuButton" type="button" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {active ? (
            <div className="accountWrap">
              <button
                type="button"
                className={`accountButton ${isAdmin ? 'admin' : ''}`}
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <span className={`avatarShell ${isAdmin ? 'admin' : ''}`}>
                  <img src={active.photoURL || '/assets/images/avatar.png'} alt={accountName(active)} />
                </span>
                <span className="accountText">
                  <strong>{active.ndid || accountName(active)}</strong>
                  <small>{labels[0] || 'Thành viên'}</small>
                </span>
                <ChevronDown size={16} />
              </button>

              {accountOpen && (
                <div className="accountMenu">
                  <div className="accountMenuHeader">
                    <span className={`avatarShell large ${isAdmin ? 'admin' : ''}`}>
                      <img src={active.photoURL || '/assets/images/avatar.png'} alt={accountName(active)} />
                    </span>
                    <div>
                      <strong>{accountName(active)}</strong>
                      <small>{active.ndid || active.email || 'NDID'}</small>
                      <div className="roleLine">
                        {labels.map((label) => (
                          <span key={label} className={label === 'Admin' ? 'rolePill admin' : 'rolePill'}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <a className="menuItem" href={buildInternalHref('/auth/settings/')}>
                    <Settings size={17} />
                    <span>Cài đặt tài khoản</span>
                  </a>
                  <a className="menuItem" href={buildInternalHref('/auth/login/')}>
                    <UserPlus size={17} />
                    <span>Thêm tài khoản</span>
                  </a>

                  {accountState.accounts.length > 1 && (
                    <div className="switchList">
                      <div className="menuLabel">Chuyển tài khoản</div>
                      {accountState.accounts.map((account, index) => (
                        <button
                          type="button"
                          className="switchItem"
                          key={`${account.uid || account.ndid || account.email || index}`}
                          onClick={() => window.NDAccounts?.switchAccount(index)}
                        >
                          <img src={account.photoURL || '/assets/images/avatar.png'} alt={accountName(account)} />
                          <span>{account.ndid || accountName(account)}</span>
                          {index === accountState.activeIndex && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  )}

                  <button className="menuItem danger" type="button" onClick={logoutActive}>
                    <LogOut size={17} />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                  <button className="menuItem danger" type="button" onClick={logoutAll}>
                    <Users size={17} />
                    <span>Đăng xuất tất cả</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="authButtons">
              <a className="loginLink" href={buildInternalHref('/auth/login/')}>
                <LogIn size={17} />
                <span>Đăng nhập</span>
              </a>
              <a className="ndidLink" href={buildInternalHref('/auth/register/')}>
                NDID
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function isActiveNav(id: string, href: string, locationKey: string) {
  const [pathname, hash = ''] = locationKey.split('#');
  if (id === 'home') return pathname === '/beta/' || pathname === '/beta/index.html';
  if (href.startsWith('#')) return hash === href.slice(1);
  return pathname.startsWith(href.replace(/\/$/, ''));
}

type HeroProps = {
  query: string;
  setQuery: (value: string) => void;
  scope: (typeof searchScopes)[number];
  setScope: (scope: (typeof searchScopes)[number]) => void;
  scopeOpen: boolean;
  setScopeOpen: (open: boolean) => void;
  searchResults: HubItem[];
  openFirstSearchResult: () => void;
  isPlaying: boolean;
  toggleMusic: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  postsCount: number;
  source: 'firebase' | 'fallback';
  account: Account | null;
};

function Hero({
  query,
  setQuery,
  scope,
  setScope,
  scopeOpen,
  setScopeOpen,
  searchResults,
  openFirstSearchResult,
  isPlaying,
  toggleMusic,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  postsCount,
  source,
  account,
}: HeroProps) {
  return (
    <section className="heroStage">
      <div className="heroCopy">
        <p className="eyebrow">ND Labs Home</p>
        <h1>Học tập, kết nối, giải trí và công cụ trong một không gian.</h1>
        <p className="heroLead">
          Xin chào {account ? accountName(account) : 'bạn'} - mọi lối tắt quan trọng đang ở ngay đây.
        </p>
        <div className="heroBadges">
          <span>
            <Sparkles size={15} />
            Giao diện beta
          </span>
          <span>
            <CalendarDays size={15} />
            {postsCount} bài đăng
          </span>
          <span>
            <ShieldCheck size={15} />
            {source === 'firebase' ? 'Đồng bộ admin' : 'Dữ liệu dự phòng'}
          </span>
        </div>
      </div>

      <div className="commandCenter" aria-label="Tìm kiếm và điều khiển nhanh">
        <div className="searchTool">
          <div className="scopePicker">
            <button type="button" className="scopeButton" onClick={() => setScopeOpen(!scopeOpen)}>
              <span>{scope.label}</span>
              <ChevronDown size={16} />
            </button>
            {scopeOpen && (
              <div className="scopeMenu">
                {searchScopes.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={scope.id === item.id ? 'selected' : ''}
                    onClick={() => {
                      setScope(item);
                      setScopeOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    {scope.id === item.id && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') openFirstSearchResult();
            }}
            placeholder="Tìm bài học, ChatND, game, công cụ..."
          />
          <button className="searchSubmit" type="button" onClick={openFirstSearchResult}>
            <span>Mở</span>
          </button>
        </div>

        {query.trim() && (
          <div className="searchResultsPanel">
            {searchResults.length ? (
              searchResults.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.id} href={buildInternalHref(item.href)} className="resultItem">
                    <span className={`miniIcon ${item.color}`}>
                      <Icon size={17} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </a>
                );
              })
            ) : (
              <div className="emptyResults">
                <Search size={18} />
                <span>Không tìm thấy nội dung phù hợp.</span>
              </div>
            )}
          </div>
        )}

        <div className="musicDock">
          <button type="button" className="playButton" onClick={toggleMusic}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span>{isPlaying ? 'Đang phát' : 'Nhạc nền'}</span>
          </button>
          <button type="button" className="iconButton light" onClick={() => setIsMuted(!isMuted)} aria-label="Âm thanh">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            className="volumeSlider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Âm lượng nhạc nền"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="metricItem">
      <Icon size={20} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

type ContentRowProps = {
  title: string;
  subtitle: string;
  items: HubItem[];
  saved: Record<string, boolean>;
  onSave: (id: string, title: string) => void;
  onShare: (href: string, title: string) => void;
};

function ContentRow({ title, subtitle, items, saved, onSave, onShare }: ContentRowProps) {
  return (
    <section className="contentSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <a href={buildInternalHref(sectionHref(items[0]?.kind))}>Xem tất cả</a>
      </div>
      <div className="cardRail">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            saved={Boolean(saved[item.id])}
            onSave={onSave}
            onShare={onShare}
          />
        ))}
      </div>
    </section>
  );
}

function sectionHref(kind: HubItem['kind']) {
  if (kind === 'learning' || kind === 'post') return '/eduspace/';
  if (kind === 'social') return '/chat/';
  if (kind === 'game') return '/games/';
  return '/utils/';
}

function ContentCard({
  item,
  saved,
  onSave,
  onShare,
}: {
  key?: string;
  item: HubItem;
  saved: boolean;
  onSave: (id: string, title: string) => void;
  onShare: (href: string, title: string) => void;
}) {
  const Icon = item.icon;
  return (
    <article className={`contentCard ${item.color}`}>
      <a href={buildInternalHref(item.href)} className="cardMain">
        <span className={`cardIcon ${item.color}`}>
          <Icon size={24} />
        </span>
        <span className="cardLabel">{item.label}</span>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </a>
      <div className="cardActions">
        <button type="button" aria-label="Lưu" className={saved ? 'active' : ''} onClick={() => onSave(item.id, item.title)}>
          <Bookmark size={17} />
        </button>
        <button type="button" aria-label="Chia sẻ" onClick={() => onShare(item.href, item.title)}>
          <Share2 size={17} />
        </button>
      </div>
      {item.hot && <span className="hotFlag">Hot</span>}
    </article>
  );
}

type AdminFeedProps = {
  posts: AdminPost[];
  source: 'firebase' | 'fallback';
  liked: Record<string, boolean>;
  saved: Record<string, boolean>;
  onLike: (id: string, title: string) => void;
  onSave: (id: string, title: string) => void;
  onShare: (href: string, title: string) => void;
};

function AdminFeed({ posts, source, liked, saved, onLike, onSave, onShare }: AdminFeedProps) {
  return (
    <section className="feedSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">{source === 'firebase' ? 'Đang đọc từ admin' : 'Dữ liệu mẫu khi thử local'}</p>
          <h2>Bài đăng mới</h2>
        </div>
        <a href={buildInternalHref('/eduspace/')}>EduSpace</a>
      </div>

      <div className="feedGrid">
        {posts.slice(0, 6).map((post) => {
          const itemId = `feed-${post.id}`;
          return (
            <article className="feedPost" key={post.id}>
              <div className="postTop">
                <span className="avatarShell small admin">
                  <img src="/assets/images/logo.png" alt="Admin ND Labs" />
                </span>
                <div>
                  <strong>EduSpace Admin</strong>
                  <small>{[post.label, post.class ? `Lớp ${post.class}` : ''].filter(Boolean).join(' - ')}</small>
                </div>
              </div>
              <a href={buildInternalHref(post.href)} className="postBody">
                <span className="postBadge">{post.type === 'quiz' ? 'Đề thi' : post.type === 'lesson' ? 'Bài học' : 'Bài đăng'}</span>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </a>
              <div className="postActions">
                <button
                  type="button"
                  className={liked[itemId] ? 'active' : ''}
                  onClick={() => onLike(itemId, post.title)}
                >
                  <Heart size={17} />
                  <span>{liked[itemId] ? 'Đã thích' : 'Thích'}</span>
                </button>
                <button
                  type="button"
                  className={saved[itemId] ? 'active' : ''}
                  onClick={() => onSave(itemId, post.title)}
                >
                  <Bookmark size={17} />
                  <span>Lưu</span>
                </button>
                <button type="button" onClick={() => onShare(post.href, post.title)}>
                  <Share2 size={17} />
                  <span>Share</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NotificationPanel({ open, onClose, notices }: { open: boolean; onClose: () => void; notices: Notice[] }) {
  if (!open) return null;
  return (
    <div className="modalBackdrop" onClick={onClose}>
      <aside className="notificationPanel" onClick={(event) => event.stopPropagation()} aria-label="Thông báo">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Trong web</p>
            <h2>Thông báo</h2>
          </div>
          <button type="button" className="iconButton light" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="noticeList">
          {notices.map((notice) => {
            const firstLink = extractFirstMarkdownLink(notice.info);
            const content = (
              <>
                <span className="noticeTime">
                  <Clock3 size={14} />
                  {notice.date} {notice.time}
                </span>
                <strong>{notice.title}</strong>
                <p>{stripMarkdownLinks(notice.info)}</p>
              </>
            );
            return firstLink ? (
              <a
                className="noticeItem"
                href={firstLink}
                target="_blank"
                rel="noreferrer"
                key={notice.id}
                style={{ '--notice-color': notice.color } as CSSProperties}
              >
                {content}
              </a>
            ) : (
              <div
                className="noticeItem"
                key={notice.id}
                style={{ '--notice-color': notice.color } as CSSProperties}
              >
                {content}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast ${toast.tone || 'info'}`} key={toast.id}>
          <span className="toastIcon">
            {toast.tone === 'success' ? <Check size={17} /> : toast.tone === 'warning' ? <Info size={17} /> : <Bell size={17} />}
          </span>
          <span>
            <strong>{toast.title}</strong>
            <small>{toast.message}</small>
          </span>
          <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Đóng thông báo">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
