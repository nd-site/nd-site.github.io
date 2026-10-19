import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  increment, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db, isLiveFirebase } from './firebase';
import type { Poem, StudyProgress, Comment, UserProfile, PoemVisibility } from '../types';
import { DEFAULT_POEMS } from '../data/defaultPoems';

const LOCAL_POEMS_KEY = 'poemnd_poems_v1';
const LOCAL_PROGRESS_KEY = 'poemnd_progress_v1';
const LOCAL_COMMENTS_KEY = 'poemnd_comments_v1';
const LOCAL_PROFILE_KEY = 'poemnd_user_profile_v1';
const GEMINI_KEY = 'poemnd_gemini_api_key';

// Event emitter for local state synchronization
const listeners: Record<string, Function[]> = {
  poems: [],
  comments: [],
  progress: []
};

function emitEvent(channel: string, data: any) {
  listeners[channel]?.forEach(cb => cb(data));
}

// Normalize poem with complete security & sharing fields
export function normalizePoem(p: any): Poem {
  return {
    ...p,
    id: p.id,
    slug: p.slug || p.id,
    authorNdid: p.authorNdid || p.createdBy?.ndid || undefined,
    visibility: (p.visibility as PoemVisibility) || (p.isPublic === false ? 'private' : 'public'),
    isPublic: p.visibility ? p.visibility === 'public' : (p.isPublic !== false),
    isLocked: Boolean(p.isLocked),
    allowComments: p.allowComments !== false,
    collaboratorNdids: Array.isArray(p.collaboratorNdids) ? p.collaboratorNdids : [],
    likesCount: typeof p.likesCount === 'number' ? p.likesCount : 0,
    likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
    savesCount: typeof p.savesCount === 'number' ? p.savesCount : 0,
    viewsCount: typeof p.viewsCount === 'number' ? p.viewsCount : 0,
    createdBy: {
      uid: p.createdBy?.uid || 'nd-labs',
      displayName: p.createdBy?.displayName || 'Tác giả ND Labs',
      ndid: p.createdBy?.ndid,
      avatar: p.createdBy?.avatar || '/assets/images/logo.png'
    }
  };
}

// Initialise local storage if empty or clean old mock data
export function initLocalData() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(LOCAL_POEMS_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(DEFAULT_POEMS));
  } else {
    try {
      const parsed = JSON.parse(existing);
      // Clean up legacy mock data with >100 fake likes
      if (Array.isArray(parsed) && parsed.some((p: any) => p.likesCount > 50 || (p.createdBy?.avatar && p.createdBy.avatar.includes('unsplash')))) {
        const cleaned = parsed.map(normalizePoem).map(p => ({
          ...p,
          likesCount: 0,
          likedBy: [],
          savesCount: 0,
          viewsCount: 0,
          createdBy: {
            ...p.createdBy,
            avatar: p.createdBy.avatar?.includes('unsplash') ? '/assets/images/logo.png' : p.createdBy.avatar
          }
        }));
        localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(cleaned));
      }
    } catch (_) {
      localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(DEFAULT_POEMS));
    }
  }

  const profile = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (!profile) {
    const today = new Date().toISOString().split('T')[0];
    const initialProfile: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Bạn đọc yêu thơ',
      email: '',
      avatar: '/assets/images/logo.png',
      streakDays: 1,
      savedPoemIds: [],
      lastActiveDate: today,
      isAnonymous: true
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(initialProfile));
  }
}

// ---------------- PERMISSION HELPERS ----------------

export function canUserEditPoem(poem: Poem, user: UserProfile): boolean {
  if (!user || !poem) return false;
  // If user is guest/anonymous, cannot edit
  if (user.isAnonymous || user.uid.startsWith('guest_')) return false;

  // Author has edit permission (unless locked by creator)
  const isAuthor = 
    poem.createdBy?.uid === user.uid ||
    (Boolean(user.ndid) && (poem.authorNdid === user.ndid || poem.createdBy?.ndid === user.ndid));

  // If locked, only author can edit/unlock
  if (poem.isLocked) {
    return isAuthor;
  }

  if (isAuthor) return true;

  // Collaborators with matching NDID
  if (user.ndid && poem.collaboratorNdids && poem.collaboratorNdids.includes(user.ndid)) {
    return true;
  }

  return false;
}

