import type { Question, ExamAuditFeedback, ExamStructureCounts } from '../types';

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
 * Bóc tách và làm sạch chuỗi JSON thô:
 * - Bỏ ký tự BOM
 * - Bóc tách khối Markdown ```json ... ``` hoặc ``` ... ```
 * - Tự động tìm đoạn bao bọc ngoài cùng { ... } hoặc [ ... ]
 * - Chuẩn hóa dấu ngoặc kép cong/thông minh (smart quotes) sang dấu nháy chuẩn
 * - Loại bỏ chú thích một dòng // và nhiều dòng /* ... * / ngoài chuỗi
 * - Loại bỏ dấu phẩy thừa (trailing commas: ,} hoặc ,]) ngoài chuỗi
 */
export function cleanJsonString(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // 1. Loại bỏ UTF-8 BOM
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  // 2. Bóc tách khối markdown ```json ... ``` hoặc ````json ... ````
  const codeBlockMatch = text.match(/`{3,}(?:json)?\s*([\s\S]*?)\s*`{3,}/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }

  // 3. Nếu còn văn bản bao quanh ngoài JSON, tìm đoạn { ... } hoặc [ ... ] ngoài cùng
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIndex = -1;
  let isObject = false;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    isObject = false;
  }

  if (startIndex !== -1) {
    const lastIndex = isObject ? text.lastIndexOf('}') : text.lastIndexOf(']');
    if (lastIndex > startIndex) {
      text = text.substring(startIndex, lastIndex + 1);
    }
  }

  // 4. Chuẩn hóa ngoặc kép thông minh (smart/curly quotes)
  text = text.replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"');
  text = text.replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 5. Loại bỏ chú thích // và /* */ cùng dấu phẩy thừa ngoài chuỗi ký tự
  text = stripCommentsAndTrailingCommas(text);

  return text.trim();
}

/**
 * Loại bỏ chú thích và dấu phẩy thừa ngoài chuỗi ký tự
 */
function stripCommentsAndTrailingCommas(jsonLike: string): string {
  let inString = false;
  let isEscaped = false;
  let cleanChars = '';
  const len = jsonLike.length;

  for (let i = 0; i < len; i++) {
    const char = jsonLike[i];
    const nextChar = i + 1 < len ? jsonLike[i + 1] : '';

    if (inString) {
      cleanChars += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      cleanChars += char;
      continue;
    }

    // Bỏ chú thích //
    if (char === '/' && nextChar === '/') {
      i += 2;
      while (i < len && jsonLike[i] !== '\n' && jsonLike[i] !== '\r') {
        i++;
      }
      if (i < len) cleanChars += jsonLike[i];
      continue;
    }

    // Bỏ chú thích /* */
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < len && !(jsonLike[i] === '*' && i + 1 < len && jsonLike[i + 1] === '/')) {
        i++;
      }
      i++;
      continue;
    }

    cleanChars += char;
  }

  // Xóa trailing commas: , theo sau bởi khoảng trắng và } hoặc ]
  inString = false;
  isEscaped = false;
  let result = '';
  const cleanLen = cleanChars.length;

  for (let i = 0; i < cleanLen; i++) {
    const char = cleanChars[i];

    if (inString) {
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === ',') {
      let j = i + 1;
      while (j < cleanLen && /\s/.test(cleanChars[j])) {
        j++;
      }
      if (j < cleanLen && (cleanChars[j] === '}' || cleanChars[j] === ']')) {
        // Bỏ qua dấu phẩy thừa trước } hoặc ]
        continue;
      }
    }

    result += char;
  }

  return result;
}

/**
 * Xử lý lỗi ngắt dòng trực tiếp trong chuỗi ký tự JSON (unescaped newline)
 */
