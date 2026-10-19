import React, { useState } from 'react';
import {
  ShieldAlert,
  Camera,
  Mic,
  Maximize2,
  FileText,
  Key,
  Globe,
  Sliders,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ExamProctoringConfig } from '../types';

interface ProctoringConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExamProctoringConfig;
  onChange: (newConfig: ExamProctoringConfig) => void;
}

export const DEFAULT_PROCTORING_PROMPT = `Bạn là hệ thống AI giám sát thi trực tuyến công bằng, khách quan của EduND.
Nhiệm vụ của bạn là phân tích dữ liệu đa phương tiện từ camera thí sinh, ảnh chụp màn hình và đoạn ghi âm theo thời gian thực để phát hiện các dấu hiệu vi phạm quy chế thi.

Dữ liệu nhận vào:
1. Ảnh camera thí sinh (camera trước/sau): Nhận diện có mặt thí sinh không, có người thứ hai xuất hiện không, thí sinh có nhìn đi chỗ khác/sử dụng tài liệu/điện thoại di động không.
2. Ảnh chụp màn hình: Nhận diện thí sinh có mở ứng dụng/tab khác, phần mềm gian lận không.
3. Bản ghi âm/mô tả âm thanh: Nhận diện có tiếng người thì thầm, trao đổi lời giải, tiếng gõ phím bất thường không.

Yêu cầu xuất kết quả theo định dạng JSON chuẩn:
{
  "suspicious": true/false,
  "confidenceScore": 0.0 đến 1.0,
  "incidentType": "NONE" | "MULTIPLE_FACES" | "NO_FACE" | "LOOKING_AWAY" | "PHONE_DETECTED" | "VOICE_DETECTED" | "SCREEN_SWITCH",
  "explanation": "Mô tả ngắn gọn, súc tích hành vi quan sát được (tối đa 2 câu)",
  "severity": "LOW" | "MEDIUM" | "HIGH"
}`;

