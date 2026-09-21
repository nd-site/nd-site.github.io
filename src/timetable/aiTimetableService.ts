import * as XLSX from 'xlsx';

export interface ExtractedSlot {
  dayIndex: number; // 0 = Thứ Hai, ..., 6 = Chủ Nhật
  period: 'morning' | 'afternoon';
  slotNumber: number; // 1..5+
  subject: string;
  teacher?: string;
  room?: string;
}

export interface AITimetableExtractionResult {
  title?: string;
  school?: string;
  gradeClass?: string;
  schoolYear?: string;
  startWeek?: number;
  endWeek?: number;
  morningSlotsCount?: number;
  afternoonSlotsCount?: number;
  slots: ExtractedSlot[];
  dayNotes?: Record<number, string>;
}

export interface AIAnalysisInput {
  files?: File[] | null;
  file?: File | null;
  text?: string;
  userPrompt?: string;
  sessionFilter?: 'all' | 'morning' | 'afternoon';
}

/**
 * Trích xuất nội dung từ tệp tin thành định dạng đầu vào phù hợp cho Gemini
 */
export async function prepareAIContent(
  input: AIAnalysisInput
): Promise<{
  parts: any[];
  summary: string;
}> {
  const parts: any[] = [];
  let summary = '';

  // 1. Thu thập danh sách các tệp tin (hỗ trợ cả mảng files hoặc tệp đơn lẻ)
  const filesToProcess: File[] = [];
  if (Array.isArray(input.files)) {
    filesToProcess.push(...input.files.filter(Boolean));
  } else if (input.file) {
    filesToProcess.push(input.file);
  }

  if (filesToProcess.length > 0) {
    if (filesToProcess.length === 1) {
      const single = filesToProcess[0];
      summary = `Tệp: ${single.name} (${(single.size / 1024).toFixed(1)} KB)`;
    } else {
      const totalSizeKb = (filesToProcess.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1);
      summary = `${filesToProcess.length} tệp tin (${totalSizeKb} KB)`;
    }

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const fileName = file.name.toLowerCase();

      if (filesToProcess.length > 1) {
        parts.push({
          text: `[TỆP ĐÍNH KÈM SỐ ${i + 1}/${filesToProcess.length}: ${file.name}]`
        });
      }

      // Trường hợp 1: Excel (.xlsx, .xls, .csv)
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        let excelText = `[DỮ LIỆU TỆP BẢNG TÍNH EXCEL: ${file.name}]\n`;

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) {
              excelText += `\n--- Trang tính: ${sheetName} ---\n${csv}\n`;
            }
          }
        });

        parts.push({
          text: excelText
        });
      }
      // Trường hợp 2: Hình ảnh (PNG, JPG, JPEG, WEBP, GIF)
      else if (file.type.startsWith('image/')) {
        const base64Data = await fileToBase64(file);
        parts.push({
          inline_data: {
            mime_type: file.type || 'image/png',
            data: base64Data
          }
        });
      }
      // Trường hợp 3: Tài liệu PDF
      else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        const base64Data = await fileToBase64(file);
        parts.push({
          inline_data: {
            mime_type: 'application/pdf',
            data: base64Data
          }
        });
      }
      // Trường hợp 4: File văn bản thuần (.txt, .md, .json, .html)
      else {
        const textContent = await file.text();
        parts.push({
          text: `[NỘI DUNG TỆP VĂN BẢN: ${file.name}]\n${textContent}`
        });
      }
    }
  }

  // 2. Xử lý văn bản nhập trực tiếp
  if (input.text && input.text.trim()) {
    parts.push({
      text: `[VĂN BẢN THỜI KHÓA BIỂU DO NGƯỜI DÙNG CUNG CẤP]:\n${input.text.trim()}`
    });
    if (!summary) {
      summary = `Đoạn văn bản (${input.text.trim().length} ký tự)`;
    }
  }

  // 3. Bổ sung ghi chú / yêu cầu tùy biến của người dùng
  if (input.userPrompt && input.userPrompt.trim()) {
    parts.push({
      text: `[YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG]: ${input.userPrompt.trim()}`
    });
  }

  // 4. Bổ sung chỉ định phạm vi buổi học (nếu có)
  if (input.sessionFilter === 'morning') {
    parts.push({
      text: `[CHỈ ĐỊNH BẮT BUỘC]: Người dùng CHỈ YÊU CẦU LẤY THỜI KHÓA BIỂU BUỔI SÁNG. TUYỆT ĐỐI KHÔNG trích xuất bất kỳ tiết nào cho buổi chiều. "afternoonSlotsCount" BẮT BUỘC PHẢI LÀ 0, và mảng "slots" TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA bất kỳ tiết nào có period = "afternoon".`
    });
  } else if (input.sessionFilter === 'afternoon') {
    parts.push({
      text: `[CHỈ ĐỊNH BẮT BUỘC]: Người dùng CHỈ YÊU CẦU LẤY THỜI KHÓA BIỂU BUỔI CHIỀU. TUYỆT ĐỐI KHÔNG trích xuất bất kỳ tiết nào cho buổi sáng. "morningSlotsCount" BẮT BUỘC PHẢI LÀ 0, và mảng "slots" TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA bất kỳ tiết nào có period = "morning".`
    });
  }

  // 5. Bổ sung System Instruction hướng dẫn trích xuất
  const systemInstruction = `
Bạn là chuyên gia trích xuất dữ liệu Thời khóa biểu trường học tại Việt Nam.
Nhiệm vụ của bạn: Phân tích kỹ nội dung cung cấp (hình ảnh, tài liệu PDF, bảng tính Excel hoặc văn bản) và trích xuất TOÀN BỘ VÀ CHÍNH XÁC thời khóa biểu thành một đối tượng JSON duy nhất theo đúng cấu trúc sau:

{
  "title": "Tên thời khóa biểu nếu có",
  "school": "Tên trường học nếu có",
  "gradeClass": "Lớp học nếu có (ví dụ: 10A1, 11B4, 12A2...)",
  "schoolYear": "Năm học nếu có (ví dụ: 2026-2027)",
  "startWeek": 1,
  "endWeek": 1,
  "morningSlotsCount": 4,
  "afternoonSlotsCount": 0,
  "slots": [
    {
      "dayIndex": 0,
      "period": "morning",
      "slotNumber": 1,
      "subject": "Toán",
      "teacher": "Thầy Hùng",
      "room": ""
    }
  ],
  "dayNotes": {
    "0": ""
  }
}

QUY TẮC CẦN TUÂN THỦ NGHIÊM NGẶT (RẤT QUAN TRỌNG):

1. NHẬN DIỆN ĐÚNG SỐ TIẾT TỪNG BUỔI - TUYỆT ĐỐI KHÔNG TỰ Ý ĐIỀN THÊM TIẾT 5:
   - TÙY TỪNG BUỔI VÀ TỪNG THỨ MÀ SỐ TIẾT CÓ THỂ KHÁC NHAU: Ví dụ Thứ Hai chỉ học 4 tiết sáng, Thứ Ba học 5 tiết sáng, Thứ Bảy chỉ học 3 tiết sáng; Buổi chiều có ngày 2 tiết, có ngày 3 tiết, có ngày không học (nghỉ).
   - TUYỆT ĐỐI KHÔNG TỰ ĐIỀN THÊM TIẾT 5 nếu buổi học đó trong tài liệu/ảnh chỉ có 4 tiết hoặc không có dữ liệu tiết 5.
   - TUYỆT ĐỐI KHÔNG tự ý nhân bản hoặc lặp lại môn học từ tiết 4 sang tiết 5 để "lấp đầy".
   - CHỈ trích xuất các tiết THỰC TẾ có môn học xuất hiện rõ ràng trong bảng. Nếu một ô trống, có dấu gạch chéo "-", ghi chữ "Nghỉ", hoặc bảng không có hàng tiết 5 thì BỎ QUA HOÀN TOÀN, KHÔNG đưa vào mảng "slots".

2. QUY TẮC PHÂN BIỆT BUỔI SÁNG / BUỔI CHIỀU (TUYỆT ĐỐI TUÂN THỦ - KHÔNG TỰ ĐIỀN TIẾT CHIỀU):
   - HẦU HẾT CÁC TRƯỜNG HỌC TẠI VIỆT NAM HỌC CHÍNH KHÓA BUỔI SÁNG: Một buổi sáng gồm từ 1 đến 5 tiết (Tiết 1 đến Tiết 5).
   - NẾU TÀI LIỆU / HÌNH ẢNH CHỈ CÓ CÁC TIẾT 1, 2, 3, 4, 5 (HOẶC 1 ĐẾN 4) MÀ KHÔNG CÓ BẢNG BUỔI CHIỀU RIÊNG HOẶC KHÔNG CÓ TỪ KHÓA "CHIỀU":
     + TẤT CẢ các tiết này BẮT BUỘC ĐỀU LÀ BUỔI SÁNG (period = "morning", slotNumber = 1, 2, 3, 4, 5).
     + TUYỆT ĐỐI KHÔNG ĐƯỢC CHIA CÁC TIẾT 4, 5 XUỐNG BUỔI CHIỀU ("afternoon")!
     + TUYỆT ĐỐI KHÔNG TỰ Ý THÊM BẤT KỲ TIẾT NÀO VÀO BUỔI CHIỀU nếu tài liệu gốc không có bảng buổi chiều riêng hoặc không có lịch học buổi chiều rõ ràng.
     + TUYỆT ĐỐI KHÔNG tự bịa đặt, tự suy diễn, hoặc lặp lại môn của buổi sáng vào buổi chiều.
     + Nếu tài liệu chỉ có lịch học buổi sáng (hoặc không có từ khóa "Chiều"): mảng "slots" KHÔNG ĐƯỢC CÓ BẤT KỲ TIẾT CHIỀU NÀO (không có period = "afternoon"), và "afternoonSlotsCount" BẮT BUỘC PHẢI LÀ 0!
   - CHỈ KHI NÀO TÀI LIỆU CÓ MỤC HOẶC BẢNG GHI RÕ CHỮ "CHIỀU" / "BUỔI CHIỀU" / "CA CHIỀU" thì mới được trích xuất các tiết đó vào period = "afternoon".

3. XÁC ĐỊNH morningSlotsCount VÀ afternoonSlotsCount:
   - "morningSlotsCount": Là số thứ tự tiết sáng LỚN NHẤT THỰC TẾ trong toàn bộ tuần. Nếu lớp chỉ học ca chiều / không có bất kỳ tiết sáng nào thì PHẢI là 0. Nếu có học sáng thì là số thứ tự tiết sáng lớn nhất thực tế (ví dụ nếu tất cả các ngày chỉ học tối đa đến tiết 4 thì morningSlotsCount PHẢI là 4, KHÔNG ĐƯỢC để là 5).
   - "afternoonSlotsCount": Là số thứ tự tiết chiều LỚN NHẤT THỰC TẾ trong toàn bộ tuần. NẾU CẢ TUẦN KHÔNG CÓ TIẾT CHIỀU NÀO ĐƯỢC HỌC THÌ afternoonSlotsCount BẮT BUỘC PHẢI LÀ 0 (KHÔNG ĐƯỢC để là 5 hay bất kỳ số nào khác). Nếu buổi chiều có học thì là số tiết chiều lớn nhất thực tế (ví dụ tối đa 3 tiết thì là 3).

4. QUY ĐỊNH VỀ CÁC TRƯỜNG DỮ LIỆU:
   - dayIndex: Số nguyên từ 0 đến 6 (0: Thứ Hai, 1: Thứ Ba, 2: Thứ Tư, 3: Thứ Năm, 4: Thứ Sáu, 5: Thứ Bảy, 6: Chủ Nhật).
   - period: Chỉ nhận một trong hai giá trị chính xác là "morning" (Buổi Sáng) hoặc "afternoon" (Buổi Chiều).
   - slotNumber: Số thứ tự tiết học thực tế của buổi đó (bắt đầu từ 1, 2, 3, 4...).
   - subject: Tên môn học chuẩn tiếng Việt rõ ràng, viết hoa chữ cái đầu (Toán, Ngữ văn, Tiếng Anh, Vật lí, Hóa học, Sinh học, Lịch sử, Địa lí, GDCD/KTPL, Tin học, Công nghệ, Thể dục/GDTC, GDQP, Hoạt động trải nghiệm, Chào cờ, Sinh hoạt lớp...).
   - teacher: Tên giáo viên nếu có trong bảng (ví dụ: "Cô Hoa", "Thầy Minh", hoặc để trống "" nếu không có).
   - room: Phòng học nếu có (hoặc để trống "" nếu không có).
   - dayNotes: Ghi chú riêng của từng ngày nếu có (ví dụ "Chào cờ đầu tuần", "Sinh hoạt lớp").

5. XỬ LÝ KHI CÓ NHIỀU TỆP / NHIỀU HÌNH ẢNH:
   - Nếu có nhiều tệp tin hoặc hình ảnh, hãy phân tích và kết hợp dữ liệu từ tất cả các tệp lại thành MỘT thời khóa biểu duy nhất hoàn chỉnh. Ví dụ: tệp 1 là các buổi sáng, tệp 2 là các buổi chiều; hoặc ảnh 1 là nửa đầu tuần, ảnh 2 là nửa cuối tuần.

6. ĐỊNH DẠNG ĐẦU RA:
   - CHỈ trả về duy nhất chuỗi JSON hợp lệ, không bọc trong markdown, không có văn bản nào ngoài JSON.
`.trim();

  parts.unshift({ text: systemInstruction });

  return { parts, summary };
}

