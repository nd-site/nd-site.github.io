if (window.location.hostname === '127.0.0.1') {
    window.location.hostname = 'localhost';
}

/**
 * EduND — Configuration & Keys Management (Quản lý Cấu hình & Khóa bảo mật)
 * 
 * Tác dụng:
 *   • Chứa toàn bộ thông tin cấu hình cho Firebase (AppId, DatabaseURL, API Key) và cài đặt cho Gemini AI.
 *   • Quản lý việc nạp các biến môi trường nhạy cảm an toàn qua cơ chế GitHub Actions hoặc fallback môi trường Local (.env).
 *   • Định nghĩa Model AI ổn định chính thức sử dụng cho hệ thống (`gemini-3.1-flash-lite`).
 */

const EDU_CONFIG = {
    // Default config values with fallback for direct web/Firebase Hosting deployment
    geminiApiKey: "",
    firebaseApiKey: "AIzaSyC6h0Uqg34PiT0p9l_cQOT7p7pt6kVHCHk",
    firebaseAuthDomain: "ndlabs-0.firebaseapp.com",
    firebaseDatabaseURL: "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app",
    firebaseProjectId: "ndlabs-0",
    firebaseStorageBucket: "ndlabs-0.firebasestorage.app",
    firebaseMessagingSenderId: "600040258053",
    firebaseAppId: "1:600040258053:web:617a19f62aafeb35d13a6c",
    firebaseMeasurementId: "G-20W5SZ0BKB",
    geminiFunctionUrl: "__GEMINI_FUNCTION_URL_PLACEHOLDER__",
    cloudflareWorkerUrl: "__CLOUDFLARE_WORKER_URL_PLACEHOLDER__",
    imgbbApiKey: "aa2dd4b8c1d79c0f7535f6dd536dc237",

    // AI Settings
    stableModel: "gemini-3.1-flash-lite",

    // UI Settings
    version: "2.8.0",
    lastUpdated: "2026-05-18"
};

let _cachedKeys = { 
    gemini: null, 
    firebase: null,
    fbAuthDomain: null,
    fbDatabaseURL: null,
    fbProjectId: null,
    fbStorageBucket: null,
    fbMessagingSenderId: null,
    fbAppId: null,
    fbMeasurementId: null,
    cloudflareWorkerUrl: null,
    imgbbApiKey: null
};

// Check if a value is a placeholder or truly set
function isSet(val) {
    return val && !val.includes('PLACEHOLDER') && val !== "";
}

