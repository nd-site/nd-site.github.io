import React from 'react';
import { Bookmark } from 'lucide-react';
import type { SanitizedQuestion } from '../types.ts';

interface QuestionMapProps {
  questions: SanitizedQuestion[];
  currentIndex: number;
  answers: Record<string, any>;
  flaggedIds: Set<string>;
  selectedChoiceQuestionIds?: string[];
  onSelectIndex: (index: number) => void;
}

export const QuestionMap: React.FC<QuestionMapProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedIds,
  selectedChoiceQuestionIds,
  onSelectIndex
}) => {
  function isAnswered(q: SanitizedQuestion): boolean {
    const ans = answers[q.questionId];
    if (ans === undefined || ans === null) return false;
    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      return !!ans.selectedOptionId || (Array.isArray(ans.selectedOptionIds) && ans.selectedOptionIds.length > 0);
    }
    if (q.type === 'true_false') {
      const map = ans.answers || ans;
      return typeof map === 'object' && Object.keys(map).length > 0;
    }
    if (q.type === 'numeric' || q.type === 'short_answer') {
      const val = typeof ans === 'object' ? (ans.value ?? ans.text) : ans;
      return val !== undefined && val !== null && String(val).trim().length > 0;
    }
    if (q.type === 'essay') {
      const text = typeof ans === 'object' ? ans.text : ans;
      return typeof text === 'string' && text.trim().length > 0;
    }
    if (q.type === 'multi_part' || (Array.isArray(q.parts) && q.parts.length > 0)) {
      return typeof ans === 'object' && Object.keys(ans).length > 0;
    }
    return false;
  }

  const answeredCount = questions.filter(isAnswered).length;
  const flaggedCount = flaggedIds.size;

  return (
    <aside className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Danh sách câu hỏi</h2>
        <span className="text-xs text-slate-500 font-medium">{questions.length} câu</span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Đã làm ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>
          <span>Chưa làm ({questions.length - answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
          <span>Đã lưu ý ({flaggedCount})</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const answered = isAnswered(q);
          const isCurrent = idx === currentIndex;
          const isFlagged = flaggedIds.has(q.questionId);
          const isChoice = !!q.choiceGroupId;
          const isChoiceUnselected = isChoice && selectedChoiceQuestionIds && !selectedChoiceQuestionIds.includes(q.questionId);

          return (
            <button
              key={q.questionId}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition active:scale-95 ${
                isCurrent
                  ? 'ring-2 ring-indigo-600 ring-offset-2 z-10'
                  : ''
              } ${
                answered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : (isChoiceUnselected
                      ? 'bg-slate-50/50 text-slate-400 border border-dashed border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100')
              }`}
              title={isChoice ? (isChoiceUnselected ? 'Câu tự chọn (chưa chọn)' : 'Câu tự chọn (đã chọn)') : undefined}
            >
              <span>{idx + 1}</span>
              {isChoice && (
                <span className="absolute -bottom-1 -right-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded-sm border border-amber-200">
                  TC
                </span>
              )}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full shadow-xs">
                  <Bookmark className="w-3 h-3 fill-amber-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
