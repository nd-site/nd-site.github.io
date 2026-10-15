import React, { useState } from 'react';
import { Award, X, Plus, Trash2, Check } from 'lucide-react';
import type { RubricStep } from '../../types';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionIndex: number;
  initialRubric: RubricStep[];
  onSaveRubric: (qIdx: number, rubric: RubricStep[]) => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({
  isOpen,
  onClose,
  questionIndex,
  initialRubric,
  onSaveRubric,
}) => {
  const [steps, setSteps] = useState<RubricStep[]>(
    initialRubric && initialRubric.length > 0
      ? initialRubric
      : [
          { step: 1, description: 'Trình bày giả thiết và điều kiện xác định', points: 0.5 },
          { step: 2, description: 'Biến đổi và tính toán bước giải chính', points: 1.0 },
          { step: 3, description: 'Đối chiếu điều kiện và đưa ra kết luận', points: 0.5 },
        ]
  );

  if (!isOpen) return null;

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { step: prev.length + 1, description: `Bước ${prev.length + 1}...`, points: 0.5 },
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((s, i) => ({ ...s, step: i + 1 }));
    });
  };

  const handleUpdateStep = (idx: number, field: 'description' | 'points', val: any) => {
    setSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const totalPoints = steps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);

  const handleSave = () => {
    onSaveRubric(questionIndex, steps);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Tiêu Chí Chấm Tự Luận (Rubric) – Câu {questionIndex + 1}
              </h3>
              <p className="text-[11px] text-slate-500">
                Lập thang điểm chi tiết cho từng bước làm bài của học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-72">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3 text-xs"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {s.step}
              </span>
              <input
                type="text"
                value={s.description}
                onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                placeholder="Mô tả tiêu chí cần đạt..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  step={0.25}
                  min={0.1}
                  value={s.points}
                  onChange={(e) => handleUpdateStep(idx, 'points', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                />
                <span className="text-[11px] font-bold text-slate-500">đ</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddStep}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-emerald-700 font-bold text-xs rounded-xl border border-dashed border-emerald-300 transition-all cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm bước chấm điểm</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs font-black text-slate-800">
            Tổng điểm rubric: <span className="text-emerald-700 text-sm">{totalPoints} điểm</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu rubric</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
