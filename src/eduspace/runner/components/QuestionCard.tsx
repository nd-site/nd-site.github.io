import React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Music, Image as ImageIcon } from 'lucide-react';
import type { ChoiceGroup, ContentBlock, SanitizedMultiPartQuestionPart, SanitizedQuestion } from '../types.ts';
import { ChoiceGroupBanner } from './ChoiceGroupBanner.tsx';

interface QuestionCardProps {
  question: SanitizedQuestion;
  index: number;
  total: number;
  currentAnswer: any;
  isFlagged: boolean;
  choiceGroup?: ChoiceGroup | null;
  isChoiceSelected?: boolean;
  selectedCountInChoiceGroup?: number;
  onToggleChoiceSelect?: () => void;
  onAnswerChange: (newAnswerPayload: any) => void;
  onToggleFlag: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  currentAnswer,
  isFlagged,
  choiceGroup,
  isChoiceSelected = true,
  selectedCountInChoiceGroup = 0,
  onToggleChoiceSelect,
  onAnswerChange,
  onToggleFlag,
  onPrev,
  onNext
}) => {
  const qType = question.type;
  const promptText = question.prompt || question.content?.prompt || '';
  const payload = {
    ...((question as any).content?.payload || {}),
    ...question
  };
  const options = (question as any).options || question.content?.payload?.options || [];
  const items = (question as any).items || question.content?.payload?.items || [];

  // Single choice response handler
  function handleSelectOption(optionId: string) {
    onAnswerChange({ selectedOptionId: optionId });
  }

  // True/False response handler (GDPT 2018 4-item)
  function handleToggleTrueFalse(itemId: string, val: boolean) {
    const prevMap = (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.answers)
      ? { ...currentAnswer.answers }
      : (typeof currentAnswer === 'object' && currentAnswer !== null ? { ...currentAnswer } : {});
    prevMap[itemId] = val;
    onAnswerChange({ answers: prevMap });
  }

  // Numeric response handler
  function handleNumericChange(rawVal: string) {
    onAnswerChange({ value: rawVal });
  }

  // Short answer handler
  function handleShortAnswerChange(rawVal: string) {
    onAnswerChange({ text: rawVal });
  }

  // Essay handler
  function handleEssayChange(rawVal: string) {
    onAnswerChange({ text: rawVal });
  }

  // Multi-part sub-question response handler
  function handlePartAnswerChange(partId: string, partValue: any) {
    const prev = (currentAnswer && typeof currentAnswer === 'object') ? { ...currentAnswer } : {};
    prev[partId] = partValue;
    onAnswerChange(prev);
  }

  // Render a list of ContentBlocks
  function renderContentBlocks(blocks?: ContentBlock[]) {
    if (!blocks || blocks.length === 0) return null;

    return (
      <div className="space-y-3 my-4">
        {blocks.map((block) => (
          <div key={block.id} className="text-sm">
            {(block.type === 'text' || block.type === 'markdown') && (
              <div className="leading-relaxed whitespace-pre-wrap font-serif text-[15px] text-slate-800">
                {block.content}
              </div>
            )}

            {block.type === 'image' && block.url && (
              <div className="flex flex-col items-center gap-1.5 my-3">
                <img
                  src={block.url}
                  alt={block.altText || block.caption || 'Hình ảnh câu hỏi'}
                  className="max-h-72 rounded-xl border border-slate-200 object-contain shadow-xs"
                />
                {block.caption && (
                  <span className="text-xs text-slate-500 italic">{block.caption}</span>
                )}
              </div>
            )}

            {block.type === 'audio' && block.url && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Music className="w-4 h-4 text-indigo-600" />
                  <span>File âm thanh đính kèm câu hỏi</span>
                </div>
                <audio controls className="w-full h-10" preload="metadata">
                  <source src={block.url} />
                </audio>
              </div>
            )}

            {block.type === 'formula' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-center text-indigo-900 text-sm overflow-x-auto">
                {block.content}
              </div>
            )}

            {(block.type === 'quote' || block.type === 'document' || block.type === 'source') && (
              <blockquote className="border-l-4 border-indigo-500 pl-4 py-1.5 bg-indigo-50/40 rounded-r-lg italic text-slate-700 text-sm font-serif">
                <p className="whitespace-pre-wrap">{block.content}</p>
                {block.caption && (
                  <footer className="text-xs text-indigo-800/80 font-sans not-italic mt-1 font-medium">
                    — {block.caption}
                  </footer>
                )}
              </blockquote>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-xl p-5 md:p-7 shadow-xs transition ${
      choiceGroup && !isChoiceSelected ? 'border-slate-300 opacity-80' : 'border-slate-200'
    }`}>
      {/* Optional Choice Group Banner */}
      {choiceGroup && onToggleChoiceSelect && (
        <ChoiceGroupBanner
          choiceGroup={choiceGroup}
          isSelected={isChoiceSelected}
          selectedCountInGroup={selectedCountInChoiceGroup}
          onToggleSelect={onToggleChoiceSelect}
        />
      )}

      {/* Header: Question Number, Points, Flag Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs md:text-sm rounded-lg border border-indigo-100">
            Câu {index + 1}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ({question.allocatedPoints} điểm)
          </span>
          {choiceGroup && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Tự chọn
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            isFlagged
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-500 hover:bg-slate-100 border border-transparent'
          }`}
          title="Đánh dấu câu hỏi để xem lại sau"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{isFlagged ? 'Đã lưu ý' : 'Lưu ý'}</span>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="text-slate-900 text-sm md:text-base font-normal leading-relaxed whitespace-pre-wrap mb-4">
        {promptText}
      </div>

      {/* Universal Content Blocks */}
      {renderContentBlocks(question.blocks)}

      {/* Options / Input Body based on Question Type */}
      <div className="mb-8">
        {/* 1. Single Choice */}
        {qType === 'single_choice' && (
          <div className="space-y-3">
            {options.map((opt: any, optIdx: number) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = currentAnswer?.selectedOptionId === opt.id;

              return (
                <label
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="text-sm text-slate-800 leading-normal pt-0.5">
                    {opt.text}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* 2. Multiple Choice */}
        {qType === 'multiple_choice' && (
          <div className="space-y-3">
            {options.map((opt: any, optIdx: number) => {
              const letter = String.fromCharCode(65 + optIdx);
              const currentArr: string[] = Array.isArray(currentAnswer?.selectedOptionIds)
                ? currentAnswer.selectedOptionIds
                : [];
              const isSelected = currentArr.includes(opt.id);

              return (
                <label
                  key={opt.id}
                  onClick={() => {
                    const next = isSelected
                      ? currentArr.filter(id => id !== opt.id)
                      : [...currentArr, opt.id];
                    onAnswerChange({ selectedOptionIds: next });
                  }}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="text-sm text-slate-800 leading-normal pt-0.5">
                    {opt.text}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* 3. True / False (GDPT 2018 4-item) */}
        {qType === 'true_false' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {items.map((item: any, itemIdx: number) => {
              const letter = String.fromCharCode(97 + itemIdx); // a, b, c, d
              const map = currentAnswer?.answers || currentAnswer || {};
              const currentVal = map[item.id];

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <span className="text-sm text-slate-800 leading-normal">
                      {item.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTrueFalse(item.id, true)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        currentVal === true
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTrueFalse(item.id, false)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        currentVal === false
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Sai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Numeric */}
        {qType === 'numeric' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Nhập kết quả số:
            </label>
            <input
              type="text"
              value={currentAnswer?.value ?? ''}
              onChange={(e) => handleNumericChange(e.target.value)}
              placeholder="Ví dụ: 8 hoặc 3.14"
              className="w-full sm:w-64 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>
        )}

        {/* 5. Short Answer */}
        {qType === 'short_answer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Nhập câu trả lời ngắn:
            </label>
            <input
              type="text"
              value={currentAnswer?.text ?? ''}
              onChange={(e) => handleShortAnswerChange(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* 6. Essay */}
        {qType === 'essay' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Bài làm tự luận:
            </label>
            <textarea
              rows={6}
              value={currentAnswer?.text ?? ''}
              onChange={(e) => handleEssayChange(e.target.value)}
              placeholder="Trình bày chi tiết lời giải..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>
        )}

        {/* 7. Multi-Part Questions (1a, 1b...) */}
        {(qType === 'multi_part' || (Array.isArray(question.parts) && question.parts.length > 0)) && (
          <div className="space-y-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Các câu hỏi thành phần:
            </h4>
            {question.parts?.map((part: SanitizedMultiPartQuestionPart, partIdx: number) => {
              const partAns = currentAnswer?.[part.partId];

              return (
                <div key={part.partId} className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-indigo-700">
                      {part.label || `Ý ${partIdx + 1}`}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({part.allocatedPoints} điểm)
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 mb-3 whitespace-pre-wrap">
                    {part.prompt}
                  </p>

                  {renderContentBlocks(part.blocks)}

                  {/* Sub-question Input */}
                  {part.type === 'single_choice' && part.contentPayload?.options && (
                    <div className="space-y-2 mt-2">
                      {part.contentPayload.options.map((opt: any, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = partAns === opt.id || partAns?.selectedOptionId === opt.id;

                        return (
                          <label
                            key={opt.id}
                            onClick={() => handlePartAnswerChange(part.partId, { selectedOptionId: opt.id })}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 font-semibold'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-bold text-slate-600">{letter}.</span>
                            <span>{opt.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {(part.type === 'short_answer' || part.type === 'numeric') && (
                    <input
                      type="text"
                      value={typeof partAns === 'object' ? (partAns?.text ?? partAns?.value ?? '') : (partAns ?? '')}
                      onChange={(e) => handlePartAnswerChange(part.partId, { text: e.target.value, value: e.target.value })}
                      placeholder="Nhập câu trả lời..."
                      className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  )}

                  {part.type === 'essay' && (
                    <textarea
                      rows={4}
                      value={typeof partAns === 'object' ? (partAns?.text ?? '') : (partAns ?? '')}
                      onChange={(e) => handlePartAnswerChange(part.partId, { text: e.target.value })}
                      placeholder="Trình bày lời giải cho ý này..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation: Previous & Next */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={index === 0}
          onClick={onPrev}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
            index === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          {index + 1} / {total}
        </span>

        <button
          type="button"
          disabled={index === total - 1}
          onClick={onNext}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
            index === total - 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-white bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <span>Câu tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
