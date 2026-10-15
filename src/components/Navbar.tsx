import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  GraduationCap, 
  Monitor, 
  Heart, 
  Gamepad2, 
  ShieldCheck, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  UserPlus, 
  ExternalLink,
  QrCode,
  Calculator,
  Timer,
  FileText,
  Copy,
  Check
} from 'lucide-react';

export interface UserSession {
  uid: string;
  ndid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role: 'member' | 'admin' | string;
  eduRole?: 'student' | 'teacher' | 'admin' | string;
  adminLevel?: string;
  codeId?: string;
}

export interface NotificationItem {
  id?: string;
  stt?: number;
  title: string;
  info: string;
  content?: string;
  image?: string;
  link?: string;
  linkText?: string;
  textColor?: string;
  sender?: {
    type?: string;
    name?: string;
    adminNdid?: string;
    collaborators?: string[];
  };
  target?: {
    type?: string;
    groupRole?: string;
    recipients?: string[];
  };
  date?: string;
  time?: string;
  color?: string;
  scheduled?: boolean;
  scheduledTimestamp?: number;
  createdAt?: number;
}

function formatRichNotification(text?: string): string {
  if (!text) return '';
  let safe = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // bold: **text**
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // italic: *text*
  safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // underline: __text__ or <u>text</u>
  safe = safe.replace(/__(.*?)__/g, '<u>$1</u>');
  safe = safe.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
  // custom color: [color:#hex]text[/color]
  safe = safe.replace(/\[color:(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]([\s\S]*?)\[\/color\]/g, '<span style="color: $1">$2</span>');
  // links: [title](url)
  safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-bold hover:text-blue-700">$1</a>');
  // mentions: @ndid (Rule #2 & #3: preserve raw string, no extra @)
  safe = safe.replace(/@([a-zA-Z0-9_.@#-]+)/g, '<span class="font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">@$1</span>');
  return safe;
}

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'qr' | 'calc' | 'timer' | 'notes'>('qr');
  
  // Realtime notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [activeAccountIdx, setActiveAccountIdx] = useState(0);

  // Quick Tools: Copied state for QR
  const [copiedUrl, setCopiedUrl] = useState(false);
  // Quick Tools: Notes
  const [quickNote, setQuickNote] = useState(() => localStorage.getItem('nd_quick_notes') || '');
  // Quick Tools: Calc
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpr, setCalcExpr] = useState('');
  // Quick Tools: Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // 1. Sync User Session
  useEffect(() => {
    function loadUser() {
      try {
        const raw = localStorage.getItem('nd_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }

      if ((window as any).NDAccounts) {
        setAccountsList((window as any).NDAccounts.getAllAccounts() || []);
        setActiveAccountIdx((window as any).NDAccounts.getActiveIndexFromUrl() || 0);
      }
    }

    loadUser();

    const handleAuthChange = (e: any) => {
      if (e?.detail?.profile) {
        setCurrentUser(e.detail.profile);
      } else if (e?.detail?.codeId === null) {
        setCurrentUser(null);
      } else {
        loadUser();
      }
    };

    window.addEventListener('nd-auth-state-changed', handleAuthChange);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('nd-auth-state-changed', handleAuthChange);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // 2. Realtime Notifications Listener (Firestore Primary + RTDB Fallback)
  useEffect(() => {
    let unsubscribeFirebase: (() => void) | null = null;

    async function initNotifications() {
      const processNotificationData = (data: Record<string, NotificationItem> | null) => {
        if (!data) {
          setNotifications([]);
          setHasUnread(false);
          return;
        }

        const now = Date.now();
        const rawUser = localStorage.getItem('nd_user');
        let userProfile: any = currentUser;
        if (!userProfile && rawUser) {
          try { userProfile = JSON.parse(rawUser); } catch (_) {}
        }
        const isUserAdmin = userProfile && (userProfile.role === 'admin' || userProfile.adminLevel === 'owner');

        const list = Object.entries(data).map(([id, item]) => ({
          ...item,
          id: item.id || id
        })).filter(item => {
          if (item.scheduled && item.scheduledTimestamp && item.scheduledTimestamp > now) {
            return false;
          }
          // Audience filtering
          if (!item.target || item.target.type === 'all' || !item.target.type) return true;
          if (item.target.type === 'group') {
            if (isUserAdmin) return true;
            if (!userProfile) return false;
            const g = item.target.groupRole;
            if (g === 'student' && (userProfile.eduRole === 'student' || !userProfile.eduRole)) return true;
            if (g === 'teacher' && userProfile.eduRole === 'teacher') return true;
            if (g === 'admin' && userProfile.role === 'admin') return true;
            if (g === 'member' && userProfile) return true;
            if (g === 'grade_10' && String(userProfile.grade).includes('10')) return true;
            if (g === 'grade_11' && String(userProfile.grade).includes('11')) return true;
            if (g === 'grade_12' && String(userProfile.grade).includes('12')) return true;
            return false;
          }
          if (item.target.type === 'user') {
            if (isUserAdmin) return true;
            if (!userProfile) return false;
            const recipients = item.target.recipients || [];
            const myNdid = (userProfile.ndid || '').toLowerCase().trim();
            const myCodeId = (userProfile.codeId || userProfile.uid || '').toLowerCase().trim();
            return recipients.some(r => {
              const target = String(r).toLowerCase().trim().replace(/^@/, '');
              return target === myNdid || target === myCodeId;
            });
          }
          return true;
        });

        list.sort((a, b) => (b.createdAt || b.stt || 0) - (a.createdAt || a.stt || 0));
        setNotifications(list);

        const lastRead = parseInt(localStorage.getItem('nd_last_read_stt') || '0', 10);
        const maxStt = Math.max(...list.map(n => n.createdAt || n.stt || 0), 0);
        setHasUnread(maxStt > lastRead);
      };

      try {
        if ((window as any).firebaseFirestore) {
          const { collection, onSnapshot, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any);
          const q = query(collection((window as any).firebaseFirestore, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
          const unsub = onSnapshot(q, (snapshot: any) => {
            const notifs: Record<string, NotificationItem> = {};
            snapshot.forEach((doc: any) => {
              notifs[doc.id] = { id: doc.id, ...doc.data() };
            });
            processNotificationData(notifs);
          }, (err: any) => {
            console.warn("Firestore snapshot unavailable, using RTDB fallback:", err);
            tryRtdb();
          });
          unsubscribeFirebase = () => unsub();
          return;
        }
      } catch {
        // Fallback
      }

      async function tryRtdb() {
        try {
          if ((window as any).firebaseDb) {
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
            const notifRef = ref((window as any).firebaseDb, 'notifications');
            const unsub = onValue(notifRef, (snapshot: any) => {
              processNotificationData(snapshot.val());
            });
            unsubscribeFirebase = () => unsub();
          } else {
            const dbUrl = "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app/notifications.json";
            const res = await fetch(`${dbUrl}?nocache=${Date.now()}`);
            if (res.ok) {
              const data = await res.json();
              processNotificationData(data);
            }
          }
        } catch {}
      }

      tryRtdb();
    }

    initNotifications();

    const handleFirebaseReady = () => initNotifications();
    window.addEventListener('firebase-ready', handleFirebaseReady);

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
      window.removeEventListener('firebase-ready', handleFirebaseReady);
    };
  }, [currentUser]);

  // 3. Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Quick Tools: Pomodoro timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      alert('Pomodoro hoàn thành! Hãy nghỉ ngơi chút nhé.');
      setTimerSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleMarkAllRead = () => {
    if (notifications.length > 0) {
      const maxStt = Math.max(...notifications.map(n => n.stt || 0), 0);
      localStorage.setItem('nd_last_read_stt', maxStt.toString());
      setHasUnread(false);
    }
  };

  const handleLogoutCurrent = () => {
    if ((window as any).canonicalAuth) {
      try { (window as any).canonicalAuth.logout(); } catch (_) {}
    }
    if ((window as any).NDAccounts) {
      (window as any).NDAccounts.removeAccount(activeAccountIdx);
    } else {
      localStorage.removeItem('nd_user');
      window.location.reload();
    }
  };

  const handleLogoutAll = () => {
    if ((window as any).canonicalAuth) {
      try { (window as any).canonicalAuth.logout(); } catch (_) {}
    }
    if ((window as any).NDAccounts) {
      (window as any).NDAccounts.removeAllAccounts();
    } else {
      localStorage.removeItem('nd_user');
      localStorage.removeItem('nd_accounts');
      window.location.reload();
    }
  };

  const copyPageUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcExpr('');
      setCalcDisplay('0');
    } else if (val === 'back') {
      const next = calcExpr.slice(0, -1);
      setCalcExpr(next);
      setCalcDisplay(next || '0');
    } else if (val === '=') {
      try {
        if (!calcExpr.trim()) return;
        const clean = calcExpr.replace(/[^0-9+\-*/().]/g, '');
        // Safe calculation of basic math
        const res = new Function(`return ${clean}`)();
        const formatted = Number(res).toLocaleString('vi-VN', { maximumFractionDigits: 4 });
        setCalcDisplay(formatted);
        setCalcExpr(String(res));
      } catch {
        setCalcDisplay('Lỗi');
        setCalcExpr('');
      }
    } else {
      const next = calcExpr + val;
      setCalcExpr(next);
      setCalcDisplay(next);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Navigation Links Definition
  const navLinks = [
    { href: '/', label: 'Trang Chủ', icon: Home, exact: true },
    { href: '/edu/', label: 'EduND', icon: GraduationCap },
    { href: 'https://dnaai-site.vercel.app', label: 'HeartSpace', icon: Heart, external: true }
  ];

  const isAdmin = currentUser?.role === 'admin' || currentUser?.adminLevel === 'owner';

  return (
    <>
      <header 
        data-nd-react-navbar="true"
        className="sticky top-0 z-[100000] w-full h-[52px] bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,112,243,0.05)] font-sans transition-all"
      >
        <div className="max-w-[1600px] h-full mx-auto px-4 flex items-center justify-between gap-2">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="flex items-center gap-2.5 text-blue-600 font-extrabold text-base tracking-tight hover:opacity-90 transition-opacity"
            >
              <img 
                src="/assets/images/logo.png" 
                alt="ND Labs" 
                className="w-7 h-7 rounded-lg object-cover shadow-sm ring-1 ring-blue-500/20" 
              />
              <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                ND Labs
              </span>
            </a>

            {/* Subtle Divider */}
            <div className="hidden md:block w-px h-5 bg-slate-200 mx-1"></div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.exact 
                  ? currentPath === '/' || currentPath === '/index.html'
                  : currentPath.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm shadow-blue-500/25' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                    <span>{link.label}</span>
                    {link.external && <ExternalLink size={10} className="opacity-70 ml-0.5" />}
                  </a>
                );
              })}

              {/* Admin Special Link */}
              {isAdmin && (
                <a
                  href="/admin/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-all ml-1 shadow-sm"
                  title="Hệ thống Quản trị Admin"
                >
                  <ShieldCheck size={14} className="text-amber-600" />
                  <span>Quản trị</span>
                </a>
              )}
            </nav>
          </div>

          {/* Right Section: Tools, Notifications, Auth */}
          <div className="flex items-center gap-2">
            
            {/* Quick Tools Button */}
            <button
              type="button"
              onClick={() => setToolsOpen(prev => !prev)}
              title="Công cụ tiện ích"
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                toolsOpen 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                  : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              <QrCode size={16} />
              <span className="hidden lg:inline text-[11px]">Tiện ích</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(prev => !prev);
                  if (hasUnread) handleMarkAllRead();
                }}
                title="Thông báo"
                className="relative p-2 rounded-xl bg-white/80 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-all"
              >
                <Bell size={16} />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Modal / Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-[340px] sm:w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-[100010] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-blue-600" />
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Thông báo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Đã đọc
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-medium">
                        Chưa có thông báo mới nào
                      </div>
                    ) : (
                      notifications.map((item, idx) => {
                        const targetBadge = !item.target || item.target.type === 'all' || !item.target.type ? (
                          <span className="text-[9px] font-extrabold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Toàn hệ thống</span>
                        ) : item.target.type === 'group' ? (
                          <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Nhóm</span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Cá nhân</span>
                        );

                        return (
                          <div 
                            key={item.id || idx} 
                            onClick={() => {
                              setSelectedNotif(item);
                              setNotificationsOpen(false);
                            }}
                            className="p-3.5 hover:bg-slate-50/90 transition-colors flex gap-2.5 text-left cursor-pointer items-start"
                          >
                            <div 
                              className="w-1 self-stretch rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color || '#0070f3' }} 
                            />
                            <div className="flex-1 min-w-0">
                              {/* Sender & Target */}
                              <div className="flex items-center justify-between gap-1.5 mb-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  {item.sender?.type === 'admin' || item.sender?.adminNdid ? (
                                    <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                      🛡️ {item.sender.adminNdid || item.sender.name || 'Admin'}
                                    </span>
                                  ) : item.sender?.name ? (
                                    <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                      👤 {item.sender.name}
                                    </span>
                                  ) : null}
                                </div>
                                {targetBadge}
                              </div>

                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span 
                                  className="text-xs font-bold truncate"
                                  style={{ color: item.textColor || '#0f172a' }}
                                >
                                  {item.title || 'Thông báo mới'}
                                </span>
                                {item.time && (
                                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                                    {item.time}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed whitespace-normal break-words">
                                {item.info || item.content || ''}
                              </p>
                              {item.date && (
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  📅 {item.date}
                                </span>
                              )}
                            </div>
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt="Thumb" 
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" 
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Account Profile */}
            {currentUser ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/90 border border-slate-200/90 hover:border-blue-400 shadow-sm transition-all"
                >
                  <img
                    src={currentUser.photoURL || '/assets/images/logo.png'}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-blue-500/30"
                  />
                  <div className="flex items-center gap-1.5 text-left">
                    {/* RULE #2 & RULE #3: RAW STRING NDID, NO PREPENDED '@' */}
                    <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate">
                      {currentUser.ndid || currentUser.displayName || 'Thành viên'}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isAdmin 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                        : currentUser.eduRole === 'teacher'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {isAdmin ? 'Admin' : (currentUser.eduRole === 'teacher' ? 'GV' : 'HS')}
                    </span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </div>
                </button>

                {/* Account Popover */}
                {accountMenuOpen && (
                  <div className="absolute right-0 top-12 w-[300px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100010] animate-in fade-in zoom-in-95 duration-150 p-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Tài khoản ({accountsList.length || 1}/10)
                      </span>
                      <button 
                        onClick={() => setAccountMenuOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Accounts Switcher List */}
                    <div className="max-h-[180px] overflow-y-auto space-y-1.5 mb-2">
                      {(accountsList.length > 0 ? accountsList : [currentUser]).map((acc, idx) => {
                        const isCurrent = idx === activeAccountIdx;
                        const targetUrl = idx === 0 ? window.location.pathname : `${window.location.pathname}?u=${idx}`;

                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                              isCurrent 
                                ? 'bg-blue-50/70 border-blue-200' 
                                : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={acc.photoURL || '/assets/images/logo.png'}
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 truncate">
                                  {acc.displayName || acc.fullname || 'ND Member'}
                                </div>
                                {/* RAW STRING NDID */}
                                <div className="text-[10px] text-slate-500 font-mono truncate">
                                  {acc.ndid || '—'}
                                </div>
                              </div>
                            </div>

                            {isCurrent ? (
                              <span className="text-[9px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Đang dùng
                              </span>
                            ) : (
                              <a
                                href={targetUrl}
                                className="text-[10px] font-bold text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 px-2 py-1 rounded-lg"
                              >
                                Chuyển
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      {isAdmin && (
                        <a
                          href="/admin/"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all border border-amber-200"
                        >
                          <ShieldCheck size={14} className="text-amber-600" />
                          <span>Hệ thống Quản trị</span>
                        </a>
                      )}
                      {accountsList.length < 10 && (
                        <a
                          href="/auth/login/?addAccount=true"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/60 hover:bg-blue-100/70 transition-all border border-blue-200/50"
                        >
                          <UserPlus size={14} />
                          <span>Thêm tài khoản khác</span>
                        </a>
                      )}
                      <a
                        href="/auth/settings/"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                      >
                        <Settings size={14} />
                        <span>Cài đặt tài khoản</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleLogoutCurrent}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất tài khoản này</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogoutAll}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all text-left"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất tất cả</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <a
                  href="/auth/login/"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all"
                >
                  Đăng nhập
                </a>
                <a
                  href="/auth/register/"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:opacity-95 shadow-sm shadow-blue-500/25 transition-all"
                >
                  NDID
                </a>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-xl px-4 py-3 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = link.exact 
                ? currentPath === '/' || currentPath === '/index.html'
                : currentPath.startsWith(link.href);
              const Icon = link.icon;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </div>
                  {link.external && <ExternalLink size={12} className="opacity-70" />}
                </a>
              );
            })}

            {isAdmin && (
              <a
                href="/admin/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200"
              >
                <ShieldCheck size={16} />
                <span>Hệ thống Quản trị</span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Floating Quick Tools Modal */}
      {toolsOpen && (
        <div className="fixed top-16 right-4 sm:right-8 w-[320px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 z-[100015] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveToolTab('qr')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                activeToolTab === 'qr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode size={13} />
              <span>Mã QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab('calc')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                activeToolTab === 'calc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator size={13} />
              <span>Máy tính</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab('timer')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                activeToolTab === 'timer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Timer size={13} />
              <span>Đồng hồ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab('notes')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                activeToolTab === 'notes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={13} />
              <span>Ghi chú</span>
            </button>
            <button
              type="button"
              onClick={() => setToolsOpen(false)}
              className="px-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {/* Tab: QR Code */}
            {activeToolTab === 'qr' && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <button
                  type="button"
                  onClick={copyPageUrl}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedUrl ? 'Đã sao chép link!' : 'Sao chép link trang'}</span>
                </button>
              </div>
            )}

            {/* Tab: Calculator */}
            {activeToolTab === 'calc' && (
              <div className="space-y-2">
                <div className="bg-slate-100 rounded-xl p-2.5 text-right font-mono text-base font-bold text-slate-800 min-h-[38px] truncate">
                  {calcDisplay}
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                  {['C', '(', ')', '/'].map(btn => (
                    <button key={btn} onClick={() => handleCalcClick(btn)} className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100">{btn}</button>
                  ))}
                  {['7', '8', '9', '*'].map(btn => (
                    <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded-lg ${btn === '*' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{btn === '*' ? '×' : btn}</button>
                  ))}
                  {['4', '5', '6', '-'].map(btn => (
                    <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded-lg ${btn === '-' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{btn}</button>
                  ))}
                  {['1', '2', '3', '+'].map(btn => (
                    <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded-lg ${btn === '+' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{btn}</button>
                  ))}
                  <button onClick={() => handleCalcClick('0')} className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">0</button>
                  <button onClick={() => handleCalcClick('.')} className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">.</button>
                  <button onClick={() => handleCalcClick('back')} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">⌫</button>
                  <button onClick={() => handleCalcClick('=')} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">=</button>
                </div>
              </div>
            )}

            {/* Tab: Pomodoro Timer */}
            {activeToolTab === 'timer' && (
              <div className="flex flex-col items-center gap-3 py-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Đồng hồ Pomodoro</span>
                <div className="text-3xl font-extrabold font-mono text-slate-800 tracking-tight">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                  >
                    {timerRunning ? 'Tạm dừng' : 'Bắt đầu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(25 * 60);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Quick Notes */}
            {activeToolTab === 'notes' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Ghi chú cá nhân</span>
                <textarea
                  value={quickNote}
                  onChange={(e) => {
                    setQuickNote(e.target.value);
                    localStorage.setItem('nd_quick_notes', e.target.value);
                  }}
                  placeholder="Ghi chú nhanh ở đây... (Tự động lưu)"
                  className="w-full h-28 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div 
          onClick={() => setSelectedNotif(null)}
          className="fixed inset-0 z-[100020] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 text-left animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-400">
                  📅 {selectedNotif.date || 'Hôm nay'} {selectedNotif.time || ''}
                </span>
                {!selectedNotif.target || selectedNotif.target.type === 'all' || !selectedNotif.target.type ? (
                  <span className="text-[10px] font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">Toàn hệ thống</span>
                ) : selectedNotif.target.type === 'group' ? (
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Nhóm: {selectedNotif.target.groupRole}</span>
                ) : (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Cá nhân</span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Sender */}
            {selectedNotif.sender && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {selectedNotif.sender.type === 'admin' || selectedNotif.sender.adminNdid ? (
                  <span className="font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border border-amber-200">
                    🛡️ {selectedNotif.sender.adminNdid || selectedNotif.sender.name || 'Quản trị viên'}
                  </span>
                ) : selectedNotif.sender.name ? (
                  <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border border-slate-200">
                    👤 {selectedNotif.sender.name}
                  </span>
                ) : null}

                {selectedNotif.sender.collaborators && selectedNotif.sender.collaborators.length > 0 && (
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    cùng {selectedNotif.sender.collaborators.map((c, i) => (
                      <span key={i} className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {c}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 
              className="text-lg font-extrabold leading-snug"
              style={{ color: selectedNotif.textColor || '#0f172a' }}
            >
              {selectedNotif.title}
            </h3>

            {/* Attached Image */}
            {selectedNotif.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-60 flex items-center justify-center">
                <img 
                  src={selectedNotif.image} 
                  alt="Banner" 
                  className="w-full max-h-60 object-contain"
                />
              </div>
            )}

            {/* Content Body */}
            <div 
              className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: formatRichNotification(selectedNotif.content || selectedNotif.info) }}
            />

            {/* Action Link Button */}
            {selectedNotif.link && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <a
                  href={selectedNotif.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>{selectedNotif.linkText || 'Mở liên kết'}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
