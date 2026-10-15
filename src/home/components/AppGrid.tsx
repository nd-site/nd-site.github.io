import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Heart, 
  Monitor, 
  Gamepad2, 
  Calendar, 
  FileCheck2, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { AppItem } from '../types';

const INITIAL_APPS: AppItem[] = [
  {
    id: 'eduspace',
    name: 'EduND',
    description: 'Nền tảng học tập & ôn luyện kiến thức trắc nghiệm toàn diện.',
    url: '/edu/',
    category: 'featured',
    icon: 'GraduationCap',
    gradient: 'from-blue-600 to-indigo-600',
    badge: 'Chính'
  },
  {
    id: 'heartspace',
    name: 'HeartSpace by DNA AI',
    description: 'Ứng dụng tâm lý và AI hỗ trợ tinh thần, cân bằng cuộc sống.',
    url: 'https://dnaai-site.vercel.app',
    category: 'featured',
    icon: 'Heart',
    gradient: 'from-rose-500 to-pink-500',
    external: true,
    badge: 'AI'
  },
  {
    id: 'timetable',
    name: 'Thời Khóa Biểu',
    description: 'Quản lý lịch học, thời khóa biểu trực quan và đồng bộ thời gian thực.',
    url: '/edu/timetable/',
    category: 'education',
    icon: 'Calendar',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'miniworld',
    name: 'Mini World Management',
    description: 'Trung tâm quản lý tổ chức, bản đồ và tài khoản thành viên Mini World.',
    url: '/games/miniworld/',
    category: 'explore',
    icon: 'Gamepad2',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'admin_system',
    name: 'Hệ thống Quản trị Admin',
    description: 'Bảng điều khiển quản lý toàn bộ người dùng, quyền hạn và cấu hình hệ thống.',
    url: '/admin/',
    category: 'featured',
    icon: 'ShieldCheck',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    badge: 'Admin'
  },
  {
    id: 'admin_edu',
    name: 'EduND Central Admin',
    description: 'Bảng điều khiển quản trị khảo thí & nội dung học tập dành cho Giáo viên.',
    url: '/admin/edu/',
    category: 'education',
    icon: 'ShieldCheck',
    gradient: 'from-violet-600 to-fuchsia-600',
    badge: 'Admin'
  }
];

export default function AppGrid() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'featured' | 'education' | 'explore'>('all');
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
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

  // Dynamic real-time sync with Firebase RTDB config if available
  useEffect(() => {
    async function loadDynamicApps() {
      try {
        if ((window as any).firebaseDb) {
          const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
          const appsRef = ref((window as any).firebaseDb, 'config/home/apps');
          onValue(appsRef, (snap: any) => {
            const data = snap.val();
            if (data && Array.isArray(data) && data.length > 0) {
              setApps(data);
            }
          });
        }
      } catch (_) {}
    }

    if ((window as any).firebaseDb) {
      loadDynamicApps();
    } else {
      window.addEventListener('firebase-ready', loadDynamicApps);
      return () => window.removeEventListener('firebase-ready', loadDynamicApps);
    }
  }, []);

  const filteredApps = apps
    .filter(item => {
      if ((item.id === 'admin_system' || item.id === 'admin_edu') && !isAdmin) return false;
      return true;
    })
    .filter(item => {
      if (activeCategory === 'all') return true;
      return item.category === activeCategory || (activeCategory === 'featured' && item.badge);
    });

  const renderIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap': return <GraduationCap size={28} className="text-white" />;
      case 'FileCheck2': return <FileCheck2 size={28} className="text-white" />;
      case 'Heart': return <Heart size={28} className="text-white" />;
      case 'Monitor': return <Monitor size={28} className="text-white" />;
      case 'Calendar': return <Calendar size={28} className="text-white" />;
      case 'Gamepad2': return <Gamepad2 size={28} className="text-white" />;
      case 'ShieldCheck': return <ShieldCheck size={28} className="text-white" />;
      default: return <Layers size={28} className="text-white" />;
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 mt-8">
      
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { key: 'all', label: 'Tất cả ứng dụng' },
          { key: 'featured', label: 'Nổi bật' },
          { key: 'education', label: 'Học tập' },
          { key: 'explore', label: 'Khám phá & Tiện ích' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === tab.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-blue-600 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredApps.map((app) => (
          <a
            key={app.id}
            href={app.url}
            target={app.external ? '_blank' : undefined}
            rel={app.external ? 'noopener noreferrer' : undefined}
            className="group p-5 rounded-2xl bg-white/80 hover:bg-white border border-white hover:border-blue-200/90 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_35px_-10px_rgba(0,112,243,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex items-start gap-4 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Ambient Background Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Vibrant Icon Box */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center flex-shrink-0 shadow-lg shadow-current/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              {renderIcon(app.icon)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {app.name}
                </span>
                {app.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {app.badge}
                  </span>
                )}
                {app.external && (
                  <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500 ml-auto flex-shrink-0" />
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {app.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
