import { Search, Bell, User, MessageCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4 glass-morphism border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AID</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-800">ND Labs</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Trang Chủ</a>
            <a href="#" className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">EduSpace</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Game</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Media</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Tiện ích</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Psychology</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-white/50 rounded-full transition-all">
            <Search size={20} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-white/50 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-white/30">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Đăng nhập</span>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              ND10
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
