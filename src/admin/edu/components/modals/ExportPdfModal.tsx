import React, { useState } from 'react';
import { Printer, X, Download, FileText, Check } from 'lucide-react';
import { LatexRenderer } from '../LatexRenderer';
import type { Question, PassageContext } from '../../types';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  grade: string;
  subject: string;
  examType: string;
  duration: number;
  schoolName?: string;
  passages: PassageContext[];
  questions: Question[];
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  title,
  grade,
  subject,
  examType,
  duration,
  schoolName = 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
  passages,
  questions,
}) => {
  const [examCode, setExamCode] = useState('101');
  const [school, setSchool] = useState(schoolName);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Xuất Bản Đề Thi / In Chuẩn Bộ GD&amp;ĐT</h3>
              <p className="text-[10px] text-slate-500">
                Định dạng chuẩn trang in kèm khung tiêu đề và phiếu trả lời trắc nghiệm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-2">
              <span>Mã đề:</span>
              <select
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black"
              >
                <option value="101">101</option>
                <option value="102">102</option>
                <option value="103">103</option>
                <option value="104">104</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề thi (Lưu PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 print:bg-white print:p-0">
          <div className="max-w-[800px] mx-auto bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-2xl print:border-0 print:shadow-none print:p-0 space-y-6 text-slate-900 font-serif leading-relaxed">
            {/* Ministry / School Header */}
            <div className="grid grid-cols-2 gap-4 border-b-2 border-slate-900 pb-4 text-xs font-bold text-center">
              <div>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full text-center font-bold uppercase tracking-wider bg-transparent border-0 focus:outline-none"
                />
                <span className="block uppercase font-black mt-0.5">
                  {title || 'ĐỀ THI TỐT NGHIỆP THPT'}
                </span>
                <span className="text-[11px] font-normal block mt-1">
                  (Đề thi gồm có {questions.length} câu)
                </span>
              </div>

              <div className="space-y-1">
                <span className="block uppercase font-black">
                  KÌ THI KHẢO SÁT CHẤT LƯỢNG
                </span>
                <span className="block font-bold">
                  Môn thi: {subject || 'Toán học'} – {grade || 'Lớp 12'}
                </span>
                <span className="block text-[11px] font-normal">
                  Thời gian làm bài: <b>{duration} phút</b> (không kể thời gian phát đề)
                </span>
                <div className="inline-block px-3 py-0.5 border border-slate-800 rounded font-black text-xs mt-1">
                  Mã đề thi: {examCode}
                </div>
              </div>
            </div>

            {/* Candidate info box */}
            <div className="text-xs font-semibold flex items-center justify-between pt-1">
              <span>Họ và tên thí sinh: ..........................................................................</span>
              <span>Số báo danh: .................................</span>
            </div>

            {/* Questions Body */}
            <div className="space-y-6 pt-2">
              {questions.map((q, idx) => {
                const passage = q.passageId ? passages.find((p) => p.id === q.passageId) : null;
                const isFirstInPassage =
                  passage &&
                  questions.findIndex((otherQ) => otherQ.passageId === q.passageId) === idx;

                return (
                  <div key={idx} className="space-y-2 text-xs">
                    {/* Render shared passage if first question referencing it */}
                    {isFirstInPassage && passage && (
                      <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1 mb-2">
                        <span className="font-black text-slate-800 uppercase block">
                          [Ngữ liệu] {passage.title || 'Bài đọc tham khảo'}
                        </span>
                        <div className="italic text-slate-700 leading-relaxed font-serif">
                          <LatexRenderer text={passage.content} />
                        </div>
                      </div>
                    )}

                    <div className="font-bold flex items-start gap-1">
                      <span className="font-black shrink-0">Câu {idx + 1}:</span>
                      <div className="flex-1">
                        <LatexRenderer text={q.question} />
                      </div>
                    </div>

                    {q.imageUrl && (
                      <div className="my-2 max-h-48 flex justify-center">
                        <img
                          src={q.imageUrl}
                          alt="Minh họa"
                          className="max-h-48 object-contain border border-slate-200 rounded"
                        />
                      </div>
                    )}

                    {q.type === 'multiple' && Array.isArray(q.options) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-4">
                        {q.options.map((opt, oIdx) => {
                          const letter = ['A', 'B', 'C', 'D'][oIdx];
                          return (
                            <div key={oIdx} className="flex items-start gap-1">
                              <span className="font-black">{letter}.</span>
                              <div>
                                <LatexRenderer text={opt} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'truefalse' && Array.isArray(q.options) && (
                      <div className="space-y-1 pl-4 pt-1">
                        {q.options.map((stmt, sIdx) => {
                          const letter = ['a', 'b', 'c', 'd'][sIdx];
                          return (
                            <div key={sIdx} className="flex items-start gap-1">
                              <span className="font-bold">{letter})</span>
                              <div>
                                <LatexRenderer text={stmt} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short' && (
                      <div className="pl-4 pt-1 font-serif text-slate-700 italic">
                        <span>Đáp số: ............................................................................</span>
                      </div>
                    )}

                    {q.type === 'matching' && Array.isArray((q as any).pairs) && (
                      <div className="pl-4 pt-1 space-y-1.5">
                        <div className="grid grid-cols-2 gap-4 border border-slate-300 p-2 rounded bg-slate-50/50">
                          <div>
                            <span className="font-black block border-b border-slate-300 pb-1 mb-1">
                              Cột A
                            </span>
                            {(q as any).pairs.map((p: any, pIdx: number) => (
                              <div key={pIdx} className="py-0.5">
                                <b>{pIdx + 1}.</b> {p.left}
                              </div>
                            ))}
                          </div>
                          <div>
                            <span className="font-black block border-b border-slate-300 pb-1 mb-1">
                              Cột B
                            </span>
                            {(q as any).pairs.map((p: any, pIdx: number) => {
                              const letter = ['A', 'B', 'C', 'D', 'E', 'F'][pIdx] || `${pIdx + 1}`;
                              return (
                                <div key={pIdx} className="py-0.5">
                                  <b>{letter}.</b> {p.right}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {q.type === 'cloze' && Array.isArray((q as any).blanks) && (
                      <div className="pl-4 pt-1 space-y-1">
                        <span className="italic text-slate-500 block">
                          Điền từ phù hợp vào các chỗ trống [1], [2], ...:
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {(q as any).blanks.map((b: any, bIdx: number) => (
                            <span key={bIdx} className="text-slate-700">
                              [{bIdx + 1}] .........................
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === 'ordering' && Array.isArray((q as any).items) && (
                      <div className="pl-4 pt-1 space-y-1">
                        <span className="italic text-slate-500 block">
                          Các bước thực hiện cần sắp xếp:
                        </span>
                        {(q as any).items.map((it: any, oIdx: number) => {
                          const letter = ['a', 'b', 'c', 'd', 'e'][oIdx] || `${oIdx + 1}`;
                          return (
                            <div key={oIdx} className="pl-2">
                              <b>{letter})</b> {it.text}
                            </div>
                          );
                        })}
                        <div className="pt-1 italic">
                          Thứ tự sắp xếp đúng: ........................................................
                        </div>
                      </div>
                    )}

                    {q.type === 'essay' && (
                      <div className="pl-4 pt-1 space-y-2">
                        <div className="h-28 border border-dashed border-slate-300 rounded p-2 italic text-slate-400">
                          (Thí sinh làm bài tự luận vào phần kẻ giấy này)
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer sheet template footer */}
            <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-3">
              <h4 className="text-center font-black text-xs uppercase tracking-wider">
                PHIẾU TRẢ LỜI TRẮC NGHIỆM CHUẨN GDPT 2018 (MÃ ĐỀ: {examCode})
              </h4>
              <div className="grid grid-cols-4 gap-2 text-[10px] border border-slate-300 p-3 rounded-lg text-center">
                {questions.slice(0, 24).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-0.5 border-b border-slate-200">
                    <span className="font-bold">{i + 1}.</span>
                    <span className="text-slate-400">Ⓐ Ⓑ Ⓒ Ⓓ</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-500 italic">
                ---------- HẾT ----------
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
