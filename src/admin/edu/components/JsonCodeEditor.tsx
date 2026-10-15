import React, { useState, useEffect } from 'react';
import { Code, Check, RefreshCw, Copy, Upload, AlertCircle } from 'lucide-react';
import type { Question, ExamStructure, PassageContext } from '../types';

interface JsonCodeEditorProps {
  quizTitle: string;
  grade: string;
  subject: string;
  examType: string;
  author: string;
  collaborators: string[];
  matrixDuration: number;
  fullDuration: number;
  structure: ExamStructure;
  passages: PassageContext[];
  questions: Question[];
  onApplyJson: (payload: {
    quizTitle?: string;
    grade?: string;
    subject?: string;
    examType?: string;
    author?: string;
    collaborators?: string[];
    matrixDuration?: number;
    fullDuration?: number;
    structure?: ExamStructure;
    passages?: PassageContext[];
    questions: Question[];
  }) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  quizTitle,
  grade,
  subject,
  examType,
  author,
  collaborators,
  matrixDuration,
  fullDuration,
  structure,
  passages,
  questions,
  onApplyJson,
  onToast,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [syntaxError, setSyntaxError] = useState<string | null>(null);

  // Sync from props on initial load or reset
  const generateCurrentJson = () => {
    const payload = {
      title: quizTitle,
      grade,
      subject,
      examType,
      author,
      collaborators,
      matrixDuration,
      fullDuration,
      examStructure: structure,
      passages,
      questions,
    };
    return JSON.stringify(payload, null, 2);
  };

  useEffect(() => {
    setJsonText(generateCurrentJson());
    setSyntaxError(null);
  }, []);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setSyntaxError(null);
      onToast('Đã định dạng mã JSON chuẩn.');
    } catch (e: any) {
      setSyntaxError(e.message);
      onToast('Lỗi cú pháp JSON: ' + e.message, true);
    }
  };

  const handleResetFromVisual = () => {
    setJsonText(generateCurrentJson());
    setSyntaxError(null);
    onToast('Đã đồng bộ lại mã JSON từ giao diện soạn thảo.');
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setSyntaxError(null);

      // Support either full payload or questions array directly
      let qs: Question[] = [];
      if (Array.isArray(parsed)) {
        qs = parsed;
      } else if (Array.isArray(parsed.questions)) {
        qs = parsed.questions;
      } else {
        throw new Error('Dữ liệu JSON phải chứa danh sách câu hỏi (mảng "questions").');
      }

      onApplyJson({
        quizTitle: parsed.title,
        grade: parsed.grade || parsed.class,
        subject: parsed.subject,
        examType: parsed.examType,
        author: parsed.author,
        collaborators: parsed.collaborators,
        matrixDuration: parsed.matrixDuration,
        fullDuration: parsed.fullDuration,
        structure: parsed.examStructure || parsed.structure,
        passages: parsed.passages,
        questions: qs,
      });

      onToast(`Đã áp dụng thành công ${qs.length} câu hỏi vào đề thi!`);
    } catch (e: any) {
      setSyntaxError(e.message);
      onToast('Lỗi áp dụng JSON: ' + e.message, true);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonText).then(() => {
        onToast('Đã sao chép toàn bộ mã JSON vào bộ nhớ tạm.');
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonText(JSON.stringify(parsed, null, 2));
        setSyntaxError(null);
        onToast(`Đã nạp file "${file.name}" vào trình soạn JSON.`);
      } catch (err: any) {
        setSyntaxError(err.message);
        onToast('Tệp không đúng định dạng JSON: ' + err.message, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs">Trình Viết Mã JSON Đề Thi</h3>
            <p className="text-[10px] text-slate-400">Tạo hoặc sửa đề trực tiếp bằng mã JSON</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload file button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Tải tệp JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleFormat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            title="Định dạng lại cấu trúc JSON"
          >
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={handleResetFromVisual}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            title="Đồng bộ lại từ form giao diện"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Áp dụng vào đề</span>
          </button>
        </div>
      </div>

      {/* Syntax error alert */}
      {syntaxError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Lỗi cú pháp JSON:</span>
            <span className="font-mono text-[11px]">{syntaxError}</span>
          </div>
        </div>
      )}

      {/* Code Textarea */}
      <div className="relative">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setSyntaxError(null);
          }}
          rows={22}
          spellCheck={false}
          className="w-full font-mono text-[11px] leading-relaxed p-4 bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="Dán hoặc viết mã JSON đề thi tại đây..."
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>Gợi ý: Mã JSON có thể bao gồm toàn bộ đề thi hoặc chỉ mảng "questions".</span>
        <button
          type="button"
          onClick={handleApply}
          className="text-emerald-700 hover:underline font-bold"
        >
          Nhấn "Áp dụng vào đề" để cập nhật trực tiếp sang cột xem trước →
        </button>
      </div>
    </div>
  );
};
