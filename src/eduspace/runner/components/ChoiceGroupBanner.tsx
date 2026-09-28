import React from 'react';
import { CheckCircle2, Circle, HelpCircle, Layers } from 'lucide-react';
import type { ChoiceGroup } from '../types.ts';

interface ChoiceGroupBannerProps {
  choiceGroup: ChoiceGroup;
  isSelected: boolean;
  selectedCountInGroup: number;
  onToggleSelect: () => void;
}

export const ChoiceGroupBanner: React.FC<ChoiceGroupBannerProps> = ({
  choiceGroup,
  isSelected,
  selectedCountInGroup,
  onToggleSelect
}) => {
  if (!choiceGroup) return null;

  const isComplete = selectedCountInGroup === choiceGroup.requiredCount;
  const isOver = selectedCountInGroup > choiceGroup.requiredCount;

  return (
    <div className={`p-4 rounded-xl border mb-5 transition select-none ${
      isSelected
        ? 'bg-indigo-50/70 border-indigo-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                {choiceGroup.title || 'Phần câu hỏi tự chọn'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-700'
                  : (isOver ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')
              }`}>
                Đã chọn: {selectedCountInGroup}/{choiceGroup.requiredCount} câu
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {choiceGroup.description || `Học sinh chọn đúng ${choiceGroup.requiredCount} trong ${choiceGroup.totalCount} câu để tính điểm.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSelect}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            isSelected
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Đã chọn câu này</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 text-slate-400" />
              <span>Chọn câu này</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
