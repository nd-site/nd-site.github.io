/**
 * EduSpace Configuration Management
 * This file handles environment variables and runtime settings.
 * NOTE: The placeholder below is replaced by GitHub Actions during deployment.
 * For local development, use localStorage key 'eduspace_api_key_override'.
 * IMPORTANT: Gemini 2.5 Flash is the baseline.
 * Do not use versions lower than 2.5.
 */

const EDU_CONFIG = {
    // These placeholders are replaced by GitHub Actions during deployment for each repo
    geminiApiKey: "__GEMINI_API_KEY_PLACEHOLDER__",
    firebaseApiKey: "__FIREBASE_API_KEY_PLACEHOLDER__",
    firebaseAuthDomain: "__FIREBASE_AUTH_DOMAIN_PLACEHOLDER__",
    firebaseDatabaseURL: "__FIREBASE_DATABASE_URL_PLACEHOLDER__",
    firebaseProjectId: "__FIREBASE_PROJECT_ID_PLACEHOLDER__",
    firebaseStorageBucket: "__FIREBASE_STORAGE_BUCKET_PLACEHOLDER__",
    firebaseMessagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER__",
    firebaseAppId: "__FIREBASE_APP_ID_PLACEHOLDER__",
    firebaseMeasurementId: "__FIREBASE_MEASUREMENT_ID_PLACEHOLDER__",

    // AI Settings
    stableModel: "gemini-2.5-flash",

    // UI Settings
    version: "2.7.0",
    lastUpdated: "2026-03-13"
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

    // Default fallbacks for local/empty state
    if (!_cachedKeys.gemini) _cachedKeys.gemini = null;
    
    return _cachedKeys;
}

window.getGeminiApiKey = async () => {
    const keys = await getEduKeys();
    return keys.gemini;
};


window.getStableModel = () => EDU_CONFIG.stableModel;