export function canUserCommentPoem(poem: Poem): boolean {
  if (!poem) return false;
  if (poem.isLocked) return false;
  return poem.allowComments !== false;
}

export function canUserViewPoem(poem: Poem, user: UserProfile): boolean {
  if (!poem) return false;
  const visibility = poem.visibility || (poem.isPublic ? 'public' : 'private');
  if (visibility === 'public' || visibility === 'unlisted') {
    return true;
  }
  // Private: only creator or collaborators can view
  if (!user) return false;
  const isAuthor = 
    poem.createdBy?.uid === user.uid ||
    (Boolean(user.ndid) && (poem.authorNdid === user.ndid || poem.createdBy?.ndid === user.ndid));
  if (isAuthor) return true;

  if (user.ndid && poem.collaboratorNdids && poem.collaboratorNdids.includes(user.ndid)) {
    return true;
  }
  return false;
}

// ---------------- POEMS API ----------------

export async function fetchPoems(): Promise<Poem[]> {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'poems'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => normalizePoem({ id: d.id, ...d.data() }));
      } else {
        try {
          for (const p of DEFAULT_POEMS) {
            await setDoc(doc(db, 'poems', p.id), p);
          }
        } catch (_) {}
        return DEFAULT_POEMS.map(normalizePoem);
      }
    } catch (e) {
      console.warn('Firestore fetch failed, using local cache', e);
    }
  }

  // Local fallback
  initLocalData();
  const raw = localStorage.getItem(LOCAL_POEMS_KEY);
  if (raw) {
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.map(normalizePoem) : DEFAULT_POEMS.map(normalizePoem);
    } catch (_) {}
  }
  return DEFAULT_POEMS.map(normalizePoem);
}

export function subscribePoems(onUpdate: (poems: Poem[]) => void): () => void {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'poems'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const poems = snapshot.docs.map(d => normalizePoem({ id: d.id, ...d.data() }));
          onUpdate(poems);
        } else {
          onUpdate(DEFAULT_POEMS.map(normalizePoem));
        }
      }, (err) => {
        console.warn('Firestore subscription error, fallback to local', err);
        fetchPoems().then(onUpdate);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Error creating Firestore listener', e);
    }
  }

  // Local listener
  const handler = (data: Poem[]) => onUpdate(data.map(normalizePoem));
  listeners.poems.push(handler);
  fetchPoems().then(onUpdate);

  return () => {
    listeners.poems = listeners.poems.filter(fn => fn !== handler);
  };
}

export async function createPoem(
  poemData: Omit<Poem, 'id' | 'createdAt' | 'likesCount' | 'likedBy' | 'savesCount' | 'viewsCount'>, 
  user: UserProfile
): Promise<Poem> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const systemId = `p_${timestamp}_${randomSuffix}`;

  // Generate clean slug from title if not explicitly provided
  const baseSlug = (poemData.slug || poemData.title || systemId)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || systemId;

  const visibility: PoemVisibility = poemData.visibility || (poemData.isPublic === false ? 'private' : 'public');

  const newPoem: Poem = normalizePoem({
    ...poemData,
    id: systemId,
    slug: baseSlug,
    authorNdid: user.ndid || undefined,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
    savesCount: 0,
    viewsCount: 0,
    visibility,
    isPublic: visibility === 'public',
    isLocked: Boolean(poemData.isLocked),
    allowComments: poemData.allowComments !== false,
    collaboratorNdids: Array.isArray(poemData.collaboratorNdids) ? poemData.collaboratorNdids : [],
    createdBy: {
      uid: user.uid,
      displayName: user.displayName,
      ndid: user.ndid,
      avatar: user.avatar || '/assets/images/logo.png'
    }
  });

  if (isLiveFirebase() && db) {
    try {
      await setDoc(doc(db, 'poems', newPoem.id), newPoem);
      return newPoem;
    } catch (e) {
      console.warn('Failed to save to Firestore, saving locally', e);
    }
  }

  // Local save
  const poems = await fetchPoems();
  const updated = [newPoem, ...poems];
  localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(updated));
  emitEvent('poems', updated);
  return newPoem;
}

