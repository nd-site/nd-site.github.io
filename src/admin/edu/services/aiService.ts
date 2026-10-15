import type { Question, ExamAuditFeedback } from '../types';

/**
 * Chuẩn hóa đáp án số thập phân cho Dạng 3 (Trả lời ngắn):
 * - Dùng dấu chấm làm phân cách thập phân
 * - Tối đa 4 ký tự
 * - Cho phép dấu trừ ở đầu
 */
export function normalizeShortDecimalAnswer(value: unknown): string {
  const raw = String(value ?? '').trim().replace(',', '.').replace(/[^0-9.\-]/g, '');
  const hasMinus = raw.startsWith('-');
  const unsigned = raw.replace(/-/g, '');
  const parts = unsigned.split('.');
  const normalized =
    (hasMinus ? '-' : '') +
    (parts[0] || '') +
    (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
  return normalized.slice(0, 4);
}

export function isValidShortDecimalAnswer(value: unknown): boolean {
  const normalized = normalizeShortDecimalAnswer(value);
  return (
    normalized === String(value ?? '').trim().replace(',', '.') &&
    /^-?(?:\d+|\d*\.\d+)$/.test(normalized)
  );
}

/**
 * Trích xuất an toàn JSON từ văn bản thô hoặc khối Markdown
 */
export function extractJsonFromText<T = any>(rawText: string): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('Nội dung nhập liệu rỗng.');
  }

  let clean = rawText.trim();

  // Bóc tách khối markdown ```json ... ```
  if (clean.includes('```')) {
    const matches = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (matches && matches[1]) {
      clean = matches[1].trim();
    }
  }

  try {
    return JSON.parse(clean);
  } catch {
    // Thử tìm mảng [ ... ]
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
      try {
        return JSON.parse(clean.substring(startArr, endArr + 1));
      } catch {}
    }

    // Thử tìm object { ... }
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
      try {
        return JSON.parse(clean.substring(startObj, endObj + 1));
      } catch {}
    }

    throw new Error('Không thể phân tích định dạng JSON. Vui lòng kiểm tra lại cấu trúc.');
  }
}

/**
 * Sao chép văn bản vào clipboard với cơ chế fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mở Gemini Web hoặc NotebookLM trong tab mới
 */
export function openGeminiNotebook(): void {
  window.open('https://gemini.google.com/app', '_blank');
}

export function openNotebookLM(): void {
  window.open('https://notebooklm.google.com/', '_blank');
}

/**
 * Tạo Prompt cho Gemini tạo đề thi GDPT 2018
 */
export function buildGenerateExamPrompt(params: {
  topic: string;
  subject: string;
  grade: string;
  count: number;
  includeMultiple: boolean;
  includeTF: boolean;
  includeShort: boolean;
}): string {
  const allowedTypes: string[] = [];
  if (params.includeMultiple) allowedTypes.push('Trắc nghiệm 4 lựa chọn (type: "multiple")');
  if (params.includeTF) allowedTypes.push('Đúng / Sai 4 ý chuẩn GDPT 2018 (type: "truefalse")');
  if (params.includeShort) allowedTypes.push('Trả lời ngắn / điền số (type: "short")');

  return [
    `Bạn là chuyên gia ra đề thi chuẩn chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo.`,
    `Nhiệm vụ: Hãy tạo bộ đề thi gồm ${params.count} câu hỏi môn ${params.subject} khối ${params.grade}.`,
    `Chủ đề & Yêu cầu: "${params.topic}"`,
    `Các dạng câu hỏi yêu cầu sử dụng: ${allowedTypes.join(', ')}.`,
    ``,
    `QUY TẮC ĐỊNH DẠNG BẮT BUỘC:`,
    `1. CÔNG THỨC TOÁN / KHOA HỌC: Bắt buộc viết dưới dạng KaTeX/LaTeX: $...$ cho inline và $$...$$ cho dòng riêng.`,
    `2. CẤU TRÚC TỪNG DẠNG CÂU HỎI:`,
    `   - "multiple": options gồm 4 chuỗi phương án không kèm nhãn A, B, C, D; correct là chỉ số 0, 1, 2 hoặc 3.`,
    `   - "truefalse": options gồm 4 mệnh đề a, b, c, d; correctAnswers là mảng 4 boolean [true/false].`,
    `   - "short": correct BẮT BUỘC là chuỗi số thập phân dùng dấu chấm, tối đa 4 ký tự (ví dụ: "4", "0.5", "-1.5"); không dùng đơn vị, chữ, phân số hoặc biểu thức.`,
    `3. LỜI GIẢI THÍCH (explanation): Mỗi câu BẮT BUỘC có lời giải chi tiết, rõ ràng từng bước bằng tiếng Việt.`,
    `4. ĐẦU RA: Bắt buộc trả về DUY NHẤT một mảng JSON thuần (JSON array), không kèm theo văn bản giải thích ngoài khối JSON.`,
    ``,
    `CẤU TRÚC JSON MẪU:`,
    `[`,
    `  {`,
    `    "type": "multiple",`,
    `    "question": "Cho hàm số $y = f(x)$... Mệnh đề nào sau đây đúng?",`,
    `    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],`,
    `    "correct": 0,`,
    `    "explanation": "Lời giải chi tiết từng bước..."`,
    `  },`,
    `  {`,
    `    "type": "truefalse",`,
    `    "question": "Cho hình chóp $S.ABCD$... Xét tính đúng sai của các mệnh đề:",`,
    `    "options": ["Mệnh đề a", "Mệnh đề b", "Mệnh đề c", "Mệnh đề d"],`,
    `    "correctAnswers": [true, false, true, false],`,
    `    "explanation": "a) Đúng vì... b) Sai vì..."`,
    `  }`,
    `]`
  ].join('\n');
}

