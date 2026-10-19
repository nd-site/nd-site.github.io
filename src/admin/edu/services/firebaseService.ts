import type { AdminUser, QuizRecord, Question, EduCategoriesConfig } from '../types';

declare global {
  interface Window {
    firebaseApp?: any;
    firebaseAuth?: any;
    firebaseFirestore?: any;
    canonicalAuth?: any;
    eduspaceAI?: any;
    ndAI_API?: any;
    mammoth?: any;
  }
}

export const DEFAULT_CATEGORIES: EduCategoriesConfig = {
  grades: ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Khác'],
  subjects: [
    'Toán',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Tin học',
    'Tiếng Anh',
    'Ngữ văn',
    'Lịch sử',
    'Địa lý',
    'GDKT&PL',
    'Công nghệ',
    'KHTN',
  ],
  examTypes: [
    'Kiểm tra thường xuyên',
    'Kiểm tra giữa kì',
    'Kiểm tra cuối kì',
    'Ôn tập',
    'Thi thử tốt nghiệp THPT',
    'Khảo sát chất lượng',
    'ĐGNL ĐHQGHN (HSA)',
    'ĐGNL ĐHQG-HCM (APT)',
    'ĐGTD ĐHBK Hà Nội (TSA)',
    'Học sinh giỏi / Olympic',
  ],
};

export async function getFirebaseInstance(): Promise<{
  auth: any;
  db: any;
}> {
  let auth = window.firebaseAuth;
  let db = window.firebaseFirestore;

  if (auth && db) {
    return { auth, db };
  }

  return new Promise((resolve) => {
    const handler = () => {
      resolve({
        auth: window.firebaseAuth,
        db: window.firebaseFirestore,
      });
    };
    window.addEventListener('firebase-ready', handler, { once: true });
    // Safety fallback timeout
    setTimeout(() => {
      resolve({
        auth: window.firebaseAuth,
        db: window.firebaseFirestore,
      });
    }, 2500);
  });
}

/**
 * Lắng nghe thay đổi xác thực và phân quyền Quản trị / Giáo viên
 */
export async function listenToAdminAuth(
  onState: (user: AdminUser | null, isAuthorized: boolean, error?: string) => void
): Promise<() => void> {
  const { auth, db } = await getFirebaseInstance();

  if (!auth) {
    onState(null, false, 'Không tìm thấy dịch vụ Firebase Auth.');
    return () => {};
  }

  const { onAuthStateChanged } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js' as any
  );
  const { doc, getDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const unsubscribe = onAuthStateChanged(auth, async (fbUser: any) => {
    if (!fbUser) {
      onState(null, false);
      return;
    }

    try {
      let isAuth = false;
      let userData: AdminUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'ND User',
        role: 'user',
        status: 'active',
      };

      // 1. Kiểm tra qua Canonical Auth profile nếu có
      if (
        window.canonicalAuth &&
        typeof window.canonicalAuth.getUserProfile === 'function'
      ) {
        const prof = window.canonicalAuth.getUserProfile();
        if (prof) {
          userData = { ...userData, ...prof };
          if (
            (prof.role === 'admin' ||
              prof.role === 'teacher' ||
              prof.eduRole === 'teacher' ||
              prof.adminLevel === 'owner') &&
            prof.status === 'active'
          ) {
            isAuth = true;
          }
        }
      }

      // 2. Tra cứu trực tiếp Firestore users/{uid} để đảm bảo tính xác thực 100%
      if (db) {
        try {
          const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (userSnap.exists()) {
            const u = userSnap.data();
            userData = {
              ...userData,
              ...u,
              uid: fbUser.uid,
              ndid: u.ndid || userData.ndid || fbUser.displayName || '',
              codeId: u.codeId || fbUser.uid,
              customGeminiKey: u.customGeminiKey || '',
            };
            const hasAdminRole =
              u.role === 'admin' ||
              u.role === 'teacher' ||
              u.eduRole === 'teacher' ||
              u.adminLevel === 'owner';
            const isActive = u.status === 'active' || !u.status;
            if (hasAdminRole && isActive) {
              isAuth = true;
            }
          }
        } catch (dbErr: any) {
          console.warn('Lỗi đọc Firestore users:', dbErr);
        }
      }

      onState(userData, isAuth);
    } catch (err: any) {
      console.error('Lỗi kiểm tra quyền Admin:', err);
      onState(null, false, err?.message || 'Lỗi kiểm tra quyền truy cập.');
    }
  });

  return unsubscribe;
}

/**
 * Tra cứu thông tin người dùng qua NDID để xác thực sự tồn tại và lấy CodeID chuẩn
 */
