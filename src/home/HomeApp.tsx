import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroHeader from './components/HeroHeader';
import SearchBar from './components/SearchBar';
import AppGrid from './components/AppGrid';

export default function HomeApp() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    function checkAdmin() {
      try {
        const raw = localStorage.getItem('nd_user');
        if (raw) {
          const u = JSON.parse(raw);
          setIsAdmin(u.role === 'admin' || u.adminLevel === 'owner');
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    window.addEventListener('nd-auth-state-changed', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('nd-auth-state-changed', checkAdmin);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 font-sans relative overflow-x-hidden flex flex-col items-center">
      
      {/* Universal Recreated Shared Navbar */}
      <Navbar />

      {/* Ambient Animated Background Blobs */}
      <div 
        className="fixed -top-24 -left-24 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-blue-400/25 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" 
        aria-hidden="true" 
      />
      <div 
        className="fixed -bottom-24 -right-24 w-96 sm:w-[550px] h-96 sm:h-[550px] rounded-full bg-sky-300/25 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" 
        aria-hidden="true" 
      />
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-300/15 blur-[120px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Main Content Layout */}
      <main className="w-full flex-1 flex flex-col items-center pb-16">
        
        {/* Top Hero Section */}
        <HeroHeader />

        {/* Multi-Engine & Instant Repository Search Tool */}
        <SearchBar onSearchActiveChange={setIsSearchActive} />

        {/* Admin Quick Portal Access (Only for Admin Role) */}
        {!isSearchActive && isAdmin && (
          <div className="w-full max-w-[1000px] px-4 mt-8 sm:mt-9 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/70 border border-amber-300 px-2 py-0.5 rounded-full">
                      Dành cho Quản trị viên
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">Hệ thống Quản trị ND Labs</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Truy cập trung tâm quản lý hệ thống, phân quyền người dùng và kiểm soát dữ liệu.</p>
                </div>
              </div>
              <a
                href="/admin/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all flex-shrink-0"
              >
                <Settings size={15} />
                <span>Vào Bảng Quản Trị</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Applications Catalog (hidden or dimmed if user is actively searching) */}
        {!isSearchActive && (
          <AppGrid />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto py-8 text-center text-xs font-semibold text-slate-400 border-t border-slate-200/80">
        © 2026 ND Labs. All rights reserved.
      </footer>
    </div>
  );
}
