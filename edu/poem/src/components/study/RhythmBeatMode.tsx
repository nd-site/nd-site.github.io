import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Gauge } from 'lucide-react';
import type { Stanza } from '../../types';
import { speechService } from '../../services/speech';

interface RhythmBeatModeProps {
  stanza: Stanza;
  onSuccessPart: () => void;
}

export const RhythmBeatMode: React.FC<RhythmBeatModeProps> = ({ stanza, onSuccessPart }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(1000); // ms per rhythm beat
  const [withVoice, setWithVoice] = useState(true);
  const timerRef = useRef<any>(null);

  // Parse a line into segments based on rhythm (e.g. "4/3", "2/3", "2/2/3", "3/3")
  const splitByRhythm = (line: string, rhythm: string) => {
    const words = line.split(/\s+/).filter(Boolean);
    const cuts = rhythm.split('/').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));

    if (cuts.length === 0) {
      // Default half split
      const mid = Math.ceil(words.length / 2);
      return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(Boolean);
    }

    const segments: string[] = [];
    let start = 0;
    for (let count of cuts) {
      if (start >= words.length) break;
      const seg = words.slice(start, start + count).join(' ');
      if (seg) segments.push(seg);
      start += count;
    }

    if (start < words.length) {
      segments.push(words.slice(start).join(' '));
    }

    return segments.length > 0 ? segments : [line];
  };

  const parsedLines = stanza.lines.map(line => ({
    raw: line,
    segments: splitByRhythm(line, stanza.rhythm)
  }));

  // Auto-beat animation
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentSegmentIndex(prevSeg => {
        const lineSegs = parsedLines[currentLineIndex]?.segments || [];
        if (prevSeg + 1 < lineSegs.length) {
          return prevSeg + 1;
        } else {
          // Advance to next line
          setCurrentLineIndex(prevLine => {
            if (prevLine + 1 < parsedLines.length) {
              const nextLine = prevLine + 1;
              if (withVoice) {
                speechService.speak(parsedLines[nextLine].raw, { rate: 0.85 });
              }
              return nextLine;
            } else {
              // Reached end of stanza!
              setIsPlaying(false);
              onSuccessPart();
              return 0;
            }
          });
          return 0;
        }
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentLineIndex, speed, parsedLines, withVoice]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (withVoice) {
        speechService.speak(parsedLines[currentLineIndex].raw, { rate: 0.85 });
      }
    } else {
      setIsPlaying(false);
      speechService.stop();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    speechService.stop();
    setCurrentLineIndex(0);
    setCurrentSegmentIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                Tạm dừng nhịp
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Chạy nhịp Karaoke
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-stone-700 border border-amber-200 transition-colors"
            title="Bắt đầu lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Audio controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-amber-200">
            <Gauge className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-stone-600 font-medium">Tốc độ:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent font-semibold text-orange-700 outline-none cursor-pointer"
            >
              <option value={1400}>Chậm rãi (Ngâm thơ)</option>
              <option value={1000}>Vừa phải (Đọc nhịp)</option>
              <option value={700}>Nhanh (Phản xạ)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setWithVoice(!withVoice);
              if (withVoice) speechService.stop();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              withVoice
                ? 'bg-orange-100 text-orange-800 border-orange-300'
                : 'bg-white/80 text-stone-600 border-amber-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {withVoice ? 'Có giọng đọc' : 'Chỉ phách nhịp'}
          </button>
        </div>
      </div>

      {/* Rhythm Information Badge */}
      <div className="flex items-center gap-2 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/60 border border-amber-300 text-xs font-semibold text-amber-900">
          <Music className="w-3 h-3 text-orange-600" />
          Quy luật ngắt nhịp: <span className="font-bold text-orange-700">{stanza.rhythm}</span>
        </div>
        <span className="text-xs text-stone-500">
          (Đọc ngắt quãng nhẹ nhàng giữa các cụm nhịp để thơ có nhạc điệu)
        </span>
      </div>

      {/* Main Verses with Rhythmic Segments */}
      <div className="paper-card p-6 sm:p-8 rounded-3xl space-y-4">
        {parsedLines.map((lineObj, lineIdx) => {
          const isLineActive = isPlaying && currentLineIndex === lineIdx;

          return (
            <div
              key={lineIdx}
              className={`p-3.5 rounded-2xl transition-all duration-300 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLineActive
                  ? 'bg-amber-100/80 border-orange-300 shadow-sm'
                  : 'bg-white/40 border-amber-100 hover:bg-amber-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-amber-700/60 font-semibold select-none">
                  0{lineIdx + 1}
                </span>

                <div className="flex flex-wrap items-center gap-2 text-lg sm:text-xl font-poem">
                  {lineObj.segments.map((seg, segIdx) => {
                    const isSegActive = isLineActive && currentSegmentIndex === segIdx;

                    return (
                      <React.Fragment key={segIdx}>
                        <span
                          className={`px-3 py-1 rounded-xl transition-all duration-200 font-medium ${
                            isSegActive
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105'
                              : isLineActive
                              ? 'text-stone-800 bg-white/90'
                              : 'text-stone-800'
                          }`}
                        >
                          {seg}
                        </span>

                        {segIdx < lineObj.segments.length - 1 && (
                          <span className="text-orange-400 font-bold select-none text-sm px-0.5">
                            /
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Individual line play speech */}
              <button
                onClick={() => speechService.speak(lineObj.raw)}
                className="self-end sm:self-center p-1.5 rounded-lg text-amber-700 hover:text-orange-600 hover:bg-amber-200/50 transition-colors"
                title="Đọc câu này"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
