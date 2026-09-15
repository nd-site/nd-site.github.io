import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';

// Tab Components
import { TransactionsTab } from './TransactionsTab';
import { OrganizationsTab } from './OrganizationsTab';
import { ChatTab } from './ChatTab';
import { MiniWorldProfileModal } from './MiniWorldProfileModal';
import { MapPlayersModal } from './MapPlayersModal';
import { MapSettingsModal } from './MapSettingsModal';

export const MapDashboard = () => {
  const { isReady, db, user, isAdmin, sessionUser } = useFirebase();
  const currentUid = user?.uid || sessionUser?.uid || sessionUser?.ndid;

  const [mapId, setMapId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'organizations'>('transactions');
  const [showMapChatModal, setShowMapChatModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mId = params.get('map');
    if (mId) setMapId(mId);

    if (params.get('org')) {
      setActiveTab('organizations');
    } else if (params.get('chat') || params.get('joinChat')) {
      setShowMapChatModal(true);
    } else if (params.get('players')) {
      setShowPlayersModal(true);
    }
  }, []);

  useEffect(() => {
    if (!db || !mapId) return;
    setLoading(true);
    const fetchMap = async () => {
      const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const mapRef = ref(db, `mw_maps/${mapId}`);
      onValue(mapRef, (snapshot: any) => {
        if (snapshot.exists()) {
          setMapData(snapshot.val());
        } else {
          setMapData(null);
        }
        setLoading(false);
      });
    };
    fetchMap();
  }, [db, mapId]);

  const isMapOwner = useMemo(() => {
    if (isAdmin) return true;
    if (!mapData?.players || !currentUid) return false;
    const playerObj = mapData.players[currentUid];
    return playerObj?.role === 'owner' || playerObj === 'owner';
  }, [mapData, currentUid, isAdmin]);

  const playerCount = useMemo(() => {
    return Object.keys(mapData?.players || {}).length;
  }, [mapData]);

  if (!mapId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold mb-2">Không tìm thấy mã Bản đồ trong đường dẫn</h2>
        <p className="text-xs text-slate-500 mb-6">Vui lòng quay lại danh sách để chọn bản đồ bạn muốn truy cập.</p>
        <a href="/games/miniworld/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm">
          ← Về Trung Tâm Bản Đồ
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold text-slate-600">Đang tải dữ liệu bản đồ...</p>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-bold mb-2">Bản đồ "{mapId}" chưa tồn tại</h2>
        <p className="text-xs text-slate-500 mb-6">Bản đồ này chưa được khởi tạo trong hệ thống.</p>
        <a href="/games/miniworld/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm">
          + Khởi Tạo Bản Đồ Mới
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col pt-16">
      <MiniWorldProfileModal />

      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/3 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="glass sticky top-14 z-40 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/90 bg-white/90">
        <div className="flex items-center gap-4">
          <a 
            href="/games/miniworld/" 
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Quay lại Trung tâm"
          >
            <span>←</span> Trung Tâm
          </a>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {mapData.name || `Bản đồ ${mapId}`}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ID: <span className="text-blue-600 font-mono font-bold">{mapId}</span>
              {mapData.code && ` | Mã Bản Đồ: ${mapData.code}`}
              {` | Tiền tệ: `}<strong className="text-emerald-600 uppercase">{mapData.baseUnitName || 'đồng'}</strong>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Main Tabs Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-1 md:flex-none">
            {[
              { id: 'transactions', label: 'Giao dịch & Thuế', icon: '💰' },
              { id: 'organizations', label: 'Tổ chức', icon: '🏢' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* View / Manage Players Button */}
          <button
            onClick={() => setShowPlayersModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Xem danh sách người chơi & vai trò trong bản đồ"
          >
            <span>👥</span>
            <span>Thành Viên ({playerCount})</span>
          </button>

          {/* Map Settings Button (For Owner / Admin) */}
          {isMapOwner && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
              title="Chỉnh sửa thông tin bản đồ"
            >
              <span>⚙️</span>
              <span>Cài Đặt Map</span>
            </button>
          )}

          {/* Map Chat Button */}
          <button
            onClick={() => setShowMapChatModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 uppercase tracking-wider"
          >
            <span>💬</span> Chat Bản Đồ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full mb-12">
        {activeTab === 'transactions' && <TransactionsTab mapId={mapId} mapData={mapData} />}
        {activeTab === 'organizations' && <OrganizationsTab mapId={mapId} mapData={mapData} />}
      </main>

      {/* Map Players & Roles Modal */}
      {showPlayersModal && (
        <MapPlayersModal
          mapId={mapId}
          mapData={mapData}
          onClose={() => setShowPlayersModal(false)}
        />
      )}

      {/* Map Settings Modal */}
      {showSettingsModal && isMapOwner && (
        <MapSettingsModal
          mapId={mapId}
          mapData={mapData}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Separate Map Chat Modal */}
      {showMapChatModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
          <div className="glass-modal max-w-5xl w-full h-[90vh] rounded-3xl p-4 md:p-6 border border-slate-200 shadow-2xl bg-white flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-2">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span>💬</span> Phòng Trò Chuyện Bản Đồ: {mapData?.name || mapId}
              </h3>
              <button
                onClick={() => setShowMapChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatTab mapId={mapId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
