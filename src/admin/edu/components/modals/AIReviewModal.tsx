import React, { useState } from 'react';
import { ShieldCheck, Copy, ExternalLink, BarChart3, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  buildAuditExamPrompt,
  copyTextToClipboard,
  extractJsonFromText,
  openGeminiNotebook,
} from '../../services/aiService';
import type { Question, ExamAuditFeedback } from '../../types';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onToast: (msg: string, isError?: boolean) => void;
}

export const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  onToast,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [auditReport, setAuditReport] = useState<ExamAuditFeedback | null>(null);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    if (questions.length === 0) {
      onToast('Đề thi chưa có câu hỏi nào để thẩm định.', true);
      return;
    }

    const promptText = buildAuditExamPrompt(questions);
    const success = await copyTextToClipboard(promptText);
    if (success) {
      onToast('Đã sao chép Prompt thẩm định cho Gemini! Hãy mở Gemini để dán.');
    } else {
      onToast('Không thể sao chép tự động.', true);
    }
  };

  const handleImportReport = () => {
    if (!jsonInput.trim()) {
      onToast('Vui lòng dán kết quả JSON thẩm định từ Gemini.', true);
      return;
    }

    try {
      const data = extractJsonFromText<ExamAuditFeedback>(jsonInput);
      if (!data || typeof data !== 'object') {
        onToast('Định dạng JSON thẩm định không hợp lệ.', true);
        return;
      }
      setAuditReport(data);
      onToast('Đã hiển thị báo cáo thẩm định đề thi thành công.');
    } catch (err: any) {
      onToast('Lỗi đọc JSON báo cáo: ' + (err?.message || err), true);
    }
  };

  const score = auditReport?.score ?? 85;
  const scoreColor =
    score < 65
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : score < 80
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-slate-900">AI Thẩm định Đề thi (Gemini Notebook Bridge)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Đánh giá tính chính xác khoa học, chuẩn LaTeX, barem điểm và ma trận nhận thức GDPT 2018.
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
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
            <div className="font-extrabold text-xs text-indigo-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Đề thi hiện tại: <span className="font-black text-indigo-700">{questions.length}</span> câu hỏi
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Nhấn <b>Sao chép Prompt Thẩm định</b> để tạo prompt kèm toàn bộ câu hỏi hiện có, sau đó gửi sang Gemini để AI kiểm tra chi tiết.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép Prompt Thẩm định</span>
              </button>
              <button
                type="button"
                onClick={openGeminiNotebook}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
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
              Dán kết quả JSON thẩm định từ Gemini vào đây
            </div>
            <textarea
              rows={4}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Dán kết quả JSON báo cáo thẩm định từ Gemini vào đây..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImportReport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Hiển thị Báo cáo Thẩm định</span>
              </button>
            </div>
          </div>

          {/* Report Display */}
          {auditReport && (
            <div className="space-y-4 pt-2">
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${scoreColor}`}>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider opacity-80">
                    Điểm chất lượng đề thi
                  </div>
                  <div className="text-4xl font-black font-mono mt-0.5">{score}/100</div>
                </div>
                <div className="text-right text-xs font-bold space-y-1">
                  <div>Nhận biết: {auditReport.levels?.['Nhận biết'] || 0} câu</div>
                  <div>Thông hiểu: {auditReport.levels?.['Thông hiểu'] || 0} câu</div>
                  <div>Vận dụng: {auditReport.levels?.['Vận dụng'] || 0} câu</div>
                  <div>Vận dụng cao: {auditReport.levels?.['Vận dụng cao'] || 0} câu</div>
                </div>
              </div>

              {auditReport.remarks && (
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Nhận xét tổng thể:
                  </h4>
                  <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {auditReport.remarks}
                  </p>
                </div>
              )}

              {auditReport.feedback && auditReport.feedback.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Góp ý chi tiết từng câu:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
                    {auditReport.feedback.map((item, idx) => {
                      const isWarning =
                        item.includes('[Cần sửa]') ||
                        item.toLowerCase().includes('sai') ||
                        item.toLowerCase().includes('lỗi');
                      return (
                        <li
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isWarning
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          {isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
