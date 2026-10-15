import React, { useState } from 'react';
import { RefreshCw, Sparkles, Image as ImageIcon, BookmarkCheck, Lightbulb } from 'lucide-react';
import type { Stanza } from '../../types';

interface FlashcardVisualModeProps {
  stanza: Stanza;
  onSuccessPart: () => void;
}

const RHYME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
  B: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  C: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  D: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
  E: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  F: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
};

export const FlashcardVisualMode: React.FC<FlashcardVisualModeProps> = ({ stanza, onSuccessPart }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [markedRemembered, setMarkedRemembered] = useState(false);

  // Helper to highlight rhymes in text
  const renderHighlightedLine = (line: string) => {
    const rhymeKeys = Object.keys(stanza.rhymeMapping || {});
    if (rhymeKeys.length === 0) {
      return <span>{line}</span>;
    }

    // Sort keys by length descending to match longer phrases first
    const sortedKeys = [...rhymeKeys].sort((a, b) => b.length - a.length);

    // Create regex matching any rhyme key
    const pattern = new RegExp(`(${sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = line.split(pattern);

    return (
      <span>
        {parts.map((part, i) => {
          const matchedKey = sortedKeys.find(k => k.toLowerCase() === part.toLowerCase());
          if (matchedKey) {
            const label = stanza.rhymeMapping[matchedKey];
            const theme = RHYME_COLORS[label] || RHYME_COLORS['A'];
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg font-bold border ${theme.bg} ${theme.text} ${theme.border} shadow-xs`}
              >
                {part}
                <span className="text-[10px] px-1 bg-white/70 rounded-full font-mono font-black">
                  {label}
                </span>
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const handleMarkRemembered = () => {
    setMarkedRemembered(true);
    onSuccessPart();
  };

  return (
    <div className="space-y-6">
      {/* Mode navigation / hint */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-semibold text-amber-900">
            Thẻ Flashcard 2 mặt: Mặt 1 là Thơ & Vần điệu - Mặt 2 là Hình tượng thị giác gợi nhớ
          </span>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
          {isFlipped ? 'Xem Mặt 1 (Thơ & Vần)' : 'Lật Mặt 2 (Hình tượng)'}
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <div className="relative min-h-[340px] perspective-1000">
        {!isFlipped ? (
          /* FRONT SIDE: POEM VERSES & RHYMES */
          <div className="paper-card p-6 sm:p-10 rounded-3xl space-y-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-orange-600" />
                Mặt 1: Câu thơ & Bản đồ vần
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
                Khổ số {stanza.stanzaIndex}
              </span>
            </div>

            <div className="space-y-4 py-2">
              {stanza.lines.map((line, idx) => (
                <div key={idx} className="flex items-baseline gap-3 text-lg sm:text-xl font-poem leading-relaxed">
                  <span className="text-xs font-mono text-amber-700/60 select-none">
                    0{idx + 1}
                  </span>
                  <div className="text-stone-800">{renderHighlightedLine(line)}</div>
                </div>
              ))}
            </div>

            {/* Rhyme mapping summary */}
            {Object.keys(stanza.rhymeMapping || {}).length > 0 && (
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/60 space-y-2">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  Sơ đồ gieo vần của khổ:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stanza.rhymeMapping).map(([word, schemeKey]) => {
                    const theme = RHYME_COLORS[schemeKey] || RHYME_COLORS['A'];
                    return (
                      <span
                        key={word}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        "{word}" → Vần <strong className="font-mono">{schemeKey}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BACK SIDE: VISUAL CUE & MENTAL ANCHORS */
          <div className="bg-gradient-to-br from-amber-100/90 via-orange-50 to-amber-50 p-6 sm:p-10 rounded-3xl border border-orange-200 shadow-warm space-y-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                Mặt 2: Hình tượng nghệ thuật gợi nhớ (Visual Cue)
              </span>
              <span className="text-xs bg-orange-200/60 text-orange-900 px-2.5 py-1 rounded-full font-medium">
                Mỏ neo ký ức
              </span>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-white/90 p-6 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-amber-700 tracking-wider block mb-1">
                  Hình ảnh tâm trí:
                </span>
                <p className="text-lg sm:text-xl font-poem italic font-medium text-stone-800 leading-relaxed">
                  "{stanza.visualCue || 'Hình dung bối cảnh không gian và cảm xúc của khổ thơ này...'}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-200/40 border border-amber-300/60 text-xs sm:text-sm text-stone-700 space-y-2">
                <p className="font-semibold text-amber-950">
                  Phương pháp ghi nhớ bằng hình tượng (Visual Mnemonics):
                </p>
                <p>
                  Hãy nhắm mắt lại trong 5 giây và vẽ nên bức tranh trên trong tâm trí. Khi não bộ liên kết câu chữ với hình ảnh giàu tính cảm xúc, thời gian lưu giữ thông tin trong trí nhớ dài hạn sẽ tăng gấp 3 lần!
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleMarkRemembered}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                  markedRemembered
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 active:scale-95'
                }`}
              >
                {markedRemembered ? 'Đã khắc sâu hình tượng!' : 'Tôi đã in sâu hình ảnh này'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
