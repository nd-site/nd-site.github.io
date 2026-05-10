/**
 * EduSpace AI Data Modal & Logic
 * Centralized script for all Gemini AI features in EduSpace.
 * NOTE: Using Gemini 3.1 Flash Lite as the stable model (GA: 2026-05-07).
 *
 * KEY SECURITY — 3 tầng bảo mật (ưu tiên từ cao xuống thấp):
 *  1. Cloud Function Proxy (Blaze plan): key hoàn toàn server-side
 *  2. Firebase Realtime Database + Auth (Spark plan): key trong DB, cần login
 *  3. GitHub Actions inject vào config.js (fallback): không trong source code
 */

const eduspaceAI = (function () {
    let sessionModel = { model: window.getStableModel?.() || 'gemini-3.1-flash-lite', version: 'v1beta' };
    let discoveredModels = [];

    // Tầng 1: Cloud Function proxy URL (inject bởi GitHub Actions khi Blaze plan)
    const FUNCTION_PROXY_URL = (typeof EDU_CONFIG !== 'undefined' && EDU_CONFIG.geminiFunctionUrl &&
        !EDU_CONFIG.geminiFunctionUrl.includes('PLACEHOLDER'))
        ? EDU_CONFIG.geminiFunctionUrl
        : null;

    // --- Model Discovery ---
    async function getBestModel(apiKey) {
        const cached = localStorage.getItem('gemini_discovery_list');
        if (cached) {
            const data = JSON.parse(cached);
            const cacheAge = Date.now() - data.timestamp;
            const isRecent = cacheAge < 1000 * 60 * 60 * 24;
            const topModel = data.models?.[0] || '';
            const hasNewModel = topModel.includes('3.1') || topModel.includes('3.');
            if (isRecent && hasNewModel) return data.models;
            localStorage.removeItem('gemini_discovery_list');
        }

        const versions = ['v1', 'v1beta'];
        discoveredModels = [];

        for (const ver of versions) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
                if (res.ok) {
                    const data = await res.json();
                    const capable = data.models
                        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                        .map(m => m.name.split('/').pop());
                    discoveredModels = [...new Set([...discoveredModels, ...capable])];
                }
            } catch (e) { console.warn(`Discovery failed for ${ver}:`, e); }
        }

        if (discoveredModels.length > 0) {
            const priority = ['gemini-3.1-flash-lite', 'gemini-3.1-pro', 'gemini-3-flash', 'gemini-2.5-flash'];
            discoveredModels.sort((a, b) => {
                const aIdx = priority.findIndex(p => a.includes(p));
                const bIdx = priority.findIndex(p => b.includes(p));
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                return aIdx !== -1 ? -1 : (bIdx !== -1 ? 1 : a.localeCompare(b));
            });
            localStorage.setItem('gemini_discovery_list', JSON.stringify({ models: discoveredModels, timestamp: Date.now() }));
            return discoveredModels;
        }
        return ['gemini-3.1-flash-lite', 'gemini-3.1-pro', 'gemini-2.5-flash'];
    }

    /**
     * Tầng 2: Lấy key từ Firebase Realtime Database.
     * DB Security Rules: /config/.read = "auth != null"
     * → Chỉ user đã đăng nhập mới đọc được, key KHÔNG trong source code.
     */
    async function getKeyFromDatabase() {
        try {
            const keys = await window.getEduKeys?.();
            if (!keys?.fbDatabaseURL) return null;

            const authObj = window.firebaseAuth;
            if (!authObj?.currentUser) return null;

            const token = await authObj.currentUser.getIdToken();
            const url = `${keys.fbDatabaseURL}/config/geminiKey.json?auth=${token}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json() || null;
        } catch (e) {
            console.warn('[EduAI] DB key fetch failed:', e.message);
            return null;
        }
    }

    // --- Main API Call ---
    async function callGeminiAPI(payload) {
        const model = payload.model || sessionModel.model;

        // TẦNG 1: Cloud Function Proxy
        if (FUNCTION_PROXY_URL) {
            try {
                const res = await fetch(FUNCTION_PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: payload.contents, model })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
                return data.text;
            } catch (e) {
                console.warn('[EduAI] Proxy failed, falling back:', e.message);
            }
        }

        // TẦNG 2: Key từ Firebase DB (cần Auth)
        let apiKey = await getKeyFromDatabase();

        // TẦNG 3: Key từ config.js (inject bởi GitHub Actions)
        if (!apiKey) {
            apiKey = await window.getGeminiApiKey?.();
        }

        if (!apiKey) throw new Error('Thiếu API Key. Vui lòng đăng nhập hoặc liên hệ quản trị viên.');

        let models = discoveredModels.length ? discoveredModels : await getBestModel(apiKey);
        const filteredModels = models.filter(m =>
            (m.includes('3.1') || m.includes('3.') || m.includes('2.5')) &&
            !m.includes('deep-research') &&
            !m.includes('thinking') &&
            !m.includes('tts') &&
            !m.includes('live')
        );

        let lastError = null;
        let stopAll = false; // Flag dừng toàn bộ retry khi key lỗi

        // Chỉ dùng model gemini-3.1-flash-lite (Gemini 3.1) làm chính,
        // fallback sang 2.5-flash nếu model chính chưa accessible.
        const PREFERRED = ['gemini-3.1-flash-lite', 'gemini-3.1-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'];
        const orderedModels = [
            ...PREFERRED.filter(p => filteredModels.some(m => m === p || m.startsWith(p))),
            ...filteredModels.filter(m => !PREFERRED.some(p => m === p || m.startsWith(p)))
        ].slice(0, 3); // Tối đa 3 model để tránh spam

        for (const mdl of (orderedModels.length ? orderedModels : filteredModels.slice(0, 2))) {
            if (stopAll) break;
            for (const apiVer of ['v1beta', 'v1']) { // v1beta trước vì 3.1 chưa lên v1 stable
                if (stopAll) break;
                try {
                    const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${mdl}:generateContent?key=${apiKey}`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: payload.contents,
                            safetySettings: [
                                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                            ]
                        })
                    });

                    // 429 = rate limit, thử model/endpoint khác
                    if (response.status === 429) { lastError = new Error('Rate limit. Đang thử model khác...'); continue; }

                    const data = await response.json();
                    if (data.error) {
                        const msg = data.error.message || "";
                        const msgLow = msg.toLowerCase();
                        // Lỗi key: dừng toàn bộ, không thử nữa
                        if (msgLow.includes("expired") || msgLow.includes("api key expired")) {
                            stopAll = true;
                            throw new Error("API Key đã hết hạn. Vui lòng liên hệ quản trị viên để cập nhật khóa mới.");
                        }
                        if (msgLow.includes("leaked") || msgLow.includes("revoked")) {
                            stopAll = true;
                            throw new Error("API Key đã bị lộ hoặc thu hồi. Vui lòng liên hệ quản trị viên.");
                        }
                        if (msgLow.includes("api key not valid") || msgLow.includes("api_key_invalid") || msgLow.includes("api key not found")) {
                            stopAll = true;
                            throw new Error("API Key không hợp lệ. Vui lòng liên hệ quản trị viên.");
                        }
                        // Lỗi model: thử model khác
                        lastError = new Error(msg);
                        break; // Không thử cùng model với endpoint khác nữa
                    }
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                } catch (e) {
                    lastError = e;
                    if (stopAll || e.message.includes("Key đã") || e.message.includes("không hợp lệ")) throw e;
                }
            }
        }
        throw lastError || new Error("Không thể kết nối với AI.");
    }

    return {
        call: callGeminiAPI,
        getBestModel: getBestModel
    };
})();