export async function updatePoem(poemId: string, updates: Partial<Poem>): Promise<Poem> {
  const poems = await fetchPoems();
  const target = poems.find(p => p.id === poemId);
  if (!target) throw new Error('Không tìm thấy bài thơ');

  const updated: Poem = normalizePoem({
    ...target,
    ...updates,
    id: poemId // immutable
  });

  if (isLiveFirebase() && db) {
    try {
      await updateDoc(doc(db, 'poems', poemId), updates);
    } catch (e) {
      console.warn('Firestore updatePoem failed', e);
    }
  }

  const updatedPoems = poems.map(p => p.id === poemId ? updated : p);
  localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(updatedPoems));
  emitEvent('poems', updatedPoems);
  return updated;
}

export async function updatePoemSecurity(
  poemId: string, 
  securitySettings: {
    visibility: PoemVisibility;
    isLocked: boolean;
    allowComments: boolean;
    collaboratorNdids: string[];
    slug?: string;
  }
): Promise<Poem> {
  const updates: Partial<Poem> = {
    visibility: securitySettings.visibility,
    isPublic: securitySettings.visibility === 'public',
    isLocked: securitySettings.isLocked,
    allowComments: securitySettings.allowComments,
    collaboratorNdids: securitySettings.collaboratorNdids
  };
  if (securitySettings.slug && securitySettings.slug.trim()) {
    updates.slug = securitySettings.slug.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '-');
  }

  return updatePoem(poemId, updates);
}

export async function deletePoemById(poemId: string): Promise<void> {
  if (isLiveFirebase() && db) {
    try {
      await deleteDoc(doc(db, 'poems', poemId));
    } catch (e) {
      console.warn('Firestore delete failed', e);
    }
  }

  const poems = await fetchPoems();
  const updated = poems.filter(p => p.id !== poemId);
  localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(updated));
  emitEvent('poems', updated);
}

export async function toggleLikePoem(poemId: string, userId: string): Promise<boolean> {
  const poems = await fetchPoems();
  const poem = poems.find(p => p.id === poemId);
  if (!poem) return false;

  const isLiked = (poem.likedBy || []).includes(userId);
  const updatedLikedBy = isLiked
    ? (poem.likedBy || []).filter(id => id !== userId)
    : [...(poem.likedBy || []), userId];
  
  const updatedLikesCount = Math.max(0, (poem.likesCount || 0) + (isLiked ? -1 : 1));

  if (isLiveFirebase() && db) {
    try {
      const poemRef = doc(db, 'poems', poemId);
      await updateDoc(poemRef, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likesCount: increment(isLiked ? -1 : 1)
      });
    } catch (e) {
      console.warn('Firestore like failed', e);
    }
  }

  const updatedPoems = poems.map(p => 
    p.id === poemId ? { ...p, likedBy: updatedLikedBy, likesCount: updatedLikesCount } : p
  );
  localStorage.setItem(LOCAL_POEMS_KEY, JSON.stringify(updatedPoems));
  emitEvent('poems', updatedPoems);

  return !isLiked;
}

// ---------------- STUDY PROGRESS API ----------------

export async function getStudyProgress(poemId: string, userId: string): Promise<StudyProgress | null> {
  if (isLiveFirebase() && db) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId, 'progress', poemId));
      if (docSnap.exists()) {
        return docSnap.data() as StudyProgress;
      }
    } catch (e) {
      console.warn('Firestore getStudyProgress failed', e);
    }
  }

  const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}`);
  if (raw) {
    const list: Record<string, StudyProgress> = JSON.parse(raw);
    return list[poemId] || null;
  }
  return null;
}

export async function getAllUserProgress(userId: string): Promise<Record<string, StudyProgress>> {
  if (isLiveFirebase() && db) {
    try {
      const q = collection(db, 'users', userId, 'progress');
      const snap = await getDocs(q);
      const res: Record<string, StudyProgress> = {};
      snap.docs.forEach(d => {
        res[d.id] = d.data() as StudyProgress;
      });
      return res;
    } catch (e) {
      console.warn('Firestore getAllUserProgress failed', e);
    }
  }

  const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}`);
  return raw ? JSON.parse(raw) : {};
}

