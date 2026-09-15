/**
 * EduSpace Gemini AI Proxy - Firebase Cloud Function
 *
 * KIẾN TRÚC BẢO MẬT (Spark-compatible):
 * - Gemini API Key lưu trong Firebase Realtime Database (/config/geminiKey)
 * - Chỉ service account (Cloud Function) mới đọc được key — frontend bị từ chối bởi DB Rules
 * - Frontend gọi function này thay vì gọi Gemini API trực tiếp
 * - CORS giới hạn chỉ cho domain EduSpace
 *
 * Setup:
 *   1. firebase deploy --only functions
 *   2. Trong Firebase Console > Realtime Database > nhập key tại /config/geminiKey
 *   3. Cập nhật DB Security Rules (xem DB_RULES bên dưới)
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Khởi tạo Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}

// Database Security Rules cần thiết lập trong Firebase Console:
// {
//   "rules": {
//     "config": {
//       ".read": false,        // Chặn mọi client đọc trực tiếp
//       ".write": false        // Chặn mọi client ghi trực tiếp
//     }
//   }
// }
// Cloud Function dùng admin SDK nên bypass rules này — an toàn.

const ALLOWED_ORIGINS = [
    "https://nd-site.github.io",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000"
];

function setCORSHeaders(req, res) {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin) || (origin && origin.startsWith("http://localhost"))) {
        res.set("Access-Control-Allow-Origin", origin);
    } else {
        res.set("Access-Control-Allow-Origin", "https://nd-site.github.io");
    }
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
}

// Cache key trong bộ nhớ (vào lại từ DB chỉ khi cold start)
let _cachedGeminiKey = null;

async function getGeminiKey() {
    if (_cachedGeminiKey) return _cachedGeminiKey;
    const snapshot = await admin.database().ref("/config/geminiKey").once("value");
    const key = snapshot.val();
    if (!key) throw new Error("API key chưa được cấu hình trong database.");
    _cachedGeminiKey = key;
    return key;
}

/**
 * Cloud Function: geminiProxy
 *
 * POST body: { "contents": [...], "model": "gemini-3.1-flash-lite", "generationConfig": {...} }
 * Response:  { "text": "...", "model": "..." }
 */
exports.geminiProxy = onRequest(
    {
        region: "asia-southeast1",
        memory: "256MiB",
        timeoutSeconds: 30,
        cors: false
    },
    async (req, res) => {
        setCORSHeaders(req, res);

        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        if (req.method !== "POST") {
            res.status(405).json({ error: "Method Not Allowed. Use POST." });
            return;
        }

        try {
            const { contents, model: requestedModel, generationConfig } = req.body;

            if (!contents || !Array.isArray(contents)) {
                res.status(400).json({ error: "Thiếu trường 'contents' trong request body." });
                return;
            }

            const ALLOWED_MODELS = [
                "gemini-3.1-flash-lite",
                "gemini-3.1-pro",
                "gemini-2.5-flash",
                "gemini-2.5-pro"
            ];
            const model = ALLOWED_MODELS.includes(requestedModel)
                ? requestedModel
                : "gemini-3.1-flash-lite";

            // Đọc key từ Realtime Database (chỉ admin SDK mới đọc được)
            const apiKey = await getGeminiKey();

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const geminiResponse = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    ...(generationConfig ? { generationConfig } : {}),
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            const data = await geminiResponse.json();

            if (data.error) {
                // Không lộ chi tiết lỗi Gemini ra ngoài
                console.error("Gemini API error:", data.error.message);
                res.status(502).json({ error: "Lỗi từ Gemini API. Vui lòng thử lại." });
                return;
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                res.status(502).json({ error: "Không nhận được phản hồi từ AI." });
                return;
            }

            res.status(200).json({ text, model });

        } catch (err) {
            console.error("Function error:", err.message);
            res.status(500).json({ error: "Lỗi server. Vui lòng thử lại." });
        }
    }
);

const { GoogleGenAI } = require("@google/genai");

