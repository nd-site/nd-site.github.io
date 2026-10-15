/**
 * EduND â€” Firebase SDK Initializer (Khá»Ÿi táº¡o dá»‹ch vá»¥ Ä‘Ă¡m mĂ¢y Firebase)
 * 
 * TĂ¡c dá»¥ng:
 *   â€¢ Sá»­ dá»¥ng Firebase Modular SDK Ä‘á»ƒ káº¿t ná»‘i vá»›i cÆ¡ sá»Ÿ dá»¯ liá»‡u vĂ  xĂ¡c thá»±c ngÆ°á»i dĂ¹ng toĂ n trang.
 *   â€¢ Äá»c cáº¥u hĂ¬nh báº£o máº­t Ä‘á»™ng tá»« `config.js` Ä‘á»ƒ tá»± Ä‘á»™ng khá»Ÿi táº¡o Firebase App, Auth vĂ  Realtime Database.
 *   â€¢ Theo dĂµi tráº¡ng thĂ¡i Ä‘Äƒng nháº­p cá»§a thĂ nh viĂªn Ä‘á»ƒ Ä‘á»“ng bá»™ áº£nh Ä‘áº¡i diá»‡n vĂ  biá»‡t danh hiá»ƒn thá»‹ trĂªn thanh navbar (`nd-navbar`).
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

    // Táº£i khĂ³a Ä‘á»™ng tá»« getEduKeys() Ä‘á»ƒ há»— trá»£ cáº£ biáº¿n mĂ´i trÆ°á»ng .env trĂªn localhost
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
        // LuĂ´n fetch role má»›i nháº¥t tá»« Firestore Ä‘á»ƒ trĂ¡nh dá»¯ liá»‡u localStorage cÅ©
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Náº¿u cáº£ nd_user, nd_accounts vĂ  canonical session Ä‘á»u khĂ´ng tá»“n táº¡i -> ngÆ°á»i dĂ¹ng Ä‘Ă£ chá»§ Ä‘á»™ng Ä‘Äƒng xuáº¥t
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

                // â”€â”€â”€ Láº¥y role tháº­t tá»« Firestore /users/{uid} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                let role = 'member', eduRole = '', ndid = '', fullname = '', photoURL = '', grade = 'KhĂ¡c', yob = null, codeId = '', customGeminiKey = '';
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

                        // Parse EduND Role (há»c táº­p)
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
                        grade    = data.grade    || 'KhĂ¡c';
                        yob      = data.yob      || null;
                        codeId   = data.codeId   || user.uid;
                        customGeminiKey = data.customGeminiKey || '';
                    }
                } catch (e) {
                    // Náº¿u offline/lá»—i máº¡ng â†’ dĂ¹ng dá»¯ liá»‡u cÅ© tá»« localStorage
                    try {
                        const raw = localStorage.getItem('nd_user');
                        if (raw) {
                            const old = JSON.parse(raw);
                            role     = old.role     || 'member';
                            eduRole  = old.eduRole  || 'student';
                            ndid     = old.ndid     || '';
                            fullname = old.displayName || old.fullname || '';
                            photoURL = old.photoURL || user.photoURL || '';
                            grade    = old.grade    || 'KhĂ¡c';
                            yob      = old.yob      || null;
                            codeId   = old.codeId   || '';
                            customGeminiKey = old.customGeminiKey || '';
                        }
                    } catch (_) {}
                }

                // If ndid not loaded yet, show loading state â€“ do NOT fallback to displayName or email
                if (!ndid) ndid = 'Äang táº£i...';
                if (!fullname) fullname = user.displayName || 'ND Member';
                if (!photoURL) photoURL = user.photoURL || '/assets/images/logo.png';

                // â”€â”€â”€ LÆ°u session Ä‘áº§y Ä‘á»§ vĂ o localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

            } else {
                const localAccounts = localStorage.getItem('nd_accounts');
                if (!localAccounts) {
                    localStorage.removeItem('nd_user');
                    localStorage.removeItem('nd_active_index');
            }
                }
        });

        console.log("đŸ”¥ Firebase Modular SDK Initialized");
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
        console.log("đŸ”¥ Loaded dynamic lessons from Firestore:", window.quizList.length);
    } catch(e) {
        console.error("Lá»—i khi táº£i bĂ i há»c Ä‘á»™ng tá»« Firebase:", e);
    }
};

// Cháº¡y luĂ´n vĂ¬ module defer máº·c Ä‘á»‹nh
initEduFirebase();

