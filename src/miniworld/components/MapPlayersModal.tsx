import React, { useState, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { UserSearchInput } from './UserSearchInput';
import { ApprovalManagementModal } from './ApprovalManagementModal';

interface MapPlayersModalProps {
  mapId: string;
  mapData: any;
  onClose: () => void;
}

export const MapPlayersModal: React.FC<MapPlayersModalProps> = ({
  mapId,
  mapData,
  onClose
}) => {
  const { db, user, isAdmin, sessionUser } = useFirebase();
  const currentUid = user?.uid || sessionUser?.uid || sessionUser?.ndid;

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('player');
  const [customRoleName, setCustomRoleName] = useState('');
  const [showApprovals, setShowApprovals] = useState(false);

  // Edit role state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('player');
  const [editingCustomRole, setEditingCustomRole] = useState<string>('');

  const isMapOwner = useMemo(() => {
    if (isAdmin) return true;
    if (!mapData?.players || !currentUid) return false;
    const playerObj = mapData.players[currentUid];
    return playerObj?.role === 'owner' || playerObj === 'owner';
  }, [mapData, currentUid, isAdmin]);

  const playerEntries = useMemo(() => {
    if (!mapData?.players) return [];
    return Object.entries(mapData.players).map(([uid, info]: [string, any]) => {
      const role = typeof info === 'object' ? (info.role || 'player') : info;
      const roleName = typeof info === 'object' ? (info.roleName || '') : '';
      const name = typeof info === 'object' ? (info.name || uid) : uid;
      const joinedAt = typeof info === 'object' ? (info.joinedAt || 0) : 0;
      return {
        uid,
        name,
        role,
        roleName,
        joinedAt
      };
    });
  }, [mapData]);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return playerEntries;
    const q = searchQuery.toLowerCase().trim();
    return playerEntries.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.uid.toLowerCase().includes(q) ||
      (p.roleName && p.roleName.toLowerCase().includes(q)) ||
      p.role.toLowerCase().includes(q)
    );
  }, [playerEntries, searchQuery]);

  const getRoleBadge = (role: string, customName?: string) => {
    if (customName) {
      return (
        <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
          <span>⚙️</span> {customName}
        </span>
      );
    }
    switch (role) {
      case 'owner':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
            <span>👑</span> Chủ Bản Đồ
          </span>
        );
      case 'deputy':
      case 'co_owner':
        return (
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <span>🛡️</span> Phó Phòng
          </span>
        );
      case 'moderator':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <span>⚖️</span> Trọng Tài
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <span>👤</span> Cư Dân / Người Chơi
          </span>
        );
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !db) return;
    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const cleanUid = newUserId.trim();
      const rolePayload = {
        role: newUserRole === 'custom' ? 'custom' : newUserRole,
        roleName: newUserRole === 'custom' ? customRoleName.trim() : (
          newUserRole === 'owner' ? 'Chủ Bản Đồ' :
          newUserRole === 'deputy' ? 'Phó Phòng' :
          newUserRole === 'moderator' ? 'Trọng Tài' : 'Cư Dân'
        ),
        name: newUserName || cleanUid,
        joinedAt: Date.now()
      };

      await update(ref(db, `mw_maps/${mapId}/players/${cleanUid}`), rolePayload);

      // Also add to default organization
      try {
        await update(ref(db, `mw_organizations/${mapId}/default_org/members/${cleanUid}`), {
          role: newUserRole === 'owner' ? 'leader' : 'member',
          roleName: newUserRole === 'owner' ? 'Chủ Bản Đồ' : 'Cư Dân',
          name: newUserName || cleanUid,
          joinedAt: Date.now()
        });
      } catch (_) {}

      alert(`🎉 Đã thêm thành viên "${newUserName || cleanUid}" vào bản đồ!`);
      setNewUserId('');
      setNewUserName('');
      setNewUserRole('player');
      setCustomRoleName('');
      setShowAddMember(false);
    } catch (err: any) {
      alert("Lỗi thêm thành viên: " + err.message);
    }
  };

  const handleSaveRoleChange = async (targetUid: string) => {
    if (!db) return;
    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      
      const rolePayload = {
        role: editingRole === 'custom' ? 'custom' : editingRole,
        roleName: editingRole === 'custom' ? editingCustomRole.trim() : (
          editingRole === 'owner' ? 'Chủ Bản Đồ' :
          editingRole === 'deputy' ? 'Phó Phòng' :
          editingRole === 'moderator' ? 'Trọng Tài' : 'Cư Dân'
        )
      };

      await update(ref(db, `mw_maps/${mapId}/players/${targetUid}`), rolePayload);
      alert('Đã cập nhật vai trò thành viên!');
      setEditingUserId(null);
    } catch (e: any) {
      alert("Lỗi cập nhật vai trò: " + e.message);
    }
  };

  const handleRemoveMember = async (targetUid: string, targetName: string) => {
    if (!db || !isMapOwner) return;
    if (targetUid === currentUid && !isAdmin) {
      return alert("Bạn không thể tự xóa chính mình khỏi danh sách Chủ phòng.");
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${targetName || targetUid}" khỏi bản đồ không?`)) return;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_maps/${mapId}/players/${targetUid}`));
      alert(`Đã xóa thành viên "${targetName || targetUid}" khỏi bản đồ.`);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col bg-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>👥</span> Quản Lý Thành Viên Bản Đồ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bản đồ: <strong className="text-blue-600">{mapData?.name || mapId}</strong> • Tổng cộng: <strong className="text-slate-800">{playerEntries.length}</strong> thành viên
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
          >
            ✕
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm theo tên, NDID hoặc vai trò..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {isMapOwner && (
              <>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>{showAddMember ? '✕ Đóng' : '➕ Thêm thành viên'}</span>
                </button>

                {mapData?.requireApproval && (
                  <button
                    onClick={() => setShowApprovals(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>📋</span> Duyệt đơn xin vào
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Member Form (For Owner / Admin) */}
        {showAddMember && isMapOwner && (
          <form onSubmit={handleAddMember} className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 mb-4 space-y-3 animate-in slide-in-from-top-2">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Thêm Người Chơi Trực Tiếp Vào Bản Đồ</h4>
            
            <UserSearchInput
              value={newUserId}
              selectedName={newUserName}
              onChange={(val, name) => {
                setNewUserId(val);
                setNewUserName(name || '');
              }}
              placeholder="Tìm Tên, NDID hoặc CodeID người chơi..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="owner">👑 Chủ Bản Đồ</option>
                <option value="deputy">🛡️ Phó Phòng</option>
                <option value="moderator">⚖️ Trọng Tài</option>
                <option value="player">👤 Cư Dân / Người Chơi</option>
                <option value="custom">⚙️ Tùy chỉnh tên vai trò</option>
              </select>

              {newUserRole === 'custom' && (
                <input
                  type="text"
                  required
                  placeholder="Nhập tên chức vụ (vd: Quan tòa, Cảnh sát...)"
                  value={customRoleName}
                  onChange={e => setCustomRoleName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
            >
              + Hoàn Tất Thêm Thành Viên
            </button>
          </form>
        )}

        {/* Players List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {filteredPlayers.map(player => {
            const isEditing = editingUserId === player.uid;

            return (
              <div
                key={player.uid}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    {player.name ? player.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {player.uid === currentUid && (
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">Bạn</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">NDID: {player.uid}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isEditing ? (
                    <>
                      {getRoleBadge(player.role, player.roleName)}

                      {isMapOwner && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => {
                              setEditingUserId(player.uid);
                              setEditingRole(player.role === 'custom' ? 'custom' : player.role);
                              setEditingCustomRole(player.roleName || '');
                            }}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold transition-colors"
                            title="Chỉnh sửa vai trò"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => handleRemoveMember(player.uid, player.name)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold transition-colors"
                            title="Xóa khỏi bản đồ"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-blue-200 shadow-sm">
                      <select
                        value={editingRole}
                        onChange={e => setEditingRole(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="owner">👑 Chủ Bản Đồ</option>
                        <option value="deputy">🛡️ Phó Phòng</option>
                        <option value="moderator">⚖️ Trọng Tài</option>
                        <option value="player">👤 Cư Dân</option>
                        <option value="custom">⚙️ Tùy chỉnh</option>
                      </select>

                      {editingRole === 'custom' && (
                        <input
                          type="text"
                          placeholder="Tên chức danh..."
                          value={editingCustomRole}
                          onChange={e => setEditingCustomRole(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 text-slate-800"
                        />
                      )}

                      <button
                        onClick={() => handleSaveRoleChange(player.uid)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                      >
                        ✓ Lưu
                      </button>

                      <button
                        onClick={() => setEditingUserId(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredPlayers.length === 0 && (
            <div className="text-center text-slate-400 py-12 text-xs">
              Không tìm thấy thành viên nào phù hợp với từ khóa "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-2xl text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Approvals Modal */}
      {showApprovals && (
        <ApprovalManagementModal
          type="map"
          targetId={mapId}
          mapId={mapId}
          title={mapData?.name || mapId}
          onClose={() => setShowApprovals(false)}
        />
      )}
    </div>
  );
};
