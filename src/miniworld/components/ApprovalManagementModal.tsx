import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';

interface ApprovalProps {
  type: 'map' | 'org' | 'chat';
  targetId: string;
  mapId: string;
  title: string;
  onClose: () => void;
}

export const ApprovalManagementModal: React.FC<ApprovalProps> = ({
  type,
  targetId,
  mapId,
  title,
  onClose
}) => {
  const { db } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const requestPath = type === 'map' 
    ? `mw_maps/${targetId}/requests`
    : type === 'org'
    ? `mw_organizations/${mapId}/${targetId}/requests`
    : `mw_chats/${mapId}/${targetId}/requests`;

  const memberPath = type === 'map'
    ? `mw_maps/${targetId}/players`
    : type === 'org'
    ? `mw_organizations/${mapId}/${targetId}/members`
    : `mw_chats/${mapId}/${targetId}/members`;

  useEffect(() => {
    if (!db) return;
    const fetchRequests = async () => {
      setLoading(true);
      const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      onValue(ref(db, requestPath), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setRequests(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
          setRequests([]);
        }
        setLoading(false);
      });
    };
    fetchRequests();
  }, [db, requestPath]);

  const handleApprove = async (req: any) => {
    if (!db) return;
    try {
      const { ref, update, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      
      // Add to members
      if (type === 'map') {
        await update(ref(db, `${memberPath}/${req.userId}`), {
          role: 'player',
          name: req.name || req.userId
        });
      } else {
        await update(ref(db, `${memberPath}/${req.userId}`), {
          role: 'member',
          roleName: 'Thành viên',
          name: req.name || req.userId,
          joinedAt: Date.now()
        });
      }

      // Remove from requests
      await remove(ref(db, `${requestPath}/${req.id}`));
      alert(`Đã duyệt thành viên ${req.name || req.userId}!`);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleReject = async (reqId: string) => {
    if (!db || !confirm('Từ chối yêu cầu này?')) return;
    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `${requestPath}/${reqId}`));
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-modal max-w-xl w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col bg-white animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📋</span> Xét Duyệt Thành Viên: {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Xem câu trả lời và phê duyệt người chơi xin tham gia.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full font-bold">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
          {requests.map(req => (
            <div key={req.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{req.name || req.userId}</h4>
                  <div className="text-[10px] text-slate-400 font-mono">NDID: @{req.userId}</div>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(req.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Answers if any */}
              {req.answers && Object.keys(req.answers).length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Câu trả lời xét duyệt:</span>
                  {Object.entries(req.answers).map(([qKey, ans]: [string, any], idx) => (
                    <div key={qKey} className="text-slate-700">
                      <span className="font-bold text-slate-800">Câu {idx + 1}: </span>
                      <span>{Array.isArray(ans) ? ans.join(', ') : String(ans)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 rounded-xl text-xs transition-colors border border-rose-200"
                >
                  ✕ Từ chối
                </button>
                <button
                  onClick={() => handleApprove(req)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm"
                >
                  ✓ Chấp nhận
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && !loading && (
            <div className="text-slate-400 text-center py-16 text-xs">
              Hiện không có yêu cầu tham gia nào đang chờ duyệt.
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 text-right">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-2xl text-xs">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
