require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const LOTUS_BOT_TOKEN = process.env.LOTUS_BOT_TOKEN_2;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!LOTUS_BOT_TOKEN) {
  console.error('Error: LOTUS_BOT_TOKEN_2 is not set in .env file.');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env file.');
  process.exit(1);
}

const API_BASE = `http://bot.lotuschat.vn/bot${LOTUS_BOT_TOKEN}`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Store chat sessions per user/chat ID
const chatSessions = new Map();

async function getChatSession(chatId) {
  if (!chatSessions.has(chatId)) {
    const chat = await ai.chats.create({ model: 'gemini-3.5-flash' });
    chatSessions.set(chatId, chat);
  }
  return chatSessions.get(chatId);
}

async function sendMessage(chatId, text) {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
}

async function getUpdates(offset) {
  const res = await fetch(`${API_BASE}/getUpdates?offset=${offset}&timeout=10`);
  const text = await res.text();
  if (res.status === 429) {
    throw new Error('Too Many Requests');
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }
  if (data.ok && Array.isArray(data.result)) {
    return data.result;
  }
  return [];
}

async function handleUpdate(update) {
  if (!update.message || !update.message.text) return;

  const msg = update.message;
  // Ignore messages from the bot itself to prevent infinite loops
  if (msg.from && (msg.from.is_bot || msg.from.id === parseInt(LOTUS_BOT_TOKEN.split(':')[0]))) {
    return;
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  console.log(`[${new Date().toISOString()}] Message from ${msg.from.first_name || msg.from.username || 'User'} (${chatId}): ${text}`);

  // Handle /start command
  if (text === '/start') {
    await sendMessage(chatId, 'Xin chào! Tôi là chatbot AI được tích hợp Gemini. Bạn có thể hỏi tôi bất cứ điều gì!');
    return;
  }

  try {
    const chatSession = await getChatSession(chatId);
    const res = await chatSession.sendMessage({ message: text });
    await sendMessage(chatId, res.text);
    console.log(`[${new Date().toISOString()}] Replied to ${chatId}`);
  } catch (error) {
    console.error('Error handling message:', error.message);
    await sendMessage(chatId, 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn.');
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startPolling() {
  let offset = 0;
  let retryDelay = 3000;

  // Get current updates to find the latest offset
  try {
    const initial = await getUpdates(0);
    if (initial.length > 0) {
      offset = initial[initial.length - 1].update_id + 1;
      console.log(`Skipping ${initial.length} old messages. Starting from offset ${offset}`);
    }
  } catch (e) {
    console.warn('Could not get initial offset, starting from 0');
  }

  console.log('🤖 Lotus Chat Gemini Bot is running...');

  while (true) {
    try {
      const updates = await getUpdates(offset);
      retryDelay = 3000; // reset on success

      for (const update of updates) {
        if (update.update_id >= offset) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }

      // Polite polling delay: 2 seconds between requests
      await sleep(2000);
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Too Many Requests') || msg.includes('429')) {
        console.warn(`Rate limited. Waiting ${retryDelay / 1000}s...`);
      } else {
        console.error('Polling error:', msg);
      }
      await sleep(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000); // exponential backoff, max 30s
    }
  }
}

startPolling();
