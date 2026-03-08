/**
 * EduSpace AI Data Modal & Logic
 * Centralized script for all Gemini AI features in EduSpace.
 * NOTE: Gemini 2.0 is no longer supported. Using Gemini 1.5 Flash as the baseline.
 */

const eduspaceAI = (function () {
    // Configuration & State
    let sessionModel = { model: window.getStableModel?.() || 'gemini-1.5-flash', version: 'v1' };
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
            const priority = ['gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
            discoveredModels.sort((a, b) => {
                const aIdx = priority.findIndex(p => a.includes(p));
                const bIdx = priority.findIndex(p => b.includes(p));
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                return aIdx !== -1 ? -1 : (bIdx !== -1 ? 1 : a.localeCompare(b));
            });
            localStorage.setItem('gemini_discovery_list', JSON.stringify({ models: discoveredModels, timestamp: Date.now() }));
            return discoveredModels;
        }
        return ['gemini-1.5-flash', 'gemini-1.5-pro'];
    }

    async function callGeminiAPI(payload) {
        const apiKey = window.getGeminiApiKey();
        if (!apiKey) throw new Error('Thiếu API Key! Vui lòng cấu hình trong cài đặt.');

        let models = discoveredModels.length ? discoveredModels : await getBestModel(apiKey);
        const filteredModels = models.filter(m => !m.includes('deep-research') && !m.includes('thinking'));

        let lastError = null;
        for (const model of filteredModels) {
            const endpoints = model.includes('2.') || model.includes('1.5') ? ['v1', 'v1beta'] : ['v1beta', 'v1'];
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
                    if (data.error) throw new Error(data.error.message);
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                } catch (e) { lastError = e; }
            }
        }
        throw lastError || new Error("Không thể kết nối với AI.");
    }

    // --- UI Logic (Modal/Assistant) ---
    function initWidget() {
        if (document.getElementById('eduspace-ai-widget')) return;

        const widgetHtml = `
            <div id="eduspace-ai-widget" class="fixed bottom-5 right-5 z-[2000] flex flex-col items-end">
                <div id="ai-chat-window" class="hidden w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col mb-4 animate-up scale-95 opacity-0 transition-all duration-300">
                    <div class="bg-blue-600 p-4 text-white flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">✨</span>
                            <span class="font-bold">EduAI Assistant</span>
                        </div>
                        <button onclick="eduspaceAI.toggleChat()" class="p-1 hover:bg-white/20 rounded-lg">✕</button>
                    </div>
                    <div id="ai-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-sm shadow-sm">
                            Xin chào! Tôi là EduAI. Tôi có thể giúp gì được cho bạn?
                        </div>
                    </div>
                    <div class="p-3 border-t border-slate-100 bg-white">
                        <div class="flex gap-2 bg-slate-100 p-2 rounded-2xl">
                            <input id="ai-user-input" type="text" placeholder="Nhập câu hỏi..." class="flex-1 bg-transparent outline-none text-sm px-2" onkeydown="if(event.key==='Enter') eduspaceAI.sendChat()">
                            <button onclick="eduspaceAI.sendChat()" class="bg-blue-600 text-white p-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <button onclick="eduspaceAI.toggleChat()" class="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHtml);
    }

    function toggleChat() {
        const win = document.getElementById('ai-chat-window');
        if (win.classList.contains('hidden')) {
            win.classList.remove('hidden');
            setTimeout(() => { win.classList.remove('scale-95', 'opacity-0'); }, 10);
        } else {
            win.classList.add('scale-95', 'opacity-0');
            setTimeout(() => { win.classList.add('hidden'); }, 300);
        }
    }

    async function sendChat() {
        const input = document.getElementById('ai-user-input');
        const text = input.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        input.value = '';
        const loadingId = 'ai-loading-' + Date.now();
        appendLoading(loadingId);

        try {
            const res = await callGeminiAPI({
                contents: [{ role: 'user', parts: [{ text }] }]
            });
            document.getElementById(loadingId).remove();
            appendMsg(res, 'bot');
        } catch (e) {
            document.getElementById(loadingId).remove();
            appendMsg(`Lỗi: ${e.message}`, 'bot');
        }
    }

    function appendMsg(text, role) {
        const container = document.getElementById('ai-messages');
        const div = document.createElement('div');
        div.className = role === 'user'
            ? "bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm self-end ml-auto max-w-[85%] shadow-md"
            : "bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-sm shadow-sm max-w-[85%]";

        // Simple markdown replacement for bold/italic/newline
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br>');

        div.innerHTML = formatted;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function appendLoading(id) {
        const container = document.getElementById('ai-messages');
        const div = document.createElement('div');
        div.id = id;
        div.className = "bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-400";
        div.innerHTML = "EduAI đang suy nghĩ...";
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    // Auto-init on load if not explicitly called
    window.addEventListener('DOMContentLoaded', initWidget);

    return {
        call: callGeminiAPI,
        init: initWidget,
        toggleChat: toggleChat,
        sendChat: sendChat
    };
})();
