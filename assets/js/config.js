/**
 * EduSpace — Configuration & Keys Management (Quản lý Cấu hình & Khóa bảo mật)
 * 
 * Tác dụng:
 *   • Chứa toàn bộ thông tin cấu hình cho Firebase (AppId, DatabaseURL, API Key) và cài đặt cho Gemini AI.
 *   • Quản lý việc nạp các biến môi trường nhạy cảm an toàn qua cơ chế GitHub Actions hoặc fallback môi trường Local (.env).
 *   • Định nghĩa Model AI ổn định chính thức sử dụng cho hệ thống (`gemini-3.1-flash-lite`).
 */

const EDU_CONFIG = {
    // These placeholders are replaced by GitHub Actions during deployment for each repo
    geminiApiKey: "__GEMINI_API_KEY_PLACEHOLDER__",
    firebaseApiKey: "AIzaSyC6h0Uqg34PiT0p9l_cQOT7p7pt6kVHCHk",
    firebaseAuthDomain: "ndlabs-0.firebaseapp.com",
    firebaseDatabaseURL: "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app",
    firebaseProjectId: "ndlabs-0",
    firebaseStorageBucket: "ndlabs-0.firebasestorage.app",
    firebaseMessagingSenderId: "600040258053",
    firebaseAppId: "1:600040258053:web:617a19f62aafeb35d13a6c",
    firebaseMeasurementId: "G-20W5SZ0BKB",
    // URL của Firebase Cloud Function geminiProxy (inject bởi GitHub Actions)
    geminiFunctionUrl: "__GEMINI_FUNCTION_URL_PLACEHOLDER__",

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
    fbMeasurementId: null
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

    // If GitHub Secrets are already injected (at least Gemini and AppId), stop here
    if (_cachedKeys.gemini && _cachedKeys.fbAppId) return _cachedKeys;

    // 2. If not in GitHub Environment, fallback to local .env (For development)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
        const paths = ['/.env', './.env', '../.env', '../../.env', '/eduspace/.env'];
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
                        }
                    }
                    if (foundMatch) break;
                }
            } catch (e) {}
        }
    }

    // Default fallbacks for local/empty state
    if (!_cachedKeys.gemini) _cachedKeys.gemini = null;
    
    return _cachedKeys;
}

window.getGeminiApiKey = async () => {
    const keys = await getEduKeys();
    return keys.gemini;
};


window.getStableModel = () => EDU_CONFIG.stableModel;
