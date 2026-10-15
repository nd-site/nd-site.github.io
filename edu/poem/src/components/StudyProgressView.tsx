import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import type { Poem, StudyProgress, UserProfile } from '../types';
import { getAllUserProgress } from '../services/storage';

interface StudyProgressViewProps {
  poems: Poem[];
  user: UserProfile;
  onSelectPoem: (poem: Poem) => void;
}

export const StudyProgressView: React.FC<StudyProgressViewProps> = ({
  poems,
  user,
  onSelectPoem
}) => {
  const [progressMap, setProgressMap] = useState<Record<string, StudyProgress>>({});

  useEffect(() => {
    getAllUserProgress(user.uid).then(setProgressMap);
  }, [user.uid]);

  const masteredPoems = poems.filter(p => (progressMap[p.id]?.masteryScore || 0) >= 90);
  const learningPoems = poems.filter(p => {
    const score = progressMap[p.id]?.masteryScore || 0;
    return score > 0 && score < 90;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner: Streak & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-warm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Chuỗi học tập liên tiếp
            </span>
            <div className="text-4xl font-black font-sans mt-1">
              {user.streakDays || 1} Ngày
            </div>
            <p className="text-xs text-orange-100 mt-1">
              Mỗi ngày học 1 khổ thơ để duy trì ngọn lửa đam mê!
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Flame className="w-9 h-9 text-amber-200 fill-amber-300 animate-pulse-subtle" />
          </div>
        </div>

        {/* Mastered poems count */}
        <div className="bg-white/90 rounded-3xl p-6 border border-amber-200 shadow-warm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Đã thuộc làu (100%)
            </span>
            <div className="text-4xl font-black text-emerald-600 font-sans mt-1">
              {masteredPoems.length}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Đã vượt qua tất cả các bài kiểm tra vần & nhịp
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        {/* Currently learning count */}
        <div className="bg-white/90 rounded-3xl p-6 border border-amber-200 shadow-warm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Đang rèn luyện
            </span>
            <div className="text-4xl font-black text-orange-600 font-sans mt-1">
              {learningPoems.length}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Đang tiếp tục các chế độ lấp chỗ trống & chữ cái đầu
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Poems Progress Detailed List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-poem text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" />
          Nhật ký tiến độ từng bài thơ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {poems.map(poem => {
            const prog = progressMap[poem.id];
            const score = prog?.masteryScore || 0;
            const isMastered = score >= 90;

            return (
              <div
                key={poem.id}
                onClick={() => onSelectPoem(poem)}
                className="bg-white/90 hover:bg-white p-5 rounded-3xl border border-amber-200 shadow-warm hover:shadow-warm-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                      {poem.genre || 'Thơ ca'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isMastered
                        ? 'bg-emerald-100 text-emerald-800'
                        : score > 0
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {isMastered ? 'Đã thuộc làu' : score > 0 ? `${score}% Đang học` : 'Chưa bắt đầu'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-poem text-stone-900 mt-2">
                    {poem.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Tác giả: {poem.author}
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>Mức độ ghi nhớ</span>
                    <span className="font-bold text-orange-700">{score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isMastered
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs text-stone-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {prog?.lastPracticed 
                      ? `Ôn lần cuối: ${new Date(prog.lastPracticed).toLocaleDateString('vi-VN')}`
                      : 'Chưa học bài này'}
                  </span>

                  <span className="text-orange-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Vào luyện tập
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
