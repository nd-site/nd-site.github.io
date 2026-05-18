/**
 * EduAI UI Component
 * Shared AI widget for all EduSpace pages.
 * Supports: KaTeX, Marked.js, auto-context, and premium glassmorphism.
 */

const eduspaceAI_UI = (function () {
    const CONFIG = {
        primary: '#0070f3',
        bg: '#f8fafc',
        maxWidth: '380px',
        maxHeight: '550px'
    };

    function injectStyles() {
        if (document.getElementById('eduspace-ai-styles')) return;
        const style = document.createElement('style');
        style.id = 'eduspace-ai-styles';
        style.innerHTML = `
            .edu-ai-toggle {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: ${CONFIG.primary};
                color: white;
                display: none; /* Controlled by visibility logic */
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 10px 25px -5px rgba(0, 112, 243, 0.4);
                z-index: 1000;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .edu-ai-toggle:hover { transform: scale(1.1); }
            .edu-ai-toggle svg { width: 28px; height: 28px; }

            #edu-ai-widget {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: ${CONFIG.maxWidth};
                max-width: calc(100vw - 48px);
                height: ${CONFIG.maxHeight};
                max-height: calc(100vh - 120px);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 32px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
                animation: aiShow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes aiShow {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .ai-header {
                padding: 18px 24px;
                background: linear-gradient(135deg, ${CONFIG.primary} 0%, #3291ff 100%);
                color: white;
                font-weight: 800;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: rgba(248, 250, 252, 0.5);
                scrollbar-width: thin;
            }
            .ai-messages::-webkit-scrollbar { width: 4px; }
            .ai-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            .msg {
                padding: 12px 16px;
                border-radius: 20px;
                font-size: 14px;
                line-height: 1.6;
                max-width: 85%;
                word-wrap: break-word;
            }
            .msg-ai {
                background: white;
                color: #1e293b;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .msg-user {
                background: ${CONFIG.primary};
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
            }

            .ai-input-area {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #f1f5f9;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .ai-input-area input {
                flex: 1;
                background: #f1f5f9;
                border: none;
                padding: 10px 18px;
                border-radius: 9999px;
                outline: none;
                font-size: 14px;
                transition: background 0.2s;
            }
            .ai-input-area input:focus { background: #e2e8f0; }
            .ai-send-btn {
                width: 40px;
                height: 40px;
                background: ${CONFIG.primary};
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .ai-send-btn:hover { transform: scale(1.1); }

            /* Markdown content styling */
            .markdown-content p { margin-bottom: 0.5em; }
            .markdown-content pre { background: #1e293b; color: white; padding: 10px; border-radius: 8px; font-size: 12px; margin: 8px 0; overflow-x: auto; }
            .markdown-content code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
            .markdown-content b, .markdown-content strong { font-weight: 700; color: ${CONFIG.primary}; }
        `;
        document.head.appendChild(style);
    }

    function init() {
        injectStyles();
        if (document.getElementById('edu-ai-widget')) return;

        const html = `
            <div id="ai-toggle" class="edu-ai-toggle" onclick="eduspaceAI_UI.toggle()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>

            <div id="edu-ai-widget">
                <div class="ai-header">
                    <div class="flex items-center gap-2">
                        <span>✨</span>
                        <span>EduAI Assistant</span>
                    </div>
                    <button onclick="eduspaceAI_UI.toggle()" class="hover:opacity-70 transition-opacity">✕</button>
                </div>
                <div id="ai-chat-messages" class="ai-messages">
                    <div class="msg msg-ai">Xin chào! Tôi là EduAI. Bạn cần tôi hỗ trợ gì không?</div>
                </div>
                <div class="ai-input-area">
                    <input type="text" id="ai-input" placeholder="Hỏi EduAI..." onkeypress="if(event.key==='Enter') eduspaceAI_UI.send()">
                    <div onclick="eduspaceAI_UI.send()" class="ai-send-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        updateVisibility();
    }

    function toggle() {
        const widget = document.getElementById('edu-ai-widget');
        if (!widget) return;
        const isOpen = widget.style.display === 'flex';
        widget.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            document.getElementById('ai-input').focus();
        }
    }

    async function send() {
        const input = document.getElementById('ai-input');
        const container = document.getElementById('ai-chat-messages');
        const text = input.value.trim();
        if (!text) return;

        // User message
        appendMessage(text, 'user');
        input.value = '';

        // Loading
        const loadingId = 'ai-load-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'msg msg-ai';
        loadingDiv.innerHTML = '<span style="opacity:0.5">⏳ EduAI đang suy nghĩ...</span>';
        container.appendChild(loadingDiv);
        container.scrollTop = container.scrollHeight;

        try {
            // Get context from page if available
            const context = typeof window.getAIContext === 'function' ? window.getAIContext() : '';
            
            // Use eduspaceAI from data_modal.js
            const aiResponseRaw = await eduspaceAI.call({
                contents: [{ 
                    role: 'user', 
                    parts: [{ text: `Bạn là trợ lý học tập EduAI. ${context ? 'Dựa trên ngữ cảnh: ' + context + '.' : ''} Hãy trả lời câu hỏi: ${text}. Sử dụng Markdown để định dạng.` }] 
                }]
            });

            loadingDiv.remove();
            appendMessage(aiResponseRaw, 'ai');
        } catch (e) {
            loadingDiv.innerHTML = `<span class="text-red-500">Lỗi: ${e.message}</span>`;
        }
    }

    function appendMessage(content, role) {
        const container = document.getElementById('ai-messages') || document.getElementById('ai-chat-messages');
        const div = document.createElement('div');
        div.className = `msg msg-${role} ${role === 'ai' ? 'markdown-content' : ''}`;
        
        let html = content;
        if (role === 'ai') {
            if (typeof marked !== 'undefined') {
                html = marked.parse(content);
            } else {
                // Basic formatting if marked not loaded
                html = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            }
        }
        
        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        // Render math if KaTeX is available
        if (role === 'ai' && typeof renderMathInElement === 'function') {
            renderMathInElement(div, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    function updateVisibility() {
        const toggleBtn = document.getElementById('ai-toggle');
        if (!toggleBtn) return;

        // Hide if on the dedicated assistant page
        if (window.location.pathname.includes('/eduspace/assistant/')) {
            toggleBtn.style.display = 'none';
            return;
        }

        // Default logic: show toggle if not on a "result" or "quiz" screen
        // For general pages, we often want the AI always available.
        // We'll provide a way to override this.
        if (window.eduAIShowOverride !== undefined) {
            toggleBtn.style.display = window.eduAIShowOverride ? 'flex' : 'none';
            return;
        }

        // Auto-show for most pages
        toggleBtn.style.display = 'flex';
    }

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init: init,
        toggle: toggle,
        send: send,
        updateVisibility: updateVisibility,
        appendMessage: appendMessage
    };
})();
