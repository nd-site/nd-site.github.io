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
 * POST body: { "contents": [...], "model": "gemini-3.1-flash-lite" }
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
            const { contents, model: requestedModel } = req.body;

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
