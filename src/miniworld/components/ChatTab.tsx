import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { ApprovalManagementModal } from './ApprovalManagementModal';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'text';
  title: string;
  options?: string[];
}

export const ChatTab = ({ mapId }: { mapId: string }) => {
  const { db, user, isAdmin, sessionUser } = useFirebase();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [approvingChat, setApprovingChat] = useState<any>(null);
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Room creation state
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    type: 'map' as 'map' | 'org' | 'custom',
    orgId: '',
    isPublic: true,
    requireApproval: false,
    onlyLeadersCanChat: false,
    questions: [] as Question[]
  });

  // Joining state via invite link
  const [joiningRoom, setJoiningRoom] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});

  // Fetch Orgs for chat type selection
  useEffect(() => {
    if (!db || !mapId) return;
    const fetchOrgs = async () => {
      const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      onValue(ref(db, `mw_organizations/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setOrgs(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        }
      });
    };
    fetchOrgs();
  }, [db, mapId]);

  // Fetch Rooms
  useEffect(() => {
    if (!db || !mapId) return;
    const fetchRooms = async () => {
      const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      onValue(ref(db, `mw_chats/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          setRooms(list);

          // Check invite query param
          const params = new URLSearchParams(window.location.search);
          const joinChatId = params.get('joinChat');
          if (joinChatId) {
            const target = list.find(r => r.id === joinChatId);
            if (target) {
              const isMember = isAdmin || (target.members && user?.uid && target.members[user.uid]);
              if (!isMember) {
                setJoiningRoom(target);
              } else {
                setActiveRoom(target);
              }
            }
          }
        } else {
          setRooms([]);
        }
      });
    };
    fetchRooms();
  }, [db, mapId, user, isAdmin]);

  // Fetch Messages for active room
  useEffect(() => {
    if (!db || !mapId || !activeRoom) return;
    const fetchMsgs = async () => {
      const { ref, onValue, query, orderByChild, limitToLast } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const msgRef = query(ref(db, `mw_messages/${mapId}/${activeRoom.id}`), orderByChild('timestamp'), limitToLast(60));
      onValue(msgRef, (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
          setMessages([]);
        }
      });
    };
    fetchMsgs();
  }, [db, mapId, activeRoom]);

  const isRoomLeader = useMemo(() => {
    if (isAdmin) return true;
    if (!activeRoom || !user) return false;
    if (activeRoom.createdBy === user.uid) return true;
    const memberObj = activeRoom.members ? activeRoom.members[user.uid] : null;
    if (memberObj && (memberObj.role === 'owner' || memberObj.role === 'leader' || memberObj.role === 'co_owner' || memberObj.role === 'co_leader')) return true;
    return false;
  }, [activeRoom, user, isAdmin]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      let fileUrl = '';
      if ((window as any).uploadToCloudflare) {
        fileUrl = await (window as any).uploadToCloudflare(file, { folder: 'mw_chat_files' });
      } else {
        fileUrl = URL.createObjectURL(file);
      }

      let cat = 'file';
      if (file.type.startsWith('image/')) cat = 'image';
      else if (file.type.startsWith('video/')) cat = 'video';
      else if (file.type.startsWith('audio/')) cat = 'audio';

      const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };

      setAttachedFile({
        url: fileUrl,
        name: file.name,
        sizeFormatted: formatBytes(file.size),
        type: file.type,
        category: cat
      });
    } catch (err: any) {
      alert("Lỗi tải tệp: " + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !activeRoom || !db) return;
    if (activeRoom.onlyLeadersCanChat && !isRoomLeader) {
      return alert("Phòng chat này đang bật chế độ chỉ Trưởng / Phó phòng được nhắn tin.");
    }
    
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const msgRef = push(ref(db, `mw_messages/${mapId}/${activeRoom.id}`));
      
      const payload: any = {
        text: newMessage.trim(),
        senderId: user?.uid || 'guest',
        senderName: sessionUser?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ND Member',
        isLeader: isRoomLeader,
        timestamp: Date.now()
      };

      if (attachedFile) {
        payload.file = attachedFile;
      }
      
      await set(msgRef, payload);
      setNewMessage('');
      setAttachedFile(null);
    } catch (err: any) {
      alert("Lỗi gửi tin nhắn: " + err.message);
    }
  };

  const handleAddQuestion = () => {
    const qId = Date.now().toString();
    setRoomForm({
      ...roomForm,
      questions: [
        ...roomForm.questions,
        {
          id: qId,
          type: 'single',
          title: '',
          options: ['Lựa chọn 1', 'Lựa chọn 2']
        }
      ]
    });
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name || !db) return;
    
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const newRoomRef = push(ref(db, `mw_chats/${mapId}`));
      const roomId = newRoomRef.key;

      const payload = {
        ...roomForm,
        id: roomId,
        createdBy: user?.uid || 'anonymous',
        createdAt: Date.now(),
        members: {
          [user?.uid || 'anonymous']: {
            role: 'owner',
            name: sessionUser?.displayName || user?.displayName || 'Chủ phòng',
            joinedAt: Date.now()
          }
        }
      };

      await set(newRoomRef, payload);
      alert("Tạo phòng chat thành công!");
      setShowCreateModal(false);
      setRoomForm({
        name: '',
        description: '',
        type: 'map',
        orgId: '',
        isPublic: true,
        requireApproval: false,
        onlyLeadersCanChat: false,
        questions: []
      });
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleSubmitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !joiningRoom) return;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const uid = user?.uid || 'anonymous';

      if (joiningRoom.requireApproval) {
        const reqRef = ref(db, `mw_chats/${mapId}/${joiningRoom.id}/requests/${uid}`);
        await set(reqRef, {
          userId: uid,
          name: sessionUser?.displayName || user?.displayName || 'Người dùng',
          answers: userAnswers,
          timestamp: Date.now(),
          status: 'pending'
        });
        alert('Đã gửi yêu cầu tham gia kèm câu trả lời! Vui lòng chờ chủ phòng duyệt.');
      } else {
        const memberRef = ref(db, `mw_chats/${mapId}/${joiningRoom.id}/members/${uid}`);
        await set(memberRef, {
          role: 'member',
          name: sessionUser?.displayName || user?.displayName || 'Thành viên',
          joinedAt: Date.now()
        });
        alert('Đã tham gia phòng chat thành công!');
        setActiveRoom(joiningRoom);
      }
      setJoiningRoom(null);
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] gap-6">
      {/* Sidebar - Room List */}
      <div className="w-full lg:w-1/3 glass rounded-3xl p-5 flex flex-col border border-slate-200/90 shadow-md bg-white">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span>💬</span> Phòng Trò Chuyện
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Phòng Map, Tổ chức & Nhóm riêng</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>+</span> Tạo phòng
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {rooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => setActiveRoom(room)}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${activeRoom?.id === room.id ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-md scale-[1.01]' : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200 text-slate-700'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xs truncate max-w-[70%]">{room.name}</h3>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${room.type === 'map' ? 'bg-blue-100 text-blue-700' : room.type === 'org' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {room.type === 'map' ? 'Map' : room.type === 'org' ? 'Tổ chức' : 'Nhóm'}
                </span>
              </div>

              {room.description && (
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">{room.description}</p>
              )}
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
                <span>👥 {Object.keys(room.members || {}).length} thành viên</span>
                <span>{room.onlyLeadersCanChat ? '🔒 Chỉ Trưởng/Phó' : (room.isPublic ? '🌐 Công khai' : '🔒 Riêng tư')}</span>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="text-slate-400 text-center text-xs py-12">
              Chưa có phòng chat nào. Hãy tạo phòng mới!
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-full lg:w-2/3 glass rounded-3xl flex flex-col overflow-hidden border border-slate-200/90 shadow-md bg-white">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/80 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <span>💬</span> {activeRoom.name}
                </h3>
                <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{Object.keys(activeRoom.members || {}).length} thành viên</span>
                  <span>•</span>
                  <span>Link mời:</span>
                  <span 
                    onClick={() => {
                      const url = `${window.location.origin}/games/miniworld.html?map=${mapId}&joinChat=${activeRoom.id}`;
                      navigator.clipboard.writeText(url);
                      alert('Đã copy link mời vào clipboard!');
                    }}
                    title="Click để copy link"
                    className="text-blue-600 hover:underline select-all cursor-pointer font-mono bg-blue-100/70 px-2 py-0.5 rounded-lg border border-blue-200 text-[10px]"
                  >
                    /games/miniworld.html?map={mapId}&joinChat={activeRoom.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRoomLeader && activeRoom.requireApproval && (
                  <button
                    onClick={() => setApprovingChat({ type: 'chat', id: activeRoom.id, title: activeRoom.name, mapId })}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl text-[11px] font-bold transition-all"
                  >
                    Duyệt xin vào →
                  </button>
                )}

                <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {activeRoom.onlyLeadersCanChat ? '🔒 Chỉ Trưởng/Phó chat' : (activeRoom.requireApproval ? '🛡️ Cần duyệt câu hỏi' : '⚡ Tự do vào')}
                </span>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/40">
              {messages.map(msg => {
                const isMine = msg.senderId === user?.uid;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                      {msg.isLeader && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Trưởng/Phó</span>}
                      {msg.senderName}
                      <span className="text-[9px] text-slate-400 font-normal">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-xs leading-relaxed break-words shadow-sm ${isMine ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                      {msg.text && <div>{msg.text}</div>}
                      {msg.file && (
                        <div className="mt-2 pt-1">
                          {msg.file.category === 'image' && (
                            <img src={msg.file.url} alt={msg.file.name} className="max-w-xs max-h-60 rounded-xl border border-white/20 object-cover" />
                          )}
                          {msg.file.category === 'video' && (
                            <video controls src={msg.file.url} className="max-w-xs rounded-xl border border-white/20" />
                          )}
                          {msg.file.category === 'audio' && (
                            <audio controls src={msg.file.url} className="w-full mt-1" />
                          )}
                          {msg.file.category === 'file' && (
                            <div className="flex items-center justify-between gap-3 bg-black/10 p-2.5 rounded-xl">
                              <div className="truncate">
                                <div className="font-bold truncate">{msg.file.name}</div>
                                <div className="text-[10px] opacity-75">{msg.file.sizeFormatted}</div>
                              </div>
                              <a
                                href={msg.file.url}
                                download={msg.file.name}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white text-blue-600 px-3 py-1 rounded-lg font-bold text-[11px] shrink-0"
                              >
                                Tải về
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="text-slate-400 text-center text-xs py-24">
                  Chưa có tin nhắn nào trong phòng này. Hãy gửi tin nhắn đầu tiên!
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-100">
              {attachedFile && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span>📎</span>
                    <span className="font-bold text-blue-800 truncate">{attachedFile.name}</span>
                    <span className="text-[10px] text-blue-500">({attachedFile.sizeFormatted})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-rose-600 font-bold px-2 py-0.5 hover:bg-rose-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <label className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors" title="Đính kèm tệp tin">
                  <span>📎</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                  />
                </label>

                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={activeRoom.onlyLeadersCanChat && !isRoomLeader ? "Phòng đang ở chế độ chỉ Trưởng / Phó phòng nhắn tin..." : "Nhập tin nhắn của bạn..."} 
                  disabled={activeRoom.onlyLeadersCanChat && !isRoomLeader}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={(activeRoom.onlyLeadersCanChat && !isRoomLeader) || isUploadingFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isUploadingFile ? 'Đang tải...' : 'Gửi'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mb-4 border border-blue-100">
              💬
            </div>
            <h4 className="text-slate-800 font-bold text-sm mb-1">Chọn một phòng chat</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Chọn phòng từ danh sách bên trái hoặc tạo phòng mới để bắt đầu trò chuyện real-time với các người chơi.
            </p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col bg-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-800">Tạo Phòng Chat Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên phòng chat *</label>
                <input 
                  required 
                  type="text" 
                  value={roomForm.name} 
                  onChange={e => setRoomForm({...roomForm, name: e.target.value})} 
                  placeholder="vd: Phòng Thảo Luận Map, Bang Hội..." 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mô tả phòng chat</label>
                <input 
                  type="text" 
                  value={roomForm.description} 
                  onChange={e => setRoomForm({...roomForm, description: e.target.value})} 
                  placeholder="Giới thiệu về mục đích trò chuyện..." 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cấp độ phòng</label>
                  <select 
                    value={roomForm.type} 
                    onChange={e => setRoomForm({...roomForm, type: e.target.value as any})} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="map">🗺️ Toàn Map</option>
                    <option value="org">🏢 Tổ chức</option>
                    <option value="custom">👥 Nhóm nhỏ riêng</option>
                  </select>
                </div>

                {roomForm.type === 'org' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Chọn tổ chức</label>
                    <select 
                      value={roomForm.orgId} 
                      onChange={e => setRoomForm({...roomForm, orgId: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Chọn tổ chức --</option>
                      {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={roomForm.isPublic} 
                    onChange={e => setRoomForm({...roomForm, isPublic: e.target.checked})} 
                    className="rounded text-blue-600" 
                  />
                  Phòng công khai
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={roomForm.requireApproval} 
                    onChange={e => setRoomForm({...roomForm, requireApproval: e.target.checked})} 
                    className="rounded text-blue-600" 
                  />
                  Cần duyệt câu hỏi khi vào
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={roomForm.onlyLeadersCanChat} 
                    onChange={e => setRoomForm({...roomForm, onlyLeadersCanChat: e.target.checked})} 
                    className="rounded text-blue-600" 
                  />
                  Chỉ Trưởng / Phó được nhắn tin
                </label>
              </div>

              {/* Questions Setup if Require Approval */}
              {roomForm.requireApproval && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Bộ câu hỏi duyệt thành viên</span>
                    <button 
                      type="button" 
                      onClick={handleAddQuestion} 
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-xl font-bold hover:bg-blue-200"
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>

                  {roomForm.questions.map((q, qIdx) => (
                    <div key={q.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={`Câu hỏi ${qIdx + 1}...`} 
                          value={q.title} 
                          onChange={e => {
                            const newQ = [...roomForm.questions];
                            newQ[qIdx].title = e.target.value;
                            setRoomForm({ ...roomForm, questions: newQ });
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                        <select 
                          value={q.type} 
                          onChange={e => {
                            const newQ = [...roomForm.questions];
                            newQ[qIdx].type = e.target.value as any;
                            setRoomForm({ ...roomForm, questions: newQ });
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] text-slate-800"
                        >
                          <option value="single">1 Lựa chọn</option>
                          <option value="multiple">Nhiều lựa chọn</option>
                          <option value="text">Tự trả lời</option>
                        </select>
                      </div>

                      {q.type !== 'text' && (
                        <div className="space-y-1.5 pl-2">
                          {q.options?.map((opt, oIdx) => (
                            <input 
                              key={oIdx} 
                              type="text" 
                              value={opt} 
                              onChange={e => {
                                const newQ = [...roomForm.questions];
                                newQ[qIdx].options![oIdx] = e.target.value;
                                setRoomForm({ ...roomForm, questions: newQ });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
              >
                Xác Nhận Tạo Phòng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Answer Questions to Join Modal */}
      {joiningRoom && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white">
            <h3 className="text-base font-black text-slate-800 mb-1">Tham gia phòng: {joiningRoom.name}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {joiningRoom.requireApproval ? 'Phòng này yêu cầu trả lời câu hỏi xét duyệt:' : 'Nhấn xác nhận để tham gia ngay.'}
            </p>

            <form onSubmit={handleSubmitJoinRequest} className="space-y-4">
              {joiningRoom.questions?.map((q: Question, idx: number) => (
                <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {idx + 1}. {q.title}
                  </label>

                  {q.type === 'text' && (
                    <textarea 
                      required 
                      value={userAnswers[q.id] || ''} 
                      onChange={e => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      placeholder="Nhập câu trả lời của bạn..." 
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 h-16 focus:outline-none focus:border-blue-500"
                    ></textarea>
                  )}

                  {q.type === 'single' && (
                    <div className="space-y-1.5">
                      {q.options?.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`q_${q.id}`} 
                            value={opt} 
                            checked={userAnswers[q.id] === opt} 
                            onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                            required
                            className="text-blue-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple' && (
                    <div className="space-y-1.5">
                      {q.options?.map((opt, optIdx) => {
                        const currentArr: string[] = userAnswers[q.id] || [];
                        return (
                          <label key={optIdx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={currentArr.includes(opt)} 
                              onChange={e => {
                                if (e.target.checked) {
                                  setUserAnswers({ ...userAnswers, [q.id]: [...currentArr, opt] });
                                } else {
                                  setUserAnswers({ ...userAnswers, [q.id]: currentArr.filter(x => x !== opt) });
                                }
                              }}
                              className="text-blue-600 rounded" 
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setJoiningRoom(null)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  Xác Nhận Tham Gia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approvals Modal for Chat */}
      {approvingChat && (
        <ApprovalManagementModal
          type="chat"
          targetId={approvingChat.id}
          mapId={mapId}
          title={approvingChat.title}
          onClose={() => setApprovingChat(null)}
        />
      )}
    </div>
  );
};
