/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrendingCard from './components/TrendingCard';
import SectionGrid from './components/SectionGrid';
import GradeExplorer from './components/GradeExplorer';
import AIAssistant from './components/AIAssistant';

export default function App() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <Navbar />
      
      <div className="relative animate-in fade-in duration-700">
        <Hero />
        <TrendingCard />
        <SectionGrid />
        <GradeExplorer />
        
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AID</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-800">ND Labs</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 EduSpace by ND Labs. Nâng tầm kiến thức mỗi ngày của bạn.</p>
          <div className="flex items-center gap-6">
             <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">Privacy</a>
             <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">Terms</a>
             <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">Contact</a>
          </div>
        </footer>
      </div>

      <AIAssistant />
    </main>
  );
}