exports.lotusBotWebhook = onRequest(
    { region: "asia-southeast1", memory: "256MiB", timeoutSeconds: 30, cors: false },
    async (req, res) => {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        const botId = req.query.botId || "bot1"; 
        
        try {
            const update = req.body;
            if (!update || !update.message || !update.message.text) {
                res.status(200).send("OK");
                return;
            }

            const msg = update.message;
            if (msg.from && (msg.from.is_bot || msg.from.id.toString().startsWith("1538328"))) {
                res.status(200).send("OK");
                return;
            }

            const userId = msg.from.id.toString();
            const text = msg.text.trim();
            const chatId = msg.chat.id;

            const dbRef = admin.database().ref(`/lotus_bots/${botId}`);
            const snapshot = await dbRef.once("value");
            const botConfig = snapshot.val() || {};

            if (botConfig.status !== "on") {
                res.status(200).send("OK");
                return;
            }

            const allowedUsers = botConfig.allowed_users || {};
            // Allow if user is specifically allowed or if allow_all is set
            if (!allowedUsers[userId] && !botConfig.allow_all) {
                res.status(200).send("OK");
                return;
            }

            const lotusBotToken = botConfig.token;
            if (!lotusBotToken) {
                console.error(`Token not found for ${botId}`);
                res.status(200).send("OK");
                return;
            }
            
            const geminiKey = await getGeminiKey();
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            
            // Handle /start command
            if (text === "/start") {
                const lotusUrl = `http://bot.lotuschat.vn/bot${lotusBotToken}/sendMessage`;
                await fetch(lotusUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: "Xin chào! Tôi là chatbot AI được tích hợp Gemini. Bạn có thể hỏi tôi bất cứ điều gì!" })
                });
                res.status(200).send("OK");
                return;
            }

            const aiRes = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: text,
            });
            const replyText = aiRes.text;

            const lotusUrl = `http://bot.lotuschat.vn/bot${lotusBotToken}/sendMessage`;
            await fetch(lotusUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: replyText })
            });

            res.status(200).send("OK");
        } catch (error) {
            console.error("Webhook error:", error);
            res.status(500).send("Error");
        }
    }
);

exports.lotusBotAdmin = onRequest(
    { region: "asia-southeast1", memory: "128MiB", timeoutSeconds: 15, cors: true }, 
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        const { password, action, botId, data } = req.body || {};
        
        const pwdSnap = await admin.database().ref("/config/adminPassword").once("value");
        const realPwd = pwdSnap.val() || "123456";
        
        if (password !== realPwd) {
            res.status(401).json({ error: "Sai mật khẩu" });
            return;
        }

        try {
            if (action === "get") {
                const snap = await admin.database().ref("/lotus_bots").once("value");
                res.status(200).json({ data: snap.val() || {} });
            } else if (action === "toggle") {
                await admin.database().ref(`/lotus_bots/${botId}/status`).set(data.status);
                res.status(200).json({ success: true });
            } else if (action === "addUser") {
                await admin.database().ref(`/lotus_bots/${botId}/allowed_users/${data.userId}`).set(true);
                res.status(200).json({ success: true });
            } else if (action === "removeUser") {
                await admin.database().ref(`/lotus_bots/${botId}/allowed_users/${data.userId}`).remove();
                res.status(200).json({ success: true });
            } else if (action === "setToken") {
                await admin.database().ref(`/lotus_bots/${botId}/token`).set(data.token);
                res.status(200).json({ success: true });
            } else if (action === "setAllowAll") {
                await admin.database().ref(`/lotus_bots/${botId}/allow_all`).set(data.allow_all);
                res.status(200).json({ success: true });
            } else {
                res.status(400).json({ error: "Invalid action" });
            }
        } catch (error) {
            console.error("Admin error:", error);
            res.status(500).json({ error: error.message });
        }
    }
);

// ─── CANONICAL DATABASE & IDENTITY FOUNDATION (Phase 01-C1 & Phase 01-C2) ───
const canonicalFoundation = require("./src/index");
exports.canonical = canonicalFoundation;

/**
 * Canonical User Registration Endpoint (Phase 01-C2)
 */
exports.registerUser = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.registerUser({
                db,
                auth,
                ndid: req.body.ndid,
                password: req.body.password,
                email: req.body.email,
                name: req.body.name,
                displayName: req.body.displayName,
                ip,
                userAgent,
                idempotencyKey: req.body.idempotencyKey,
            });
            res.status(201).json(result);
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INTERNAL_ERROR",
                    message: err.message || "Đã xảy ra lỗi máy chủ nội bộ",
                },
            });
        }
    }
);

/**
 * Canonical User Login Endpoint (Phase 01-C2)
 */
exports.loginUser = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.loginUser({
                db,
                auth,
                identifier: req.body.identifier,
                password: req.body.password,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 401;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "AUTH_CREDENTIALS_INVALID",
                    message: err.message || "Thông tin đăng nhập không chính xác.",
                },
            });
        }
    }
);

