import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { UserSearchInput } from './UserSearchInput';
import { MiniWorldCalculator } from './MiniWorldCalculator';

export const TransactionsTab = ({ mapId, mapData }: { mapId: string, mapData: any }) => {
  const { db, user, isAdmin } = useFirebase();
  const baseUnit = mapData?.baseUnitName || 'đồng';

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);

  // Modals state
  const [showCreateTxModal, setShowCreateTxModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showTxTypeConfig, setShowTxTypeConfig] = useState(false);
  const [showTaxHolderModal, setShowTaxHolderModal] = useState(false);
  const [showTaxHolderProfileModal, setShowTaxHolderProfileModal] = useState(false);

  // Tax Holder State
  const [taxHolderUser, setTaxHolderUser] = useState<any>(null);
  const [newTaxHolderId, setNewTaxHolderId] = useState('');
  const [newTaxHolderName, setNewTaxHolderName] = useState('');

  // Currencies state (no stack, default without redundant repetitions)
  const [currencies, setCurrencies] = useState<Record<string, number>>({
    'sắt': 5,
    'nhôm': 10,
    'titan': 20,
    'lửa rực (khối)': 50,
    'đồng Horas': 100,
    'coban': 200,
    'vàng đen': 500,
    'đồng tiền vàng': 10000,
    [baseUnit]: 1
  });

  const [showCurrencyConfig, setShowCurrencyConfig] = useState(false);
  const [newCurrencyName, setNewCurrencyName] = useState('');
  const [newCurrencyVal, setNewCurrencyVal] = useState(1);

  // Transaction Types form
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeRate, setNewTypeRate] = useState(5);

  // Transaction form state
  const [partyAType, setPartyAType] = useState<'user' | 'org'>('user');
  const [partyBType, setPartyBType] = useState<'user' | 'org'>('user');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');

  const [txForm, setTxForm] = useState({
    partyA: '',
    partyB: '',
    partyAName: '',
    partyBName: '',
    amount: 1,
    currency: 'titan',
    taxPayer: 'seller',
    isRetroactive: false,
    retroDate: ''
  });

  const isMapOwner = useMemo(() => {
    if (isAdmin) return true;
    if (!mapData?.players || !user?.uid) return false;
    const playerObj = mapData.players[user.uid];
    return playerObj?.role === 'owner' || playerObj === 'owner';
  }, [mapData, user, isAdmin]);

  // Fetch Organizations & Transaction Types & Transactions
  useEffect(() => {
    if (!db || !mapId) return;
    const fetchData = async () => {
      const { ref, onValue, query, orderByChild } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      
      // Fetch Orgs
      onValue(ref(db, `mw_organizations/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setOrgs(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
          setOrgs([]);
        }
      });

      // Fetch Transaction Types
      onValue(ref(db, `mw_transaction_types/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          setTxTypes(list);
          if (list.length > 0 && !selectedTypeId) {
            setSelectedTypeId(list[0].id);
          }
        } else {
          setTxTypes([]);
        }
      });

      // Fetch Transactions
      const txRef = query(ref(db, `mw_transactions/${mapId}`), orderByChild('timestamp'));
      onValue(txRef, (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
          setTransactions(list);
        } else {
          setTransactions([]);
        }
      });

      // Fetch Tax Holder
      onValue(ref(db, `mw_maps/${mapId}/taxHolder`), (snap: any) => {
        if (snap.exists()) {
          setTaxHolderUser(snap.val());
        } else {
          setTaxHolderUser(null);
        }
      });
    };
    fetchData();
  }, [db, mapId]);

  // Selected Type object & tax rate
  const activeTypeObj = useMemo(() => {
    return txTypes.find(t => t.id === selectedTypeId);
  }, [txTypes, selectedTypeId]);

  const activeTaxRate = activeTypeObj ? activeTypeObj.rate : 0;

  // Add Transaction Type
  const handleCreateTxType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !db) return;
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const newRef = push(ref(db, `mw_transaction_types/${mapId}`));
      await set(newRef, {
        name: newTypeName.trim(),
        rate: Number(newTypeRate) || 0,
        createdAt: Date.now()
      });
      setNewTypeName('');
      setNewTypeRate(5);
      alert('Đã thêm loại giao dịch mới!');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeleteTxType = async (typeId: string) => {
    if (!db || !confirm('Xóa loại giao dịch này?')) return;
    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_transaction_types/${mapId}/${typeId}`));
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Save Tax Holder with detailed profile extraction
  const handleSaveTaxHolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxHolderId || !db) return;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      
      // Determine their role in map
      const mapPlayerObj = mapData?.players ? mapData.players[newTaxHolderId] : null;
      const roleInMap = mapPlayerObj ? (typeof mapPlayerObj === 'object' ? mapPlayerObj.role : mapPlayerObj) : 'Thành viên';

      // Determine their orgs in this map
      const joinedOrgs = orgs.filter(o => o.members && o.members[newTaxHolderId]).map(o => ({
        orgId: o.id,
        orgName: o.name,
        roleName: o.members[newTaxHolderId].roleName || o.members[newTaxHolderId].role || 'Thành viên'
      }));

      const payload = {
        userId: newTaxHolderId,
        displayName: newTaxHolderName || newTaxHolderId,
        roleInMap,
        joinedOrgs,
        updatedAt: Date.now()
      };

      await set(ref(db, `mw_maps/${mapId}/taxHolder`), payload);
      setShowTaxHolderModal(false);
      alert('Đã cập nhật người giữ thuế chính của bản đồ!');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Create Transaction
  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txTypes.length === 0) {
      return alert("Chủ phòng chưa tạo loại giao dịch nào. Không thể thực hiện giao dịch khi chưa có loại giao dịch.");
    }
    if (!selectedTypeId) {
      return alert("Vui lòng chọn loại giao dịch.");
    }
    if (!db) return;

    try {
      const { ref, push, set, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const txRef = push(ref(db, `mw_transactions/${mapId}`));
      
      const baseValue = currencies[txForm.currency] || 1;
      const amountInBase = txForm.amount * baseValue;
      const taxAmount = (amountInBase * activeTaxRate) / 100;
      
      const totalA = txForm.taxPayer === 'seller' ? amountInBase - taxAmount : amountInBase;
      const totalB = txForm.taxPayer === 'buyer' ? amountInBase + taxAmount : amountInBase;

      const payload = {
        ...txForm,
        typeId: selectedTypeId,
        typeName: activeTypeObj?.name || 'Giao dịch',
        taxRate: activeTaxRate,
        partyADisplay: txForm.partyAName ? `${txForm.partyA} (${txForm.partyAName})` : txForm.partyA,
        partyBDisplay: txForm.partyBName ? `${txForm.partyB} (${txForm.partyBName})` : txForm.partyB,
        partyAType,
        partyBType,
        baseValue,
        amountInBase,
        taxAmount,
        totalA,
        totalB,
        approved: false,
        createdBy: user?.uid || 'anonymous',
        timestamp: txForm.isRetroactive && txForm.retroDate ? new Date(txForm.retroDate).getTime() : Date.now(),
        realTimestamp: Date.now()
      };

      await set(txRef, payload);

      // Add tax to budget in map
      const mapBudgetRef = ref(db, `mw_maps/${mapId}/budget`);
      await runTransaction(mapBudgetRef, (currentBudget: number) => {
        return (currentBudget || 0) + taxAmount;
      });

      alert('Tạo giao dịch thành công!');
      setShowCreateTxModal(false);
      setTxForm({
        partyA: '',
        partyB: '',
        partyAName: '',
        partyBName: '',
        amount: 1,
        currency: 'titan',
        taxPayer: 'seller',
        isRetroactive: false,
        retroDate: ''
      });
    } catch (err: any) {
      alert("Lỗi tạo giao dịch: " + err.message);
    }
  };

  const handleApproveTx = async (txId: string) => {
    if (!db) return;
    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await update(ref(db, `mw_transactions/${mapId}/${txId}`), {
        approved: true,
        approvedBy: user?.displayName || user?.email || 'Chủ phòng',
        approvedAt: Date.now()
      });
      alert('Đã duyệt giao dịch!');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Filtered transactions by date
  const filteredTransactions = useMemo(() => {
    if (!filterDate) return transactions;
    return transactions.filter(tx => {
      const txDate = new Date(tx.timestamp).toISOString().split('T')[0];
      return txDate === filterDate;
    });
  }, [transactions, filterDate]);

  const latestTx = useMemo(() => {
    return transactions.length > 0 ? transactions[0] : null;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Budget Overview Banner */}
      <div className="glass p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200/90 shadow-md bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Ngân Sách Thuế Bản Đồ</h2>
          </div>
          
          <div className="text-3xl md:text-4xl font-black text-slate-800 flex items-baseline gap-2 mt-1">
            <span className="text-emerald-600 font-mono">{mapData?.budget?.toLocaleString() || 0}</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{baseUnit}</span>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <span>🛡️ Người giữ thuế:</span>
            {taxHolderUser ? (
              <button
                onClick={() => setShowTaxHolderProfileModal(true)}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                <span>👤</span> {taxHolderUser.displayName || taxHolderUser.userId} (Xem chi tiết)
              </button>
            ) : (
              <span className="italic text-slate-500">Chưa thiết lập người giữ thuế chính</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowCreateTxModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <span>➕</span> Tạo Giao Dịch
          </button>

          <button 
            onClick={() => setShowCalculatorModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>🧮</span> Máy Tính Quy Đổi
          </button>

          {isMapOwner && (
            <>
              <button 
                onClick={() => setShowTaxTypeConfig(!showTxTypeConfig)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-3 rounded-2xl text-xs font-bold transition-all"
              >
                ⚙️ Loại giao dịch & Thuế ({txTypes.length})
              </button>

              <button 
                onClick={() => setShowTaxHolderModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
              >
                👤 Chọn người giữ thuế
              </button>
            </>
          )}

          <button 
            onClick={() => setShowCurrencyConfig(!showCurrencyConfig)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-2xl text-xs font-bold transition-all"
          >
            🪙 Bảng tiền tệ
          </button>
        </div>
      </div>

      {/* Transaction Types Management Panel */}
      {showTxTypeConfig && isMapOwner && (
        <div className="glass p-6 rounded-3xl animate-in slide-in-from-top-3 border border-purple-200 bg-white shadow-md space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cấu Hình Các Loại Giao Dịch & Mức Thuế Trong Bản Đồ</h4>
          <p className="text-xs text-slate-500">Người chơi bắt buộc phải chọn một loại giao dịch khi tạo giao dịch kinh tế.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {txTypes.map(t => (
              <div key={t.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{t.name}</span>
                  <span className="text-rose-600 font-bold font-mono">Mức thuế: {t.rate}%</span>
                </div>
                <button
                  onClick={() => handleDeleteTxType(t.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 font-bold"
                  title="Xóa loại giao dịch"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateTxType} className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100">
            <input 
              type="text" 
              required
              placeholder="Tên loại giao dịch (vd: Khoáng sản, Đất đai...)" 
              value={newTypeName} 
              onChange={e => setNewTypeName(e.target.value)} 
              className="flex-1 bg-white text-xs text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
            />
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                min="0"
                max="100"
                required
                placeholder="Mức thuế (%)" 
                value={newTypeRate} 
                onChange={e => setNewTypeRate(Number(e.target.value))} 
                className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 w-28 focus:outline-none focus:border-purple-500 font-bold"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
            >
              + Thêm loại giao dịch
            </button>
          </form>
        </div>
      )}

      {/* Currency Config Panel */}
      {showCurrencyConfig && (
        <div className="glass p-6 rounded-3xl animate-in slide-in-from-top-3 border border-blue-200 bg-white shadow-md">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
            Bảng Tỷ Giá Tiền Tệ (Đơn vị gốc: {baseUnit})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(currencies).map(([curr, val]) => (
              <div key={curr} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 capitalize">{curr}</span>
                  <div className="text-emerald-600 font-mono font-bold mt-0.5">{val.toLocaleString()} {baseUnit}</div>
                </div>
                {curr !== baseUnit && (
                  <button 
                    onClick={() => {
                      const newC = { ...currencies };
                      delete newC[curr];
                      setCurrencies(newC);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Xóa đơn vị này"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100">
            <input 
              type="text" 
              placeholder="Tên tiền tệ mới..." 
              value={newCurrencyName} 
              onChange={e => setNewCurrencyName(e.target.value)} 
              className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
            <input 
              type="number" 
              placeholder={`Quy đổi ra ${baseUnit}...`} 
              value={newCurrencyVal} 
              onChange={e => setNewCurrencyVal(Number(e.target.value))} 
              className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 w-44 focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={() => {
                if (!newCurrencyName) return;
                setCurrencies({ ...currencies, [newCurrencyName]: newCurrencyVal });
                setNewCurrencyName('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
            >
              + Thêm / Cập nhật
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-md bg-white flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📜</span> Lịch Sử Giao Dịch
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span>Tổng: <strong className="text-slate-800">{transactions.length}</strong> giao dịch</span>
              <span>•</span>
              <span>
                Gần nhất: <strong className="text-blue-600 font-medium">
                  {latestTx ? new Date(latestTx.timestamp).toLocaleString('vi-VN') : 'Chưa có'}
                </strong>
              </span>
            </div>
          </div>

          {/* Filter by Date */}
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 font-bold">Lọc theo ngày:</label>
            <input 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')} 
                className="text-slate-400 hover:text-slate-700 underline text-xs"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredTransactions.map(tx => (
            <div 
              key={tx.id} 
              className={`p-4 rounded-2xl border transition-all ${tx.isRetroactive ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/80 border-slate-200'} hover:shadow-md relative overflow-hidden`}
            >
              {tx.isRetroactive && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                  ⏰ Giao dịch trước đó (Truy hồi)
                </div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{new Date(tx.timestamp).toLocaleString('vi-VN')}</span>
                  <span className="ml-2 font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {tx.typeName || 'Giao dịch chung'}
                  </span>
                </div>
                <div className="text-base font-black text-slate-800">
                  {tx.amount} <span className="text-xs text-blue-600 uppercase font-bold">{tx.currency}</span> ≈ {tx.amountInBase?.toLocaleString()} {baseUnit}
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl mt-2 border border-slate-200/80 shadow-sm">
                <div className="text-center w-[45%]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Bên A ({tx.partyAType === 'org' ? '🏢 Tổ chức' : '👤 Người chơi'})
                  </div>
                  <div className="font-bold text-blue-600 text-xs truncate" title={tx.partyADisplay || tx.partyA}>
                    {tx.partyADisplay || tx.partyA}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono font-bold mt-0.5">+{tx.totalA?.toLocaleString()} {baseUnit}</div>
                </div>
                <div className="text-slate-300 font-black">➔</div>
                <div className="text-center w-[45%]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Bên B ({tx.partyBType === 'org' ? '🏢 Tổ chức' : '👤 Người chơi'})
                  </div>
                  <div className="font-bold text-purple-600 text-xs truncate" title={tx.partyBDisplay || tx.partyB}>
                    {tx.partyBDisplay || tx.partyB}
                  </div>
                  <div className="text-[11px] text-rose-600 font-mono font-bold mt-0.5">-{tx.totalB?.toLocaleString()} {baseUnit}</div>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                <div>
                  Thuế ({tx.taxRate}% do {tx.taxPayer === 'seller' ? 'Bên A' : 'Bên B'} nộp): <span className="text-rose-600 font-bold font-mono">+{tx.taxAmount?.toLocaleString()} {baseUnit}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {tx.approved ? (
                    <span className="text-emerald-700 bg-emerald-100/70 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      ✓ Đã duyệt ({tx.approvedBy || 'Chủ phòng'})
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleApproveTx(tx.id)} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                    >
                      ✓ Duyệt giao dịch
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-center text-slate-400 py-16 text-xs">
              Chưa có giao dịch nào{filterDate ? ` trong ngày ${filterDate}` : ''}.
            </div>
          )}
        </div>
      </div>

      {/* CREATE TRANSACTION POPUP MODAL */}
      {showCreateTxModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 bg-white">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>💸</span> Tạo Giao Dịch Mới
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Chọn loại giao dịch, người tham gia và số lượng.</p>
              </div>
              <button
                onClick={() => setShowCreateTxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
              >
                ✕
              </button>
            </div>

            {txTypes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-3">
                <div className="text-3xl">⚠️</div>
                <p className="font-bold text-slate-800 text-sm">Chủ phòng chưa tạo loại giao dịch nào</p>
                <p>Hệ thống yêu cầu phải có ít nhất 1 loại giao dịch kèm % thuế để người chơi thực hiện giao dịch.</p>
                {isMapOwner && (
                  <button
                    onClick={() => {
                      setShowCreateTxModal(false);
                      setShowTxTypeConfig(true);
                    }}
                    className="bg-purple-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md"
                  >
                    + Tạo loại giao dịch ngay
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateTx} className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Chọn loại giao dịch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại giao dịch *</label>
                  <select
                    value={selectedTypeId}
                    onChange={e => setSelectedTypeId(e.target.value)}
                    required
                    className="w-full bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none"
                  >
                    {txTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Thuế {t.rate}%)</option>
                    ))}
                  </select>
                </div>

                {/* Bên A Selection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Bên A (Bán / Giao dịch)</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPartyAType('user')}
                        className={`px-2 py-0.5 rounded-md ${partyAType === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Người chơi
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartyAType('org')}
                        className={`px-2 py-0.5 rounded-md ${partyAType === 'org' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Tổ chức
                      </button>
                    </div>
                  </div>

                  {partyAType === 'user' ? (
                    <UserSearchInput
                      value={txForm.partyA}
                      selectedName={txForm.partyAName}
                      onChange={(val, name) => setTxForm(prev => ({ ...prev, partyA: val, partyAName: name || '' }))}
                      placeholder="Tìm Tên, NDID hoặc CodeID..."
                    />
                  ) : (
                    <select
                      value={txForm.partyA}
                      onChange={e => {
                        const selected = orgs.find(o => o.id === e.target.value);
                        setTxForm(prev => ({ ...prev, partyA: e.target.value, partyAName: selected ? selected.name : '' }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none"
                    >
                      <option value="">-- Chọn Tổ chức --</option>
                      {orgs.map(o => <option key={o.id} value={o.id}>{o.name} (ID: {o.id})</option>)}
                    </select>
                  )}
                </div>

                {/* Bên B Selection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Bên B (Mua / Người nhận)</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPartyBType('user')}
                        className={`px-2 py-0.5 rounded-md ${partyBType === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Người chơi
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartyBType('org')}
                        className={`px-2 py-0.5 rounded-md ${partyBType === 'org' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Tổ chức
                      </button>
                    </div>
                  </div>

                  {partyBType === 'user' ? (
                    <UserSearchInput
                      value={txForm.partyB}
                      selectedName={txForm.partyBName}
                      onChange={(val, name) => setTxForm(prev => ({ ...prev, partyB: val, partyBName: name || '' }))}
                      placeholder="Tìm Tên, NDID hoặc CodeID..."
                    />
                  ) : (
                    <select
                      value={txForm.partyB}
                      onChange={e => {
                        const selected = orgs.find(o => o.id === e.target.value);
                        setTxForm(prev => ({ ...prev, partyB: e.target.value, partyBName: selected ? selected.name : '' }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none"
                    >
                      <option value="">-- Chọn Tổ chức --</option>
                      {orgs.map(o => <option key={o.id} value={o.id}>{o.name} (ID: {o.id})</option>)}
                    </select>
                  )}
                </div>

                {/* Số lượng & Đơn vị */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng</label>
                    <input 
                      required 
                      type="number" 
                      min="0.01" 
                      step="0.01" 
                      value={txForm.amount} 
                      onChange={e => setTxForm({...txForm, amount: parseFloat(e.target.value) || 0})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Loại tiền / Vật phẩm</label>
                    <select 
                      value={txForm.currency} 
                      onChange={e => setTxForm({...txForm, currency: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 capitalize"
                    >
                      {Object.keys(currencies).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Bên nộp thuế */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Bên nộp thuế ({activeTaxRate}%)</label>
                  <select 
                    value={txForm.taxPayer} 
                    onChange={e => setTxForm({...txForm, taxPayer: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="seller">Bên A (Người bán trả thuế)</option>
                    <option value="buyer">Bên B (Người mua trả thuế)</option>
                  </select>
                </div>

                {/* Live Preview Calculation */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tạm tính chi tiết ({baseUnit})</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Giá trị:</span>
                    <span className="font-bold font-mono">{(txForm.amount * (currencies[txForm.currency] || 1)).toLocaleString()} {baseUnit}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Thuế ({activeTaxRate}%):</span>
                    <span className="font-bold font-mono">+ {((txForm.amount * (currencies[txForm.currency] || 1) * activeTaxRate) / 100).toLocaleString()} {baseUnit}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-emerald-600">
                    <span>{txForm.taxPayer === 'seller' ? 'Bên A thực nhận:' : 'Bên B cần trả:'}</span>
                    <span className="font-mono">
                      {txForm.taxPayer === 'seller'
                        ? ((txForm.amount * (currencies[txForm.currency] || 1)) - ((txForm.amount * (currencies[txForm.currency] || 1) * activeTaxRate) / 100)).toLocaleString()
                        : ((txForm.amount * (currencies[txForm.currency] || 1)) + ((txForm.amount * (currencies[txForm.currency] || 1) * activeTaxRate) / 100)).toLocaleString()
                      } {baseUnit}
                    </span>
                  </div>
                </div>

                {/* Giao dịch trước đó (Retroactive) */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={txForm.isRetroactive} 
                      onChange={e => setTxForm({...txForm, isRetroactive: e.target.checked})} 
                      className="rounded text-blue-600" 
                    />
                    Đã xảy ra trước đó (Truy hồi ngày giờ)
                  </label>

                  {txForm.isRetroactive && (
                    <input 
                      type="datetime-local" 
                      value={txForm.retroDate} 
                      onChange={e => setTxForm({...txForm, retroDate: e.target.value})} 
                      required 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500" 
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreateTxModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 text-xs uppercase tracking-wider"
                  >
                    Lưu Giao Dịch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CHOOSE TAX HOLDER MODAL */}
      {showTaxHolderModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl bg-white">
            <h3 className="text-base font-black text-slate-800 mb-2">Chọn Người Giữ Thuế Chính</h3>
            <p className="text-xs text-slate-500 mb-4">Tìm và chỉ định người chịu trách nhiệm giữ ngân sách thuế của bản đồ.</p>

            <form onSubmit={handleSaveTaxHolder} className="space-y-4">
              <UserSearchInput
                value={newTaxHolderId}
                selectedName={newTaxHolderName}
                onChange={(val, name) => {
                  setNewTaxHolderId(val);
                  setNewTaxHolderName(name || '');
                }}
                placeholder="Tìm Tên, NDID hoặc CodeID..."
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaxHolderModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Lưu Chỉ Định
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAX HOLDER PROFILE DETAIL MODAL */}
      {showTaxHolderProfileModal && taxHolderUser && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl bg-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>🛡️</span> Hồ Sơ Người Giữ Thuế
                </h3>
                <p className="text-xs text-slate-400 font-mono">NDID: @{taxHolderUser.userId}</p>
              </div>
              <button
                onClick={() => setShowTaxHolderProfileModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Họ và tên:</span>
                  <span className="font-bold text-slate-800">{taxHolderUser.displayName || taxHolderUser.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chức vụ trong Map:</span>
                  <span className="font-bold text-blue-600">{taxHolderUser.roleInMap || 'Thành viên'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
                  Tổ chức tham gia trong bản đồ này ({taxHolderUser.joinedOrgs?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {taxHolderUser.joinedOrgs?.map((jo: any) => (
                    <div key={jo.orgId} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{jo.orgName}</span>
                      <span className="text-purple-700 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {jo.roleName}
                      </span>
                    </div>
                  ))}
                  {(!taxHolderUser.joinedOrgs || taxHolderUser.joinedOrgs.length === 0) && (
                    <div className="text-slate-400 italic text-[11px]">Chưa tham gia tổ chức nào trong map này.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowTaxHolderProfileModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CALCULATOR */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <MiniWorldCalculator
            currencies={currencies}
            baseUnitName={baseUnit}
            onClose={() => setShowCalculatorModal(false)}
          />
        </div>
      )}
    </div>
  );
};
