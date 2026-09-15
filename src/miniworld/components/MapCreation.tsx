import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { UserSearchInput } from './UserSearchInput';
import { ApprovalManagementModal } from './ApprovalManagementModal';
import { MiniWorldProfileModal } from './MiniWorldProfileModal';

export const MapCreation = () => {
  const { db, user, isAdmin, isReady, sessionUser } = useFirebase();

  const [hubTab, setHubTab] = useState<'joined' | 'maps' | 'community'>('joined');
  const [allMaps, setAllMaps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingHub, setLoadingHub] = useState(false);
  const [showCreateMapModal, setShowCreateMapModal] = useState(false);

  // Selected Map for Detail Modal
  const [selectedMapDetail, setSelectedMapDetail] = useState<any>(null);
  const [mapOrgs, setMapOrgs] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [approvingTarget, setApprovingTarget] = useState<any>(null);
  const [isEditingMap, setIsEditingMap] = useState(false);

  // Map Creation Form state
  const [mapId, setMapId] = useState('');
  const [mapName, setMapName] = useState('');
  const [mapCode, setMapCode] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [baseUnitName, setBaseUnitName] = useState('đồng');
  const [isPublic, setIsPublic] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [mapQuestions, setMapQuestions] = useState<any[]>([]);
  const [players, setPlayers] = useState([{ id: '', role: 'owner', name: '' }]);
  const [isCreating, setIsCreating] = useState(false);

  // Community Chat State
  const [communityRooms, setCommunityRooms] = useState<any[]>([]);
  const [activeCommunityRoom, setActiveCommunityRoom] = useState<string>('general');
  const [communityMessages, setCommunityMessages] = useState<any[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const [showNewCommunityRoomModal, setShowNewCommunityRoomModal] = useState(false);
  const [newCommunityRoomName, setNewCommunityRoomName] = useState('');

  const roles = [
    { value: 'owner', label: 'Chủ phòng', icon: '👑' },
    { value: 'co_owner', label: 'Phó phòng', icon: '🛡️' },
    { value: 'player', label: 'Người chơi', icon: '🎮' },
    { value: 'custom', label: 'Tùy chỉnh...', icon: '⚙️' }
  ];

  // Realtime check duplicate Map ID
  const isMapIdDuplicate = useMemo(() => {
    if (!mapId.trim()) return false;
    const clean = mapId.trim().replace(/\s+/g, '_').toLowerCase();
    return allMaps.some(m => m.id.toLowerCase() === clean);
  }, [mapId, allMaps]);

  // Fetch all maps
  useEffect(() => {
    if (!db) return;
    const fetchMaps = async () => {
      setLoadingHub(true);
      try {
        const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
        
        onValue(ref(db, 'mw_maps'), (snap: any) => {
          if (snap.exists()) {
            const data = snap.val();
            const mapList = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
            setAllMaps(mapList);
          } else {
            setAllMaps([]);
          }
          setLoadingHub(false);
        });

        // Listen to Community Chat Rooms
        onValue(ref(db, 'mw_community_rooms'), (snap: any) => {
          if (snap.exists()) {
            const data = snap.val();
            setCommunityRooms(Object.keys(data).map(k => ({ id: k, ...data[k] })));
          } else {
            // Default general room
            setCommunityRooms([{ id: 'general', name: 'Kênh Chat Chung', description: 'Trò chuyện toàn cầu cộng đồng Mini World' }]);
          }
        });
      } catch (err) {
        console.error("Hub fetch error:", err);
        setLoadingHub(false);
      }
    };
    fetchMaps();
  }, [db]);

  // Listen to Active Community Room Messages
  useEffect(() => {
    if (!db || hubTab !== 'community') return;
    const fetchCommMsgs = async () => {
      const { ref, onValue, query, orderByChild, limitToLast } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const commRef = query(ref(db, `mw_messages/global/${activeCommunityRoom}`), orderByChild('timestamp'), limitToLast(60));
      onValue(commRef, (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setCommunityMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
          setCommunityMessages([]);
        }
      });
    };
    fetchCommMsgs();
  }, [db, hubTab, activeCommunityRoom]);

  // Lazy load organizations for selected map only
  const handleOpenMapDetail = async (map: any) => {
    setSelectedMapDetail(map);
    setIsEditingMap(false);
    if (!db) return;
    setLoadingOrgs(true);
    try {
      const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const snap = await get(ref(db, `mw_organizations/${map.id}`));
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        // Sort by member count descending
        list.sort((a, b) => {
          const countA = Object.keys(a.members || {}).length;
          const countB = Object.keys(b.members || {}).length;
          return countB - countA;
        });
        setMapOrgs(list);
      } else {
        setMapOrgs([]);
      }
    } catch (err) {
      console.error(err);
      setMapOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { id: '', role: 'player', name: '' }]);
  };

  const handlePlayerChange = (index: number, val: string, name?: string) => {
    const newPlayers = [...players];
    newPlayers[index].id = val;
    if (name) newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handlePlayerRoleChange = (index: number, role: string) => {
    const newPlayers = [...players];
    newPlayers[index].role = role;
    setPlayers(newPlayers);
  };

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !db) return alert("Hệ thống chưa sẵn sàng.");
    if (!mapId.trim()) return alert("Vui lòng nhập ID Bản đồ.");
    if (isMapIdDuplicate) return alert("ID Bản đồ này đã tồn tại, vui lòng chọn ID khác.");
    
    const cleanMapId = mapId.trim().replace(/\s+/g, '_');
    const hasOwner = players.some(p => p.role === 'owner');
    if (!hasOwner) return alert("Bản đồ phải có ít nhất một Chủ phòng.");

    setIsCreating(true);
    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const mapRef = ref(db, `mw_maps/${cleanMapId}`);
      
      const membersMap = players.reduce((acc, curr) => {
        if (curr.id) acc[curr.id] = { role: curr.role, name: curr.name || curr.id, joinedAt: Date.now() };
        return acc;
      }, {} as Record<string, any>);

      const payload = {
        name: mapName || `Bản đồ ${cleanMapId}`,
        code: mapCode || '',
        baseUnitName: baseUnitName.trim() || 'đồng',
        isPublic,
        requireApproval,
        questions: mapQuestions,
        createdAt: creationDate ? new Date(creationDate).getTime() : Date.now(),
        createdBy: user?.uid || 'anonymous',
        players: membersMap,
        budget: 0,
        taxHolderText: `Chủ phòng giữ thuế (Đơn vị: ${baseUnitName.trim() || 'đồng'})`
      };

      await set(mapRef, payload);

      // Default Map Chat Room
      const defaultChatRef = ref(db, `mw_chats/${cleanMapId}/default_chat`);
      await set(defaultChatRef, {
        id: 'default_chat',
        name: `Phòng Chat Bản Đồ: ${mapName || cleanMapId}`,
        description: 'Phòng trò chuyện tự động dành cho toàn bộ người chơi trong bản đồ.',
        type: 'map',
        isPublic: true,
        requireApproval: false,
        createdBy: user?.uid || 'system',
        createdAt: Date.now(),
        members: membersMap
      });

      // Default Map Nation Organization (Tổ chức mặc định toàn map gán cho tất cả thành viên)
      const defaultOrgRef = ref(db, `mw_organizations/${cleanMapId}/default_org`);
      const defaultOrgMembers = Object.keys(membersMap).reduce((acc, k) => {
        acc[k] = {
          role: membersMap[k].role === 'owner' ? 'leader' : 'member',
          roleName: membersMap[k].role === 'owner' ? 'Chủ Bản Đồ' : 'Cư Dân',
          name: membersMap[k].name,
          joinedAt: Date.now()
        };
        return acc;
      }, {} as Record<string, any>);

      await set(defaultOrgRef, {
        id: 'default_org',
        name: `Cộng Đồng Cư Dân ${mapName || cleanMapId}`,
        description: 'Tổ chức mặc định toàn dân của bản đồ (mọi người chơi trong map tự động là thành viên).',
        type: 'national',
        isDefault: true,
        isPublic: true,
        requireApproval: false,
        createdBy: user?.uid || 'system',
        createdAt: Date.now(),
        members: defaultOrgMembers
      });

      // Default Transaction Types (Bao gồm loại mặc định: Đóng thuế)
      const { push } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const defaultTxTypes = [
        { name: 'Đóng thuế', rate: 100, isTaxDirect: true, isSystem: true, createdAt: Date.now() },
        { name: 'Mua bán hàng hóa / vật phẩm', rate: 5, isSystem: true, createdAt: Date.now() + 1 },
        { name: 'Chuyển tiền / Tặng quà', rate: 0, isSystem: true, createdAt: Date.now() + 2 },
        { name: 'Trả lương / Thù lao', rate: 0, isSystem: true, createdAt: Date.now() + 3 },
        { name: 'Góp vốn / Đầu tư', rate: 0, isSystem: true, createdAt: Date.now() + 4 }
      ];
      for (const dt of defaultTxTypes) {
        const dtRef = push(ref(db, `mw_transaction_types/${cleanMapId}`));
        await set(dtRef, dt);
      }

      // Default Currencies
      const cleanBase = baseUnitName.trim() || 'đồng';
      const initialCurrencies = {
        'sắt': 5,
        'nhôm': 10,
        'titan': 20,
        'lửa rực (khối)': 50,
        'đồng Horas': 100,
        'coban': 200,
        'vàng đen': 500,
        'đồng tiền vàng': 10000,
        [cleanBase]: 1
      };
      await set(ref(db, `mw_maps/${cleanMapId}/currencies`), initialCurrencies);

      alert("🎉 Khởi tạo bản đồ thành công!");
      setShowCreateMapModal(false);
      window.location.href = `/games/miniworld/?map=${cleanMapId}`;
    } catch (err: any) {
      alert("Lỗi tạo bản đồ: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateMapDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedMapDetail) return;
    try {
      const { ref, update, get, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const cleanBase = selectedMapDetail.baseUnitName?.trim() || 'đồng';
      
      await update(ref(db, `mw_maps/${selectedMapDetail.id}`), {
        name: selectedMapDetail.name,
        code: selectedMapDetail.code,
        isPublic: selectedMapDetail.isPublic,
        requireApproval: selectedMapDetail.requireApproval,
        baseUnitName: cleanBase
      });

      // Update currencies base unit if needed
      const currSnap = await get(ref(db, `mw_maps/${selectedMapDetail.id}/currencies`));
      if (currSnap.exists()) {
        const currs = currSnap.val();
        currs[cleanBase] = 1;
        await set(ref(db, `mw_maps/${selectedMapDetail.id}/currencies`), currs);
      }

      setIsEditingMap(false);
      alert('Đã cập nhật thông tin bản đồ!');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeleteMap = async (targetMapId: string) => {
    if (!db) return;
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN Bản đồ "${targetMapId}" cùng toàn bộ dữ liệu giao dịch và tổ chức không?`)) return;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_maps/${targetMapId}`));
      await remove(ref(db, `mw_transactions/${targetMapId}`));
      await remove(ref(db, `mw_organizations/${targetMapId}`));
      await remove(ref(db, `mw_chats/${targetMapId}`));
      alert(`Đã xóa bản đồ ${targetMapId}!`);
      setSelectedMapDetail(null);
    } catch (e: any) {
      alert("Lỗi xóa map: " + e.message);
    }
  };

  // Direct join or join with questions
  const handleDirectJoinMap = async (map: any) => {
    if (!db) return alert("Hệ thống chưa sẵn sàng.");
    const currentUid = user?.uid || sessionUser?.uid || sessionUser?.ndid;
    if (!currentUid) return alert("Vui lòng đăng nhập để tham gia bản đồ.");

    const playerName = sessionUser?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ND Member';

    if (map.requireApproval && map.questions && map.questions.length > 0) {
      setApprovingTarget({
        type: 'map',
        id: map.id,
        mapId: map.id,
        title: `Đơn xin tham gia bản đồ: ${map.name || map.id}`,
        questions: map.questions
      });
      return;
    }

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      // Add to map players
      await set(ref(db, `mw_maps/${map.id}/players/${currentUid}`), {
        role: 'player',
        name: playerName,
        joinedAt: Date.now()
      });

      // Automatically add to default map organization
      try {
        await set(ref(db, `mw_organizations/${map.id}/default_org/members/${currentUid}`), {
          role: 'member',
          roleName: 'Cư Dân Bản Đồ',
          name: playerName,
          joinedAt: Date.now()
        });
      } catch (_) {}

      alert(`🎉 Đã tham gia bản đồ "${map.name || map.id}" thành công!`);
      window.location.href = `/games/miniworld/?map=${map.id}`;
    } catch (e: any) {
      alert("Lỗi tham gia bản đồ: " + e.message);
    }
  };

  const handleSendCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityInput.trim() || !db) return;
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const msgRef = push(ref(db, `mw_messages/global/${activeCommunityRoom}`));
      
      const payload = {
        text: communityInput.trim(),
        senderId: user?.uid || 'guest',
        senderName: sessionUser?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ND Member',
        isAdmin: !!isAdmin,
        timestamp: Date.now()
      };
      
      await set(msgRef, payload);
      setCommunityInput('');
    } catch (err: any) {
      alert("Lỗi gửi tin nhắn: " + err.message);
    }
  };

  const handleCreateCommunityRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newCommunityRoomName.trim() || !db) return;
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const newRef = push(ref(db, 'mw_community_rooms'));
      await set(newRef, {
        name: newCommunityRoomName.trim(),
        createdBy: user?.uid || 'admin',
        createdAt: Date.now()
      });
      setNewCommunityRoomName('');
      setShowNewCommunityRoomModal(false);
      alert('Đã tạo phòng chat cộng đồng mới!');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Filtered maps based on search
  const filteredMaps = useMemo(() => {
    if (!searchQuery) return allMaps;
    const q = searchQuery.toLowerCase();
    return allMaps.filter(m => 
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.id && m.id.toLowerCase().includes(q)) ||
      (m.code && m.code.toLowerCase().includes(q))
    );
  }, [allMaps, searchQuery]);

  // Joined maps list for the current user
  const joinedMaps = useMemo(() => {
    const uid = user?.uid;
    const ndid = sessionUser?.ndid;
    const disp = sessionUser?.displayName;
    if (!uid && !ndid && !disp) return [];

    return filteredMaps.filter(m => {
      if (!m.players) return false;
      return Object.entries(m.players).some(([k, v]: [string, any]) => {
        if (k === uid || k === ndid) return true;
        if (typeof v === 'object' && v.name && v.name === disp) return true;
        return false;
      });
    });
  }, [filteredMaps, user, sessionUser]);

  // Helper check if map is joined by current user
  const isMapJoined = (map: any) => {
    const uid = user?.uid;
    const ndid = sessionUser?.ndid;
    const disp = sessionUser?.displayName;
    if (!map || !map.players) return false;
    return Object.entries(map.players).some(([k, v]: [string, any]) => {
      if (k === uid || k === ndid) return true;
      if (typeof v === 'object' && v.name && v.name === disp) return true;
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 relative overflow-hidden flex flex-col items-center pt-20">
      {/* Required Mini World profile popup if missing */}
      <MiniWorldProfileModal />

      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-6xl relative z-10 space-y-8 mb-16">
        {/* Hero Header */}
        <div className="glass p-8 md:p-10 rounded-3xl text-center relative overflow-hidden border border-slate-200/80 shadow-lg bg-white">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-blue-200">
            <span>✨</span> Mini World Universe – ND Labs
          </div>

          <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 leading-tight">
            Trung Tâm Bản Đồ & Kinh Tế
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto mt-3 font-medium">
            Khám phá các bản đồ, tham gia tổ chức, quản lý giao dịch thuế và kết nối cộng đồng người chơi Mini World.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowCreateMapModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span className="text-base">➕</span> Tạo Bản Đồ Mới
            </button>

            <a
              href="/games"
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all text-xs flex items-center gap-2"
            >
              <span>🎮</span> Game Zone
            </a>
          </div>

          {/* Stat summary counters */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-8 text-xs text-slate-500">
            <div>
              <span className="block text-2xl font-black text-slate-800">{allMaps.length}</span>
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Tổng Bản đồ</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="block text-2xl font-black text-emerald-600">{joinedMaps.length}</span>
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Đã tham gia</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="block text-2xl font-black text-blue-600">Real-time</span>
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Đồng bộ</span>
            </div>
          </div>
        </div>

        {/* Search and Tab Selector (Tab Đã tham gia ở đầu) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setHubTab('joined')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${hubTab === 'joined' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>🌟</span> Map Đã Tham Gia ({joinedMaps.length})
            </button>
            <button
              onClick={() => setHubTab('maps')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${hubTab === 'maps' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>🗺️</span> Tất Cả Bản Đồ ({filteredMaps.length})
            </button>
            <button
              onClick={() => setHubTab('community')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${hubTab === 'community' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>🌐</span> Chat Cộng Đồng
            </button>
          </div>

          {(hubTab === 'maps' || hubTab === 'joined') && (
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Tìm theo Tên, ID, Mã bản đồ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        {/* TAB 1: JOINED MAPS GRID */}
        {hubTab === 'joined' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedMaps.map(map => {
              const playerCount = map.players ? Object.keys(map.players).length : 0;
              const ownerInfo = map.players ? Object.entries(map.players).find(([k, v]: [string, any]) => (typeof v === 'object' ? v.role === 'owner' : v === 'owner')) : null;
              const ownerDisplay = ownerInfo ? (typeof ownerInfo[1] === 'object' ? ((ownerInfo[1] as any)?.name || ownerInfo[0]) : ownerInfo[0]) : (map.createdBy || 'Chưa rõ');

              return (
                <div
                  key={map.id}
                  onClick={() => handleOpenMapDetail(map)}
                  className="glass p-6 rounded-3xl border border-emerald-200 shadow-md cursor-pointer hover:border-emerald-400 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between group bg-white"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors truncate max-w-[70%]">
                        {map.name || `Bản đồ ${map.id}`}
                      </h3>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold">
                        Đã tham gia
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 font-medium">
                      <span>👑 Chủ phòng:</span>
                      <span className="text-slate-800 font-bold truncate">{ownerDisplay}</span>
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-4 font-medium">
                      <span>💰 Ngân sách thuế: {map.budget?.toLocaleString() || 0} {map.baseUnitName || 'đồng'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-500 font-medium">
                      👥 Thành viên: <strong className="text-slate-800">{playerCount}</strong>
                    </span>
                    <a
                      href={`/games/miniworld/?map=${map.id}`}
                      onClick={e => e.stopPropagation()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>🚀</span> Truy cập
                    </a>
                  </div>
                </div>
              );
            })}

            {joinedMaps.length === 0 && !loadingHub && (
              <div className="col-span-full glass p-12 rounded-3xl text-center text-slate-400 bg-white border border-dashed border-slate-300">
                <div className="text-4xl mb-3">🌟</div>
                <p className="text-sm font-bold text-slate-600">Bạn chưa tham gia bản đồ nào.</p>
                <p className="text-xs text-slate-400 mt-1">Chuyển sang tab "Tất Cả Bản Đồ" và bấm "Tham gia" bản đồ bạn yêu thích.</p>
                <button
                  onClick={() => setHubTab('maps')}
                  className="mt-4 inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all"
                >
                  <span>🗺️</span> Khám phá danh sách bản đồ
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL MAPS GRID */}
        {hubTab === 'maps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.map(map => {
              const playerCount = map.players ? Object.keys(map.players).length : 0;
              const ownerInfo = map.players ? Object.entries(map.players).find(([k, v]: [string, any]) => (typeof v === 'object' ? v.role === 'owner' : v === 'owner')) : null;
              const ownerDisplay = ownerInfo ? (typeof ownerInfo[1] === 'object' ? ((ownerInfo[1] as any)?.name || ownerInfo[0]) : ownerInfo[0]) : (map.createdBy || 'Chưa rõ');
              const joined = isMapJoined(map);

              return (
                <div
                  key={map.id}
                  onClick={() => handleOpenMapDetail(map)}
                  className="glass p-6 rounded-3xl border border-slate-200/80 shadow-md cursor-pointer hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between group bg-white"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[70%]">
                        {map.name || `Bản đồ ${map.id}`}
                      </h3>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-bold">
                        {map.code || map.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 font-medium">
                      <span>👑 Chủ phòng:</span>
                      <span className="text-slate-800 font-bold truncate">{ownerDisplay}</span>
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-4 font-medium">
                      <span>💰 Ngân sách thuế: {map.budget?.toLocaleString() || 0} {map.baseUnitName || 'đồng'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-500 font-medium">
                      👥 Thành viên: <strong className="text-slate-800">{playerCount}</strong>
                    </span>

                    {joined ? (
                      <a
                        href={`/games/miniworld/?map=${map.id}`}
                        onClick={e => e.stopPropagation()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <span>🚀</span> Truy cập
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDirectJoinMap(map); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <span>➕</span> Tham gia
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMaps.length === 0 && !loadingHub && (
              <div className="col-span-full glass p-12 rounded-3xl text-center text-slate-400 bg-white">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-sm font-bold text-slate-600">Không tìm thấy bản đồ nào phù hợp.</p>
                <button
                  onClick={() => setShowCreateMapModal(true)}
                  className="mt-3 text-xs text-blue-600 hover:underline font-bold"
                >
                  + Khởi tạo bản đồ mới ngay!
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Global Community Chat */}
        {hubTab === 'community' && (
          <div className="glass rounded-3xl border border-slate-200/90 shadow-md bg-white overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Community Channel Sidebar */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-col bg-slate-50/70">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Kênh Cộng Đồng</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewCommunityRoomModal(true)}
                    className="text-[11px] bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-lg hover:bg-purple-200"
                  >
                    + Tạo kênh
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
                {communityRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setActiveCommunityRoom(room.id)}
                    className={`p-3 rounded-2xl cursor-pointer text-xs font-bold transition-all ${activeCommunityRoom === room.id ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                  >
                    # {room.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Kênh: {communityRooms.find(r => r.id === activeCommunityRoom)?.name || 'Cộng đồng'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Trưởng cộng đồng: <strong>Admin ND Labs</strong></p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar bg-slate-50/30">
                {communityMessages.map(msg => {
                  const isMine = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                        {msg.isAdmin && <span className="bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-black text-[9px]">Admin</span>}
                        {msg.senderName}
                        <span className="text-[9px] text-slate-400 font-normal">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] break-words shadow-sm font-medium ${isMine ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendCommunityMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={communityInput}
                  onChange={e => setCommunityInput(e.target.value)}
                  placeholder={`Gửi tin nhắn vào #${communityRooms.find(r => r.id === activeCommunityRoom)?.name || 'kênh'}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-purple-500/20"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: Map Detail Modal */}
      {selectedMapDetail && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 bg-white flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-bold">
                  {selectedMapDetail.code || selectedMapDetail.id}
                </span>
                <h3 className="text-xl font-black text-slate-800 mt-1">
                  {selectedMapDetail.name || `Bản đồ ${selectedMapDetail.id}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMapDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Trạng thái:</span>
                  <span className="font-bold text-slate-800">{selectedMapDetail.isPublic ? '🌐 Công khai' : '🔒 Riêng tư'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Đơn vị tiền tệ gốc:</span>
                  <span className="font-bold text-blue-600">{selectedMapDetail.baseUnitName || 'đồng'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ngân sách thuế phòng:</span>
                  <span className="font-bold text-slate-800">{selectedMapDetail.budget?.toLocaleString() || 0} {selectedMapDetail.baseUnitName || 'đồng'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ngày khởi tạo:</span>
                  <span className="font-bold text-slate-800">{new Date(selectedMapDetail.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Edit Map Button for Owner or Admin */}
              {(isAdmin || (selectedMapDetail.players && user?.uid && (selectedMapDetail.players[user.uid]?.role === 'owner' || selectedMapDetail.players[user.uid] === 'owner'))) && (
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-800">Quyền Quản Trị Map</span>
                    <button
                      onClick={() => setIsEditingMap(!isEditingMap)}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      {isEditingMap ? 'Hủy sửa' : '✏️ Chỉnh sửa thông tin map'}
                    </button>
                  </div>

                  {isEditingMap && (
                    <form onSubmit={handleUpdateMapDetails} className="space-y-3 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Tên bản đồ</label>
                        <input
                          type="text"
                          value={selectedMapDetail.name}
                          onChange={e => setSelectedMapDetail({ ...selectedMapDetail, name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Mã bản đồ (Code)</label>
                        <input
                          type="text"
                          value={selectedMapDetail.code}
                          onChange={e => setSelectedMapDetail({ ...selectedMapDetail, code: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Tên đơn vị tiền tệ gốc</label>
                        <input
                          type="text"
                          value={selectedMapDetail.baseUnitName || 'đồng'}
                          onChange={e => setSelectedMapDetail({ ...selectedMapDetail, baseUnitName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                        Lưu thông tin
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Organizations inside Map (Sorted by most members, loaded on demand) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Tổ Chức Trong Bản Đồ ({mapOrgs.length}) – Sắp xếp theo số thành viên
                </h4>
                {loadingOrgs ? (
                  <div className="text-center py-4 text-xs text-slate-400">Đang tải danh sách tổ chức...</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {mapOrgs.map(org => (
                      <div key={org.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {org.name}
                            {org.isDefault && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">Toàn map</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {org.id}</div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                          👥 {Object.keys(org.members || {}).length} thành viên
                        </span>
                      </div>
                    ))}
                    {mapOrgs.length === 0 && (
                      <div className="text-slate-400 italic text-[11px] py-2 text-center">Bản đồ này chưa có tổ chức nào.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              {(isAdmin || (selectedMapDetail.players && user?.uid && (selectedMapDetail.players[user.uid]?.role === 'owner' || selectedMapDetail.players[user.uid] === 'owner'))) && (
                <button
                  onClick={() => handleDeleteMap(selectedMapDetail.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-3 rounded-2xl text-xs transition-colors"
                >
                  🗑️ Xóa Map
                </button>
              )}

              <button
                onClick={() => setSelectedMapDetail(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-colors"
              >
                Đóng
              </button>

              {isMapJoined(selectedMapDetail) ? (
                <a
                  href={`/games/miniworld/?map=${selectedMapDetail.id}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl text-xs text-center uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🚀</span> Truy cập Bảng Điều Khiển
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDirectJoinMap(selectedMapDetail)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-2xl text-xs text-center uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>➕</span> Tham gia Bản Đồ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Create Map Popup with Custom Base Unit */}
      {showCreateMapModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 bg-white">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span>➕</span> Tạo Bản Đồ Mới
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Khởi tạo ID bản đồ, đơn vị tiền tệ gốc và phân quyền người chơi.</p>
              </div>
              <button
                onClick={() => setShowCreateMapModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMap} className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ID Bản đồ (Không dấu) *
                  </label>
                  <input
                    type="text"
                    value={mapId}
                    onChange={e => setMapId(e.target.value)}
                    required
                    placeholder="vd: map_sinh_ton_1"
                    className={`w-full bg-white border ${isMapIdDuplicate ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'} rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all`}
                  />
                  {isMapIdDuplicate && (
                    <div className="text-[11px] text-rose-600 font-bold mt-1">⚠️ ID này đã tồn tại! Vui lòng nhập ID khác.</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tên Bản đồ
                  </label>
                  <input
                    type="text"
                    value={mapName}
                    onChange={e => setMapName(e.target.value)}
                    placeholder="vd: Thế Giới Sinh Tồn"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Mã Bản đồ (Code trong game)
                  </label>
                  <input
                    type="text"
                    value={mapCode}
                    onChange={e => setMapCode(e.target.value)}
                    placeholder="Mã chia sẻ bản đồ trong Mini World"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Đơn vị tiền tệ gốc của Map *
                  </label>
                  <input
                    type="text"
                    required
                    value={baseUnitName}
                    onChange={e => setBaseUnitName(e.target.value)}
                    placeholder="Tự do đặt tên (vd: xu, gem, coin, đồng, vàng, credits...)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Không bắt buộc là 'đồng'. Bạn có thể tự do đặt tên và đổi bất cứ lúc nào trong Bảng Tiền Tệ.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Công khai bản đồ
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={e => setRequireApproval(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Cần duyệt khi người chơi xin tham gia
                </label>
              </div>

              {/* Player list and roles with UserSearchInput */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phân Quyền Thành Viên (Ít nhất 1 Chủ phòng)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    + Thêm người chơi
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {players.map((player, idx) => (
                    <div key={idx} className="flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-200/80 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <UserSearchInput
                            value={player.id}
                            selectedName={player.name}
                            onChange={(val, resName) => handlePlayerChange(idx, val, resName)}
                            placeholder="Gõ Tên, NDID hoặc CodeID để tìm..."
                          />
                        </div>
                        <select
                          value={player.role}
                          onChange={e => handlePlayerRoleChange(idx, e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none shrink-0"
                        >
                          {roles.map(r => (
                            <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                          ))}
                        </select>
                        {players.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPlayers(players.filter((_, i) => i !== idx))}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateMapModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isMapIdDuplicate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo Bản Đồ Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Admin Create Community Channel */}
      {showNewCommunityRoomModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white">
            <h3 className="text-base font-black text-slate-800 mb-3">Tạo Kênh Chat Cộng Đồng Mới</h3>
            <form onSubmit={handleCreateCommunityRoom} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Tên kênh (vd: Giao lưu kinh tế, Tìm đồng đội...)"
                value={newCommunityRoomName}
                onChange={e => setNewCommunityRoomName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCommunityRoomModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  Tạo kênh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approvals Modal */}
      {approvingTarget && (
        <ApprovalManagementModal
          type={approvingTarget.type}
          targetId={approvingTarget.id}
          mapId={approvingTarget.mapId}
          title={approvingTarget.title}
          onClose={() => setApprovingTarget(null)}
        />
      )}
    </div>
  );
};
