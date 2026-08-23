import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';

export const MiniWorldProfileModal = () => {
  const { db, firestore, user, sessionUser } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);
  const [isChina, setIsChina] = useState(false);
  const [globalId, setGlobalId] = useState('');
  const [chinaId, setChinaId] = useState('');
  const [dobText, setDobText] = useState('—');
  const [isSaving, setIsSaving] = useState(false);

  const uid = user?.uid || sessionUser?.uid || sessionUser?.ndid;

  useEffect(() => {
    if (!uid) return;

    // Lấy ngày sinh từ session hoặc Firestore
    if (sessionUser?.dob) {
      if (sessionUser.dob.includes('-')) {
        const p = sessionUser.dob.split('-');
        setDobText(`${p[2]}/${p[1]}/${p[0]}`);
      } else {
        setDobText(sessionUser.dob);
      }
    } else if (sessionUser?.yob) {
      setDobText(`${sessionUser.yob}`);
    }

    const checkProfile = async () => {
      try {
        let profileData: any = null;

        // 1. Kiểm tra Realtime Database
        if (db) {
          const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
          const profileSnap = await get(ref(db, `mw_user_profiles/${uid}`));
          if (profileSnap.exists()) {
            profileData = profileSnap.val();
          }
        }

        // 2. Kiểm tra Firestore nếu RDB chưa có
        if (!profileData && firestore) {
          const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any);
          const uSnap = await getDoc(doc(firestore, 'users', uid));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            if (uData.dob) {
              if (uData.dob.includes('-')) {
                const p = uData.dob.split('-');
                setDobText(`${p[2]}/${p[1]}/${p[0]}`);
              } else {
                setDobText(uData.dob);
              }
            } else if (uData.yob) {
              setDobText(`${uData.yob}`);
            }

            if (uData.miniworld) {
              profileData = uData.miniworld;
            }
          }
        }

        // Nếu đã có thông tin hợp lệ
        if (profileData && (profileData.globalId || profileData.chinaId || profileData.gameId)) {
          const servers = profileData.servers || (profileData.server ? [profileData.server] : []);
          const hasG = servers.includes('Global') || !!profileData.globalId;
          const hasC = servers.includes('China') || !!profileData.chinaId;
          setIsGlobal(hasG);
          setIsChina(hasC);
          setGlobalId(profileData.globalId || (hasG ? profileData.gameId : '') || '');
          setChinaId(profileData.chinaId || (hasC ? profileData.gameId : '') || '');
        } else {
          // Chưa có thông tin -> Mở modal bắt buộc
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Profile check error:", err);
      }
    };

    checkProfile();
  }, [db, firestore, uid, sessionUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGlobal && !isChina) {
      return alert("Vui lòng chọn ít nhất một máy chủ (Global hoặc China).");
    }

    if (isGlobal && !globalId.trim()) {
      return alert("Vui lòng nhập ID Mini World máy chủ Global.");
    }
    if (isChina && !chinaId.trim()) {
      return alert("Vui lòng nhập ID Mini World máy chủ China.");
    }

    if (!uid) return;

    setIsSaving(true);
    const servers: string[] = [];
    if (isGlobal) servers.push('Global');
    if (isChina) servers.push('China');

    const profilePayload = {
      servers,
      globalId: isGlobal ? globalId.trim() : '',
      chinaId: isChina ? chinaId.trim() : '',
      gameId: isGlobal ? globalId.trim() : chinaId.trim(),
      server: isGlobal ? 'Global' : 'China',
      displayName: sessionUser?.displayName || user?.displayName || 'Thành viên',
      ndid: sessionUser?.ndid || uid,
      updatedAt: Date.now()
    };

    try {
      // 1. Lưu Realtime Database
      if (db) {
        const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
        await set(ref(db, `mw_user_profiles/${uid}`), profilePayload);
      }

      // 2. Lưu Firestore
      if (firestore) {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any);
        await updateDoc(doc(firestore, 'users', uid), {
          miniworld: profilePayload
        });
      }

      setIsOpen(false);
    } catch (err: any) {
      alert("Lỗi lưu thông tin: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-modal max-w-md w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl bg-white animate-in zoom-in-95 duration-200 text-left">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white text-2xl shadow-lg shadow-blue-500/20">
            🎮
          </div>
          <h3 className="text-lg font-black text-slate-800">Thông Tin Tài Khoản Mini World</h3>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng chọn máy chủ và nhập ID Mini World của bạn để tiếp tục trải nghiệm hệ thống.
          </p>
        </div>

        {/* Extracted DOB from NDID */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-5 flex items-center gap-2.5">
          <span className="text-lg">🎂</span>
          <div className="text-xs text-emerald-900 leading-tight">
            <span>Ngày sinh: </span>
            <strong className="text-emerald-700 font-black">{dobText}</strong>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">(Tự động trích xuất từ tài khoản NDID)</span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Máy chủ Mini World đang chơi * (Được chọn cả hai)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsGlobal(!isGlobal)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  isGlobal
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-100'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">🌍</span>
                <span>Quốc tế (Global)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChina(!isChina)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  isChina
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-100'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">🇨🇳</span>
                <span>Trung Quốc (China)</span>
              </button>
            </div>
          </div>

          {/* Global ID Input */}
          {isGlobal && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ID Mini World (Máy chủ Quốc tế / Global) *
              </label>
              <input
                type="text"
                required
                value={globalId}
                onChange={(e) => setGlobalId(e.target.value)}
                placeholder="Nhập ID Mini World Global..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          )}

          {/* China ID Input */}
          {isChina && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ID Mini World (Máy chủ Trung Quốc / China) *
              </label>
              <input
                type="text"
                required
                value={chinaId}
                onChange={(e) => setChinaId(e.target.value)}
                placeholder="Nhập ID Mini World China..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 text-xs uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            {isSaving ? 'Đang lưu...' : 'Xác Nhận & Tiếp Tục'}
          </button>
        </form>
      </div>
    </div>
  );
};