/**
 * Tạo Prompt thẩm định đề thi cho Gemini
 */
export function buildAuditExamPrompt(questions: Question[]): string {
  const promptData = questions.map((q, idx) => ({
    index: idx + 1,
    type: q.type || 'multiple',
    question: q.question,
    options: 'options' in q ? q.options : [],
    correct:
      'correct' in q ? q.correct : 'correctAnswers' in q ? q.correctAnswers : undefined,
    explanation: q.explanation || '',
  }));

  return [
    `Bạn là Hội đồng Thẩm định Đề thi Quốc gia theo chương trình GDPT 2018.`,
    `Hãy thẩm định CỰC KỲ KHẮT KHE bộ đề thi gồm ${questions.length} câu hỏi sau:`,
    JSON.stringify(promptData, null, 2),
    ``,
    `NHIỆM VỤ THẨM ĐỊNH:`,
    `1. Tính đúng đắn khoa học: Giải chi tiết từng câu, đối chiếu đề bài với đáp án xem có câu nào sai kiến thức, sai đáp án hay thiếu dữ kiện không.`,
    `2. Chuẩn LaTeX / KaTeX: Kiểm tra công thức toán học/khoa học có được bao bọc đúng cú pháp $...$ và $$...$$ chưa.`,
    `3. Ma trận phân hóa GDPT 2018: Đếm số câu thuộc 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.`,
    `4. Chấm điểm chất lượng tổng thể trên thang 100 điểm.`,
    `5. Nhận xét chi tiết từng câu: Đánh dấu rõ [Đạt chuẩn] hoặc [Cần sửa].`,
    ``,
    `YÊU CẦU ĐẦU RA: Trả về DUY NHẤT một JSON object thuần (không kèm văn bản giải thích ngoài):`,
    `{`,
    `  "score": 90,`,
    `  "levels": { "Nhận biết": 4, "Thông hiểu": 3, "Vận dụng": 2, "Vận dụng cao": 1 },`,
    `  "remarks": "Nhận xét tổng thể chất lượng đề...",`,
    `  "feedback": [`,
    `    "Câu 1: [Đạt chuẩn] Đề bài và công thức chuẩn.",`,
    `    "Câu 2: [Cần sửa] Đạo hàm tính sai dấu ở phương án C."`,
    `  ]`,
    `}`
  ].join('\n');
}

/**
 * Tạo Prompt viết lời giải chi tiết cho Gemini
 */
