import React, { useState } from 'react';
import { Sparkles, Copy, ExternalLink, PlusCircle, X, BookOpen } from 'lucide-react';
import {
  buildGenerateExamPrompt,
  copyTextToClipboard,
  extractJsonFromText,
  openGeminiNotebook,
  openNotebookLM,
  normalizeShortDecimalAnswer,
  isValidShortDecimalAnswer,
} from '../../services/aiService';
import type { Question } from '../../types';

interface AIGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Question[]) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const AIGenModal: React.FC<AIGenModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
  onToast,
}) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('12');
  const [count, setCount] = useState(5);
  const [includeMultiple, setIncludeMultiple] = useState(true);
  const [includeTF, setIncludeTF] = useState(true);
  const [includeShort, setIncludeShort] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    if (!topic.trim()) {
      onToast('Vui lòng nhập chủ đề / yêu cầu đề thi.', true);
      return;
    }

    const promptText = buildGenerateExamPrompt({
      topic,
      subject,
      grade,
      count,
      includeMultiple,
      includeTF,
      includeShort,
    });

    const success = await copyTextToClipboard(promptText);
    if (success) {
      onToast('Đã sao chép Prompt tạo đề cho Gemini! Hãy dán vào Gemini.');
    } else {
      onToast('Không thể tự động sao chép. Hãy thử lại.', true);
    }
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      onToast('Vui lòng dán kết quả JSON từ Gemini vào ô nhập liệu.', true);
      return;
    }

    try {
      let parsed = extractJsonFromText(jsonInput);
      if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.questions)) {
        parsed = parsed.questions;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        onToast('Dữ liệu JSON không chứa danh sách câu hỏi hợp lệ.', true);
        return;
      }

      const validated: Question[] = [];
      parsed.forEach((q: any, i: number) => {
        if (!q.question) return;
        const type = q.type || 'multiple';
        const qPoints = q.points !== undefined ? Number(q.points) : type === 'truefalse' ? 1.0 : type === 'short' ? 0.5 : 0.25;

        if (type === 'multiple') {
          validated.push({
            type: 'multiple',
            question: q.question,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
            correct: typeof q.correct === 'number' ? q.correct : 0,
            points: qPoints,
            explanation: q.explanation || '',
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
            explanation: q.explanation || '',
          });
        } else if (type === 'short') {
          const shortCorrect = q.correct !== undefined ? String(q.correct) : '';
          if (!isValidShortDecimalAnswer(shortCorrect)) {
            throw new Error(`Câu ${i + 1}: đáp án trả lời ngắn phải là số thập phân, tối đa 4 ký tự.`);
          }
          validated.push({
            type: 'short',
            question: q.question,
            correct: normalizeShortDecimalAnswer(shortCorrect),
            points: qPoints,
            explanation: q.explanation || '',
          });
        } else {
          validated.push({
            type: 'essay',
            question: q.question,
            correct: q.correct !== undefined ? String(q.correct) : '',
            points: qPoints || 2.0,
            explanation: q.explanation || '',
          });
        }
      });

      if (validated.length === 0) {
        onToast('Không tìm thấy câu hỏi hợp lệ trong JSON.', true);
        return;
      }

      onImportQuestions(validated);
      setJsonInput('');
      onClose();
      onToast(`Đã nạp thành công ${validated.length} câu hỏi mới vào đề thi.`);
    } catch (err: any) {
      onToast('Lỗi đọc JSON: ' + (err?.message || err), true);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-purple-600">
            <Sparkles className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-slate-900">AI Tạo đề thi (Gemini Notebook Bridge)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tạo prompt chuẩn GDPT 2018 → Gửi sang Gemini Notebook → Nạp JSON vào đề thi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
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
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Chủ đề / Yêu cầu kiến thức <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Khảo sát sự biến thiên và vẽ đồ thị hàm số lớp 12, phân bổ 3 câu nhận biết, 2 câu thông hiểu, có bài toán thực tế..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Môn học</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Khối lớp</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Số lượng câu</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dạng câu hỏi mong muốn</label>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700 flex-wrap">
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
                  <span>Trả lời ngắn</span>
                </label>
              </div>
            </div>
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
              placeholder="Dán toàn bộ kết quả mà Gemini trả về vào đây (chấp nhận cả khối ```json [ ... ]``` hoặc [ ... ])..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleImportJson}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nạp câu hỏi vào đề thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
