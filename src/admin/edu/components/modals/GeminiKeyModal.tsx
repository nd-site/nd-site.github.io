import React, { useState, useEffect } from 'react';
import { Key, Save, X, ExternalLink } from 'lucide-react';
import { saveUserGeminiKey } from '../../services/firebaseService';
import type { AdminUser } from '../../types';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSaved: (newKey: string) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaved,
  onToast,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.customGeminiKey) {
      setApiKey(user.customGeminiKey);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user?.uid) {
      onToast('Bạn chưa đăng nhập để lưu khóa.', true);
      return;
    }

    setIsSaving(true);
    try {
      await saveUserGeminiKey(user.uid, apiKey.trim());
      onSaved(apiKey.trim());
      onToast('Đã lưu khóa API Gemini thành công.');
      onClose();
    } catch (err: any) {
      onToast('Lỗi lưu khóa: ' + (err?.message || err), true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-600">
            <Key className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-black text-slate-900">Cài đặt Gemini API Key</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Khóa API này được lưu bảo mật trong hồ sơ tài khoản của bạn trên Firestore và được ưu tiên sử dụng cho các tác vụ AI tạo đề thi, thẩm định và bóc tách đề.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
            >
              <span>Lấy khóa API miễn phí từ Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu khóa API'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
