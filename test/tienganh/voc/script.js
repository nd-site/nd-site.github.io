// EduSpace Core Logic - Vocabulary App
// Version: 6.0 - Modularized & Full-screen Practice

let vocabData = [];
let dom = {};

document.addEventListener('DOMContentLoaded', () => {
    // DOM References
    dom = {
        tabs: document.querySelectorAll('.nav-item'),
        tabContents: document.querySelectorAll('.tab-content'),
        vocabTableBody: document.querySelector('#vocab-table tbody'),
        addRowBtn: document.getElementById('add-row-btn'),
        resetDataBtn: document.getElementById('reset-data-btn'),
        importBtn: document.getElementById('import-btn'),
        exportBtn: document.getElementById('export-btn'),
        importFile: document.getElementById('import-file'),
        apiKeyInput: document.getElementById('gemini-api-key'),
        fillAiBtn: document.getElementById('fill-ai-btn'),

        // Game Elements
        startGameBtn: document.getElementById('start-game-btn'),
        stopGameBtn: document.getElementById('stop-game-btn'),
        gameSection: document.getElementById('game-view'),
        questionText: document.getElementById('question-text'),
        questionHint: document.getElementById('question-hint'),
        optionsArea: document.getElementById('options-area'),
        inputArea: document.getElementById('input-area'),
        answerInput: document.getElementById('answer-input'),
        submitAnswerBtn: document.getElementById('submit-answer-btn'),
        feedbackArea: document.getElementById('feedback-area'),
        feedbackMessage: document.getElementById('feedback-message'),
        correctAnswerDisplay: document.getElementById('correct-answer-display'),
        correctText: document.getElementById('correct-text'),
        nextQuestionBtn: document.getElementById('next-question-btn'),
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        streakCounter: document.getElementById('streak-counter'),

        // Chat
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendChatBtn: document.getElementById('send-chat-btn'),
        chatImageUpload: document.getElementById('ai-image-upload'),
        attachmentPreview: document.getElementById('attachment-preview'),
        vocabSearch: document.getElementById('vocab-search'),
        aiChatPopup: document.getElementById('ai-chat-popup'),
        aiFab: document.getElementById('ai-fab'),
        closeChatBtn: document.getElementById('close-chat-btn')
    };

    loadData();
    renderTable();
    setupEventListeners();
    setupTabs();
    initPractice(); // From practice.js

    console.log("EduVocab Ready!");
});

// --- Core Logic: Navigation & Events ---

function setupTabs() {
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dom.tabs.forEach(t => t.classList.remove('active'));
            dom.tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');
        });
    });
}

function setupEventListeners() {
    // Data Management
    if (dom.addRowBtn) dom.addRowBtn.addEventListener('click', addRow);
    if (dom.vocabTableBody) dom.vocabTableBody.addEventListener('input', () => saveData(false));
    if (dom.resetDataBtn) dom.resetDataBtn.addEventListener('click', resetAllData);

    // API Key Auto-save
    if (dom.apiKeyInput) dom.apiKeyInput.addEventListener('input', handleSaveApiKeySilent);

    // Import/Export
    if (dom.importBtn) dom.importBtn.addEventListener('click', () => dom.importFile.click());
    if (dom.importFile) dom.importFile.addEventListener('change', handleImport);
    if (dom.exportBtn) dom.exportBtn.addEventListener('click', handleExport);

    // AI Features (defined in ai.js)
    if (dom.fillAiBtn) dom.fillAiBtn.addEventListener('click', fillDataWithAI);
    if (dom.sendChatBtn) dom.sendChatBtn.addEventListener('click', sendChatMessage);
    if (dom.chatInput) {
        dom.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    if (dom.chatImageUpload) dom.chatImageUpload.addEventListener('change', handleChatImageUpload);
    if (dom.aiFab) dom.aiFab.onclick = toggleAIChat;
    if (dom.closeChatBtn) dom.closeChatBtn.onclick = toggleAIChat;

    // Search
    if (dom.vocabSearch) dom.vocabSearch.addEventListener('input', () => renderTable(dom.vocabSearch.value));

    // Spreadsheet Navigation
    if (dom.vocabTableBody) dom.vocabTableBody.addEventListener('keydown', handleSpreadsheetNav);

    // Game Control (defined in practice.js)
    if (dom.startGameBtn) dom.startGameBtn.addEventListener('click', startGame);
    if (dom.stopGameBtn) dom.stopGameBtn.addEventListener('click', stopGame);
    if (dom.nextQuestionBtn) dom.nextQuestionBtn.addEventListener('click', nextQuestion);
    if (dom.submitAnswerBtn) dom.submitAnswerBtn.addEventListener('click', checkInputAnswer);
    if (dom.answerInput) {
        dom.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkInputAnswer();
        });
    }
}

