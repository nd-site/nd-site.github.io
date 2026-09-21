import React, { useState, useEffect, useRef } from 'react';
import {
  AITimetableExtractionResult,
  analyzeTimetableWithAI
} from './aiTimetableService';

interface AITimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (
    result: AITimetableExtractionResult,
    mode: 'overwrite' | 'fillEmpty',
    updateMetadata: boolean
  ) => void;
}

const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật'
];

export const AITimetableModal: React.FC<AITimetableModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  
  // Danh sách các tệp tin được chọn (hỗ trợ nhiều tệp)
  interface UploadedFileInfo {
    id: string;
    file: File;
    previewUrl?: string;
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [textInput, setTextInput] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  // Trạng thái phân tích & kết quả
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<AITimetableExtractionResult | null>(null);

  // Tùy chọn áp dụng
  const [applyMode, setApplyMode] = useState<'overwrite' | 'fillEmpty'>('overwrite');
  const [updateMetadata, setUpdateMetadata] = useState(true);

  // Trạng thái kéo thả tệp
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Giải phóng toàn bộ URL preview khi unmount hoặc xóa tệp
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [uploadedFiles]);

  const handleAppendFiles = (files: FileList | File[]) => {
    setAnalysisError(null);
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    const newItems: UploadedFileInfo[] = fileArr.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAllFiles = () => {
    uploadedFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setUploadedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Xóa một tiết học cụ thể khỏi kết quả xem trước
  const handleRemoveSlot = (dayIndex: number, period: 'morning' | 'afternoon', slotNumber: number) => {
    if (!result) return;
    const remainingSlots = result.slots.filter(
      (s) => !(s.dayIndex === dayIndex && s.period === period && s.slotNumber === slotNumber)
    );
    const maxM = remainingSlots.filter((s) => s.period === 'morning').reduce((max, s) => Math.max(max, s.slotNumber), 0);
    const maxA = remainingSlots.filter((s) => s.period === 'afternoon').reduce((max, s) => Math.max(max, s.slotNumber), 0);
    setResult({
      ...result,
      slots: remainingSlots,
      morningSlotsCount: maxM > 0 ? maxM : (maxA > 0 ? 0 : 5),
      afternoonSlotsCount: maxA
    });
  };

  // Xóa toàn bộ tiết chiều khỏi kết quả xem trước
  const handleClearAfternoonSlots = () => {
    if (!result) return;
    const morningSlots = result.slots.filter((s) => s.period === 'morning');
    const maxM = morningSlots.reduce((max, s) => Math.max(max, s.slotNumber), 0);
    setResult({
      ...result,
      slots: morningSlots,
      morningSlotsCount: maxM > 0 ? maxM : 5,
      afternoonSlotsCount: 0
    });
  };

  // Chuyển toàn bộ tiết chiều thành tiết sáng
  const handleConvertAfternoonToMorning = () => {
    if (!result) return;
    const convertedSlots = result.slots.map((s) => (s.period === 'afternoon' ? { ...s, period: 'morning' as const } : s));
    const maxM = convertedSlots.reduce((max, s) => Math.max(max, s.slotNumber), 0);
    setResult({
      ...result,
      slots: convertedSlots,
      morningSlotsCount: maxM,
      afternoonSlotsCount: 0
    });
  };

  // Lắng nghe sự kiện Paste (Ctrl + V) trên toàn modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      // Nếu có tệp hình ảnh từ Clipboard (ảnh chụp màn hình, copy ảnh từ nơi khác)
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        const imageFiles = files.filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          e.preventDefault();
          handleAppendFiles(imageFiles);
          setActiveTab('file');
          return;
        }
      }

      // Nếu là văn bản và đang ở tab Text
      if (activeTab === 'text' && e.clipboardData) {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && !textInput) {
          setTextInput(pastedText);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeTab, textInput]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAppendFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAppendFiles(e.dataTransfer.files);
      setActiveTab('file');
    }
  };

  const handleStartAnalysis = async () => {
    setAnalysisError(null);

    if (activeTab === 'file' && uploadedFiles.length === 0) {
      setAnalysisError('Vui lòng chọn hoặc tải lên ít nhất một tệp tin (hình ảnh, Excel, PDF) để phân tích.');
      return;
    }

    if (activeTab === 'text' && !textInput.trim()) {
      setAnalysisError('Vui lòng nhập hoặc dán nội dung thời khóa biểu vào khung văn bản.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await analyzeTimetableWithAI({
        files: activeTab === 'file' ? uploadedFiles.map((u) => u.file) : null,
        text: activeTab === 'text' ? textInput : undefined,
        userPrompt: userPrompt.trim() || undefined,
        sessionFilter
      });

      if (!res.slots || res.slots.length === 0) {
        throw new Error('AI không nhận diện được tiết học nào trong nội dung này. Vui lòng thử ảnh rõ nét hơn hoặc cung cấp thêm thông tin.');
      }

      setResult(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Đã xảy ra lỗi khi phân tích dữ liệu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmApply = () => {
    if (!result) return;
    onApply(result, applyMode, updateMetadata);
    onClose();
  };

  const handleReset = () => {
    setResult(null);
    setAnalysisError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Nhập Thời Khóa Biểu Bằng AI</h3>
              <p className="text-xs text-slate-500">
                Phân tích ảnh chụp, tệp Excel, PDF hoặc văn bản để tự điền dữ liệu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Màn hình xem trước kết quả sau khi AI phân tích xong */}
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <span className="text-xl text-emerald-600">✓</span>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-emerald-900">
                    Phân tích thành công: Đã nhận diện {result.slots.length} tiết học!
                  </h4>
                  <div className="text-xs text-emerald-700 flex flex-wrap gap-x-4 gap-y-1">
                    {result.gradeClass && <span>Lớp: <strong>{result.gradeClass}</strong></span>}
                    {result.school && <span>Trường: <strong>{result.school}</strong></span>}
                    {result.schoolYear && <span>Năm học: <strong>{result.schoolYear}</strong></span>}
                    <span>Số tiết sáng: <strong>{result.morningSlotsCount ?? 0}</strong></span>
                    <span>Số tiết chiều: <strong>{result.afternoonSlotsCount ?? 0}</strong></span>
                  </div>

                  {/* Nút hành động nhanh nếu kết quả có tiết chiều */}
                  {result.slots.some((s) => s.period === 'afternoon') && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-emerald-200/80">
                      <span className="text-xs font-bold text-emerald-800">Tiết chiều:</span>
                      <button
                        type="button"
                        onClick={handleClearAfternoonSlots}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>✕</span> Xóa tất cả tiết chiều
                      </button>
                      <button
                        type="button"
                        onClick={handleConvertAfternoonToMorning}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>⬆</span> Chuyển thành tiết sáng
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Xem trước bảng phân bổ môn theo thứ */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Bản xem trước dữ liệu nhận diện</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Tổng cộng {result.slots.length} tiết học
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-2 text-xs">
                  {DAYS_OF_WEEK.map((dayName, dIdx) => {
                    const daySlots = result.slots
                      .filter((s) => s.dayIndex === dIdx)
                      .sort((a, b) => {
                        if (a.period !== b.period) return a.period === 'morning' ? -1 : 1;
                        return a.slotNumber - b.slotNumber;
                      });

                    if (daySlots.length === 0) return null;

                    const morningCount = daySlots.filter((s) => s.period === 'morning').length;
                    const afternoonCount = daySlots.filter((s) => s.period === 'afternoon').length;

                    return (
                      <div key={dayName} className="py-2.5 px-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{dayName}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {daySlots.length} tiết ({morningCount} sáng{afternoonCount > 0 ? `, ${afternoonCount} chiều` : ''})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {daySlots.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 ${
                                s.period === 'morning'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                              title={s.teacher ? `Giáo viên: ${s.teacher}` : ''}
                            >
                              <strong className="text-[10px] opacity-75">
                                {s.period === 'morning' ? 'S' : 'C'}{s.slotNumber}:
                              </strong>
                              <span>{s.subject}</span>
                              {s.teacher && <span className="opacity-70 text-[10px]">({s.teacher})</span>}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSlot(s.dayIndex, s.period, s.slotNumber);
                                }}
                                className="ml-0.5 text-slate-400 hover:text-rose-600 font-bold text-[10px] leading-none transition-colors"
                                title="Xóa tiết này"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tùy chọn cách điền vào thời khóa biểu */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3">
                <span className="block text-xs font-bold text-slate-700">Cách thức áp dụng dữ liệu:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      applyMode === 'overwrite'
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === 'overwrite'}
                      onChange={() => setApplyMode('overwrite')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold block">Ghi đè toàn bộ</span>
                      <span className="text-[11px] text-slate-500 block">
                        Thay thế toàn bộ lưới môn học bằng kết quả AI vừa nhận diện
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      applyMode === 'fillEmpty'
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === 'fillEmpty'}
                      onChange={() => setApplyMode('fillEmpty')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold block">Chỉ điền vào ô trống</span>
                      <span className="text-[11px] text-slate-500 block">
                        Giữ nguyên các tiết bạn đã điền thủ công, chỉ bổ sung vào các ô còn trống
                      </span>
                    </div>
                  </label>
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateMetadata}
                    onChange={(e) => setUpdateMetadata(e.target.checked)}
                    className="rounded-lg"
                  />
                  <span>Cập nhật cả thông tin trường, lớp, năm học và số tiết học nếu phát hiện thấy</span>
                </label>
              </div>
            </div>
          ) : (
            /* Màn hình nhập dữ liệu ban đầu */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'file'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📁</span> Tải tệp & Hình ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'text'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📝</span> Dán văn bản
                </button>
              </div>

              {/* Tab Content: File Upload */}
              {activeTab === 'file' && (
                <div className="space-y-3">
                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {/* Thanh công cụ quản lý tệp */}
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            📁 Đã chọn {uploadedFiles.length} tệp tin
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({(uploadedFiles.reduce((s, u) => s + u.file.size, 0) / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>＋</span> Thêm tệp
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllFiles}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors"
                          >
                            Xóa tất cả
                          </button>
                        </div>
                      </div>

                      {/* Danh sách các tệp đã tải lên */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-0.5">
                        {uploadedFiles.map((item) => {
                          const isImg = item.file.type.startsWith('image/');
                          const isExcel = item.file.name.endsWith('.xlsx') || item.file.name.endsWith('.xls') || item.file.name.endsWith('.csv');
                          const isPdf = item.file.type === 'application/pdf' || item.file.name.endsWith('.pdf');

                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {isImg && item.previewUrl ? (
                                  <img
                                    src={item.previewUrl}
                                    alt=""
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${
                                      isExcel
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : isPdf
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'bg-blue-50 text-blue-600'
                                    }`}
                                  >
                                    {isExcel ? '📊' : isPdf ? '📄' : '📝'}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={item.file.name}>
                                    {item.file.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {(item.file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 text-xs font-bold"
                                title="Xóa tệp này"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Khu vực thả thêm tệp */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(true);
                        }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors text-xs text-slate-500 font-medium ${
                          isDraggingOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        Kéo thả thêm tệp vào đây hoặc nhấn để chọn thêm
                      </div>
                    </div>
                  ) : (
                    /* Dropzone ban đầu khi chưa chọn tệp nào */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDraggingOver
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl mx-auto">
                          📸
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Kéo thả một hoặc nhiều tệp vào đây, hoặc nhấn để duyệt
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Hỗ trợ: Ảnh chụp (.png, .jpg, .webp), Excel (.xlsx, .xls), PDF. Có thể chọn nhiều tệp cùng lúc hoặc nhấn{' '}
                            <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[10px] font-mono">
                              Ctrl + V
                            </kbd>{' '}
                            để dán ảnh chụp màn hình
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.xlsx,.xls,.csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Tab Content: Text Paste */}
              {activeTab === 'text' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Nội dung thời khóa biểu dạng văn bản:
                  </label>
                  <textarea
                    rows={6}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Dán nội dung thời khóa biểu vào đây... Ví dụ:&#10;Thứ 2: Tiết 1 Chào cờ, Tiết 2 Toán thầy An, Tiết 3 Văn cô Lan&#10;Thứ 3: Tiết 1 Tiếng Anh, Tiết 2 Hóa học..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono resize-y"
                  />
                </div>
              )}

              {/* Lựa chọn phạm vi buổi học */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Phạm vi buổi học cần nhận diện:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionFilter('all')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                      sessionFilter === 'all'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>⚡</span> Tất cả (Tự động)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('morning')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                      sessionFilter === 'morning'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>☀️</span> Chỉ buổi sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('afternoon')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                      sessionFilter === 'afternoon'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🌤️</span> Chỉ buổi chiều
                  </button>
                </div>
              </div>

              {/* User extra prompt note */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-600">
                  Ghi chú bổ sung cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ví dụ: Chỉ lấy các môn buổi sáng, hoặc đây là TKB lớp 10A1..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  💡 AI sẽ tự động nhận diện đúng số tiết thực tế của từng ngày học (không tự ý điền thêm tiết 5 hoặc thêm tiết chiều nếu không có).
                </p>
              </div>
            </div>
          )}

          {/* Báo lỗi nếu có */}
          {analysisError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{analysisError}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {result ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                >
                  Phân tích tệp khác
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>✓</span> Áp dụng vào thời khóa biểu
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || (activeTab === 'file' && uploadedFiles.length === 0) || (activeTab === 'text' && !textInput.trim())}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>AI đang phân tích...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Bắt đầu phân tích</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
