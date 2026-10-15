import React, { useState } from 'react';
import { Settings2, X, Plus, Trash2, Check, RotateCcw } from 'lucide-react';
import { saveCategoriesToFirestore, DEFAULT_CATEGORIES } from '../../services/firebaseService';
import type { EduCategoriesConfig, AdminUser } from '../../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: EduCategoriesConfig;
  user: AdminUser | null;
  onToast: (msg: string, isError?: boolean) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  user,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'examTypes'>('subjects');
  const [grades, setGrades] = useState<string[]>(categories.grades || DEFAULT_CATEGORIES.grades);
  const [subjects, setSubjects] = useState<string[]>(categories.subjects || DEFAULT_CATEGORIES.subjects);
  const [examTypes, setExamTypes] = useState<string[]>(categories.examTypes || DEFAULT_CATEGORIES.examTypes);

  const [newItemText, setNewItemText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentList = activeTab === 'grades' ? grades : activeTab === 'subjects' ? subjects : examTypes;

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    if (currentList.includes(trimmed)) {
      onToast('Mục này đã tồn tại trong danh sách.', true);
      return;
    }

    if (activeTab === 'grades') {
      setGrades((prev) => [...prev, trimmed]);
    } else if (activeTab === 'subjects') {
      setSubjects((prev) => [...prev, trimmed]);
    } else {
      setExamTypes((prev) => [...prev, trimmed]);
    }

    setNewItemText('');
    onToast(`Đã thêm "${trimmed}".`);
  };

  const handleRemoveItem = (item: string) => {
    if (activeTab === 'grades') {
      setGrades((prev) => prev.filter((i) => i !== item));
    } else if (activeTab === 'subjects') {
      setSubjects((prev) => prev.filter((i) => i !== item));
    } else {
      setExamTypes((prev) => prev.filter((i) => i !== item));
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Khôi phục toàn bộ danh mục về thiết lập mặc định?')) return;
    setGrades(DEFAULT_CATEGORIES.grades);
    setSubjects(DEFAULT_CATEGORIES.subjects);
    setExamTypes(DEFAULT_CATEGORIES.examTypes);
    onToast('Đã khôi phục thiết lập danh mục mặc định.');
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await saveCategoriesToFirestore(
        {
          grades,
          subjects,
          examTypes,
        },
        user?.ndid || 'Admin'
      );
      onToast('Đã lưu cấu hình danh mục toàn hệ thống lên Firestore thành công!');
      onClose();
    } catch (e: any) {
      onToast('Lỗi lưu danh mục: ' + (e?.message || e), true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Quản Lý Danh Mục Hệ Thống</h3>
              <p className="text-[11px] text-slate-500">
                Thêm, sửa, xóa Khối lớp, Môn học và Loại bài kiểm tra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Môn học ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Khối lớp ({grades.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examTypes')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'examTypes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Loại bài kiểm tra ({examTypes.length})
          </button>
        </div>

        {/* Input box to add item */}
        <div className="pt-4 flex items-center gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder={`Nhập tên ${
              activeTab === 'subjects' ? 'môn học' : activeTab === 'grades' ? 'khối lớp' : 'loại bài kiểm tra'
            } mới...`}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-72">
          <div className="grid grid-cols-2 gap-2">
            {currentList.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <span className="truncate pr-1">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item)}
                  className="w-5 h-5 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {currentList.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">
              Chưa có mục nào trong danh sách.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu vào Firestore'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
