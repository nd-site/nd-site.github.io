import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Music, Image as ImageIcon } from 'lucide-react';
import type { ContentBlock, SourceSet } from '../types.ts';

interface SourceContextPanelProps {
  sourceSet: SourceSet;
  className?: string;
}

export const SourceContextPanel: React.FC<SourceContextPanelProps> = ({
  sourceSet,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!sourceSet) return null;

  return (
    <div className={`bg-amber-50/50 border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs mb-6 ${className}`}>
      {/* Panel Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-amber-100/60 cursor-pointer select-none transition hover:bg-amber-100/80"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            {sourceSet.metadata?.isListeningAudio ? <Music className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {sourceSet.metadata?.isListeningAudio ? 'Tài liệu nghe' : 'Ngữ liệu dùng chung'}
              </span>
              {sourceSet.metadata?.author && (
                <span className="text-xs text-amber-700/80">({sourceSet.metadata.author})</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-amber-950 leading-tight">
              {sourceSet.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          className="text-amber-800 hover:text-amber-950 p-1 rounded-lg transition"
          aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Panel Body */}
      {isExpanded && (
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto bg-white/70">
          {sourceSet.description && (
            <p className="text-xs text-slate-500 italic pb-2 border-b border-amber-100">
              {sourceSet.description}
            </p>
          )}

          {sourceSet.blocks?.map((block: ContentBlock) => (
            <div key={block.id} className="text-sm text-slate-800">
              {/* 1. Text & Markdown */}
              {(block.type === 'text' || block.type === 'markdown') && (
                <div className="leading-relaxed whitespace-pre-wrap font-serif text-[15px] text-slate-800">
                  {block.content}
                </div>
              )}

              {/* 2. Audio Block */}
              {block.type === 'audio' && block.url && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Music className="w-4 h-4 text-indigo-600" />
                    <span>File âm thanh đính kèm</span>
                  </div>
                  <audio controls className="w-full h-10" preload="metadata">
                    <source src={block.url} />
                    Trình duyệt của bạn không hỗ trợ phát âm thanh.
                  </audio>
                  {block.caption && (
                    <span className="text-xs text-slate-500 text-center">{block.caption}</span>
                  )}
                </div>
              )}

              {/* 3. Image Block */}
              {block.type === 'image' && block.url && (
                <div className="flex flex-col items-center gap-1.5 my-3">
                  <img
                    src={block.url}
                    alt={block.altText || block.caption || 'Ngữ liệu hình ảnh'}
                    className="max-h-80 rounded-xl border border-slate-200 object-contain shadow-xs"
                  />
                  {block.caption && (
                    <span className="text-xs text-slate-500 italic">{block.caption}</span>
                  )}
                </div>
              )}

              {/* 4. Quote / Document Block */}
              {(block.type === 'quote' || block.type === 'document' || block.type === 'source') && (
                <blockquote className="border-l-4 border-amber-500 pl-4 py-1.5 bg-amber-50/40 rounded-r-lg italic text-slate-700 text-sm font-serif">
                  <p className="whitespace-pre-wrap">{block.content}</p>
                  {block.caption && (
                    <footer className="text-xs text-amber-800/80 font-sans not-italic mt-1 font-medium">
                      — {block.caption}
                    </footer>
                  )}
                </blockquote>
              )}

              {/* 5. Formula Block */}
              {block.type === 'formula' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-center text-indigo-900 text-sm overflow-x-auto">
                  {block.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
