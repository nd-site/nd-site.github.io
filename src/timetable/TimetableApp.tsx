import React, { useState, useEffect, useRef } from 'react';
import { AITimetableModal } from './AITimetableModal';
import { AITimetableExtractionResult } from './aiTimetableService';

// Interfaces for Timetable Structure
export interface SlotItem {
  subject: string; // Tên môn
  teacher: string; // Tên giáo viên
}

export interface BreakTime {
  id: string;
  name: string; // Custom break name
  period: 'morning' | 'afternoon';
  afterSlot: number;
  startTime?: string;
  endTime?: string;
}

export interface ExtraClassItem {
  id: string;
  text: string;
}

export interface DayColumnData {
  note: string; // Ghi chú ngày
  extraClasses: ExtraClassItem[]; // Lịch học thêm
}

export type TimetableRole = 'owner' | 'edit' | 'comment' | 'view' | 'none';

export interface Collaborator {
  ndid: string;
  uid?: string;
  name?: string;
  photoURL?: string;
  role: 'view' | 'comment' | 'edit';
  addedAt?: string;
}

export interface TimetableComment {
  id: string;
  uid: string;
  ndid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}

export interface PresenceUser {
  sessionId: string;
  uid: string;
  ndid: string;
  name: string;
  photoURL: string;
  role: string;
  lastActive: number;
}

export interface TimetableData {
  id: string; // [ma-tkb] Custom ID
  title: string; // Tên TKB
  school: string; // Trường
  gradeClass: string; // Lớp
  schoolYear: string; // Năm học
  startWeek: number | string; // Tuần bắt đầu
  endWeek: number | string; // Tuần kết thúc
  startDate: string; // Ngày bắt đầu
  endDate: string; // Ngày kết thúc
  morningSlotsCount: number; // Số tiết sáng
  afternoonSlotsCount: number; // Số tiết chiều
  slotTimes: Record<string, { startTime: string; endTime: string }>;
  breakTimes: BreakTime[];
  grid: Record<string, SlotItem>; // Key: `${dayIndex}-${period}-${slotNum}`
  dayData: Record<number, DayColumnData>; // Day index 0..6
  
  // User ownership and sharing
  ownerUid?: string;
  ownerNdid?: string;
  ownerName?: string;
  ownerPhotoURL?: string;
  isPublic?: boolean;
  collaborators?: Collaborator[];
  sharedNdids?: string[];
  
  updatedAt?: any;
  createdAt?: any;
}

export interface CurrentUser {
  uid: string;
  ndid: string;
  displayName: string;
  photoURL: string;
  role?: string;
  eduRole?: string;
}

const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật'
];

const DEFAULT_MORNING_TIMES: Record<number, { startTime: string; endTime: string }> = {
  1: { startTime: '07:15', endTime: '08:00' },
  2: { startTime: '08:05', endTime: '08:50' },
  3: { startTime: '09:05', endTime: '09:50' },
  4: { startTime: '09:55', endTime: '10:40' },
  5: { startTime: '10:45', endTime: '11:30' },
};

const DEFAULT_AFTERNOON_TIMES: Record<number, { startTime: string; endTime: string }> = {
  1: { startTime: '13:30', endTime: '14:15' },
  2: { startTime: '14:20', endTime: '15:05' },
  3: { startTime: '15:20', endTime: '16:05' },
  4: { startTime: '16:10', endTime: '16:55' },
  5: { startTime: '17:00', endTime: '17:45' },
};

const normalizeNdid = (s?: string) => (s || '').replace(/^@+/, '').trim().toLowerCase();

const getLocalUser = (): CurrentUser | null => {
  // 1. Kiểm tra hệ thống đa tài khoản NDAccounts nếu có
  try {
    if (typeof window !== 'undefined' && (window as any).NDAccounts) {
      const active = (window as any).NDAccounts.getActiveAccount();
      if (active && (active.uid || active.ndid)) {
        return {
          uid: active.uid || '',
          ndid: (active.ndid || '').trim(),
          displayName: active.displayName || active.fullname || active.ndid || 'Người dùng',
          photoURL: active.photoURL || '/assets/images/logo.png',
          role: active.role,
          eduRole: active.eduRole
        };
      }
    }
  } catch (_) {}

  // 2. Kiểm tra mảng nd_accounts và chỉ mục tài khoản active (?u=... hoặc nd_active_index)
  try {
    const rawAccounts = localStorage.getItem('nd_accounts');
    if (rawAccounts) {
      const list = JSON.parse(rawAccounts);
      if (Array.isArray(list) && list.length > 0) {
        let idx = 0;
        try {
          const params = new URLSearchParams(window.location.search);
          const uParam = params.get('u');
          if (uParam !== null && !isNaN(parseInt(uParam, 10))) {
            idx = parseInt(uParam, 10);
          } else {
            const storedIdx = localStorage.getItem('nd_active_index');
            if (storedIdx !== null && !isNaN(parseInt(storedIdx, 10))) {
              idx = parseInt(storedIdx, 10);
            }
          }
        } catch (_) {}
        const u = list[idx] || list[0];
        if (u && (u.uid || u.ndid)) {
          return {
            uid: u.uid || '',
            ndid: (u.ndid || '').trim(),
            displayName: u.displayName || u.fullname || u.ndid || 'Người dùng',
            photoURL: u.photoURL || '/assets/images/logo.png',
            role: u.role,
            eduRole: u.eduRole
          };
        }
      }
    }
  } catch (_) {}

  // 3. Fallback tài khoản đơn lẻ nd_user
  try {
    const raw = localStorage.getItem('nd_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.uid || u.ndid)) {
        return {
          uid: u.uid || '',
          ndid: (u.ndid || '').trim(),
          displayName: u.displayName || u.fullname || u.ndid || 'Người dùng',
          photoURL: u.photoURL || '/assets/images/logo.png',
          role: u.role,
          eduRole: u.eduRole
        };
      }
    }
  } catch (_) {}
  return null;
};

const createEmptyTimetable = (id: string, title = '', user?: CurrentUser | null): TimetableData => {
  const slotTimes: Record<string, { startTime: string; endTime: string }> = {};
  for (let i = 1; i <= 5; i++) {
    slotTimes[`morning-${i}`] = { ...DEFAULT_MORNING_TIMES[i] };
    slotTimes[`afternoon-${i}`] = { ...DEFAULT_AFTERNOON_TIMES[i] };
  }

  const dayData: Record<number, DayColumnData> = {};
  for (let d = 0; d < 7; d++) {
    dayData[d] = { note: '', extraClasses: [] };
  }

  return {
    id: id.trim(),
    title: title || `Thời khóa biểu ${id.trim()}`,
    school: '',
    gradeClass: '',
    schoolYear: '2026-2027',
    startWeek: 1,
    endWeek: 1,
    startDate: '',
    endDate: '',
    morningSlotsCount: 5,
    afternoonSlotsCount: 5,
    slotTimes,
    breakTimes: [
      { id: 'b1', name: 'Ra chơi sáng', period: 'morning', afterSlot: 2, startTime: '08:50', endTime: '09:05' },
      { id: 'b2', name: 'Ra chơi chiều', period: 'afternoon', afterSlot: 2, startTime: '15:05', endTime: '15:20' }
    ],
    grid: {},
    dayData,
    ownerUid: user?.uid || '',
    ownerNdid: user?.ndid || '',
    ownerName: user?.displayName || user?.ndid || 'Ẩn danh',
    ownerPhotoURL: user?.photoURL || '',
    isPublic: false,
    collaborators: [],
    sharedNdids: []
  };
};

// Strict access control: No admin backdoors; private means strictly private
const getEffectiveRole = (tt: TimetableData | null, user: CurrentUser | null): TimetableRole => {
  if (!tt) return 'none';

  // Nếu TKB chưa có thông tin chủ sở hữu và người dùng đã đăng nhập -> Cấp quyền chủ sở hữu
  if (!tt.ownerUid && !tt.ownerNdid && user) {
    return 'owner';
  }

  // 1. Kiểm tra xem người dùng có phải là Chủ sở hữu (Owner)
  // Khớp theo UID hoặc NDID (hỗ trợ cả dạng thô và chuẩn hóa không có dấu @)
  const isOwner = Boolean(
    user && (
      (tt.ownerUid && user.uid && tt.ownerUid === user.uid) ||
      (tt.ownerNdid && user.ndid && (
        tt.ownerNdid.toLowerCase() === user.ndid.toLowerCase() ||
        normalizeNdid(tt.ownerNdid) === normalizeNdid(user.ndid)
      ))
    )
  );

  if (isOwner) return 'owner';

  // 2. Kiểm tra danh sách người được chia sẻ (collaborators)
  if (user && tt.collaborators && tt.collaborators.length > 0) {
    const matched = tt.collaborators.find((c) => {
      if (c.uid && user.uid && c.uid === user.uid) return true;
      if (c.ndid && user.ndid && (
        c.ndid.toLowerCase() === user.ndid.toLowerCase() ||
        normalizeNdid(c.ndid) === normalizeNdid(user.ndid)
      )) return true;
      return false;
    });
    if (matched) return matched.role;
  }

  // 3. Nếu là công khai (public) -> Cho phép quyền Đọc (view)
  if (tt.isPublic === true) {
    return 'view';
  }

  // 4. Nếu riêng tư và không được phân quyền -> Chặn truy cập
  return 'none';
};

const formatCommentTime = (ts: any): string => {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch (_) {
    return '';
  }
};

const CACHE_KEY = 'nd_eduspace_timetables_cache';

const getCachedTimetables = (): TimetableData[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
};

