import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Stanza } from '../../types';

interface ClozeModeProps {
  stanza: Stanza;
  onSuccessPart: () => void;
}

type Difficulty = 'rhyme' | 'easy' | 'medium' | 'hard' | 'full';

export const ClozeMode: React.FC<ClozeModeProps> = ({ stanza, onSuccessPart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [revealedIndices, setRevealedIndices] = useState<Record<string, boolean>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [interactionMode, setInteractionMode] = useState<'tap' | 'type'>('tap');
  const [seed, setSeed] = useState(0);

  // Parse lines into tokens
  const tokenizedLines = useMemo(() => {
    return stanza.lines.map((line, lineIdx) => {
      // Split words while preserving punctuation
      const words = line.split(/\s+/).filter(Boolean);
      const totalWords = words.length;

      return words.map((word, wordIdx) => {
        const key = `${lineIdx}-${wordIdx}`;
        // Clean punctuation for rhyme matching
        const cleanWord = word.replace(/[.,!?;:"'()]/g, '').toLowerCase();

        let isHidden = false;
        if (difficulty === 'rhyme') {
          // Hide last word of the line or words in rhymeMapping
          isHidden = wordIdx === totalWords - 1;
        } else if (difficulty === 'easy') {
          // Hide ~25%
          isHidden = (wordIdx + lineIdx + seed) % 4 === 0;
        } else if (difficulty === 'medium') {
          // Hide ~50%
          isHidden = (wordIdx + lineIdx + seed) % 2 === 0;
        } else if (difficulty === 'hard') {
          // Hide ~75%
          isHidden = (wordIdx + lineIdx + seed) % 4 !== 0;
        } else if (difficulty === 'full') {
          // Hide 100%
          isHidden = true;
        }

        return {
          key,
          original: word,
          cleanWord,
          isHidden,
          lineIdx,
          wordIdx
        };
      });
    });
  }, [stanza.lines, difficulty, seed]);

  const toggleReveal = (key: string) => {
    setRevealedIndices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    tokenizedLines.forEach(line => {
      line.forEach(item => {
        all[item.key] = true;
      });
    });
    setRevealedIndices(all);
  };

  const hideAll = () => {
    setRevealedIndices({});
    setUserInputs({});
  };

  const resetGame = () => {
    setSeed(prev => prev + 1);
    setRevealedIndices({});
    setUserInputs({});
  };

  // Check typed accuracy
  const totalHidden = tokenizedLines.flat().filter(t => t.isHidden).length;
  const correctCount = tokenizedLines.flat().filter(t => {
    if (!t.isHidden) return false;
    if (interactionMode === 'tap') return revealedIndices[t.key];
    const input = (userInputs[t.key] || '').trim().toLowerCase();
    return input === t.cleanWord;
  }).length;

  const scorePercent = totalHidden > 0 ? Math.round((correctCount / totalHidden) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Controls & Difficulty Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Mức độ ẩn:</span>
          <div className="flex bg-white/80 p-0.5 rounded-xl border border-amber-200 text-xs">
            {(
              [
                ['rhyme', 'Vần cuối'],
                ['easy', 'Dễ (25%)'],
                ['medium', 'Vừa (50%)'],
                ['hard', 'Khó (75%)'],
                ['full', 'Ẩn hết (100%)']
              ] as const
            ).map(([lvl, label]) => (
              <button
                key={lvl}
                onClick={() => {
                  setDifficulty(lvl);
                  hideAll();
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  difficulty === lvl
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-700 hover:text-orange-600 hover:bg-amber-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode switch: Tap to reveal vs Type */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInteractionMode(interactionMode === 'tap' ? 'type' : 'tap')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-200/60 hover:bg-amber-200 text-amber-900 transition-colors"
          >
            {interactionMode === 'tap' ? (
              <>Chế độ: <span className="text-orange-700 underline">Chạm để mở</span></>
            ) : (
              <>Chế độ: <span className="text-orange-700 underline">Gõ từ điền</span></>
            )}
          </button>

          <button
            onClick={revealAll}
            title="Xem toàn bộ câu"
            className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={hideAll}
            title="Ẩn toàn bộ"
            className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={resetGame}
            title="Đổi vị trí ẩn"
            className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Verses Area */}
      <div className="paper-card p-6 sm:p-8 rounded-3xl space-y-4">
        {tokenizedLines.map((line, lIdx) => (
          <div
            key={lIdx}
            className="flex flex-wrap items-center gap-x-2 gap-y-2.5 text-lg sm:text-xl font-poem leading-relaxed"
          >
            <span className="text-xs font-sans text-amber-700/60 select-none mr-2 font-mono">
              0{lIdx + 1}
            </span>
            {line.map(token => {
              const isRevealed = revealedIndices[token.key];
              const userInput = userInputs[token.key] || '';
              const isCorrect = userInput.trim().toLowerCase() === token.cleanWord;

              if (!token.isHidden) {
                return (
                  <span key={token.key} className="text-stone-800 font-medium">
                    {token.original}
                  </span>
                );
              }

              // Interaction: Tap to reveal
              if (interactionMode === 'tap') {
                return (
                  <button
                    key={token.key}
                    onClick={() => toggleReveal(token.key)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg transition-all duration-200 font-medium ${
                      isRevealed
                        ? 'bg-amber-100/90 text-orange-900 border border-orange-300 shadow-sm'
                        : 'bg-amber-200/80 hover:bg-orange-200 text-transparent border border-dashed border-amber-400 select-none cursor-pointer'
                    }`}
                  >
                    {isRevealed ? token.original : '••••••'}
                  </button>
                );
              }

              // Interaction: Type to fill
              return (
                <div key={token.key} className="inline-flex items-center relative">
                  <input
                    type="text"
                    value={userInput}
                    placeholder="____"
                    onChange={(e) => {
                      setUserInputs({
                        ...userInputs,
                        [token.key]: e.target.value
                      });
                      if (e.target.value.trim().toLowerCase() === token.cleanWord) {
                        onSuccessPart();
                      }
                    }}
                    className={`w-24 sm:w-28 text-center px-2 py-0.5 text-base font-poem rounded-lg border outline-none transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                        : userInput.length > 0
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-amber-50/70 border-amber-300 text-stone-800 focus:border-orange-500 focus:bg-white'
                    }`}
                  />
                  {isCorrect && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Progress & Hints */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>
            {interactionMode === 'tap'
              ? 'Bấm trực tiếp vào các ô che mờ để hé lộ từ vần và kiểm tra trí nhớ.'
              : 'Gõ từ vào ô trống, hệ thống sẽ tự động đối chiếu và đổi sang màu xanh.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-stone-500">Mức độ thuộc lòng:</span>
            <span className="ml-1.5 font-bold text-sm text-orange-600">{scorePercent}%</span>
          </div>
          <div className="w-24 h-2 bg-amber-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
