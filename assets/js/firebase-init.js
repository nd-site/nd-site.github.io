/**
 * EduSpace — Firebase SDK Initializer (Khởi tạo dịch vụ đám mây Firebase)
 * 
 * Tác dụng:
 *   • Sử dụng Firebase Modular SDK để kết nối với cơ sở dữ liệu và xác thực người dùng toàn trang.
 *   • Đọc cấu hình bảo mật động từ `config.js` để tự động khởi tạo Firebase App, Auth và Realtime Database.
 *   • Theo dõi trạng thái đăng nhập của thành viên để đồng bộ ảnh đại diện và biệt danh hiển thị trên thanh navbar (`nd-navbar`).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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

        // Auto sync user role & profile with nd-navbar on every page load
        // Luôn fetch role mới nhất từ Firestore để tránh dữ liệu localStorage cũ
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // ─── Lấy role thật từ Firestore /users/{uid} ───────────────────────
                let role = 'member', eduRole = '', ndid = '', fullname = '', photoURL = '', grade = 'Khác', yob = null, codeId = '';
                try {
                    const snap = await getDoc(doc(firestore, 'users', user.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        const rawRole = data.role || 'student';
                        const rawSubrole = data.subrole || '';

                        // Parse ND Labs Role (global)
                        if (rawRole === 'admin' || data.ndid === 'nhatdang' || data.ndid === '@nhatdang' || user.email === 'nhatdang10.nd@gmail.com') {
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
                        codeId   = data.codeId   || '';

                        // Auto generate permanent 8-digit CodeID if missing (incremental via transaction counter)
                        if (!codeId) {
                            try {
                                const counterRef = doc(firestore, 'counters', 'code_ids');
                                const counterSnap = await getDoc(counterRef);
                                
                                let initialMaxVal = 0;
                                if (!counterSnap.exists()) {
                                    const codeQuery = query(collection(firestore, 'code_ids'), orderBy('__name__', 'desc'), limit(1));
                                    const querySnap = await getDocs(codeQuery);
                                    if (!querySnap.empty) {
                                        const highestId = querySnap.docs[0].id;
                                        if (highestId && highestId.length === 8 && !isNaN(highestId)) {
                                            initialMaxVal = parseInt(highestId, 10);
                                        }
                                    }
                                }
                                
                                const candidate = await runTransaction(firestore, async (transaction) => {
                                    const freshSnap = await transaction.get(counterRef);
                                    let nextNum = 1;
                                    if (freshSnap.exists()) {
                                        nextNum = (freshSnap.data().lastNumber || 0) + 1;
                                    } else {
                                        nextNum = initialMaxVal + 1;
                                    }
                                    
                                    const cand = String(nextNum).padStart(8, '0');
                                    transaction.set(counterRef, { lastNumber: nextNum });
                                    return cand;
                                });

                                if (candidate) {
                                    const codeRef = doc(firestore, 'code_ids', candidate);
                                    await setDoc(codeRef, { uid: user.uid, createdAt: serverTimestamp() });
                                    await setDoc(doc(firestore, 'users', user.uid), { codeId: candidate }, { merge: true });
                                    codeId = candidate;
                                }
                            } catch (err) {
                                console.error("Error auto-generating incremental CodeID:", err);
                            }
                        }
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
                        }
                    } catch (_) {}
                }

                // Fallback ndid/fullname/photoURL từ Firebase Auth nếu Firestore trống
                if (!ndid) ndid = user.displayName || user.email?.split('@')[0] || 'Khách';
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
                    codeId:      codeId
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
                           </a>`
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
                localStorage.removeItem('nd_user');
            }
        });

        console.log("🔥 Firebase Modular SDK Initialized");
        window.dispatchEvent(new Event('firebase-ready'));
    } catch (err) {
        console.error("Firebase init error", err);
    }
}

// Chạy luôn vì module defer mặc định
initEduFirebase();
