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

// Function to safely get the API key (checks localStorage override first)
function getGeminiApiKey() {
    const override = localStorage.getItem('eduspace_api_key_override');
    return override || EDU_CONFIG.geminiApiKey;
}

window.getGeminiApiKey = getGeminiApiKey;
window.getStableModel = () => EDU_CONFIG.stableModel;