/**
 * Helper to verify Bearer ID token and extract CodeID (UID === CodeID)
 */
async function getAuthenticatedCodeId(req, auth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
        const decoded = await auth.verifyIdToken(idToken);
        return decoded.uid;
    } catch {
        return null;
    }
}

/**
 * Self-Service Change Password Endpoint (Phase 01-C3)
 */
exports.changePassword = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.changePassword({
                db,
                codeId,
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đổi mật khẩu",
                },
            });
        }
    }
);

/**
 * Self-Service Change NDID Endpoint (Phase 01-C3)
 */
exports.changeNdid = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.changeNdid({
                db,
                codeId,
                newNdid: req.body.newNdid,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đổi NDID",
                },
            });
        }
    }
);

/**
 * Link Google Identity Endpoint (Phase 01-C4)
 */
exports.linkGoogleIdentity = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.linkGoogleIdentity({
                db,
                auth,
                codeId,
                googleSubjectId: req.body.googleSubjectId || null,
                googleEmail: req.body.googleEmail || null,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể liên kết Google",
                },
            });
        }
    }
);

/**
 * Unlink Google Identity Endpoint (Phase 01-C4)
 */
exports.unlinkGoogleIdentity = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.unlinkGoogleIdentity({
                db,
                auth,
                codeId,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể hủy liên kết Google",
                },
            });
        }
    }
);

/**
 * Request Account Recovery Code Endpoint (Phase 01-C5)
 */
exports.requestRecoveryCode = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.requestAccountRecovery({
                db,
                identifier: req.body?.identifier || "",
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể gửi yêu cầu khôi phục",
                },
            });
        }
    }
);

/**
 * Verify Recovery Code Endpoint (Phase 01-C5)
 */
exports.verifyRecoveryCode = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.verifyRecoveryCode({
                db,
                identifier: req.body?.identifier || "",
                code: req.body?.code || "",
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Mã xác thực không hợp lệ",
                },
            });
        }
    }
);

/**
 * Reset Password with Recovery Proof Endpoint (Phase 01-C5)
 */
exports.resetPasswordWithRecovery = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.resetPasswordWithRecovery({
                db,
                auth,
                identifier: req.body?.identifier || "",
                resetToken: req.body?.resetToken || "",
                newPassword: req.body?.newPassword || "",
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đặt lại mật khẩu",
                },
            });
        }
    }
);

// ── PHASE 01-C6: SESSIONS & TRUSTED DEVICE ENDPOINTS ────────────────────────

/**
 * Register Active Session Endpoint (Phase 01-C6)
 */
exports.registerSession = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.registerSession({
                db,
                codeId,
                sessionId: req.body?.sessionId || null,
                deviceId: req.body?.deviceId || null,
                deviceLabel: req.body?.deviceLabel || null,
                userAgent,
                ip,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể khởi tạo phiên đăng nhập",
                },
            });
        }
    }
);

/**
 * Get Active Sessions Endpoint (Phase 01-C6)
 */
exports.getActiveSessions = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const currentSessionId = req.query?.currentSessionId || req.body?.currentSessionId || null;
            const result = await canonicalFoundation.listActiveSessions({
                db,
                codeId,
                currentSessionId,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể lấy danh sách phiên đăng nhập",
                },
            });
        }
    }
);

/**
 * Revoke Specific Session Endpoint (Phase 01-C6)
 */
exports.revokeSession = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.revokeUserSession({
                db,
                auth,
                codeId,
                sessionId: req.body?.sessionId,
                currentSessionId: req.body?.currentSessionId || null,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể hủy phiên đăng nhập",
                },
            });
        }
    }
);

/**
 * Revoke Other Sessions Endpoint (Phase 01-C6)
 */
exports.revokeOtherSessions = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.revokeOtherUserSessions({
                db,
                auth,
                codeId,
                currentSessionId: req.body?.currentSessionId || null,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đăng xuất các thiết bị khác",
                },
            });
        }
    }
);

/**
 * Register Trusted Device Endpoint (Phase 01-C6)
 */
exports.registerTrustedDevice = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.registerTrustedDeviceForUser({
                db,
                codeId,
                deviceId: req.body?.deviceId || null,
                deviceLabel: req.body?.deviceLabel || null,
                deviceFingerprint: req.body?.deviceFingerprint || null,
                userAgent,
                ip,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đăng ký thiết bị tin cậy",
                },
            });
        }
    }
);

/**
 * Get Trusted Devices Endpoint (Phase 01-C6)
 */
