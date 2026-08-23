import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { UserSearchInput } from './UserSearchInput';
import { ApprovalManagementModal } from './ApprovalManagementModal';

export const OrganizationsTab = ({ mapId, mapData }: { mapId: string, mapData: any }) => {
  const { db, user, sessionUser, isAdmin } = useFirebase();
  const currentUid = user?.uid || sessionUser?.uid || sessionUser?.ndid;

  const [orgs, setOrgs] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [approvingOrg, setApprovingOrg] = useState<any>(null);
  const [isEditingOrg, setIsEditingOrg] = useState(false);

  // Sub-tabs: 'all' vs 'joined'
  const [orgSubTab, setOrgSubTab] = useState<'all' | 'joined'>('all');

  // Joining state via questions
  const [joiningOrg, setJoiningOrg] = useState<any>(null);
  const [joinAnswers, setJoinAnswers] = useState<Record<string, any>>({});

  // New org form
  const [orgForm, setOrgForm] = useState({
    id: '',
    name: '',
    description: '',
    isPublic: true,
    requireApproval: false,
    questions: [] as any[]
  });

  // Add member form
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [customRoleName, setCustomRoleName] = useState('');

  // Duplicate Org ID check (only in current map)
  const isOrgIdDuplicate = useMemo(() => {
    if (!orgForm.id.trim()) return false;
    const clean = orgForm.id.trim().replace(/\s+/g, '_').toLowerCase();
    return orgs.some(o => o.id.toLowerCase() === clean);
  }, [orgForm.id, orgs]);

  // Joined orgs
  const joinedOrgs = useMemo(() => {
    if (!currentUid) return [];
    return orgs.filter(o => o.members && o.members[currentUid]);
  }, [orgs, currentUid]);

  const displayedOrgs = orgSubTab === 'joined' ? joinedOrgs : orgs;

  // Fetch Organizations
  useEffect(() => {
    if (!db || !mapId) return;
    const fetchOrgs = async () => {
      const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      
      onValue(ref(db, `mw_organizations/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          // Sort by members descending
          list.sort((a, b) => {
            const countA = Object.keys(a.members || {}).length;
            const countB = Object.keys(b.members || {}).length;
            return countB - countA;
          });
          setOrgs(list);

          const params = new URLSearchParams(window.location.search);
          const orgParam = params.get('org');
          if (orgParam) {
            const matched = list.find(o => o.id === orgParam);
            if (matched) setSelectedOrg(matched);
          }
        } else {
          setOrgs([]);
        }
      });
    };
    fetchOrgs();
  }, [db, mapId]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !orgForm.id.trim()) return alert('Vui lòng nhập ID Tổ chức.');
    if (isOrgIdDuplicate) return alert('ID Tổ chức này đã tồn tại trong bản đồ!');
    
    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const cleanId = orgForm.id.trim().replace(/\s+/g, '_');
      
      const leaderUid = currentUid || 'anonymous';
      const initialMembers = {
        [leaderUid]: {
          role: 'leader',
          roleName: 'Trưởng tổ chức',
          name: sessionUser?.displayName || user?.displayName || 'Chủ tổ chức',
          joinedAt: Date.now()
        }
      };

      const payload = {
        ...orgForm,
        id: cleanId,
        createdAt: Date.now(),
        createdBy: leaderUid,
        leader: leaderUid,
        members: initialMembers
      };

      await set(ref(db, `mw_organizations/${mapId}/${cleanId}`), payload);

      // Default Org Chat
      const orgChatRef = ref(db, `mw_chats/${mapId}/org_chat_${cleanId}`);
      await set(orgChatRef, {
        id: `org_chat_${cleanId}`,
        name: `Chat Tổ Chức: ${orgForm.name}`,
        description: `Phòng trò chuyện nội bộ cho toàn bộ thành viên của tổ chức ${orgForm.name}.`,
        type: 'org',
        orgId: cleanId,
        isPublic: orgForm.isPublic,
        requireApproval: false,
        createdBy: leaderUid,
        createdAt: Date.now(),
        members: initialMembers
      });

      alert('Tạo tổ chức thành công!');
      setShowCreate(false);
      setOrgForm({
        id: '',
        name: '',
        description: '',
        isPublic: true,
        requireApproval: false,
        questions: []
      });
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteOrg = async (orgIdToDelete: string) => {
    if (!db) return;
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN Tổ chức "${orgIdToDelete}"?`)) return;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_organizations/${mapId}/${orgIdToDelete}`));
      await remove(ref(db, `mw_chats/${mapId}/org_chat_${orgIdToDelete}`));
      alert(`Đã xóa tổ chức ${orgIdToDelete}!`);
      setSelectedOrg(null);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleJoinOrg = async (org: any) => {
    if (!currentUid) {
      alert("Vui lòng đăng nhập tài khoản EduSpace / ND Labs để tham gia tổ chức.");
      return;
    }

    if (org.requireApproval && org.questions && org.questions.length > 0) {
      setJoiningOrg(org);
    } else {
      try {
        const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
        await update(ref(db, `mw_organizations/${mapId}/${org.id}/members/${currentUid}`), {
          role: 'member',
          roleName: 'Thành viên',
          name: sessionUser?.displayName || user?.displayName || 'Thành viên',
          joinedAt: Date.now()
        });

        // Add to org chat
        await update(ref(db, `mw_chats/${mapId}/org_chat_${org.id}/members/${currentUid}`), {
          role: 'member',
          name: sessionUser?.displayName || user?.displayName || 'Thành viên',
          joinedAt: Date.now()
        });

        alert(`Bạn đã tham gia tổ chức "${org.name}" thành công!`);
      } catch (err: any) {
        alert("Lỗi tham gia: " + err.message);
      }
    }
  };

  const handleSubmitJoinOrgRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !joiningOrg || !currentUid) return;
    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const reqRef = ref(db, `mw_organizations/${mapId}/${joiningOrg.id}/requests/${currentUid}`);
      await set(reqRef, {
        userId: currentUid,
        name: sessionUser?.displayName || user?.displayName || 'Thành viên',
        answers: joinAnswers,
        timestamp: Date.now(),
        status: 'pending'
      });
      alert('Đã gửi đơn xin gia nhập kèm câu trả lời! Vui lòng chờ Trưởng tổ chức xét duyệt.');
      setJoiningOrg(null);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleAddMemberToOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedOrg || !newMemberId) return;
    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const roleDisplayName = newMemberRole === 'leader' ? 'Trưởng tổ chức' :
                              newMemberRole === 'co_leader' ? 'Phó tổ chức' :
                              newMemberRole === 'custom' ? (customRoleName || 'Tùy chỉnh') : 'Thành viên';

      await update(ref(db, `mw_organizations/${mapId}/${selectedOrg.id}/members/${newMemberId}`), {
        role: newMemberRole,
        roleName: roleDisplayName,
        name: newMemberName || newMemberId,
        joinedAt: Date.now()
      });

      await update(ref(db, `mw_chats/${mapId}/org_chat_${selectedOrg.id}/members/${newMemberId}`), {
        role: newMemberRole,
        name: newMemberName || newMemberId,
        joinedAt: Date.now()
      });

      alert(`Đã thêm thành viên ${newMemberName || newMemberId} vào tổ chức!`);
      setNewMemberId('');
      setNewMemberName('');
      setCustomRoleName('');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleRemoveMember = async (memberKey: string) => {
    if (!db || !selectedOrg || !confirm(`Xóa thành viên ${memberKey}?`)) return;
    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_organizations/${mapId}/${selectedOrg.id}/members/${memberKey}`));
      await remove(ref(db, `mw_chats/${mapId}/org_chat_${selectedOrg.id}/members/${memberKey}`));
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleUpdateOrgDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedOrg) return;
    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await update(ref(db, `mw_organizations/${mapId}/${selectedOrg.id}`), {
        name: selectedOrg.name,
        description: selectedOrg.description,
        isPublic: selectedOrg.isPublic
      });
      setIsEditingOrg(false);
      alert('Đã cập nhật thông tin tổ chức!');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>🏢</span> Danh Sách Tổ Chức & Bang Hội
          </h2>
          <p className="text-xs text-slate-500 font-medium">Bản đồ {mapData?.name || mapId} • Sắp xếp theo số lượng thành viên</p>
        </div>

        <button 
          onClick={() => setShowCreate(!showCreate)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
        >
          {showCreate ? '✕ Đóng' : '➕ Tạo Tổ chức mới'}
        </button>
      </div>

      {/* Create Org Form */}
      {showCreate && (
        <div className="glass p-6 md:p-8 rounded-3xl animate-in slide-in-from-top-4 border border-indigo-200 shadow-xl bg-white">
          <h3 className="text-base font-black text-slate-800 mb-4">Khởi Tạo Tổ Chức Mới Trong Map</h3>
          <form onSubmit={handleCreateOrg} className="space-y-4 max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  ID Tổ chức (Không dấu) *
                </label>
                <input 
                  required 
                  type="text" 
                  value={orgForm.id} 
                  onChange={e => setOrgForm({...orgForm, id: e.target.value})} 
                  placeholder="vd: bang_rong" 
                  className={`w-full bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 border ${isOrgIdDuplicate ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'} focus:outline-none focus:border-indigo-500`} 
                />
                {isOrgIdDuplicate && (
                  <div className="text-[11px] text-rose-600 font-bold mt-1">⚠️ ID tổ chức này đã tồn tại trong bản đồ!</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên Tổ chức *</label>
                <input 
                  required 
                  type="text" 
                  value={orgForm.name} 
                  onChange={e => setOrgForm({...orgForm, name: e.target.value})} 
                  placeholder="Tên hiển thị" 
                  className="w-full bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Mô tả tổ chức</label>
              <textarea 
                value={orgForm.description} 
                onChange={e => setOrgForm({...orgForm, description: e.target.value})} 
                placeholder="Giới thiệu về tôn chỉ, điều luật..." 
                className="w-full bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 border border-slate-200 h-20 focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={orgForm.isPublic} 
                  onChange={e => setOrgForm({...orgForm, isPublic: e.target.checked})} 
                  className="rounded text-indigo-600" 
                />
                Công khai tổ chức
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={orgForm.requireApproval} 
                  onChange={e => setOrgForm({...orgForm, requireApproval: e.target.checked})} 
                  className="rounded text-indigo-600" 
                />
                Cần xét duyệt khi xin vào
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isOrgIdDuplicate}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50"
            >
              Hoàn Tất Tạo Tổ Chức
            </button>
          </form>
        </div>
      )}

      {/* Sub-tab Filter Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit gap-1">
        <button
          onClick={() => setOrgSubTab('all')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${orgSubTab === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <span>🏢</span> Tất cả tổ chức ({orgs.length})
        </button>
        <button
          onClick={() => setOrgSubTab('joined')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${orgSubTab === 'joined' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <span>🌟</span> Tổ chức đã tham gia ({joinedOrgs.length})
        </button>
      </div>

      {/* Grid of Orgs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedOrgs.map(org => {
          const isMember = currentUid && org.members && org.members[currentUid];
          const isDefaultOrg = org.isDefault || org.id === 'default_org';

          return (
            <div 
              key={org.id} 
              className={`glass p-6 rounded-3xl flex flex-col h-full border ${isDefaultOrg ? 'border-sky-300 bg-sky-50/30' : 'border-slate-200/90 bg-white'} shadow-md hover:border-indigo-400 hover:shadow-xl transition-all`}
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-slate-800">{org.name}</h3>
                    {isDefaultOrg && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-300 whitespace-nowrap">
                        Mặc định toàn map
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {org.id}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${org.isPublic ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                  {org.isPublic ? 'Công khai' : 'Riêng tư'}
                </span>
              </div>

              <p className="text-xs text-slate-600 flex-1 mb-4 line-clamp-3 leading-relaxed">
                {org.description || (isDefaultOrg ? 'Tổ chức cộng đồng toàn dân mặc định của bản đồ (mọi cư dân đều thuộc tổ chức này).' : 'Không có mô tả nào.')}
              </p>
              
              <div className="flex flex-wrap items-center justify-between mt-auto pt-4 border-t border-slate-100 text-xs gap-2">
                <div className="text-slate-500 font-medium">
                  👥 {Object.keys(org.members || {}).length} thành viên
                </div>

                <div className="flex items-center gap-2">
                  {!isMember ? (
                    <button
                      onClick={() => handleJoinOrg(org)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      + Tham gia
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                      ✓ Đã tham gia
                    </span>
                  )}

                  <button 
                    onClick={() => setSelectedOrg(org)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Chi tiết →
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {displayedOrgs.length === 0 && !showCreate && (
          <div className="col-span-full glass p-12 rounded-3xl text-center text-slate-400 bg-white">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-sm font-bold text-slate-600">
              {orgSubTab === 'joined' ? 'Bạn chưa tham gia tổ chức nào.' : 'Chưa có tổ chức nào trong bản đồ này.'}
            </p>
            <button 
              onClick={() => setShowCreate(true)} 
              className="mt-3 text-xs text-indigo-600 hover:underline font-bold"
            >
              + Hãy tạo tổ chức đầu tiên ngay!
            </button>
          </div>
        )}
      </div>

      {/* Org Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col bg-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>🏢</span> {selectedOrg.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: <span className="text-indigo-600 font-bold">{selectedOrg.id}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrg(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-5 custom-scrollbar pr-2 text-xs">
              {/* Description & Edit */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mô tả tổ chức</span>
                  {(isAdmin || selectedOrg.leader === currentUid) && (
                    <button
                      onClick={() => setIsEditingOrg(!isEditingOrg)}
                      className="text-indigo-600 hover:underline font-bold text-xs"
                    >
                      {isEditingOrg ? 'Hủy sửa' : '✏️ Chỉnh sửa thông tin'}
                    </button>
                  )}
                </div>

                {isEditingOrg ? (
                  <form onSubmit={handleUpdateOrgDetails} className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={selectedOrg.name}
                      onChange={e => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                    <textarea
                      value={selectedOrg.description}
                      onChange={e => setSelectedOrg({ ...selectedOrg, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 h-16"
                    ></textarea>
                    <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                      Lưu thay đổi
                    </button>
                  </form>
                ) : (
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedOrg.description || 'Không có mô tả.'}</p>
                )}
              </div>

              {/* Chat of this Organization */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-indigo-900 text-xs">Phòng Chat Nội Bộ Tổ Chức</h4>
                  <p className="text-[11px] text-indigo-600 mt-0.5">Dành riêng cho các thành viên trong tổ chức {selectedOrg.name}</p>
                </div>
                <a
                  href={`/games/miniworld.html?map=${mapId}&chat=org_chat_${selectedOrg.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-500/20"
                >
                  💬 Mở Chat Tổ Chức
                </a>
              </div>

              {/* Add member form (Leader / Admin) */}
              {(isAdmin || selectedOrg.leader === currentUid) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thêm Thành Viên Trực Tiếp</h4>
                    <button
                      onClick={() => setApprovingOrg({ type: 'org', id: selectedOrg.id, title: selectedOrg.name, mapId })}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      Duyệt thành viên xin vào →
                    </button>
                  </div>

                  <form onSubmit={handleAddMemberToOrg} className="space-y-3">
                    <UserSearchInput 
                      value={newMemberId}
                      selectedName={newMemberName}
                      onChange={(val, name) => {
                        setNewMemberId(val);
                        setNewMemberName(name || '');
                      }}
                      placeholder="Tìm Tên, NDID hoặc CodeID..."
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={newMemberRole} 
                        onChange={e => setNewMemberRole(e.target.value)} 
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="leader">👑 Trưởng tổ chức</option>
                        <option value="co_leader">🛡️ Phó tổ chức</option>
                        <option value="member">🎮 Thành viên</option>
                        <option value="custom">⚙️ Tùy chỉnh vai trò</option>
                      </select>

                      {newMemberRole === 'custom' && (
                        <input 
                          type="text" 
                          placeholder="Tên chức vụ..." 
                          value={customRoleName} 
                          onChange={e => setCustomRoleName(e.target.value)} 
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        />
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      + Thêm vào tổ chức
                    </button>
                  </form>
                </div>
              )}

              {/* Member list */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Danh Sách Thành Viên ({Object.keys(selectedOrg.members || {}).length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {Object.entries(selectedOrg.members || {}).map(([key, info]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{info.name || key}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NDID: @{key}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                          {info.roleName || info.role || 'Thành viên'}
                        </span>
                        {(isAdmin || selectedOrg.leader === currentUid) && (
                          <button 
                            onClick={() => handleRemoveMember(key)} 
                            className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                            title="Xóa thành viên"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              {(isAdmin || selectedOrg.leader === currentUid) && (
                <button
                  onClick={() => handleDeleteOrg(selectedOrg.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors"
                >
                  🗑️ Xóa Tổ Chức
                </button>
              )}

              <button 
                onClick={() => setSelectedOrg(null)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-2xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Questions to Join Org Modal */}
      {joiningOrg && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white">
            <h3 className="text-base font-black text-slate-800 mb-1">Gia nhập: {joiningOrg.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Vui lòng trả lời các câu hỏi xét duyệt của tổ chức:</p>

            <form onSubmit={handleSubmitJoinOrgRequest} className="space-y-4">
              {joiningOrg.questions?.map((q: any, idx: number) => (
                <div key={q.id || idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {idx + 1}. {q.title}
                  </label>
                  <textarea
                    required
                    value={joinAnswers[q.id || idx] || ''}
                    onChange={e => setJoinAnswers({ ...joinAnswers, [q.id || idx]: e.target.value })}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 h-16 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoiningOrg(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  Gửi Đơn Xin Gia Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approvals Modal for Organization */}
      {approvingOrg && (
        <ApprovalManagementModal
          type="org"
          targetId={approvingOrg.id}
          mapId={mapId}
          title={approvingOrg.title}
          onClose={() => setApprovingOrg(null)}
        />
      )}
    </div>
  );
};
