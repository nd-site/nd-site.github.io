import React, { useState } from 'react';
import { Lightbulb, Copy, ExternalLink, CheckCircle, X } from 'lucide-react';
import {
  buildExplanationPrompt,
  copyTextToClipboard,
  extractJsonFromText,
  openGeminiNotebook,
} from '../../services/aiService';
import type { Question } from '../../types';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onApplyExplanations: (updates: { index: number; explanation: string }[]) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  questions,
  onApplyExplanations,
  onToast,
}) => {
  const [scope, setScope] = useState<'missing' | 'all'>('missing');
  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const missingCount = questions.filter(
    (q) => !q.explanation || q.explanation.trim() === ''
  ).length;

  const handleCopyPrompt = async () => {
    if (questions.length === 0) {
      onToast('Chưa có câu hỏi nào trong đề.', true);
      return;
    }

    if (scope === 'missing' && missingCount === 0) {
      onToast('Tất cả câu hỏi trong đề đều đã có lời giải chi tiết.');
      return;
    }

    const promptText = buildExplanationPrompt(questions, scope);
    const success = await copyTextToClipboard(promptText);
    if (success) {
      onToast('Đã sao chép Prompt viết lời giải cho Gemini! Mở Gemini để dán.');
    } else {
      onToast('Không thể sao chép tự động.', true);
    }
  };

  const handleApply = () => {
    if (!jsonInput.trim()) {
      onToast('Vui lòng dán kết quả JSON mảng lời giải từ Gemini.', true);
      return;
    }

    try {
      let parsed = extractJsonFromText(jsonInput);
      if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.explanations)) {
        parsed = parsed.explanations;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        onToast('Định dạng JSON mảng lời giải không hợp lệ.', true);
        return;
      }

      const updates: { index: number; explanation: string }[] = [];
      parsed.forEach((item: any) => {
        const idx = (item.index || item.id) - 1;
        const exp = item.explanation || item.exp || '';
        if (idx >= 0 && idx < questions.length && exp) {
          updates.push({ index: idx, explanation: exp });
        }
      });

      if (updates.length > 0) {
        onApplyExplanations(updates);
        setJsonInput('');
        onClose();
        onToast(`Đã cập nhật thành công lời giải chi tiết cho ${updates.length} câu hỏi.`);
      } else {
        onToast('Không tìm thấy câu hỏi phù hợp để áp dụng lời giải.', true);
      }
    } catch (err: any) {
      onToast('Lỗi đọc JSON lời giải: ' + (err?.message || err), true);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-600">
            <Lightbulb className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-slate-900">
                AI Viết lời giải chi tiết (Gemini Bridge)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tự động soạn lời giải sư phạm từng bước có công thức KaTeX cho từng câu hỏi.
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
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-3">
            <div className="font-extrabold text-xs text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Phạm vi câu hỏi cần viết giải thích
            </div>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="aiExpScope"
                  value="missing"
                  checked={scope === 'missing'}
                  onChange={() => setScope('missing')}
                  className="text-amber-600"
                />
                <span>
                  Chỉ viết cho các câu chưa có lời giải (
                  <span className="text-amber-700 font-black">{missingCount}</span> câu)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="aiExpScope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="text-amber-600"
                />
                <span>
                  Viết lại lời giải cho tất cả câu hỏi trong đề (
                  <span className="text-amber-700 font-black">{questions.length}</span> câu)
                </span>
              </label>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép Prompt Viết Giải Thích</span>
              </button>
              <button
                type="button"
                onClick={openGeminiNotebook}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                <span>Mở Gemini Web</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Dán kết quả JSON mảng lời giải từ Gemini vào đây
            </div>
            <textarea
              rows={5}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Dán mảng JSON từ Gemini vào đây (vd: [{"index": 1, "explanation": "Bước 1: Tính đạo hàm..."}, ...])...'
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            onClick={handleApply}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Áp dụng lời giải vào đề thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
