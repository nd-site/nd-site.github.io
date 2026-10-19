import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { ExamReader } from './ExamReader';
import type { Question, ExamStructure, PassageContext, ExamProctoringConfig } from '../types';

interface RunnerTabProps {
  editorQuestions: Question[];
  editorTitle: string;
  editorGrade?: string;
  editorSubject?: string;
  matrixDuration: number;
  fullDuration: number;
  editorStructure?: ExamStructure;
  passages?: PassageContext[];
  proctoring?: ExamProctoringConfig;
  onToast: (msg: string, isError?: boolean) => void;
  onBackToEditor?: () => void;
}

export const RunnerTab: React.FC<RunnerTabProps> = ({
  editorQuestions,
  editorTitle,
  editorGrade,
  editorSubject,
  matrixDuration,
  fullDuration,
  editorStructure,
  passages = [],
  proctoring,
  onToast,
  onBackToEditor,
}) => {
  const [step, setStep] = useState<'mode-select' | 'sampling-select' | 'running'>('mode-select');
  const [selectedSampling, setSelectedSampling] = useState<'matrix' | 'full'>('matrix');
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam'>('practice');

  const struct = editorStructure;
  const hasConfiguredCounts = Boolean(
    struct &&
      struct.counts &&
      Object.values(struct.counts).some((v) => Number(v) > 0)
  );

  const matrixCount = hasConfiguredCounts
    ? (Number(struct?.counts?.multiple) || 0) +
      (Number(struct?.counts?.truefalse) || 0) +
      (Number(struct?.counts?.short) || 0) +
      (Number(struct?.counts?.matching) || 0) +
      (Number(struct?.counts?.cloze) || 0) +
      (Number(struct?.counts?.ordering) || 0) +
      (Number(struct?.counts?.essay) || 0)
    : editorQuestions.length;

  if (editorQuestions.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
        <Layers className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h3 className="text-base font-black text-slate-800">Đề thi chưa có câu hỏi nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Vui lòng quay lại tab Soạn đề để thêm câu hỏi hoặc tải lên file JSON trước khi thử làm bài.
          </p>
        </div>
        {onBackToEditor && (
          <button
            type="button"
            onClick={onBackToEditor}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Quay lại trình soạn thảo
          </button>
        )}
      </div>
    );
  }

  // Bước 1 / 2: Chọn Chế độ làm bài (Luyện tập hoặc Thi thử)
  if (step === 'mode-select') {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center py-6 px-4 animate-in fade-in">
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 shadow-xl rounded-3xl p-6 md:p-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100 text-xs font-black text-purple-700 uppercase">
            <span>Bước 1 / 2 • Chế độ làm bài</span>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Chọn chế độ thử nghiệm</h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Bạn muốn kiểm tra đáp án từng câu hay làm bài tính giờ như kỳ thi thật?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div
              onClick={() => {
                setSelectedMode('practice');
                setStep('sampling-select');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1.5">Luyện tập</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Kiểm tra đáp án ngay sau khi chọn. Xem lời giải chi tiết và thử nghiệm giao diện.
                </p>
              </div>
              <div className="flex items-center text-emerald-600 font-extrabold text-xs">
                <span>Chọn chế độ Luyện tập</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <div
              onClick={() => {
                setSelectedMode('exam');
                setStep('sampling-select');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-rose-500 bg-white hover:bg-rose-50/30 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  ⏱️
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1.5">Thi thử</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Mô phỏng kỳ thi thực tế. Đếm ngược thời gian nghiêm túc, cấm AI, cấm làm lại câu.
                </p>
              </div>
              <div className="flex items-center text-rose-600 font-extrabold text-xs">
                <span>Chọn chế độ Thi thử</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {onBackToEditor && (
            <button
              type="button"
              onClick={onBackToEditor}
              className="text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trình soạn thảo</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Bước 2 / 2: Chọn Cách kiểm tra (Ma trận hoặc Tất cả câu)
  if (step === 'sampling-select') {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center py-6 px-4 animate-in fade-in">
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 shadow-xl rounded-3xl p-6 md:p-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100 text-xs font-black text-blue-700 uppercase">
            <span>Bước 2 / 2 • Thử làm đề đang tạo</span>
          </div>

          <div>
            <div className="mb-2">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                selectedMode === 'exam'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Chế độ đã chọn: {selectedMode === 'exam' ? '⏱️ Thi thử' : '📖 Luyện tập'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Chọn loại ma trận câu hỏi</h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Bạn muốn thử nghiệm làm bài theo ma trận đề hay toàn bộ ngân hàng câu hỏi?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div
              onClick={() => {
                setSelectedSampling('matrix');
                setStep('running');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <h3 className="text-base font-black text-slate-900">Theo ma trận đề</h3>
                  <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {matrixCount} câu • {matrixDuration}p
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Lọc số câu theo ma trận đề thi chuẩn. Thời gian làm bài theo cấu hình kiểm tra ({matrixDuration} phút).
                </p>
              </div>
              <div className="flex items-center text-blue-600 font-extrabold text-xs">
                <span>Vào làm bài ngay</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <div
              onClick={() => {
                setSelectedSampling('full');
                setStep('running');
              }}
              className="p-5 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  ♾️
                </div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <h3 className="text-base font-black text-slate-900">Tất cả câu hỏi</h3>
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {editorQuestions.length} câu • {fullDuration}p
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Làm toàn bộ {editorQuestions.length} câu hỏi có trong đề. Thời gian làm bài theo chế độ tất cả câu ({fullDuration} phút).
                </p>
              </div>
              <div className="flex items-center text-indigo-600 font-extrabold text-xs">
                <span>Vào làm bài ngay</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('mode-select')}
            className="text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại chọn dạng làm bài</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamReader
      quizTitle={editorTitle || 'Đề thi đang soạn thảo'}
      grade={editorGrade}
      subject={editorSubject}
      matrixDuration={matrixDuration}
      fullDuration={fullDuration}
      structure={editorStructure}
      passages={passages}
      questions={editorQuestions}
      proctoring={proctoring}
      isStudentMode={false}
      initialSamplingMode={selectedSampling}
      initialRunnerMode={selectedMode}
      onBack={() => setStep('sampling-select')}
      onToast={onToast}
    />
  );
};
