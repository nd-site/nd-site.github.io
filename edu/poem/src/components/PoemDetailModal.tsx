import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Bookmark, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  Sparkles,
  Share2,
  Lock,
  MessageSquareOff
} from 'lucide-react';
import type { Poem, Comment, UserProfile } from '../types';
import { 
  fetchComments, 
  addCommentToPoem, 
  toggleLikePoem, 
  toggleSavePoem,
  canUserCommentPoem
} from '../services/storage';
import { speechService } from '../services/speech';

interface PoemDetailModalProps {
  poem: Poem | null;
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onStartStudy: (poem: Poem) => void;
  onOpenShare?: (poem: Poem) => void;
}

export const PoemDetailModal: React.FC<PoemDetailModalProps> = ({
  poem,
  isOpen,
  onClose,
  user,
  onStartStudy,
  onOpenShare
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isReadingPoem, setIsReadingPoem] = useState(false);

  useEffect(() => {
    if (!poem) return;
    setIsLiked((poem.likedBy || []).includes(user.uid));
    setLikesCount(poem.likesCount || 0);
    setIsSaved((user.savedPoemIds || []).includes(poem.id));

    fetchComments(poem.id).then(setComments);

    return () => {
      speechService.stop();
      setIsReadingPoem(false);
    };
  }, [poem, user.uid]);

  if (!isOpen || !poem) return null;

  const handleLike = async () => {
    const next = await toggleLikePoem(poem.id, user.uid);
    setIsLiked(next);
    setLikesCount(prev => prev + (next ? 1 : -1));
  };

  const handleSave = () => {
    const next = toggleSavePoem(poem.id);
    setIsSaved(next);
  };

  const handleReadFullPoem = () => {
    if (isReadingPoem) {
      speechService.stop();
      setIsReadingPoem(false);
      return;
    }

    const fullText = poem.stanzas.map(s => s.lines.join('. ')).join('. ... ');
    setIsReadingPoem(true);
    speechService.speak(fullText, {
      rate: 0.82,
      onEnd: () => setIsReadingPoem(false),
      onError: () => setIsReadingPoem(false)
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!canUserCommentPoem(poem)) {
      alert('Bài thơ này đã bị khóa hoặc tác giả đã tắt tính năng nhận xét.');
      return;
    }

    const added = await addCommentToPoem(poem.id, newComment, user);
    setComments(prev => [added, ...prev]);
    setNewComment('');
  };

  const canComment = canUserCommentPoem(poem);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-poem text-stone-900">
                {poem.title}
              </h2>
              {poem.genre && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  {poem.genre}
                </span>
              )}
              {poem.isLocked && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-600" />
                  Đã khóa
                </span>
              )}
            </div>
            <p className="text-sm text-amber-900/80 font-semibold mt-0.5">
              Tác giả: <span className="text-stone-700">{poem.author}</span>
              {poem.authorNdid && (
                <span className="ml-2 text-xs font-mono text-orange-700 font-normal">
                  (Đăng bởi: {poem.authorNdid})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenShare && (
              <button
                onClick={() => onOpenShare(poem)}
                className="p-2.5 rounded-2xl border border-amber-200 bg-white hover:bg-orange-50 text-stone-700 hover:text-orange-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Chia sẻ & Phân quyền bảo mật"
              >
                <Share2 className="w-4 h-4 text-orange-600" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            )}

            <button
              onClick={handleReadFullPoem}
              className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isReadingPoem
                  ? 'bg-orange-500 text-white animate-pulse border-orange-600'
                  : 'bg-white border-amber-200 text-stone-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Ngâm toàn bài thơ"
            >
              {isReadingPoem ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isReadingPoem ? 'Dừng đọc' : 'Ngâm thơ'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Lock notice if locked */}
          {poem.isLocked && (
            <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Bài thơ này đang được khóa nội dung. Quyền sửa và gửi nhận xét mới tạm thời đóng băng.</span>
            </div>
          )}

          {/* Main poem presentation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 cols: Full Poem Stanzas */}
            <div className="md:col-span-2 space-y-6">
              {poem.stanzas.map((stanza, sIdx) => (
                <div 
                  key={stanza.stanzaIndex || sIdx}
                  className="paper-card p-6 rounded-2xl space-y-3 border border-amber-200/60"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-amber-100 pb-2">
                    <span className="font-semibold text-amber-800">Khổ {stanza.stanzaIndex || sIdx + 1}</span>
                    <span className="bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-md font-mono">
                      Nhịp {stanza.rhythm}
                    </span>
                  </div>

                  <div className="space-y-1 py-1">
                    {stanza.lines.map((line, lIdx) => (
                      <p key={lIdx} className="text-lg font-poem text-stone-800 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>

                  {stanza.visualCue && (
                    <div className="mt-3 pt-3 border-t border-amber-100/80 text-xs text-amber-950 bg-amber-50/70 px-3 py-2 rounded-xl flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-orange-900">Hình tượng gợi nhớ: </strong>
                        <span>{stanza.visualCue}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right 1 col: Literary Analysis & Metadata */}
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/70 space-y-3">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Bình giảng & Ý nghĩa nghệ thuật
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {poem.meaning || 'Tác phẩm đang được cập nhật thêm lời bình giảng chi tiết từ AI và cộng đồng giáo viên văn.'}
                </p>
              </div>

              {poem.tags && poem.tags.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-amber-200/60 space-y-2">
                  <span className="text-xs font-bold text-stone-700">Chủ đề & Thẻ từ khóa:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {poem.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-amber-100/70 text-amber-900 text-xs rounded-lg font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Memorize CTA Card */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-2xl text-white space-y-3 shadow-md shadow-orange-500/20">
                <h4 className="font-bold text-base font-poem">Học thuộc thông minh</h4>
                <p className="text-xs text-amber-100 leading-relaxed">
                  Luyện tập điền khuyết vần điệu, trắc nghiệm chữ cái đầu câu và flashcard nghệ thuật giúp thuộc làu tác phẩm nhanh gấp 3 lần.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onStartStudy(poem);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-orange-700 font-bold text-xs hover:bg-amber-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Bắt đầu học thuộc ngay
                </button>
              </div>
            </div>
          </div>

          {/* Social Comments Section */}
          <div className="pt-4 border-t border-amber-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Cộng đồng thảo luận & cảm nhận ({comments.length})
            </h3>

            {/* Post comment form if allowed */}
            {canComment ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ cảm xúc hoặc mẹo ghi nhớ câu thơ tâm đắc của bạn..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-amber-50/60 rounded-2xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-stone-600 text-xs flex items-center gap-2">
                <MessageSquareOff className="w-4 h-4 text-stone-500 shrink-0" />
                <span>
                  {poem.isLocked 
                    ? 'Bài thơ đã bị khóa, tính năng gửi nhận xét tạm dừng.' 
                    : 'Tác giả đã tắt nhận xét cho bài thơ này.'}
                </span>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">
                  Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nhận về bài thơ!
                </p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <img
                      src={c.userAvatar || '/assets/images/logo.png'}
                      alt={c.userName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-200 shrink-0"
                    />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-800">{c.userName}</span>
                          {c.ndid && (
                            <span className="text-[10px] font-mono text-orange-700 bg-orange-100/70 px-1.5 py-0.2 rounded-md">
                              {c.ndid}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed font-sans">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isLiked
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-amber-200 text-stone-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleSave}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-amber-200 text-stone-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
              <span>{isSaved ? 'Đã lưu sổ' : 'Lưu vào sổ'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartStudy(poem);
            }}
            className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Học thuộc bài thơ này
          </button>
        </div>
      </div>
    </div>
  );
};