function fixUnescapedNewlinesInStrings(jsonLike: string): string {
  let inString = false;
  let isEscaped = false;
  let result = '';
  const len = jsonLike.length;

  for (let i = 0; i < len; i++) {
    const char = jsonLike[i];

    if (inString) {
      if (char === '\n') {
        result += '\\n';
        continue;
      }
      if (char === '\r') {
        continue;
      }
      if (char === '\t') {
        result += '\\t';
        continue;
      }
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * Tự động sửa các dấu gạch chéo ngược đơn trong công thức LaTeX / văn bản ngoài các mã escape JSON chuẩn
 * Ví dụ: \log, \sqrt, \infty, \mathbb, \frac -> \\log, \\sqrt, \\infty, \\mathbb, \\frac
 */
function fixInvalidEscapesInStrings(jsonLike: string): string {
  let inString = false;
  let isEscaped = false;
  let result = '';
  const len = jsonLike.length;

  for (let i = 0; i < len; i++) {
    const char = jsonLike[i];

    if (!inString) {
      if (char === '"') {
        inString = true;
      }
      result += char;
      continue;
    }

    // Đang trong chuỗi
    if (isEscaped) {
      isEscaped = false;
      result += char;
      continue;
    }

    if (char === '"') {
      inString = false;
      result += char;
      continue;
    }

    if (char === '\\') {
      const next = i + 1 < len ? jsonLike[i + 1] : '';
      const isValidStandardEscape = /["\\/bfnrt]/.test(next);
      const isHexEscape = next === 'u' && /^[0-9a-fA-F]{4}$/.test(jsonLike.substring(i + 2, i + 6));

      if (isValidStandardEscape || isHexEscape) {
        result += char;
        isEscaped = true;
        continue;
      } else {
        // Dấu \ không phải escape JSON chuẩn (như \log, \sqrt trong LaTeX) -> nhân đôi thành \\
        result += '\\\\';
        isEscaped = false;
        continue;
      }
    }

    result += char;
  }

  return result;
}

/**
 * Phân tích JSON chịu lỗi cao (Error-tolerant JSON Parse):
 * Tự động làm sạch markdown, chú thích, trailing commas, smart quotes, LaTeX escapes, và unescaped newlines.
 */
export function robustJsonParse<T = any>(rawText: string): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('Nội dung nhập liệu rỗng.');
  }

  const cleaned = cleanJsonString(rawText);
  if (!cleaned) {
    throw new Error('Không tìm thấy dữ liệu JSON hợp lệ trong nội dung.');
  }

  // 1. Thử parse trực tiếp chuỗi đã làm sạch
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 2. Thử sửa các escape LaTeX đơn (\log, \sqrt, \infty, v.v.)
  try {
    const fixedEscapes = fixInvalidEscapesInStrings(cleaned);
    return JSON.parse(fixedEscapes);
  } catch (_) {}

  // 3. Thử sửa unescaped newlines cùng invalid escapes
  try {
    const fixedNewlines = fixUnescapedNewlinesInStrings(cleaned);
    const fixedBoth = fixInvalidEscapesInStrings(fixedNewlines);
    return JSON.parse(fixedBoth);
  } catch (finalErr: any) {
    throw new Error(`Lỗi cú pháp JSON: ${finalErr.message || 'Không thể phân tích định dạng'}`);
  }
}

/**
 * Trích xuất an toàn JSON từ văn bản thô hoặc khối Markdown
 */
export function extractJsonFromText<T = any>(rawText: string): T {
  return robustJsonParse<T>(rawText);
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
 * Tạo Prompt cho Gemini tạo đề thi GDPT 2018 và các dạng đề mở rộng
 */
export interface GenerateExamPromptParams {
  topic: string;
  title?: string;
  subject?: string;
  grade?: string;
  examType?: string;
  duration?: number;
  metaBook?: string;
  structureCounts?: ExamStructureCounts;
  structPoints?: { [key: string]: number };
  count?: number;
  includeMultiple?: boolean;
  includeTF?: boolean;
  includeShort?: boolean;
  includeEssay?: boolean;
  includeMatching?: boolean;
  includeCloze?: boolean;
  includeOrdering?: boolean;
  includeMultiSelect?: boolean;
  includeGrouping?: boolean;
  includeErrorIdentification?: boolean;
  includePassage?: boolean;
  matrixLevels?: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
    vanDungCao: number;
  };
}

/**
 * Tạo Prompt cho Gemini tạo đề thi GDPT 2018 và các dạng đề mở rộng
 */
export function buildGenerateExamPrompt(params: GenerateExamPromptParams): string {
  const subject = params.subject || 'Toán học';
  const grade = params.grade || '12';
  const title = params.title || `Đề kiểm tra môn ${subject} khối ${grade}`;
  const duration = params.duration || 90;
  const examType = params.examType || 'GDPT 2018';

  const matrixLines: string[] = [];
  let totalCount = 0;

  if (params.structureCounts) {
    const sc = params.structureCounts;
    const sp = params.structPoints || {};

    if (sc.multiple && sc.multiple > 0) {
      matrixLines.push(`- Trắc nghiệm 4 lựa chọn (type: "multiple"): ${sc.multiple} câu (${sp.multiple ?? 0.25} điểm/câu)`);
      totalCount += sc.multiple;
    }
    if (sc.truefalse && sc.truefalse > 0) {
      matrixLines.push(`- Đúng / Sai 4 ý chuẩn GDPT 2018 (type: "truefalse"): ${sc.truefalse} câu (${sp.truefalse ?? 1.0} điểm/câu)`);
      totalCount += sc.truefalse;
    }
    if (sc.short && sc.short > 0) {
      matrixLines.push(`- Trả lời ngắn / điền số (type: "short"): ${sc.short} câu (${sp.short ?? 0.5} điểm/câu)`);
      totalCount += sc.short;
    }
    if (sc.essay && sc.essay > 0) {
      matrixLines.push(`- Tự luận kèm Barem Rubric (type: "essay"): ${sc.essay} câu (${sp.essay ?? 2.0} điểm/câu)`);
      totalCount += sc.essay;
    }
    if (sc.matching && sc.matching > 0) {
      matrixLines.push(`- Nối cặp Cột A - B (type: "matching"): ${sc.matching} câu (${sp.matching ?? 1.0} điểm/câu)`);
      totalCount += sc.matching;
    }
    if (sc.cloze && sc.cloze > 0) {
      matrixLines.push(`- Điền khuyết vị trí [1],[2] (type: "cloze"): ${sc.cloze} câu (${sp.cloze ?? 1.0} điểm/câu)`);
      totalCount += sc.cloze;
    }
    if (sc.ordering && sc.ordering > 0) {
      matrixLines.push(`- Sắp xếp theo thứ tự (type: "ordering"): ${sc.ordering} câu (${sp.ordering ?? 1.0} điểm/câu)`);
      totalCount += sc.ordering;
    }
    if (sc.multiselect && sc.multiselect > 0) {
      matrixLines.push(`- Nhiều đáp án đúng (type: "multiselect"): ${sc.multiselect} câu (${sp.multiselect ?? 1.0} điểm/câu)`);
      totalCount += sc.multiselect;
    }
    if (sc.grouping && sc.grouping > 0) {
      matrixLines.push(`- Phân loại vào nhóm (type: "grouping"): ${sc.grouping} câu (${sp.grouping ?? 1.0} điểm/câu)`);
      totalCount += sc.grouping;
    }
    if (sc.error_identification && sc.error_identification > 0) {
      matrixLines.push(`- Tìm lỗi sai và sửa lại (type: "error_identification"): ${sc.error_identification} câu (${sp.error_identification ?? 0.5} điểm/câu)`);
      totalCount += sc.error_identification;
    }
  }

  // Dự phòng nếu không có structureCounts hoặc tổng câu = 0
  if (matrixLines.length === 0) {
    totalCount = params.count || 5;
    if (params.includeMultiple !== false) matrixLines.push('- Trắc nghiệm 4 lựa chọn (type: "multiple")');
    if (params.includeTF) matrixLines.push('- Đúng / Sai 4 ý chuẩn GDPT 2018 (type: "truefalse")');
    if (params.includeShort) matrixLines.push('- Trả lời ngắn / điền số (type: "short")');
    if (params.includeEssay) matrixLines.push('- Tự luận kèm Barem Rubric từng bước (type: "essay")');
    if (params.includeMatching) matrixLines.push('- Nối cặp Cột A với Cột B (type: "matching")');
    if (params.includeCloze) matrixLines.push('- Điền khuyết vị trí [1], [2] (type: "cloze")');
    if (params.includeOrdering) matrixLines.push('- Sắp xếp theo thứ tự logic / quy trình (type: "ordering")');
    if (params.includeMultiSelect) matrixLines.push('- Trắc nghiệm nhiều đáp án đúng (type: "multiselect")');
    if (params.includeGrouping) matrixLines.push('- Phân loại các khái niệm vào nhóm (type: "grouping")');
    if (params.includeErrorIdentification) matrixLines.push('- Tìm lỗi sai và sửa lại (type: "error_identification")');
  }

  const matrixInstruction = params.matrixLevels
    ? `YÊU CẦU MA TRẬN PHÂN HÓA (4 mức độ nhận thức GDPT 2018):
- Nhận biết: ~${params.matrixLevels.nhanBiet}%
- Thông hiểu: ~${params.matrixLevels.thongHieu}%
- Vận dụng: ~${params.matrixLevels.vanDung}%
- Vận dụng cao: ~${params.matrixLevels.vanDungCao}%
Mỗi câu hỏi cần có trường "cognitiveLevel" nhận 1 trong 4 giá trị: "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao".`
    : `Mỗi câu hỏi nên có trường "cognitiveLevel" nhận 1 trong 4 giá trị: "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao".`;

  const passageInstruction = params.includePassage
    ? `YÊU CẦU NGỮ LIỆU ĐỌC HIỂU / CASE STUDY DÙNG CHUNG:
- Hãy tạo 1 bài đọc / đoạn văn bản ngữ liệu thực tế (bài báo khoa học, trích đoạn văn học, tình huống kinh tế - xã hội, văn bản tiếng Anh) phù hợp với chủ đề.
- Tất cả các câu hỏi sinh ra đều phải bám sát, khai thác sâu nội dung ngữ liệu này.
- Cấu trúc trả về BẮT BUỘC có dạng Object gồm "passages" (mảng bài đọc) và "questions":
{
  "title": "${title}",
  "grade": "${grade}",
  "subject": "${subject}",
  "passages": [
    {
      "id": "p1",
      "title": "Tên bài đọc / tình huống",
      "content": "Toàn bộ nội dung văn bản ngữ liệu..."
    }
  ],
  "questions": [ ...danh sách câu hỏi... ]
}`
    : `ĐẦU RA: Bắt buộc trả về DUY NHẤT một khối JSON hợp lệ theo cấu trúc:
{
  "title": "${title}",
  "grade": "${grade}",
  "subject": "${subject}",
  "examType": "${examType}",
  "matrixDuration": ${duration},
  "questions": [ ...danh sách ${totalCount} câu hỏi... ]
}
Hoặc trực tiếp mảng JSON câu hỏi: [ ... ]`;

  return [
    `Bạn là chuyên gia ra đề thi chuẩn chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo và các kỳ thi ĐGNL (HSA, APT, TSA).`,
    ``,
    `THÔNG TIN ĐỀ THI:`,
    `- Tiêu đề đề thi: ${title}`,
    `- Môn học: ${subject}`,
    `- Khối lớp: ${grade}`,
    `- Thời gian làm bài: ${duration} phút`,
    `- Loại đề / Kỳ thi: ${examType}`,
    params.metaBook ? `- Bộ sách giáo khoa tham chiếu: ${params.metaBook}` : '',
    ``,
    `MA TRẬN CẤU TRÚC ĐỀ THI (Tổng số: ${totalCount} câu hỏi):`,
    ...matrixLines,
    ``,
    matrixInstruction,
    ``,
    `YÊU CẦU NỘI DUNG & CHI TIẾT ĐỀ THI:`,
    `"${params.topic}"`,
    ``,
    `QUY TẮC ĐỊNH DẠNG BẮT BUỘC:`,
    `1. CÔNG THỨC TOÁN / KHOA HỌC: Bắt buộc viết dưới dạng KaTeX/LaTeX: $...$ cho inline và $$...$$ cho dòng riêng.`,
    `2. CẤU TRÚC CHI TIẾT TỪNG DẠNG CÂU HỎI:`,
    `   - "multiple": options gồm 4 chuỗi phương án không kèm nhãn A, B, C, D; correct là chỉ số 0, 1, 2 hoặc 3.`,
    `   - "truefalse": options gồm 4 mệnh đề a, b, c, d; correctAnswers là mảng 4 boolean [true/false].`,
    `   - "short": correct BẮT BUỘC là chuỗi số thập phân dùng dấu chấm, tối đa 4 ký tự (ví dụ: "4", "0.5", "-1.5"); không dùng đơn vị, chữ, phân số hoặc biểu thức.`,
    `   - "essay": correct là hướng dẫn chấm tổng quan; rubric là mảng các bước chấm [ { step: 1, description: "...", points: 0.5 }, ... ].`,
    `   - "matching": pairs là mảng các cặp nối [ { id: "1", left: "Khái niệm", right: "Định nghĩa tương ứng" }, ... ].`,
    `   - "cloze": trong văn bản question có các vị trí [1], [2]... blanks là mảng [ { id: "1", options: ["A", "B", "C"], correct: "A" }, ... ].`,
    `   - "ordering": items là mảng các mục theo thứ tự ĐÚNG [ { id: "step_1", text: "Bước 1" }, { id: "step_2", text: "Bước 2" }, ... ].`,
    `   - "multiselect": options gồm 4-6 phương án; correct là mảng các chỉ số đúng, ví dụ [0, 2]; partialCredit: true.`,
    `   - "grouping": categories gồm các nhóm [ { id: "cat_1", name: "Nhóm 1" }, ... ]; items gồm các thẻ [ { id: "i_1", text: "Thẻ A", categoryId: "cat_1" }, ... ].`,
    `   - "error_identification": question chứa đoạn văn với các vị trí [A], [B], [C], [D]; underlines là mảng [ { id: "A", text: "...", isError: false }, ... ]; correctCorrection là từ/cụm từ sửa đúng.`,
    `3. LỜI GIẢI THÍCH (explanation): Mỗi câu BẮT BUỘC có lời giải chi tiết, rõ ràng từng bước bằng tiếng Việt.`,
    `4. ${passageInstruction}`,
    `   TUYỆT ĐỐI không kèm theo bất kỳ văn bản chào hỏi hay giải thích nào ngoài khối JSON thuần.`
  ].filter(Boolean).join('\n');
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
    `1. Nhận diện chuẩn các dạng câu hỏi:`,
    `   - "multiple": Trắc nghiệm 4 lựa chọn (options gồm 4 phương án, correct là chỉ số 0-3).`,
    `   - "truefalse": Đúng / Sai 4 ý (options gồm 4 mệnh đề, correctAnswers là [true, false, true, false]).`,
    `   - "short": Trả lời ngắn / điền số (correct BẮT BUỘC là chuỗi số thập phân dùng dấu chấm, tối đa 4 ký tự; ví dụ "4", "0.5", "-1.5"; không đơn vị, chữ, phân số hoặc biểu thức).`,
    `   - "essay": Tự luận (correct là hướng dẫn chấm, rubric là các bước điểm).`,
    `   - "matching": Nối cặp (pairs gồm các cặp { id, left, right }).`,
    `   - "cloze": Điền khuyết (blanks gồm các vị trí [1], [2] kèm options/correct).`,
    `   - "ordering": Sắp xếp (items gồm các bước theo thứ tự đúng).`,
    `   - "multiselect": Trắc nghiệm chọn nhiều đáp án (correct là mảng các chỉ số đúng [0, 2]).`,
    `   - "grouping": Phân loại vào nhóm (categories và items).`,
    `   - "error_identification": Tìm lỗi sai và sửa lại (underlines và correctCorrection).`,
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
