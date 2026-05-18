/**
 * EduSpace AI Connection & API Service (api-service.js)
 *
 * TÁCH BIỆT KẾT NỐI API & FIREBASE:
 * - Chịu trách nhiệm thực hiện tất cả kết nối tới Gemini AI API.
 * - Tự động định vị và giải mã khóa từ Firebase Realtime Database nếu không có khóa tĩnh.
 * - Hỗ trợ cơ chế bảo mật 3 tầng cực kỳ an toàn.
 */

window.eduspaceAI = (function () {
    let sessionModel = window.getStableModel?.() || 'gemini-3.1-flash-lite';
    let _cachedModels = null;

    // Tầng 1: Cloud Function proxy URL
    const FUNCTION_PROXY_URL = (
        typeof EDU_CONFIG !== 'undefined' &&
        EDU_CONFIG.geminiFunctionUrl &&
        !EDU_CONFIG.geminiFunctionUrl.includes('PLACEHOLDER')
    ) ? EDU_CONFIG.geminiFunctionUrl : null;

    // ─── Helpers ────────────────────────────────────────────────────────────

    /** Kiểm tra lỗi key — dừng toàn bộ retry */
    function isKeyError(msg) {
        const m = msg.toLowerCase();
        return (
            m.includes('expired') ||
            m.includes('api key expired') ||
            m.includes('api key not valid') ||
            m.includes('api_key_invalid') ||
            m.includes('api key not found') ||
            m.includes('invalid api key') ||
            m.includes('leaked') ||
            m.includes('revoked') ||
            m.includes('permission_denied') ||
            m.includes('api key')
        );
    }

    /** Danh sách models ưu tiên Gemini 3.1, tối đa 3 */
    function buildModelList(discovered) {
        const PRIORITY = [
            'gemini-3.1-flash-lite',
            'gemini-3.1-pro',
            'gemini-2.5-flash',
            'gemini-2.5-pro'
        ];
        const allowed = (discovered || []).filter(m =>
            (m.includes('3.1') || m.includes('3.') || m.includes('2.5')) &&
            !m.includes('deep-research') &&
            !m.includes('thinking') &&
            !m.includes('tts') &&
            !m.includes('live')
        );
        const sorted = [
            ...PRIORITY.filter(p => allowed.some(m => m === p || m.startsWith(p))),
            ...allowed.filter(m => !PRIORITY.some(p => m === p || m.startsWith(p)))
        ];
        // Nếu không có model nào từ discovery, dùng danh sách mặc định
        return (sorted.length ? sorted : PRIORITY).slice(0, 3);
    }

    // ─── Model Discovery ─────────────────────────────────────────────────────

    async function discoverModels(apiKey) {
        if (_cachedModels) return _cachedModels;

        const cached = localStorage.getItem('edu_models_v2');
        if (cached) {
            try {
                const { models, ts } = JSON.parse(cached);
                if (Date.now() - ts < 86_400_000 && models?.[0]?.includes('3.')) {
                    _cachedModels = models;
                    return models;
                }
            } catch (_) {}
            localStorage.removeItem('edu_models_v2');
        }

        const discovered = [];
        for (const ver of ['v1beta', 'v1']) {
            try {
                const r = await fetch(
                    `https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`
                );
                if (!r.ok) continue;
                const d = await r.json();
                const names = (d.models || [])
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name.split('/').pop());
                for (const n of names) if (!discovered.includes(n)) discovered.push(n);
            } catch (_) {}
        }

        const result = buildModelList(discovered);
        _cachedModels = result;
        localStorage.setItem('edu_models_v2', JSON.stringify({ models: result, ts: Date.now() }));
        return result;
    }

    // ─── Tầng 2: Key từ Firebase DB ──────────────────────────────────────────

    async function getKeyFromDatabase() {
        try {
            const keys = await window.getEduKeys?.();
            if (!keys?.fbDatabaseURL) return null;
            
            // Đợi Firebase Auth SDK được nạp và khởi tạo
            let retries = 0;
            while (!window.firebaseAuth && retries < 20) {
                await new Promise(r => setTimeout(r, 100)); // Đợi tối đa 2 giây
                retries++;
            }
            
            const auth = window.firebaseAuth;
            if (!auth) {
                console.warn("[EduAI] Firebase Auth không tìm thấy sau thời gian chờ.");
                return null;
            }

            // Đợi trạng thái xác thực Auth giải quyết xong
            if (!auth.currentUser) {
                await new Promise((resolve) => {
                    const unsubscribe = auth.onAuthStateChanged((user) => {
                        unsubscribe();
                        resolve(user);
                    });
                });
            }

            if (!auth.currentUser) {
                console.log("[EduAI] Không có người dùng xác thực. Sử dụng API dự phòng mặc định.");
                return null;
            }

            const token = await auth.currentUser.getIdToken();
            const r = await fetch(`${keys.fbDatabaseURL}/config/geminiKey.json?auth=${token}`);
            if (!r.ok) return null;
            return (await r.json()) || null;
        } catch (e) { 
            console.error("[EduAI] Lỗi lấy khóa từ Database:", e);
            return null; 
        }
    }

    // ─── Core Gemini Call ────────────────────────────────────────────────────

    async function callDirect(apiKey, contents, modelName) {
        for (const ver of ['v1beta', 'v1']) {
            let response;
            try {
                response = await fetch(
                    `https://generativelanguage.googleapis.com/${ver}/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents,
                            safetySettings: [
                                { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
                                { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
                                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                            ]
                        })
                    }
                );
            } catch (netErr) {
                throw new Error('Lỗi mạng: ' + netErr.message);
            }

            // Rate limit → thử endpoint kế
            if (response.status === 429) continue;

            const data = await response.json();

            if (data.error) {
                const msg = data.error.message || '';
                // Lỗi key: ném ngay, không retry
                if (isKeyError(msg)) throw Object.assign(new Error(msg), { isKeyError: true });
                // Lỗi model không hỗ trợ endpoint này → thử endpoint kế
                if (response.status === 404 || response.status === 400) continue;
                throw new Error(msg);
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        }
        return null; // Model không dùng được, thử model tiếp theo
    }

    // ─── Main ────────────────────────────────────────────────────────────────

    async function callGeminiAPI(payload) {
        const { contents } = payload;
        const preferredModel = payload.model || sessionModel;

        // TẦNG 1: Cloud Function Proxy
        if (FUNCTION_PROXY_URL) {
            try {
                const r = await fetch(FUNCTION_PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents, model: preferredModel })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
                if (d.text) return d.text;
            } catch (e) {
                console.warn('[EduAI] Proxy lỗi, thử direct:', e.message);
            }
        }

        // TẦNG 2 & 3: Lấy API key
        // Ưu tiên key tĩnh được inject từ GitHub Actions (nhanh nhất)
        let apiKey = await window.getGeminiApiKey?.();
        
        // Nếu không có key tĩnh, thử lấy từ Firebase Database
        if (!apiKey || apiKey.includes('PLACEHOLDER')) {
            apiKey = await getKeyFromDatabase();
        }

        if (!apiKey) throw new Error('Thiếu API Key. Vui lòng liên hệ quản trị viên.');

        // Discover & sắp xếp models
        const models = await discoverModels(apiKey);

        // Thử từng model — dừng ngay khi lỗi key
        let lastErr = null;
        for (const mdl of models) {
            try {
                const text = await callDirect(apiKey, contents, mdl);
                if (text !== null) return text; // Thành công
                // text === null nghĩa là model không phản hồi, thử model kế
            } catch (e) {
                if (e.isKeyError) {
                    // Lỗi key → xóa cache, không retry
                    _cachedModels = null;
                    localStorage.removeItem('edu_models_v2');
                    throw new Error('API Key lỗi: ' + e.message + ' — Vui lòng liên hệ quản trị viên.');
                }
                lastErr = e;
            }
        }

        throw lastErr || new Error('Không thể kết nối AI. Vui lòng thử lại sau.');
    }

    return { call: callGeminiAPI };
})();