export async function lookupUserByNdid(ndid: string): Promise<{ exists: boolean; codeId?: string; ndid?: string; fullname?: string } | null> {
  if (!ndid || !ndid.trim()) return null;
  const trimmed = ndid.trim();

  const { db } = await getFirebaseInstance();
  if (!db) return null;

  try {
    const { collection, query, where, getDocs, limit, doc, getDoc } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
    );

    // 1. Kiểm tra collection 'ndids' nếu có
    try {
      const ndidSnap = await getDoc(doc(db, 'ndids', trimmed.toLowerCase()));
      if (ndidSnap.exists()) {
        const data = ndidSnap.data();
        const cid = data.codeId || data.uid;
        if (cid) {
          // Lấy user doc theo codeId để lấy NDID hiển thị chuẩn
          const uDoc = await getDoc(doc(db, 'users', cid));
          if (uDoc.exists()) {
            const uData = uDoc.data();
            return {
              exists: true,
              codeId: cid,
              ndid: uData.ndid || trimmed,
              fullname: uData.fullname || uData.displayName || '',
            };
          }
          return { exists: true, codeId: cid, ndid: trimmed };
        }
      }
    } catch (_) {}

    // 2. Tra cứu trực tiếp users collection bằng query ndid (case insensitive query via exact match)
    const q = query(collection(db, 'users'), where('ndid', '==', trimmed), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const uDoc = snap.docs[0];
      const uData = uDoc.data();
      return {
        exists: true,
        codeId: uData.codeId || uDoc.id,
        ndid: uData.ndid || trimmed,
        fullname: uData.fullname || uData.displayName || '',
      };
    }

    // 3. Fallback: Nếu trimmed là codeId (ví dụ 0000 hoặc số UID)
    const directDoc = await getDoc(doc(db, 'users', trimmed));
    if (directDoc.exists()) {
      const uData = directDoc.data();
      return {
        exists: true,
        codeId: uData.codeId || directDoc.id,
        ndid: uData.ndid || trimmed,
        fullname: uData.fullname || uData.displayName || '',
      };
    }

    return { exists: false };
  } catch (e) {
    console.warn('Lỗi tra cứu user theo NDID:', e);
    return null;
  }
}

/**
 * Tra cứu danh sách NDID mới nhất từ mảng CodeID
 */
export async function resolveCodeIdsToNdids(codeIds: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!codeIds || codeIds.length === 0) return result;

  const { db } = await getFirebaseInstance();
  if (!db) return result;

  try {
    const { doc, getDoc } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
    );

    await Promise.all(
      codeIds.map(async (cid) => {
        try {
          const uDoc = await getDoc(doc(db, 'users', cid));
          if (uDoc.exists()) {
            const data = uDoc.data();
            result[cid] = data.ndid || cid;
          } else {
            result[cid] = cid;
          }
        } catch (_) {
          result[cid] = cid;
        }
      })
    );
  } catch (_) {}
  return result;
}

/**
 * Kiểm tra quyền sửa đề: CHỈ Người tạo HOẶC Cộng tác viên mới có quyền sửa.
 * ADMIN KHÔNG CÓ QUYỀN SỬA ĐỀ (chỉ có quyền duyệt, gắn hot, xóa).
 */
