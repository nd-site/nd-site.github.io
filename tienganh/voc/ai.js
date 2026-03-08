// EduSpace AI Logic - Gemini Integration
// Handles API calls, auto-fill, and chat assistant.

const GEMINI_MODELS_TEXT = [
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
];

const GEMINI_MODELS_VISION = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
];

let discoveredModels = [];
let sessionModel = { model: null, version: null };
let currentAttachments = [];
let chatHistory = [];

async function getBestModel(apiKey) {
    const cached = localStorage.getItem('gemini_discovery_list');
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < 1000 * 60 * 60 * 24) {
            return data.models;
        }
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
        } catch (e) {
            console.warn(`Discovery failed for ${ver}:`, e);
        }
    }

    if (discoveredModels.length > 0) {
        const priority = [
            'gemini-2.0-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];
        discoveredModels.sort((a, b) => {
            const aIdx = priority.findIndex(p => a.includes(p));
            const bIdx = priority.findIndex(p => b.includes(p));
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return a.localeCompare(b);
        });

        localStorage.setItem('gemini_discovery_list', JSON.stringify({
            models: discoveredModels,
            timestamp: Date.now()
        }));
        return discoveredModels;
    }
    return null;
}

async function callGeminiAPI(payload, hasImages = false) {
    const apiKey = window.getGeminiApiKey();
    if (!apiKey) throw new Error('Thiếu API Key!');

    if (sessionModel.model && sessionModel.version) {
        try {
            return await executeRequest(sessionModel.model, sessionModel.version, apiKey, payload);
        } catch (e) {
            sessionModel.model = null;
        }
    }

    let discovered = await getBestModel(apiKey);
    if (!discovered || discovered.length === 0) {
        discovered = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    }

    const filteredModels = discovered.filter(m =>
        !m.includes('deep-research') && !m.includes('vision') && !m.includes('thinking')
    );

    let lastError = null;
    for (const model of filteredModels) {
        const endpoints = model.includes('2.') || model.includes('1.5') ? ['v1', 'v1beta'] : ['v1beta', 'v1'];

        for (const apiVer of endpoints) {
            try {
                const result = await executeRequest(model, apiVer, apiKey, payload);
                sessionModel.model = model;
                sessionModel.version = apiVer;
                return result;
            } catch (e) {
                if (e.message?.includes('429')) {
                    lastError = e;
                    break;
                }
                lastError = e;
            }
        }
    }
    throw lastError || new Error("Không thể kết nối với AI.");
}

async function executeRequest(model, apiVer, apiKey, payload) {
    const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`;

    const activePayload = JSON.parse(JSON.stringify(payload));
    if (activePayload.generationConfig) delete activePayload.generationConfig.response_mime_type;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...activePayload,
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        })
    });

    if (response.status === 429) throw new Error("429");
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");
    return text;
}

// Auto-fill Logic
async function fillDataWithAI() {
    if (dom.fillAiBtn.disabled) return;

    const itemsToProcess = vocabData
        .map((item, index) => ({ ...item, _id: index }))
        .filter(item => (item.en && item.en.trim()) || (item.vi && item.vi.trim()));

    if (itemsToProcess.length === 0) {
        const originalText = dom.fillAiBtn.textContent;
        dom.fillAiBtn.textContent = '⚠️ Trống dữ liệu';
        setTimeout(() => { if (dom.fillAiBtn) dom.fillAiBtn.textContent = originalText; }, 2000);
        return;
    }

    dom.fillAiBtn.disabled = true;
    const originalBtnText = dom.fillAiBtn.textContent;
    dom.fillAiBtn.textContent = `⏳ Đang xử lý ${itemsToProcess.length} từ...`;

    const prompt = `
    You are an expert English-Vietnamese lexicographer.
    Task: Review and complete the missing information for the following vocabulary list.
    Data List: ${JSON.stringify(itemsToProcess.map(it => ({ id: it._id, en: it.en, vi: it.vi, ipa: it.ipa, type: it.type, usage: it.usage })))}
    Requirements for each entry:
    1. 'en': Correct English word. Always CAPITALIZE the first letter.
    2. 'vi': Accurate Vietnamese translation. Always CAPITALIZE the first letter.
    3. 'ipa': Standard IPA transcription.
    4. 'type': Part of speech (n, v, adj, adv).
    5. 'usage': English sentence (Tiếng Việt dịch)
    Return JSON array of objects with original "id". Raw JSON array only.
    `;

    try {
        const resultText = await callGeminiAPI({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        });

        const match = resultText.match(/\[[\s\S]*\]/);
        if (match) {
            const results = JSON.parse(match[0]);
            let successCount = 0;
            results.forEach(res => {
                const targetEntry = vocabData[res.id];
                if (targetEntry) {
                    if (res.en) targetEntry.en = autoCapitalize(String(res.en).trim());
                    if (res.vi) targetEntry.vi = autoCapitalize(String(res.vi).trim());
                    if (res.ipa) targetEntry.ipa = String(res.ipa).trim();
                    if (res.type) targetEntry.type = String(res.type).trim();
                    if (res.usage) targetEntry.usage = autoCapitalize(String(res.usage).trim());
                    successCount++;

                    const row = dom.vocabTableBody.querySelector(`tr[data-original-index="${res.id}"]`);
                    if (row) {
                        const inputs = row.querySelectorAll('input, textarea');
                        if (inputs.length >= 5) {
                            inputs[0].value = targetEntry.en;
                            inputs[1].value = targetEntry.ipa;
                            inputs[2].value = targetEntry.type;
                            inputs[3].value = targetEntry.vi;
                            inputs[4].value = targetEntry.usage;
                            inputs.forEach(tx => autoHeight(tx));
                        }
                    }
                }
            });
            localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
            dom.fillAiBtn.textContent = `✅ Thành công ${successCount} từ!`;
        } else {
            dom.fillAiBtn.textContent = `❌ Lỗi định dạng AI`;
        }
    } catch (e) {
        dom.fillAiBtn.textContent = `❌ Lỗi kết nối`;
    }

    setTimeout(() => {
        dom.fillAiBtn.textContent = originalBtnText;
        dom.fillAiBtn.disabled = false;
    }, 2000);
}

// Chat functions
function handleChatImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result.split(',')[1];
        currentAttachments.push({
            inlineData: { mimeType: file.type, data: base64Data },
            preview: e.target.result
        });
        renderAttachments();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function renderAttachments() {
    dom.attachmentPreview.innerHTML = '';
    if (currentAttachments.length > 0) {
        dom.attachmentPreview.classList.remove('hidden');
        currentAttachments.forEach((att, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${att.preview}"><div class="remove-att" onclick="removeAttachment(${index})">✕</div>`;
            dom.attachmentPreview.appendChild(div);
        });
    } else {
        dom.attachmentPreview.classList.add('hidden');
    }
}

