import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  expiresAt: string;
  serverNow?: string;
  onExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ expiresAt, serverNow, onExpire }) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const end = new Date(expiresAt).getTime();
    const start = serverNow ? new Date(serverNow).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 1000));
  });

  useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = remainingSeconds <= 60;
  const isWarning = remainingSeconds <= 300 && !isUrgent;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-sm font-semibold tracking-wider transition-all shadow-sm ${
        isUrgent
          ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
          : isWarning
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
      }`}
      title="Thời gian làm bài còn lại"
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
      <span>{formattedTime}</span>
    </div>
  );
};