async function getEduKeys() {
    // 1. Try to use GitHub Environment Variables (Injected via placeholders)
    if (isSet(EDU_CONFIG.geminiApiKey)) _cachedKeys.gemini = EDU_CONFIG.geminiApiKey;
    if (isSet(EDU_CONFIG.firebaseApiKey)) _cachedKeys.firebase = EDU_CONFIG.firebaseApiKey;
    if (isSet(EDU_CONFIG.firebaseAuthDomain)) _cachedKeys.fbAuthDomain = EDU_CONFIG.firebaseAuthDomain;
    if (isSet(EDU_CONFIG.firebaseDatabaseURL)) _cachedKeys.fbDatabaseURL = EDU_CONFIG.firebaseDatabaseURL;
    if (isSet(EDU_CONFIG.firebaseProjectId)) _cachedKeys.fbProjectId = EDU_CONFIG.firebaseProjectId;
    if (isSet(EDU_CONFIG.firebaseStorageBucket)) _cachedKeys.fbStorageBucket = EDU_CONFIG.firebaseStorageBucket;
    if (isSet(EDU_CONFIG.firebaseMessagingSenderId)) _cachedKeys.fbMessagingSenderId = EDU_CONFIG.firebaseMessagingSenderId;
    if (isSet(EDU_CONFIG.firebaseAppId)) _cachedKeys.fbAppId = EDU_CONFIG.firebaseAppId;
    if (isSet(EDU_CONFIG.firebaseMeasurementId)) _cachedKeys.fbMeasurementId = EDU_CONFIG.firebaseMeasurementId;
    if (isSet(EDU_CONFIG.cloudflareWorkerUrl)) _cachedKeys.cloudflareWorkerUrl = EDU_CONFIG.cloudflareWorkerUrl;
    if (isSet(EDU_CONFIG.imgbbApiKey)) _cachedKeys.imgbbApiKey = EDU_CONFIG.imgbbApiKey;

    // If GitHub Secrets are already injected (at least Gemini and AppId), stop here
    if (_cachedKeys.gemini && _cachedKeys.fbAppId) return _cachedKeys;

    // 2. Fallback: đọc env.json hoặc .env (dành cho local dev hoặc deploy thủ công có env.json)
    // Trên GitHub Pages: bước 1 đã inject đủ key nên không cần đến đây.
    // Trên Firebase Hosting (deploy thủ công): env.json được tải lên nên vẫn hoạt động.
    try {
        const res = await fetch('/env.json', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.GEMINI_API_KEY) _cachedKeys.gemini = data.GEMINI_API_KEY;
            if (data.FIREBASE_API_KEY) _cachedKeys.firebase = data.FIREBASE_API_KEY;
            if (data.FIREBASE_AUTH_DOMAIN) _cachedKeys.fbAuthDomain = data.FIREBASE_AUTH_DOMAIN;
            if (data.FIREBASE_DATABASE_URL) _cachedKeys.fbDatabaseURL = data.FIREBASE_DATABASE_URL;
            if (data.FIREBASE_PROJECT_ID) _cachedKeys.fbProjectId = data.FIREBASE_PROJECT_ID;
            if (data.FIREBASE_STORAGE_BUCKET) _cachedKeys.fbStorageBucket = data.FIREBASE_STORAGE_BUCKET;
            if (data.FIREBASE_MESSAGING_SENDER_ID) _cachedKeys.fbMessagingSenderId = data.FIREBASE_MESSAGING_SENDER_ID;
            if (data.FIREBASE_APP_ID) _cachedKeys.fbAppId = data.FIREBASE_APP_ID;
            if (data.FIREBASE_MEASUREMENT_ID) _cachedKeys.fbMeasurementId = data.FIREBASE_MEASUREMENT_ID;
            if (data.CLOUDFLARE_WORKER_URL) _cachedKeys.cloudflareWorkerUrl = data.CLOUDFLARE_WORKER_URL;
            if (data.IMGBB_API_KEY) _cachedKeys.imgbbApiKey = data.IMGBB_API_KEY;
        }
    } catch (e) {}

    // Fallback thêm: thử đọc .env nếu env.json không có (chỉ hoạt động ở localhost)
    if (!_cachedKeys.gemini || !_cachedKeys.fbAppId) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            const paths = ['/.env', '/edu/.env'];
            for (const path of paths) {
                try {
                    const res = await fetch(path, { cache: 'no-store' });
                    if (res.ok) {
                        const text = await res.text();
                        let foundMatch = false;
                        for (const line of text.split('\n')) {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed.startsWith('#')) continue;
                            const [key, ...valParts] = trimmed.split('=');
                            if (!key || valParts.length === 0) continue;
                            const value = valParts.join('=').trim().replace(/['"]/g, '');
                            switch(key) {
                                case 'GEMINI_API_KEY': if (!_cachedKeys.gemini) _cachedKeys.gemini = value; foundMatch = true; break;
                                case 'FIREBASE_API_KEY': if (!_cachedKeys.firebase) _cachedKeys.firebase = value; foundMatch = true; break;
                                case 'FIREBASE_AUTH_DOMAIN': if (!_cachedKeys.fbAuthDomain) _cachedKeys.fbAuthDomain = value; foundMatch = true; break;
                                case 'FIREBASE_DATABASE_URL': if (!_cachedKeys.fbDatabaseURL) _cachedKeys.fbDatabaseURL = value; foundMatch = true; break;
                                case 'FIREBASE_PROJECT_ID': if (!_cachedKeys.fbProjectId) _cachedKeys.fbProjectId = value; foundMatch = true; break;
                                case 'FIREBASE_STORAGE_BUCKET': if (!_cachedKeys.fbStorageBucket) _cachedKeys.fbStorageBucket = value; foundMatch = true; break;
                                case 'FIREBASE_MESSAGING_SENDER_ID': if (!_cachedKeys.fbMessagingSenderId) _cachedKeys.fbMessagingSenderId = value; foundMatch = true; break;
                                case 'FIREBASE_APP_ID': if (!_cachedKeys.fbAppId) _cachedKeys.fbAppId = value; foundMatch = true; break;
                                case 'FIREBASE_MEASUREMENT_ID': if (!_cachedKeys.fbMeasurementId) _cachedKeys.fbMeasurementId = value; foundMatch = true; break;
                                case 'CLOUDFLARE_WORKER_URL': if (!_cachedKeys.cloudflareWorkerUrl) _cachedKeys.cloudflareWorkerUrl = value; foundMatch = true; break;
                                case 'IMGBB_API_KEY': if (!_cachedKeys.imgbbApiKey) _cachedKeys.imgbbApiKey = value; foundMatch = true; break;
                            }
                        }
                        if (foundMatch) break;
                    }
                } catch (e) {}
            }
        }
    }

    // Default fallbacks for local/empty state & online deployments
    if (!_cachedKeys.firebase || !_cachedKeys.fbAppId) {
        _cachedKeys.firebase = "AIzaSyC6h0Uqg34PiT0p9l_cQOT7p7pt6kVHCHk";
        _cachedKeys.fbAuthDomain = "ndsite.web.app";
        _cachedKeys.fbDatabaseURL = "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app";
        _cachedKeys.fbProjectId = "ndlabs-0";
        _cachedKeys.fbStorageBucket = "ndlabs-0.firebasestorage.app";
        _cachedKeys.fbMessagingSenderId = "600040258053";
        _cachedKeys.fbAppId = "1:600040258053:web:617a19f62aafeb35d13a6c";
        _cachedKeys.fbMeasurementId = "G-20W5SZ0BKB";
    }
    if (!_cachedKeys.gemini) _cachedKeys.gemini = null;
    
    return _cachedKeys;
}
window.getEduKeys = getEduKeys;

window.getGeminiApiKey = async () => {
    if (_cachedKeys.gemini) return _cachedKeys.gemini;

    // Tầng 1: Lấy key từ Firestore system_config/ai_config
    try {
        let db = window.firebaseFirestore;
        if (!db) {
            for (let i = 0; i < 30 && !window.firebaseFirestore; i++) {
                await new Promise(r => setTimeout(r, 100));
            }
            db = window.firebaseFirestore;
        }
        if (db) {
            const { doc, getDoc } = await import(
                'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
            );
            const snap = await getDoc(doc(db, 'system_config', 'ai_config'));
            if (snap.exists()) {
                const data = snap.data();
                if (data.geminiApiKey && data.geminiApiKey.trim()) {
                    _cachedKeys.gemini = data.geminiApiKey.trim();
                    return _cachedKeys.gemini;
                }
            }
        }
    } catch (e) {
        console.warn('[Config] Lỗi lấy AI key từ Firestore:', e);
    }

    // Tầng 2: Fallback env.json / .env (local dev)
    const keys = await getEduKeys();
    return keys.gemini;
};


window.getStableModel = () => EDU_CONFIG.stableModel;