export function buildExplanationPrompt(questions: Question[], scope: 'all' | 'missing'): string {
  const targets: any[] = [];
  questions.forEach((q, idx) => {
    if (scope === 'all' || !q.explanation || q.explanation.trim() === '') {
      targets.push({
        index: idx + 1,
        type: q.type || 'multiple',
        question: q.question,
        options: 'options' in q ? q.options : [],
        correct:
          'correct' in q ? q.correct : 'correctAnswers' in q ? q.correctAnswers : undefined,
      });
    }
  });

  return [
    `Bạn là giáo viên giàu kinh nghiệm sư phạm chương trình GDPT 2018.`,
    `Nhiệm vụ: Hãy viết lời giải thích chi tiết từng bước cho ${targets.length} câu hỏi sau:`,
    JSON.stringify(targets, null, 2),
    ``,
    `YÊU CẦU ĐỊNH DẠNG:`,
    `1. Trình bày rõ ràng, dễ hiểu, sư phạm, chỉ rõ phương pháp giải và kết luận.`,
    `2. Tất cả công thức toán học/khoa học PHẢI dùng KaTeX/LaTeX chuẩn ($...$).`,
    `3. Trả về DUY NHẤT một mảng JSON (JSON array) khớp chính xác với chỉ số "index":`,
    `[`,
    `  {`,
    `    "index": 1,`,
    `    "explanation": "Bước 1: Ta có...\\nBước 2: Suy ra...\\nVậy đáp án đúng là..."`,
    `  }`,
    `]`
  ].join('\n');
}

/**
 * Tạo Prompt bóc tách đề từ văn bản thô
 */
export function buildExtractPrompt(rawText: string): string {
  return [
    `Bạn là công cụ bóc tách câu hỏi đề thi chuyên nghiệp theo chuẩn GDPT 2018.`,
    `Hãy đọc toàn bộ văn bản đề thi sau và trích xuất thành mảng JSON:`,
    ``,
    `VĂN BẢN ĐỀ THI:`,
    rawText,
    ``,
    `QUY TẮC BÓC TÁCH:`,
    `1. Nhận diện chuẩn 4 dạng câu:`,
    `   - "multiple": Trắc nghiệm 4 lựa chọn (options gồm 4 phương án, correct là chỉ số 0-3).`,
    `   - "truefalse": Đúng / Sai 4 ý (options gồm 4 mệnh đề, correctAnswers là [true, false, true, false]).`,
    `   - "short": Trả lời ngắn / điền số (correct BẮT BUỘC là chuỗi số thập phân dùng dấu chấm, tối đa 4 ký tự; ví dụ "4", "0.5", "-1.5"; không đơn vị, chữ, phân số hoặc biểu thức).`,
    `   - "essay": Tự luận.`,
    `2. Công thức toán/lý/hóa bắt buộc dùng LaTeX ($...$).`,
    `3. Trả về DUY NHẤT một mảng JSON thuần (JSON array):`,
    `[`,
    `  { "type": "multiple", "question": "...", "options": ["..."], "correct": 0, "explanation": "..." },`,
    `  { "type": "truefalse", "question": "...", "options": ["..."], "correctAnswers": [true, false, false, true], "explanation": "..." }`,
    `]`
  ].join('\n');
}

/**
 * Trích xuất câu hỏi nhanh bằng Regex từ văn bản thô
 */
export function parseQuestionsWithRegex(raw: string): Question[] {
  if (!raw.trim()) return [];

  const qBlocks = raw
    .split(/(?:Câu\s+\d+[:.]|Bài\s+\d+[:.])/i)
    .filter((b) => b.trim().length > 0);
  const extracted: Question[] = [];

  qBlocks.forEach((b) => {
    const optMatches = b.match(/([A-D]\.\s*[^A-D\n]+)/g);
    if (optMatches && optMatches.length >= 2) {
      const qText = b.split(/A\./)[0].trim();
      const opts = optMatches
        .slice(0, 4)
        .map((o) => o.replace(/^[A-D]\.\s*/, '').trim());
      while (opts.length < 4) opts.push('');
      extracted.push({
        type: 'multiple',
        question: qText || 'Câu hỏi',
        options: opts,
        correct: 0,
        points: 0.25,
        explanation: '',
      });
    } else {
      extracted.push({
        type: 'short',
        question: b.trim(),
        correct: '',
        points: 0.5,
        explanation: '',
      });
    }
  });

  return extracted;
}

/**
 * Đọc tệp Word (.docx) và trích xuất raw text bằng mammoth
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  let mammothLib = window.mammoth;

  if (!mammothLib) {
    // Dynamic import mammoth script from CDN if not bundled
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Không thể tải thư viện Mammoth.'));
      document.head.appendChild(script);
    });
    mammothLib = window.mammoth;
  }

  if (!mammothLib || !mammothLib.extractRawText) {
    throw new Error('Thư viện Mammoth chưa sẵn sàng.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammothLib.extractRawText({ arrayBuffer });
  return result.value || '';
}
