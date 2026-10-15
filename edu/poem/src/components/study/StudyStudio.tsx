import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  Shuffle, 
  Music, 
  FileText, 
  Trophy, 
  CheckCircle, 
  Heart, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Bot,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Poem, StudyMode, StudyProgress, UserProfile } from '../../types';
import { ClozeMode } from './ClozeMode';
import { FirstLetterMode } from './FirstLetterMode';
import { RhythmBeatMode } from './RhythmBeatMode';
import { FlashcardVisualMode } from './FlashcardVisualMode';
import { ScrambleMode } from './ScrambleMode';
import { 
  getStudyProgress, 
  updateStudyProgress, 
  toggleLikePoem, 
  toggleSavePoem, 
  getGeminiKey 
} from '../../services/storage';
import { generatePoetryCritique } from '../../services/gemini';

interface StudyStudioProps {
  poem: Poem;
  user: UserProfile;
  onBack: () => void;
  onOpenComments: () => void;
  onOpenShare?: (poem: Poem) => void;
}

export const StudyStudio: React.FC<StudyStudioProps> = ({ poem, user, onBack, onOpenComments, onOpenShare }) => {
  const [activeMode, setActiveMode] = useState<StudyMode>('cloze');
  const [currentStanzaIndex, setCurrentStanzaIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [isLiked, setIsLiked] = useState(poem.likedBy?.includes(user.uid) || false);
  const [isSaved, setIsSaved] = useState(user.savedPoemIds?.includes(poem.id) || false);
  const [aiCritique, setAiCritique] = useState(poem.meaning || '');
  const [isLoadingCritique, setIsLoadingCritique] = useState(false);

  const currentStanza = poem.stanzas[currentStanzaIndex] || poem.stanzas[0];

  useEffect(() => {
    getStudyProgress(poem.id, user.uid).then(prog => {
      if (prog) {
        setProgress(prog);
      } else {
        setProgress({
          poemId: poem.id,
          status: 'learning',
          masteryScore: 10,
          lastPracticed: new Date().toISOString()
        });
      }
    });
  }, [poem.id, user.uid]);

  const handleScoreBoost = (points: number = 15) => {
    const curScore = progress?.masteryScore || 10;
    const newScore = Math.min(100, curScore + points);

    updateStudyProgress(poem.id, user.uid, {
      masteryScore: newScore
    }).then(updated => {
      setProgress(updated);
      if (newScore === 100) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.5 }
        });
      }
    });
  };

  const handleMarkMastered = () => {
    updateStudyProgress(poem.id, user.uid, {
      masteryScore: 100,
      status: 'mastered'
    }).then(updated => {
      setProgress(updated);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 }
      });
    });
  };

  const handleToggleLike = async () => {
    const nextState = await toggleLikePoem(poem.id, user.uid);
    setIsLiked(nextState);
  };

  const handleToggleSave = () => {
    const nextState = toggleSavePoem(poem.id);
    setIsSaved(nextState);
  };

  const handleRequestAiCritique = async () => {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      alert('Vui lòng vào Cài đặt để nhập Gemini API Key miễn phí để kích hoạt tính năng Giáo viên AI giảng bình!');
      return;
    }
    setIsLoadingCritique(true);
    try {
      const text = await generatePoetryCritique(poem.title, poem.author, poem.stanzas, apiKey);
      if (text) setAiCritique(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCritique(false);
    }
  };

  const masteryPercent = progress?.masteryScore || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-amber-200/70 shadow-warm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-amber-100/70 hover:bg-orange-100 text-stone-700 hover:text-orange-700 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-poem font-bold text-stone-900">
                {poem.title}
              </h1>
              {poem.genre && (
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
                  {poem.genre}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Tác giả: <span className="font-semibold text-stone-800">{poem.author}</span>
            </p>
          </div>
        </div>

        {/* Quick social actions & Mastery badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLike}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isLiked
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-amber-200 text-stone-600 hover:border-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{poem.likesCount + (isLiked ? 1 : 0)}</span>
          </button>

          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-2xl border transition-all ${
              isSaved
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-white border-amber-200 text-stone-600 hover:border-amber-400'
            }`}
            title="Lưu vào Sổ tay thơ"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
          </button>

          <button
            onClick={onOpenComments}
            className="p-2.5 rounded-2xl bg-white border border-amber-200 text-stone-600 hover:border-amber-400 hover:text-orange-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Bình luận và cảm nhận"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Cảm nhận</span>
          </button>

          {onOpenShare && (
            <button
              onClick={() => onOpenShare(poem)}
              className="p-2.5 rounded-2xl bg-white border border-amber-200 text-stone-600 hover:border-amber-400 hover:text-orange-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Chia sẻ & Bảo mật bài thơ"
            >
              <Share2 className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          )}

          <div className="h-6 w-[1px] bg-amber-200 hidden sm:block" />

          {/* Progress bar */}
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200/80">
            <Trophy className={`w-4 h-4 ${masteryPercent >= 90 ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
            <div className="text-xs">
              <div className="font-bold text-stone-800">{masteryPercent}% thuộc bài</div>
              <div className="w-16 h-1.5 bg-amber-200 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stanza pagination selector */}
      <div className="flex items-center justify-between bg-amber-100/50 p-3 rounded-2xl border border-amber-200/60">
        <button
          onClick={() => setCurrentStanzaIndex(Math.max(0, currentStanzaIndex - 1))}
          disabled={currentStanzaIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-stone-700 disabled:opacity-40 disabled:hover:bg-white/80 text-xs font-semibold border border-amber-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Khổ trước
        </button>

        <div className="flex items-center gap-1.5">
          {poem.stanzas.map((st, i) => (
            <button
              key={st.stanzaIndex || i}
              onClick={() => setCurrentStanzaIndex(i)}
              className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all ${
                currentStanzaIndex === i
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105'
                  : 'bg-white/90 text-stone-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-xs text-stone-500 font-medium ml-2 hidden sm:inline">
            (Tổng {poem.stanzas.length} khổ)
          </span>
        </div>

        <button
          onClick={() => setCurrentStanzaIndex(Math.min(poem.stanzas.length - 1, currentStanzaIndex + 1))}
          disabled={currentStanzaIndex === poem.stanzas.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-stone-700 disabled:opacity-40 disabled:hover:bg-white/80 text-xs font-semibold border border-amber-200 transition-colors"
        >
          Khổ tiếp
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Study Modes Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(
          [
            ['cloze', '1. Lấp chỗ trống', HelpCircle, 'Điền từ vần / thử thách gõ'],
            ['first-letter', '2. Chữ cái đầu', FileText, 'Kích hoạt phản xạ não bộ'],
            ['rhythm', '3. Ngắt nhịp Karaoke', Music, 'Đọc theo phách & giọng AI'],
            ['flashcard', '4. Flashcard 2 mặt', Sparkles, 'Vần điệu & Hình tượng visual'],
            ['scramble', '5. Ghép đảo dòng', Shuffle, 'Xếp đúng trật tự các câu']
          ] as const
        ).map(([m, label, Icon, sub]) => {
          const isActive = activeMode === m;
          return (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-transparent shadow-lg shadow-orange-500/20 scale-[1.02]'
                  : 'bg-white/80 hover:bg-amber-100/60 text-stone-700 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-stone-900'}`}>
                  {label}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-orange-500'}`} />
              </div>
              <span className={`text-[11px] leading-tight ${isActive ? 'text-amber-100' : 'text-stone-500'}`}>
                {sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Mode Content */}
      <div className="pt-2">
        {activeMode === 'cloze' && (
          <ClozeMode stanza={currentStanza} onSuccessPart={() => handleScoreBoost(10)} />
        )}
        {activeMode === 'first-letter' && (
          <FirstLetterMode stanza={currentStanza} onSuccessPart={() => handleScoreBoost(15)} />
        )}
        {activeMode === 'rhythm' && (
          <RhythmBeatMode stanza={currentStanza} onSuccessPart={() => handleScoreBoost(12)} />
        )}
        {activeMode === 'flashcard' && (
          <FlashcardVisualMode stanza={currentStanza} onSuccessPart={() => handleScoreBoost(15)} />
        )}
        {activeMode === 'scramble' && (
          <ScrambleMode stanza={currentStanza} onSuccessPart={() => handleScoreBoost(20)} />
        )}
      </div>

      {/* Literary Tutor / Gemini AI Critique Section */}
      <div className="bg-amber-100/50 p-6 rounded-3xl border border-amber-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Góc Bình Giảng Thơ Ca & Gợi Ý Cảm Thụ
              </h3>
              <p className="text-xs text-stone-600">
                Phân tích ý nghĩa nghệ thuật và bối cảnh lịch sử tác phẩm
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestAiCritique}
            disabled={isLoadingCritique}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoadingCritique ? 'Đang hỏi Gemini...' : 'Nhờ AI Giảng bình sâu hơn'}
          </button>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl border border-amber-200 text-sm font-poem text-stone-800 leading-relaxed whitespace-pre-line">
          {aiCritique || 'Đang cập nhật phân tích văn học cho bài thơ này... Bạn có thể bấm "Nhờ AI Giảng bình sâu hơn" để Gemini phân tích chi tiết bối cảnh và nghệ thuật.'}
        </div>
      </div>

      {/* Finish / Mastered Button */}
      <div className="text-center pt-4">
        <button
          onClick={handleMarkMastered}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          Tôi đã thuộc làu bài thơ này! (Đánh dấu 100%)
        </button>
      </div>
    </div>
  );
};
