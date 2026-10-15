import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Volume2,
  Film,
  Table as TableIcon,
  Shuffle,
  Check,
  ListChecks,
} from 'lucide-react';
import { TableModal } from './TableModal';
import { LatexRenderer } from '../LatexRenderer';
import type { PassageContext, Question } from '../../types';

interface PassageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  passages: PassageContext[];
  questions?: Question[];
  onSavePassages: (passages: PassageContext[], updatedQuestions?: Question[]) => void;
}

export const PassageManagerModal: React.FC<PassageManagerModalProps> = ({
  isOpen,
  onClose,
  passages,
  questions = [],
  onSavePassages,
}) => {
  const [list, setList] = useState<PassageContext[]>(passages);
  const [questionsState, setQuestionsState] = useState<Question[]>(questions);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    setList(passages);
    setQuestionsState(questions);
  }, [passages, questions, isOpen]);

  if (!isOpen) return null;

  const currentPassage = list[activeIdx] || null;

  const handleAddPassage = () => {
    const newId = `p_${Date.now().toString(36)}`;
    const newP: PassageContext = {
      id: newId,
      title: `Ngữ liệu ${list.length + 1}`,
      content: 'Nhập nội dung bài đọc, tài liệu hoặc bối cảnh tình huống tại đây...',
      shuffleQuestions: true,
    };
    setList((prev) => [...prev, newP]);
    setActiveIdx(list.length);
  };

  const handleRemovePassage = (idx: number) => {
    const deletedId = list[idx]?.id;
    const next = list.filter((_, i) => i !== idx);
    setList(next);
    if (deletedId) {
      setQuestionsState((prev) =>
        prev.map((q) => (q.passageId === deletedId ? { ...q, passageId: undefined } : q))
      );
    }
    if (activeIdx >= next.length) {
      setActiveIdx(Math.max(0, next.length - 1));
    }
  };

  const handleUpdateCurrent = (field: keyof PassageContext, val: any) => {
    if (!currentPassage) return;
    setList((prev) => {
      const next = [...prev];
      next[activeIdx] = { ...next[activeIdx], [field]: val };
      return next;
    });
  };

  const handleSave = () => {
    onSavePassages(list, questionsState);
    onClose();
  };

  const handleInsertTable = (md: string) => {
    if (!currentPassage) return;
    const currentContent = currentPassage.content || '';
    handleUpdateCurrent('content', currentContent + '\n' + md);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Quản Lý Ngữ Liệu Chung (Passages)</h3>
              <p className="text-[11px] text-slate-500">
                Tạo bài đọc hiểu, tình huống dùng chung cho nhiều câu hỏi (hiển thị trên cùng một trang)
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

        {/* Content Body: Left sidebar (list) + Right editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 flex flex-col justify-between">
            <div className="space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 px-1 mb-2">
                <span>Danh sách ngữ liệu ({list.length})</span>
              </div>

              {list.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeIdx === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span className="truncate pr-2">{p.title || `Ngữ liệu ${idx + 1}`}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePassage(idx);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      activeIdx === idx ? 'hover:bg-indigo-700 text-white' : 'hover:bg-rose-50 text-rose-500'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {list.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có ngữ liệu nào.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddPassage}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs rounded-2xl border border-indigo-200 transition-all cursor-pointer shadow-sm mt-3"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ngữ liệu mới</span>
            </button>
          </div>

          {/* Passage Form Editor */}
          {currentPassage ? (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Tiêu đề ngữ liệu
                  </label>
                  <input
                    type="text"
                    value={currentPassage.title || ''}
                    onChange={(e) => handleUpdateCurrent('title', e.target.value)}
                    placeholder="VD: Đọc văn bản sau và trả lời các câu hỏi từ 1 đến 5:"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Đảo thứ tự câu hỏi trong ngữ liệu
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(currentPassage.shuffleQuestions)}
                      onChange={(e) => handleUpdateCurrent('shuffleQuestions', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="flex items-center gap-1.5">
                      <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Đảo ngẫu nhiên câu hỏi con thuộc ngữ liệu</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Toolbar for content insertion */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-700">
                    Nội dung văn bản / tài liệu ngữ liệu
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTableModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-all"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chèn bảng biểu</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={currentPassage.content}
                  onChange={(e) => handleUpdateCurrent('content', e.target.value)}
                  placeholder="Dán hoặc gõ nội dung văn bản đọc hiểu, bảng biểu, công thức KaTeX ($...$)..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Media attachments */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-extrabold text-slate-800 block">
                  Đa phương tiện đính kèm cho ngữ liệu
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Image */}
                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Link hình ảnh</span>
                    </label>
                    <input
                      type="text"
                      value={currentPassage.imageUrl || ''}
                      onChange={(e) => handleUpdateCurrent('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Audio */}
                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link âm thanh (Audio)</span>
                    </label>
                    <input
                      type="text"
                      value={currentPassage.audioUrl || ''}
                      onChange={(e) => handleUpdateCurrent('audioUrl', e.target.value)}
                      placeholder="https://...mp3"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold">Giới hạn lần nghe:</span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={currentPassage.maxAudioPlays ?? 0}
                        onChange={(e) =>
                          handleUpdateCurrent('maxAudioPlays', parseInt(e.target.value) || 0)
                        }
                        placeholder="0 = Không giới hạn"
                        className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Video */}
                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                      <Film className="w-3.5 h-3.5 text-purple-600" />
                      <span>Link video (YouTube / MP4)</span>
                    </label>
                    <input
                      type="text"
                      value={currentPassage.videoUrl || ''}
                      onChange={(e) => handleUpdateCurrent('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Question Assignment for this Passage */}
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-indigo-600" />
                      <span>Chọn các câu hỏi dùng chung ngữ liệu này</span>
                    </span>
                    <p className="text-[11px] text-indigo-700">
                      Chỉ những câu được tích chọn mới hiển thị cùng ngữ liệu này (dưới dạng 1 trang duy nhất). Các câu khác là câu độc lập.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionsState((prev) =>
                          prev.map((q) => ({ ...q, passageId: currentPassage.id }))
                        );
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-200 cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionsState((prev) =>
                          prev.map((q) =>
                            q.passageId === currentPassage.id
                              ? { ...q, passageId: undefined }
                              : q
                          )
                        );
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-lg border border-slate-200 cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {questionsState.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">
                    Chưa có câu hỏi nào trong đề thi để gán.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {questionsState.map((q, qIdx) => {
                      const isAssignedToThis = q.passageId === currentPassage.id;
                      const isAssignedToOther = q.passageId && q.passageId !== currentPassage.id;
                      const otherPassage = isAssignedToOther
                        ? list.find((p) => p.id === q.passageId)
                        : null;

                      return (
                        <label
                          key={qIdx}
                          className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isAssignedToThis
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                              : isAssignedToOther
                              ? 'bg-slate-100/70 text-slate-400 border-slate-200 opacity-60'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssignedToThis}
                            disabled={Boolean(isAssignedToOther)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setQuestionsState((prev) => {
                                const next = [...prev];
                                next[qIdx] = {
                                  ...next[qIdx],
                                  passageId: checked ? currentPassage.id : undefined,
                                };
                                return next;
                              });
                            }}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block font-black text-[11px]">Câu {qIdx + 1}</span>
                            <span className="block truncate text-[10px] opacity-90">
                              {q.question || `(Câu hỏi ${qIdx + 1})`}
                            </span>
                            {isAssignedToOther && (
                              <span className="text-[9px] italic block">
                                (Đang gán cho {otherPassage?.title || 'ngữ liệu khác'})
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live KaTeX & Table Preview of the passage */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Xem trước ngữ liệu
                </span>
                <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm text-xs text-slate-800 leading-relaxed">
                  <LatexRenderer text={currentPassage.content} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Chọn hoặc thêm một ngữ liệu bên trái để chỉnh sửa.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lưu danh sách ngữ liệu</span>
          </button>
        </div>
      </div>

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsertTable={handleInsertTable}
      />
    </div>
  );
};
