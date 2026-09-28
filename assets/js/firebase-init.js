/**
 * EduSpace — Firebase SDK Initializer (Khởi tạo dịch vụ đám mây Firebase)
 * 
 * Tác dụng:
 *   • Sử dụng Firebase Modular SDK để kết nối với cơ sở dữ liệu và xác thực người dùng toàn trang.
 *   • Đọc cấu hình bảo mật động từ `config.js` để tự động khởi tạo Firebase App, Auth và Realtime Database.
 *   • Theo dõi trạng thái đăng nhập của thành viên để đồng bộ ảnh đại diện và biệt danh hiển thị trên thanh navbar (`nd-navbar`).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, query, collection, orderBy, limit, getDocs, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function initEduFirebase() {
    if (typeof EDU_CONFIG === 'undefined') {
        console.error("EDU_CONFIG is missing. Cannot init Firebase.");
        return;
    }

    // Tải khóa động từ getEduKeys() để hỗ trợ cả biến môi trường .env trên localhost
    const keys = await getEduKeys();

    const firebaseConfig = {
        apiKey: keys.firebase || EDU_CONFIG.firebaseApiKey,
        authDomain: keys.fbAuthDomain || EDU_CONFIG.firebaseAuthDomain,
        databaseURL: keys.fbDatabaseURL || EDU_CONFIG.firebaseDatabaseURL,
        projectId: keys.fbProjectId || EDU_CONFIG.firebaseProjectId,
        storageBucket: keys.fbStorageBucket || EDU_CONFIG.firebaseStorageBucket,
        messagingSenderId: keys.fbMessagingSenderId || EDU_CONFIG.firebaseMessagingSenderId,
        appId: keys.fbAppId || EDU_CONFIG.firebaseAppId,
        measurementId: keys.fbMeasurementId || EDU_CONFIG.firebaseMeasurementId
    };

    // If the build-time placeholders were not replaced (common on non-deployed forks),
    // avoid calling initializeApp with invalid credentials which causes 400/403 errors.
    const effectiveApiKey = keys.firebase || EDU_CONFIG.firebaseApiKey;
    const effectiveAppId = keys.fbAppId || EDU_CONFIG.firebaseAppId;
    if (!isSet(effectiveApiKey) || !isSet(effectiveAppId)) {
        console.warn('Firebase credentials missing or contain placeholders. Skipping Firebase initialization.');
        window.dispatchEvent(new Event('firebase-missing'));
        return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);
        const firestore = getFirestore(app);

        // Export to window
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseFirestore = firestore;
        window.signInWithCustomToken = signInWithCustomToken;
        window.onAuthStateChanged = onAuthStateChanged;
        window.doc = doc;
        window.getDoc = getDoc;

        // Bridge helper methods onto auth instance for universal compat
        if (!auth.onAuthStateChanged) {
            auth.onAuthStateChanged = (cb) => onAuthStateChanged(auth, cb);
        }
        if (!auth.signOut) {
            auth.signOut = async () => {
                const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
                return signOut(auth);
            };
        }

        // Auto sync user role & profile with nd-navbar on every page load
        // Luôn fetch role mới nhất từ Firestore để tránh dữ liệu localStorage cũ
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Nếu cả nd_user, nd_accounts và canonical session đều không tồn tại -> người dùng đã chủ động đăng xuất
                const localUser = localStorage.getItem('nd_user');
                const localAccounts = localStorage.getItem('nd_accounts');
                const canonicalSession = sessionStorage.getItem('nd_canonical_session_id');
                if (!localUser && !localAccounts && !canonicalSession) {
                    try {
                        const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
                        await signOut(auth);
                    } catch (_) {}
                    return;
                }

                // ─── Lấy role thật từ Firestore /users/{uid} ───────────────────────
                let role = 'member', eduRole = '', ndid = '', fullname = '', photoURL = '', grade = 'Khác', yob = null, codeId = '', customGeminiKey = '';
                try {
                    const snap = await getDoc(doc(firestore, 'users', user.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        const rawRole = data.role || 'student';
                        const rawSubrole = data.subrole || '';

                        // Parse ND Labs Role (global)
                        if (rawRole === 'admin') {
                            role = 'admin';
                        } else {
                            role = 'member';
                        }

                        // Parse EduSpace Role (học tập)
                        eduRole = data.eduRole || '';
                        if (!eduRole) {
                            if (rawRole === 'admin') {
                                eduRole = rawSubrole || 'student';
                            } else if (rawRole === 'teacher') {
                                eduRole = 'teacher';
                            } else {
                                eduRole = 'student';
                            }
                        }

                        ndid     = data.ndid     || '';
                        fullname = data.fullname || '';
                        photoURL = data.photoURL || user.photoURL || '';
                        grade    = data.grade    || 'Khác';
                        yob      = data.yob      || null;
                        codeId   = data.codeId   || user.uid;
                        customGeminiKey = data.customGeminiKey || '';
                    }
                } catch (e) {
                    // Nếu offline/lỗi mạng → dùng dữ liệu cũ từ localStorage
                    try {
                        const raw = localStorage.getItem('nd_user');
                        if (raw) {
                            const old = JSON.parse(raw);
                            role     = old.role     || 'member';
                            eduRole  = old.eduRole  || 'student';
                            ndid     = old.ndid     || '';
                            fullname = old.displayName || old.fullname || '';
                            photoURL = old.photoURL || user.photoURL || '';
                            grade    = old.grade    || 'Khác';
                            yob      = old.yob      || null;
                            codeId   = old.codeId   || '';
                            customGeminiKey = old.customGeminiKey || '';
                        }
                    } catch (_) {}
                }

                // If ndid not loaded yet, show loading state – do NOT fallback to displayName or email
                if (!ndid) ndid = 'Đang tải...';
                if (!fullname) fullname = user.displayName || 'ND Member';
                if (!photoURL) photoURL = user.photoURL || '/assets/images/logo.png';

                // ─── Lưu session đầy đủ vào localStorage ───────────────────────────
                const sessionData = {
                    uid:         user.uid,
                    ndid:        ndid,
                    displayName: fullname,
                    email:       user.email || '',
                    photoURL:    photoURL,
                    role:        role,
                    eduRole:     eduRole,
                    grade:       grade,
                    yob:         yob,
                    codeId:      codeId,
                    customGeminiKey: customGeminiKey
                };
                localStorage.setItem('nd_user', JSON.stringify(sessionData));

                // ─── Re-render #nd-navbar-user với đúng role ────────────────────────
                const userSection = document.getElementById('nd-navbar-user');
                if (userSection) {
                    const roleCfg = {
                        admin:   { cls: 'role-admin',   label: 'Admin' },
                        teacher: { cls: 'role-teacher', label: 'GV' },
                        student: { cls: 'role-student', label: 'HS' },
                        member:  { cls: 'role-other',   label: 'TV' }
                    };

                    let badges = [];
                    if (role === 'admin') {
                        badges.push(`<span class="nd-role-badge ${roleCfg.admin.cls}">${roleCfg.admin.label}</span>`);
                    }
                    if (eduRole === 'teacher') {
                        badges.push(`<span class="nd-role-badge ${roleCfg.teacher.cls}">${roleCfg.teacher.label}</span>`);
                    } else if (eduRole === 'student') {
                        badges.push(`<span class="nd-role-badge ${roleCfg.student.cls}">${roleCfg.student.label}</span>`);
                    }
                    if (badges.length === 0) {
                        badges.push(`<span class="nd-role-badge ${roleCfg.member.cls}">${roleCfg.member.label}</span>`);
                    }
                    const roleBadgeHtml = badges.join('');

                    const adminLink = role === 'admin'
                        ? `<a href="/admin/" class="nd-nav-link" style="color: #0070f3;" title="Bảng quản trị Admin">
                               <i class="ph-bold ph-shield-checkered"></i><span class="nd-lbl">Admin</span>
                           </a>
                           <button id="nd-admin-reload-btn" class="nd-nav-link" style="color: #ef4444; border: none; background: transparent; cursor: pointer; padding: 5px 12px;" title="Yêu cầu tải lại trang cho tất cả">
                               <i class="ph-bold ph-arrows-clockwise"></i><span class="nd-lbl">Tải lại</span>
                           </button>`
                        : '';

                    userSection.innerHTML = `
                        ${adminLink}
                        <a href="/auth/settings/" class="nd-nav-link" title="Cài đặt tài khoản" style="gap: 6px;">
                          <img src="${sessionData.photoURL}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                          <span class="nd-lbl" style="display:flex; align-items:center; gap:4px;">
                            ${ndid}
                            ${roleBadgeHtml}
                          </span>
                        </a>
                    `;
                }
            } else {
                const localAccounts = localStorage.getItem('nd_accounts');
                if (!localAccounts) {
                    localStorage.removeItem('nd_user');
                    localStorage.removeItem('nd_active_index');
                    const userSection = document.getElementById('nd-navbar-user');
                    if (userSection) {
                        userSection.innerHTML = `
                            <a href="/auth/login/" class="nd-nav-link" style="color: #0070f3;">Đăng nhập</a>
                            <a href="/auth/register/" class="nd-nav-link nd-active" style="padding: 5px 10px;">NDID</a>
                        `;
                    }
                }
            }
        });

        console.log("🔥 Firebase Modular SDK Initialized");
        window.dispatchEvent(new Event('firebase-ready'));
    } catch (err) {
        console.error("Firebase init error", err);
    }
}

// Export loadDynamicLessons for pages to fetch exams from Firestore
window.loadDynamicLessons = async function(firestore) {
    if (!firestore) return;
    try {
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        if (typeof window.quizList === 'undefined') {
            window.quizList = [];
        }

        // Exams are loaded directly from their single source-of-truth collection.
        const quizSnapshot = await getDocs(collection(firestore, 'quizzes'));
        quizSnapshot.forEach(quizDoc => {
            const quiz = quizDoc.data() || {};
            const quizData = quiz.quizData || quiz;
            const id = quizDoc.id;
            const catalogItem = {
                id,
                quizId: id,
                type: 'quiz',
                title: quiz.title || quiz.eduspaceV3?.exam?.title || quizData.title || id,
                description: quiz.description || quiz.eduspaceV3?.exam?.description || quizData.description || '',
                class: quiz.class || quiz.grade || quizData.class || quizData.grade || '',
                subject: quiz.subject || quizData.subject || '',
                duration: quiz.duration || quiz.eduspaceV3?.exam?.durationMinutes || quizData.duration || 45,
                tag: quiz.tag || '',
                isHot: !!quiz.isHot,
                isComingSoon: !!quiz.isComingSoon
            };
            const existingIndex = window.quizList.findIndex(item => String(item.id).toLowerCase() === id.toLowerCase());
            if (existingIndex === -1) window.quizList.push(catalogItem);
            else window.quizList[existingIndex] = { ...window.quizList[existingIndex], ...catalogItem };
        });

        // Keep lesson content separate; old quiz rows in this collection are legacy pointers only.
        const lessonSnapshot = await getDocs(query(collection(firestore, 'eduspace_lessons'), orderBy('createdAt', 'desc')));
        lessonSnapshot.forEach(lessonDoc => {
            const data = lessonDoc.data() || {};
            if (data.type === 'quiz' || data.quizId) return;
            if (window.quizList.some(item => String(item.id).toLowerCase() === String(data.id || lessonDoc.id).toLowerCase())) return;
            window.quizList.push({ id: data.id || lessonDoc.id, ...data });
        });
        console.log("🔥 Loaded dynamic lessons from Firestore:", window.quizList.length);
    } catch(e) {
        console.error("Lỗi khi tải bài học động từ Firebase:", e);
    }
};

// Chạy luôn vì module defer mặc định
initEduFirebase();
