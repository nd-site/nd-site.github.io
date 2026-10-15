import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Globe, 
  Link2, 
  EyeOff, 
  MessageSquare, 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { Poem, UserProfile, PoemVisibility } from '../types';
import { canUserEditPoem, updatePoemSecurity } from '../services/storage';

interface SharePoemModalProps {
  poem: Poem | null;
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPoemUpdated?: (updated: Poem) => void;
}

export const SharePoemModal: React.FC<SharePoemModalProps> = ({
  poem,
  isOpen,
  onClose,
  user,
  onPoemUpdated
}) => {
  if (!isOpen || !poem) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ndsite.web.app';
  const authorNdid = poem.authorNdid || poem.createdBy?.ndid || user.ndid || 'ndlabs';
  const poemSlug = poem.slug || poem.id;

  // Author link (dynamic based on NDID)
  const authorLink = `${origin}/edu/poem/${authorNdid}/${poemSlug}`;
  // System link (permanent, collision-proof)
  const systemLink = `${origin}/edu/poem/${poem.id}`;

  const canManage = canUserEditPoem(poem, user);

  // Security and permissions state
  const [visibility, setVisibility] = useState<PoemVisibility>(poem.visibility || (poem.isPublic ? 'public' : 'private'));
  const [isLocked, setIsLocked] = useState<boolean>(Boolean(poem.isLocked));
  const [allowComments, setAllowComments] = useState<boolean>(poem.allowComments !== false);
  const [collaborators, setCollaborators] = useState<string[]>(poem.collaboratorNdids || []);
  const [newCollabInput, setNewCollabInput] = useState('');
  const [collabError, setCollabError] = useState('');

  // Copy feedbacks
  const [copiedAuthorLink, setCopiedAuthorLink] = useState(false);
  const [copiedSystemLink, setCopiedSystemLink] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyAuthorLink = () => {
    navigator.clipboard.writeText(authorLink);
    setCopiedAuthorLink(true);
    setTimeout(() => setCopiedAuthorLink(false), 2000);
  };

  const handleCopySystemLink = () => {
    navigator.clipboard.writeText(systemLink);
    setCopiedSystemLink(true);
    setTimeout(() => setCopiedSystemLink(false), 2000);
  };

  // Add collaborator with strict NDID regex validation rule
  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCollabInput.trim();
    if (!trimmed) return;

    // Rule 1: Regex validation /^[a-zA-Z0-9_.]+$/ on user input forms
    const ndidRegex = /^[a-zA-Z0-9_.]+$/;
    if (!ndidRegex.test(trimmed)) {
      setCollabError('NDID chỉ được chứa chữ cái, số, dấu gạch dưới và dấu chấm.');
      return;
    }

    if (collaborators.includes(trimmed)) {
      setCollabError('NDID này đã có trong danh sách cộng tác viên.');
      return;
    }

    if (trimmed === authorNdid) {
      setCollabError('Đây là NDID của chính tác giả.');
      return;
    }

    setCollaborators(prev => [...prev, trimmed]);
    setNewCollabInput('');
    setCollabError('');
  };

  const handleRemoveCollaborator = (ndidToRemove: string) => {
    setCollaborators(prev => prev.filter(c => c !== ndidToRemove));
  };

  const handleSaveSecurity = async () => {
    setIsSavingSecurity(true);
    try {
      const updated = await updatePoemSecurity(poem.id, {
        visibility,
        isLocked,
        allowComments,
        collaboratorNdids: collaborators
      });
      if (onPoemUpdated) {
        onPoemUpdated(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert('Không thể lưu thiết lập bảo mật: ' + (err.message || ''));
    } finally {
      setIsSavingSecurity(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-poem text-stone-900">
                Chia sẻ & Thiết lập bảo mật
              </h2>
              <p className="text-xs text-stone-500">
                Bài thơ: <strong className="text-stone-800">{poem.title}</strong> — {poem.author}
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* SECTION 1: DUAL SHARING LINKS */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-orange-600" />
              1. Liên kết chia sẻ bài thơ
            </h3>

            {/* Author Link Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Liên kết định danh tác giả (Theo NDID)
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-200/60 font-semibold px-2 py-0.5 rounded-full">
                  Thay đổi khi đổi NDID
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={authorLink}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-xl border border-amber-300/80 text-stone-700 focus:outline-none"
                />
                <button
                  onClick={handleCopyAuthorLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    copiedAuthorLink 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                  }`}
                >
                  {copiedAuthorLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAuthorLink ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 italic">
                Cú pháp: <code className="font-mono text-orange-700">./{authorNdid}/{poemSlug}</code>. Liên kết này tự động cập nhật theo tên NDID của bạn.
              </p>
            </div>

            {/* System Permanent Link Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-stone-500" />
                  Liên kết hệ thống (Cố định mãi mãi)
                </span>
                <span className="text-[10px] text-stone-700 bg-stone-200 font-semibold px-2 py-0.5 rounded-full">
                  Cố định vĩnh viễn
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={systemLink}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-xl border border-stone-300 text-stone-700 focus:outline-none"
                />
                <button
                  onClick={handleCopySystemLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    copiedSystemLink 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-stone-800 hover:bg-stone-900 text-white shadow-xs'
                  }`}
                >
                  {copiedSystemLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSystemLink ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 italic">
                Cú pháp: <code className="font-mono text-stone-700">./{poem.id}</code>. Mã duy nhất chống trùng lặp, không bao giờ bị gãy link.
              </p>
            </div>
          </div>

          {/* SECTION 2: SECURITY & PERMISSIONS (For Author or Collaborators) */}
          <div className="space-y-4 pt-4 border-t border-amber-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                2. Phân quyền bảo mật bài thơ
              </h3>
              {!canManage && (
                <span className="text-[11px] font-semibold text-stone-400">
                  (Chỉ tác giả mới có quyền sửa đổi)
                </span>
              )}
            </div>

            {/* Visibility Mode Radio */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">Quyền đọc & Chế độ hiển thị:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() => setVisibility('public')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visibility === 'public'
                      ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-white border-amber-200 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs mb-1">
                    <Globe className="w-3.5 h-3.5 text-orange-600" />
                    <span>Công khai</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Hiển thị trên mục Khám phá, mọi người đều tìm và học được.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() => setVisibility('unlisted')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visibility === 'unlisted'
                      ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-white border-amber-200 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs mb-1">
                    <Link2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Không công khai</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Chỉ người có liên kết chia sẻ mới truy cập được.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() => setVisibility('private')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visibility === 'private'
                      ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-white border-amber-200 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs mb-1">
                    <EyeOff className="w-3.5 h-3.5 text-stone-600" />
                    <span>Riêng tư</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Chỉ tác giả và cộng tác viên được cấp quyền mới xem được.
                  </p>
                </button>
              </div>
            </div>

            {/* Comment Permission Toggle */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                  Quyền nhận xét bài thơ
                </span>
                <p className="text-[11px] text-stone-500">
                  Cho phép bạn đọc gửi bình luận, mẹo ghi nhớ và cảm nhận văn học.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* Lock Poem Toggle */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              isLocked ? 'bg-amber-100/70 border-amber-300' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="space-y-0.5">
                <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5 text-stone-500" />}
                  Khóa bài thơ (Đóng băng nội dung)
                </span>
                <p className="text-[11px] text-stone-500">
                  Khi khóa, không ai có thể sửa nội dung và không nhận thêm nhận xét mới.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Collaborators (Edit Permission) */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-orange-600" />
                  Quyền sửa (Cộng tác viên NDID)
                </span>
                <span className="text-[11px] text-stone-400">
                  Tác giả chính: <strong className="text-stone-700 font-mono">{authorNdid}</strong>
                </span>
              </div>

              {canManage && (
                <form onSubmit={handleAddCollaborator} className="flex gap-2">
                  <input
                    type="text"
                    value={newCollabInput}
                    onChange={(e) => { setNewCollabInput(e.target.value); setCollabError(''); }}
                    placeholder="Nhập NDID người muốn cấp quyền sửa (ví dụ: nam_tran)..."
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-amber-50/50 rounded-xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cấp quyền</span>
                  </button>
                </form>
              )}

              {collabError && (
                <div className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{collabError}</span>
                </div>
              )}

              {/* Collaborator chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {collaborators.length === 0 ? (
                  <span className="text-[11px] text-stone-400 italic">
                    Chưa có cộng tác viên nào được cấp quyền sửa bài thơ này.
                  </span>
                ) : (
                  collaborators.map(c => (
                    <span 
                      key={c}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-mono font-semibold"
                    >
                      <span>{c}</span>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(c)}
                          className="hover:text-rose-600 transition-colors"
                          title="Gỡ quyền sửa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold text-xs"
          >
            Đóng
          </button>

          {canManage && (
            <button
              onClick={handleSaveSecurity}
              disabled={isSavingSecurity}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{saveSuccess ? 'Đã lưu thiết lập!' : isSavingSecurity ? 'Đang lưu...' : 'Lưu thiết lập bảo mật'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
