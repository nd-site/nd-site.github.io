import type { Stanza } from '../types';

export interface GeminiParseResult {
  title: string;
  author: string;
  stanzas: Array<{
    stanzaIndex: number;
    lines: string[];
    rhythm: string;
    visualCue: string;
    rhymeMapping: Record<string, string>;
  }>;
  genre?: string;
  meaning?: string;
  tags?: string[];
}

export const GEMINI_JSON_SCHEMA_PROMPT = `Bạn là một chuyên gia văn học và chuyên gia cấu trúc dữ liệu thơ ca tiếng Việt.
Hãy phân tích bài thơ sau và trả về DUY NHẤT một chuỗi JSON thuần túy (không bọc trong bất kỳ giải thích nào, không thêm markdown ticks \`\`\`json), tuân theo cấu trúc JSON Schema chuẩn sau:

{
  "title": "Tên bài thơ",
  "author": "Tác giả",
  "stanzas": [
    {
      "stanzaIndex": 1,
      "lines": [
        "Sông Mã xa rồi Tây Tiến ơi",
        "Nhớ chơi vơi"
      ],
      "rhythm": "4/3",
      "visualCue": "Hình ảnh con sông uốn lượn giữa núi rừng",
      "rhymeMapping": {"Tây Tiến": "A", "chơi vơi": "A"}
    }
  ]
}

Quy tắc chi tiết:
1. "title": Tên chính xác của bài thơ.
2. "author": Tên tác giả (hoặc "Khuyết danh").
3. "stanzas": Mảng các khổ thơ theo thứ tự từ đầu đến cuối bài thơ.
   - "stanzaIndex": Số thứ tự của khổ, bắt đầu từ 1.
   - "lines": Mảng các dòng thơ nguyên bản trong khổ.
   - "rhythm": Quy luật ngắt nhịp chính của khổ (ví dụ: "4/3", "2/3", "2/2/3", "3/3", "6/8").
   - "visualCue": Một câu mô tả hình tượng thị giác cô đọng, sống động để người học hình dung làm mỏ neo ký ức.
   - "rhymeMapping": Đối tượng ánh xạ các từ/cụm từ hiệp vần với nhau theo ký hiệu vần (ví dụ: {"Tây Tiến": "A", "chơi vơi": "A"}).`;

export const generateGeminiPrompt = (rawPoemText: string): string => {
  return `${GEMINI_JSON_SCHEMA_PROMPT}\n\nNội dung bài thơ cần phân tích:\n"""\n${rawPoemText.trim()}\n"""`;
};

export function getSharedGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('poemnd_gemini_api_key');
    if (custom && custom.trim()) return custom.trim();

    const wKey = (window as any).EDU_CONFIG?.geminiApiKey;
    if (wKey && !wKey.includes('PLACEHOLDER') && wKey.trim()) return wKey.trim();
  }

  return "AIzaSyCKqYRA44WIka-dTOwH234LOrcXSUQd04A";
}

// Call Gemini via REST API (Using shared ND Labs AI key by default)
export async function analyzePoemWithGemini(
  rawPoemText: string,
  apiKey?: string
): Promise<GeminiParseResult> {
  const activeKey = (apiKey && apiKey.trim()) ? apiKey.trim() : getSharedGeminiApiKey();
  if (!activeKey) {
    throw new Error('Không thể kết nối Gemini AI. Vui lòng kiểm tra kết nối mạng.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

  const prompt = `${GEMINI_JSON_SCHEMA_PROMPT}\n\nHãy phân tích văn bản bài thơ này:\n"""\n${rawPoemText.trim()}\n"""`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Lỗi Gemini API HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini không phản hồi văn bản hợp lệ.');
  }

  try {
    const parsed = JSON.parse(text) as GeminiParseResult;
    return sanitizePoemResult(parsed);
  } catch {
    // Try cleaning markdown ticks if any
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as GeminiParseResult;
    return sanitizePoemResult(parsed);
  }
}

// Generate literary analysis / tutor guidance
export async function generatePoetryCritique(
  title: string,
  author: string,
  stanzas: Stanza[],
  apiKey?: string
): Promise<string> {
  const activeKey = (apiKey && apiKey.trim()) ? apiKey.trim() : getSharedGeminiApiKey();
  if (!activeKey) return '';

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;
  const poemContent = stanzas.map(s => s.lines.join('\n')).join('\n\n');

  const prompt = `Bạn là trợ lý giáo viên Ngữ Văn cao cấp của PoemND. Hãy phân tích ngắn gọn, súc tích (khoảng 3 đoạn văn ấm áp, gợi cảm) về bài thơ "${title}" của tác giả "${author}":
1. Bối cảnh ra đời và cảm hứng chủ đạo.
2. Vẻ đẹp ngôn từ, nhịp điệu và các biện pháp nghệ thuật đặc sắc.
3. Lời khuyên giúp người học ghi nhớ sâu và cảm nhận trọn vẹn hồn thơ.

Nội dung bài thơ:
${poemContent}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    })
  });

  if (!response.ok) return '';
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Ensure returned object is valid against schema
export function sanitizePoemResult(data: any): GeminiParseResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu trả về không phải là JSON hợp lệ');
  }

  const title = (data.title || 'Bài thơ mới').trim();
  const author = (data.author || 'Khuyết danh').trim();
  
  if (!Array.isArray(data.stanzas) || data.stanzas.length === 0) {
    throw new Error('Cấu trúc thiếu mảng "stanzas" hoặc bài thơ không có khổ nào');
  }

  const stanzas = data.stanzas.map((st: any, idx: number) => {
    const lines = Array.isArray(st.lines) 
      ? st.lines.map((l: any) => String(l).trim()).filter(Boolean)
      : [];
    
    return {
      stanzaIndex: Number(st.stanzaIndex) || idx + 1,
      lines: lines.length > 0 ? lines : ['(Dòng thơ đang cập nhật)'],
      rhythm: String(st.rhythm || '4/3'),
      visualCue: String(st.visualCue || 'Hình ảnh liên tưởng theo dòng cảm xúc'),
      rhymeMapping: typeof st.rhymeMapping === 'object' && st.rhymeMapping !== null ? st.rhymeMapping : {}
    };
  });

  return {
    title,
    author,
    stanzas,
    genre: data.genre || 'Thơ tự do',
    meaning: data.meaning || '',
    tags: Array.isArray(data.tags) ? data.tags : []
  };
}