/**
 * Gửi yêu cầu phân tích tới Gemini AI thông qua dịch vụ API của hệ thống
 */
export async function analyzeTimetableWithAI(
  input: AIAnalysisInput
): Promise<AITimetableExtractionResult> {
  const { parts } = await prepareAIContent(input);

  if (parts.length <= 1) {
    throw new Error('Vui lòng chọn tệp tin, hình ảnh hoặc dán nội dung thời khóa biểu để phân tích.');
  }

  // Chuẩn bị payload theo chuẩn Gemini generateContent
  const contents = [
    {
      role: 'user',
      parts
    }
  ];

  const generationConfig = {
    temperature: 0.1, // Nhiệt độ thấp để đảm bảo độ chính xác trích xuất tối đa
    topP: 0.95,
    responseMimeType: 'application/json'
  };

  let rawResponseText: string | null = null;

  // 1. Thử qua window.ndAI_API (Lõi AI chính của ND Labs & EduSpace)
  const apiService = (window as any).ndAI_API;
  if (apiService && typeof apiService.call === 'function') {
    try {
      rawResponseText = await apiService.call({
        contents,
        generationConfig
      });
    } catch (apiErr: any) {
      console.warn('[AI Timetable] Lỗi khi gọi window.ndAI_API, thử gọi trực tiếp:', apiErr);
    }
  }

  // 2. Nếu chưa thành công, thử gọi trực tiếp qua Gemini API key đã lưu trong hệ thống
  if (!rawResponseText) {
    rawResponseText = await callGeminiDirectFallback(contents, generationConfig);
  }

  if (!rawResponseText || !rawResponseText.trim()) {
    throw new Error('AI không phản hồi hoặc không thể phân tích nội dung được cung cấp. Vui lòng thử lại.');
  }

  // 3. Phân tích kết quả JSON
  return parseAIResponseJSON(rawResponseText, input.sessionFilter);
}

