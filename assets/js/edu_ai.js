/**
 * EduSpace — EduAI Assistant (Trợ lý Học tập EduAI)
 * 
 * Tác dụng:
 *   • Cung cấp Widget khung chat EduAI Assistant dành riêng cho toàn bộ phân hệ EduSpace.
 *   • Hỗ trợ hiển thị công thức Toán học đẹp mắt thông qua KaTeX và văn bản định dạng Markdown bằng Marked.js.
 *   • Có khả năng đọc ngữ cảnh câu hỏi thi của trang hiện tại để trả lời chuẩn xác.
 *   • Tự động hiển thị ở chế độ Luyện tập và ẩn đi ở chế độ Thi thử để tránh gian lận.
 */

const EduAI_Assistant = (function () {
    const CONFIG = {
        name: 'EduAI Assistant',
        primary: '#0070f3',
        gradient: 'linear-gradient(135deg, #0070f3 0%, #3291ff 100%)',
        bg: '#f8fafc',
        maxWidth: '380px',
        maxHeight: '550px'
    };

    function injectStyles() {
        if (document.getElementById('edu-ai-styles')) return;
        const style = document.createElement('style');
        style.id = 'edu-ai-styles';
        style.innerHTML = `
            .edu-ai-toggle {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: ${CONFIG.gradient};
                color: white;
                display: none; /* Controlled by visibility logic */
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 10px 25px -5px rgba(0, 112, 243, 0.4);
                z-index: 99000;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Play', sans-serif !important;
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
                background: rgba(255, 255, 255, 0.96);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: 32px;
                box-shadow: 0 25px 50px -12px rgba(0, 112, 243, 0.18);
                display: none;
                flex-direction: column;
                z-index: 99001;
                overflow: hidden;
                animation: eduAiShow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: 'Play', sans-serif !important;
            }
            @keyframes eduAiShow {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .edu-ai-header {
                padding: 16px 22px;
                background: ${CONFIG.gradient};
                color: white;
                font-weight: 800;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            }

            .edu-ai-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: rgba(248, 250, 252, 0.5);
                scrollbar-width: thin;
            }
            .edu-ai-messages::-webkit-scrollbar { width: 4px; }
            .edu-ai-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            .edu-msg {
                padding: 12px 16px;
                border-radius: 20px;
                font-size: 14px;
                line-height: 1.6;
                max-width: 85%;
                word-wrap: break-word;
            }
            .edu-msg-ai {
                background: white;
                color: #1e293b;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .edu-msg-user {
                background: ${CONFIG.primary};
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
            }

            .edu-ai-input-area {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #f1f5f9;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .edu-ai-input-area input {
                flex: 1;
                background: #f1f5f9;
                border: none;
                padding: 10px 18px;
                border-radius: 9999px;
                outline: none;
                font-size: 14px;
                transition: background 0.2s;
            }
            .edu-ai-input-area input:focus { background: #e2e8f0; }
            .edu-ai-send-btn {
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
            .edu-ai-send-btn:hover { transform: scale(1.1); }

            /* Markdown content styling */
            .edu-markdown-content p { margin-bottom: 0.5em; }
            .edu-markdown-content pre { background: #1e293b; color: white; padding: 10px; border-radius: 8px; font-size: 12px; margin: 8px 0; overflow-x: auto; }
            .edu-markdown-content code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
            .edu-markdown-content b, .edu-markdown-content strong { font-weight: 700; color: ${CONFIG.primary}; }

            @media (max-width: 768px) {
                .edu-ai-toggle {
                    bottom: 16px;
                    right: 16px;
                    width: 50px;
                    height: 50px;
                    border-radius: 25px;
                }
                .edu-ai-toggle svg {
                    width: 22px;
                    height: 22px;
                }
                #edu-ai-widget {
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
        if (!document.querySelector('script[src*="font.js"]')) {
            const fontScript = document.createElement('script');
            fontScript.src = '/font/font.js';
            document.head.appendChild(fontScript);
        }

        injectStyles();
        if (document.getElementById('edu-ai-widget')) return;

        const html = `
            <div id="ai-toggle" class="edu-ai-toggle" onclick="EduAI_Assistant.toggle()" title="Trợ lý Học tập EduAI">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            </div>

            <div id="edu-ai-widget">
                <div class="edu-ai-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>✨</span>
                        <span>EduAI Assistant</span>
                    </div>
                    <button onclick="EduAI_Assistant.toggle()" style="background:none; border:none; color:white; font-size:16px; cursor:pointer; font-weight:bold;">✕</button>
                </div>
                <div id="ai-chat-messages" class="edu-ai-messages">
                    <div id="ai-welcome-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 32px 20px; height: 100%; color: #64748b; font-family: sans-serif; box-sizing: border-box;">
                        <div style="font-size: 32px; margin-bottom: 12px; background: ${CONFIG.gradient}; width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 20px rgba(0,112,243,0.15);">✨</div>
                        <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin: 8px 0 4px;">Chào mừng bạn đến với EduAI Assistant!</h3>
                        <p style="font-size: 12px; font-weight: 500; line-height: 1.5; margin-bottom: 20px; max-width: 240px; color: #64748b;">Hỏi bất kỳ câu hỏi hoặc bài tập nào để được trợ lý EduAI giải đáp chi tiết.</p>
                        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 260px;">
                            <div onclick="EduAI_Assistant.useSuggestion('Giải thích ý nghĩa số Pi')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='${CONFIG.primary}'; this.style.color='${CONFIG.primary}'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">💡 Giải thích ý nghĩa số Pi</div>
                            <div onclick="EduAI_Assistant.useSuggestion('Cách cân bằng phản ứng hóa học?')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='${CONFIG.primary}'; this.style.color='${CONFIG.primary}'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">🧪 Cân bằng phản ứng hóa học</div>
                            <div onclick="EduAI_Assistant.useSuggestion('Hướng dẫn giải câu hỏi này')" style="background: white; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #334155; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='${CONFIG.primary}'; this.style.color='${CONFIG.primary}'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#334155'">📐 Hướng dẫn giải câu hỏi này</div>
                        </div>
                    </div>
                </div>
                <div class="edu-ai-input-area">
                    <input type="text" id="ai-input" placeholder="Hỏi EduAI Assistant..." onkeypress="if(event.key==='Enter') EduAI_Assistant.send()">
                    <div onclick="EduAI_Assistant.send()" class="edu-ai-send-btn">
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
            document.getElementById('ai-input')?.focus();
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
        const input = document.getElementById('ai-input');
        const container = document.getElementById('ai-chat-messages');
        const text = input?.value?.trim();
        if (!text) return;

        _isSending = true;
        appendMessage(text, 'user');
        if (input) {
            input.value = '';
            input.disabled = true;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'edu-msg edu-msg-ai';
        loadingDiv.innerHTML = '<span style="opacity:0.45; font-size:20px; letter-spacing:2px">•••</span>';
        container.appendChild(loadingDiv);
        container.scrollTop = container.scrollHeight;

        try {
            const context = typeof window.getAIContext === 'function' ? window.getAIContext() : '';
            const greetInstruction = _hasGreeted
                ? 'Không chào hỏi, không dẫn nhập — trả lời thẳng vào câu hỏi.'
                : 'Chào người dùng ngắn gọn một câu rồi trả lời ngay.';

            const systemPrompt = `Bạn là EduAI Assistant — trợ lý học tập thông minh, ngắn gọn, súc tích của EduSpace (ND Labs). ${greetInstruction} Trả lời tối đa 3-5 câu, mỗi câu là một ý độc lập. Hãy sử dụng định dạng Markdown (in đậm, in nghiêng) và công thức Toán/Lý/Hóa bằng LaTeX (sử dụng dấu đô-la: $...$ cho công thức nội dòng và $$...$$ cho công thức dạng khối).${context ? ' Ngữ cảnh bài tập hiện tại trên màn hình: ' + context : ''}`;

            const aiCaller = window.eduspaceAI || window.ndAI_API;
            if (!aiCaller || typeof aiCaller.call !== 'function') {
                throw new Error("Dịch vụ AI chưa sẵn sàng");
            }

            const aiResponseRaw = await aiCaller.call({
                contents: [{
                    role: 'user',
                    parts: [{ text: systemPrompt + '\n\nCâu hỏi: ' + text }]
                }]
            });

            loadingDiv.remove();
            if (!_hasGreeted) _hasGreeted = true;

            const sentences = splitIntoSentences(aiResponseRaw);
            await sendBubbles(sentences, container);

        } catch (e) {
            console.error('[EduAI Assistant] Error:', e.message);
            const isKeyErr = e.message && (e.message.includes('API Key') || e.message.includes('key') || e.message.includes('leaked') || e.message.includes('expired'));
            const userMsg = isKeyErr
                ? '⚠️ Tính năng AI đang tạm ngưng để bảo trì.'
                : '❌ Không thể kết nối EduAI Assistant. Vui lòng thử lại sau.';
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
        const welcomeCard = document.getElementById('ai-welcome-card');
        if (welcomeCard) welcomeCard.remove();

        const container = document.getElementById('ai-messages') || document.getElementById('ai-chat-messages');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `edu-msg edu-msg-${role} ${role === 'ai' ? 'edu-markdown-content' : ''}`;
        
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

        if (window.location.pathname.includes('/eduspace/assistant/')) {
            toggleBtn.style.display = 'none';
            return;
        }

        if (window.eduAIShowOverride !== undefined) {
            toggleBtn.style.display = window.eduAIShowOverride ? 'flex' : 'none';
            return;
        }

        toggleBtn.style.display = 'flex';
    }

    function useSuggestion(text) {
        if (_isSending) return;
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = text;
            send();
        }
    }

    function eduAI_ask(text) {
        const widget = document.getElementById('edu-ai-widget');
        if (widget && widget.style.display !== 'flex') {
            widget.style.display = 'flex';
        }
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = text;
            send();
        }
    }
    window.eduAI_ask = eduAI_ask;

    window.getAIContext = function() {
        if (typeof quizData === 'undefined' || !quizData.activeQuestions || quizData.activeQuestions.length === 0) {
            return "";
        }
        try {
            const q = quizData.activeQuestions[currentIndex];
            if (!q) return "";

            let context = `Thông tin câu hỏi hiện tại trên màn hình:\n`;
            context += `- Loại câu hỏi: ${q.type}\n`;
            context += `- Đề bài: ${q.question || ''}\n`;
            
            if (q.type === 'multiple' && q.options) {
                context += `- Các phương án lựa chọn:\n`;
                q.options.forEach((opt, idx) => {
                    context += `  + ${String.fromCharCode(65 + idx)}. ${opt}\n`;
                });
                
                const isChecked = typeof questionChecked !== 'undefined' && questionChecked[currentIndex];
                const hasAnswered = typeof userAnswers !== 'undefined' && userAnswers[currentIndex] !== null && userAnswers[currentIndex] !== undefined;
                
                if (isChecked) {
                    context += `- Đáp án đúng theo đề bài: ${String.fromCharCode(65 + q.correct)}\n`;
                    if (hasAnswered) {
                        context += `- Học sinh đã chọn phương án: ${String.fromCharCode(65 + userAnswers[currentIndex])}\n`;
                    }
                    if (q.explanation) {
                        context += `- Giải thích chi tiết sẵn có: ${q.explanation}\n`;
                    }
                } else {
                    if (hasAnswered) {
                        context += `- Học sinh đang chọn phương án: ${String.fromCharCode(65 + userAnswers[currentIndex])} (chưa nhấn kiểm tra)\n`;
                    }
                }
            } else if (q.type === 'truefalse' && q.options) {
                context += `- Các phát biểu Đúng/Sai:\n`;
                q.options.forEach((opt, idx) => {
                    context += `  + ${String.fromCharCode(65 + idx)}. ${opt}\n`;
                });
                
                const isChecked = typeof questionChecked !== 'undefined' && questionChecked[currentIndex];
                const hasAnswered = typeof userAnswers !== 'undefined' && userAnswers[currentIndex];
                
                if (isChecked) {
                    const correctArr = q.correctAnswers || q.correct || [];
                    context += `- Đáp án đúng cho từng phát biểu:\n`;
                    q.options.forEach((opt, idx) => {
                        context += `  + ${String.fromCharCode(65 + idx)}: ${correctArr[idx] ? 'Đúng' : 'Sai'}\n`;
                    });
                    if (hasAnswered) {
                        context += `- Lựa chọn của học sinh:\n`;
                        q.options.forEach((opt, idx) => {
                            const choice = hasAnswered[idx] === true ? 'Đúng' : (hasAnswered[idx] === false ? 'Sai' : 'Chưa chọn');
                            context += `  + ${String.fromCharCode(65 + idx)}: ${choice}\n`;
                        });
                    }
                    if (q.explanation) {
                        context += `- Giải thích chi tiết sẵn có: ${q.explanation}\n`;
                    }
                } else {
                    if (hasAnswered) {
                        context += `- Lựa chọn hiện tại của học sinh (chưa nhấn kiểm tra):\n`;
                        q.options.forEach((opt, idx) => {
                            const choice = hasAnswered[idx] === true ? 'Đúng' : (hasAnswered[idx] === false ? 'Sai' : 'Chưa chọn');
                            context += `  + ${String.fromCharCode(65 + idx)}: ${choice}\n`;
                        });
                    }
                }
            } else if (q.type === 'short' || q.type === 'essay') {
                const isChecked = typeof questionChecked !== 'undefined' && questionChecked[currentIndex];
                const hasAnswered = typeof userAnswers !== 'undefined' && userAnswers[currentIndex] !== null && userAnswers[currentIndex] !== undefined;
                
                if (isChecked) {
                    context += `- Đáp án chính xác/gợi ý: ${q.correct || q.suggested || ''}\n`;
                    if (hasAnswered) {
                        context += `- Học sinh đã nhập: ${userAnswers[currentIndex]}\n`;
                    }
                    if (q.explanation) {
                        context += `- Giải thích chi tiết sẵn có: ${q.explanation}\n`;
                    }
                } else {
                    if (hasAnswered) {
                        context += `- Học sinh đang nhập: ${userAnswers[currentIndex]} (chưa nhấn kiểm tra)\n`;
                    }
                }
            }
            
            return context;
        } catch (err) {
            console.error("Lỗi lấy ngữ cảnh câu hỏi:", err);
            return "";
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export both names for maximum compatibility
    window.eduspaceAI_UI = {
        init,
        toggle,
        send,
        useSuggestion,
        updateVisibility,
        appendMessage
    };

    return {
        init,
        toggle,
        send,
        useSuggestion,
        updateVisibility,
        appendMessage
    };
})();
