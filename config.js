/**
 * EduSpace Configuration Management
 * This file handles environment variables and runtime settings.
 * NOTE: The placeholder below is replaced by GitHub Actions during deployment.
 * For local development, use localStorage key 'eduspace_api_key_override'.
 * IMPORTANT: Gemini 2.0 is no longer supported. Use Gemini 1.5 Flash as the baseline.
 * Do not use versions lower than the supported stable version.
 */

const EDU_CONFIG = {
    // DO NOT edit this directly. Set GEMINI_API_KEY in GitHub Secrets.
    geminiApiKey: "__GEMINI_API_KEY_PLACEHOLDER__",

    // AI Settings
    stableModel: "gemini-1.5-flash",

    // UI Settings
    version: "2.6.0",
    lastUpdated: "2026-03-08"
};

let _cachedEnvKey = null;

// Function to safely get the API key (supports local .env overriding GitHub placeholder)
async function getGeminiApiKey() {
    // 1. Check local memory cache
    if (_cachedEnvKey) return _cachedEnvKey;

    // 2. Check localStorage override (if manually set previously)
    const override = localStorage.getItem('eduspace_api_key_override');
    if (override) {
        _cachedEnvKey = override;
        return _cachedEnvKey;
    }

    // 3. Try fetching from a local .env file (Git-ignored)
    try {
        const res = await fetch('/eduspace/.env');
        if (res.ok) {
            const text = await res.text();
            for (const line of text.split('\n')) {
                if (line.trim().startsWith('GEMINI_API_KEY=')) {
                    _cachedEnvKey = line.split('=')[1].trim().replace(/['"]/g, '');
                    return _cachedEnvKey;
                }
            }
        }
    } catch (e) {
        // Ignored. Useful for GH Pages where .env might not be deployed.
    }

    // 4. Fallback to GitHub Secrets replacement placeholder
    _cachedEnvKey = EDU_CONFIG.geminiApiKey;
    return _cachedEnvKey;
}

window.getGeminiApiKey = getGeminiApiKey;
window.getStableModel = () => EDU_CONFIG.stableModel;
