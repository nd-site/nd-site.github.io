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

    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Export to window
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDb = db;

        // Auto login & sync with nd-navbar
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Update local storage for nd-navbar
                localStorage.setItem('nd_user', JSON.stringify({
                    ndid: user.displayName || user.email?.split('@')[0] || 'Khách',
                    photoURL: user.photoURL || '/assets/images/logo.png',
                    uid: user.uid
                }));
                // Try to update navbar if it's already rendered
                const userSection = document.getElementById('nd-navbar-user');
                if (userSection) {
                    userSection.innerHTML = `
                        <a href="/auth/settings/" class="nd-nav-link" title="Cài đặt tài khoản">
                        <img src="${user.photoURL || '/assets/images/logo.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                        <span class="nd-lbl">${user.displayName || user.email?.split('@')[0] || 'Khách'}</span>
                        </a>
                    `;
                }
            } else {
                localStorage.removeItem('nd_user');
                // Anonymous auth was removed because it is blocked and causes 403 errors in console
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
