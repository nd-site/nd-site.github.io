import React, { useState, useEffect } from 'react';
import { Database, X, Search, Plus, Check, Filter } from 'lucide-react';
import { LatexRenderer } from '../LatexRenderer';
import { fetchQuestionBank } from '../../services/firebaseService';
import type { Question, QuestionBankItem } from '../../types';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: string;
  currentGrade?: string;
  onAddQuestionToExam: (q: Question) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  currentSubject = '',
  currentGrade = '',
  onAddQuestionToExam,
  onToast,
}) => {
  const [bankItems, setBankItems] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSubject, setFilterSubject] = useState(currentSubject);
  const [filterGrade, setFilterGrade] = useState(currentGrade);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadBank();
    }
  }, [isOpen, filterSubject, filterGrade]);

  const loadBank = async () => {
    setLoading(true);
    try {
      const items = await fetchQuestionBank(filterSubject || undefined, filterGrade || undefined);
      setBankItems(items);
    } catch (e: any) {
      onToast('Lỗi tải ngân hàng câu hỏi: ' + (e?.message || e), true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = bankItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const qLower = searchQuery.toLowerCase();
    return (
      item.question.question.toLowerCase().includes(qLower) ||
      (item.topic && item.topic.toLowerCase().includes(qLower))
    );
  });

  const handleAdd = (item: QuestionBankItem) => {
    onAddQuestionToExam(item.question);
    setAddedIds((prev) => new Set(prev).add(item.id));
    onToast('Đã thêm câu hỏi vào đề thi hiện tại.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Ngân Hàng Câu Hỏi Dùng Chung</h3>
              <p className="text-[11px] text-slate-500">
                Tìm kiếm và tái sử dụng các câu hỏi đã lưu theo môn học và khối lớp
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

        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi, chuyên đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Môn học..."
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Khối lớp..."
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold">
              Đang tải ngân hàng câu hỏi...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Database className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold">Chưa có câu hỏi nào trong ngân hàng.</p>
              <p className="text-[11px]">
                Bạn có thể lưu câu hỏi từ trình soạn thảo vào Ngân hàng để tái sử dụng sau.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isAdded = addedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {item.subject} • {item.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                        {item.question.type}
                      </span>
                      {item.topic && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Chuyên đề: {item.topic}
                        </span>
                      )}
                    </div>

                    <div className="font-medium text-slate-800 leading-relaxed">
                      <LatexRenderer text={item.question.question} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? 'Đã thêm' : 'Thêm vào đề'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Tìm thấy {filtered.length} câu hỏi phù hợp</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
