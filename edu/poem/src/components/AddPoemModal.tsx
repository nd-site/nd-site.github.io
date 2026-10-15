import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  AlertCircle, 
  Lightbulb,
  Globe,
  Link2,
  EyeOff,
  Lock,
  MessageSquare
} from 'lucide-react';
import { Poem, Stanza, PoemVisibility } from '../types';
import { 
  analyzePoemWithGemini, 
  generateGeminiPrompt, 
  sanitizePoemResult 
} from '../services/gemini';
import { getGeminiKey } from '../services/storage';

interface AddPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePoem: (poemData: Omit<Poem, 'id' | 'createdAt' | 'likesCount' | 'likedBy' | 'savesCount' | 'viewsCount' | 'createdBy'>) => void;
}

type TabMode = 'gemini-auto' | 'gemini-copy' | 'manual-json';

export const AddPoemModal: React.FC<AddPoemModalProps> = ({
  isOpen,
  onClose,
  onSavePoem
}) => {
  const [tab, setTab] = useState<TabMode>('gemini-auto');
  const [rawText, setRawText] = useState('');
  const [apiKey, setApiKey] = useState(getGeminiKey());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Structured preview state
  const [parsedPoem, setParsedPoem] = useState<{
    title: string;
    author: string;
    genre: string;
    meaning: string;
    stanzas: Stanza[];
    tags: string[];
    isPublic: boolean;
    slug?: string;
    visibility?: PoemVisibility;
    allowComments?: boolean;
    isLocked?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  // Handler for 1-Click Auto Analyze
  const handleAutoAnalyze = async () => {
    if (!rawText.trim()) {
      setErrorMessage('Vui lòng dán văn bản bài thơ vào ô bên dưới');
      return;
    }

    const currentKey = apiKey || getGeminiKey();
    if (!currentKey) {
      setErrorMessage('Chưa có Gemini API Key. Hãy nhập API Key hoặc dùng tab "Dùng Gemini Web miễn phí" bên cạnh!');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const result = await analyzePoemWithGemini(rawText, currentKey);
      setParsedPoem({
        title: result.title,
        author: result.author,
        genre: result.genre || 'Thơ tự do',
        meaning: result.meaning || '',
        stanzas: result.stanzas,
        tags: result.tags || [],
        isPublic: true,
        slug: '',
        visibility: 'public',
        allowComments: true,
        isLocked: false
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gọi Gemini API. Kiểm tra lại API key hoặc định dạng.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler for copying prompt to paste into Gemini Web
  const handleCopyPrompt = () => {
    if (!rawText.trim()) {
      setErrorMessage('Hãy nhập văn bản bài thơ trước để tạo prompt');
      return;
    }
    const fullPrompt = generateGeminiPrompt(rawText);
    navigator.clipboard.writeText(fullPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Handler for parsing pasted JSON
  const handleParseJsonInput = () => {
    setErrorMessage('');
    try {
      const cleaned = jsonInput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const sanitized = sanitizePoemResult(parsed);

      setParsedPoem({
        title: sanitized.title,
        author: sanitized.author,
        genre: sanitized.genre || 'Thơ tự do',
        meaning: sanitized.meaning || '',
        stanzas: sanitized.stanzas,
        tags: sanitized.tags || [],
        isPublic: true,
        slug: '',
        visibility: 'public',
        allowComments: true,
        isLocked: false
      });
    } catch (e: any) {
      setErrorMessage('Mã JSON không đúng cấu trúc yêu cầu: ' + (e.message || ''));
    }
  };

  const handleFinalSave = () => {
    if (!parsedPoem) return;
    onSavePoem(parsedPoem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-amber-200 shadow-warm-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-poem text-stone-900">
                Thêm bài thơ mới vào PoemND
              </h2>
              <p className="text-xs text-stone-500">
                Bóc tách vần điệu, nhịp phách và hình tượng tự động bằng Gemini AI
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

        {/* Tab selection */}
        <div className="px-6 pt-4 border-b border-amber-100 flex gap-2 text-xs font-bold">
          <button
            onClick={() => { setTab('gemini-auto'); setErrorMessage(''); }}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'gemini-auto'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cách 1: Gemini API tự động
          </button>

          <button
            onClick={() => { setTab('gemini-copy'); setErrorMessage(''); }}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'gemini-copy'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Cách 2: Gemini Web miễn phí (Không cần API key)
          </button>

          <button
            onClick={() => { setTab('manual-json'); setErrorMessage(''); }}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'manual-json'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Cách 3: Dán mã JSON chuẩn
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Auto Gemini */}
          {tab === 'gemini-auto' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-stone-700">Dán toàn bộ lời bài thơ thô vào đây:</label>
                <span className="text-stone-400">Tự động nhận diện khổ, nhịp và vần</span>
              </div>

              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Ví dụ:&#10;Sông Mã xa rồi Tây Tiến ơi!&#10;Nhớ về rừng núi nhớ chơi vơi...&#10;&#10;Dốc lên khúc khuỷu dốc thăm thẳm... "
                className="w-full p-4 text-xs sm:text-sm font-poem bg-amber-50/50 rounded-2xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none placeholder:text-stone-400 leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-xs text-stone-500">
                  Dùng AI để chia nhịp 4/3, tìm vần điệu và tạo gợi ý hình tượng.
                </span>

                <button
                  type="button"
                  onClick={handleAutoAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzing ? 'AI đang phân tích...' : 'Phân tích tự động 1-chạm'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Copy Prompt to Gemini Web */}
          {tab === 'gemini-copy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs text-stone-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-orange-950">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  Hướng dẫn sử dụng Gemini Web miễn phí:
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-stone-600">
                  <li>Dán bài thơ thô vào ô dưới, bấm <strong>"Sao chép Prompt chuẩn"</strong>.</li>
                  <li>Mở <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-orange-600 font-bold underline inline-flex items-center gap-0.5">gemini.google.com <ExternalLink className="w-3 h-3" /></a> (hoàn toàn miễn phí).</li>
                  <li>Dán prompt vào Gemini, copy toàn bộ khối JSON trả về và dán sang tab <strong>"Cách 3: Dán mã JSON chuẩn"</strong>.</li>
                </ol>
              </div>

              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán bài thơ bạn muốn học vào đây..."
                className="w-full p-4 text-xs sm:text-sm font-poem bg-amber-50/50 rounded-2xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none placeholder:text-stone-400"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? 'Đã sao chép Prompt!' : 'Sao chép Prompt chuẩn cho Gemini'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Paste JSON input */}
          {tab === 'manual-json' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700">Dán kết quả JSON từ Gemini vào đây:</label>
              <textarea
                rows={7}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "title": "Tên bài", "author": "Tác giả", "stanzas": [...] }'
                className="w-full p-4 font-mono text-xs bg-stone-50 rounded-2xl border border-amber-200 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseJsonInput}
                  className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>Đọc và kiểm tra cấu trúc JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* Structured Preview & Customization (Shown after analysis) */}
          {parsedPoem && (
            <div className="mt-6 pt-5 border-t border-amber-200 space-y-4 bg-amber-50/40 p-4 rounded-2xl border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Dữ liệu đã bóc tách thành công:
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {parsedPoem.stanzas.length} khổ thơ
                </span>
              </div>

              {/* Title & Author Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600">Tên bài thơ:</label>
                  <input
                    type="text"
                    value={parsedPoem.title}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm font-bold bg-white rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600">Tác giả:</label>
                  <input
                    type="text"
                    value={parsedPoem.author}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, author: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white rounded-xl border border-amber-200"
                  />
                </div>
              </div>

              {/* Slug & Security Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-stone-600">Mã bài thơ (slug chia sẻ):</label>
                  <input
                    type="text"
                    value={parsedPoem.slug || ''}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, slug: e.target.value })}
                    placeholder="ví dụ: tay-tien (để trống để tự tạo)"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white rounded-xl border border-amber-200"
                  />
                  <span className="text-[10px] text-stone-400">Được dùng trong link: ./ndid/slug</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600">Quyền đọc & Công khai:</label>
                  <select
                    value={parsedPoem.visibility || 'public'}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, visibility: e.target.value as PoemVisibility })}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-amber-200"
                  >
                    <option value="public">🌐 Công khai (Mọi người đều tìm thấy)</option>
                    <option value="unlisted">🔗 Không công khai (Chỉ ai có link mới xem được)</option>
                    <option value="private">🔒 Riêng tư (Chỉ mình tôi)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={parsedPoem.allowComments !== false}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, allowComments: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-400"
                  />
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                  <span>Cho phép nhận xét</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={Boolean(parsedPoem.isLocked)}
                    onChange={(e) => setParsedPoem({ ...parsedPoem, isLocked: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-400"
                  />
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                  <span>Khóa bài thơ (Đóng băng nội dung)</span>
                </label>
              </div>

              {/* Stanzas preview list */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {parsedPoem.stanzas.map((st, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-amber-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-800">
                      <span>Khổ {st.stanzaIndex || i + 1} (Nhịp {st.rhythm})</span>
                      <span className="text-amber-700 font-normal italic truncate max-w-[200px]">
                        {st.visualCue}
                      </span>
                    </div>
                    <div className="font-poem text-stone-700 italic">
                      {st.lines.slice(0, 2).join(' • ')} {st.lines.length > 2 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold text-xs"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleFinalSave}
            disabled={!parsedPoem}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:hover:from-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            Lưu bài thơ vào PoemND
          </button>
        </div>
      </div>
    </div>
  );
};
