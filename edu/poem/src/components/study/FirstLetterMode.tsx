import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Sparkles, Check, ArrowRight } from 'lucide-react';
import type { Stanza } from '../../types';
import { speechService } from '../../services/speech';

interface FirstLetterModeProps {
  stanza: Stanza;
  onSuccessPart: () => void;
}

export const FirstLetterMode: React.FC<FirstLetterModeProps> = ({ stanza, onSuccessPart }) => {
  const [styleMode, setStyleMode] = useState<'dotted' | 'initials'>('dotted');
  const [revealedLines, setRevealedLines] = useState<Record<number, boolean>>({});
  const [speakingLine, setSpeakingLine] = useState<number | null>(null);
  const [hasCompletedCheck, setHasCompletedCheck] = useState(false);

  const toggleRevealLine = (idx: number) => {
    setRevealedLines(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const playSpeech = (text: string, lineIdx: number) => {
    if (speakingLine === lineIdx) {
      speechService.stop();
      setSpeakingLine(null);
      return;
    }

    setSpeakingLine(lineIdx);
    speechService.speak(text, {
      onEnd: () => setSpeakingLine(null),
      onError: () => setSpeakingLine(null)
    });
  };

  const getFirstLetterString = (line: string) => {
    const words = line.split(/\s+/).filter(Boolean);
    return words.map(w => {
      // Keep punctuation if any
      const match = w.match(/^([a-zA-ZÀ-ỹ])(.*)/);
      if (!match) return w;
      const first = match[1];
      const rest = match[2];
      const punctuation = rest.replace(/[^.,!?;:"'()]/g, '');

      if (styleMode === 'dotted') {
        return `${first}...${punctuation}`;
      }
      return `${first}${punctuation}`;
    }).join(' ');
  };

  const handleConfirmMastered = () => {
    setHasCompletedCheck(true);
    onSuccessPart();
  };

  return (
    <div className="space-y-6">
      {/* Intro info bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Kiểu hiển thị:</span>
          <div className="flex bg-white/80 p-0.5 rounded-xl border border-amber-200 text-xs">
            <button
              onClick={() => setStyleMode('dotted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                styleMode === 'dotted'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-orange-600'
              }`}
            >
              Ký tự gợi nhớ (S... M... x...)
            </button>
            <button
              onClick={() => setStyleMode('initials')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                styleMode === 'initials'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-orange-600'
              }`}
            >
              Chữ cái đầu (S M x r)
            </button>
          </div>
        </div>

        <div className="text-xs text-amber-900 font-medium">
          Mẹo: Nhìn chữ cái đầu để não bộ kích hoạt liên tưởng từ ngữ tự nhiên!
        </div>
      </div>

      {/* Lines display */}
      <div className="paper-card p-6 sm:p-8 rounded-3xl space-y-5">
        {stanza.lines.map((line, idx) => {
          const isRevealed = revealedLines[idx];
          const isCurrentSpeaking = speakingLine === idx;

          return (
            <div
              key={idx}
              className="group p-3.5 rounded-2xl transition-all duration-200 hover:bg-amber-100/40 border border-transparent hover:border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono text-amber-700/60 mt-1 select-none">
                  0{idx + 1}
                </span>

                <div className="space-y-1">
                  {/* First letter prompt */}
                  <div className="text-lg sm:text-xl font-poem font-bold tracking-wide text-orange-900">
                    {getFirstLetterString(line)}
                  </div>

                  {/* Revealed line if user checks */}
                  {isRevealed && (
                    <div className="text-sm font-poem text-stone-600 italic bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                      {line}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => playSpeech(line, idx)}
                  title="Nghe giọng đọc câu này"
                  className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isCurrentSpeaking
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-amber-100 text-stone-700 hover:bg-orange-100 hover:text-orange-700'
                  }`}
                >
                  {isCurrentSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => toggleRevealLine(idx)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-200/70 hover:bg-amber-200 text-amber-900 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isRevealed ? 'Ẩn câu' : 'Xem câu gốc'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation footer */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-5 rounded-3xl border border-orange-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            Thử thách đọc nhẩm thành tiếng
          </h4>
          <p className="text-xs text-stone-600 mt-0.5">
            Đọc liền mạch cả khổ thơ chỉ bằng cách nhìn gợi ý chữ cái đầu. Khi thấy trôi chảy, hãy nhấn hoàn thành!
          </p>
        </div>

        <button
          onClick={handleConfirmMastered}
          disabled={hasCompletedCheck}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${
            hasCompletedCheck
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 active:scale-95'
          }`}
        >
          {hasCompletedCheck ? (
            <>
              <Check className="w-4 h-4" />
              Đã ghi nhớ xuất sắc!
            </>
          ) : (
            <>
              Tôi đã đọc thuộc khổ này
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
