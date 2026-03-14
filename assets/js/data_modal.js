/**
 * EduSpace AI Data Modal & Logic
 * Centralized script for all Gemini AI features in EduSpace.
 * NOTE: Using Gemini 2.5 Flash as the baseline.
 */

const eduspaceAI = (function () {
    // Configuration & State
    let sessionModel = { model: window.getStableModel?.() || 'gemini-2.5-flash', version: 'v1' };
    let discoveredModels = [];

    // --- Core API Logic ---
    async function getBestModel(apiKey) {
        const cached = localStorage.getItem('gemini_discovery_list');
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 1000 * 60 * 60 * 24) return data.models;
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
            const priority = ['gemini-3-flash', 'gemini-2.5-flash'];
            discoveredModels.sort((a, b) => {
                const aIdx = priority.findIndex(p => a.includes(p));
                const bIdx = priority.findIndex(p => b.includes(p));
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                return aIdx !== -1 ? -1 : (bIdx !== -1 ? 1 : a.localeCompare(b));
            });
            localStorage.setItem('gemini_discovery_list', JSON.stringify({ models: discoveredModels, timestamp: Date.now() }));
            return discoveredModels;
        }
        return ['gemini-3-flash', 'gemini-2.5-flash'];
    }

    async function callGeminiAPI(payload) {
        const apiKey = await window.getGeminiApiKey();
        if (!apiKey) throw new Error('Thiếu API Key! Vui lòng cấu hình trong cài đặt.');

        let models = discoveredModels.length ? discoveredModels : await getBestModel(apiKey);
        // Strict filter: Only keep 2.5 or higher
        const filteredModels = models.filter(m => (m.includes('3.') || m.includes('2.5')) && !m.includes('deep-research') && !m.includes('thinking'));

        let lastError = null;
        for (const model of filteredModels) {
            const endpoints = ['v1', 'v1beta'];
            for (const apiVer of endpoints) {
                try {
                    const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...payload,
                            safetySettings: [
                                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                            ]
                        })
                    });
                    if (response.status === 429) continue;
                    const data = await response.json();
                    
                    if (data.error) {
                        const msg = data.error.message || "";
                        if (msg.toLowerCase().includes("leaked") || msg.toLowerCase().includes("revoked")) {
                            throw new Error("API Key của bạn đã bị lộ hoặc bị thu hồi. Vui lòng thay khóa mới trong tệp .env hoặc Database.");
                        }
                        if (msg.toLowerCase().includes("api key not found")) {
                            throw new Error("API Key không hợp lệ hoặc không tồn tại.");
                        }
                        throw new Error(msg);
                    }
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                } catch (e) { 
                    lastError = e; 
                    if (e.message.includes("API Key")) throw e; // Break early if it's a key issue
                }
            }
        }
        throw lastError || new Error("Không thể kết nối với AI.");
    }

    // Auto-init on load if not explicitly called (Removed UI specific init)
    // window.addEventListener('DOMContentLoaded', initWidget);

    return {
        call: callGeminiAPI,
        getBestModel: getBestModel
    };
})();
