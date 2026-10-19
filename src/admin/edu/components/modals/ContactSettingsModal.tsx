import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Globe, MessageSquare, ExternalLink, Save } from 'lucide-react';
import { getFirebaseInstance } from '../../services/firebaseService';

interface ContactItem {
  name: string;
  url: string;
  icon?: string;
  logo?: string;
  color?: string;
}

interface ContactSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  {
    name: 'ChatND với Admin (Xin duyệt Giáo viên)',
    url: '/chat?admin',
    icon: 'message-square',
    logo: '/assets/images/logo.png',
    color: '#0284c7',
  },
  {
    name: 'Facebook ND Labs',
    url: 'https://facebook.com/ndlabs.nd',
    icon: 'facebook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
    color: '#1877F2',
  },
  {
    name: 'Messenger ND Labs',
    url: 'https://m.me/ndlabs.nd',
    icon: 'message-circle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg',
    color: '#0084FF',
  },
];

export const ContactSettingsModal: React.FC<ContactSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [contacts, setContacts] = useState<ContactItem[]>(DEFAULT_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const { db } = await getFirebaseInstance();
        if (db) {
          const { doc, getDoc } = await import(
            'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
          );
          const snap = await getDoc(doc(db, 'config', 'contacts'));
          if (snap.exists() && Array.isArray(snap.data()?.list)) {
            setContacts(snap.data().list);
          }
        }
      } catch (err) {
        console.warn('Lỗi đọc contacts config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setContacts((prev) => [
      ...prev,
      {
        name: 'Kênh hỗ trợ / MXH mới',
        url: 'https://',
        icon: 'message-circle',
        logo: '',
        color: '#0284c7',
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof ContactItem, val: string) => {
    setContacts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { db } = await getFirebaseInstance();
      if (!db) throw new Error('Firestore not ready');
      const { doc, setDoc } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js' as any
      );
      await setDoc(doc(db, 'config', 'contacts'), {
        list: contacts,
        updatedAt: new Date().toISOString(),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Lỗi lưu cấu hình: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100020] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Cấu hình Kênh Hỗ Trợ &amp; Mạng Xã Hội (Owner)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tùy chỉnh các liên kết nhắn tin duyệt vai trò giáo viên và mạng xã hội hiển thị trên Navbar và FAB toàn hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            Đang tải dữ liệu cấu hình...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {contacts.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-700">Kênh #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Xóa kênh"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-0.5 uppercase">
                      Tiêu đề hiển thị:
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      placeholder="Ví dụ: ChatND với Admin..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-0.5 uppercase">
                      Liên kết (URL):
                    </label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdateItem(idx, 'url', e.target.value)}
                      placeholder="/chat?admin hoặc https://..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-0.5 uppercase">
                      Logo URL (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={item.logo || ''}
                      onChange={(e) => handleUpdateItem(idx, 'logo', e.target.value)}
                      placeholder="/assets/images/logo.png hoặc URL ảnh..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-0.5 uppercase">
                      Mã màu nhận diện (Hex):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.color || '#0284c7'}
                        onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={item.color || '#0284c7'}
                        onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm kênh liên hệ / mạng xã hội</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