export const ProctoringConfigModal: React.FC<ProctoringConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const handleToggleField = (field: keyof ExamProctoringConfig) => {
    onChange({
      ...config,
      [field]: !config[field],
    });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(config.customAiPrompt || DEFAULT_PROCTORING_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100010] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Giám Sát Thi Trực Tuyến & Chống Gian Lận AI</h2>
              <p className="text-xs text-slate-500 font-medium">
                Theo dõi toàn màn hình, ghi nhật ký, chụp camera trước/sau, ghi âm & gửi AI riêng phân tích
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Master Toggle */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-black text-rose-950 uppercase tracking-wide">
              Kích hoạt tính năng giám sát
            </span>
            <p className="text-xs text-slate-600">
              Bật tính năng bảo vệ phòng thi chống gian lận đa phương tiện.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={() => handleToggleField('enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {/* Configurations */}
        <div className={`space-y-5 transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {/* Chế độ áp dụng */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Áp dụng giám sát trong chế độ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'exam_only', label: '⏱️ Chỉ chế độ Thi thử' },
                { id: 'practice_only', label: '📖 Chỉ Luyện tập' },
                { id: 'both', label: '🛡️ Cả hai chế độ' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                    config.appliedModes === opt.id
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="appliedModes"
                    value={opt.id}
                    checked={config.appliedModes === opt.id}
                    onChange={() =>
                      onChange({ ...config, appliedModes: opt.id as any })
                    }
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thiết bị & Bảo mật */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800">
              Yêu cầu & Quyền thiết bị thí sinh:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={config.requireLogin}
                  onChange={() => handleToggleField('requireLogin')}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-slate-800 block">Yêu cầu đăng nhập</span>
                  <span className="text-[11px] text-slate-500">
                    Bắt buộc đăng nhập tài khoản NDID trước khi bắt đầu bài làm.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={config.requireCamera}
                  onChange={() => handleToggleField('requireCamera')}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>Bắt buộc có Camera</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Không có camera sẽ bị chặn, không cho phép truy cập bài thi.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={config.recordScreenLog}
                  onChange={() => handleToggleField('recordScreenLog')}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Toàn màn hình & Nhật ký</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bật toàn màn hình, ghi nhật ký rời tab, thoát full-screen.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={config.randomSnapshots}
                  onChange={() => handleToggleField('randomSnapshots')}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chụp ngẫu nhiên màn hình & cam</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chụp ngẫu nhiên trước/sau và màn hình trong lúc làm bài.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-all sm:col-span-2">
                <input
                  type="checkbox"
                  checked={config.recordAudio}
                  onChange={() => handleToggleField('recordAudio')}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ghi âm & phân tích âm thanh trực tiếp (Chạy ngầm)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Thu âm micro từng đoạn ngắn để AI phát hiện tiếng nói thì thầm, trao đổi đề bài.
                  </span>
                </div>
              </label>

              {/* Giới hạn số lần kiểm tra */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-extrabold text-slate-800 block">Giới hạn số lần làm bài kiểm tra</span>
                  <span className="text-[11px] text-slate-500">
                    Số lần tối đa mỗi học sinh được nộp bài (0 hoặc bỏ trống = không giới hạn).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Không giới hạn"
                    value={config.maxAttempts || ''}
                    onChange={(e) =>
                    onChange({
                        ...config,
                        maxAttempts: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-slate-500 font-bold text-xs">lần</span>
                </div>
              </div>

              {/* Cảnh báo thoát toàn màn hình & Cấm thi */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-slate-800 block">Giới hạn cảnh báo thoát toàn màn hình</span>
                    <span className="text-[11px] text-slate-500">
                      Nếu học sinh thoát toàn màn hình quá số lần này, hệ thống sẽ lập tức cấm thi và nộp bài.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Mặc định 3"
                      value={config.maxFullscreenExits ?? ''}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          maxFullscreenExits: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-slate-500 font-bold text-xs">lần</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="font-extrabold text-slate-800 block">Thời hạn cấm thi sau vi phạm</span>
                    <span className="text-[11px] text-slate-500">
                      Thời gian học sinh bị chặn không được làm lại bài thi (nhập 0 = cấm vĩnh viễn, hoặc số phút).
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      placeholder="0 = Vĩnh viễn"
                      value={config.fullscreenBanDuration ?? ''}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          fullscreenBanDuration: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-center text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-slate-500 font-bold text-xs">{config.fullscreenBanDuration === 0 ? '(Vĩnh viễn)' : 'phút'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cấu hình API AI riêng của Giáo viên */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Cấu hình API AI phân tích riêng (Giáo viên tự cung cấp)
              </h4>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Tính năng phân tích hình ảnh và âm thanh này <strong>không dùng API của dự án</strong> để bảo mật và tiết kiệm tài nguyên. Giáo viên vui lòng điền link API, API Key và Model AI riêng của mình (hỗ trợ OpenAI, Gemini, hoặc Endpoint tương thích REST).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Đường dẫn gọi AI (API Endpoint URL)
                </label>
                <input
                  type="text"
                  placeholder="https://generativelanguage.googleapis.com/v1beta/models/... hoặc https://api.openai.com/v1/chat/completions"
                  value={config.customAiEndpoint || ''}
                  onChange={(e) => onChange({ ...config, customAiEndpoint: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  API Key riêng của bạn
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... hoặc sk-proj-..."
                  value={config.customApiKey || ''}
                  onChange={(e) => onChange({ ...config, customApiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Loại Model AI (Ví dụ: gemini-2.5-flash, gpt-4o-mini)
                </label>
                <input
                  type="text"
                  placeholder="gemini-2.5-flash"
                  value={config.customAiModel || ''}
                  onChange={(e) => onChange({ ...config, customAiModel: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Prompt cung cấp cho AI tự cấu hình */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPromptDetails(!showPromptDetails)}
                  className="text-xs font-extrabold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prompt hệ thống phân tích gian lận (Được tối ưu sẵn)</span>
                  {showPromptDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  {copiedPrompt ? '✓ Đã sao chép prompt' : 'Sao chép prompt'}
                </button>
              </div>

              {showPromptDetails && (
                <div className="mt-2.5 space-y-1.5 animate-in fade-in">
                  <textarea
                    rows={6}
                    value={config.customAiPrompt || DEFAULT_PROCTORING_PROMPT}
                    onChange={(e) => onChange({ ...config, customAiPrompt: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Bạn có thể sao chép prompt này gửi cho trợ lý AI cấu hình endpoint phù hợp hoặc chỉnh sửa quy tắc theo nhu cầu của trường/cơ sở.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Lưu cài đặt giám sát
          </button>
        </div>
      </div>
    </div>
  );
};