export async function updateStudyProgress(
  poemId: string,
  userId: string,
  updates: Partial<StudyProgress>
): Promise<StudyProgress> {
  const current = (await getStudyProgress(poemId, userId)) || {
    poemId,
    status: 'learning',
    masteryScore: 0,
    lastPracticed: new Date().toISOString()
  };

  const updated: StudyProgress = {
    ...current,
    ...updates,
    lastPracticed: new Date().toISOString()
  };

  // Auto calculate status based on mastery score
  if (updated.masteryScore >= 90) {
    updated.status = 'mastered';
  } else if (updated.masteryScore > 0) {
    updated.status = 'learning';
  }

  if (isLiveFirebase() && db) {
    try {
      await setDoc(doc(db, 'users', userId, 'progress', poemId), updated);
    } catch (e) {
      console.warn('Firestore updateStudyProgress failed', e);
    }
  }

  const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}`);
  const dict: Record<string, StudyProgress> = raw ? JSON.parse(raw) : {};
  dict[poemId] = updated;
  localStorage.setItem(`${LOCAL_PROGRESS_KEY}_${userId}`, JSON.stringify(dict));
  emitEvent('progress', dict);

  checkAndUpdateDailyStreak();
  return updated;
}

// ---------------- COMMENTS API ----------------

export async function fetchComments(poemId: string): Promise<Comment[]> {
  if (isLiveFirebase() && db) {
    try {
      const q = query(
        collection(db, 'poems', poemId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    } catch (e) {
      console.warn('Firestore fetchComments failed', e);
    }
  }

  const raw = localStorage.getItem(`${LOCAL_COMMENTS_KEY}_${poemId}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {}
  }

  // 100% REAL: No fake mock comments!
  return [];
}

export async function addCommentToPoem(poemId: string, content: string, user: UserProfile): Promise<Comment> {
  const newComment: Comment = {
    id: 'cmt_' + Date.now(),
    poemId,
    userId: user.uid,
    userName: user.displayName,
    ndid: user.ndid,
    userAvatar: user.avatar || '/assets/images/logo.png',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  if (isLiveFirebase() && db) {
    try {
      await setDoc(doc(db, 'poems', poemId, 'comments', newComment.id), newComment);
      return newComment;
    } catch (e) {
      console.warn('Firestore addComment failed', e);
    }
  }

  const comments = await fetchComments(poemId);
  const updated = [newComment, ...comments];
  localStorage.setItem(`${LOCAL_COMMENTS_KEY}_${poemId}`, JSON.stringify(updated));
  emitEvent('comments', updated);
  return newComment;
}

// ---------------- USER PROFILE & ND LABS INTEGRATION ----------------

export function getNDLabsUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  // 1. Check nd_accounts
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
            uid: u.uid || ('nd_' + (u.ndid || 'user')),
            displayName: u.displayName || u.fullname || u.ndid || 'Thành viên ND Labs',
            email: u.email || '',
            avatar: u.photoURL || '/assets/images/logo.png',
            ndid: (u.ndid || '').trim() || undefined,
            streakDays: 1,
            savedPoemIds: [],
            lastActiveDate: new Date().toISOString().split('T')[0],
            isAnonymous: false
          };
        }
      }
    }
  } catch (_) {}

  // 2. Fallback to nd_user
  try {
    const rawUser = localStorage.getItem('nd_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && (u.uid || u.ndid)) {
        return {
          uid: u.uid || ('nd_' + (u.ndid || 'user')),
          displayName: u.displayName || u.fullname || u.ndid || 'Thành viên ND Labs',
          email: u.email || '',
          avatar: u.photoURL || '/assets/images/logo.png',
          ndid: (u.ndid || '').trim() || undefined,
          streakDays: 1,
          savedPoemIds: [],
          lastActiveDate: new Date().toISOString().split('T')[0],
          isAnonymous: false
        };
      }
    }
  } catch (_) {}

  return null;
}

