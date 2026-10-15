import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, RotateCcw, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Stanza } from '../../types';

interface ScrambleModeProps {
  stanza: Stanza;
  onSuccessPart: () => void;
}

export const ScrambleMode: React.FC<ScrambleModeProps> = ({ stanza, onSuccessPart }) => {
  const [shuffledLines, setShuffledLines] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetScramble = React.useCallback(() => {
    const original = [...stanza.lines];
    // Fisher-yates shuffle
    const copy = [...original];
    let attempts = 0;
    while (attempts < 5) {
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      // If stanza has >1 lines and accidentally identical, retry
      if (copy.join('||') !== original.join('||') || original.length <= 1) break;
      attempts++;
    }
    setShuffledLines(copy);
    setIsSubmitted(false);
    setIsSuccess(false);
  }, [stanza.lines]);

  // Shuffle on stanza change
  useEffect(() => {
    resetScramble();
  }, [resetScramble]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...shuffledLines];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setShuffledLines(next);
    setIsSubmitted(false);
  };

  const moveDown = (index: number) => {
    if (index === shuffledLines.length - 1) return;
    const next = [...shuffledLines];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setShuffledLines(next);
    setIsSubmitted(false);
  };

  const checkAnswer = () => {
    setIsSubmitted(true);
    const correct = shuffledLines.every((line, idx) => line === stanza.lines[idx]);
    if (correct) {
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onSuccessPart();
    } else {
      setIsSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-semibold text-amber-900">
            Thử thách ghép câu: Dùng nút mũi tên để xếp lại đúng thứ tự các câu trong khổ thơ!
          </span>
        </div>

        <button
          onClick={resetScramble}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-stone-700 border border-amber-200 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Xáo trộn lại
        </button>
      </div>

      {/* Lines list */}
      <div className="paper-card p-6 sm:p-8 rounded-3xl space-y-3">
        {shuffledLines.map((line, idx) => {
          const isCorrectPosition = isSubmitted && line === stanza.lines[idx];
          const isWrongPosition = isSubmitted && line !== stanza.lines[idx];

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isCorrectPosition
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : isWrongPosition
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-white/80 border-amber-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-base sm:text-lg font-poem font-medium leading-relaxed">
                  {line}
                </span>
              </div>

              {/* Move buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-amber-900 hover:bg-amber-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Di chuyển lên trên"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === shuffledLines.length - 1}
                  className="p-1.5 rounded-lg text-amber-900 hover:bg-amber-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Di chuyển xuống dưới"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {isSubmitted && (
            <div className={`text-sm font-semibold flex items-center gap-1.5 ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Chúc mừng bạn! Cả khổ thơ đã được sắp xếp hoàn hảo!
                </>
              ) : (
                'Chưa chính xác, hãy hoán đổi lại vị trí các câu màu đỏ nhé.'
              )}
            </div>
          )}
        </div>

        <button
          onClick={checkAnswer}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Kiểm tra thứ tự
        </button>
      </div>
    </div>
  );
};
