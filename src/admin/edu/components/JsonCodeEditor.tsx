import React, { useState, useEffect } from 'react';
import { Code, Check, RefreshCw, Copy, Upload, AlertCircle, Sparkles, ExternalLink, X } from 'lucide-react';
import {
  robustJsonParse,
  cleanJsonString,
  buildGenerateExamPrompt,
  copyTextToClipboard,
  openGeminiNotebook,
} from '../services/aiService';
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
  structPoints?: any;
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
  structPoints,
  passages,
  questions,
  onApplyJson,
  onToast,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [isAiPromptModalOpen, setIsAiPromptModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

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
      const parsed = robustJsonParse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setSyntaxError(null);
      onToast('Đã làm sạch cú pháp và định dạng mã JSON chuẩn.');
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
      const parsed = robustJsonParse(jsonText);
      setSyntaxError(null);

      // Định dạng lại nội dung khung soạn thảo JSON cho chuẩn đẹp
      try {
        setJsonText(JSON.stringify(parsed, null, 2));
      } catch (_) {}

      // Hỗ trợ trích xuất câu hỏi từ nhiều định dạng cấu trúc JSON
      let qs: Question[] = [];
      let rawPassages: PassageContext[] = [];

      if (Array.isArray(parsed)) {
        qs = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.questions)) {
          qs = parsed.questions;
        } else if (parsed.exam && Array.isArray(parsed.exam.questions)) {
          qs = parsed.exam.questions;
        } else if (parsed.quiz && Array.isArray(parsed.quiz.questions)) {
          qs = parsed.quiz.questions;
        } else if (parsed.quizData && Array.isArray(parsed.quizData.questions)) {
          qs = parsed.quizData.questions;
        } else if (parsed.data && Array.isArray(parsed.data.questions)) {
          qs = parsed.data.questions;
        } else if (Array.isArray(parsed.data)) {
          qs = parsed.data;
        } else if (Array.isArray(parsed.exam)) {
          qs = parsed.exam;
        } else if (parsed.dethi && Array.isArray(parsed.dethi.questions)) {
          qs = parsed.dethi.questions;
        } else if (Array.isArray(parsed.dethi)) {
          qs = parsed.dethi;
        } else if (Array.isArray(parsed.cauhoi)) {
          qs = parsed.cauhoi;
        } else {
          throw new Error('Dữ liệu JSON phải chứa danh sách câu hỏi (mảng "questions").');
        }

        if (Array.isArray(parsed.passages)) {
          rawPassages = parsed.passages;
        } else if (parsed.passage && typeof parsed.passage === 'object') {
          rawPassages = [
            {
              id: parsed.passage.id || `p_${Date.now().toString(36)}`,
              title: parsed.passage.title || 'Ngữ liệu đọc hiểu',
              content: parsed.passage.content || '',
              shuffleQuestions: true,
            },
          ];
        }
      } else {
        throw new Error('Dữ liệu JSON không hợp lệ.');
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
        passages: rawPassages.length > 0 ? rawPassages : parsed.passages,
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
        const parsed = robustJsonParse(content);
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

  const handleGeneratePromptAndOpenGemini = async () => {
    if (!aiTopic.trim()) {
      onToast('Vui lòng nhập chi tiết yêu cầu đề thi.', true);
      return;
    }

    const promptText = buildGenerateExamPrompt({
      topic: aiTopic,
      title: quizTitle,
      subject,
      grade,
      duration: matrixDuration,
      examType,
      structureCounts: structure?.counts,
      structPoints,
    });

    const success = await copyTextToClipboard(promptText);
    if (success) {
      onToast('Đã sao chép Prompt cho Gemini! Hãy dán vào Gemini.');
      openGeminiNotebook();
      setIsAiPromptModalOpen(false);
    } else {
      onToast('Không thể tự động sao chép. Vui lòng thử lại.', true);
    }
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

          {/* Quick AI Prompt button */}
          <button
            type="button"
            onClick={() => setIsAiPromptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-all cursor-pointer"
            title="Tạo Prompt AI cho Gemini từ thông tin và ma trận đề này"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Tạo Prompt AI từ đề này</span>
          </button>

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

      {/* Quick AI Prompt Modal inside JsonCodeEditor */}
      {isAiPromptModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-600 font-black text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Tạo Prompt AI Từ Đề &amp; Ma Trận Này</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiPromptModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exam info badge */}
            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap font-bold text-slate-800">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg">{subject || 'Toán học'}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg">Khối {grade || '12'}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">{matrixDuration || 90} phút</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg">{examType || 'GDPT 2018'}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                <b>Đề:</b> {quizTitle || 'Chưa đặt tên'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chi tiết nội dung đề muốn tạo <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Kiểm tra 1 tiết chương 1 Đạo hàm và ứng dụng khảo sát hàm số, bám sát sách Cánh Diều, có 2 bài toán tối ưu thực tế..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              💡 <b>Quy trình một chạm:</b> Nhấn <b>Sao chép &amp; Mở Gemini</b> → Dán prompt vào Gemini → Sao chép JSON từ Gemini → Dán thẳng vào ô soạn thảo JSON này và nhấn <b>Áp dụng vào đề</b>. Hệ thống tự động làm sạch markdown và lỗi cú pháp.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAiPromptModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGeneratePromptAndOpenGemini}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sao chép &amp; Mở Gemini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