export function getUserProfile(): UserProfile {
  const ndUser = getNDLabsUser();
  if (ndUser) {
    const local = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.savedPoemIds && parsed.savedPoemIds.length > 0) {
          ndUser.savedPoemIds = parsed.savedPoemIds;
        }
        if (parsed.streakDays) {
          ndUser.streakDays = parsed.streakDays;
        }
      } catch (_) {}
    }
    return ndUser;
  }

  initLocalData();
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw);
      return {
        ...p,
        avatar: p.avatar?.includes('unsplash') ? '/assets/images/logo.png' : (p.avatar || '/assets/images/logo.png')
      };
    } catch (_) {}
  }

  return {
    uid: 'guest_user',
    displayName: 'Bạn đọc ND Labs',
    email: '',
    avatar: '/assets/images/logo.png',
    streakDays: 1,
    savedPoemIds: [],
    lastActiveDate: new Date().toISOString().split('T')[0],
    isAnonymous: true
  };
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));

  if (isLiveFirebase() && db && profile.uid && !profile.uid.startsWith('guest_')) {
    try {
      setDoc(doc(db, 'users', profile.uid), profile, { merge: true }).catch(err => {
        console.warn('Firestore user profile sync warning', err);
      });
    } catch (e) {
      console.warn('Firestore user profile sync error', e);
    }
  }
}

export async function syncFirebaseUserProfile(fbUser: any): Promise<UserProfile> {
  const local = getUserProfile();
  let baseProfile: UserProfile = {
    uid: fbUser.uid,
    displayName: fbUser.displayName || local.displayName || 'Bạn đọc PoemND',
    email: fbUser.email || local.email || '',
    avatar: fbUser.photoURL || local.avatar || '/assets/images/logo.png',
    streakDays: local.streakDays || 1,
    savedPoemIds: local.savedPoemIds || [],
    lastActiveDate: local.lastActiveDate || new Date().toISOString().split('T')[0],
    ndid: local.ndid || (fbUser.email ? fbUser.email.split('@')[0] : undefined),
    isAnonymous: fbUser.isAnonymous || false
  };

  if (isLiveFirebase() && db) {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<UserProfile>;
        baseProfile = {
          ...baseProfile,
          ...remoteData,
          savedPoemIds: Array.from(new Set([...(baseProfile.savedPoemIds || []), ...(remoteData.savedPoemIds || [])]))
        };
      }
      await setDoc(userRef, baseProfile, { merge: true });
    } catch (e) {
      console.warn('Failed to sync profile to Firestore', e);
    }
  }

  saveUserProfile(baseProfile);
  return baseProfile;
}

export function checkAndUpdateDailyStreak(): number {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = profile.lastActiveDate || '';

  if (lastActive === today) {
    return profile.streakDays;
  }

  const todayDate = new Date(today);
  const lastDate = new Date(lastActive);
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  let newStreak = profile.streakDays;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updated: UserProfile = {
    ...profile,
    streakDays: newStreak,
    lastActiveDate: today
  };
  saveUserProfile(updated);
  return newStreak;
}

export function toggleSavePoem(poemId: string): boolean {
  const profile = getUserProfile();
  const saved = new Set(profile.savedPoemIds || []);
  let isSaved = false;

  if (saved.has(poemId)) {
    saved.delete(poemId);
    isSaved = false;
  } else {
    saved.add(poemId);
    isSaved = true;
  }

  const updated = {
    ...profile,
    savedPoemIds: Array.from(saved)
  };
  saveUserProfile(updated);
  return isSaved;
}

// ---------------- GEMINI API KEY STORAGE ----------------

export function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(GEMINI_KEY);
  if (stored && stored.trim()) return stored.trim();

  const eduKey = (window as any).EDU_CONFIG?.geminiApiKey;
  if (eduKey && !eduKey.includes('PLACEHOLDER') && eduKey.trim()) return eduKey.trim();

  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;

  return "";
}

export function setGeminiKey(key: string): void {
  localStorage.setItem(GEMINI_KEY, key.trim());
}
