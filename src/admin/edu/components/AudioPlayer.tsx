import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, AlertCircle, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  maxPlays?: number; // 0 hoặc undefined = Không giới hạn
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, maxPlays = 0, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedCurrentPlay, setHasStartedCurrentPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isLimited = maxPlays !== undefined && maxPlays > 0;
  const isExhausted = isLimited && playCount >= maxPlays && !isPlaying;

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (isExhausted) return;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (!hasStartedCurrentPlay) {
          setPlayCount((prev) => prev + 1);
          setHasStartedCurrentPlay(true);
        }
      }).catch((e) => {
        console.warn('Lỗi phát âm thanh:', e);
      });
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasStartedCurrentPlay(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!url || !url.trim()) return null;

  return (
    <div className={`flex items-center gap-3 p-2.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs ${className}`}>
      <audio
        ref={audioRef}
        src={url}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

      <button
        type="button"
        onClick={togglePlay}
        disabled={isExhausted}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isExhausted
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : isPlaying
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95'
        }`}
        title={isExhausted ? 'Đã hết lượt nghe' : isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Âm thanh câu hỏi</span>
          </span>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {isLimited && (
        <div
          className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
            isExhausted
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {isExhausted ? 'Hết lượt nghe' : `Lượt nghe: ${playCount}/${maxPlays}`}
        </div>
      )}
    </div>
  );
};