exports.getTrustedDevices = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const currentDeviceId = req.query?.currentDeviceId || req.body?.currentDeviceId || null;
            const result = await canonicalFoundation.listTrustedDevicesForUser({
                db,
                codeId,
                currentDeviceId,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể lấy danh sách thiết bị tin cậy",
                },
            });
        }
    }
);

/**
 * Revoke Trusted Device Endpoint (Phase 01-C6)
 */
exports.revokeTrustedDevice = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.revokeTrustedDeviceForUser({
                db,
                codeId,
                deviceId: req.body?.deviceId,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể hủy thiết bị tin cậy",
                },
            });
        }
    }
);

/**
 * Get Recent Security Activity Endpoint (Phase 01-C6)
 */
exports.getSecurityActivity = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const limit = parseInt(req.query?.limit || req.body?.limit || "20", 10);
            const result = await canonicalFoundation.getRecentSecurityActivityForUser({
                db,
                codeId,
                limit: isNaN(limit) ? 20 : limit,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể tải nhật ký bảo mật",
                },
            });
        }
    }
);

/**
 * Update User Role & Privilege Endpoint (Phase 01-C7)
 * Strictly restricted to System Owners; Admins cannot self-promote or grant admin.
 */
exports.updateUserRole = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const callerCodeId = await getAuthenticatedCodeId(req, auth);
            if (!callerCodeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const targetCodeId = req.body?.targetCodeId;
            const newRole = req.body?.role;
            const newAdminLevel = req.body?.adminLevel !== undefined ? req.body.adminLevel : null;

            const result = await canonicalFoundation.updateUserRoleAndLevel({
                db,
                callerCodeId,
                targetCodeId,
                newRole,
                newAdminLevel,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể cập nhật quyền hạn người dùng",
                },
            });
        }
    }
);

/**
 * Admin Get Users Endpoint (Server-Side Pagination & Directory)
 * Strictly restricted to Active Admins.
 */
exports.adminGetUsers = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST" && req.method !== "GET") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức GET hoặc POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const callerCodeId = await getAuthenticatedCodeId(req, auth);
            if (!callerCodeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }

            const callerContext = await canonicalFoundation.getUserAuthorizationContext(db, callerCodeId);
            canonicalFoundation.assertAdmin(callerContext);

            const rawPageSize = parseInt(req.query?.pageSize || req.body?.pageSize || "20", 10);
            const pageSize = Math.min(Math.max(isNaN(rawPageSize) ? 20 : rawPageSize, 1), 100);
            const cursor = (req.query?.cursor || req.body?.cursor || "").trim() || null;
            const roleFilter = (req.query?.role || req.body?.role || "").trim().toLowerCase();

            let query = db.collection("users").orderBy("codeId").limit(pageSize + 1);
            if (roleFilter && (roleFilter === "admin" || roleFilter === "user")) {
                query = query.where("role", "==", roleFilter);
            }
            if (cursor) {
                query = query.startAfter(cursor);
            }

            const snapshot = await query.get();
            const docs = snapshot.docs;
            const hasMore = docs.length > pageSize;
            const userDocs = hasMore ? docs.slice(0, pageSize) : docs;
            const nextCursor = hasMore && userDocs.length > 0 ? userDocs[userDocs.length - 1].id : null;

            const users = userDocs.map((doc) => {
                const data = doc.data() || {};
                let formattedCreatedAt = null;
                if (data.createdAt) {
                    if (typeof data.createdAt.toDate === "function") {
                        formattedCreatedAt = data.createdAt.toDate().toISOString();
                    } else if (typeof data.createdAt === "string") {
                        formattedCreatedAt = data.createdAt;
                    }
                }
                return {
                    codeId: doc.id,
                    ndid: data.ndid || null,
                    email: data.email || null,
                    displayName: data.displayName || data.name || null,
                    role: data.role || "user",
                    adminLevel: data.adminLevel || null,
                    status: data.status || "active",
                    createdAt: formattedCreatedAt,
                    photoURL: data.photoURL || null,
                };
            });

            res.status(200).json({
                success: true,
                users,
                nextCursor,
                hasMore,
            });
        } catch (err) {
            const status = err.status || (err.code === "FORBIDDEN" ? 403 : 400);
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể tải danh sách người dùng",
                },
            });
        }
    }
);

/**
 * Login With Linked Google Identity Endpoint (Phase 01-C7)
 * Resolves external Google Subject ID to canonical CodeID and issues custom token (UID === CodeID).
 */
