import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../hooks/useFirebase';

interface UserSearchInputProps {
  value: string;
  onChange: (val: string, resolvedName?: string) => void;
  placeholder?: string;
  selectedName?: string;
  className?: string;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm theo Tên, NDID, CodeID...",
  selectedName,
  className = ""
}) => {
  const { firestore } = useFirebase();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Realtime search with debounce
  useEffect(() => {
    if (!value || value.trim().length < 1 || !firestore) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { collection, getDocs, query, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any);
        
        // Fetch users (or limited query)
        const q = query(collection(firestore, 'users'), limit(50));
        const snap = await getDocs(q);
        
        const term = value.toLowerCase().trim();
        const results: any[] = [];

        snap.forEach((doc: any) => {
          const u = doc.data();
          const ndid = (u.ndid || '').toLowerCase();
          const fullname = (u.fullname || u.displayName || '').toLowerCase();
          const codeId = (u.codeId || '').toLowerCase();

          if (ndid.includes(term) || fullname.includes(term) || codeId.includes(term)) {
            results.push({
              uid: doc.id,
              ndid: u.ndid || doc.id,
              fullname: u.fullname || u.displayName || u.ndid || 'ND Member',
              codeId: u.codeId || '',
              photoURL: u.photoURL || '',
              role: u.role || 'member'
            });
          }
        });

        setSuggestions(results.slice(0, 8));
        setIsOpen(results.length > 0);
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value, firestore]);

  const handleSelect = (user: any) => {
    onChange(user.ndid || user.uid, user.fullname);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {selectedName && (
        <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
          <span>✓</span> Đã chọn: {selectedName}
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in-50 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
            Kết quả gợi ý ({suggestions.length})
          </div>
          {suggestions.map(u => (
            <div
              key={u.uid}
              onClick={() => handleSelect(u)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  {u.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{u.fullname}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    NDID: {u.ndid} {u.codeId && `• Code: ${u.codeId}`}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                Chọn
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
