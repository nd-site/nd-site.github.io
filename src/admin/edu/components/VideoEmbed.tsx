import React from 'react';
import { Film } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  className?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, className = '' }) => {
  if (!url || !url.trim()) return null;

  const getEmbedUrl = (rawUrl: string): { type: 'youtube' | 'direct'; embedUrl: string } => {
    try {
      const trimmed = rawUrl.trim();
      // YouTube standard or short link
      const ytMatch = trimmed.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      if (ytMatch && ytMatch[1]) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
        };
      }
      return { type: 'direct', embedUrl: trimmed };
    } catch {
      return { type: 'direct', embedUrl: rawUrl };
    }
  };

  const { type, embedUrl } = getEmbedUrl(url);

  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200/90 bg-black/90 shadow-sm ${className}`}>
      {type === 'youtube' ? (
        <div className="relative w-full aspect-video">
          <iframe
            src={embedUrl}
            title="Video tư liệu câu hỏi"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <video
          src={embedUrl}
          controls
          className="w-full max-h-80 object-contain mx-auto"
        >
          Trình duyệt không hỗ trợ thẻ video.
        </video>
      )}
    </div>
  );
};