function handleSaveApiKeySilent() {
    const key = dom.apiKeyInput.value.trim();
    if (!key) return;
    localStorage.setItem('gemini_api_key', key);
    localStorage.removeItem('gemini_working_model');
    debouncedAutoFill();
}

let autoFillTimer = null;
function debouncedAutoFill() {
    if (dom.fillAiBtn && dom.fillAiBtn.disabled) return;
    if (!dom.apiKeyInput || !dom.apiKeyInput.value.trim()) return;
    clearTimeout(autoFillTimer);
    autoFillTimer = setTimeout(() => {
        fillDataWithAI(); // From ai.js
    }, 2500);
}

// --- Table Management ---

function loadData() {
    const savedVocab = localStorage.getItem('eduspace_vocab');
    if (savedVocab) {
        vocabData = JSON.parse(savedVocab);
    } else {
        vocabData = [{ en: '', ipa: '', type: '', vi: '', usage: '' }];
    }

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey && dom.apiKeyInput) {
        dom.apiKeyInput.value = savedKey;
    }
}

function saveData(skipAutoFill = false) {
    if (!dom.vocabTableBody) return;
    const rows = Array.from(dom.vocabTableBody.querySelectorAll('tr'));

    rows.forEach(row => {
        const index = parseInt(row.getAttribute('data-original-index'));
        if (isNaN(index) || !vocabData[index]) return;

        const inputs = row.querySelectorAll('input, textarea');
        if (inputs.length >= 5) {
            vocabData[index].en = autoCapitalize(inputs[0].value);
            vocabData[index].ipa = inputs[1].value;
            vocabData[index].type = inputs[2].value;
            vocabData[index].vi = autoCapitalize(inputs[3].value);
            vocabData[index].usage = autoCapitalize(inputs[4].value);
        }
    });

    localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
    if (!skipAutoFill) debouncedAutoFill();
}

function renderTable(filterQuery = '') {
    if (!dom.vocabTableBody) return;
    dom.vocabTableBody.innerHTML = '';
    const query = filterQuery ? filterQuery.toLowerCase().trim() : (dom.vocabSearch ? dom.vocabSearch.value.toLowerCase().trim() : '');

    vocabData.forEach((item, index) => {
        if (query) {
            const matchEn = (item.en || '').toLowerCase().includes(query);
            const matchVi = (item.vi || '').toLowerCase().includes(query);
            const matchIpa = (item.ipa || '').toLowerCase().includes(query);
            if (!matchEn && !matchVi && !matchIpa) return;
        }
        addRowToDom(item, index);
    });
}

function addRow() {
    const newItem = { en: '', ipa: '', type: '', vi: '', usage: '' };
    vocabData.push(newItem);
    addRowToDom(newItem, vocabData.length - 1);
    saveData(true);
}

