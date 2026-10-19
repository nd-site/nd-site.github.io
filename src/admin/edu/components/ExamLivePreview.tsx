import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Eye,
  Shuffle,
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import { AudioPlayer } from './AudioPlayer';
import { VideoEmbed } from './VideoEmbed';
import type { Question, PassageContext, ExamStructure } from '../types';

interface ExamLivePreviewProps {
  title: string;
  grade: string;
  subject: string;
  examType?: string;
  author?: string;
  matrixDuration: number;
  fullDuration?: number;
  structure: ExamStructure;
  passages: PassageContext[];
  questions: Question[];
}

export const ExamLivePreview: React.FC<ExamLivePreviewProps> = ({
  title,
  grade,
  subject,
  examType,
  author,
  matrixDuration,
  fullDuration,
  structure,
  passages,
  questions,
}) => {
  // Test responses state inside preview so teacher can click & test
  const [selectedOptions, setSelectedOptions] = useState<Record<number, any>>({});

  // Group questions by passage
  const passageMap = new Map<string, Question[]>();
  const standaloneQuestions: Question[] = [];

  questions.forEach((q, idx) => {
    const qWithIdx = { ...q, _originalIdx: idx };
    if (q.passageId && passages.some((p) => p.id === q.passageId)) {
      const list = passageMap.get(q.passageId) || [];
      list.push(qWithIdx as any);
      passageMap.set(q.passageId, list);
    } else {
      standaloneQuestions.push(qWithIdx as any);
    }
  });

  // Group standalone questions by sections
  const multipleList = standaloneQuestions.filter((q) => q.type === 'multiple');
  const tfList = standaloneQuestions.filter((q) => q.type === 'truefalse');
  const shortList = standaloneQuestions.filter((q) => q.type === 'short');
  const matchingList = standaloneQuestions.filter((q) => q.type === 'matching');
  const clozeList = standaloneQuestions.filter((q) => q.type === 'cloze');
  const orderingList = standaloneQuestions.filter((q) => q.type === 'ordering');
  const essayList = standaloneQuestions.filter((q) => q.type === 'essay');

  const handleSelectOption = (qIdx: number, val: any) => {
    setSelectedOptions((prev) => ({ ...prev, [qIdx]: val }));
  };

  const renderQuestionItem = (q: any, displayNum: number) => {
    const qIdx = q._originalIdx;
    return (
      <div
        key={`q_${qIdx}_${displayNum}`}
        className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3 transition-all hover:border-blue-200"
      >
        {/* Question Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              Câu {displayNum}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
              {q.type === 'multiple'
                ? 'Trắc nghiệm 4 lựa chọn'
                : q.type === 'truefalse'
                ? 'Đúng / Sai'
                : q.type === 'short'
                ? 'Trả lời ngắn'
                : q.type === 'matching'
                ? 'Nối cặp'
                : q.type === 'cloze'
                ? 'Điền khuyết'
                : q.type === 'ordering'
                ? 'Sắp xếp'
                : q.type === 'multiselect'
                ? 'Nhiều đáp án'
                : q.type === 'grouping'
                ? 'Phân nhóm'
                : q.type === 'error_identification'
                ? 'Tìm lỗi sai'
                : 'Tự luận'}
            </span>
            {q.cognitiveLevel && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                q.cognitiveLevel === 'nhan_biet' ? 'bg-sky-100 text-sky-700' :
                q.cognitiveLevel === 'thong_hieu' ? 'bg-emerald-100 text-emerald-700' :
                q.cognitiveLevel === 'van_dung' ? 'bg-amber-100 text-amber-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {q.cognitiveLevel === 'nhan_biet' ? 'Nhận biết' :
                 q.cognitiveLevel === 'thong_hieu' ? 'Thông hiểu' :
                 q.cognitiveLevel === 'van_dung' ? 'Vận dụng' : 'Vận dụng cao'}
              </span>
            )}
            {q.points !== undefined && (
              <span className="text-[10px] font-bold text-slate-400">({q.points} điểm)</span>
            )}
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-slate-800 font-semibold text-xs leading-relaxed">
          <LatexRenderer text={q.question} />
        </div>

        {/* Image Attachment */}
        {q.imageUrl && (
          <div className="my-2 rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50 flex items-center justify-center">
            <img src={q.imageUrl} alt="Hình ảnh câu hỏi" className="max-h-72 object-contain" />
          </div>
        )}

        {/* Audio Attachment */}
        {q.audioUrl && (
          <div className="my-2">
            <AudioPlayer url={q.audioUrl} maxPlays={q.maxAudioPlays} />
          </div>
        )}

        {/* Video Attachment */}
        {q.videoUrl && (
          <div className="my-2">
            <VideoEmbed url={q.videoUrl} />
          </div>
        )}

        {/* Options / Input based on question type */}
        {q.type === 'multiple' && Array.isArray(q.options) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {q.options.map((opt: string, optIdx: number) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
              const isSelected = selectedOptions[qIdx] === optIdx;
              const isCorrectAnswer = q.correct === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(qIdx, optIdx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 font-bold text-blue-900 shadow-sm'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 pt-0.5 leading-snug">
                    <LatexRenderer text={opt || `Lựa chọn ${letter}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'truefalse' && Array.isArray(q.options) && (
          <div className="space-y-2 pt-1">
            {q.options.map((stmt: string, sIdx: number) => {
              const letter = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
              const curVal = selectedOptions[qIdx]?.[sIdx];

              return (
                <div
                  key={sIdx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="font-extrabold text-blue-600 uppercase text-xs pt-0.5">
                      {letter})
                    </span>
                    <div className="text-slate-800 font-medium">
                      <LatexRenderer text={stmt || `Mệnh đề ${letter}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...(selectedOptions[qIdx] || {}) };
                        next[sIdx] = true;
                        handleSelectOption(qIdx, next);
                      }}
                      className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                        curVal === true
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...(selectedOptions[qIdx] || {}) };
                        next[sIdx] = false;
                        handleSelectOption(qIdx, next);
                      }}
                      className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                        curVal === false
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
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

        {q.type === 'short' && (
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Đáp án của bạn:</span>
              <input
                type="text"
                placeholder="Điền số kết quả..."
                value={selectedOptions[qIdx] || ''}
                onChange={(e) => handleSelectOption(qIdx, e.target.value)}
                className="max-w-[160px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {q.type === 'matching' && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Chọn đáp án Cột B tương ứng với từng mục Cột A:
            </span>
            {(q.pairs || []).map((pair: any, pIdx: number) => {
              const curChoice = selectedOptions[qIdx]?.[pair.id];
              return (
                <div
                  key={pIdx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-extrabold text-amber-600">{pIdx + 1}.</span>
                    <span className="font-medium text-slate-800">{pair.left}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold">⇄</span>
                    <select
                      value={curChoice || ''}
                      onChange={(e) => {
                        const next = { ...(selectedOptions[qIdx] || {}) };
                        next[pair.id] = e.target.value;
                        handleSelectOption(qIdx, next);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 max-w-[220px]"
                    >
                      <option value="">-- Chọn nội dung ghép --</option>
                      {(q.pairs || []).map((pRight: any, rIdx: number) => (
                        <option key={rIdx} value={pRight.id}>
                          {pRight.right}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {q.type === 'cloze' && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Điền nội dung phù hợp vào các chỗ trống:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(q.blanks || []).map((blank: any, bIdx: number) => {
                const curChoice = selectedOptions[qIdx]?.[blank.id || bIdx + 1];
                const hasOptions = Array.isArray(blank.options) && blank.options.length > 0;
                return (
                  <div
                    key={bIdx}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <span className="font-black text-teal-700 shrink-0">
                      [{blank.id || bIdx + 1}]
                    </span>
                    {hasOptions ? (
                      <select
                        value={curChoice || ''}
                        onChange={(e) => {
                          const next = { ...(selectedOptions[qIdx] || {}) };
                          next[blank.id || bIdx + 1] = e.target.value;
                          handleSelectOption(qIdx, next);
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      >
                        <option value="">-- Chọn từ gợi ý --</option>
                        {blank.options.map((opt: string, oIdx: number) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={curChoice || ''}
                        onChange={(e) => {
                          const next = { ...(selectedOptions[qIdx] || {}) };
                          next[blank.id || bIdx + 1] = e.target.value;
                          handleSelectOption(qIdx, next);
                        }}
                        placeholder="Nhập từ..."
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {q.type === 'ordering' && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Dùng nút mũi tên để di chuyển vị trí các bước theo thứ tự đúng:
            </span>
            <div className="space-y-1.5">
              {(
                selectedOptions[qIdx] ||
                (q.items || []).map((it: any) => it.id)
              ).map((itemId: string, oIdx: number) => {
                const itemObj = (q.items || []).find((it: any) => it.id === itemId);
                return (
                  <div
                    key={oIdx}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-black text-cyan-700">{oIdx + 1}.</span>
                      <span className="text-slate-800 font-medium">{itemObj?.text || itemId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={oIdx === 0}
                        onClick={() => {
                          const curArr = [
                            ...(selectedOptions[qIdx] || (q.items || []).map((it: any) => it.id)),
                          ];
                          const temp = curArr[oIdx - 1];
                          curArr[oIdx - 1] = curArr[oIdx];
                          curArr[oIdx] = temp;
                          handleSelectOption(qIdx, curArr);
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={
                          oIdx ===
                          (selectedOptions[qIdx] || (q.items || []).map((it: any) => it.id)).length - 1
                        }
                        onClick={() => {
                          const curArr = [
                            ...(selectedOptions[qIdx] || (q.items || []).map((it: any) => it.id)),
                          ];
                          const temp = curArr[oIdx + 1];
                          curArr[oIdx + 1] = curArr[oIdx];
                          curArr[oIdx] = temp;
                          handleSelectOption(qIdx, curArr);
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {q.type === 'essay' && (
          <div className="pt-1 space-y-1.5">
            <textarea
              rows={2}
              placeholder="Thí sinh trình bày bài làm tự luận..."
              value={selectedOptions[qIdx] || ''}
              onChange={(e) => handleSelectOption(qIdx, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {q.allowAttachments && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span>📎 Hỗ trợ đính kèm ảnh bài làm viết tay</span>
              </div>
            )}
          </div>
        )}

        {q.type === 'multiselect' && Array.isArray(q.options) && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Chọn một hoặc nhiều đáp án đúng:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt: string, optIdx: number) => {
                const letter = ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || `${optIdx + 1}`;
                const curSelected: number[] = Array.isArray(selectedOptions[qIdx]) ? selectedOptions[qIdx] : [];
                const isChecked = curSelected.includes(optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => {
                      const next = isChecked
                        ? curSelected.filter((i) => i !== optIdx)
                        : [...curSelected, optIdx];
                      handleSelectOption(qIdx, next);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50/80 border-indigo-500 font-bold text-indigo-900 shadow-sm'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md font-black text-xs flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {isChecked ? '✓' : letter}
                    </div>
                    <div className="flex-1 pt-0.5 leading-snug">
                      <LatexRenderer text={opt || `Lựa chọn ${letter}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {q.type === 'grouping' && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Phân loại các mục vào đúng nhóm tương ứng:
            </span>
            <div className="space-y-2">
              {(q.items || []).map((item: any, itIdx: number) => {
                const curCategory = selectedOptions[qIdx]?.[item.id];
                return (
                  <div
                    key={itIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-start gap-1.5 flex-1">
                      <span className="font-extrabold text-blue-600">•</span>
                      <span className="font-medium text-slate-800">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold">➔</span>
                      <select
                        value={curCategory || ''}
                        onChange={(e) => {
                          const next = { ...(selectedOptions[qIdx] || {}) };
                          next[item.id] = e.target.value;
                          handleSelectOption(qIdx, next);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 max-w-[200px]"
                      >
                        <option value="">-- Chọn nhóm --</option>
                        {(q.categories || []).map((cat: any, cIdx: number) => (
                          <option key={cIdx} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {q.type === 'error_identification' && (
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Chọn phần gạch chân bị sai và điền phương án sửa lại:
            </span>
            <div className="flex flex-wrap gap-2">
              {(q.underlines || []).map((und: any, uIdx: number) => {
                const selectedError = selectedOptions[qIdx]?.selectedUnderline;
                const isSelected = selectedError === und.id;
                return (
                  <button
                    key={uIdx}
                    type="button"
                    onClick={() => {
                      const next = { ...(selectedOptions[qIdx] || {}), selectedUnderline: und.id };
                      handleSelectOption(qIdx, next);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold underline shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-extrabold mr-1 text-slate-400">[{und.id}]</span>
                    {und.text}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-600">Sửa lại thành:</span>
              <input
                type="text"
                placeholder="Nhập từ/cụm từ đúng..."
                value={selectedOptions[qIdx]?.correction || ''}
                onChange={(e) => {
                  const next = { ...(selectedOptions[qIdx] || {}), correction: e.target.value };
                  handleSelectOption(qIdx, next);
                }}
                className="flex-1 max-w-xs px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  let globalQuestionCounter = 0;

  return (
    <div className="space-y-6">
      {/* Exam Header Preview Banner */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase">
              {subject || 'Chưa chọn môn'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black">
              {grade || 'Chưa chọn lớp'}
            </span>
            {examType && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black">
                {examType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{matrixDuration} phút</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{questions.length} câu</span>
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-black text-white leading-tight">
            {title || 'Tiêu đề đề thi đang soạn thảo'}
          </h2>
          {author && (
            <p className="text-xs text-slate-400 font-medium mt-1">
              Người ra đề / Tác giả: <span className="text-slate-200 font-bold">{author}</span>
            </p>
          )}
        </div>
      </div>

      {/* Shared Passages Group (Ngữ liệu chung hiển thị LIỀN MẠCH trên cùng 1 trang) */}
      {passages.map((passage) => {
        const passageQuestions = passageMap.get(passage.id) || [];
        if (passageQuestions.length === 0) return null;

        return (
          <div
            key={passage.id}
            className="p-5 bg-gradient-to-b from-indigo-50/50 to-white rounded-3xl border-2 border-indigo-200/80 shadow-sm space-y-4"
          >
            {/* Passage Header */}
            <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  {passage.title || 'Ngữ Liệu Chung / Bài Đọc Hiểu'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                {passageQuestions.length} câu hỏi liên quan
              </span>
            </div>

            {/* Passage Content */}
            <div className="p-4 bg-white/90 rounded-2xl border border-indigo-100 text-xs text-slate-800 leading-relaxed font-normal shadow-inner">
              <LatexRenderer text={passage.content} />
            </div>

            {/* Passage Media */}
            {passage.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-indigo-100 max-h-72 bg-white flex items-center justify-center">
                <img src={passage.imageUrl} alt="Hình ngữ liệu" className="max-h-72 object-contain" />
              </div>
            )}
            {passage.audioUrl && (
              <AudioPlayer url={passage.audioUrl} maxPlays={passage.maxAudioPlays} />
            )}
            {passage.videoUrl && <VideoEmbed url={passage.videoUrl} />}

            {/* Sub-questions of this passage - ALWAYS rendered on the SAME PAGE */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Các câu hỏi dựa trên ngữ liệu trên:</span>
                {passage.shuffleQuestions && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-2">
                    <Shuffle className="w-3 h-3" /> (Đảo câu con)
                  </span>
                )}
              </div>
              {passageQuestions.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          </div>
        );
      })}

      {/* Standalone Questions Section */}
      {standaloneQuestions.length > 0 && (
        <div className="space-y-4">
          {multipleList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần I: Trắc nghiệm 4 lựa chọn ({multipleList.length} câu)
                </h3>
              </div>
              {multipleList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {tfList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần II: Trắc nghiệm Đúng / Sai ({tfList.length} câu)
                </h3>
              </div>
              {tfList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {shortList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần III: Câu hỏi trả lời ngắn ({shortList.length} câu)
                </h3>
              </div>
              {shortList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {matchingList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần IV: Câu hỏi nối cặp ({matchingList.length} câu)
                </h3>
              </div>
              {matchingList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {clozeList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần V: Câu hỏi điền khuyết ({clozeList.length} câu)
                </h3>
              </div>
              {clozeList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {orderingList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần VI: Câu hỏi sắp xếp thứ tự ({orderingList.length} câu)
                </h3>
              </div>
              {orderingList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}

          {essayList.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Phần VII: Câu hỏi tự luận ({essayList.length} câu)
                </h3>
              </div>
              {essayList.map((q) => {
                globalQuestionCounter++;
                return renderQuestionItem(q, globalQuestionCounter);
              })}
            </div>
          )}
        </div>
      )}

      {questions.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-bold text-xs">Chưa có câu hỏi nào trong đề thi.</p>
          <p className="text-[11px]">
            Thêm câu hỏi ở cột bên trái hoặc tải lên file JSON để xem trước tại đây.
          </p>
        </div>
      )}
    </div>
  );
};