/**
 * Gọi trực tiếp tới Google Generative Language API với các API key có sẵn
 */
async function callGeminiDirectFallback(contents: any[], generationConfig: any): Promise<string> {
  // Lấy API key từ nhiều nguồn
  let apiKey: string | null = null;

  // Nguồn 1: User custom key
  try {
    const rawUser = localStorage.getItem('nd_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.customGeminiKey && u.customGeminiKey.trim()) {
        apiKey = u.customGeminiKey.trim();
      }
    }
  } catch (_) {}

  // Nguồn 2: Hàm getGeminiApiKey toàn cục
  if (!apiKey && typeof (window as any).getGeminiApiKey === 'function') {
    try {
      apiKey = await (window as any).getGeminiApiKey();
    } catch (_) {}
  }

  // Nguồn 3: EDU_CONFIG
  if (!apiKey && (window as any).EDU_CONFIG?.geminiApiKey) {
    const k = (window as any).EDU_CONFIG.geminiApiKey;
    if (!k.includes('PLACEHOLDER')) apiKey = k;
  }

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    throw new Error('Chưa cấu hình API Key cho AI. Vui lòng kiểm tra lại cấu hình hoặc thêm API key trong Cài đặt tài khoản.');
  }

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig,
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        })
      });

      if (!resp.ok) continue;

      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (_) {}
  }

  throw new Error('Không thể kết nối tới máy chủ AI. Vui lòng thử lại sau.');
}