function addRowToDom(item, index) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-indigo-50/10 transition-colors group border-b border-slate-50';
    tr.setAttribute('data-original-index', index);
    tr.innerHTML = `
        <td class="col-en px-4 py-1 border-r border-slate-100">
            <div class="flex items-start gap-1">
                <textarea placeholder="English" class="vocab-input" oninput="autoHeight(this)" rows="1">${item.en || ''}</textarea>
                <button class="mt-3 p-1 text-slate-300 hover:text-indigo-500 transition-colors" onclick="speak('${item.en || ''}')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                </button>
            </div>
        </td>
        <td class="col-ipa px-4 py-1 border-r border-slate-100">
            <textarea placeholder="/.../" class="vocab-input" oninput="autoHeight(this)" rows="1">${item.ipa || ''}</textarea>
        </td>
        <td class="col-type px-4 py-1 border-r border-slate-100">
            <textarea placeholder="type" class="vocab-input" oninput="autoHeight(this)" rows="1">${item.type || ''}</textarea>
        </td>
        <td class="col-vi px-4 py-1 border-r border-slate-100">
            <textarea placeholder="Tiếng Việt" class="vocab-input" oninput="autoHeight(this)" rows="1">${item.vi || ''}</textarea>
        </td>
        <td class="col-usage px-4 py-1 border-r border-slate-100">
            <textarea placeholder="Example sentence..." class="vocab-input" oninput="autoHeight(this)" rows="1">${item.usage || ''}</textarea>
        </td>
        <td class="px-2 py-1 text-center">
            <button class="delete-row-btn p-2 text-slate-200 hover:text-red-500 transition-all transform hover:scale-110" onclick="deleteRow(event, ${index})">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </td>
    `;
    dom.vocabTableBody.appendChild(tr);
    tr.querySelectorAll('textarea').forEach(tx => autoHeight(tx));
}

window.deleteRow = function (event, index) {
    if (event) event.stopPropagation();
    vocabData.splice(index, 1);
    localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
    renderTable();
};

// Utilities
function autoCapitalize(str) {
    if (!str || typeof str !== 'string') return str;
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
}

window.autoHeight = function (element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight + 5) + "px";
}

window.speak = function (text) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

function handleSpreadsheetNav(e) {
    const current = document.activeElement;
    if (!current || !current.classList.contains('vocab-input')) return;

    const td = current.closest('td');
    const tr = td.closest('tr');
    const colIndex = td.cellIndex;
    const rowIndex = tr.rowIndex - 1;

    let target = null;
    switch (e.key) {
        case 'ArrowUp':
            if (rowIndex > 0) target = dom.vocabTableBody.rows[rowIndex - 1].cells[colIndex].querySelector('.vocab-input');
            break;
        case 'ArrowDown':
            if (rowIndex < dom.vocabTableBody.rows.length - 1) target = dom.vocabTableBody.rows[rowIndex + 1].cells[colIndex].querySelector('.vocab-input');
            break;
        case 'ArrowLeft':
            if (current.selectionStart === 0 && colIndex > 0) target = tr.cells[colIndex - 1].querySelector('.vocab-input');
            break;
        case 'ArrowRight':
            if (current.selectionEnd === current.value.length && colIndex < tr.cells.length - 2) target = tr.cells[colIndex + 1].querySelector('.vocab-input');
            break;
    }

    if (target) {
        e.preventDefault();
        target.focus();
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const len = target.value.length;
            target.setSelectionRange(len, len);
        }
    }
}

function resetAllData() {
    if (confirm('Xóa toàn bộ dữ liệu?')) {
        localStorage.removeItem('eduspace_vocab');
        vocabData = [{ en: '', ipa: '', type: '', vi: '', usage: '' }];
        renderTable();
    }
}

function handleExport() {
    saveData(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vocabData));
    const a = document.createElement('a');
    a.href = dataStr; a.download = "eduspace_vocab.json";
    a.click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) { vocabData = data; saveData(true); renderTable(); }
        } catch (err) { alert('Lỗi file!'); }
    };
    reader.readAsText(file);
}

function toggleApiKey() {
    if (!dom.apiKeyInput) return;
    dom.apiKeyInput.type = dom.apiKeyInput.type === 'password' ? 'text' : 'password';
}

function toggleAIChat() {
    if (!dom.aiChatPopup) return;
    const isHidden = dom.aiChatPopup.classList.contains('hidden');
    if (isHidden) {
        dom.aiChatPopup.classList.remove('hidden');
        dom.aiChatPopup.classList.add('flex');
        if (dom.chatInput) dom.chatInput.focus();
    } else {
        dom.aiChatPopup.classList.add('hidden');
        dom.aiChatPopup.classList.remove('flex');
    }
}
