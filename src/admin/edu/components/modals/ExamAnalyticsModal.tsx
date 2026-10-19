import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  X,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  Users,
  Percent,
  Clock,
  Sparkles,
  BookOpen,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchSubmissionsByExam } from '../../services/firebaseService';
import { normalizeShortDecimalAnswer } from '../../services/aiService';
import type { Question, StudentSubmissionRecord } from '../../types';

interface ExamAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string;
  examTitle: string;
  questions: Question[];
}

export const ExamAnalyticsModal: React.FC<ExamAnalyticsModalProps> = ({
  isOpen,
  onClose,
  examId,
  examTitle,
  questions,
}) => {
  const [submissions, setSubmissions] = useState<StudentSubmissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');

  useEffect(() => {
    if (isOpen && examId) {
      loadSubmissions();
    }
  }, [isOpen, examId]);

  const loadSubmissions = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const data = await fetchSubmissionsByExam(examId);
      setSubmissions(data);
    } catch (err) {
      console.warn('Lỗi tải bài làm để phân tích phổ điểm:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const totalSubmissions = submissions.length;

  // Tính toán chỉ số thống kê từ bài làm thực tế
  const scores = submissions.map((s) => Number(s.score10) || 0);
  const avgScore =
    totalSubmissions > 0
      ? (scores.reduce((sum, val) => sum + val, 0) / totalSubmissions).toFixed(2)
      : '0.00';
  const maxScore = totalSubmissions > 0 ? Math.max(...scores).toFixed(1) : '0';
  const minScore = totalSubmissions > 0 ? Math.min(...scores).toFixed(1) : '0';

  // Phổ điểm thực tế 8 mốc điểm
  const scoreBuckets = [
    { label: '0 - < 2', min: 0, max: 2, count: 0, percent: 0, color: 'bg-rose-500' },
    { label: '2 - < 4', min: 2, max: 4, count: 0, percent: 0, color: 'bg-orange-500' },
    { label: '4 - < 5', min: 4, max: 5, count: 0, percent: 0, color: 'bg-amber-500' },
    { label: '5 - < 6', min: 5, max: 6, count: 0, percent: 0, color: 'bg-yellow-500' },
    { label: '6 - < 7', min: 6, max: 7, count: 0, percent: 0, color: 'bg-emerald-500' },
    { label: '7 - < 8', min: 7, max: 8, count: 0, percent: 0, color: 'bg-teal-500' },
    { label: '8 - < 9', min: 8, max: 9, count: 0, percent: 0, color: 'bg-blue-500' },
    { label: '9 - 10', min: 9, max: 10.01, count: 0, percent: 0, color: 'bg-indigo-600' },
  ];

  if (totalSubmissions > 0) {
    scores.forEach((sc) => {
      for (const bucket of scoreBuckets) {
        if (sc >= bucket.min && sc < bucket.max) {
          bucket.count++;
          break;
        }
      }
    });
    scoreBuckets.forEach((bucket) => {
      bucket.percent = Math.round((bucket.count / totalSubmissions) * 100);
    });
  }

  // Tỷ lệ đạt chuẩn (>= 5.0)
  const passCount = scores.filter((s) => s >= 5.0).length;
  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

  // Tỷ lệ xuất sắc / giỏi (>= 8.0)
  const highCount = scores.filter((s) => s >= 8.0).length;
  const highRate = totalSubmissions > 0 ? Math.round((highCount / totalSubmissions) * 100) : 0;

  // Phân tích chi tiết từng câu hỏi dựa trên bài làm của học sinh
  const questionAnalytics = questions.map((q, idx) => {
    let wrongCount = 0;
    let correctCount = 0;
    let unansweredCount = 0;

    submissions.forEach((sub) => {
      const userAnswersList = Array.isArray(sub.userAnswers)
        ? sub.userAnswers
        : Array.isArray((sub as any).answers)
        ? (sub as any).answers
        : [];

      const ua = userAnswersList[idx];

      // Đánh giá đúng / sai theo loại câu hỏi
      if (ua === null || ua === undefined || ua === '') {
        unansweredCount++;
        wrongCount++;
        return;
      }

      const qType = q.type;
      if (qType === 'multiple') {
        if (ua === q.correct) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (qType === 'truefalse') {
        const cAnswers = (q as any).correctAnswers || [];
        let allMatch = true;
        if (Array.isArray(ua) && ua.length === cAnswers.length) {
          cAnswers.forEach((ans: boolean, i: number) => {
            if (ua[i] !== ans) allMatch = false;
          });
        } else {
          allMatch = false;
        }
        if (allMatch) correctCount++;
        else wrongCount++;
      } else if (qType === 'short') {
        const normUser = normalizeShortDecimalAnswer(String(ua || ''));
        const normKey = normalizeShortDecimalAnswer(String((q as any).correct || ''));
        if (normUser && normKey && normUser === normKey) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (qType === 'matching') {
        const pairs = (q as any).pairs || [];
        let matchAll = pairs.length > 0;
        pairs.forEach((pair: any) => {
          if (ua?.[pair.id] !== pair.id) matchAll = false;
        });
        if (matchAll) correctCount++;
        else wrongCount++;
      } else if (qType === 'cloze') {
        const blanks = (q as any).blanks || [];
        let matchAll = blanks.length > 0;
        blanks.forEach((blank: any) => {
          const userText = String(ua?.[blank.id] || '').trim().toLowerCase();
          const keyText = String(blank.correct || '').trim().toLowerCase();
          if (!userText || userText !== keyText) matchAll = false;
        });
        if (matchAll) correctCount++;
        else wrongCount++;
      } else if (qType === 'ordering') {
        const items = (q as any).items || [];
        const correctOrder = items.map((it: any) => it.id).join(',');
        const userOrder = Array.isArray(ua) ? ua.join(',') : '';
        if (userOrder && userOrder === correctOrder) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (qType === 'multiselect') {
        const correctIndices: number[] = Array.isArray((q as any).correct) ? (q as any).correct : [];
        const userSelected: number[] = Array.isArray(ua) ? ua : [];
        const isMatch =
          userSelected.length === correctIndices.length &&
          userSelected.every((cIdx) => correctIndices.includes(cIdx));
        if (isMatch) correctCount++;
        else wrongCount++;
      } else {
        // Mặc định hoặc câu tự luận: nếu có điểm >= 50%
        if (ua) correctCount++;
        else wrongCount++;
      }
    });

    const errorRate = totalSubmissions > 0 ? Math.round((wrongCount / totalSubmissions) * 100) : 0;
    const correctRate = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

    return {
      index: idx + 1,
      question: q,
      totalSubmissions,
      wrongCount,
      correctCount,
      unansweredCount,
      errorRate,
      correctRate,
    };
  });

  // Top các câu học sinh sai nhiều nhất
  const hardestQuestions = [...questionAnalytics]
    .filter((q) => q.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                  Phân Tích Phổ Điểm &amp; Độ Phân Hóa
                </h3>
                {examId && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-bold">
                    #{examId.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{examTitle || 'Đề thi'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {examId && (
              <button
                type="button"
                onClick={loadSubmissions}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer disabled:opacity-50"
                title="Làm mới dữ liệu bài làm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Phổ điểm tổng quan ({totalSubmissions} bài nộp)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Chi tiết tỉ lệ sai từng câu ({totalQuestions} câu)
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Đang tải và tổng hợp dữ liệu bài làm học sinh...</p>
          </div>
        ) : totalSubmissions === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-black text-slate-700">Chưa có lượt nộp bài làm nào</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hệ thống sẽ tự động cập nhật phổ điểm thực tế, điểm trung bình và phân tích tỉ lệ sai từng câu khi học sinh hoàn thành và nộp bài thi.
            </p>
          </div>
        ) : activeTab === 'overview' ? (
          <>
            {/* KPI metric summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <span className="block text-[10.5px] font-bold text-blue-600 uppercase tracking-wide">
                  Tổng lượt nộp bài
                </span>
                <span className="text-2xl font-black text-blue-900 mt-0.5 block">{totalSubmissions}</span>
                <span className="text-[10px] text-blue-600 font-medium">Học sinh đã làm</span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <span className="block text-[10.5px] font-bold text-emerald-600 uppercase tracking-wide">
                  Điểm trung bình
                </span>
                <span className="text-2xl font-black text-emerald-900 mt-0.5 block">{avgScore}</span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Cao nhất: {maxScore} | Thấp: {minScore}
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl">
                <span className="block text-[10.5px] font-bold text-amber-600 uppercase tracking-wide">
                  Tỉ lệ trên trung bình
                </span>
                <span className="text-2xl font-black text-amber-900 mt-0.5 block">{passRate}%</span>
                <span className="text-[10px] text-amber-600 font-medium">
                  {passCount} / {totalSubmissions} bài đạt ≥ 5.0
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <span className="block text-[10.5px] font-bold text-indigo-600 uppercase tracking-wide">
                  Tỉ lệ đạt giỏi (≥ 8.0)
                </span>
                <span className="text-2xl font-black text-indigo-900 mt-0.5 block">{highRate}%</span>
                <span className="text-[10px] text-indigo-600 font-medium">
                  {highCount} / {totalSubmissions} bài điểm cao
                </span>
              </div>
            </div>

            {/* Phổ điểm phân bố thực tế */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Phổ điểm thực tế bài thi ({totalSubmissions} học sinh)</span>
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  Điểm trung bình toàn bài: <strong className="text-blue-600">{avgScore}đ</strong>
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {scoreBuckets.map((bucket) => {
                  const maxPercent = Math.max(...scoreBuckets.map((b) => b.percent), 1);
                  const barWidth = Math.round((bucket.percent / maxPercent) * 100);

                  return (
                    <div key={bucket.label} className="flex items-center gap-3 text-xs">
                      <span className="w-16 font-mono font-bold text-slate-600 text-right">{bucket.label}đ</span>
                      <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bucket.color}`}
                          style={{ width: `${Math.max(barWidth, bucket.count > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                      <span className="w-16 text-[11px] font-black text-slate-800 text-right">
                        {bucket.count} HS ({bucket.percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top câu hỏi sai nhiều nhất */}
            {hardestQuestions.length > 0 && (
              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-black text-rose-900 uppercase">
                    Cảnh báo: Top câu hỏi có tỉ lệ sai cao nhất
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {hardestQuestions.map((item) => (
                    <div
                      key={item.index}
                      className="p-3 bg-white rounded-xl border border-rose-200/80 shadow-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900">Câu {item.index}</span>
                        <span className="font-black text-rose-600">{item.errorRate}% sai</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {item.question.question || 'Nội dung câu hỏi'}
                      </p>
                      <div className="text-[10px] text-slate-400 font-medium pt-0.5">
                        {item.wrongCount} / {item.totalSubmissions} học sinh làm sai
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Danh sách chi tiết tỉ lệ đúng/sai từng câu hỏi */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-1">
              <span>Bảng phân tích tỉ lệ sai chi tiết ({questionAnalytics.length} câu)</span>
              <span>Tổng số bài làm: {totalSubmissions}</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {questionAnalytics.map((item) => {
                const isHighError = item.errorRate >= 50;
                const isModerateError = item.errorRate >= 25 && item.errorRate < 50;

                return (
                  <div key={item.index} className="p-3.5 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                          {item.index}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                          {item.question.type}
                        </span>
                        <span className="text-xs font-black text-slate-800 line-clamp-1">
                          {item.question.question}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
                            isHighError
                              ? 'bg-rose-100 text-rose-700'
                              : isModerateError
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.errorRate}% sai ({item.wrongCount} HS)
                        </span>
                      </div>
                    </div>

                    {/* Progress bar ratio */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-600 font-bold">Đúng: {item.correctRate}%</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${item.correctRate}%` }}
                          title={`Tỉ lệ đúng: ${item.correctRate}%`}
                        />
                        <div
                          className="bg-rose-500 h-full"
                          style={{ width: `${item.errorRate}%` }}
                          title={`Tỉ lệ sai: ${item.errorRate}%`}
                        />
                      </div>
                      <span className="text-rose-600 font-bold">Sai: {item.errorRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
