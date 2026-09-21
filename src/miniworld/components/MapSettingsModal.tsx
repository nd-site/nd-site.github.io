import React, { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';

interface MapSettingsModalProps {
  mapId: string;
  mapData: any;
  onClose: () => void;
}

export const MapSettingsModal: React.FC<MapSettingsModalProps> = ({
  mapId,
  mapData,
  onClose
}) => {
  const { db, isAdmin } = useFirebase();

  const [name, setName] = useState(mapData?.name || '');
  const [code, setCode] = useState(mapData?.code || '');
  const [baseUnitName, setBaseUnitName] = useState(mapData?.baseUnitName || 'đồng');
  const [description, setDescription] = useState(mapData?.description || '');
  const [isPublic, setIsPublic] = useState(mapData?.isPublic !== false);
  const [requireApproval, setRequireApproval] = useState(!!mapData?.requireApproval);
  const [questions, setQuestions] = useState<any[]>(mapData?.questions || []);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) return;
    setQuestions([
      ...questions,
      {
        id: 'q_' + Date.now(),
        title: newQuestionTitle.trim(),
        type: 'text'
      }
    ]);
    setNewQuestionTitle('');
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);

    try {
      const { ref, update, get, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const cleanBase = baseUnitName.trim() || 'đồng';

      await update(ref(db, `mw_maps/${mapId}`), {
        name: name.trim() || `Bản đồ ${mapId}`,
        code: code.trim(),
        baseUnitName: cleanBase,
        description: description.trim(),
        isPublic,
        requireApproval,
        questions: requireApproval ? questions : [],
        updatedAt: Date.now()
      });

      // Keep currencies in sync with baseUnitName
      const currSnap = await get(ref(db, `mw_maps/${mapId}/currencies`));
      if (currSnap.exists()) {
        const currs = currSnap.val();
        if (!currs[cleanBase]) {
          currs[cleanBase] = 1;
          await set(ref(db, `mw_maps/${mapId}/currencies`), currs);
        }
      }

      alert("🎉 Đã lưu thông tin bản đồ thành công!");
      onClose();
    } catch (err: any) {
      alert("Lỗi lưu bản đồ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMap = async () => {
    if (!db) return;
    if (!confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN Bản đồ "${mapId}" cùng toàn bộ dữ liệu giao dịch, tổ chức và tin nhắn không?`)) return;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_maps/${mapId}`));
      await remove(ref(db, `mw_transactions/${mapId}`));
      await remove(ref(db, `mw_transaction_types/${mapId}`));
      await remove(ref(db, `mw_organizations/${mapId}`));
      await remove(ref(db, `mw_chats/${mapId}`));
      await remove(ref(db, `mw_messages/${mapId}`));

      alert(`Đã xóa vĩnh viễn bản đồ ${mapId}!`);
      window.location.href = '/games/miniworld/';
    } catch (e: any) {
      alert("Lỗi xóa bản đồ: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-modal max-w-xl w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col bg-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>⚙️</span> Chỉnh Sửa Thông Tin Bản Đồ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật thông tin chi tiết, đơn vị tiền tệ gốc và quyền riêng tư bản đồ.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Bản Đồ *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="vd: Thế Giới Sinh Tồn"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Bản Đồ (Code Game)</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="vd: 12345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đơn Vị Tiền Tệ Gốc *</label>
            <input
              type="text"
              required
              value={baseUnitName}
              onChange={e => setBaseUnitName(e.target.value)}
              placeholder="vd: xu, coin, gem, đồng, vàng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Được tự do đặt tên và đổi bất cứ lúc nào.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô Tả & Quy Định Bản Đồ</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Giới thiệu về bản đồ, luật chơi, thông tin liên hệ..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          {/* Privacy & Approvals */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Cấu Hình Quyền Riêng Tư</h4>
            
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Công khai bản đồ (Ai cũng có thể tìm thấy)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={e => setRequireApproval(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Xét duyệt người chơi khi xin vào map
              </label>
            </div>

            {/* Questions list if requireApproval */}
            {requireApproval && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <label className="block font-bold text-slate-700 text-[11px]">
                  Câu Hỏi Khảo Sát / Xét Duyệt ({questions.length})
                </label>

                <div className="space-y-1.5">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                      <span><strong>Câu {idx + 1}:</strong> {q.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập nội dung câu hỏi xét duyệt mới..."
                    value={newQuestionTitle}
                    onChange={e => setNewQuestionTitle(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    + Thêm câu hỏi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleDeleteMap}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors"
            >
              🗑️ Xóa Vĩnh Viễn Bản Đồ
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-2xl text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-6 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 text-xs uppercase tracking-wider"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
