import React, { useState } from 'react';
import { Code, ArrowDownLeft, X } from 'lucide-react';
import {
  extractJsonFromText,
  normalizeShortDecimalAnswer,
  isValidShortDecimalAnswer,
} from '../../services/aiService';
import type { Question, ExamStructure } from '../../types';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteImport: (
    questions: Question[],
    mode: 'append' | 'replace',
    meta?: { title?: string; subject?: string; examStructure?: ExamStructure }
  ) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onExecuteImport,
  onToast,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!jsonInput.trim()) {
      onToast('Vui lòng dán dữ liệu JSON vào ô nhập liệu.', true);
      return;
    }

    try {
      const parsed = extractJsonFromText(jsonInput);
      let qList: any[] = [];
      let extraMeta: { title?: string; subject?: string; examStructure?: ExamStructure } = {};

      if (Array.isArray(parsed)) {
        qList = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.questions)) {
          qList = parsed.questions;
        } else if (parsed.quizData && Array.isArray(parsed.quizData.questions)) {
          qList = parsed.quizData.questions;
        }
        if (parsed.title) extraMeta.title = parsed.title;
        if (parsed.subject) extraMeta.subject = parsed.subject;
        const struct = parsed.examStructure || parsed.quizData?.examStructure;
        if (struct) extraMeta.examStructure = struct;
      }

      if (!Array.isArray(qList) || qList.length === 0) {
        onToast('Không tìm thấy danh sách câu hỏi hợp lệ trong JSON.', true);
        return;
      }

      // Chuẩn hóa và validate
      const validated: Question[] = [];
      qList.forEach((q: any, i: number) => {
        if (!q.question) return;
        const type = q.type || 'multiple';
        const qPoints =
          q.points !== undefined
            ? Number(q.points)
            : type === 'truefalse'
            ? 1.0
            : type === 'short'
            ? 0.5
            : 0.25;

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
        onToast('Không tìm thấy câu hỏi hợp lệ.', true);
        return;
      }

      onExecuteImport(validated, importMode, extraMeta);
      setJsonInput('');
      onClose();
      onToast(`Đã nạp thành công ${validated.length} câu hỏi vào trình soạn thảo.`);
    } catch (err: any) {
      onToast('Lỗi đọc JSON: ' + (err?.message || err), true);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <Code className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-slate-900">Nạp dữ liệu câu hỏi từ JSON</h3>
              <p className="text-xs text-slate-500 font-medium">
                Dán JSON từ Gemini hoặc tệp xuất đề thi để nạp trực tiếp vào Visual Editor.
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

        <div className="overflow-y-auto space-y-3 pr-1 text-sm text-slate-700 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Nội dung JSON (mảng câu hỏi hoặc đối tượng đề thi):
            </label>
            <textarea
              rows={9}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Dán JSON vào đây, ví dụ: [{"type":"multiple","question":"...","options":["..."],"correct":0}]...'
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="jsonImportMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="text-emerald-600"
              />
              <span>Thêm nối tiếp vào cuối đề hiện tại</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="jsonImportMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-emerald-600"
              />
              <span>Ghi đè thay thế toàn bộ đề đang soạn</span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Nạp vào trình soạn thảo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
