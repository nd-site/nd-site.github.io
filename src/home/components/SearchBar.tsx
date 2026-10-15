import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ArrowLeft, ExternalLink } from 'lucide-react';
import { SearchResultItem } from '../types';

const ENGINES = {
  google: {
    name: 'Google',
    img: '/assets/images/logogoogle.png',
    url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  },
  bing: {
    name: 'Bing',
    img: '/assets/images/logobing.png',
    url: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
  },
  duck: {
    name: 'DuckDuckGo',
    img: '/assets/images/logoduckduckgo.png',
    url: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  }
};

type EngineKey = keyof typeof ENGINES;

interface SearchBarProps {
  onSearchActiveChange?: (active: boolean) => void;
}

export default function SearchBar({ onSearchActiveChange }: SearchBarProps) {
  const [selectedEngine, setSelectedEngine] = useState<EngineKey>('google');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searchDb, setSearchDb] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load and cache GitHub repositories tree for ND Labs tools
  useEffect(() => {
    async function loadIndex() {
      const cached = localStorage.getItem('nd_search_cache_v2');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (Date.now() - data.timestamp < 86400000 && Array.isArray(data.database)) {
            setSearchDb(data.database);
            return;
          }
        } catch (_) {}
      }

      // Default curated items if offline / rate limited
      const defaultItems: SearchResultItem[] = [
        { title: 'EDUND', url: '/edu/', repo: 'eduspace' },
        { title: 'THỜI KHÓA BIỂU', url: '/edu/timetable/', repo: 'eduspace' },
        { title: 'MINI WORLD MANAGEMENT', url: '/games/miniworld/', repo: 'games' },
        { title: 'HEARTSPACE DNA AI', url: 'https://dnaai-site.vercel.app', repo: 'heartspace' },
        { title: 'HỆ THỐNG QUẢN TRỊ ADMIN', url: '/admin/', repo: 'admin' },
        { title: 'EDUND ADMIN KHẢO THÍ', url: '/admin/edu/', repo: 'admin' },
        { title: 'ĐĂNG NHẬP NDID', url: '/auth/login/', repo: 'auth' },
        { title: 'CÀI ĐẶT TÀI KHOẢN', url: '/auth/settings/', repo: 'auth' }
      ];

      try {
        const repos = ['nd-site.github.io', 'test', 'eduspace', 'hoctap'];
        const temp: SearchResultItem[] = [...defaultItems];

        for (const repo of repos) {
          try {
            const res = await fetch(`https://api.github.com/repos/nd-site/${repo}/git/trees/main?recursive=1`);
            if (res.ok) {
              const data = await res.json();
              if (data.tree) {
                data.tree
                  .filter((f: any) => f.path.endsWith('.html'))
                  .forEach((f: any) => {
                    const base = repo === 'nd-site.github.io' ? '/' : `/${repo}/`;
                    temp.push({
                      title: f.path.split('/').pop().replace('.html', '').toUpperCase(),
                      url: base + f.path,
                      repo: repo
                    });
                  });
              }
            }
          } catch (_) {}
        }

        setSearchDb(temp);
        localStorage.setItem('nd_search_cache_v2', JSON.stringify({ timestamp: Date.now(), database: temp }));
      } catch (_) {
        setSearchDb(defaultItems);
      }
    }

    loadIndex();
  }, []);

  // Filter results on query change
  useEffect(() => {
    const val = query.trim().toLowerCase();
    if (val.length > 0) {
      setIsSearching(true);
      onSearchActiveChange?.(true);
      const matches = searchDb.filter(i => 
        i.title.toLowerCase().includes(val) || i.repo.toLowerCase().includes(val)
      ).slice(0, 10);
      setResults(matches);
    } else {
      setIsSearching(false);
      onSearchActiveChange?.(false);
      setResults([]);
    }
  }, [query, searchDb, onSearchActiveChange]);

  // Outside click for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLaunchSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const targetUrl = ENGINES[selectedEngine].url(trimmed);
    window.open(targetUrl, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLaunchSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
    onSearchActiveChange?.(false);
    setResults([]);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto mt-6 z-40 relative px-2">
      {/* Search Input Box */}
      <div className="relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_40px_-15px_rgba(0,112,243,0.12)] hover:shadow-[0_25px_50px_-15px_rgba(0,112,243,0.18)] transition-all">
        
        {/* Engine Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-bold text-slate-700 select-none"
          >
            <img
              src={ENGINES[selectedEngine].img}
              alt={ENGINES[selectedEngine].name}
              className="w-4 h-4 object-contain"
            />
            <span className="hidden sm:inline">{ENGINES[selectedEngine].name}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {/* Engine Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-12 left-0 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {(Object.keys(ENGINES) as EngineKey[]).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedEngine(key);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    selectedEngine === key ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img src={ENGINES[key].img} alt={ENGINES[key].name} className="w-4 h-4 object-contain" />
                  <span>{ENGINES[key].name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm công cụ hoặc Web..."
          className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Clear Button if text entered */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        )}

        {/* Go / Submit Search */}
        <button
          type="button"
          onClick={handleLaunchSearch}
          title="Tìm kiếm ngay"
          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all flex-shrink-0"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Instant Search Results Panel */}
      {isSearching && (
        <div className="mt-4 p-4 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Search size={14} className="text-blue-600" />
              Kết quả tìm kiếm nội bộ ND Labs ({results.length})
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Quay lại trang chủ</span>
            </button>
          </div>

          {results.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-semibold">
              Không tìm thấy công cụ nội bộ phù hợp. Bấm Enter để tìm trên {ENGINES[selectedEngine].name}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto">
              {results.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1.5">
                      <span>{item.title}</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.url}
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">
                    {item.repo}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Prompt to Search on Selected Engine */}
          <div className="mt-3 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleLaunchSearch}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
            >
              <img src={ENGINES[selectedEngine].img} alt="engine" className="w-3.5 h-3.5" />
              <span>Tìm kiếm "{query}" trên {ENGINES[selectedEngine].name} ↗</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