const saveCachedTimetables = (items: TimetableData[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch (_) {}
};

// Robust URL ID resolver supporting any path prefix, query, or hash
const resolveActiveIdFromUrl = (): string | null => {
  try {
    const rawPath = window.location.pathname.replace(/\/index\.html$/, '');
    const segments = rawPath.split('/').filter(Boolean);
    const ttIndex = segments.findIndex((s) => {
      const lower = s.toLowerCase();
      return lower === 'timetable' || lower === 'timtable';
    });

    if (ttIndex !== -1 && segments.length > ttIndex + 1) {
      const candidate = decodeURIComponent(segments[ttIndex + 1]).trim();
      if (candidate && candidate !== 'index.html') {
        return candidate;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id') || params.get('ma-tkb') || params.get('tkb');
    if (queryId && queryId.trim()) return queryId.trim();

    if (window.location.hash) {
      const hashVal = window.location.hash.replace(/^#[/?]*/, '').trim();
      if (hashVal && hashVal !== 'index.html') return hashVal;
    }
  } catch (_) {}
  return null;
};

export const TimetableApp: React.FC = () => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getLocalUser());

  // Navigation & Route state
  const [activeId, setActiveId] = useState<string | null>(() => resolveActiveIdFromUrl());
  const [timetables, setTimetables] = useState<TimetableData[]>(() => getCachedTimetables());
  const [currentTimetable, setCurrentTimetable] = useState<TimetableData | null>(null);

  // Main page tab state
  const [activeTab, setActiveTab] = useState<'public' | 'mine' | 'shared'>('public');

  // Existence check states
  const [isCheckingExist, setIsCheckingExist] = useState<boolean>(() => {
    const initId = resolveActiveIdFromUrl();
    if (!initId) return false;
    const existsLocally = getCachedTimetables().some((t) => t.id === initId);
    return !existsLocally;
  });
  const [notFound, setNotFound] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Form states for creating a new timetable
  const [newCustomId, setNewCustomId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Schedule config states
  const [newBreakName, setNewBreakName] = useState('');
  const [newBreakPeriod, setNewBreakPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [newBreakAfterSlot, setNewBreakAfterSlot] = useState<number>(2);

  // Drag and Drop state
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Realtime Presence & Collaborative editing states
  const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`).current;
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const activeFocusedKeyRef = useRef<string | null>(null);
  const debounceSyncTimerRef = useRef<any>(null);

  // Share Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [collabNdidInput, setCollabNdidInput] = useState('');
  const [collabRoleInput, setCollabRoleInput] = useState<'view' | 'comment' | 'edit'>('view');
  const [collabError, setCollabError] = useState('');
  const [isAddingCollab, setIsAddingCollab] = useState(false);

  // AI Modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Change Timetable ID Modal states
  const [isChangeIdModalOpen, setIsChangeIdModalOpen] = useState(false);
  const [newTimetableIdInput, setNewTimetableIdInput] = useState('');
  const [changeIdError, setChangeIdError] = useState<string | null>(null);
  const [isChangingId, setIsChangingId] = useState(false);

  // Comments states
  const [comments, setComments] = useState<TimetableComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const navigateTo = (id: string | null) => {
    setActiveId(id);
    if (id) {
      const targetUrl = `/eduspace/timetable/${encodeURIComponent(id)}`;
      window.history.pushState(null, '', targetUrl);
    } else {
      setNotFound(false);
      setIsCheckingExist(false);
      setCurrentTimetable(null);
      window.history.pushState(null, '', '/eduspace/timetable');
    }
  };

  // Browser navigation popstate listener
  useEffect(() => {
    const onPopState = () => {
      const parsedId = resolveActiveIdFromUrl();
      setActiveId(parsedId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Cập nhật tiêu đề cửa sổ: <Tên thời khóa biểu> - TimeTable by ND Labs
  useEffect(() => {
    if (activeId && currentTimetable) {
      const timetableName = currentTimetable.title || currentTimetable.id;
      document.title = `${timetableName} - TimeTable by ND Labs`;
    } else if (activeId) {
      document.title = `${activeId} - TimeTable by ND Labs`;
    } else {
      document.title = 'TimeTable by ND Labs';
    }
  }, [activeId, currentTimetable?.title, currentTimetable?.id]);

  // Monitor user authentication
  useEffect(() => {
    const syncUser = () => {
      const u = getLocalUser();
      if (u) setCurrentUser(u);
    };

    window.addEventListener('storage', syncUser);

    const setupAuthListener = async () => {
      let auth = (window as any).firebaseAuth;
      if (!auth) {
        window.addEventListener('firebase-ready', async () => {
          auth = (window as any).firebaseAuth;
          if (auth) attachAuthListener(auth);
        }, { once: true });
      } else {
        attachAuthListener(auth);
      }
    };

    const attachAuthListener = async (auth: any) => {
      try {
        const { onAuthStateChanged } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js' as any
        );
        onAuthStateChanged(auth, (user: any) => {
          if (user) {
            const local = getLocalUser();
            if (local) {
              setCurrentUser(local);
            } else {
              setCurrentUser({
                uid: user.uid,
                ndid: user.displayName || user.email?.split('@')[0] || 'ND User',
                displayName: user.displayName || 'ND User',
                photoURL: user.photoURL || '/assets/images/logo.png'
              });
            }
          } else {
            setCurrentUser(getLocalUser());
          }
        });
      } catch (err) {
        console.warn("Auth listener warning:", err);
      }
    };

    setupAuthListener();
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // Helper to get Firestore DB
  const getFirestoreDb = async () => {
    let db = (window as any).firebaseFirestore;
    if (db) return db;
    return new Promise((resolve) => {
      const handler = () => resolve((window as any).firebaseFirestore || null);
      window.addEventListener('firebase-ready', handler, { once: true });
      setTimeout(() => resolve((window as any).firebaseFirestore || null), 2000);
    });
  };

  // Helper to write to Firestore
  const syncDocToFirestore = async (item: TimetableData): Promise<boolean> => {
    try {
      const db: any = await getFirestoreDb();
      if (!db) return false;
      const { doc, setDoc, serverTimestamp } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
      );
      await setDoc(
        doc(db, 'timetables', item.id),
        {
          ...item,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn("Lỗi đồng bộ Firestore:", err);
      return false;
    }
  };

  // Helper to delete from Firestore
  const deleteDocFromFirestore = async (id: string) => {
    try {
      const db: any = await getFirestoreDb();
      if (!db) return;
      const { doc, deleteDoc } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
      );
      await deleteDoc(doc(db, 'timetables', id));
    } catch (err) {
      console.warn("Lỗi xóa Firestore:", err);
    }
  };

  // Firebase Realtime Connection for Timetables List
  useEffect(() => {
    let unsubscribeList: (() => void) | null = null;

    const setupFirebase = async () => {
      const db: any = await getFirestoreDb();
      if (!db) return;

      try {
        const { collection, onSnapshot } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );

        const colRef = collection(db, 'timetables');
        unsubscribeList = onSnapshot(
          colRef,
          (snapshot: any) => {
            const remoteMap = new Map<string, TimetableData>();
            snapshot.forEach((docSnap: any) => {
              const data = docSnap.data();
              remoteMap.set(docSnap.id, {
                ...createEmptyTimetable(docSnap.id),
                ...data,
                id: docSnap.id
              });
            });

            // Merge with local cached data
            const localCached = getCachedTimetables();
            localCached.forEach((item) => {
              if (!remoteMap.has(item.id)) {
                remoteMap.set(item.id, item);
              }
            });

            const merged = Array.from(remoteMap.values());
            setTimetables(merged);
            saveCachedTimetables(merged);
            setLoading(false);
          },
          (err: any) => {
            console.warn("Firestore list listener warning:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Firebase init error:", err);
        setLoading(false);
      }
    };

    setupFirebase();

    return () => {
      if (unsubscribeList) unsubscribeList();
    };
  }, []);

  // Check existence and sync for Active Timetable Document
  useEffect(() => {
    if (!activeId) {
      setCurrentTimetable(null);
      setNotFound(false);
      setIsCheckingExist(false);
      return;
    }

    // First check local memory and cache
    const inMemory = timetables.find((t) => t.id === activeId);
    if (inMemory) {
      setCurrentTimetable(inMemory);
      setNotFound(false);
      setIsCheckingExist(false);
    } else {
      const cached = getCachedTimetables().find((t) => t.id === activeId);
      if (cached) {
        setCurrentTimetable(cached);
        setNotFound(false);
        setIsCheckingExist(false);
      } else {
        setIsCheckingExist(true);
      }
    }

    let unsubscribeDoc: (() => void) | null = null;

    const verifyAndListenDoc = async () => {
      const db: any = await getFirestoreDb();
      if (!db) {
        const inLocal = getCachedTimetables().some((t) => t.id === activeId);
        if (!inLocal) {
          setNotFound(true);
        }
        setIsCheckingExist(false);
        return;
      }

      try {
        const { doc, onSnapshot } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );

        const docRef = doc(db, 'timetables', activeId);
        unsubscribeDoc = onSnapshot(
          docRef,
          (docSnap: any) => {
            setIsCheckingExist(false);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const loaded: TimetableData = {
                ...createEmptyTimetable(docSnap.id),
                ...data,
                id: docSnap.id
              };

              // Nếu TKB chưa có chủ sở hữu và người dùng đang đăng nhập -> gán quyền sở hữu và đồng bộ Firestore
              if ((!loaded.ownerUid && !loaded.ownerNdid) && currentUser) {
                loaded.ownerUid = currentUser.uid;
                loaded.ownerNdid = currentUser.ndid;
                loaded.ownerName = currentUser.displayName;
                loaded.ownerPhotoURL = currentUser.photoURL;
                syncDocToFirestore(loaded);
              }

              // Realtime collaboration merge: if user is typing in a slot, preserve their active input
              setCurrentTimetable((prev) => {
                if (!prev) return loaded;
                const focusedKey = activeFocusedKeyRef.current;
                if (focusedKey && prev.grid?.[focusedKey]) {
                  return {
                    ...loaded,
                    grid: {
                      ...loaded.grid,
                      [focusedKey]: prev.grid[focusedKey]
                    }
                  };
                }
                return loaded;
              });

              setNotFound(false);

              setTimetables((prev) => {
                const updated = [loaded, ...prev.filter((t) => t.id !== loaded.id)];
                saveCachedTimetables(updated);
                return updated;
              });
            } else {
              const inMem = getCachedTimetables().find((t) => t.id === activeId);
              if (inMem) {
                setCurrentTimetable(inMem);
                setNotFound(false);
              } else {
                setCurrentTimetable(null);
                setNotFound(true);
              }
            }
          },
          (err: any) => {
            console.warn("Error verifying timetable:", err);
            setIsCheckingExist(false);
            const inMem = getCachedTimetables().find((t) => t.id === activeId);
            if (!inMem) {
              setNotFound(true);
            }
          }
        );
      } catch (e) {
        console.warn("Firestore verify exception:", e);
        setIsCheckingExist(false);
        const inMem = getCachedTimetables().find((t) => t.id === activeId);
        if (!inMem) {
          setNotFound(true);
        }
      }
    };

    verifyAndListenDoc();

    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [activeId]);

  // Realtime Presence Tracker for Active Timetable
  useEffect(() => {
    // Chỉ kích hoạt presence khi đang ở trang chi tiết TKB, TKB đã tải xong và người dùng có quyền truy cập hợp lệ (khác 'none')
    const effectiveRole = getEffectiveRole(currentTimetable, currentUser);

    if (!activeId || !currentTimetable || effectiveRole === 'none') {
      setOnlineUsers([]);
      // Nếu có document presence đã tạo trên session này, xóa ngay lập tức
      const cleanupStaleDoc = async () => {
        try {
          const db: any = await getFirestoreDb();
          if (db && activeId) {
            const { doc, deleteDoc } = await import(
              'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
            );
            await deleteDoc(doc(db, 'timetables', activeId, 'presence', sessionId));
          }
        } catch (_) {}
      };
      cleanupStaleDoc();
      return;
    }

    let unsubscribePresence: (() => void) | null = null;
    let heartbeatInterval: any = null;
    let localSweepInterval: any = null;

    const setupPresence = async () => {
      const db: any = await getFirestoreDb();
      if (!db) return;

      try {
        const { doc, setDoc, deleteDoc, collection, onSnapshot, getDocs } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );

        const presenceRef = doc(db, 'timetables', activeId, 'presence', sessionId);

        const writePresence = async () => {
          try {
            await setDoc(
              presenceRef,
              {
                sessionId,
                uid: currentUser?.uid || '',
                ndid: currentUser?.ndid || 'Khách',
                name: currentUser?.displayName || currentUser?.ndid || 'Khách',
                photoURL: currentUser?.photoURL || '',
                role: effectiveRole,
                lastActive: Date.now()
              },
              { merge: true }
            );

            // Dọn dẹp các tài liệu presence đã hết hạn trên Firestore (> 25s)
            const snap = await getDocs(collection(db, 'timetables', activeId, 'presence'));
            const now = Date.now();
            snap.forEach((d: any) => {
              const data = d.data();
              if (data && (now - (data.lastActive || 0) > 25000 || data.role === 'none')) {
                deleteDoc(d.ref).catch(() => {});
              }
            });
          } catch (_) {}
        };

        await writePresence();
        // Nhịp tim 5 giây gửi một lần
        heartbeatInterval = setInterval(writePresence, 5000);

        const colRef = collection(db, 'timetables', activeId, 'presence');
        unsubscribePresence = onSnapshot(colRef, (snap: any) => {
          const now = Date.now();
          const activeList: PresenceUser[] = [];
          const seenSessions = new Set<string>();

          snap.forEach((d: any) => {
            const data = d.data() as PresenceUser;
            // Chỉ ghi nhận người có role hợp lệ (không phải 'none') và lastActive trong vòng 15 giây
            if (data && data.role && data.role !== 'none' && now - (data.lastActive || 0) < 15000) {
              if (!seenSessions.has(data.sessionId)) {
                seenSessions.add(data.sessionId);
                activeList.push(data);
              }
            }
          });

          setOnlineUsers(activeList);
        });

        // Quét cục bộ mỗi 2 giây để tự động loại bỏ người dùng đã offline mà không chờ snapshot mới
        localSweepInterval = setInterval(() => {
          const now = Date.now();
          setOnlineUsers((prev) =>
            prev.filter((u) => u.role && u.role !== 'none' && now - (u.lastActive || 0) < 15000)
          );
        }, 2000);

        // Xóa presence khi rời trang / đóng tab
        const handleLeave = () => {
          deleteDoc(presenceRef).catch(() => {});
          try {
            const url = `https://firestore.googleapis.com/v1/projects/ndlabs-0/databases/(default)/documents/timetables/${activeId}/presence/${sessionId}`;
            fetch(url, { method: 'DELETE', keepalive: true }).catch(() => {});
          } catch (_) {}
        };

        window.addEventListener('beforeunload', handleLeave);
        window.addEventListener('pagehide', handleLeave);

        return () => {
          window.removeEventListener('beforeunload', handleLeave);
          window.removeEventListener('pagehide', handleLeave);
          handleLeave();
        };
      } catch (e) {
        console.warn("Presence setup error:", e);
      }
    };

    const cleanupPromise = setupPresence();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (localSweepInterval) clearInterval(localSweepInterval);
      if (unsubscribePresence) unsubscribePresence();
      cleanupPromise.then((clean) => {
        if (clean) clean();
      });
    };
  }, [activeId, currentUser?.uid, currentUser?.ndid, currentTimetable?.id, getEffectiveRole(currentTimetable, currentUser)]);

  // Realtime Comments Listener
  useEffect(() => {
    if (!activeId) {
      setComments([]);
      return;
    }

    let unsubscribeComments: (() => void) | null = null;

    const setupComments = async () => {
      const db: any = await getFirestoreDb();
      if (!db) return;

      try {
        const { collection, onSnapshot, query, orderBy } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );

        const commentsRef = collection(db, 'timetables', activeId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        unsubscribeComments = onSnapshot(
          q,
          (snap: any) => {
            const list: TimetableComment[] = [];
            snap.forEach((d: any) => {
              list.push({
                id: d.id,
                ...d.data()
              });
            });
            setComments(list);
          },
          (err: any) => {
            console.warn("Comments listener warning:", err);
          }
        );
      } catch (e) {
        console.warn("Comments setup exception:", e);
      }
    };

    setupComments();

    return () => {
      if (unsubscribeComments) unsubscribeComments();
    };
  }, [activeId]);

  // Collaborative Realtime Auto-sync Trigger
  const triggerAutoSync = (updated: TimetableData) => {
    // Only auto-sync continuously if multiplayer is active (> 1 user online)
    if (onlineUsers.length > 1) {
      if (debounceSyncTimerRef.current) {
        clearTimeout(debounceSyncTimerRef.current);
      }
      setSyncStatus('Đang đồng bộ trực tiếp...');
      debounceSyncTimerRef.current = setTimeout(async () => {
        const ok = await syncDocToFirestore(updated);
        if (ok) {
          setSyncStatus('Đồng bộ thời gian thực');
          setTimeout(() => setSyncStatus(''), 2000);
        }
      }, 400);
    }
  };

  // Action: Tạo thời khóa biểu (Kèm chống trùng ID & bắt buộc đăng nhập)
  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    const id = newCustomId.trim();

    if (!id) {
      setCreateError('Vui lòng nhập mã TKB');
      return;
    }

    // Check login
    if (!currentUser || !currentUser.uid) {
      alert("Vui lòng đăng nhập tài khoản để tạo thời khóa biểu!");
      window.location.href = '/auth/login/';
      return;
    }

    // Validate ID characters
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      setCreateError("Mã TKB chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_)");
      return;
    }

    // 1. Chống trùng ID trong bộ nhớ cục bộ
    const existsLocally = timetables.some((t) => t.id.toLowerCase() === id.toLowerCase());
    if (existsLocally) {
      setCreateError(`Mã thời khóa biểu "${id}" đã tồn tại! Vui lòng chọn mã khác.`);
      return;
    }

    setIsCreating(true);

    // 2. Chống trùng ID trên Firebase Firestore
    try {
      const db: any = await getFirestoreDb();
      if (db) {
        const { doc, getDoc } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );
        const docSnap = await getDoc(doc(db, 'timetables', id));
        if (docSnap.exists()) {
          setCreateError(`Mã thời khóa biểu "${id}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`);
          setIsCreating(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra trùng ID TKB:", err);
    }

    const newTkb = createEmptyTimetable(id, newTitle.trim(), currentUser);
    newTkb.isPublic = newIsPublic;

    // Save locally
    setTimetables((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      const updated = [newTkb, ...filtered];
      saveCachedTimetables(updated);
      return updated;
    });
    setCurrentTimetable(newTkb);
    setNotFound(false);
    setIsCheckingExist(false);
    setNewCustomId('');
    setNewTitle('');
    setNewIsPublic(false);
    setIsCreating(false);
    navigateTo(id);

    // Save to Firestore
    syncDocToFirestore(newTkb);
  };

  // Action: Xóa TKB
  const handleDeleteTimetable = async (id: string) => {
    const target = timetables.find((t) => t.id === id);
    const role = getEffectiveRole(target || null, currentUser);
    if (role !== 'owner') {
      alert("Bạn không có quyền xóa thời khóa biểu này.");
      return;
    }

    if (!window.confirm(`Xác nhận xóa thời khóa biểu "${id}"?`)) return;

    // Remove from state & cache
    setTimetables((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCachedTimetables(updated);
      return updated;
    });

    if (activeId === id) {
      navigateTo(null);
    }

    // Delete from Firestore
    deleteDocFromFirestore(id);
  };

  // Action: Lưu thay đổi (Thủ công)
  const handleSaveDetail = async () => {
    if (!currentTimetable) return;

    const role = getEffectiveRole(currentTimetable, currentUser);
    if (role !== 'owner' && role !== 'edit') {
      alert("Bạn không có quyền chỉnh sửa thời khóa biểu này.");
      return;
    }

    // Update state & cache
    setTimetables((prev) => {
      const updated = prev.map((t) => (t.id === currentTimetable.id ? currentTimetable : t));
      if (!updated.some((t) => t.id === currentTimetable.id)) {
        updated.unshift(currentTimetable);
      }
      saveCachedTimetables(updated);
      return updated;
    });

    setSyncStatus('Đang lưu...');
    const ok = await syncDocToFirestore(currentTimetable);
    if (ok) {
      setSyncStatus('Đã lưu thành công');
    } else {
      setSyncStatus('Đã lưu cục bộ');
    }
    setTimeout(() => setSyncStatus(''), 2500);
  };

  // Action: Nhân bản sang tuần sau
  const handleCloneNextWeek = async () => {
    if (!currentTimetable) return;

    const role = getEffectiveRole(currentTimetable, currentUser);
    if (role !== 'owner' && role !== 'edit') {
      alert("Bạn không có quyền nhân bản thời khóa biểu này.");
      return;
    }

    const currentStartWeek = Number(currentTimetable.startWeek) || 1;
    const currentEndWeek = Number(currentTimetable.endWeek) || currentStartWeek;
    const nextStartWeek = currentStartWeek + 1;
    const nextEndWeek = currentEndWeek + 1;

    let nextStartDate = '';
    let nextEndDate = '';
    if (currentTimetable.startDate) {
      const d = new Date(currentTimetable.startDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 7);
        nextStartDate = d.toISOString().split('T')[0];
      }
    }
    if (currentTimetable.endDate) {
      const d = new Date(currentTimetable.endDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 7);
        nextEndDate = d.toISOString().split('T')[0];
      }
    }

    let newId = `${currentTimetable.id}_t${nextStartWeek}`;
    if (currentTimetable.id.includes(`_t${currentStartWeek}`)) {
      newId = currentTimetable.id.replace(`_t${currentStartWeek}`, `_t${nextStartWeek}`);
    } else if (currentTimetable.id.includes(`-t${currentStartWeek}`)) {
      newId = currentTimetable.id.replace(`-t${currentStartWeek}`, `-t${nextStartWeek}`);
    }

    const clonedTimetable: TimetableData = {
      ...currentTimetable,
      id: newId,
      title: currentTimetable.title.includes(`Tuần ${currentStartWeek}`)
        ? currentTimetable.title.replace(`Tuần ${currentStartWeek}`, `Tuần ${nextStartWeek}`)
        : `${currentTimetable.title} (Tuần ${nextStartWeek})`,
      startWeek: nextStartWeek,
      endWeek: nextEndWeek,
      startDate: nextStartDate || currentTimetable.startDate,
      endDate: nextEndDate || currentTimetable.endDate,
      grid: JSON.parse(JSON.stringify(currentTimetable.grid || {})),
      dayData: JSON.parse(JSON.stringify(currentTimetable.dayData || {})),
      ownerUid: currentUser?.uid || currentTimetable.ownerUid || '',
      ownerNdid: currentUser?.ndid || currentTimetable.ownerNdid || '',
      ownerName: currentUser?.displayName || currentTimetable.ownerName || 'Ẩn danh',
      ownerPhotoURL: currentUser?.photoURL || currentTimetable.ownerPhotoURL || '',
      collaborators: JSON.parse(JSON.stringify(currentTimetable.collaborators || [])),
      sharedNdids: [...(currentTimetable.sharedNdids || [])]
    };

    setTimetables((prev) => {
      const updated = [clonedTimetable, ...prev.filter((t) => t.id !== newId)];
      saveCachedTimetables(updated);
      return updated;
    });
    setCurrentTimetable(clonedTimetable);
    setNotFound(false);
    setIsCheckingExist(false);
    navigateTo(newId);

    syncDocToFirestore(clonedTimetable);
  };

  // Action: Áp dụng dữ liệu trích xuất từ AI
  const handleApplyAI = (
    aiResult: AITimetableExtractionResult,
    mode: 'overwrite' | 'fillEmpty',
    updateMeta: boolean
  ) => {
    if (!currentTimetable) return;

    const newGrid = mode === 'overwrite' ? {} : { ...(currentTimetable.grid || {}) };

    aiResult.slots.forEach((s) => {
      const key = `${s.dayIndex}-${s.period}-${s.slotNumber}`;
      if (mode === 'overwrite' || !newGrid[key]?.subject) {
        newGrid[key] = {
          subject: s.subject || '',
          teacher: s.teacher || ''
        };
      }
    });

    const updatedDayData = { ...(currentTimetable.dayData || {}) };
    if (aiResult.dayNotes) {
      Object.entries(aiResult.dayNotes).forEach(([dIdxStr, note]) => {
        const dIdx = parseInt(dIdxStr, 10);
        if (!isNaN(dIdx) && dIdx >= 0 && dIdx <= 6 && note) {
          updatedDayData[dIdx] = {
            ...(updatedDayData[dIdx] || { extraClasses: [] }),
            note: mode === 'overwrite' || !updatedDayData[dIdx]?.note ? note : updatedDayData[dIdx].note
          };
        }
      });
    }

    const maxMorningInResult = aiResult.slots
      .filter((s) => s.period === 'morning')
      .reduce((max, s) => Math.max(max, s.slotNumber), 0);
    const maxAfternoonInResult = aiResult.slots
      .filter((s) => s.period === 'afternoon')
      .reduce((max, s) => Math.max(max, s.slotNumber), 0);

    const updated: TimetableData = {
      ...currentTimetable,
      grid: newGrid,
      dayData: updatedDayData,
      morningSlotsCount: updateMeta
        ? (typeof aiResult.morningSlotsCount === 'number'
            ? aiResult.morningSlotsCount
            : (currentTimetable.morningSlotsCount ?? 5))
        : Math.max(currentTimetable.morningSlotsCount ?? 0, maxMorningInResult),
      afternoonSlotsCount: updateMeta
        ? (typeof aiResult.afternoonSlotsCount === 'number'
            ? aiResult.afternoonSlotsCount
            : (currentTimetable.afternoonSlotsCount ?? 0))
        : Math.max(currentTimetable.afternoonSlotsCount ?? 0, maxAfternoonInResult),
      ...(updateMeta
        ? {
            ...(aiResult.title ? { title: aiResult.title } : {}),
            ...(aiResult.school ? { school: aiResult.school } : {}),
            ...(aiResult.gradeClass ? { gradeClass: aiResult.gradeClass } : {}),
            ...(aiResult.schoolYear ? { schoolYear: aiResult.schoolYear } : {}),
            ...(aiResult.startWeek ? { startWeek: aiResult.startWeek } : {}),
            ...(aiResult.endWeek ? { endWeek: aiResult.endWeek } : {})
          }
        : {})
    };

    setCurrentTimetable(updated);
    setTimetables((prev) => {
      const filtered = prev.filter((t) => t.id !== updated.id);
      const merged = [updated, ...filtered];
      saveCachedTimetables(merged);
      return merged;
    });

    triggerAutoSync(updated);
    setSyncStatus('Đã áp dụng dữ liệu AI');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // Action: Đổi mã thời khóa biểu
  const handleChangeTimetableId = async () => {
    if (!currentTimetable) return;
    setChangeIdError(null);

    const cleanNewId = newTimetableIdInput.trim();
    if (!cleanNewId) {
      setChangeIdError('Vui lòng nhập mã thời khóa biểu mới.');
      return;
    }

    if (cleanNewId.length < 2 || cleanNewId.length > 50) {
      setChangeIdError('Độ dài mã thời khóa biểu phải từ 2 đến 50 ký tự.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(cleanNewId)) {
      setChangeIdError('Mã chỉ được chứa chữ cái không dấu (a-z, A-Z), chữ số (0-9), gạch nối (-) hoặc gạch dưới (_).');
      return;
    }

    if (cleanNewId.toLowerCase() === currentTimetable.id.toLowerCase()) {
      setChangeIdError('Mã mới phải khác với mã hiện tại.');
      return;
    }

    if (timetables.some((t) => t.id.toLowerCase() === cleanNewId.toLowerCase())) {
      setChangeIdError(`Mã "${cleanNewId}" đã tồn tại trong danh sách của bạn.`);
      return;
    }

    setIsChangingId(true);

    try {
      const db: any = await getFirestoreDb();
      const oldId = currentTimetable.id;

      if (db) {
        const { doc, getDoc, setDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );

        // 1. Kiểm tra xem mã mới đã tồn tại trên Firestore chưa
        const checkDoc = await getDoc(doc(db, 'timetables', cleanNewId));
        if (checkDoc.exists()) {
          throw new Error(`Mã "${cleanNewId}" đã được sử dụng trên hệ thống. Vui lòng chọn mã khác.`);
        }

        const updatedTimetable: TimetableData = {
          ...currentTimetable,
          id: cleanNewId,
          updatedAt: serverTimestamp()
        };

        // 2. Lưu tài liệu mới
        await setDoc(doc(db, 'timetables', cleanNewId), updatedTimetable);

        // 3. Di chuyển các bình luận sang tài liệu mới (nếu có)
        try {
          const oldCommentsSnap = await getDocs(collection(db, 'timetables', oldId, 'comments'));
          if (!oldCommentsSnap.empty) {
            const batch = writeBatch(db);
            oldCommentsSnap.forEach((cSnap: any) => {
              const newCRef = doc(collection(db, 'timetables', cleanNewId, 'comments'), cSnap.id);
              batch.set(newCRef, cSnap.data());
              batch.delete(cSnap.ref);
            });
            await batch.commit();
          }
        } catch (cErr) {
          console.warn('Lỗi di chuyển bình luận:', cErr);
        }

        // 4. Xóa tài liệu cũ
        try {
          await deleteDoc(doc(db, 'timetables', oldId));
        } catch (delErr) {
          console.warn('Lỗi xóa TKB cũ:', delErr);
        }

        // 5. Cập nhật state & local cache
        setCurrentTimetable(updatedTimetable);
        setTimetables((prev) => {
          const filtered = prev.filter((t) => t.id !== oldId && t.id !== cleanNewId);
          const nextList = [updatedTimetable, ...filtered];
          saveCachedTimetables(nextList);
          return nextList;
        });

        // 6. Cập nhật URL trình duyệt
        navigateTo(cleanNewId);

        setIsChangeIdModalOpen(false);
        setNewTimetableIdInput('');
        setSyncStatus(`Đã đổi mã TKB thành: ${cleanNewId}`);
        setTimeout(() => setSyncStatus(''), 4000);
      } else {
        const updatedTimetable: TimetableData = {
          ...currentTimetable,
          id: cleanNewId
        };
        setCurrentTimetable(updatedTimetable);
        setTimetables((prev) => {
          const filtered = prev.filter((t) => t.id !== oldId && t.id !== cleanNewId);
          const nextList = [updatedTimetable, ...filtered];
          saveCachedTimetables(nextList);
          return nextList;
        });
        navigateTo(cleanNewId);
        setIsChangeIdModalOpen(false);
        setNewTimetableIdInput('');
        setSyncStatus(`Đã đổi mã TKB thành: ${cleanNewId}`);
        setTimeout(() => setSyncStatus(''), 4000);
      }
    } catch (err: any) {
      console.error('Lỗi khi đổi mã TKB:', err);
      setChangeIdError(err.message || 'Không thể đổi mã thời khóa biểu. Vui lòng thử lại.');
    } finally {
      setIsChangingId(false);
    }
  };

  // Schedule Config: Thêm giờ giải lao
  const handleAddBreakTime = () => {
    if (!currentTimetable || !newBreakName.trim()) return;

    const newBreak: BreakTime = {
      id: `break_${Date.now()}`,
      name: newBreakName.trim(),
      period: newBreakPeriod,
      afterSlot: Number(newBreakAfterSlot) || 1
    };

    const updated = {
      ...currentTimetable,
      breakTimes: [...(currentTimetable.breakTimes || []), newBreak]
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
    setNewBreakName('');
  };

  const handleRemoveBreakTime = (breakId: string) => {
    if (!currentTimetable) return;
    const updated = {
      ...currentTimetable,
      breakTimes: (currentTimetable.breakTimes || []).filter((b) => b.id !== breakId)
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, slotKey: string) => {
    setDraggingKey(slotKey);
    e.dataTransfer.setData('text/plain', slotKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKey !== targetKey) {
      setDragOverKey(targetKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverKey(null);
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData('text/plain') || draggingKey;
    setDragOverKey(null);
    setDraggingKey(null);

    if (!sourceKey || !targetKey || sourceKey === targetKey || !currentTimetable) {
      return;
    }

    const currentGrid = { ...(currentTimetable.grid || {}) };
    const sourceItem = currentGrid[sourceKey] || { subject: '', teacher: '' };
    const targetItem = currentGrid[targetKey] || { subject: '', teacher: '' };

    currentGrid[targetKey] = { ...sourceItem };
    currentGrid[sourceKey] = { ...targetItem };

    const updated = {
      ...currentTimetable,
      grid: currentGrid
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  // Slot Item update handler with realtime collaborative sync
  const handleSlotChange = (slotKey: string, field: 'subject' | 'teacher', value: string) => {
    if (!currentTimetable) return;
    const currentGrid = { ...(currentTimetable.grid || {}) };
    const existing = currentGrid[slotKey] || { subject: '', teacher: '' };
    currentGrid[slotKey] = {
      ...existing,
      [field]: value
    };
    const updated = {
      ...currentTimetable,
      grid: currentGrid
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  // Day Column Footer handlers
  const handleDayNoteChange = (dayIndex: number, note: string) => {
    if (!currentTimetable) return;
    const currentDayData = { ...(currentTimetable.dayData || {}) };
    const existing = currentDayData[dayIndex] || { note: '', extraClasses: [] };
    currentDayData[dayIndex] = {
      ...existing,
      note
    };
    const updated = {
      ...currentTimetable,
      dayData: currentDayData
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  // Thêm lịch học thêm
  const handleAddExtraClass = (dayIndex: number) => {
    if (!currentTimetable) return;
    const currentDayData = { ...(currentTimetable.dayData || {}) };
    const existing = currentDayData[dayIndex] || { note: '', extraClasses: [] };
    const newItem: ExtraClassItem = {
      id: `extra_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: ''
    };
    currentDayData[dayIndex] = {
      ...existing,
      extraClasses: [...(existing.extraClasses || []), newItem]
    };
    const updated = {
      ...currentTimetable,
      dayData: currentDayData
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  const handleExtraClassTextChange = (dayIndex: number, itemId: string, text: string) => {
    if (!currentTimetable) return;
    const currentDayData = { ...(currentTimetable.dayData || {}) };
    const existing = currentDayData[dayIndex] || { note: '', extraClasses: [] };
    currentDayData[dayIndex] = {
      ...existing,
      extraClasses: (existing.extraClasses || []).map((item) =>
        item.id === itemId ? { ...item, text } : item
      )
    };
    const updated = {
      ...currentTimetable,
      dayData: currentDayData
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  const handleRemoveExtraClass = (dayIndex: number, itemId: string) => {
    if (!currentTimetable) return;
    const currentDayData = { ...(currentTimetable.dayData || {}) };
    const existing = currentDayData[dayIndex] || { note: '', extraClasses: [] };
    currentDayData[dayIndex] = {
      ...existing,
      extraClasses: (existing.extraClasses || []).filter((item) => item.id !== itemId)
    };
    const updated = {
      ...currentTimetable,
      dayData: currentDayData
    };
    setCurrentTimetable(updated);
    triggerAutoSync(updated);
  };

  // ==========================================
  // SHARING & COLLABORATORS HANDLERS
  // ==========================================
  const handleTogglePublic = async (isPub: boolean) => {
    if (!currentTimetable) return;
    const updated = { ...currentTimetable, isPublic: isPub };
    setCurrentTimetable(updated);
    setTimetables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    saveCachedTimetables(timetables.map((t) => (t.id === updated.id ? updated : t)));
    await syncDocToFirestore(updated);
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError('');
    const rawInput = collabNdidInput.trim();

    if (!rawInput) {
      setCollabError('Vui lòng nhập NDID');
      return;
    }

    // Rule: Form Nhập Liệu - Chỉ áp dụng Regex validation /^[a-zA-Z0-9_.]+$/
    if (!/^[a-zA-Z0-9_.]+$/.test(rawInput)) {
      setCollabError('NDID chỉ được chứa chữ cái, chữ số, dấu gạch dưới và dấu chấm');
      return;
    }

    if (!currentTimetable) return;

    // Check if self
    if (
      (currentUser?.ndid && currentUser.ndid.toLowerCase() === rawInput.toLowerCase()) ||
      (currentTimetable.ownerNdid && currentTimetable.ownerNdid.toLowerCase() === rawInput.toLowerCase())
    ) {
      setCollabError('Đây là chủ sở hữu của thời khóa biểu này');
      return;
    }

    // Check duplicate
    if (
      currentTimetable.collaborators?.some(
        (c) => c.ndid.toLowerCase() === rawInput.toLowerCase()
      )
    ) {
      setCollabError('Người dùng này đã được cấp quyền trước đó');
      return;
    }

    setIsAddingCollab(true);

    try {
      const db: any = await getFirestoreDb();
      let resolvedName = rawInput;
      let resolvedPhoto = '';
      let resolvedUid = '';

      if (db) {
        const { collection, query, where, getDocs, limit } = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
        );
        const q = query(collection(db, 'users'), where('ndid', '==', rawInput), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          resolvedName = docData.fullname || docData.displayName || rawInput;
          resolvedPhoto = docData.photoURL || '';
          resolvedUid = snap.docs[0].id;
        }
      }

      const newCollab: Collaborator = {
        ndid: rawInput,
        uid: resolvedUid,
        name: resolvedName,
        photoURL: resolvedPhoto,
        role: collabRoleInput,
        addedAt: new Date().toISOString()
      };

      const updatedCollabs = [...(currentTimetable.collaborators || []), newCollab];
      const updatedSharedNdids = updatedCollabs.map((c) => c.ndid);

      const updatedTimetable: TimetableData = {
        ...currentTimetable,
        collaborators: updatedCollabs,
        sharedNdids: updatedSharedNdids
      };

      setCurrentTimetable(updatedTimetable);
      setTimetables((prev) => prev.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
      saveCachedTimetables(timetables.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
      
      setCollabNdidInput('');
      setCollabRoleInput('view');
      await syncDocToFirestore(updatedTimetable);
    } catch (err) {
      console.warn("Lỗi thêm người dùng:", err);
      setCollabError('Không thể thêm người dùng. Vui lòng thử lại.');
    } finally {
      setIsAddingCollab(false);
    }
  };

  const handleUpdateCollaboratorRole = async (targetNdid: string, newRole: 'view' | 'comment' | 'edit') => {
    if (!currentTimetable) return;
    const updatedCollabs = (currentTimetable.collaborators || []).map((c) =>
      c.ndid === targetNdid ? { ...c, role: newRole } : c
    );
    const updatedTimetable: TimetableData = {
      ...currentTimetable,
      collaborators: updatedCollabs
    };
    setCurrentTimetable(updatedTimetable);
    setTimetables((prev) => prev.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
    saveCachedTimetables(timetables.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
    await syncDocToFirestore(updatedTimetable);
  };

  const handleRemoveCollaborator = async (targetNdid: string) => {
    if (!currentTimetable) return;
    const updatedCollabs = (currentTimetable.collaborators || []).filter((c) => c.ndid !== targetNdid);
    const updatedTimetable: TimetableData = {
      ...currentTimetable,
      collaborators: updatedCollabs,
      sharedNdids: updatedCollabs.map((c) => c.ndid)
    };
    setCurrentTimetable(updatedTimetable);
    setTimetables((prev) => prev.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
    saveCachedTimetables(timetables.map((t) => (t.id === updatedTimetable.id ? updatedTimetable : t)));
    await syncDocToFirestore(updatedTimetable);
  };

  // ==========================================
  // COMMENTS HANDLERS
  // ==========================================
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeId || !currentUser) return;
    setIsPostingComment(true);

    try {
      const db: any = await getFirestoreDb();
      if (!db) return;
      const { collection, addDoc, serverTimestamp } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
      );

      await addDoc(collection(db, 'timetables', activeId, 'comments'), {
        uid: currentUser.uid,
        ndid: currentUser.ndid,
        authorName: currentUser.displayName,
        authorPhoto: currentUser.photoURL,
        content: newCommentText.trim(),
        createdAt: serverTimestamp()
      });

      setNewCommentText('');
    } catch (err) {
      console.error("Lỗi đăng nhận xét:", err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Xác nhận xóa nhận xét này?")) return;
    try {
      const db: any = await getFirestoreDb();
      if (!db) return;
      const { doc, deleteDoc } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
      );
      await deleteDoc(doc(db, 'timetables', activeId!, 'comments', commentId));
    } catch (err) {
      console.error("Lỗi xóa nhận xét:", err);
    }
  };

  // ==========================================
  // VIEW 1: DETAIL PAGE OR NOT FOUND / ACCESS DENIED
  // ==========================================
  if (activeId) {
    // 1. Loading state while checking Firestore
    if (isCheckingExist) {
      return (
        <div className="max-w-md mx-auto my-20 bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3 shadow-sm">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="text-sm font-bold text-slate-700">Đang kiểm tra thời khóa biểu...</p>
        </div>
      );
    }

    // 2. Not Found state
    if (notFound || !currentTimetable) {
      return (
        <div className="max-w-md mx-auto my-20 bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-2xl font-bold mx-auto">
            !
          </div>
          <h2 className="text-base font-bold text-slate-900">Thời khóa biểu không tồn tại</h2>
          <p className="text-xs text-slate-500">
            Mã thời khóa biểu <span className="font-mono font-bold text-slate-800">{activeId}</span> chưa được tạo hoặc không có trong hệ thống.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigateTo(null)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Quay về danh sách
            </button>
          </div>
        </div>
      );
    }

    // Determine current user's role on this timetable
    const currentRole = getEffectiveRole(currentTimetable, currentUser);

    // 3. Access Denied: Private and user has no role
    if (currentRole === 'none') {
      return (
        <div className="max-w-md mx-auto my-20 bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-2xl font-bold mx-auto">
            🔒
          </div>
          <h2 className="text-base font-bold text-slate-900">Bạn không có quyền truy cập thời khóa biểu này</h2>
          <p className="text-xs text-slate-500">
            Thời khóa biểu này ở chế độ riêng tư hoặc tài khoản của bạn chưa được cấp quyền truy cập. Vui lòng liên hệ chủ sở hữu để được chia sẻ.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigateTo(null)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Quay về danh sách
            </button>
          </div>
        </div>
      );
    }

    const canEdit = currentRole === 'owner' || currentRole === 'edit';
    const isOwner = currentRole === 'owner';
    const canComment = currentRole === 'owner' || currentRole === 'edit' || currentRole === 'comment' || (currentTimetable.isPublic && currentUser);
    const isMultiplayer = onlineUsers.length > 1;

    const morningSlotsCount = currentTimetable.morningSlotsCount ?? 5;
    const afternoonSlotsCount = currentTimetable.afternoonSlotsCount ?? 0;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/eduspace/timetable"
              onClick={(e) => {
                e.preventDefault();
                navigateTo(null);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              ← /eduspace/timetable
            </a>

            {/* Badges */}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                currentTimetable.isPublic
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {currentTimetable.isPublic ? 'Công khai' : 'Riêng tư'}
            </span>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                currentRole === 'owner'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : currentRole === 'edit'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentRole === 'comment'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {currentRole === 'owner'
                ? 'Chủ sở hữu'
                : currentRole === 'edit'
                ? 'Được sửa'
                : currentRole === 'comment'
                ? 'Nhận xét'
                : 'Chỉ xem'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {syncStatus && (
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                {syncStatus}
              </span>
            )}
            {/* Author info with Avatar and RAW NDID (NO @ PREPEND) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
              {currentTimetable.ownerPhotoURL ? (
                <img
                  src={currentTimetable.ownerPhotoURL}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center">
                  {(currentTimetable.ownerName || currentTimetable.ownerNdid || 'A').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-slate-400 font-bold uppercase text-[10px]">Người tạo:</span>
              <span className="font-bold text-slate-700">
                {currentTimetable.ownerName || currentTimetable.ownerNdid || 'Ẩn danh'}
              </span>
              {currentTimetable.ownerNdid && (
                <span className="text-slate-400 font-mono text-[11px]">
                  ({currentTimetable.ownerNdid})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Realtime Collaborative Presence Bar (chỉ hiện khi có người trực tuyến) */}
        {onlineUsers.length > 0 && (
          <div
            className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 transition-colors ${
              isMultiplayer
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isMultiplayer ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isMultiplayer ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                ></span>
              </span>

              <span className="text-xs font-bold">
                {isMultiplayer
                  ? `Đang có ${onlineUsers.length} người trực tuyến cùng truy cập thời khóa biểu này`
                  : '1 người trực tuyến'}
              </span>

              {isMultiplayer && canEdit && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  ⚡ Đang bật đồng bộ trực tiếp
                </span>
              )}
            </div>

            {/* List of online users */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {onlineUsers.map((u) => (
                <div
                  key={u.sessionId}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs flex-shrink-0 shadow-xs"
                  title={`${u.name} (${u.ndid})`}
                >
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center">
                      {(u.name || u.ndid || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-bold text-slate-800 text-[11px]">{u.name || u.ndid}</span>
                  {/* RAW NDID (NO @) */}
                  <span className="text-[10px] text-slate-400 font-mono">({u.ndid})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DETAIL PAGE HEADER & ACTION BUTTONS */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          {/* Top action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Mã TKB:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                  {currentTimetable.id}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTimetableIdInput(currentTimetable.id);
                      setChangeIdError(null);
                      setIsChangeIdModalOpen(true);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Đổi mã thời khóa biểu"
                  >
                    <span>✏️</span>
                    <span>Đổi mã</span>
                  </button>
                )}
              </div>

              {/* Creator info badge */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs shadow-2xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Người tạo:</span>
                {currentTimetable.ownerPhotoURL ? (
                  <img
                    src={currentTimetable.ownerPhotoURL}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                    {(currentTimetable.ownerName || currentTimetable.ownerNdid || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="font-bold text-slate-800">
                  {currentTimetable.ownerName || currentTimetable.ownerNdid || 'Ẩn danh'}
                </span>
                {currentTimetable.ownerNdid && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({currentTimetable.ownerNdid})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* AI Auto-Fill button */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                  title="Tự động phân tích ảnh, tệp tin hoặc văn bản để điền thời khóa biểu"
                >
                  <span>✨</span> Nhập bằng AI
                </button>
              )}

              {/* Share button (owner only) */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>👥</span> Chia sẻ
                </button>
              )}

              {/* Save changes button */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleSaveDetail}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  Lưu thay đổi
                </button>
              )}

              {/* Clone next week button */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleCloneNextWeek}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  Nhân bản sang tuần sau
                </button>
              )}
            </div>
          </div>

          {/* Header inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên TKB</label>
              <input
                type="text"
                readOnly={!canEdit}
                value={currentTimetable.title || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, title: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Tên TKB"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Trường</label>
              <input
                type="text"
                readOnly={!canEdit}
                value={currentTimetable.school || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, school: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Trường"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Lớp</label>
              <input
                type="text"
                readOnly={!canEdit}
                value={currentTimetable.gradeClass || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, gradeClass: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Lớp"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Năm học</label>
              <input
                type="text"
                readOnly={!canEdit}
                value={currentTimetable.schoolYear || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, schoolYear: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Năm học"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tuần bắt đầu</label>
              <input
                type="number"
                readOnly={!canEdit}
                value={currentTimetable.startWeek ?? ''}
                onChange={(e) => {
                  const updated = {
                    ...currentTimetable,
                    startWeek: e.target.value ? Number(e.target.value) : ''
                  };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Tuần bắt đầu"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tuần kết thúc</label>
              <input
                type="number"
                readOnly={!canEdit}
                value={currentTimetable.endWeek ?? ''}
                onChange={(e) => {
                  const updated = {
                    ...currentTimetable,
                    endWeek: e.target.value ? Number(e.target.value) : ''
                  };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                placeholder="Tuần kết thúc"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày bắt đầu</label>
              <input
                type="date"
                readOnly={!canEdit}
                value={currentTimetable.startDate || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, startDate: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày kết thúc</label>
              <input
                type="date"
                readOnly={!canEdit}
                value={currentTimetable.endDate || ''}
                onChange={(e) => {
                  const updated = { ...currentTimetable, endDate: e.target.value };
                  setCurrentTimetable(updated);
                  triggerAutoSync(updated);
                }}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none transition-colors ${
                  canEdit ? 'bg-slate-50 focus:bg-white focus:border-blue-500' : 'bg-slate-100 cursor-default'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3. SCHEDULE CONFIG (Visible or editable based on role) */}
        {canEdit ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Số tiết sáng</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={currentTimetable.morningSlotsCount ?? 5}
                  onChange={(e) => {
                    const updated = {
                      ...currentTimetable,
                      morningSlotsCount: Math.max(0, Number(e.target.value) || 0)
                    };
                    setCurrentTimetable(updated);
                    triggerAutoSync(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Số tiết chiều</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={currentTimetable.afternoonSlotsCount ?? 0}
                  onChange={(e) => {
                    const updated = {
                      ...currentTimetable,
                      afternoonSlotsCount: Math.max(0, Number(e.target.value) || 0)
                    };
                    setCurrentTimetable(updated);
                    triggerAutoSync(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Start/End time per slot */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Khung giờ từng tiết học (Sáng / Chiều)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sáng */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3">
                  <span className="text-xs font-bold text-slate-700">Buổi Sáng</span>
                  {morningSlotsCount === 0 ? (
                    <p className="text-xs text-slate-400 italic">Không có tiết buổi sáng.</p>
                  ) : (
                    Array.from({ length: morningSlotsCount }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const key = `morning-${slotNum}`;
                      const times = currentTimetable.slotTimes?.[key] || DEFAULT_MORNING_TIMES[slotNum] || { startTime: '', endTime: '' };
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 w-16">Tiết {slotNum}:</span>
                          <input
                            type="time"
                            value={times.startTime || ''}
                            onChange={(e) => {
                              const updatedTimes = { ...(currentTimetable.slotTimes || {}) };
                              updatedTimes[key] = { ...times, startTime: e.target.value };
                              const updated = { ...currentTimetable, slotTimes: updatedTimes };
                              setCurrentTimetable(updated);
                              triggerAutoSync(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                          <span className="text-xs text-slate-400">-</span>
                          <input
                            type="time"
                            value={times.endTime || ''}
                            onChange={(e) => {
                              const updatedTimes = { ...(currentTimetable.slotTimes || {}) };
                              updatedTimes[key] = { ...times, endTime: e.target.value };
                              const updated = { ...currentTimetable, slotTimes: updatedTimes };
                              setCurrentTimetable(updated);
                              triggerAutoSync(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chiều */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3">
                  <span className="text-xs font-bold text-slate-700">Buổi Chiều</span>
                  {afternoonSlotsCount === 0 ? (
                    <p className="text-xs text-slate-400 italic">Không có tiết buổi chiều.</p>
                  ) : (
                    Array.from({ length: afternoonSlotsCount }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const key = `afternoon-${slotNum}`;
                      const times = currentTimetable.slotTimes?.[key] || DEFAULT_AFTERNOON_TIMES[slotNum] || { startTime: '', endTime: '' };
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 w-16">Tiết {slotNum}:</span>
                          <input
                            type="time"
                            value={times.startTime || ''}
                            onChange={(e) => {
                              const updatedTimes = { ...(currentTimetable.slotTimes || {}) };
                              updatedTimes[key] = { ...times, startTime: e.target.value };
                              const updated = { ...currentTimetable, slotTimes: updatedTimes };
                              setCurrentTimetable(updated);
                              triggerAutoSync(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                          <span className="text-xs text-slate-400">-</span>
                          <input
                            type="time"
                            value={times.endTime || ''}
                            onChange={(e) => {
                              const updatedTimes = { ...(currentTimetable.slotTimes || {}) };
                              updatedTimes[key] = { ...times, endTime: e.target.value };
                              const updated = { ...currentTimetable, slotTimes: updatedTimes };
                              setCurrentTimetable(updated);
                              triggerAutoSync(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Custom break times */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Giờ giải lao tùy biến
              </span>

              {/* Form: [Thêm giờ giải lao] */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 border border-slate-200 rounded-lg">
                <input
                  type="text"
                  value={newBreakName}
                  onChange={(e) => setNewBreakName(e.target.value)}
                  placeholder="Tên giờ giải lao (Ví dụ: Ra chơi sáng...)"
                  className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />
                <select
                  value={newBreakPeriod}
                  onChange={(e) => setNewBreakPeriod(e.target.value as 'morning' | 'afternoon')}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="morning">Sáng</option>
                  <option value="afternoon">Chiều</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Sau tiết:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newBreakAfterSlot}
                    onChange={(e) => setNewBreakAfterSlot(Number(e.target.value) || 1)}
                    className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddBreakTime}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Thêm giờ giải lao
                </button>
              </div>

              {/* List of current breaks */}
              {(currentTimetable.breakTimes || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(currentTimetable.breakTimes || []).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-lg"
                    >
                      <span className="font-bold">{b.name}</span>
                      <span className="text-amber-600">
                        ({b.period === 'morning' ? 'Sáng' : 'Chiều'}, sau tiết {b.afterSlot})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBreakTime(b.id)}
                        className="text-amber-700 hover:text-rose-600 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* 4. TIMETABLE GRID (Mon -> Sun, Morning/Afternoon) */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              {/* Header: Days of the week */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 border-r border-slate-200 text-center font-bold text-xs uppercase tracking-wider w-24">
                    Tiết
                  </th>
                  {DAYS_OF_WEEK.map((dayName) => (
                    <th
                      key={dayName}
                      className="p-3 border-r border-slate-200 text-center font-bold text-xs uppercase tracking-wider last:border-r-0"
                    >
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* BUỔI SÁNG HEADER & SLOTS */}
                {morningSlotsCount > 0 && (
                  <React.Fragment>
                    <tr className="bg-blue-50/60 border-y border-blue-100">
                      <td
                        colSpan={8}
                        className="px-4 py-2 font-bold text-xs uppercase tracking-wider text-blue-800"
                      >
                        Buổi Sáng
                      </td>
                    </tr>

                    {/* SÁNG SLOTS */}
                    {Array.from({ length: morningSlotsCount }).map((_, idx) => {
                  const slotNum = idx + 1;
                  const slotKey = `morning-${slotNum}`;
                  const times = currentTimetable.slotTimes?.[slotKey] || DEFAULT_MORNING_TIMES[slotNum];
                  const timeStr = times?.startTime && times?.endTime ? `${times.startTime} - ${times.endTime}` : '';
                  const breaksAfterThis = (currentTimetable.breakTimes || []).filter(
                    (b) => b.period === 'morning' && Number(b.afterSlot) === slotNum
                  );

                  return (
                    <React.Fragment key={`morning-row-${slotNum}`}>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        {/* Slot index & time */}
                        <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 align-middle">
                          <div className="font-bold text-xs text-slate-800">Tiết {slotNum}</div>
                          {timeStr && (
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{timeStr}</div>
                          )}
                        </td>

                        {/* Mon -> Sun */}
                        {DAYS_OF_WEEK.map((_, dayIdx) => {
                          const itemKey = `${dayIdx}-morning-${slotNum}`;
                          const item = currentTimetable.grid?.[itemKey] || { subject: '', teacher: '' };
                          const isDraggingThis = draggingKey === itemKey;
                          const isDropTarget = dragOverKey === itemKey;

                          return (
                            <td
                              key={itemKey}
                              onDragOver={canEdit ? (e) => handleDragOver(e, itemKey) : undefined}
                              onDragLeave={canEdit ? handleDragLeave : undefined}
                              onDrop={canEdit ? (e) => handleDrop(e, itemKey) : undefined}
                              className={`p-1.5 border-r border-slate-200 align-top transition-colors ${
                                isDropTarget ? 'bg-blue-100 border-2 border-blue-500' : ''
                              }`}
                            >
                              <div
                                draggable={canEdit}
                                onDragStart={canEdit ? (e) => handleDragStart(e, itemKey) : undefined}
                                className={`p-2 bg-slate-50 border border-slate-200 rounded-lg transition-shadow ${
                                  canEdit ? 'hover:bg-slate-100 cursor-grab active:cursor-grabbing' : 'cursor-default'
                                } ${isDraggingThis ? 'opacity-40 border-dashed border-blue-400' : ''}`}
                              >
                                <div className="space-y-1">
                                  {canEdit ? (
                                    <>
                                      <input
                                        type="text"
                                        placeholder="Tên môn"
                                        value={item.subject || ''}
                                        onFocus={() => {
                                          activeFocusedKeyRef.current = itemKey;
                                        }}
                                        onBlur={() => {
                                          if (activeFocusedKeyRef.current === itemKey) {
                                            activeFocusedKeyRef.current = null;
                                          }
                                        }}
                                        onChange={(e) => handleSlotChange(itemKey, 'subject', e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Tên giáo viên"
                                        value={item.teacher || ''}
                                        onFocus={() => {
                                          activeFocusedKeyRef.current = itemKey;
                                        }}
                                        onBlur={() => {
                                          if (activeFocusedKeyRef.current === itemKey) {
                                            activeFocusedKeyRef.current = null;
                                          }
                                        }}
                                        onChange={(e) => handleSlotChange(itemKey, 'teacher', e.target.value)}
                                        className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 placeholder:text-slate-400 outline-none focus:border-blue-500"
                                      />
                                    </>
                                  ) : (
                                    <div className="min-h-[42px] flex flex-col justify-center">
                                      <div className={`text-xs font-bold ${item.subject ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                                        {item.subject || '(Trống)'}
                                      </div>
                                      {item.teacher && (
                                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                          {item.teacher}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Break Rows */}
                      {breaksAfterThis.map((b) => (
                        <tr key={b.id} className="bg-amber-50/70 border-y border-amber-200">
                          <td colSpan={8} className="px-4 py-1.5 text-center text-xs font-bold text-amber-900">
                            ☕ {b.name}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                  </React.Fragment>
                )}

                {/* BUỔI CHIỀU HEADER */}
                {afternoonSlotsCount > 0 && (
                  <React.Fragment>
                    <tr className="bg-indigo-50/60 border-y border-indigo-100">
                      <td
                        colSpan={8}
                        className="px-4 py-2 font-bold text-xs uppercase tracking-wider text-indigo-800"
                      >
                        Buổi Chiều
                      </td>
                    </tr>

                    {/* CHIỀU SLOTS */}
                    {Array.from({ length: afternoonSlotsCount }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const slotKey = `afternoon-${slotNum}`;
                      const times = currentTimetable.slotTimes?.[slotKey] || DEFAULT_AFTERNOON_TIMES[slotNum];
                      const timeStr = times?.startTime && times?.endTime ? `${times.startTime} - ${times.endTime}` : '';
                      const breaksAfterThis = (currentTimetable.breakTimes || []).filter(
                        (b) => b.period === 'afternoon' && Number(b.afterSlot) === slotNum
                      );

                      return (
                        <React.Fragment key={`afternoon-row-${slotNum}`}>
                          <tr className="hover:bg-slate-50/40 transition-colors">
                            {/* Slot index & time */}
                            <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 align-middle">
                              <div className="font-bold text-xs text-slate-800">Tiết {slotNum}</div>
                              {timeStr && (
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{timeStr}</div>
                              )}
                            </td>

                            {/* Mon -> Sun */}
                            {DAYS_OF_WEEK.map((_, dayIdx) => {
                              const itemKey = `${dayIdx}-afternoon-${slotNum}`;
                              const item = currentTimetable.grid?.[itemKey] || { subject: '', teacher: '' };
                              const isDraggingThis = draggingKey === itemKey;
                              const isDropTarget = dragOverKey === itemKey;

                              return (
                                <td
                                  key={itemKey}
                                  onDragOver={canEdit ? (e) => handleDragOver(e, itemKey) : undefined}
                                  onDragLeave={canEdit ? handleDragLeave : undefined}
                                  onDrop={canEdit ? (e) => handleDrop(e, itemKey) : undefined}
                                  className={`p-1.5 border-r border-slate-200 align-top transition-colors ${
                                    isDropTarget ? 'bg-indigo-100 border-2 border-indigo-500' : ''
                                  }`}
                                >
                                  <div
                                    draggable={canEdit}
                                    onDragStart={canEdit ? (e) => handleDragStart(e, itemKey) : undefined}
                                    className={`p-2 bg-slate-50 border border-slate-200 rounded-lg transition-shadow ${
                                      canEdit ? 'hover:bg-slate-100 cursor-grab active:cursor-grabbing' : 'cursor-default'
                                    } ${isDraggingThis ? 'opacity-40 border-dashed border-indigo-400' : ''}`}
                                  >
                                    <div className="space-y-1">
                                      {canEdit ? (
                                        <>
                                          <input
                                            type="text"
                                            placeholder="Tên môn"
                                            value={item.subject || ''}
                                            onFocus={() => {
                                              activeFocusedKeyRef.current = itemKey;
                                            }}
                                            onBlur={() => {
                                              if (activeFocusedKeyRef.current === itemKey) {
                                                activeFocusedKeyRef.current = null;
                                              }
                                            }}
                                            onChange={(e) => handleSlotChange(itemKey, 'subject', e.target.value)}
                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500"
                                          />
                                          <input
                                            type="text"
                                            placeholder="Tên giáo viên"
                                            value={item.teacher || ''}
                                            onFocus={() => {
                                              activeFocusedKeyRef.current = itemKey;
                                            }}
                                            onBlur={() => {
                                              if (activeFocusedKeyRef.current === itemKey) {
                                                activeFocusedKeyRef.current = null;
                                              }
                                            }}
                                            onChange={(e) => handleSlotChange(itemKey, 'teacher', e.target.value)}
                                            className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 placeholder:text-slate-400 outline-none focus:border-blue-500"
                                          />
                                        </>
                                      ) : (
                                        <div className="min-h-[42px] flex flex-col justify-center">
                                          <div className={`text-xs font-bold ${item.subject ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                                            {item.subject || '(Trống)'}
                                          </div>
                                          {item.teacher && (
                                            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                              {item.teacher}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Break Rows */}
                          {breaksAfterThis.map((b) => (
                            <tr key={b.id} className="bg-amber-50/70 border-y border-amber-200">
                              <td colSpan={8} className="px-4 py-1.5 text-center text-xs font-bold text-amber-900">
                                ☕ {b.name}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                )}

                {morningSlotsCount === 0 && afternoonSlotsCount === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs font-medium">
                      Chưa có tiết học nào được thiết lập. Vui lòng cài đặt số tiết sáng hoặc chiều trong phần Cài đặt.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* 5. FOOTER PER DAY COLUMN */}
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 align-top">
                  <td className="p-3 border-r border-slate-200 text-center font-bold text-xs text-slate-600">
                    Chân trang
                  </td>
                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const dayCol = currentTimetable.dayData?.[dayIndex] || { note: '', extraClasses: [] };

                    return (
                      <td key={`footer-day-${dayIndex}`} className="p-3 border-r border-slate-200 space-y-4">
                        {/* Ghi chú ngày */}
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Ghi chú ngày
                          </label>
                          <textarea
                            rows={2}
                            readOnly={!canEdit}
                            value={dayCol.note || ''}
                            onChange={(e) => handleDayNoteChange(dayIndex, e.target.value)}
                            placeholder={canEdit ? "Ghi chú ngày" : ""}
                            className={`w-full p-2 border border-slate-200 rounded-lg text-xs font-medium outline-none resize-none ${
                              canEdit ? 'bg-white text-slate-800 focus:border-blue-500' : 'bg-slate-100 text-slate-600 cursor-default'
                            }`}
                          />
                        </div>

                        {/* Lịch học thêm */}
                        <div className="space-y-2">
                          <span className="block text-xs font-bold text-slate-700">Lịch học thêm</span>

                          {/* List items */}
                          <div className="space-y-1.5">
                            {(dayCol.extraClasses || []).map((item) => (
                              <div key={item.id} className="flex items-center gap-1.5">
                                {canEdit ? (
                                  <>
                                    <input
                                      type="text"
                                      value={item.text || ''}
                                      onChange={(e) =>
                                        handleExtraClassTextChange(dayIndex, item.id, e.target.value)
                                      }
                                      placeholder="Môn / Giờ học thêm"
                                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveExtraClass(dayIndex, item.id)}
                                      className="text-slate-400 hover:text-rose-600 text-xs px-1"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <div className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                                    {item.text || '-'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Button: [Thêm lịch học thêm] (canEdit only) */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleAddExtraClass(dayIndex)}
                              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                            >
                              Thêm lịch học thêm
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 6. COMMENTS & DISCUSSION SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>💬</span> Nhận xét ({comments.length})
            </h3>
            {!canComment && (
              <span className="text-xs text-slate-400 italic">
                Chỉ người có quyền Nhận xét hoặc Sửa mới có thể gửi bình luận.
              </span>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Chưa có nhận xét nào cho thời khóa biểu này.
              </p>
            ) : (
              comments.map((c) => {
                const canDeleteThisComment =
                  isOwner || (currentUser && currentUser.uid === c.uid) || currentUser?.role === 'admin';

                return (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {c.authorPhoto ? (
                          <img
                            src={c.authorPhoto}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {(c.authorName || c.ndid || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-800">
                          {c.authorName || c.ndid}
                        </span>
                        {/* RAW NDID (NO @ PREFIX) */}
                        <span className="text-[11px] font-mono text-slate-400">
                          ({c.ndid})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {formatCommentTime(c.createdAt)}
                        </span>
                        {canDeleteThisComment && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-slate-400 hover:text-rose-600 text-xs px-1"
                            title="Xóa nhận xét"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap pl-7">
                      {c.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Form */}
          {canComment ? (
            <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-100 space-y-2">
              <textarea
                rows={2}
                required
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Viết nhận xét..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium outline-none focus:bg-white focus:border-blue-500 resize-none transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !newCommentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  {isPostingComment ? 'Đang gửi...' : 'Gửi nhận xét'}
                </button>
              </div>
            </form>
          ) : !currentUser ? (
            <div className="text-xs text-center py-2 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              Vui lòng <a href="/auth/login/" className="font-bold text-blue-600 hover:underline">đăng nhập</a> để tham gia nhận xét.
            </div>
          ) : null}
        </div>

        {/* 7. SHARE & COLLABORATORS MODAL (Owner only) */}
        {isShareModalOpen && isOwner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cài đặt chia sẻ & Phân quyền</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mã TKB: <span className="font-mono font-bold text-slate-700">{currentTimetable.id}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Section 1: Public / Private toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Chế độ chia sẻ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePublic(false)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      !currentTimetable.isPublic
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>🔒</span> Riêng tư
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Chỉ bạn và những người được thêm mới xem được.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePublic(true)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      currentTimetable.isPublic
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <span>🌐</span> Công khai
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hiển thị tại trang chính thời khóa biểu cho mọi người.
                    </p>
                  </button>
                </div>
              </div>

              {/* Section 2: Add Collaborator with NDID */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Thêm người dùng trực tiếp qua NDID</label>
                <form onSubmit={handleAddCollaborator} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      value={collabNdidInput}
                      onChange={(e) => {
                        setCollabNdidInput(e.target.value);
                        setCollabError('');
                      }}
                      placeholder="Nhập NDID người dùng (ví dụ: nguyenvana)"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    />
                    <select
                      value={collabRoleInput}
                      onChange={(e) => setCollabRoleInput(e.target.value as 'view' | 'comment' | 'edit')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option value="view">Đọc (Chỉ xem)</option>
                      <option value="comment">Nhận xét</option>
                      <option value="edit">Sửa</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isAddingCollab}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex-shrink-0"
                    >
                      {isAddingCollab ? 'Đang thêm...' : 'Thêm người dùng'}
                    </button>
                  </div>
                  {collabError && (
                    <p className="text-[11px] text-rose-600 font-medium">{collabError}</p>
                  )}
                </form>
              </div>

              {/* Section 3: Collaborators List */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Người dùng đã được phân quyền ({(currentTimetable.collaborators || []).length})
                </label>

                {(currentTimetable.collaborators || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Chưa phân quyền cho người dùng cụ thể nào.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(currentTimetable.collaborators || []).map((c) => (
                      <div
                        key={c.ndid}
                        className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {c.photoURL ? (
                            <img
                              src={c.photoURL}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(c.name || c.ndid).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {c.name || c.ndid}
                            </span>
                            {/* RAW NDID (NO @ PREFIX) */}
                            <span className="text-[11px] font-mono text-slate-500 block truncate">
                              NDID: {c.ndid}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select
                            value={c.role}
                            onChange={(e) =>
                              handleUpdateCollaboratorRole(
                                c.ndid,
                                e.target.value as 'view' | 'comment' | 'edit'
                              )
                            }
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
                          >
                            <option value="view">Đọc</option>
                            <option value="comment">Nhận xét</option>
                            <option value="edit">Sửa</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(c.ndid)}
                            className="p-1 text-slate-400 hover:text-rose-600 text-xs font-bold rounded-lg"
                            title="Gỡ quyền"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Modal button */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Auto-Fill Modal */}
        <AITimetableModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onApply={handleApplyAI}
        />

        {/* Change Timetable ID Modal */}
        {isChangeIdModalOpen && currentTimetable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div
              className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-base">✏️</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Đổi Mã Thời Khóa Biểu</h3>
                    <p className="text-[11px] text-slate-500">
                      Thay đổi mã định danh truy cập của thời khóa biểu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeIdModalOpen(false)}
                  disabled={isChangingId}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600">Mã hiện tại:</span>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-xs text-slate-700 select-all">
                    {currentTimetable.id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mã thời khóa biểu mới:
                  </label>
                  <input
                    type="text"
                    value={newTimetableIdInput}
                    onChange={(e) => {
                      setNewTimetableIdInput(e.target.value);
                      setChangeIdError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleChangeTimetableId();
                    }}
                    placeholder="Ví dụ: tkb-10a1, thoi-khoa-bieu-hk1..."
                    autoFocus
                    disabled={isChangingId}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-600">Quy chuẩn mã hợp lệ:</p>
                  <p>• Chỉ chứa chữ cái không dấu (a-z, A-Z), số (0-9), gạch nối (-) hoặc gạch dưới (_).</p>
                  <p>• Độ dài từ 2 đến 50 ký tự, không chứa khoảng trắng.</p>
                  <p>• Mã mới phải chưa có ai sử dụng trên hệ thống.</p>
                </div>

                {changeIdError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                    <span className="font-bold">⚠️</span>
                    <span>{changeIdError}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangeIdModalOpen(false)}
                  disabled={isChangingId}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleChangeTimetableId}
                  disabled={isChangingId || !newTimetableIdInput.trim() || newTimetableIdInput.trim().toLowerCase() === currentTimetable.id.toLowerCase()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  {isChangingId ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Đang kiểm tra & cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Xác nhận đổi mã</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: MAIN PAGE (/eduspace/timetable)
  // ==========================================
  // Filter lists according to tabs
  const publicTimetables = timetables.filter((t) => t.isPublic === true);

  const myTimetables = currentUser
    ? timetables.filter(
        (t) =>
          (t.ownerUid && t.ownerUid === currentUser.uid) ||
          (t.ownerNdid && t.ownerNdid.toLowerCase() === currentUser.ndid.toLowerCase())
      )
    : [];

  const sharedWithMeTimetables = currentUser
    ? timetables.filter((t) => {
        const isMy =
          (t.ownerUid && t.ownerUid === currentUser.uid) ||
          (t.ownerNdid && t.ownerNdid.toLowerCase() === currentUser.ndid.toLowerCase());
        if (isMy) return false;
        return t.collaborators?.some(
          (c) =>
            (c.uid && c.uid === currentUser.uid) ||
            (c.ndid && c.ndid.toLowerCase() === currentUser.ndid.toLowerCase())
        );
      })
    : [];

  const displayedTimetables =
    activeTab === 'public'
      ? publicTimetables
      : activeTab === 'mine'
      ? myTimetables
      : sharedWithMeTimetables;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title & User Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản trị Thời khóa biểu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập và quản lý thời khóa biểu học tập, chia sẻ công khai hoặc theo quyền riêng tư.
          </p>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
            ) : null}
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {currentUser.displayName}
              </span>
              {/* RAW NDID (NO @ PREFIX) */}
              <span className="text-[11px] font-mono text-slate-500 block leading-tight">
                {currentUser.ndid}
              </span>
            </div>
          </div>
        ) : (
          <a
            href="/auth/login/"
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200"
          >
            Đăng nhập tài khoản
          </a>
        )}
      </div>

      {/* 1. FORM TO CREATE TIMETABLE (With duplicate ID check) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleCreateTimetable} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Mã TKB (Custom ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newCustomId}
                onChange={(e) => {
                  setNewCustomId(e.target.value);
                  setCreateError('');
                }}
                placeholder="Ví dụ: tkb-12a1, tkb-hk1-2026..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Tên TKB
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Thời khóa biểu Lớp 12A1 K65..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {createError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg">
              {createError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Chia sẻ công khai (Mọi người đều có thể xem tại trang chính)
              </span>
            </label>

            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              {isCreating ? 'Đang kiểm tra...' : 'Tạo thời khóa biểu'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. LIST CREATED TIMETABLES WITH TABS */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'public'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả công khai ({publicTimetables.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'mine'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Của tôi ({myTimetables.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'shared'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Được chia sẻ với tôi ({sharedWithMeTimetables.length})
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            Đang tải dữ liệu từ Firebase...
          </div>
        ) : !currentUser && (activeTab === 'mine' || activeTab === 'shared') ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-3">
            <p>Vui lòng đăng nhập để xem thời khóa biểu của bạn hoặc được chia sẻ.</p>
            <a
              href="/auth/login/"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Đăng nhập
            </a>
          </div>
        ) : displayedTimetables.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {activeTab === 'public'
              ? 'Chưa có thời khóa biểu công khai nào. Hãy tạo một thời khóa biểu mới ở trên.'
              : activeTab === 'mine'
              ? 'Bạn chưa tạo thời khóa biểu nào.'
              : 'Chưa có thời khóa biểu nào được chia sẻ với bạn.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedTimetables.map((item) => {
              const role = getEffectiveRole(item, currentUser);
              const isOwner = role === 'owner';

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                        {item.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{item.title || item.id}</h3>

                      {/* Visibility Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          item.isPublic
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.isPublic ? 'Công khai' : 'Riêng tư'}
                      </span>

                      {/* Role Badge */}
                      {currentUser && role !== 'none' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                            role === 'owner'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : role === 'edit'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : role === 'comment'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {role === 'owner'
                            ? 'Chủ sở hữu'
                            : role === 'edit'
                            ? 'Sửa'
                            : role === 'comment'
                            ? 'Nhận xét'
                            : 'Đọc'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      {item.school && <span>Trường: {item.school}</span>}
                      {item.gradeClass && <span>Lớp: {item.gradeClass}</span>}
                      {item.schoolYear && <span>Năm học: {item.schoolYear}</span>}
                      {item.startWeek && <span>Tuần {item.startWeek} - {item.endWeek}</span>}

                      {/* Creator info with Avatar and RAW NDID (NO @) */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {item.ownerPhotoURL ? (
                          <img
                            src={item.ownerPhotoURL}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center">
                            {(item.ownerName || item.ownerNdid || 'A').charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span>
                          Người tạo: <strong className="text-slate-700">{item.ownerName || item.ownerNdid || 'Ẩn danh'}</strong>
                        </span>
                        {item.ownerNdid && (
                          <span className="text-[11px] text-slate-400 font-mono">({item.ownerNdid})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200"
                    >
                      Mở TKB
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTimetable(item.id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors border border-rose-200"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