/**
 * Đọc File thành Base64 (bỏ header data URL)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Xử lý chuỗi JSON phản hồi an toàn từ AI
 */
function parseAIResponseJSON(
  rawText: string,
  sessionFilter?: 'all' | 'morning' | 'afternoon'
): AITimetableExtractionResult {
  let cleaned = rawText.trim();

  // Bỏ bọc ```json và ``` nếu AI vô tình thêm vào
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Chuẩn hóa danh sách slots
    let validSlots: ExtractedSlot[] = [];
    if (Array.isArray(parsed.slots)) {
      parsed.slots.forEach((item: any) => {
        if (
          typeof item.dayIndex === 'number' &&
          item.dayIndex >= 0 &&
          item.dayIndex <= 6 &&
          (item.period === 'morning' || item.period === 'afternoon') &&
          typeof item.slotNumber === 'number' &&
          item.slotNumber >= 1 &&
          item.subject &&
          String(item.subject).trim()
        ) {
          validSlots.push({
            dayIndex: item.dayIndex,
            period: item.period,
            slotNumber: item.slotNumber,
            subject: String(item.subject).trim(),
            teacher: item.teacher ? String(item.teacher).trim() : '',
            room: item.room ? String(item.room).trim() : ''
          });
        }
      });
    }

    // Auto-heal 1: Tự động sửa lỗi AI xếp nhầm tiết sáng 4, 5 thành buổi chiều.
    // Tại Việt Nam, buổi chiều KHÔNG BAO GIỜ bắt đầu từ tiết 4 hoặc tiết 5 mà không có tiết 1 hoặc 2.
    // Nếu có các tiết chiều nhưng KHÔNG CÓ tiết nào có slotNumber <= 2,
    // đó 100% là tiết sáng 4, 5 bị AI hiểu nhầm thành buổi chiều!
    const afternoonSlots = validSlots.filter((s) => s.period === 'afternoon');
    if (afternoonSlots.length > 0) {
      const hasEarlyAfternoon = afternoonSlots.some((s) => s.slotNumber <= 2);
      if (!hasEarlyAfternoon) {
        validSlots.forEach((s) => {
          if (s.period === 'afternoon') {
            s.period = 'morning';
          }
        });
      }
    }

    // Áp dụng bộ lọc phiên học theo yêu cầu của người dùng
    if (sessionFilter === 'morning') {
      // Chỉ lấy buổi sáng -> loại bỏ hoàn toàn các tiết chiều
      validSlots = validSlots.filter((s) => s.period === 'morning');
    } else if (sessionFilter === 'afternoon') {
      // Chỉ lấy buổi chiều -> loại bỏ hoàn toàn các tiết sáng
      validSlots = validSlots.filter((s) => s.period === 'afternoon');
    }

    // Tính toán số tiết thực tế xuất hiện trong validSlots
    let actualMaxMorning = 0;
    let actualMaxAfternoon = 0;
    validSlots.forEach((s) => {
      if (s.period === 'morning' && s.slotNumber > actualMaxMorning) {
        actualMaxMorning = s.slotNumber;
      }
      if (s.period === 'afternoon' && s.slotNumber > actualMaxAfternoon) {
        actualMaxAfternoon = s.slotNumber;
      }
    });

    // Xác định morningSlotsCount:
    let computedMorningSlots = actualMaxMorning;
    if (actualMaxMorning === 0) {
      if (sessionFilter === 'morning') {
        computedMorningSlots = 5;
      } else if (actualMaxAfternoon > 0 || sessionFilter === 'afternoon') {
        computedMorningSlots = 0;
      } else if (typeof parsed.morningSlotsCount === 'number') {
        computedMorningSlots = Math.max(0, parsed.morningSlotsCount);
      } else {
        computedMorningSlots = 5;
      }
    }

    // Xác định afternoonSlotsCount:
    // TUYỆT ĐỐI KHÔNG tự gán số tiết chiều nếu không có bất kỳ tiết chiều nào!
    let computedAfternoonSlots = actualMaxAfternoon;
    if (sessionFilter === 'morning') {
      computedAfternoonSlots = 0;
    }

    return {
      title: parsed.title ? String(parsed.title).trim() : undefined,
      school: parsed.school ? String(parsed.school).trim() : undefined,
      gradeClass: parsed.gradeClass ? String(parsed.gradeClass).trim() : undefined,
      schoolYear: parsed.schoolYear ? String(parsed.schoolYear).trim() : undefined,
      startWeek: typeof parsed.startWeek === 'number' ? parsed.startWeek : undefined,
      endWeek: typeof parsed.endWeek === 'number' ? parsed.endWeek : undefined,
      morningSlotsCount: computedMorningSlots,
      afternoonSlotsCount: computedAfternoonSlots,
      slots: validSlots,
      dayNotes: parsed.dayNotes && typeof parsed.dayNotes === 'object' ? parsed.dayNotes : {}
    };
  } catch (err: any) {
    console.error('Lỗi phân tích JSON từ AI:', err, 'Nội dung thô:', rawText);
    throw new Error('Dữ liệu AI trả về không đúng định dạng chuẩn. Vui lòng thử lại với nội dung rõ ràng hơn.');
  }
}
