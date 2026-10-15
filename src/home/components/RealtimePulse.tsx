import React, { useState, useEffect } from 'react';
import { Activity, Bell, RefreshCw, Zap } from 'lucide-react';
import { RealtimeAnnouncement } from '../types';

export default function RealtimePulse() {
  const [isConnected, setIsConnected] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] = useState<RealtimeAnnouncement | null>(null);
  const [reloadCountdown, setReloadCountdown] = useState<number | null>(null);

  useEffect(() => {
    let unsubscribeConnected: (() => void) | null = null;
    let unsubscribeTrigger: (() => void) | null = null;
    let unsubscribeReload: (() => void) | null = null;

    async function initRealtime() {
      if (!(window as any).firebaseDb) return;

      try {
        const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
        const db = (window as any).firebaseDb;

        // 1. Connection Status
        const connectedRef = ref(db, '.info/connected');
        const unsubConn = onValue(connectedRef, (snap: any) => {
          setIsConnected(Boolean(snap.val()));
        });
        unsubscribeConnected = () => unsubConn();

        // 2. Realtime Notification Trigger
        const triggerRef = ref(db, 'notifications_trigger');
        const unsubTrigger = onValue(triggerRef, (snap: any) => {
          const val = snap.val();
          if (val && val.title) {
            setLatestAnnouncement({
              id: String(val.timestamp || Date.now()),
              title: val.title,
              info: val.info || '',
              date: val.date,
              time: val.time,
              color: val.color
            });
          }
        });
        unsubscribeTrigger = () => unsubTrigger();

        // 3. System Reload Broadcast Listener
        const reloadRef = ref(db, 'system_commands/reload');
        let firstLoad = true;
        const unsubReload = onValue(reloadRef, (snap: any) => {
          if (firstLoad) {
            firstLoad = false;
            return;
          }
          const data = snap.val();
          if (data && data.timestamp && Date.now() - data.timestamp < 10000) {
            setReloadCountdown(3);
          }
        });
        unsubscribeReload = () => unsubReload();
      } catch (err) {
        // Fallback
      }
    }

    if ((window as any).firebaseDb) {
      initRealtime();
    } else {
      window.addEventListener('firebase-ready', initRealtime);
    }

    return () => {
      if (unsubscribeConnected) unsubscribeConnected();
      if (unsubscribeTrigger) unsubscribeTrigger();
      if (unsubscribeReload) unsubscribeReload();
      window.removeEventListener('firebase-ready', initRealtime);
    };
  }, []);

  // Handle reload countdown
  useEffect(() => {
    if (reloadCountdown === null) return;
    if (reloadCountdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => {
      setReloadCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [reloadCountdown]);

  return (
    <>
      {/* Realtime Status Bar */}
      <div className="w-full max-w-[1000px] mx-auto px-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-sm">
          
          {/* Left: Server Connection Pulse */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Activity size={13} className={isConnected ? 'text-emerald-600' : 'text-amber-600'} />
              <span>{isConnected ? 'Hệ thống: Trực tuyến' : 'Đang kết nối lại...'}</span>
            </div>
          </div>

          {/* Right: Realtime Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10.5px] font-extrabold uppercase tracking-wider">
              <Zap size={11} className="fill-blue-500 text-blue-500" />
              <span>Đồng bộ Realtime</span>
            </div>
          </div>
        </div>

        {/* Live Announcement Banner if present */}
        {latestAnnouncement && (
          <div className="mt-3 p-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-200/80 backdrop-blur-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
                <Bell size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    Mới cập nhật
                  </span>
                  {latestAnnouncement.time && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {latestAnnouncement.time}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  {latestAnnouncement.title}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLatestAnnouncement(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Realtime Admin Reload Modal */}
      {reloadCountdown !== null && (
        <div className="fixed inset-0 z-[300000] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
              <RefreshCw size={28} className="animate-spin text-rose-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              Lệnh Cập Nhật Hệ Thống
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Trang web đang đồng bộ dữ liệu mới nhất từ quản trị viên. Tự động tải lại sau{' '}
              <span className="font-extrabold text-rose-600 text-sm">{reloadCountdown}</span> giây...
            </p>
            <button
              type="button"
              onClick={() => setReloadCountdown(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Hủy tải lại
            </button>
          </div>
        </div>
      )}
    </>
  );
}