window.removeAttachment = function (index) {
    currentAttachments.splice(index, 1);
    renderAttachments();
};

async function sendChatMessage() {
    const text = dom.chatInput.value.trim();
    if (!text && currentAttachments.length === 0) return;
    const hasImages = currentAttachments.length > 0;
    appendMessage(text, 'user', currentAttachments.map(a => a.preview));
    dom.chatInput.value = '';
    const currentParts = [];
    if (text) currentParts.push({ text });
    [...currentAttachments].forEach(att => currentParts.push({ inlineData: att.inlineData }));
    currentAttachments = [];
    renderAttachments();
    chatHistory.push({ role: "user", parts: currentParts });
    const loadingId = 'loading-' + Date.now();
    appendLoading(loadingId);
    try {
        const aiText = await callGeminiAPI({
            contents: chatHistory,
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
        }, hasImages);
        if (document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        appendMessage(aiText || "...", 'bot');
        chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
    } catch (e) {
        if (document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        appendMessage(`⚠️ Lỗi: ${e.message}`, 'bot');
    }
}

function appendMessage(text, role, images = []) {
    const div = document.createElement('div');
    div.className = `message ${role} flex gap-3 max-w-[85%] animate-up`;
    let contentHtml = '';
    if (images.length > 0) {
        images.forEach(img => {
            contentHtml += `<img src="${img}" style="max-height: 150px; display: block; margin-bottom: 5px; border-radius: 8px;">`;
        });
    }
    if (role === 'bot') {
        contentHtml += typeof marked !== 'undefined' ? marked.parse(text) : text;
    } else {
        contentHtml += `<p>${text ? text.replace(/\n/g, '<br>') : ''}</p>`;
    }
    const botSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
    const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    div.innerHTML = `
        <div class="avatar ${role === 'user' ? 'bg-amber-100 text-amber-600' : 'bg-blue-600 text-white'} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
            ${role === 'user' ? userSvg : botSvg}
        </div>
        <div class="msg-content ${role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100'} p-4 shadow-sm text-xs leading-relaxed font-medium">
            ${contentHtml}
        </div>
    `;
    dom.chatMessages.appendChild(div);
    if (window.renderMathInElement && role === 'bot') {
        try {
            renderMathInElement(div, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }] });
        } catch (e) { }
    }
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function appendLoading(id) {
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message bot flex gap-3 max-w-[85%]';
    const botSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
    div.innerHTML = `
        <div class="avatar bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            ${botSvg}
        </div>
        <div class="msg-content bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100 p-4 shadow-sm text-xs">...</div>
    `;
    dom.chatMessages.appendChild(div);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}
