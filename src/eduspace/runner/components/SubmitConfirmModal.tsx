import React from 'react';
import { AlertCircle, CheckCircle2, Layers, Send, X } from 'lucide-react';
import type { ChoiceGroup } from '../types.ts';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  choiceGroups?: ChoiceGroup[];
  selectedChoiceQuestionIds?: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  choiceGroups = [],
  selectedChoiceQuestionIds = [],
  isSubmitting,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  // Evaluate Choice Groups completion
  const choiceGroupIssues: string[] = [];
  const choiceGroupOk: string[] = [];

  for (const cg of choiceGroups) {
    const selectedInGroup = (cg.questionIds || []).filter(qid => selectedChoiceQuestionIds.includes(qid)).length;
    if (selectedInGroup < cg.requiredCount) {
      choiceGroupIssues.push(`${cg.title}: Mới chọn ${selectedInGroup}/${cg.requiredCount} câu (cần chọn thêm ${cg.requiredCount - selectedInGroup} câu).`);
    } else if (selectedInGroup > cg.requiredCount) {
      choiceGroupIssues.push(`${cg.title}: Đã chọn ${selectedInGroup}/${cg.requiredCount} câu (vượt quá ${selectedInGroup - cg.requiredCount} câu).`);
    } else {
      choiceGroupOk.push(`${cg.title}: Đã chọn đủ ${selectedInGroup}/${cg.requiredCount} câu.`);
    }
  }

  const hasChoiceGroupWarnings = choiceGroupIssues.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              (hasUnanswered || hasChoiceGroupWarnings) ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {(hasUnanswered || hasChoiceGroupWarnings) ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-slate-800">Xác nhận nộp bài thi</h3>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-600 leading-normal">
            Bạn đã hoàn thành <span className="font-bold text-indigo-600">{answeredCount}</span> trên tổng số <span className="font-bold text-slate-800">{totalQuestions}</span> câu hỏi.
          </p>

          {/* Choice Group Status */}
          {choiceGroups.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Kiểm tra phần tự chọn:</span>
              </div>
              {choiceGroupIssues.map((issue, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{issue}</span>
                </div>
              ))}
              {choiceGroupOk.map((okMsg, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{okMsg}</span>
                </div>
              ))}
            </div>
          )}

          {hasUnanswered ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Còn <span className="font-bold">{unansweredCount}</span> câu chưa được trả lời. Sau khi nộp, bạn sẽ không thể thay đổi đáp án nữa.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Bạn đã trả lời đầy đủ tất cả câu hỏi!</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Tiếp tục làm bài
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs md:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
