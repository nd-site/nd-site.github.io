import React, { useState } from 'react';
import { 
  Heart, 
  Bookmark, 
  BookOpen, 
  Sparkles, 
  Music, 
  Share2, 
  Trash2,
  CheckCircle2,
  Lock,
  EyeOff
} from 'lucide-react';
import { Poem, StudyProgress, UserProfile } from '../types';
import { toggleLikePoem, toggleSavePoem } from '../services/storage';

interface PoemCardProps {
  poem: Poem;
  user: UserProfile;
  progress?: StudyProgress | null;
  onSelectPoem: (poem: Poem) => void;
  onOpenDetail: (poem: Poem) => void;
  onOpenShare?: (poem: Poem) => void;
  onDeletePoem?: (id: string) => void;
}

export const PoemCard: React.FC<PoemCardProps> = ({
  poem,
  user,
  progress,
  onSelectPoem,
  onOpenDetail,
  onOpenShare,
  onDeletePoem
}) => {
  const [isLiked, setIsLiked] = useState((poem.likedBy || []).includes(user.uid));
  const [likesCount, setLikesCount] = useState(poem.likesCount || 0);
  const [isSaved, setIsSaved] = useState((user.savedPoemIds || []).includes(poem.id));

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = await toggleLikePoem(poem.id, user.uid);
    setIsLiked(nextState);
    setLikesCount(prev => prev + (nextState ? 1 : -1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = toggleSavePoem(poem.id);
    setIsSaved(nextState);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenShare) {
      onOpenShare(poem);
      return;
    }
    const origin = window.location.origin;
    const authorNdid = poem.authorNdid || poem.createdBy?.ndid || user.ndid || 'ndlabs';
    const link = `${origin}/edu/poem/${authorNdid}/${poem.slug || poem.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${poem.title} - ${poem.author} | PoemND`,
        text: `Học thuộc bài thơ "${poem.title}" của ${poem.author} trên PoemND!`,
        url: link
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link);
      alert('Đã sao chép liên kết chia sẻ bài thơ vào bộ nhớ tạm!');
    }
  };

  const firstStanza = poem.stanzas[0];
  const previewLines = firstStanza?.lines.slice(0, 3) || [];
  const masteryScore = progress?.masteryScore || 0;

  return (
    <div 
      onClick={() => onOpenDetail(poem)}
      className="group relative bg-white/90 hover:bg-white rounded-3xl p-6 border border-amber-200/80 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top meta tags */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {poem.genre && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/60">
                {poem.genre}
              </span>
            )}
            {firstStanza?.rhythm && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100/70 text-orange-800 flex items-center gap-1">
                <Music className="w-2.5 h-2.5" />
                Nhịp {firstStanza.rhythm}
              </span>
            )}
            {poem.isLocked && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1" title="Bài thơ đã khóa">
                <Lock className="w-2.5 h-2.5" />
                Đã khóa
              </span>
            )}
            {poem.visibility === 'private' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1" title="Bài thơ riêng tư">
                <EyeOff className="w-2.5 h-2.5" />
                Riêng tư
              </span>
            )}
          </div>

          {/* Mastery status badge */}
          {masteryScore > 0 ? (
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
              masteryScore >= 90
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{masteryScore}%</span>
            </div>
          ) : (
            <span className="text-[10px] text-stone-400 font-medium">Chưa học</span>
          )}
        </div>

        {/* Title & Author */}
        <h3 className="text-xl font-bold font-poem text-stone-900 group-hover:text-orange-600 transition-colors">
          {poem.title}
        </h3>
        <p className="text-xs text-amber-900/70 font-semibold mb-4">
          Tác giả: <span className="text-stone-700">{poem.author}</span>
        </p>

        {/* Verses Preview */}
        <div className="bg-amber-50/60 group-hover:bg-amber-50/90 p-4 rounded-2xl border border-amber-200/50 space-y-1 mb-4 transition-colors">
          {previewLines.map((line, idx) => (
            <p key={idx} className="text-sm font-poem text-stone-700 italic truncate">
              {line}
            </p>
          ))}
          {firstStanza?.lines.length > 3 && (
            <p className="text-[11px] font-sans text-stone-400 font-medium pt-1">
              + {poem.stanzas.reduce((acc, s) => acc + s.lines.length, 0) - 3} câu thơ tiếp theo...
            </p>
          )}
        </div>

        {/* Visual Cue Snippet */}
        {firstStanza?.visualCue && (
          <div className="text-xs text-amber-950/80 bg-orange-50/70 px-3 py-1.5 rounded-xl border border-orange-200/50 mb-4 line-clamp-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">Gợi nhớ: {firstStanza.visualCue}</span>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2">
        {/* Social actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold ${
              isLiked ? 'text-rose-600' : 'text-stone-500 hover:text-rose-500'
            }`}
            title="Thích bài thơ"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleSave}
            className={`p-1.5 rounded-xl transition-colors ${
              isSaved ? 'text-amber-600' : 'text-stone-500 hover:text-amber-600'
            }`}
            title="Lưu vào sổ thơ"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl text-stone-400 hover:text-orange-600 transition-colors"
            title="Chia sẻ & Bảo mật"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onDeletePoem && poem.createdBy?.uid === user.uid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Bạn có chắc muốn xóa bài thơ "${poem.title}"?`)) {
                  onDeletePoem(poem.id);
                }
              }}
              className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 transition-colors"
              title="Xóa bài thơ của bạn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Memorize CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPoem(poem);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Học thuộc</span>
        </button>
      </div>
    </div>
  );
};
