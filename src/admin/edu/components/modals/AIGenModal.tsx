import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  ExternalLink,
  PlusCircle,
  X,
  BookOpen,
  Layers,
  Sliders,
  CheckSquare,
  HelpCircle,
  FileText,
  ListOrdered,
  Link2,
  FolderTree,
  AlertOctagon,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  buildGenerateExamPrompt,
  copyTextToClipboard,
  extractJsonFromText,
  cleanJsonString,
  robustJsonParse,
  openGeminiNotebook,
  openNotebookLM,
  normalizeShortDecimalAnswer,
  isValidShortDecimalAnswer,
} from '../../services/aiService';
import type { Question, PassageContext, RubricStep, ExamStructure } from '../../types';

interface AIGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions?: (questions: Question[], passage?: PassageContext) => void;
  onImportQuestions?: (questions: Question[]) => void;
  currentGrade?: string;
  currentSubject?: string;
  examTitle?: string;
  examType?: string;
  matrixDuration?: number;
  structure?: ExamStructure;
  structPoints?: any;
  onSwitchToJsonMode?: (jsonString: string) => void;
  onToast?: (msg: string, isError?: boolean) => void;
}

export const AIGenModal: React.FC<AIGenModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  onImportQuestions,
  currentGrade,
  currentSubject,
  examTitle,
  examType,
  matrixDuration,
  structure,
  structPoints,
  onSwitchToJsonMode,
  onToast,
}) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(currentSubject || 'Toán học');
  const [grade, setGrade] = useState(currentGrade || '12');
  const [count, setCount] = useState(5);
  const [showAdvancedMatrix, setShowAdvancedMatrix] = useState(false);

  // Nhóm 1: GDPT 2018 cơ bản
  const [includeMultiple, setIncludeMultiple] = useState(true);
  const [includeTF, setIncludeTF] = useState(true);
  const [includeShort, setIncludeShort] = useState(false);

  // Nhóm 2: Tương tác & Nâng cao
  const [includeEssay, setIncludeEssay] = useState(false);
  const [includeMatching, setIncludeMatching] = useState(false);
  const [includeCloze, setIncludeCloze] = useState(false);
  const [includeOrdering, setIncludeOrdering] = useState(false);

  // Nhóm 3: ĐGNL & Quốc tế
  const [includeMultiSelect, setIncludeMultiSelect] = useState(false);
  const [includeGrouping, setIncludeGrouping] = useState(false);
  const [includeErrorIdentification, setIncludeErrorIdentification] = useState(false);

  // Tùy chọn Ngữ liệu & Ma trận
  const [includePassage, setIncludePassage] = useState(false);
  const [useMatrix, setUseMatrix] = useState(false);
  const [matrixNB, setMatrixNB] = useState(40);
  const [matrixTH, setMatrixTH] = useState(30);
  const [matrixVD, setMatrixVD] = useState(20);
  const [matrixVDC, setMatrixVDC] = useState(10);

  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const notify = (msg: string, isError?: boolean) => {
    if (onToast) {
      onToast(msg, isError);
    } else {
      console.log(`[AI Gen Modal] ${isError ? 'Error: ' : ''}${msg}`);
    }
  };

  // Tính tóm tắt ma trận câu hỏi hiện tại từ props
  const sc = structure?.counts;
  const activeCountsList: string[] = [];
  let totalMatrixQuestions = 0;
  if (sc) {
    if (sc.multiple && sc.multiple > 0) {
      activeCountsList.push(`${sc.multiple} TN 4 lựa chọn`);
      totalMatrixQuestions += sc.multiple;
    }
    if (sc.truefalse && sc.truefalse > 0) {
      activeCountsList.push(`${sc.truefalse} Đúng/Sai 4 ý`);
      totalMatrixQuestions += sc.truefalse;
    }
    if (sc.short && sc.short > 0) {
      activeCountsList.push(`${sc.short} Trả lời ngắn`);
      totalMatrixQuestions += sc.short;
    }
    if (sc.essay && sc.essay > 0) {
      activeCountsList.push(`${sc.essay} Tự luận`);
      totalMatrixQuestions += sc.essay;
    }
    if (sc.matching && sc.matching > 0) {
      activeCountsList.push(`${sc.matching} Nối cặp`);
      totalMatrixQuestions += sc.matching;
    }
    if (sc.cloze && sc.cloze > 0) {
      activeCountsList.push(`${sc.cloze} Điền khuyết`);
      totalMatrixQuestions += sc.cloze;
    }
    if (sc.ordering && sc.ordering > 0) {
      activeCountsList.push(`${sc.ordering} Thứ tự`);
      totalMatrixQuestions += sc.ordering;
    }
    if (sc.multiselect && sc.multiselect > 0) {
      activeCountsList.push(`${sc.multiselect} Nhiều đáp án`);
      totalMatrixQuestions += sc.multiselect;
    }
    if (sc.grouping && sc.grouping > 0) {
      activeCountsList.push(`${sc.grouping} Phân loại`);
      totalMatrixQuestions += sc.grouping;
    }
    if (sc.error_identification && sc.error_identification > 0) {
      activeCountsList.push(`${sc.error_identification} Tìm lỗi sai`);
      totalMatrixQuestions += sc.error_identification;
    }
  }

  const matrixSummary =
    activeCountsList.length > 0
      ? activeCountsList.join(', ')
      : `${count} câu tự chọn`;

  const handleCopyPrompt = async () => {
    if (!topic.trim()) {
      notify('Vui lòng nhập chi tiết yêu cầu / nội dung đề thi muốn tạo.', true);
      return;
    }

    const promptText = buildGenerateExamPrompt({
      topic,
      title: examTitle,
      subject: currentSubject || subject,
      grade: currentGrade || grade,
      duration: matrixDuration,
      examType,
      structureCounts: structure?.counts,
      structPoints,
      count: totalMatrixQuestions || count,
      includeMultiple,
      includeTF,
      includeShort,
      includeEssay,
      includeMatching,
      includeCloze,
      includeOrdering,
      includeMultiSelect,
      includeGrouping,
      includeErrorIdentification,
      includePassage,
      matrixLevels: useMatrix
        ? {
            nhanBiet: matrixNB,
            thongHieu: matrixTH,
            vanDung: matrixVD,
            vanDungCao: matrixVDC,
          }
        : undefined,
    });

    const success = await copyTextToClipboard(promptText);
    if (success) {
      notify('Đã sao chép Prompt tạo đề cho Gemini! Hãy dán vào Gemini.');
    } else {
      notify('Không thể tự động sao chép. Hãy thử lại.', true);
    }
  };

  const handleImportJson = (switchToJson: boolean = false) => {
    if (!jsonInput.trim()) {
      notify('Vui lòng dán kết quả JSON từ Gemini vào ô nhập liệu.', true);
      return;
    }

    try {
      let parsed = robustJsonParse(jsonInput);
      const cleanedCode = cleanJsonString(jsonInput);
      let rawPassages: PassageContext[] = [];
      let rawQuestions: any[] = [];

      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (parsed.passage && typeof parsed.passage === 'object') {
          rawPassages.push({
            id: parsed.passage.id || `p_${Date.now().toString(36)}`,
            title: parsed.passage.title || `Ngữ liệu đọc hiểu (${subject} ${grade})`,
            content: parsed.passage.content || '',
            shuffleQuestions: true,
          });
        }
        if (Array.isArray(parsed.passages)) {
          rawPassages = parsed.passages;
        }

        if (Array.isArray(parsed.questions)) {
          rawQuestions = parsed.questions;
        } else if (parsed.exam && Array.isArray(parsed.exam.questions)) {
          rawQuestions = parsed.exam.questions;
        } else if (parsed.quiz && Array.isArray(parsed.quiz.questions)) {
          rawQuestions = parsed.quiz.questions;
        } else if (parsed.quizData && Array.isArray(parsed.quizData.questions)) {
          rawQuestions = parsed.quizData.questions;
        } else if (parsed.data && Array.isArray(parsed.data.questions)) {
          rawQuestions = parsed.data.questions;
        } else if (Array.isArray(parsed.data)) {
          rawQuestions = parsed.data;
        } else if (Array.isArray(parsed.exam)) {
          rawQuestions = parsed.exam;
        } else if (parsed.dethi && Array.isArray(parsed.dethi.questions)) {
          rawQuestions = parsed.dethi.questions;
        } else if (Array.isArray(parsed.dethi)) {
          rawQuestions = parsed.dethi;
        } else if (Array.isArray(parsed.cauhoi)) {
          rawQuestions = parsed.cauhoi;
        }
      }

      if (rawQuestions.length === 0) {
        notify('Dữ liệu JSON không chứa danh sách câu hỏi hợp lệ.', true);
        return;
      }

      const defaultPassageId = rawPassages[0]?.id;
      const validated: Question[] = [];

      rawQuestions.forEach((q: any) => {
        if (!q.question) return;
        const type = q.type || 'multiple';
        const cog = q.cognitiveLevel;
        const qPoints =
          q.points !== undefined
            ? Number(q.points)
            : type === 'truefalse'
            ? (structPoints?.truefalse ?? 1.0)
            : type === 'short'
            ? (structPoints?.short ?? 0.5)
            : type === 'essay'
            ? (structPoints?.essay ?? 2.0)
            : (structPoints?.multiple ?? 0.25);

        const pId = q.passageId || defaultPassageId;

        if (type === 'multiple') {
          validated.push({
            type: 'multiple',
            question: q.question,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
            correct: typeof q.correct === 'number' ? q.correct : 0,
            points: qPoints,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'truefalse') {
          validated.push({
            type: 'truefalse',
            question: q.question,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
            correctAnswers: Array.isArray(q.correctAnswers)
              ? q.correctAnswers.slice(0, 4)
              : [true, false, false, false],
            points: qPoints,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'short') {
          const shortCorrect = q.correct !== undefined ? String(q.correct) : '';
          const norm = normalizeShortDecimalAnswer(shortCorrect);
          validated.push({
            type: 'short',
            question: q.question,
            correct: norm || shortCorrect,
            points: qPoints,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'essay') {
          const rubrics: RubricStep[] = Array.isArray(q.rubric)
            ? q.rubric.map((r: any, rIdx: number) => ({
                step: r.step || rIdx + 1,
                description: String(r.description || `Bước ${rIdx + 1}`),
                points: Number(r.points) || 0.5,
              }))
            : [];
          validated.push({
            type: 'essay',
            question: q.question,
            correct: q.correct !== undefined ? String(q.correct) : '',
            points: qPoints,
            cognitiveLevel: cog,
            rubrics: rubrics.length > 0 ? rubrics : undefined,
            allowAttachments: true,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'matching') {
          validated.push({
            type: 'matching',
            question: q.question,
            pairs: Array.isArray(q.pairs)
              ? q.pairs.map((p: any, pIdx: number) => ({
                  id: String(p.id || pIdx + 1),
                  left: String(p.left || ''),
                  right: String(p.right || ''),
                }))
              : [],
            points: qPoints || 1.0,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'cloze') {
          validated.push({
            type: 'cloze',
            question: q.question,
            blanks: Array.isArray(q.blanks)
              ? q.blanks.map((b: any, bIdx: number) => ({
                  id: String(b.id || bIdx + 1),
                  options: Array.isArray(b.options) ? b.options : undefined,
                  correct: String(b.correct || ''),
                }))
              : [],
            points: qPoints || 1.0,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'ordering') {
          validated.push({
            type: 'ordering',
            question: q.question,
            items: Array.isArray(q.items)
              ? q.items.map((it: any, itIdx: number) => ({
                  id: String(it.id || `step_${itIdx + 1}`),
                  text: String(it.text || ''),
                }))
              : [],
            points: qPoints || 1.0,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'multiselect') {
          validated.push({
            type: 'multiselect',
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correct: Array.isArray(q.correct) ? q.correct.map(Number) : [0],
            partialCredit: true,
            points: qPoints || 1.0,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'grouping') {
          validated.push({
            type: 'grouping',
            question: q.question,
            categories: Array.isArray(q.categories)
              ? q.categories.map((c: any, cIdx: number) => ({
                  id: String(c.id || `cat_${cIdx + 1}`),
                  name: String(c.name || `Nhóm ${cIdx + 1}`),
                }))
              : [],
            items: Array.isArray(q.items)
              ? q.items.map((item: any, itIdx: number) => ({
                  id: String(item.id || `item_${itIdx + 1}`),
                  text: String(item.text || ''),
                  categoryId: String(item.categoryId || ''),
                }))
              : [],
            points: qPoints || 1.0,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        } else if (type === 'error_identification') {
          validated.push({
            type: 'error_identification',
            question: q.question,
            underlines: Array.isArray(q.underlines)
              ? q.underlines.map((u: any, uIdx: number) => ({
                  id: String(u.id || ['A', 'B', 'C', 'D'][uIdx] || String(uIdx + 1)),
                  text: String(u.text || ''),
                  isError: Boolean(u.isError),
                }))
              : [],
            correctCorrection: String(q.correctCorrection || ''),
            points: qPoints || 0.5,
            cognitiveLevel: cog,
            explanation: q.explanation || '',
            passageId: pId,
          });
        }
      });

      if (validated.length === 0) {
        notify('Không tìm thấy câu hỏi hợp lệ trong JSON.', true);
        return;
      }

      if (onAddQuestions) {
        onAddQuestions(validated, rawPassages[0]);
      } else if (onImportQuestions) {
        onImportQuestions(validated);
      }

      if (switchToJson && onSwitchToJsonMode) {
        onSwitchToJsonMode(cleanedCode);
      }

      setJsonInput('');
      onClose();
      notify(
        `Đã nạp thành công ${validated.length} câu hỏi${
          rawPassages.length > 0 ? ' kèm ngữ liệu đọc hiểu' : ''
        } vào đề thi${switchToJson ? ' và chuyển sang trình viết mã JSON.' : '.'}`
      );
    } catch (err: any) {
      notify('Lỗi đọc JSON: ' + (err?.message || err), true);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-purple-600">
            <Sparkles className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-slate-900">AI Tạo đề thi (Gemini Bridge)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tạo prompt GDPT 2018 &amp; ĐGNL đa dạng dạng bài → Dán vào Gemini → Nạp JSON vào đề thi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1 text-sm text-slate-700 flex-1">
          {/* Step 1 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Thiết lập yêu cầu đề thi
            </div>

            {/* Exam info badge pulled from props */}
            <div className="p-3.5 bg-purple-50/80 border border-purple-200/90 rounded-2xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-extrabold text-purple-900 text-sm">
                  {examTitle || `Đề kiểm tra môn ${currentSubject || subject}`}
                </span>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg">{currentSubject || subject}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg">Khối {currentGrade || grade}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">{matrixDuration || 90} phút</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg">{examType || 'GDPT 2018'}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
                <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span><b>Ma trận cấu trúc đề:</b> {matrixSummary}</span>
              </div>
            </div>

            {/* Focused Topic/Detail Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chi tiết yêu cầu đề thi (Nội dung bài học, dạng bài trọng tâm, yêu cầu riêng) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Kiểm tra 1 tiết chương 1 Đạo hàm và ứng dụng khảo sát hàm số, bám sát sách Cánh Diều, có 2 bài toán tối ưu kinh tế thực tế, phân hóa rõ 2 câu cuối..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Reading passage toggle & Advanced toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-900 bg-purple-50/60 hover:bg-purple-50 px-3 py-2 rounded-xl border border-purple-200/70 transition">
                <input
                  type="checkbox"
                  checked={includePassage}
                  onChange={(e) => setIncludePassage(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <span>📖 Sinh kèm Ngữ liệu đọc hiểu / Tình huống dùng chung</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvancedMatrix(!showAdvancedMatrix)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <span>{showAdvancedMatrix ? 'Thu gọn tùy chỉnh ma trận' : 'Tùy chỉnh thêm môn, khối & ma trận'}</span>
                {showAdvancedMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Advanced Matrix / Overrides */}
            {showAdvancedMatrix && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-3 pt-3 animate-in fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Môn học</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Khối lớp</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Số câu (nếu khác ma trận)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value, 10) || 5)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-extrabold text-slate-700">
                    Các dạng câu hỏi yêu cầu sinh:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMultiple}
                        onChange={(e) => setIncludeMultiple(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Trắc nghiệm 4 lựa chọn</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTF}
                        onChange={(e) => setIncludeTF(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Đúng / Sai 4 ý</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeShort}
                        onChange={(e) => setIncludeShort(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Trả lời ngắn / điền số</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeEssay}
                        onChange={(e) => setIncludeEssay(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Tự luận kèm Rubric</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMatching}
                        onChange={(e) => setIncludeMatching(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Nối cặp Cột A - B</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCloze}
                        onChange={(e) => setIncludeCloze(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Điền khuyết vị trí [1],[2]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeOrdering}
                        onChange={(e) => setIncludeOrdering(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Sắp xếp thứ tự</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMultiSelect}
                        onChange={(e) => setIncludeMultiSelect(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Nhiều đáp án đúng</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeGrouping}
                        onChange={(e) => setIncludeGrouping(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Phân loại vào nhóm</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeErrorIdentification}
                        onChange={(e) => setIncludeErrorIdentification(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span>Tìm lỗi sai và sửa lại</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
            <div className="font-extrabold text-xs text-purple-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Chuyển tiếp Prompt sang Gemini
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Nhấn <b>Sao chép Prompt</b>, sau đó mở Gemini Web hoặc NotebookLM để dán yêu cầu AI soạn đề.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép Prompt cho Gemini</span>
              </button>
              <button
                type="button"
                onClick={openGeminiNotebook}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                <span>Mở Gemini Web</span>
              </button>
              <button
                type="button"
                onClick={openNotebookLM}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mở NotebookLM</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <div className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Dán kết quả JSON từ Gemini vào đây
            </div>
            <textarea
              rows={5}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Dán toàn bộ kết quả mà Gemini trả về vào đây (chấp nhận cả khối ```json [ ... ]``` hoặc [ ... ] hoặc { passage, questions })..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleImportJson(false)}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Nạp câu hỏi vào đề</span>
            </button>
            <button
              type="button"
              onClick={() => handleImportJson(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              title="Làm sạch JSON và đưa thẳng vào Trình Soạn Mã JSON của đề thi"
            >
              <Code className="w-4 h-4" />
              <span>Đưa vào Viết mã JSON &amp; Áp dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
