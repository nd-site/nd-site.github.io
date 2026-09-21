/**
 * ND Labs — NDAI Assistant (Trợ lý đa năng của ND Labs)
 * 
 * Tác dụng:
 *   • Cung cấp Widget khung chat NDAI Assistant đa năng cho toàn bộ hệ thống ND Labs (ngoại trừ EduSpace).
 *   • Hỗ trợ giải đáp về Mini World, ChatND, Tiện ích, Công cụ, Giải trí, Kỹ thuật và mọi câu hỏi của người dùng.
 *   • Giao diện hiện đại, bóng bẩy với gradient xanh-tím đặc trưng của ND Labs, hỗ trợ định dạng Markdown.
 */

const NDAI_Assistant = (function () {
    const CONFIG = {
        name: 'NDAI Assistant',
        primary: '#7928ca',
        gradient: 'linear-gradient(135deg, #0070f3 0%, #7928ca 100%)',
        bg: '#f8fafc',
        maxWidth: '380px',
        maxHeight: '550px'
    };

    function injectStyles() {
        if (document.getElementById('nd-ai-styles')) return;
        const style = document.createElement('style');
        style.id = 'nd-ai-styles';
        style.innerHTML = `
            .nd-ai-toggle {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: ${CONFIG.gradient};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 10px 25px -5px rgba(121, 40, 202, 0.45);
                z-index: 99000;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Plus Jakarta Sans', sans-serif !important;
            }
            .nd-ai-toggle:hover { transform: scale(1.1); box-shadow: 0 15px 30px -5px rgba(121, 40, 202, 0.6); }
            .nd-ai-toggle svg { width: 28px; height: 28px; }

            #nd-ai-widget {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: ${CONFIG.maxWidth};
                max-width: calc(100vw - 48px);
                height: ${CONFIG.maxHeight};
                max-height: calc(100vh - 120px);
                background: rgba(255, 255, 255, 0.96);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: 32px;
                box-shadow: 0 25px 50px -12px rgba(121, 40, 202, 0.22);
                display: none;
                flex-direction: column;
                z-index: 99001;
                overflow: hidden;
                animation: ndAiShow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: 'Plus Jakarta Sans', sans-serif !important;
            }
            @keyframes ndAiShow {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .nd-ai-header {
                padding: 16px 22px;
                background: ${CONFIG.gradient};
                color: white;
                font-weight: 800;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            }

            .nd-ai-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: rgba(248, 250, 252, 0.5);
                scrollbar-width: thin;
            }
            .nd-ai-messages::-webkit-scrollbar { width: 4px; }
            .nd-ai-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            .nd-msg {
                padding: 12px 16px;
                border-radius: 20px;
                font-size: 13.5px;
                line-height: 1.6;
                max-width: 85%;
                word-wrap: break-word;
            }
            .nd-msg-ai {
                background: white;
                color: #1e293b;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .nd-msg-user {
                background: ${CONFIG.gradient};
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                box-shadow: 0 4px 12px rgba(121, 40, 202, 0.25);
            }

            .nd-ai-input-area {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #f1f5f9;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .nd-ai-input-area input {
                flex: 1;
                background: #f1f5f9;
                border: none;
                padding: 10px 18px;
                border-radius: 9999px;
                outline: none;
                font-size: 13.5px;
                transition: background 0.2s;
                font-family: inherit;
            }
            .nd-ai-input-area input:focus { background: #e2e8f0; }
            .nd-ai-send-btn {
                width: 40px;
                height: 40px;
                background: ${CONFIG.gradient};
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .nd-ai-send-btn:hover { transform: scale(1.1); }

            /* Markdown styling */
            .nd-markdown-content p { margin-bottom: 0.5em; }
            .nd-markdown-content pre { background: #0f172a; color: #f8fafc; padding: 10px; border-radius: 10px; font-size: 12px; margin: 8px 0; overflow-x: auto; }
            .nd-markdown-content code { background: #f1f5f9; padding: 2px 5px; border-radius: 5px; font-family: monospace; color: #7928ca; font-weight: 600; }
            .nd-markdown-content b, .nd-markdown-content strong { font-weight: 800; color: #0070f3; }

            @media (max-width: 768px) {
                .nd-ai-toggle {
                    bottom: 16px;
                    right: 16px;
                    width: 50px;
                    height: 50px;
                    border-radius: 25px;
                }
                .nd-ai-toggle svg {
                    width: 22px;
                    height: 22px;
                }
                #nd-ai-widget {
                    bottom: 80px;
                    right: 16px;
                    max-width: calc(100vw - 32px);
                    top: 90px !important;
                    height: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        injectStyles();
        if (document.getElementById('nd-ai-widget')) return;

        const html = `
            <div id="nd-ai-toggle" class="nd-ai-toggle" onclick="NDAI_Assistant.toggle()" title="Trợ lý NDAI Assistant">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            </div>

            <div id="nd-ai-widget">
                <div class="nd-ai-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>🤖</span>
                        <span>NDAI Assistant</span>
                    </div>
                    <button onclick="NDAI_Assistant.toggle()" style="background:none; border:none; color:white; font-size:16px; cursor:pointer; font-weight:bold;">✕</button>
                </div>
                <div id="nd-ai-chat-messages" class="nd-ai-messages">
                    <div id="nd-ai-welcome-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 28px 16px; height: 100%; color: #64748b; font-family: inherit; box-sizing: border-box;">
                        <div style="font-size: 32px; margin-bottom: 12px; background: ${CONFIG.gradient}; width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 20px rgba(121,40,202,0.2);">🤖</div>
                        <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin: 8px 0 4px;">Chào mừng bạn đến với NDAI!</h3>
                        <p style="font-size: 12px; font-weight: 500; line-height: 1.5; margin-bottom: 18px; max-width: 250px; color: #64748b;">Trợ lý AI đa năng của ND Labs sẵn sàng hỗ trợ bạn về Mini World, ChatND, tiện ích và giải đáp mọi câu hỏi.</p>
                        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 270px;">
                            <div onclick="NDAI_Assistant.useSuggestion('Hướng dẫn chơi Mini World và quản lý kinh tế')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#7928ca'; this.style.color='#7928ca'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">🎮 Hướng dẫn Mini World & thuế</div>
                            <div onclick="NDAI_Assistant.useSuggestion('Giới thiệu các tính năng của ChatND')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#7928ca'; this.style.color='#7928ca'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">💬 Khám phá các tính năng ChatND</div>
                            <div onclick="NDAI_Assistant.useSuggestion('Hệ sinh thái ND Labs gồm những gì?')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#7928ca'; this.style.color='#7928ca'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">🌟 Giới thiệu Hệ sinh thái ND Labs</div>
                        </div>
                    </div>
                </div>
                <div class="nd-ai-input-area">
                    <input type="text" id="nd-ai-input" placeholder="Hỏi NDAI Assistant..." onkeypress="if(event.key==='Enter') NDAI_Assistant.send()">
                    <div onclick="NDAI_Assistant.send()" class="nd-ai-send-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    function toggle() {
        const widget = document.getElementById('nd-ai-widget');
        if (!widget) return;
        const isOpen = widget.style.display === 'flex';
        widget.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            document.getElementById('nd-ai-input')?.focus();
        }
    }

    let _hasGreeted = false;
    let _isSending = false;

    function splitIntoSentences(text) {
        const raw = text
            .replace(/\n{2,}/g, '\n')
            .replace(/([.!?])\s+/g, '$1\n')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        const merged = [];
        for (const s of raw) {
            if (merged.length && s.length < 20)
                merged[merged.length - 1] += ' ' + s;
            else
                merged.push(s);
        }
        return merged;
    }

    async function sendBubbles(sentences, container) {
        for (let i = 0; i < sentences.length; i++) {
            const delay = Math.min(300 + sentences[i].length * 18, 1200);
            await new Promise(r => setTimeout(r, delay));
            appendMessage(sentences[i], 'ai');
        }
    }

    async function send() {
        if (_isSending) return;
        const input = document.getElementById('nd-ai-input');
        const container = document.getElementById('nd-ai-chat-messages');
        const text = input?.value?.trim();
        if (!text) return;

        _isSending = true;
        appendMessage(text, 'user');
        if (input) {
            input.value = '';
            input.disabled = true;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'nd-msg nd-msg-ai';
        loadingDiv.innerHTML = '<span style="opacity:0.45; font-size:20px; letter-spacing:2px">•••</span>';
        container.appendChild(loadingDiv);
        container.scrollTop = container.scrollHeight;

        try {
            const greetInstruction = _hasGreeted
                ? 'Không chào hỏi lại, trả lời thẳng vào trọng tâm câu hỏi.'
                : 'Chào người dùng ngắn gọn, thân thiện rồi giải đáp ngay.';

            const systemPrompt = `Bạn là NDAI Assistant — trợ lý thông minh chính thức của ND Labs. ${greetInstruction} Trả lời ngắn gọn, súc tích, thông minh và hữu ích (tối đa 3-5 câu). Hỗ trợ về tất cả tính năng của ND Labs (ChatND, Mini World, tiện ích, giải trí, kỹ thuật, tài khoản...). Sử dụng định dạng Markdown rõ ràng. Trang hiện tại người dùng đang xem: ${window.location.pathname}`;

            const aiCaller = window.eduspaceAI || window.ndAI_API;
            if (!aiCaller || typeof aiCaller.call !== 'function') {
                throw new Error("Dịch vụ AI chưa sẵn sàng");
            }

            const aiResponseRaw = await aiCaller.call({
                contents: [{
                    role: 'user',
                    parts: [{ text: systemPrompt + '\n\nNgười dùng hỏi: ' + text }]
                }]
            });

            loadingDiv.remove();
            if (!_hasGreeted) _hasGreeted = true;

            const sentences = splitIntoSentences(aiResponseRaw);
            await sendBubbles(sentences, container);

        } catch (e) {
            console.error('[NDAI Assistant] Error:', e.message);
            const isKeyErr = e.message && (e.message.includes('API Key') || e.message.includes('key') || e.message.includes('leaked') || e.message.includes('expired'));
            const userMsg = isKeyErr
                ? '⚠️ Tính năng AI đang tạm ngưng để bảo trì.'
                : '❌ Không thể kết nối NDAI Assistant. Vui lòng thử lại sau.';
            loadingDiv.innerHTML = `<span style="color:#ef4444; font-size:13px;">${userMsg}</span>`;
        } finally {
            _isSending = false;
            if (input) {
                input.disabled = false;
                input.focus();
            }
        }
    }

    function appendMessage(content, role) {
        const welcomeCard = document.getElementById('nd-ai-welcome-card');
        if (welcomeCard) welcomeCard.remove();

        const container = document.getElementById('nd-ai-chat-messages');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `nd-msg nd-msg-${role} ${role === 'ai' ? 'nd-markdown-content' : ''}`;
        
        let html = content;
        if (role === 'ai') {
            if (typeof marked !== 'undefined') {
                html = marked.parse(content);
            } else {
                html = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            }
        }
        
        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function useSuggestion(text) {
        if (_isSending) return;
        const input = document.getElementById('nd-ai-input');
        if (input) {
            input.value = text;
            send();
        }
    }

    function ask(text) {
        const widget = document.getElementById('nd-ai-widget');
        if (widget && widget.style.display !== 'flex') {
            widget.style.display = 'flex';
        }
        const input = document.getElementById('nd-ai-input');
        if (input) {
            input.value = text;
            send();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ndAI_UI = {
        init,
        toggle,
        send,
        useSuggestion,
        ask,
        appendMessage
    };

    return {
        init,
        toggle,
        send,
        useSuggestion,
        ask,
        appendMessage
    };
})();
