import { Search, Heart, Code } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1fr,300px] gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600/10 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">AID</span>
            </div>
            <span className="text-slate-500 font-medium">EduSpace <span className="text-slate-400">by ND Labs.</span></span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 leading-tight">
            Nâng tầm kiến thức <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500">
              mỗi ngày của bạn
            </span>
          </h1>

          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 bg-white/80 hover:bg-white px-5 py-2.5 rounded-full text-sm font-medium text-rose-500 border border-rose-100 shadow-sm transition-all group">
              <Heart size={16} className="fill-rose-500 group-hover:scale-110 transition-transform" />
              HeartSpace by DNA AI
            </button>
            <button className="flex items-center gap-2 bg-white/80 hover:bg-white px-5 py-2.5 rounded-full text-sm font-medium text-emerald-600 border border-emerald-100 shadow-sm transition-all group">
              <Code size={16} className="group-hover:rotate-12 transition-transform" />
              Python Online
            </button>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên bài tập, chủ đề..."
              className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white border-none shadow-xl shadow-blue-500/5 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-600"
            />
          </div>
        </div>

        <div className="hidden md:block">
          {/* Stats Card Placeholder - will be rendered separately if needed or inside here */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-[2.5rem] card-shadow border border-white/40">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Personalized Learning Journey</p>
              
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * 75) / 100}
                    className="text-blue-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">75%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hoàn thành</span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 mb-1">Học kỳ II</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Lịch Sử 10</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                <div className="mt-3 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-400 transition-all"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