export function canUserEditQuiz(user: AdminUser | null, quiz: QuizRecord): boolean {
  if (!user) return false;
  const userCid = user.codeId || user.uid;
  const userNdid = user.ndid ? user.ndid.toLowerCase() : '';

  // 1. Kiểm tra theo CodeID của người tạo
  if (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) return true;
  if (quiz.creatorUid && user.uid && quiz.creatorUid === user.uid) return true;
  if (quiz.creatorNdid && userNdid && quiz.creatorNdid.toLowerCase() === userNdid) return true;

  // 2. Kiểm tra theo danh sách cộng tác viên (CodeID ưu tiên, sau đó fallback NDID)
  if (Array.isArray(quiz.collaboratorCodeIds) && userCid) {
    if (quiz.collaboratorCodeIds.includes(userCid)) return true;
  }
  if (Array.isArray(quiz.collaborators) && (userNdid || user.uid)) {
    if (quiz.collaborators.some((c) => {
      const cStr = String(c).trim().toLowerCase();
      return cStr === userNdid || c === user.uid || c === userCid;
    })) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra quyền xem đề trong danh sách quản lý:
 * - Admin/Owner: Thấy tất cả các đề tại trang Admin.
 * - Giáo viên / Người dùng: Chỉ thấy đề do mình tạo hoặc được thêm làm cộng tác viên.
 */
export function canUserSeeQuizInList(user: AdminUser | null, quiz: QuizRecord, isAdminView = false): boolean {
  if (!user) return false;
  if (isAdminView) {
    const isSysAdmin = user.adminLevel === 'owner' || user.role === 'admin' || user.adminLevel === 'admin';
    if (isSysAdmin) return true;
  }
  // Tại trang giáo viên hoặc view cá nhân: chỉ người tạo hoặc cộng tác mới thấy
  const userCid = user.codeId || user.uid;
  const userNdid = user.ndid ? user.ndid.toLowerCase() : '';

  if (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) return true;
  if (quiz.creatorUid && user.uid && quiz.creatorUid === user.uid) return true;
  if (quiz.creatorNdid && userNdid && quiz.creatorNdid.toLowerCase() === userNdid) return true;

  if (Array.isArray(quiz.collaboratorCodeIds) && userCid && quiz.collaboratorCodeIds.includes(userCid)) {
    return true;
  }
  if (Array.isArray(quiz.collaborators) && (userNdid || user.uid)) {
    if (quiz.collaborators.some((c) => {
      const cStr = String(c).trim().toLowerCase();
      return cStr === userNdid || c === user.uid || c === userCid;
    })) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra quyền làm bài thi:
 * - Nếu đề 'all' (Tất cả mọi người): ai cũng làm được.
 * - Nếu đề 'restricted' (Chỉ định người làm): Người dùng phải đăng nhập và có CodeID nằm trong allowedCodeIds,
 *   hoặc là người tạo / cộng tác viên.
 */
export function canUserTakeQuiz(user: AdminUser | { uid: string; ndid?: string; codeId?: string } | null, quiz: QuizRecord): boolean {
  const accessType = quiz.accessType || quiz.quizData?.accessType || 'all';
  if (accessType === 'all') return true;

  if (!user) return false;
  const userCid = user.codeId || user.uid;
  const userNdid = user.ndid ? user.ndid.toLowerCase() : '';

  // Người tạo và cộng tác viên luôn có quyền làm bài
  if (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) return true;
  if (quiz.creatorUid && user.uid && quiz.creatorUid === user.uid) return true;
  if (quiz.creatorNdid && userNdid && quiz.creatorNdid.toLowerCase() === userNdid) return true;
  if (Array.isArray(quiz.collaboratorCodeIds) && userCid && quiz.collaboratorCodeIds.includes(userCid)) return true;

  // Kiểm tra danh sách allowedCodeIds
  const allowed = quiz.allowedCodeIds || quiz.quizData?.allowedCodeIds || [];
  if (Array.isArray(allowed) && userCid && allowed.includes(userCid)) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra quyền xem đề: Công khai/Không công khai HOẶC Owner/Admin HOẶC người tạo HOẶC nằm trong viewers/collaborators
 */
export function canUserViewQuiz(user: AdminUser | null, quiz: QuizRecord): boolean {
  if (quiz.visibility === 'public' || quiz.visibility === 'unlisted' || !quiz.visibility) {
    return true;
  }
  if (!user) return false;
  if (user.adminLevel === 'owner' || user.role === 'admin' || user.adminLevel === 'admin') {
    return true;
  }
  const userCid = user.codeId || user.uid;
  if (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) return true;
  if (quiz.creatorUid && quiz.creatorUid === user.uid) return true;
  if (quiz.creatorNdid && user.ndid && quiz.creatorNdid.toLowerCase() === user.ndid.toLowerCase()) {
    return true;
  }
  if (Array.isArray(quiz.collaboratorCodeIds) && userCid && quiz.collaboratorCodeIds.includes(userCid)) {
    return true;
  }
  if (Array.isArray(quiz.collaborators) && user.ndid) {
    if (quiz.collaborators.some((c) => c.toLowerCase() === user.ndid?.toLowerCase() || c === user.uid)) {
      return true;
    }
  }
  if (Array.isArray(quiz.viewers) && user.ndid) {
    if (quiz.viewers.some((v) => v.toLowerCase() === user.ndid?.toLowerCase() || v === user.uid)) {
      return true;
    }
  }
  return false;
}

/**
 * Kiểm tra quyền nhận xét/góp ý đề thi: Owner/Admin HOẶC người tạo HOẶC cộng tác viên HOẶC nằm trong commenters
 */
export function canUserCommentQuiz(user: AdminUser | null, quiz: QuizRecord): boolean {
  if (!user) return false;
  if (user.adminLevel === 'owner' || user.role === 'admin' || user.adminLevel === 'admin') {
    return true;
  }
  const userCid = user.codeId || user.uid;
  if (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) return true;
  if (quiz.creatorUid && quiz.creatorUid === user.uid) return true;
  if (quiz.creatorNdid && user.ndid && quiz.creatorNdid.toLowerCase() === user.ndid.toLowerCase()) {
    return true;
  }
  if (Array.isArray(quiz.collaboratorCodeIds) && userCid && quiz.collaboratorCodeIds.includes(userCid)) {
    return true;
  }
  if (Array.isArray(quiz.collaborators) && user.ndid) {
    if (quiz.collaborators.some((c) => c.toLowerCase() === user.ndid?.toLowerCase() || c === user.uid)) {
      return true;
    }
  }
  if (Array.isArray(quiz.commenters) && user.ndid) {
    if (quiz.commenters.some((c) => c.toLowerCase() === user.ndid?.toLowerCase() || c === user.uid)) {
      return true;
    }
  }
  return false;
}

/**
 * Kiểm tra quyền xóa đề: Owner/Admin được xóa tất cả; Giáo viên chỉ xóa đề do mình tạo
 */
export function canUserDeleteQuiz(user: AdminUser | null, quiz: QuizRecord): boolean {
  if (!user) return false;
  if (user.adminLevel === 'owner' || user.role === 'admin' || user.adminLevel === 'admin') {
    return true;
  }
  const userCid = user.codeId || user.uid;
  return Boolean(
    (quiz.creatorCodeId && userCid && quiz.creatorCodeId === userCid) ||
    (quiz.creatorUid && quiz.creatorUid === user.uid) ||
    (quiz.creatorNdid && user.ndid && quiz.creatorNdid.toLowerCase() === user.ndid.toLowerCase())
  );
}

/**
 * ĐĂNG KÝ THEO DÕI REALTIME DANH MỤC HỆ THỐNG (Khối lớp, Môn học, Loại bài kiểm tra)
 */
export async function subscribeToCategoriesRealtime(
  onUpdate: (cat: EduCategoriesConfig) => void,
  onError?: (err: Error) => void
): Promise<() => void> {
  const { db } = await getFirebaseInstance();
  if (!db) {
    onUpdate(DEFAULT_CATEGORIES);
    return () => {};
  }

  const { doc, onSnapshot } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const catDocRef = doc(db, 'system_config', 'edu_categories');

  const unsubscribe = onSnapshot(
    catDocRef,
    (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate({
          grades: Array.isArray(data.grades) && data.grades.length > 0 ? data.grades : DEFAULT_CATEGORIES.grades,
          subjects: Array.isArray(data.subjects) && data.subjects.length > 0 ? data.subjects : DEFAULT_CATEGORIES.subjects,
          examTypes: Array.isArray(data.examTypes) && data.examTypes.length > 0 ? data.examTypes : DEFAULT_CATEGORIES.examTypes,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      } else {
        onUpdate(DEFAULT_CATEGORIES);
      }
    },
    (err: any) => {
      console.warn('Lỗi lắng nghe danh mục edu_categories:', err);
      onUpdate(DEFAULT_CATEGORIES);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Lưu danh mục hệ thống lên Firestore (Chỉ dành cho Owner/Admin)
 */
export async function saveCategoriesToFirestore(
  config: EduCategoriesConfig,
  updatedByNdid?: string
): Promise<void> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, setDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  await setDoc(
    doc(db, 'system_config', 'edu_categories'),
    {
      grades: config.grades,
      subjects: config.subjects,
      examTypes: config.examTypes,
      updatedAt: serverTimestamp(),
      updatedBy: updatedByNdid || 'Admin',
    },
    { merge: true }
  );
}

/**
 * Đọc cấu hình AI từ Firestore (system_config/ai_config)
 */
export async function getAIConfig(): Promise<{ geminiApiKey: string; updatedAt?: any; updatedBy?: string } | null> {
  const { db } = await getFirebaseInstance();
  if (!db) return null;

  const { doc, getDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const snap = await getDoc(doc(db, 'system_config', 'ai_config'));
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (e) {
    console.warn('Lỗi đọc AI config:', e);
    return null;
  }
}

/**
 * Lưu cấu hình AI lên Firestore (Chỉ dành cho Owner/Admin)
 */
export async function saveAIConfig(
  geminiApiKey: string,
  updatedByNdid?: string
): Promise<void> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, setDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  await setDoc(
    doc(db, 'system_config', 'ai_config'),
    {
      geminiApiKey: geminiApiKey.trim(),
      updatedAt: serverTimestamp(),
      updatedBy: updatedByNdid || 'Admin',
    },
    { merge: true }
  );
}

/**
 * ĐĂNG KÝ THEO DÕI REALTIME KHO ĐỀ THI FIRESTORE
 * Tự động cập nhật danh sách ngay khi có bất kỳ thay đổi nào từ DB!
 */
export async function subscribeToQuizzesRealtime(
  onUpdate: (quizzes: QuizRecord[]) => void,
  onError?: (err: Error) => void
): Promise<() => void> {
  const { db } = await getFirebaseInstance();
  if (!db) {
    if (onError) onError(new Error('Firestore chưa được khởi tạo.'));
    return () => {};
  }

  const { collection, onSnapshot } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const colRef = collection(db, 'quizzes');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot: any) => {
      const records: QuizRecord[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        let item: QuizRecord = {
          id: docSnap.id,
          _docId: docSnap.id,
          ...data,
        };

        // AUTO-HEAL: Nếu đề chưa có người tạo hoặc có nơi tạo EduSpace by ND Labs
        let needsHeal = false;
        const updates: any = {};

        if (!item.creatorCodeId && !item.creatorUid && !item.creatorNdid) {
          item.creatorCodeId = '0000';
          item.creatorUid = '0000';
          item.creatorNdid = '0000';
          item.author = item.author || 'Nhật Đăng - Admin';
          item.school = item.school || 'EduND by ND Labs';
          updates.creatorCodeId = '0000';
          updates.creatorUid = '0000';
          updates.creatorNdid = '0000';
          updates.author = item.author;
          updates.school = item.school;
          needsHeal = true;
        }

        if (item.school === 'EduSpace by ND Labs' || !item.school) {
          item.school = 'EduND by ND Labs';
          updates.school = 'EduND by ND Labs';
          needsHeal = true;
        }

        if (needsHeal) {
          try {
            const { doc, updateDoc } = require && typeof window !== 'undefined'
              ? (window as any).firestoreModules || {}
              : {};
            // Background passive update if permission allows
            docSnap.ref?.update?.(updates).catch(() => {});
          } catch (_) {}
        }

        records.push(item);
      });

      // Sắp xếp đề mới nhất lên trước
      records.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      onUpdate(records);
    },
    (err: any) => {
      console.warn('Lỗi Firestore onSnapshot quizzes:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Đệ quy loại bỏ tất cả các trường có giá trị `undefined`
 * Firestore sẽ quăng lỗi "Function setDoc() called with invalid data. Unsupported field value: undefined"
 * nếu có bất kỳ property nào có value undefined trong object/nested array.
 */
export function sanitizeForFirestore<T = any>(val: T): T {
  if (val === undefined) {
    return null as any;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  // Giữ nguyên serverTimestamp và FieldValue
  if ((val as any)?._methodName || (val as any)?.constructor?.name === 'FieldValue') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: any = {};
  for (const [key, value] of Object.entries(val)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj;
}

/**
 * Xuất bản đề thi trực tiếp lên Firestore
 */
export async function publishQuizToFirestore(
  quizRecord: QuizRecord,
  user?: AdminUser | null
): Promise<void> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng kết nối.');

  const { doc, setDoc, getDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const targetId = quizRecord.id.toUpperCase();
  const docRef = doc(db, 'quizzes', targetId);

  // Đọc dữ liệu cũ nếu có để bảo toàn trạng thái hot/verified nếu không phải admin
  let existingData: any = {};
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (_) {}

  const isAdmin =
    user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';

  // Thời gian làm bài hiển thị theo cấu hình ma trận kiểm tra
  const matrixMins =
    quizRecord.matrixDuration ||
    quizRecord.quizData?.matrixDuration ||
    quizRecord.quizData?.examStructure?.matrixDuration ||
    quizRecord.duration ||
    45;
  const fullMins =
    quizRecord.fullDuration ||
    quizRecord.quizData?.fullDuration ||
    quizRecord.quizData?.examStructure?.fullDuration ||
    90;

  const schoolName =
    quizRecord.school?.trim() ||
    existingData.school ||
    'EduND by ND Labs';

  const docPayload: any = {
    id: targetId,
    creatorUid: existingData.creatorUid || quizRecord.creatorUid || user?.uid || '0000',
    creatorNdid: existingData.creatorNdid || quizRecord.creatorNdid || user?.ndid || '0000',
    creatorCodeId: existingData.creatorCodeId || quizRecord.creatorCodeId || user?.codeId || user?.uid || '0000',
    author: quizRecord.author !== undefined ? quizRecord.author : (existingData.author || 'Nhật Đăng - Admin'),
    school: schoolName === 'EduSpace by ND Labs' ? 'EduND by ND Labs' : schoolName,
    collaborators: Array.isArray(quizRecord.collaborators)
      ? quizRecord.collaborators
      : existingData.collaborators || [],
    collaboratorCodeIds: Array.isArray(quizRecord.collaboratorCodeIds)
      ? quizRecord.collaboratorCodeIds
      : existingData.collaboratorCodeIds || [],
    accessType: quizRecord.accessType || existingData.accessType || 'all',
    allowedCodeIds: Array.isArray(quizRecord.allowedCodeIds)
      ? quizRecord.allowedCodeIds
      : existingData.allowedCodeIds || [],
    viewers: Array.isArray(quizRecord.viewers)
      ? quizRecord.viewers
      : existingData.viewers || [],
    commenters: Array.isArray(quizRecord.commenters)
      ? quizRecord.commenters
      : existingData.commenters || [],
    comments: Array.isArray(quizRecord.comments)
      ? quizRecord.comments
      : existingData.comments || [],
    title: quizRecord.title,
    description: quizRecord.description || '',
    grade: quizRecord.grade || quizRecord.class || '',
    class: quizRecord.class || quizRecord.grade || '',
    subject: quizRecord.subject || '',
    examType: quizRecord.examType || existingData.examType || '',
    duration: matrixMins, // Lấy theo ma trận kiểm tra
    matrixDuration: matrixMins,
    fullDuration: fullMins,
    tag: quizRecord.tag || '',
    // Quyền hot và verified chỉ admin được sửa; giáo viên thì giữ nguyên
    isHot: isAdmin ? Boolean(quizRecord.isHot) : Boolean(existingData.isHot),
    isComingSoon: isAdmin ? Boolean(quizRecord.isComingSoon) : Boolean(existingData.isComingSoon),
    isVerified: isAdmin ? Boolean(quizRecord.isVerified) : Boolean(existingData.isVerified),
    verifiedAt: existingData.verifiedAt || (quizRecord.isVerified ? serverTimestamp() : null),
    verifiedBy: existingData.verifiedBy || (quizRecord.isVerified ? user?.ndid || 'Admin' : null),
    visibility: quizRecord.visibility || existingData.visibility || 'public',
    passages: Array.isArray(quizRecord.passages) ? quizRecord.passages : [],
    quizData: {
      ...quizRecord.quizData,
      school: schoolName === 'EduSpace by ND Labs' ? 'EduND by ND Labs' : schoolName,
      creatorCodeId: existingData.creatorCodeId || quizRecord.creatorCodeId || user?.codeId || user?.uid || '0000',
      collaboratorCodeIds: quizRecord.collaboratorCodeIds || existingData.collaboratorCodeIds || [],
      accessType: quizRecord.accessType || existingData.accessType || 'all',
      allowedCodeIds: quizRecord.allowedCodeIds || existingData.allowedCodeIds || [],
      duration: matrixMins,
      matrixDuration: matrixMins,
      fullDuration: fullMins,
      visibility: quizRecord.visibility || existingData.visibility || 'public',
      examType: quizRecord.examType || '',
      passages: quizRecord.passages || [],
      collaborators: quizRecord.collaborators || [],
      viewers: quizRecord.viewers || [],
      commenters: quizRecord.commenters || [],
      comments: quizRecord.comments || [],
    },
    createdAt: existingData.createdAt || quizRecord.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const cleanPayload = sanitizeForFirestore(docPayload);
  await setDoc(docRef, cleanPayload, { merge: true });
}

/**
 * Gắn hoặc hủy thẻ Nổi bật (Hot) - Chỉ dành cho Owner/Admin
 */
export async function toggleQuizHot(quizId: string, currentVal: boolean): Promise<boolean> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, updateDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const newVal = !currentVal;
  await updateDoc(doc(db, 'quizzes', quizId.toUpperCase()), {
    isHot: newVal,
    updatedAt: serverTimestamp(),
  });
  return newVal;
}

/**
 * Gắn hoặc hủy thẻ Đã kiểm duyệt (Verified) - Chỉ dành cho Owner/Admin
 */
export async function toggleQuizVerified(
  quizId: string,
  currentVal: boolean,
  adminNdid: string
): Promise<boolean> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, updateDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const newVal = !currentVal;
  await updateDoc(doc(db, 'quizzes', quizId.toUpperCase()), {
    isVerified: newVal,
    verifiedAt: newVal ? serverTimestamp() : null,
    verifiedBy: newVal ? adminNdid : null,
    updatedAt: serverTimestamp(),
  });
  return newVal;
}

/**
 * Xóa đề thi khỏi Firestore
 */
export async function deleteQuizFromFirestore(id: string): Promise<void> {
  const { auth, db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, getDoc, deleteDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const uppercaseId = id.toUpperCase();
  let snap = await getDoc(doc(db, 'quizzes', uppercaseId));
  if (!snap.exists()) {
    snap = await getDoc(doc(db, 'quizzes', id));
  }

  if (snap.exists() && snap.data()?.eduspaceV3) {
    const signedInUser = auth?.currentUser;
    if (!signedInUser) throw new Error('Vui lòng đăng nhập tài khoản quản trị.');
    const apiBase = 'https://nd-puce.vercel.app';
    const response = await fetch(
      `${apiBase}/api/v3/admin/quizzes/${encodeURIComponent(snap.id)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${await signedInUser.getIdToken()}` },
      }
    );
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Không thể xóa đề V3.');
    }
  } else if (snap.exists()) {
    await deleteDoc(doc(db, 'quizzes', snap.id));
  }

  // Xóa doc legacy trong eduspace_lessons nếu có
  try {
    await deleteDoc(doc(db, 'eduspace_lessons', id.toLowerCase()));
  } catch (_) {}
}

/**
 * Tải chi tiết một đề thi theo ID
 */
export async function fetchQuizById(id: string): Promise<QuizRecord | null> {
  const { db } = await getFirebaseInstance();
  if (!db) return null;

  const { doc, getDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  let snap = await getDoc(doc(db, 'quizzes', id.toUpperCase()));
  if (!snap.exists()) {
    snap = await getDoc(doc(db, 'quizzes', id));
  }

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as QuizRecord;
}

/**
 * Cập nhật khóa cá nhân Gemini API Key vào tài khoản người dùng
 */
export async function saveUserGeminiKey(uid: string, key: string): Promise<void> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, updateDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  await updateDoc(doc(db, 'users', uid), {
    customGeminiKey: key.trim(),
  });
}

/**
 * Chuyển các đề thi V3 cũ vào kho dùng chung
 */
export async function migrateOldV3Exams(): Promise<{
  scanned: number;
  migrated: number;
  conflicts: number;
  failed: number;
}> {
  const { auth } = await getFirebaseInstance();
  const signedInUser = auth?.currentUser;
  if (!signedInUser) {
    throw new Error('Vui lòng đăng nhập tài khoản quản trị.');
  }

  const idToken = await signedInUser.getIdToken();
  const apiBase = 'https://nd-puce.vercel.app';
  const report = { scanned: 0, migrated: 0, conflicts: 0, failed: 0 };
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${apiBase}/api/v3/admin/migrate-shared-quizzes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cursor, pageSize: 5 }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Không thể chuyển dữ liệu.');
    }

    report.scanned += result.report.scanned || 0;
    report.migrated += result.report.migrated || 0;
    report.conflicts += result.report.conflicts?.length || 0;
    report.failed += result.report.failed?.length || 0;
    cursor = result.report.nextCursor;
    hasMore = result.report.hasMore;
  }

  return report;
}

/**
 * Thêm nhận xét / góp ý cho đề thi
 */
export async function addQuizComment(quizId: string, comment: import('../types').ExamComment): Promise<void> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { doc, getDoc, updateDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const targetDoc = doc(db, 'quizzes', quizId.toUpperCase());
  const snap = await getDoc(targetDoc);
  if (!snap.exists()) throw new Error('Không tìm thấy đề thi.');

  const existingComments = snap.data().comments || [];
  const updatedComments = [...existingComments, comment];

  await updateDoc(targetDoc, {
    comments: updatedComments,
    'quizData.comments': updatedComments,
  });
}

/**
 * Lưu câu hỏi vào Ngân hàng câu hỏi dùng chung
 */
export async function saveQuestionToBank(
  item: Omit<import('../types').QuestionBankItem, 'id' | 'createdAt'>
): Promise<string> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const { collection, addDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const docRef = await addDoc(collection(db, 'question_bank'), {
    ...item,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Tải danh sách câu hỏi từ Ngân hàng câu hỏi
 */
export async function fetchQuestionBank(
  subject?: string,
  grade?: string
): Promise<import('../types').QuestionBankItem[]> {
  const { db } = await getFirebaseInstance();
  if (!db) return [];

  const { collection, getDocs, query, orderBy, limit } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const q = query(collection(db, 'question_bank'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const results: import('../types').QuestionBankItem[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (subject && data.subject && data.subject !== subject) return;
      if (grade && data.grade && data.grade !== grade) return;
      results.push({
        id: docSnap.id,
        ...data,
      });
    });

    return results;
  } catch (err: any) {
    console.warn('Lỗi đọc ngân hàng câu hỏi:', err);
    return [];
  }
}

/**
 * Đếm số lần học sinh đã làm đề thi
 */
export async function getStudentAttemptCount(examId: string, studentNdid: string): Promise<number> {
  const { db } = await getFirebaseInstance();
  if (!db || !examId || !studentNdid) return 0;

  const { collection, getDocs, query, where } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const q = query(
      collection(db, 'edu_submissions'),
      where('examId', '==', examId.toUpperCase()),
      where('studentNdid', '==', studentNdid)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.warn('Lỗi đếm số lượt thi:', err);
    return 0;
  }
}

/**
 * Lưu bài làm của học sinh (gồm điểm, câu trả lời, nhật ký giám sát)
 */
export async function submitStudentExam(data: Omit<import('../types').StudentSubmissionRecord, 'id' | 'submittedAt'>): Promise<string> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Cơ sở dữ liệu chưa sẵn sàng');

  const { collection, addDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const docRef = await addDoc(collection(db, 'edu_submissions'), {
    ...data,
    examId: data.examId.toUpperCase(),
    submittedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Tải danh sách bài làm của một đề thi (dành cho Giáo viên & Bảng xếp hạng)
 */
export async function fetchSubmissionsByExam(examId: string): Promise<import('../types').StudentSubmissionRecord[]> {
  const { db } = await getFirebaseInstance();
  if (!db || !examId) return [];

  const { collection, getDocs, query, where, orderBy, limit } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const q = query(
      collection(db, 'edu_submissions'),
      where('examId', '==', examId.toUpperCase()),
      limit(200)
    );
    const snap = await getDocs(q);
    const results: import('../types').StudentSubmissionRecord[] = [];
    snap.forEach((docSnap: any) => {
      results.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    // Sắp xếp điểm cao nhất trước
    results.sort((a, b) => b.score10 - a.score10);
    return results;
  } catch (err) {
    console.warn('Lỗi tải bài làm học sinh:', err);
    return [];
  }
}

/**
 * Tải danh sách lớp học của giáo viên hoặc học sinh
 */
export async function fetchClassGroups(
  userNdid?: string,
  isTeacher = true,
  includePublic = false
): Promise<import('../types').ClassGroupRecord[]> {
  const { db } = await getFirebaseInstance();
  if (!db) return [];

  const { collection, getDocs, query, where, orderBy } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const colRef = collection(db, 'edu_classes');
    const snap = await getDocs(colRef);
    const list: import('../types').ClassGroupRecord[] = [];

    snap.forEach((docSnap: any) => {
      const data = docSnap.data();
      const item: import('../types').ClassGroupRecord = {
        id: docSnap.id,
        ...data,
      };

      const myNdid = (userNdid || '').toLowerCase().trim();
      const teacherNdid = (data.teacherNdid || '').toLowerCase().trim();
      const studentNdids = Array.isArray(data.studentNdids)
        ? data.studentNdids.map((n: string) => String(n).toLowerCase().trim())
        : [];

      if (isTeacher) {
        if (!userNdid || teacherNdid === myNdid) {
          list.push(item);
        }
      } else {
        // Học sinh: lấy các lớp mình đã tham gia, hoặc các lớp công khai
        const isJoined = myNdid && studentNdids.includes(myNdid);
        const isPublic = item.visibility === 'public';
        if (isJoined || (includePublic && isPublic)) {
          list.push(item);
        }
      }
    });

    return list;
  } catch (err) {
    console.warn('Lỗi đọc lớp học từ Firestore:', err);
    return [];
  }
}

/**
 * Tra cứu thông tin 1 lớp học theo ID
 */
export async function fetchClassGroupById(classId: string): Promise<import('../types').ClassGroupRecord | null> {
  const { db } = await getFirebaseInstance();
  if (!db || !classId) return null;

  const { doc, getDoc } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  try {
    const snap = await getDoc(doc(db, 'edu_classes', classId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as import('../types').ClassGroupRecord;
    }
  } catch (err) {
    console.warn('Lỗi đọc lớp học theo ID:', err);
  }
  return null;
}

/**
 * Tạo hoặc cập nhật lớp học
 */
export async function saveClassGroup(
  classData: Partial<import('../types').ClassGroupRecord>,
  classId?: string
): Promise<string> {
  const { db } = await getFirebaseInstance();
  if (!db) throw new Error('Cơ sở dữ liệu chưa sẵn sàng.');

  const { collection, doc, setDoc, addDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
  );

  const payload: any = {
    ...classData,
    visibility: classData.visibility || 'public',
    updatedAt: serverTimestamp(),
  };

  if (classId) {
    const ref = doc(db, 'edu_classes', classId);
    await setDoc(ref, payload, { merge: true });
    return classId;
  } else {
    // Generate clean unique joinCode if not provided
    if (!payload.joinCode) {
      payload.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'edu_classes'), payload);
    return ref.id;
  }
}


