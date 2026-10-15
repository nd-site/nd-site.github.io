import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  ExternalLink, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getGeminiKey, setGeminiKey } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData
}) => {
  const [geminiApiKey, setLocalGeminiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalGeminiKey(getGeminiKey());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiKey(geminiApiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-poem text-stone-900">
                Cài đặt ứng dụng
              </h2>
              <p className="text-xs text-stone-500">
                Tùy chỉnh hỗ trợ học tập và trí tuệ nhân tạo AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Gemini AI Key Config Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Khóa cá nhân Gemini AI (Tùy chọn)
              </h3>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-600 hover:underline flex items-center gap-1 font-semibold"
              >
                Lấy API Key tại AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Hệ thống đã có sẵn trợ lý AI. Nếu muốn dùng khóa API riêng của bạn để xử lý văn bản nhanh hơn, bạn có thể nhập vào ô dưới:
            </p>

            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              placeholder="AIzaSy... (để trống để dùng mặc định)"
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-amber-50/40 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Reset cache button */}
          <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-stone-700">Khôi phục kho thơ:</span>
              <p className="text-[11px] text-stone-500">Làm mới bộ nhớ đệm cục bộ về danh sách chuẩn.</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Khôi phục kho thơ và tiến độ về trạng thái ban đầu?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-amber-300 text-stone-700 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 font-semibold text-xs"
          >
            Đóng
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? 'Đã lưu thiết lập!' : 'Lưu thiết lập'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
