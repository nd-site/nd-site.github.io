import React, { useState } from 'react';
import { Table, X, Check } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (markdownTable: string) => void;
}

export const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onInsertTable }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const r = Math.max(1, Math.min(20, rows));
    const c = Math.max(1, Math.min(10, cols));

    let md = '\n';
    // Header
    if (hasHeader) {
      md += '| ' + Array.from({ length: c }, (_, i) => `Cột ${i + 1}`).join(' | ') + ' |\n';
      md += '| ' + Array.from({ length: c }, () => ':---').join(' | ') + ' |\n';
      for (let i = 0; i < r - 1; i++) {
        md += '| ' + Array.from({ length: c }, () => '...').join(' | ') + ' |\n';
      }
    } else {
      for (let i = 0; i < r; i++) {
        md += '| ' + Array.from({ length: c }, () => '...').join(' | ') + ' |\n';
      }
    }
    md += '\n';

    onInsertTable(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Table className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Chèn Bảng Biểu</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Số hàng (Rows)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Số cột (Cols)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Bao gồm hàng tiêu đề (Header row)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Chèn bảng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