exports.loginWithGoogle = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const googleSubjectId = req.body?.googleSubjectId;
            if (!googleSubjectId || typeof googleSubjectId !== "string") {
                res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Google Subject ID không hợp lệ." } });
                return;
            }

            const cleanSubjectId = googleSubjectId.trim();
            const mapping = await canonicalFoundation.resolveGoogleSubjectToCodeId(db, cleanSubjectId);
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;

            if (!mapping || !mapping.codeId) {
                await canonicalFoundation.recordSecurityEvent(db, {
                    eventType: "google_login_failed",
                    actorCodeID: "anonymous",
                    targetCodeID: "unknown",
                    ip,
                    userAgent,
                    details: {
                        reason: "unlinked_google_identity",
                        googleSubjectId: cleanSubjectId,
                    },
                });
                res.status(401).json({
                    success: false,
                    error: {
                        code: "GOOGLE_NOT_LINKED",
                        message: "Tài khoản Google này chưa được liên kết với tài khoản NDID nào. Vui lòng đăng nhập bằng NDID và liên kết trong Cài đặt.",
                    },
                });
                return;
            }

            const codeId = mapping.codeId;
            const userDoc = await db.collection(canonicalFoundation.USERS_COLLECTION).doc(codeId).get();
            if (!userDoc.exists) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "AUTH_CREDENTIALS_INVALID",
                        message: "Thông tin đăng nhập không hợp lệ.",
                    },
                });
                return;
            }

            const userData = userDoc.data();
            if (userData.status === "locked") {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "ACCOUNT_LOCKED",
                        message: "Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng khôi phục tài khoản.",
                    },
                });
                return;
            }
            if (userData.status === "disabled" || userData.status === "banned") {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "ACCOUNT_DISABLED",
                        message: "Tài khoản này đã bị vô hiệu hóa hoặc tạm khóa.",
                    },
                });
                return;
            }

            // Generate Firebase Custom Token strictly preserving UID === CodeID
            const customToken = await auth.createCustomToken(codeId);

            // Record security audit event
            await canonicalFoundation.recordSecurityEvent(db, {
                eventType: "google_login_success",
                actorCodeID: codeId,
                targetCodeID: codeId,
                ip,
                userAgent,
                details: {
                    googleSubjectId: cleanSubjectId,
                },
            });

            // Update lastLoginAt
            await db.collection(canonicalFoundation.USERS_COLLECTION).doc(codeId).update({
                lastLoginAt: canonicalFoundation.admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).json({
                success: true,
                codeId,
                customToken,
                user: {
                    codeId,
                    ndid: userData.ndid || "",
                    displayName: userData.displayName || userData.name || userData.ndid || "",
                    role: userData.role || "user",
                    adminLevel: userData.adminLevel || null,
                },
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể đăng nhập bằng Google",
                },
            });
        }
    }
);

/**
 * Send Verification Email Endpoint (Phase 01-C9)
 * Authenticated endpoint: allows user to request or resend an email verification link.
 */
exports.sendVerificationEmail = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const codeId = await getAuthenticatedCodeId(req, auth);
            if (!codeId) {
                res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yêu cầu phiên đăng nhập hợp lệ." } });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.generateEmailVerification({
                db,
                codeId,
                email: req.body?.email || null,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể gửi email xác nhận",
                },
            });
        }
    }
);

/**
 * Verify Email Token Endpoint (Phase 01-C9)
 * Public endpoint: verifies a submitted email verification token and marks account emailVerified = true.
 */
exports.verifyEmail = onRequest(
    {
        cors: true,
        region: "asia-southeast1",
    },
    async (req, res) => {
        setCORSHeaders(req, res);
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ phương thức POST" } });
            return;
        }
        try {
            const db = canonicalFoundation.getFirestoreDb();
            const auth = canonicalFoundation.getAuth();
            const token = req.body?.token || req.query?.token;
            if (!token || typeof token !== "string") {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ARGUMENT",
                        message: "Vui lòng cung cấp mã xác thực email hợp lệ.",
                    },
                });
                return;
            }
            const ip = req.ip || req.headers["x-forwarded-for"] || null;
            const userAgent = req.headers["user-agent"] || null;
            const result = await canonicalFoundation.verifyEmailToken({
                db,
                auth,
                token,
                ip,
                userAgent,
            });
            res.status(200).json(result);
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({
                success: false,
                error: {
                    code: err.code || "INVALID_REQUEST",
                    message: err.message || "Không thể xác thực email",
                },
            });
        }
    }
);






