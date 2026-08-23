import React, { useState, useMemo } from 'react';

interface CalculatorProps {
  currencies: Record<string, number>;
  baseUnitName?: string;
  onClose?: () => void;
}

export const MiniWorldCalculator: React.FC<CalculatorProps> = ({ 
  currencies, 
  baseUnitName = 'đồng',
  onClose 
}) => {
  const currencyKeys = Object.keys(currencies);
  const firstUnit = currencyKeys[0] || baseUnitName;

  const [val1, setVal1] = useState<number>(1);
  const [unit1, setUnit1] = useState<string>(firstUnit);
  const [operator, setOperator] = useState<string>('convert');
  const [val2, setVal2] = useState<number>(1);
  const [unit2, setUnit2] = useState<string>(currencyKeys[1] || firstUnit);
  const [targetUnit, setTargetUnit] = useState<string>(baseUnitName);

  // Calculation logic
  const result = useMemo(() => {
    const rate1 = currencies[unit1] || 1;
    const rate2 = currencies[unit2] || 1;
    const targetRate = currencies[targetUnit] || 1;

    const baseVal1 = (val1 || 0) * rate1;
    const baseVal2 = (val2 || 0) * rate2;

    let finalBase = 0;
    if (operator === 'convert') {
      finalBase = baseVal1;
    } else if (operator === '+') {
      finalBase = baseVal1 + baseVal2;
    } else if (operator === '-') {
      finalBase = Math.max(0, baseVal1 - baseVal2);
    } else if (operator === '*') {
      finalBase = baseVal1 * (val2 || 1);
    } else if (operator === '/') {
      finalBase = (val2 && val2 !== 0) ? baseVal1 / val2 : baseVal1;
    }

    const inTargetUnit = targetRate > 0 ? finalBase / targetRate : 0;
    return {
      baseAmount: finalBase,
      targetAmount: inTargetUnit
    };
  }, [val1, unit1, operator, val2, unit2, targetUnit, currencies]);

  return (
    <div className="glass-modal p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl bg-white max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span>🧮</span> Máy Tính Quy Đổi Tiền Tệ
          </h3>
          <p className="text-[11px] text-slate-500">Tính toán & quy đổi các đơn vị giao dịch trong bản đồ</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full font-bold">
            ✕
          </button>
        )}
      </div>

      {/* Input 1 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-600">Giá trị thứ nhất</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={val1}
            onChange={e => setVal1(parseFloat(e.target.value) || 0)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
          />
          <select
            value={unit1}
            onChange={e => setUnit1(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none capitalize"
          >
            {currencyKeys.map(c => (
              <option key={c} value={c}>{c} ({currencies[c]} {baseUnitName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Operator selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-600">Phép tính</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'convert', label: 'Quy đổi' },
            { id: '+', label: '+ (Cộng)' },
            { id: '-', label: '- (Trừ)' },
            { id: '*', label: '× (Nhân)' },
            { id: '/', label: '÷ (Chia)' }
          ].map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperator(op.id)}
              className={`py-2 rounded-xl text-xs font-black transition-all ${operator === op.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input 2 (if not convert) */}
      {operator !== 'convert' && (
        <div className="space-y-1.5 animate-in fade-in-50 duration-150">
          <label className="block text-xs font-bold text-slate-600">
            {operator === '*' || operator === '/' ? 'Hệ số nhân / chia' : 'Giá trị thứ hai'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={val2}
              onChange={e => setVal2(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
            />
            {(operator === '+' || operator === '-') && (
              <select
                value={unit2}
                onChange={e => setUnit2(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none capitalize"
              >
                {currencyKeys.map(c => (
                  <option key={c} value={c}>{c} ({currencies[c]} {baseUnitName})</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Target Destination Unit */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-600">Quy đổi kết quả ra đơn vị:</label>
        <select
          value={targetUnit}
          onChange={e => setTargetUnit(e.target.value)}
          className="w-full bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none capitalize"
        >
          {currencyKeys.map(c => (
            <option key={c} value={c}>{c} (1 = {currencies[c]} {baseUnitName})</option>
          ))}
        </select>
      </div>

      {/* Result Display Box */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold block">Kết quả</span>
        <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
          {Number(result.targetAmount.toFixed(2)).toLocaleString()} <span className="text-sm font-bold text-white capitalize">{targetUnit}</span>
        </div>
        <div className="text-xs text-slate-300 pt-1 border-t border-slate-800 flex justify-between font-mono">
          <span>Quy đổi theo {baseUnitName}:</span>
          <span className="text-amber-400 font-bold">{Number(result.baseAmount.toFixed(2)).toLocaleString()} {baseUnitName}</span>
        </div>
      </div>
    </div>
  );
};
