import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Share2, Check } from 'lucide-react';

export default function HeroHeader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Welcome Toast on load
  useEffect(() => {
    setToastMessage('Chào mừng bạn trở lại ND Labs! 🎵');
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy fallback
      });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Trang chủ ND Labs: ${shareUrl}`).then(() => {
        setToastMessage('Đã sao chép liên kết ND Labs!');
        setTimeout(() => setToastMessage(null), 3000);
      });
    }
  };

  return (
    <>
      {/* Background Audio */}
      <audio ref={audioRef} src="/assets/audio/nhacnen.mp3" loop preload="none" />

      {/* Floating Welcome / Action Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200000] px-5 py-2.5 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar (Music controls + Share) */}
      <div className="w-full max-w-[1000px] flex items-center justify-between pt-4 px-2">
        {/* Left: Music & Volume */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleMusic}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
            className="w-10 h-10 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={18} className="text-blue-600" /> : <Play size={18} className="ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-xl px-3 h-10 shadow-sm backdrop-blur-md">
            <Volume2 size={15} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              title="Âm lượng"
              className="w-16 sm:w-20 h-1.5 accent-blue-600 cursor-pointer rounded-lg bg-slate-200"
            />
          </div>
        </div>

        {/* Right: Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Chia sẻ trang web"
          className="w-10 h-10 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="text-center mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="relative w-32 h-32 mx-auto mb-5 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
          <img
            src="/assets/images/avatar.png"
            alt="ND Labs Avatar"
            className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent mb-3">
          ND LABS
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed px-4 mb-5">
          Bộ công cụ sáng tạo &amp; giáo dục toàn diện của ND Labs. Khám phá, học tập và trải nghiệm các tiện ích trực tuyến.
        </p>

        {/* Social Row */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://facebook.com/ndlabs.nd"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all group"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
              alt="Facebook"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
          </a>
          <a
            href="https://m.me/ndlabs.nd"
            target="_blank"
            rel="noopener noreferrer"
            title="Messenger"
            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all group"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
              alt="Messenger"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
          </a>
          <a
            href="mailto:contact@ndsite.web.app"
            title="Email"
            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all group"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg"
              alt="Email"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
          </a>
        </div>
      </div>
    </>
  );
}
