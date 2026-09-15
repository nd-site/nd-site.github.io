import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { UserSearchInput } from './UserSearchInput';
import { MiniWorldCalculator } from './MiniWorldCalculator';
import { LatexRenderer, containsLatex } from './LatexRenderer';

export const TransactionsTab = ({ mapId, mapData }: { mapId: string, mapData: any }) => {
  const { db, user, sessionUser, isAdmin } = useFirebase();
  const currentUid = user?.uid || sessionUser?.uid || sessionUser?.ndid;

  // Base unit name state
  const [baseUnit, setBaseUnit] = useState<string>(mapData?.baseUnitName || 'đồng');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);

  // Modals state
  const [showCreateTxModal, setShowCreateTxModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showTxTypeConfig, setShowTxTypeConfig] = useState(false);
  const [showTaxHolderModal, setShowTaxHolderModal] = useState(false);
  const [showTaxHolderProfileModal, setShowTaxHolderProfileModal] = useState(false);
  const [showChangeBaseUnitModal, setShowChangeBaseUnitModal] = useState(false);
  const [newBaseUnitInput, setNewBaseUnitInput] = useState('');

  // Tax Rate History Modal state
  const [viewingRateHistoryType, setViewingRateHistoryType] = useState<any | null>(null);

  // Edit Tax Type Modal state
  const [editingTxType, setEditingTxType] = useState<any | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeRate, setEditTypeRate] = useState(5);
  const [editTypeEffectiveFrom, setEditTypeEffectiveFrom] = useState('');

  // Tax Holder State
  const [taxHolderUser, setTaxHolderUser] = useState<any>(null);
  const [newTaxHolderId, setNewTaxHolderId] = useState('');
  const [newTaxHolderName, setNewTaxHolderName] = useState('');

  // Currencies state (synced with Firebase)
  const defaultCurrencies: Record<string, number> = {
    'sắt': 5,
    'nhôm': 10,
    'titan': 20,
    'lửa rực (khối)': 50,
    'đồng Horas': 100,
    'coban': 200,
    'vàng đen': 500,
    'đồng tiền vàng': 1000,
    [baseUnit]: 1
  };

  const [currencies, setCurrencies] = useState<Record<string, number>>(defaultCurrencies);
  const [showCurrencyConfig, setShowCurrencyConfig] = useState(false);
  const [newCurrencyName, setNewCurrencyName] = useState('');
  const [newCurrencyVal, setNewCurrencyVal] = useState(1);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);

  // Transaction Types form (with Effective Date/Time)
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeRate, setNewTypeRate] = useState(5);
  const [newTypeEffectiveFrom, setNewTypeEffectiveFrom] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });

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
    retroDate: '',
    note: ''
  });

  const isMapOwner = useMemo(() => {
    if (isAdmin) return true;
    if (!mapData?.players || !currentUid) return false;
    const playerObj = mapData.players[currentUid];
    return playerObj?.role === 'owner' || playerObj === 'owner';
  }, [mapData, currentUid, isAdmin]);

  // Check if current user is Tax Holder
  const isTaxHolder = useMemo(() => {
    if (!currentUid || !taxHolderUser) return false;
    return taxHolderUser.userId === currentUid ||
      taxHolderUser.userId === sessionUser?.ndid ||
      taxHolderUser.userId === user?.uid;
  }, [currentUid, taxHolderUser, sessionUser, user]);

  // Permission to approve transactions: Tax Holder, Map Owner, or Admin
  const canApproveTx = useMemo(() => {
    return isAdmin || isMapOwner || isTaxHolder;
  }, [isAdmin, isMapOwner, isTaxHolder]);

  // Fetch Organizations, Transaction Types, Currencies, BaseUnit & Transactions
  useEffect(() => {
    if (!db || !mapId) return;
    const fetchData = async () => {
      const { ref, onValue, set, push, query, orderByChild } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);

      // Fetch Base Unit
      onValue(ref(db, `mw_maps/${mapId}/baseUnitName`), (snap: any) => {
        if (snap.exists() && snap.val()) {
          setBaseUnit(snap.val());
        } else if (mapData?.baseUnitName) {
          setBaseUnit(mapData.baseUnitName);
        }
      });

      // Fetch Currencies
      onValue(ref(db, `mw_maps/${mapId}/currencies`), (snap: any) => {
        if (snap.exists() && snap.val()) {
          setCurrencies(snap.val());
        } else {
          set(ref(db, `mw_maps/${mapId}/currencies`), defaultCurrencies);
        }
      });

      // Fetch Orgs
      onValue(ref(db, `mw_organizations/${mapId}`), (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          setOrgs(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
          setOrgs([]);
        }
      });

      // Fetch Transaction Types with default built-in seeding
      onValue(ref(db, `mw_transaction_types/${mapId}`), async (snap: any) => {
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));

          // Guarantee built-in system types exist
          const nowStr = new Date().toISOString().slice(0, 16);
          const requiredDefaults = [
            { name: 'Đóng thuế', rate: 100, isTaxDirect: true, isSystem: true, effectiveFrom: nowStr },
            { name: 'Sử dụng thuế', rate: 0, isTaxExpenditure: true, isSystem: true, effectiveFrom: nowStr },
            { name: 'Ủy thác', rate: 10, isEscrow: true, isSystem: true, effectiveFrom: nowStr }
          ];

          for (const req of requiredDefaults) {
            const exists = list.some(t => t.name === req.name || (req.isTaxDirect && t.isTaxDirect) || (req.isTaxExpenditure && t.isTaxExpenditure) || (req.isEscrow && t.isEscrow));
            if (!exists) {
              const newRef = push(ref(db, `mw_transaction_types/${mapId}`));
              await set(newRef, { ...req, createdAt: Date.now() });
            }
          }

          setTxTypes(list);
          if (list.length > 0 && !selectedTypeId) {
            setSelectedTypeId(list[0].id);
          }
        } else {
          const nowStr = new Date().toISOString().slice(0, 16);
          const defaults = [
            { name: 'Đóng thuế', rate: 100, isTaxDirect: true, isSystem: true, effectiveFrom: nowStr },
            { name: 'Sử dụng thuế', rate: 0, isTaxExpenditure: true, isSystem: true, effectiveFrom: nowStr },
            { name: 'Ủy thác', rate: 10, isEscrow: true, isSystem: true, effectiveFrom: nowStr },
            { name: 'Mua bán hàng hóa / vật phẩm', rate: 5, effectiveFrom: nowStr },
            { name: 'Chuyển tiền / Tặng quà', rate: 0, effectiveFrom: nowStr },
            { name: 'Trả lương / Thù lao', rate: 0, effectiveFrom: nowStr },
            { name: 'Góp vốn / Đầu tư', rate: 0, effectiveFrom: nowStr }
          ];

          for (const d of defaults) {
            const newRef = push(ref(db, `mw_transaction_types/${mapId}`));
            await set(newRef, { ...d, createdAt: Date.now() });
          }
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

  // Selected Type object & characteristics
  const activeTypeObj = useMemo(() => {
    return txTypes.find(t => t.id === selectedTypeId);
  }, [txTypes, selectedTypeId]);

  const isDirectTaxType = useMemo(() => {
    return activeTypeObj?.name === 'Đóng thuế' || activeTypeObj?.isTaxDirect === true;
  }, [activeTypeObj]);

  const isTaxExpenditureType = useMemo(() => {
    return activeTypeObj?.name === 'Sử dụng thuế' || activeTypeObj?.isTaxExpenditure === true;
  }, [activeTypeObj]);

  const isEscrowType = useMemo(() => {
    return activeTypeObj?.name === 'Ủy thác' || activeTypeObj?.isEscrow === true;
  }, [activeTypeObj]);

  const activeTaxRate = useMemo(() => {
    if (isDirectTaxType) return 100;
    if (isTaxExpenditureType) return 0;
    return activeTypeObj ? (Number(activeTypeObj.rate) || 0) : 0;
  }, [isDirectTaxType, isTaxExpenditureType, activeTypeObj]);

  // Auto-set Party roles when special types are selected
  useEffect(() => {
    const taxHolderLabel = taxHolderUser?.displayName ? `Quỹ Thuế (${taxHolderUser.displayName})` : 'Quỹ Ngân Sách Thuế Bản Đồ';

    if (isDirectTaxType) {
      // Bên A nộp -> Bên B là Quỹ thuế
      setTxForm(prev => ({
        ...prev,
        partyB: 'tax_budget',
        partyBName: taxHolderLabel,
        taxPayer: 'seller'
      }));
    } else if (isTaxExpenditureType) {
      // Bên A là Quỹ thuế chi -> Bên B là người nhận
      setTxForm(prev => ({
        ...prev,
        partyA: 'tax_budget',
        partyAName: taxHolderLabel,
        taxPayer: 'seller'
      }));
    } else if (isEscrowType) {
      // Hợp đồng ủy thác: Bên A (Bên thuê) luôn trả thuế
      setTxForm(prev => ({
        ...prev,
        taxPayer: 'seller'
      }));
    }
  }, [isDirectTaxType, isTaxExpenditureType, isEscrowType, taxHolderUser]);

  // Add Transaction Type with Effective Date/Time
  const handleCreateTxType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !db) return;
    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const newRef = push(ref(db, `mw_transaction_types/${mapId}`));
      const nowStr = newTypeEffectiveFrom || new Date().toISOString().slice(0, 16);

      await set(newRef, {
        name: newTypeName.trim(),
        rate: Number(newTypeRate) || 0,
        effectiveFrom: nowStr,
        effectiveFromTimestamp: new Date(nowStr).getTime(),
        rateHistory: [],
        createdAt: Date.now()
      });

      setNewTypeName('');
      setNewTypeRate(5);
      setNewTypeEffectiveFrom(new Date().toISOString().slice(0, 16));
      alert('🎉 Đã thêm loại giao dịch mới!');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Open Edit Tax Type Modal
  const handleOpenEditTxType = (t: any) => {
    setEditingTxType(t);
    setEditTypeName(t.name || '');
    setEditTypeRate(t.rate !== undefined ? t.rate : 5);
    setEditTypeEffectiveFrom(new Date().toISOString().slice(0, 16));
  };

  // Save Edited Tax Type and push old rate to rateHistory
  const handleSaveEditedTxType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingTxType) return;

    try {
      const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const newEffectiveStr = editTypeEffectiveFrom || new Date().toISOString().slice(0, 16);
      const oldRate = Number(editingTxType.rate) || 0;
      const newRate = Number(editTypeRate) || 0;

      let history = Array.isArray(editingTxType.rateHistory) ? [...editingTxType.rateHistory] : [];

      // If rate is changed, archive old rate to history
      if (oldRate !== newRate) {
        history.push({
          rate: oldRate,
          effectiveFrom: editingTxType.effectiveFrom || 'Trước đó',
          effectiveTo: newEffectiveStr,
          changedBy: sessionUser?.displayName || user?.displayName || 'Chủ phòng',
          timestamp: Date.now()
        });
      }

      await update(ref(db, `mw_transaction_types/${mapId}/${editingTxType.id}`), {
        name: editTypeName.trim() || editingTxType.name,
        rate: newRate,
        effectiveFrom: newEffectiveStr,
        effectiveFromTimestamp: new Date(newEffectiveStr).getTime(),
        rateHistory: history,
        updatedAt: Date.now()
      });

      alert('🎉 Đã cập nhật mức thuế và lưu lịch sử thành công!');
      setEditingTxType(null);
    } catch (e: any) {
      alert("Lỗi cập nhật: " + e.message);
    }
  };

  const handleDeleteTxType = async (typeId: string, typeName: string) => {
    if (typeName === 'Đóng thuế' || typeName === 'Sử dụng thuế' || typeName === 'Ủy thác') {
      return alert(`Loại giao dịch "${typeName}" là mặc định của hệ thống, không thể xóa.`);
    }
    if (!db || !confirm('Xóa loại giao dịch này?')) return;
    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_transaction_types/${mapId}/${typeId}`));
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Change Base Unit Name
  const handleChangeBaseUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUnit = newBaseUnitInput.trim();
    if (!cleanUnit || !db) return;

    try {
      const { ref, update, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);

      const newCurrencies = { ...currencies };
      delete newCurrencies[baseUnit];
      newCurrencies[cleanUnit] = 1;

      await update(ref(db, `mw_maps/${mapId}`), {
        baseUnitName: cleanUnit
      });
      await set(ref(db, `mw_maps/${mapId}/currencies`), newCurrencies);

      setBaseUnit(cleanUnit);
      setCurrencies(newCurrencies);
      setShowChangeBaseUnitModal(false);
      setNewBaseUnitInput('');
      alert(`🎉 Đã đổi đơn vị tiền tệ cơ sở thành "${cleanUnit}"!`);
    } catch (e: any) {
      alert("Lỗi đổi đơn vị cơ sở: " + e.message);
    }
  };

  // Save / Update Currency
  const handleSaveCurrency = async () => {
    if (!newCurrencyName.trim() || !db) return;
    const name = newCurrencyName.trim();
    const val = Number(newCurrencyVal) || 1;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const updated = { ...currencies, [name]: val };
      await set(ref(db, `mw_maps/${mapId}/currencies`), updated);
      setCurrencies(updated);
      setNewCurrencyName('');
      setNewCurrencyVal(1);
      setEditingCurrency(null);
      alert(`Đã lưu đơn vị "${name}" = ${val} ${baseUnit}!`);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeleteCurrency = async (curr: string) => {
    if (curr === baseUnit) {
      return alert(`Không thể xóa đơn vị cơ sở (${baseUnit}). Nếu muốn, hãy dùng nút "Đổi Đơn Vị Cơ Sở".`);
    }
    if (!db || !confirm(`Xóa đơn vị tiền tệ "${curr}"?`)) return;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const updated = { ...currencies };
      delete updated[curr];
      await set(ref(db, `mw_maps/${mapId}/currencies`), updated);
      setCurrencies(updated);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Save Tax Holder
  const handleSaveTaxHolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxHolderId || !db) return;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);

      const mapPlayerObj = mapData?.players ? mapData.players[newTaxHolderId] : null;
      const roleInMap = mapPlayerObj ? (typeof mapPlayerObj === 'object' ? mapPlayerObj.role : mapPlayerObj) : 'Thành viên';

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

  // Create Transaction (Handles Regular, Direct Tax, Tax Expenditure & Escrow)
  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txTypes.length === 0) {
      return alert("Chưa có loại giao dịch nào. Vui lòng thêm loại giao dịch trước.");
    }
    if (!selectedTypeId) {
      return alert("Vui lòng chọn loại giao dịch.");
    }
    if (!isTaxExpenditureType && !txForm.partyA) {
      return alert("Vui lòng chọn Bên A (Người thực hiện/Nộp thuế/Thuê ủy thác).");
    }
    if (!isDirectTaxType && !txForm.partyB) {
      return alert("Vui lòng chọn Bên B (Người nhận/Người thụ hưởng/Nhận ủy thác).");
    }
    if (!db) return;

    const baseValue = currencies[txForm.currency] || 1;
    const amountInBase = (txForm.amount || 0) * baseValue;

    // Check budget limit for Tax Expenditure ("Sử dụng thuế")
    if (isTaxExpenditureType) {
      const currentBudget = mapData?.budget || 0;
      if (amountInBase > currentBudget) {
        return alert(`⚠️ Số tiền giải ngân (${amountInBase.toLocaleString()} ${baseUnit}) vượt quá số dư hiện tại trong Ngân sách thuế (${currentBudget.toLocaleString()} ${baseUnit}).`);
      }
    }

    try {
      const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      const txRef = push(ref(db, `mw_transactions/${mapId}`));

      let taxAmount = 0;
      let realAmountA = 0;
      let realAmountB = 0;
      let partyADisplay = '';
      let partyBDisplay = '';

      if (isDirectTaxType) {
        // Đóng thuế trực tiếp: 100% nộp vào thuế
        taxAmount = amountInBase;
        realAmountA = -amountInBase;
        realAmountB = amountInBase;
        partyADisplay = txForm.partyAName ? `${txForm.partyA} (${txForm.partyAName})` : txForm.partyA;
        partyBDisplay = taxHolderUser ? `🏛️ Ngân Sách Thuế (${taxHolderUser.displayName})` : '🏛️ Quỹ Ngân Sách Thuế Bản Đồ';
      } else if (isTaxExpenditureType) {
        // Sử dụng thuế: Quỹ thuế chi giải ngân cho Bên B
        taxAmount = 0;
        realAmountA = -amountInBase; // Kho bạc xuất
        realAmountB = amountInBase; // Người nhận
        partyADisplay = taxHolderUser ? `🏛️ Ngân Sách Thuế (${taxHolderUser.displayName})` : '🏛️ Quỹ Ngân Sách Thuế Bản Đồ';
        partyBDisplay = txForm.partyBName ? `${txForm.partyB} (${txForm.partyBName})` : txForm.partyB;
      } else if (isEscrowType) {
        // Hợp đồng ủy thác: Bên A (Bên thuê) trả tiền + nộp thuế ủy thác
        taxAmount = (amountInBase * activeTaxRate) / 100;
        realAmountA = -(amountInBase + taxAmount);
        realAmountB = amountInBase;
        partyADisplay = txForm.partyAName ? `${txForm.partyA} (${txForm.partyAName})` : txForm.partyA;
        partyBDisplay = txForm.partyBName ? `${txForm.partyB} (${txForm.partyBName})` : txForm.partyB;
      } else {
        // Giao dịch thương mại thông thường
        taxAmount = (amountInBase * activeTaxRate) / 100;

        if (txForm.taxPayer === 'seller') {
          realAmountA = amountInBase - taxAmount;
          realAmountB = -amountInBase;
        } else {
          realAmountA = amountInBase;
          realAmountB = -(amountInBase + taxAmount);
        }
        partyADisplay = txForm.partyAName ? `${txForm.partyA} (${txForm.partyAName})` : txForm.partyA;
        partyBDisplay = txForm.partyBName ? `${txForm.partyB} (${txForm.partyBName})` : txForm.partyB;
      }

      const payload = {
        ...txForm,
        typeId: selectedTypeId,
        typeName: activeTypeObj?.name || 'Giao dịch',
        isTaxPayment: isDirectTaxType,
        isTaxExpenditure: isTaxExpenditureType,
        isEscrow: isEscrowType,
        taxRate: activeTaxRate,
        partyADisplay,
        partyBDisplay,
        partyAType: isTaxExpenditureType ? 'system' : partyAType,
        partyBType: isDirectTaxType ? 'system' : partyBType,
        baseValue,
        baseUnitName: baseUnit,
        amountInBase,
        taxAmount,
        realAmountA,
        realAmountB,
        totalA: realAmountA,
        totalB: realAmountB,
        note: txForm.note.trim(), // Chi tiết nội dung giao dịch
        approved: false, // Chờ Người giữ thuế duyệt
        createdBy: currentUid || 'anonymous',
        createdByName: sessionUser?.displayName || user?.displayName || 'Người chơi',
        timestamp: txForm.isRetroactive && txForm.retroDate ? new Date(txForm.retroDate).getTime() : Date.now(),
        realTimestamp: Date.now()
      };

      await set(txRef, payload);

      alert('🎉 Tạo giao dịch thành công! Giao dịch đã được gửi tới Người giữ thuế duyệt.');

      setShowCreateTxModal(false);
      setTxForm({
        partyA: '',
        partyB: '',
        partyAName: '',
        partyBName: '',
        amount: 1,
        currency: Object.keys(currencies)[0] || baseUnit,
        taxPayer: 'seller',
        isRetroactive: false,
        retroDate: '',
        note: ''
      });
    } catch (err: any) {
      alert("Lỗi tạo giao dịch: " + err.message);
    }
  };

  // Approve Transaction: Only Tax Holder, Map Owner, or Admin
  const handleApproveTx = async (tx: any) => {
    if (!db || !canApproveTx) {
      return alert("Chỉ Người giữ thuế, Chủ phòng hoặc Admin mới có quyền duyệt giao dịch.");
    }

    try {
      const { ref, update, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);

      const approverName = isTaxHolder
        ? `${taxHolderUser?.displayName || 'Người giữ thuế'}`
        : (sessionUser?.displayName || user?.displayName || (isMapOwner ? 'Chủ phòng' : 'Admin'));

      // Đánh dấu đã duyệt
      await update(ref(db, `mw_transactions/${mapId}/${tx.id}`), {
        approved: true,
        approvedBy: approverName,
        approvedByUid: currentUid,
        approvedAt: Date.now()
      });

      // Cập nhật Ngân sách thuế bản đồ:
      // - Nếu là Sử dụng thuế: Trừ amountInBase khỏi ngân sách
      // - Nếu có tiền thuế thu vào (Đóng thuế, Ủy thác, Mua bán): Cộng taxAmount vào ngân sách
      const mapBudgetRef = ref(db, `mw_maps/${mapId}/budget`);

      if (tx.isTaxExpenditure) {
        await runTransaction(mapBudgetRef, (currentBudget: number) => {
          return Math.max(0, (currentBudget || 0) - (tx.amountInBase || 0));
        });
        alert(`🎉 Đã duyệt giải ngân! Đã xuất -${tx.amountInBase?.toLocaleString()} ${tx.baseUnitName || baseUnit} từ Ngân sách thuế.`);
      } else if (tx.taxAmount && tx.taxAmount > 0) {
        await runTransaction(mapBudgetRef, (currentBudget: number) => {
          return (currentBudget || 0) + tx.taxAmount;
        });
        alert(`🎉 Đã duyệt giao dịch! Đã cộng +${tx.taxAmount?.toLocaleString()} ${tx.baseUnitName || baseUnit} vào Ngân sách thuế.`);
      } else {
        alert('🎉 Đã duyệt giao dịch thành công!');
      }
    } catch (e: any) {
      alert('Lỗi duyệt giao dịch: ' + e.message);
    }
  };

  // Reject / Delete unapproved transaction
  const handleRejectTx = async (tx: any) => {
    if (!db || !canApproveTx) return;
    if (!confirm(`Bạn có chắc chắn muốn TỪ CHỐI và xóa giao dịch chưa duyệt này?`)) return;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_transactions/${mapId}/${tx.id}`));
      alert('Đã từ chối giao dịch.');
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  // Delete transaction (For Map Owner / Admin)
  const handleDeleteTx = async (tx: any) => {
    if (!isMapOwner && !isAdmin) return;
    if (!db || !confirm(`Bạn có chắc chắn muốn xóa giao dịch này?`)) return;

    try {
      const { ref, remove, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js' as any);
      await remove(ref(db, `mw_transactions/${mapId}/${tx.id}`));

      // Hoàn tác ngân sách nếu giao dịch đã được duyệt trước đó
      if (tx.approved) {
        const mapBudgetRef = ref(db, `mw_maps/${mapId}/budget`);
        if (tx.isTaxExpenditure) {
          // Hoàn lại tiền chi
          await runTransaction(mapBudgetRef, (currentBudget: number) => {
            return (currentBudget || 0) + (tx.amountInBase || 0);
          });
        } else if (tx.taxAmount && tx.taxAmount > 0) {
          // Hoàn trừ thuế
          await runTransaction(mapBudgetRef, (currentBudget: number) => {
            return Math.max(0, (currentBudget || 0) - tx.taxAmount);
          });
        }
      }
      alert('Đã xóa giao dịch và hoàn tác lại ngân sách.');
    } catch (e: any) {
      alert("Lỗi xóa giao dịch: " + e.message);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (filterDate) {
        const txDate = new Date(tx.timestamp).toISOString().split('T')[0];
        if (txDate !== filterDate) return false;
      }
      if (filterType !== 'all') {
        if (filterType === 'tax' && !tx.isTaxPayment && tx.typeName !== 'Đóng thuế') return false;
        if (filterType === 'expenditure' && !tx.isTaxExpenditure && tx.typeName !== 'Sử dụng thuế') return false;
        if (filterType === 'escrow' && !tx.isEscrow && tx.typeName !== 'Ủy thác') return false;
        if (filterType !== 'tax' && filterType !== 'expenditure' && filterType !== 'escrow' && tx.typeId !== filterType && tx.typeName !== filterType) return false;
      }
      if (filterStatus !== 'all') {
        if (filterStatus === 'approved' && !tx.approved) return false;
        if (filterStatus === 'pending' && tx.approved) return false;
      }
      if (filterSearch.trim()) {
        const q = filterSearch.trim().toLowerCase();
        const strA = (tx.partyADisplay || tx.partyA || '').toLowerCase();
        const strB = (tx.partyBDisplay || tx.partyB || '').toLowerCase();
        const strType = (tx.typeName || '').toLowerCase();
        const strNote = (tx.note || '').toLowerCase();
        if (!strA.includes(q) && !strB.includes(q) && !strType.includes(q) && !strNote.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filterDate, filterType, filterStatus, filterSearch]);

  const pendingCount = useMemo(() => {
    return transactions.filter(t => !t.approved).length;
  }, [transactions]);

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

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>🛡️ Người giữ thuế:</span>
            {taxHolderUser ? (
              <button
                onClick={() => setShowTaxHolderProfileModal(true)}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                <span>👤</span> {taxHolderUser.displayName || taxHolderUser.userId} (Xem chi tiết)
                {isTaxHolder && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold ml-1">Là bạn</span>}
              </button>
            ) : (
              <span className="italic text-slate-500">Chưa thiết lập người giữ thuế chính</span>
            )}

            {pendingCount > 0 && canApproveTx && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 animate-pulse">
                <span>⚠️</span> {pendingCount} giao dịch đang chờ bạn duyệt
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateTxModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <span>➕</span> Tạo Giao Dịch / Thuế / Ủy Thác
          </button>

          <button
            onClick={() => setShowCalculatorModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-2xl text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>🧮</span> Máy Tính Quy Đổi
          </button>

          {isMapOwner && (
            <>
              <button
                onClick={() => setShowTxTypeConfig(!showTxTypeConfig)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all"
              >
                ⚙️ Loại giao dịch ({txTypes.length})
              </button>

              <button
                onClick={() => setShowTaxHolderModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
              >
                👤 Người giữ thuế
              </button>
            </>
          )}

          <button
            onClick={() => setShowCurrencyConfig(!showCurrencyConfig)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1"
          >
            <span>🪙</span> Tiền tệ ({baseUnit})
          </button>
        </div>
      </div>

      {/* Transaction Types Management Panel */}
      {showTxTypeConfig && isMapOwner && (
        <div className="glass p-6 rounded-3xl animate-in slide-in-from-top-3 border border-purple-200 bg-white shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cấu Hình Loại Giao Dịch, Mức Thuế & Ngày Giờ Áp Dụng</h4>
              <p className="text-xs text-slate-500 mt-0.5">Quy định ngày giờ bắt đầu áp dụng, xem lịch sử các mức thuế trong quá khứ và chỉnh sửa mức thuế.</p>
            </div>
            <button onClick={() => setShowTxTypeConfig(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {txTypes.map(t => {
              const isTax = t.name === 'Đóng thuế' || t.isTaxDirect;
              const isExp = t.name === 'Sử dụng thuế' || t.isTaxExpenditure;
              const isEsc = t.name === 'Ủy thác' || t.isEscrow;
              const hasHistory = Array.isArray(t.rateHistory) && t.rateHistory.length > 0;

              return (
                <div key={t.id} className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-2 ${isTax ? 'bg-emerald-50 border-emerald-200' :
                  isExp ? 'bg-amber-50 border-amber-200' :
                    isEsc ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                        {isTax && <span>🏛️</span>}
                        {isExp && <span>💸</span>}
                        {isEsc && <span>🤝</span>}
                        <span>{t.name}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {hasHistory && (
                          <button
                            onClick={() => setViewingRateHistoryType(t)}
                            className="text-indigo-600 hover:bg-indigo-100 p-1 rounded-lg font-bold text-[10px]"
                            title="Xem lịch sử mức thuế trong quá khứ"
                          >
                            📜 Lịch sử ({t.rateHistory.length})
                          </button>
                        )}
                        {!isTax && !isExp && (
                          <button
                            onClick={() => handleOpenEditTxType(t)}
                            className="text-blue-600 hover:bg-blue-100 p-1 rounded-lg font-bold text-[11px]"
                            title="Chỉnh sửa loại thuế & ngày áp dụng"
                          >
                            ✏️
                          </button>
                        )}
                        {!isTax && !isExp && !isEsc && (
                          <button
                            onClick={() => handleDeleteTxType(t.id, t.name)}
                            className="text-slate-400 hover:text-rose-600 p-1 font-bold"
                            title="Xóa loại giao dịch"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`font-bold font-mono mt-1 ${isTax ? 'text-emerald-700' : isExp ? 'text-amber-700' : isEsc ? 'text-indigo-700' : 'text-rose-600'}`}>
                      {isTax ? '100% nộp vào Ngân sách thuế' : isExp ? '0% thuế (Chi xuất ngân sách)' : `Thuế: ${t.rate}%`}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1">
                      Áp dụng từ: <strong className="text-slate-600">{t.effectiveFrom ? new Date(t.effectiveFrom).toLocaleString('vi-VN') : 'Hiện tại'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form thêm loại mới */}
          <form onSubmit={handleCreateTxType} className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100">
            <input
              type="text"
              required
              placeholder="Tên loại giao dịch mới..."
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              className="flex-1 min-w-[180px] bg-white text-xs text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                required
                placeholder="Thuế (%)"
                value={newTypeRate}
                onChange={e => setNewTypeRate(Number(e.target.value))}
                className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 w-20 focus:outline-none focus:border-purple-500 font-bold"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-slate-500 font-bold">Áp dụng từ:</label>
              <input
                type="datetime-local"
                required
                value={newTypeEffectiveFrom}
                onChange={e => setNewTypeEffectiveFrom(e.target.value)}
                className="bg-white text-xs text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
              />
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
        <div className="glass p-6 rounded-3xl animate-in slide-in-from-top-3 border border-blue-200 bg-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Bảng Tỷ Giá Tiền Tệ & Vật Phẩm
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Đơn vị tiền tệ cơ sở hiện tại: <strong className="text-blue-600 uppercase font-black">{baseUnit}</strong> (Được tự do đổi tên).
              </p>
            </div>
            {isMapOwner && (
              <button
                onClick={() => {
                  setNewBaseUnitInput(baseUnit);
                  setShowChangeBaseUnitModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm"
              >
                ✏️ Đổi Đơn Vị Cơ Sở
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(currencies).map(([curr, val]) => (
              <div key={curr} className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${curr === baseUnit ? 'bg-blue-50/80 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className="font-bold text-slate-800 capitalize flex items-center gap-1">
                    {curr === baseUnit && <span className="text-[10px] text-blue-600 font-bold">⭐ Cơ sở:</span>} {curr}
                  </span>
                  <div className="text-emerald-600 font-mono font-bold mt-0.5">{val.toLocaleString()} {baseUnit}</div>
                </div>
                {isMapOwner && curr !== baseUnit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setNewCurrencyName(curr);
                        setNewCurrencyVal(val);
                        setEditingCurrency(curr);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-1 text-[11px]"
                      title="Sửa tỷ giá"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCurrency(curr)}
                      className="text-slate-400 hover:text-rose-500 p-1 text-xs font-bold"
                      title="Xóa đơn vị này"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isMapOwner && (
            <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100">
              <input
                type="text"
                placeholder="Tên tiền tệ / vật phẩm mới..."
                value={newCurrencyName}
                onChange={e => setNewCurrencyName(e.target.value)}
                className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                step="0.01"
                min="0.001"
                placeholder={`Tỷ giá ra ${baseUnit}...`}
                value={newCurrencyVal}
                onChange={e => setNewCurrencyVal(Number(e.target.value))}
                className="bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 w-40 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveCurrency}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
              >
                {editingCurrency ? '✓ Cập nhật tỷ giá' : '+ Thêm đơn vị'}
              </button>
              {editingCurrency && (
                <button
                  onClick={() => {
                    setEditingCurrency(null);
                    setNewCurrencyName('');
                    setNewCurrencyVal(1);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Hủy
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transaction History Section */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-md bg-white flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📜</span> Lịch Sử Giao Dịch, Thuế & Ủy Thác
            </h3>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span>Tổng: <strong className="text-slate-800">{transactions.length}</strong></span>
              <span>•</span>
              <span>Chờ duyệt: <strong className="text-amber-600 font-black">{pendingCount}</strong></span>
              <span>•</span>
              <span>
                Gần nhất: <strong className="text-blue-600 font-medium">
                  {latestTx ? new Date(latestTx.timestamp).toLocaleString('vi-VN') : 'Chưa có'}
                </strong>
              </span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
            <input
              type="text"
              placeholder="Tìm tên, NDID, chi tiết..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ duyệt ({pendingCount})</option>
              <option value="approved">✓ Đã duyệt</option>
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="tax">🏛️ Đóng thuế</option>
              <option value="expenditure">💸 Sử dụng thuế</option>
              <option value="escrow">🤝 Hợp đồng ủy thác</option>
              {txTypes.filter(t => !t.isTaxDirect && !t.isTaxExpenditure && !t.isEscrow).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            />
            {(filterDate || filterType !== 'all' || filterStatus !== 'all' || filterSearch) && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterSearch('');
                }}
                className="text-slate-400 hover:text-slate-700 underline text-xs"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredTransactions.map(tx => {
            const isTax = tx.isTaxPayment || tx.typeName === 'Đóng thuế';
            const isExp = tx.isTaxExpenditure || tx.typeName === 'Sử dụng thuế';
            const isEsc = tx.isEscrow || tx.typeName === 'Ủy thác';

            const unit = tx.baseUnitName || baseUnit;
            const baseVal = tx.amountInBase || (tx.amount * (currencies[tx.currency] || 1));
            const tax = tx.taxAmount !== undefined ? tx.taxAmount : (isTax ? baseVal : (isExp ? 0 : (baseVal * (tx.taxRate || 0)) / 100));

            // Tính số tiền thực tế Bên A nhận (+) hoặc chi (-)
            let displayA = 0;
            let isPositiveA = true;
            let noteA = '';

            if (isTax) {
              displayA = baseVal;
              isPositiveA = false;
              noteA = 'Nộp vào ngân sách thuế';
            } else if (isExp) {
              displayA = baseVal;
              isPositiveA = false;
              noteA = 'Xuất từ Quỹ Thuế';
            } else if (isEsc) {
              displayA = baseVal + tax;
              isPositiveA = false;
              noteA = `Gồm ${baseVal.toLocaleString()} tiền ủy thác + ${tax.toLocaleString()} thuế (${tx.taxRate}%)`;
            } else if (tx.taxPayer === 'seller') {
              displayA = baseVal - tax;
              isPositiveA = true;
              noteA = `Đã trừ ${tax.toLocaleString()} ${unit} tiền thuế (${tx.taxRate}%)`;
            } else {
              displayA = baseVal;
              isPositiveA = true;
              noteA = 'Nhận trọn vẹn tiền bán';
            }

            // Tính số tiền thực tế Bên B mất (-) hoặc nhận (+)
            let displayB = 0;
            let isPositiveB = false;
            let noteB = '';

            if (isTax) {
              displayB = baseVal;
              isPositiveB = true;
              noteB = 'Thu vào quỹ ngân sách';
            } else if (isExp) {
              displayB = baseVal;
              isPositiveB = true;
              noteB = 'Thực nhận từ Quỹ Thuế';
            } else if (isEsc) {
              displayB = baseVal;
              isPositiveB = true;
              noteB = 'Thù lao ủy thác thực nhận';
            } else if (tx.taxPayer === 'buyer') {
              displayB = baseVal + tax;
              isPositiveB = false;
              noteB = `Gồm ${baseVal.toLocaleString()} tiền hàng + ${tax.toLocaleString()} thuế (${tx.taxRate}%)`;
            } else {
              displayB = baseVal;
              isPositiveB = false;
              noteB = 'Trả đúng tiền hàng niêm yết';
            }

            return (
              <div
                key={tx.id}
                className={`p-4 rounded-2xl border transition-all ${!tx.approved
                  ? 'bg-amber-50/40 border-amber-300/80 shadow-sm'
                  : (isTax ? 'bg-emerald-50/30 border-emerald-200' : isExp ? 'bg-orange-50/30 border-orange-200' : isEsc ? 'bg-indigo-50/30 border-indigo-200' : (tx.isRetroactive ? 'bg-slate-50 border-amber-200' : 'bg-slate-50/80 border-slate-200'))
                  } hover:shadow-md relative overflow-hidden`}
              >
                {/* Retroactive Badge */}
                {tx.isRetroactive && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                    ⏰ Truy hồi ngày giờ
                  </div>
                )}

                {/* Header info */}
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{new Date(tx.timestamp).toLocaleString('vi-VN')}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${isTax ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' :
                      isExp ? 'text-amber-800 bg-amber-100 border border-amber-200' :
                        isEsc ? 'text-indigo-800 bg-indigo-100 border border-indigo-200' :
                          'text-purple-700 bg-purple-100'
                      }`}>
                      {isTax ? '🏛️ Đóng thuế trực tiếp' : isExp ? '💸 Sử dụng ngân sách thuế' : isEsc ? '🤝 Hợp đồng ủy thác' : (tx.typeName || 'Giao dịch chung')}
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-800">
                    {tx.amount} <span className="text-xs text-blue-600 uppercase font-bold">{tx.currency}</span> ≈ {baseVal?.toLocaleString()} {unit}
                  </div>
                </div>

                {/* Economic exchange box (Real Calculated Amounts) */}
                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl mt-2 border border-slate-200/90 shadow-sm">
                  {/* Bên A Box */}
                  <div className="text-center w-[46%]">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {isTax ? '👤 Người Nộp Thuế' : isExp ? '🏛️ Nguồn Chi (Quỹ Thuế)' : isEsc ? '👤 Bên Thuê Ủy Thác' : `Bên A (${tx.partyAType === 'org' ? '🏢 Tổ chức' : '👤 Người bán'})`}
                    </div>
                    <div className="font-bold text-blue-600 text-xs truncate mt-0.5" title={tx.partyADisplay || tx.partyA}>
                      {tx.partyADisplay || tx.partyA}
                    </div>
                    <div className={`text-xs font-mono font-black mt-1 ${isPositiveA ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositiveA ? `+${displayA.toLocaleString()}` : `-${displayA.toLocaleString()}`} {unit}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{noteA}</div>
                  </div>

                  {/* Arrow Transfer Icon */}
                  <div className="text-slate-300 font-black text-sm">➔</div>

                  {/* Bên B Box */}
                  <div className="text-center w-[46%]">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {isTax ? '🏛️ Nơi Tiếp Nhận Thuế' : isExp ? '👤 Người Thụ Hưởng' : isEsc ? '👤 Bên Nhận Ủy Thác' : `Bên B (${tx.partyBType === 'org' ? '🏢 Tổ chức' : '👤 Người mua'})`}
                    </div>
                    <div className={`font-bold text-xs truncate mt-0.5 ${isTax ? 'text-emerald-700' : isExp ? 'text-amber-800' : isEsc ? 'text-indigo-700' : 'text-purple-600'}`} title={tx.partyBDisplay || tx.partyB}>
                      {tx.partyBDisplay || tx.partyB}
                    </div>
                    <div className={`text-xs font-mono font-black mt-1 ${isPositiveB ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositiveB ? `+${displayB.toLocaleString()}` : `-${displayB.toLocaleString()}`} {unit}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{noteB}</div>
                  </div>
                </div>

                {/* Transaction Note / Details if present */}
                {tx.note && (
                  <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700 border border-slate-200/70 font-medium">
                    <span className="font-bold text-slate-500 mr-1.5">📝 Chi tiết:</span>
                    <LatexRenderer text={tx.note} className="leading-relaxed" />
                  </div>
                )}

                {/* Footer details: Tax summary & Approval actions */}
                <div className="mt-3 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                  <div>
                    {isTax ? (
                      <span className="text-emerald-700 font-bold">
                        Đã đóng 100% vào Ngân sách thuế: <span className="font-mono">+{tax?.toLocaleString()} {unit}</span>
                      </span>
                    ) : isExp ? (
                      <span className="text-amber-800 font-bold">
                        Xuất quỹ ngân sách thuế: <span className="font-mono">-{baseVal?.toLocaleString()} {unit}</span> (0% thuế)
                      </span>
                    ) : isEsc ? (
                      <span>
                        Thuế ủy thác (<strong className="text-slate-700">{tx.taxRate}%</strong> do <strong className="text-indigo-700">Bên A (Thuê)</strong> nộp): <span className="text-rose-600 font-bold font-mono">+{tax?.toLocaleString()} {unit}</span>
                      </span>
                    ) : (
                      <span>
                        Thuế (<strong className="text-slate-700">{tx.taxRate}%</strong> do <strong className="text-purple-700">{tx.taxPayer === 'seller' ? 'Bên A (Bán)' : 'Bên B (Mua)'}</strong> chi trả): <span className="text-rose-600 font-bold font-mono">+{tax?.toLocaleString()} {unit}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.approved ? (
                      <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span>✓</span> Đã duyệt ({tx.approvedBy || 'Người giữ thuế'})
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-800 bg-amber-100 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <span>⏳</span> Chờ người giữ thuế duyệt
                        </span>

                        {canApproveTx && (
                          <>
                            <button
                              onClick={() => handleApproveTx(tx)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                              title="Duyệt giao dịch và cập nhật vào ngân sách"
                            >
                              <span>✓</span> Duyệt
                            </button>

                            <button
                              onClick={() => handleRejectTx(tx)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all"
                              title="Từ chối giao dịch"
                            >
                              ✕ Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {(isMapOwner || isAdmin) && (
                      <button
                        onClick={() => handleDeleteTx(tx)}
                        className="text-slate-400 hover:text-rose-600 p-1 text-[11px] font-bold ml-1"
                        title="Xóa giao dịch này"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <div className="text-center text-slate-400 py-16 text-xs">
              Chưa có giao dịch nào phù hợp với bộ lọc.
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
                  <span>💸</span> Tạo Giao Dịch / Thuế / Ủy Thác
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Sau khi tạo, giao dịch sẽ được gửi tới Người giữ thuế duyệt.</p>
              </div>
              <button
                onClick={() => setShowCreateTxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {/* Chọn loại giao dịch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại giao dịch *</label>
                <select
                  value={selectedTypeId}
                  onChange={e => setSelectedTypeId(e.target.value)}
                  required
                  className="w-full bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                >
                  {txTypes.map(t => {
                    const isTax = t.name === 'Đóng thuế' || t.isTaxDirect;
                    const isExp = t.name === 'Sử dụng thuế' || t.isTaxExpenditure;
                    const isEsc = t.name === 'Ủy thác' || t.isEscrow;
                    return (
                      <option key={t.id} value={t.id}>
                        {isTax ? '🏛️ Đóng thuế (Nộp vào quỹ thuế)' :
                          isExp ? '💸 Sử dụng thuế (Xuất quỹ ngân sách)' :
                            isEsc ? `🤝 Ủy thác (Thuế ủy thác ${t.rate}%)` :
                              `${t.name} (Thuế ${t.rate}%)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Bên A Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    {isDirectTaxType ? 'Bên Nộp Thuế *' : isTaxExpenditureType ? 'Nguồn Chi Ngân Sách' : isEscrowType ? 'Bên Thuê Ủy Thác (Trả thuế) *' : 'Bên A (Người bán / Cung cấp hàng) *'}
                  </label>
                  {!isTaxExpenditureType && (
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
                  )}
                </div>

                {!isTaxExpenditureType ? (
                  partyAType === 'user' ? (
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
                  )
                ) : (
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs">
                    <div className="text-[10px] font-bold text-amber-800 uppercase">Kho Bạc Ngân Sách Thuế Bản Đồ</div>
                    <div className="font-bold text-amber-950 mt-0.5 flex items-center justify-between">
                      <span>🏛️ {taxHolderUser ? `Người giữ thuế: ${taxHolderUser.displayName}` : 'Quỹ Ngân Sách Thuế Bản Đồ'}</span>
                      <span className="font-mono text-emerald-700">Khả dụng: {(mapData?.budget || 0).toLocaleString()} {baseUnit}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bên B Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    {isDirectTaxType ? 'Nơi Tiếp Nhận Thuế' : isTaxExpenditureType ? 'Bên Thụ Hưởng (Nhận giải ngân) *' : isEscrowType ? 'Bên Nhận Ủy Thác (Làm nhiệm vụ) *' : 'Bên B (Người mua / Trả tiền) *'}
                  </label>
                  {!isDirectTaxType && (
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
                  )}
                </div>

                {!isDirectTaxType ? (
                  partyBType === 'user' ? (
                    <UserSearchInput
                      value={txForm.partyB}
                      selectedName={txForm.partyBName}
                      onChange={(val, name) => setTxForm(prev => ({ ...prev, partyB: val, partyBName: name || '' }))}
                      placeholder="Tìm Tên, NDID hoặc CodeID người nhận..."
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
                      <option value="">-- Chọn Tổ chức nhận --</option>
                      {orgs.map(o => <option key={o.id} value={o.id}>{o.name} (ID: {o.id})</option>)}
                    </select>
                  )
                ) : (
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Nơi Tiếp Nhận Thuế</div>
                    <div className="font-bold text-emerald-900 mt-0.5 flex items-center gap-1.5">
                      <span>🏛️</span> {taxHolderUser ? `${taxHolderUser.displayName} (Người giữ thuế)` : 'Quỹ Ngân Sách Thuế Bản Đồ'}
                    </div>
                  </div>
                )}
              </div>

              {/* Số lượng & Đơn vị */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng *</label>
                  <input
                    required
                    type="number"
                    min="0.001"
                    step="any"
                    value={txForm.amount}
                    onChange={e => setTxForm({ ...txForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Loại tiền / Vật phẩm</label>
                  <select
                    value={txForm.currency}
                    onChange={e => setTxForm({ ...txForm, currency: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 capitalize font-bold"
                  >
                    {Object.keys(currencies).map(c => <option key={c} value={c}>{c} ({currencies[c]} {baseUnit})</option>)}
                  </select>
                </div>
              </div>

              {/* Chi tiết nội dung giao dịch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chi tiết về giao dịch / Hợp đồng ủy thác
                  <span className="ml-2 font-normal text-slate-400 text-[10px]">
                    Hỗ trợ LaTeX: <code className="bg-slate-100 px-0.5 rounded">$...$</code> inline &nbsp;
                    <code className="bg-slate-100 px-0.5 rounded">$$...$$</code> block
                  </span>
                </label>
                <textarea
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  placeholder={
                    isEscrowType ? "Mô tả công việc, thỏa thuận và yêu cầu ủy thác cụ thể..." :
                      isTaxExpenditureType ? "Lý do chi giải ngân ngân sách (vd: Xây cầu đường, tổ chức sự kiện...)..." :
                        isDirectTaxType ? "Ghi chú đóng thuế (vd: Thuế đất quý 3, Thuế khai khoáng...)..." :
                          "Nhập chi tiết (hỗ trợ LaTeX math, vd: $F = ma$, $$E=mc^2$$)..."
                  }
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
                {/* LaTeX Live Preview — hiện khi note có ký tự LaTeX $ \( \[ */}
                {txForm.note && containsLatex(txForm.note) && (
                  <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-blue-500 mb-1.5 flex items-center gap-1">
                      🔢 Xem trước LaTeX
                    </div>
                    <div className="text-sm text-slate-800 leading-relaxed">
                      <LatexRenderer text={txForm.note} />
                    </div>
                  </div>
                )}
              </div>


              {/* Bên nộp thuế (Chỉ hiện cho giao dịch thường) */}
              {!isDirectTaxType && !isTaxExpenditureType && !isEscrowType && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Bên nộp thuế ({activeTaxRate}%) *</label>
                  <select
                    value={txForm.taxPayer}
                    onChange={e => setTxForm({ ...txForm, taxPayer: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="seller">Bên A nộp thuế (Người bán chịu thuế - Trừ từ tiền nhận)</option>
                    <option value="buyer">Bên B nộp thuế (Người mua chịu thuế - Phải trả thêm)</option>
                  </select>
                </div>
              )}

              {/* Live Preview Calculation (Thực nhận & Thực trả) */}
              {(() => {
                const baseVal = (txForm.amount || 0) * (currencies[txForm.currency] || 1);
                const taxVal = isDirectTaxType ? baseVal : (isTaxExpenditureType ? 0 : (baseVal * activeTaxRate) / 100);

                let calcA = 0;
                let calcB = 0;

                if (isDirectTaxType) {
                  calcA = -baseVal;
                  calcB = baseVal;
                } else if (isTaxExpenditureType) {
                  calcA = -baseVal;
                  calcB = baseVal;
                } else if (isEscrowType) {
                  calcA = -(baseVal + taxVal);
                  calcB = baseVal;
                } else if (txForm.taxPayer === 'seller') {
                  calcA = baseVal - taxVal;
                  calcB = baseVal;
                } else {
                  calcA = baseVal;
                  calcB = baseVal + taxVal;
                }

                return (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Bảng Tạm Tính Thực Tế ({baseUnit})
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Giá trị giao dịch gốc:</span>
                      <span className="font-bold font-mono">{baseVal.toLocaleString()} {baseUnit}</span>
                    </div>

                    {!isTaxExpenditureType && (
                      <div className="flex justify-between text-rose-600">
                        <span>Tiền thuế ({activeTaxRate}%):</span>
                        <span className="font-bold font-mono">+{taxVal.toLocaleString()} {baseUnit}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 space-y-1.5 font-bold">
                      <div className="flex justify-between text-blue-600">
                        <span>{isDirectTaxType ? 'Bên A (Người nộp) phải chi:' : isTaxExpenditureType ? 'Quỹ Ngân Sách Thuế chi xuất:' : isEscrowType ? 'Bên A (Thuê ủy thác) thực tế chi:' : 'Bên A thực tế nhận được:'}</span>
                        <span className="font-mono">{calcA >= 0 ? `+${calcA.toLocaleString()}` : `-${Math.abs(calcA).toLocaleString()}`} {baseUnit}</span>
                      </div>

                      <div className="flex justify-between text-purple-700">
                        <span>{isDirectTaxType ? 'Quỹ Ngân Sách Thuế tiếp nhận:' : isTaxExpenditureType ? 'Bên B (Thụ hưởng) thực tế nhận:' : isEscrowType ? 'Bên B (Nhận ủy thác) thực tế nhận:' : 'Bên B thực tế phải chi trả:'}</span>
                        <span className="font-mono">{isDirectTaxType || isTaxExpenditureType || isEscrowType ? `+${calcB.toLocaleString()}` : `-${calcB.toLocaleString()}`} {baseUnit}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Giao dịch trước đó (Retroactive) */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={txForm.isRetroactive}
                    onChange={e => setTxForm({ ...txForm, isRetroactive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Đã xảy ra trước đó (Truy hồi ngày giờ)
                </label>

                {txForm.isRetroactive && (
                  <input
                    type="datetime-local"
                    value={txForm.retroDate}
                    onChange={e => setTxForm({ ...txForm, retroDate: e.target.value })}
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
                  Gửi Giao Dịch Chờ Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TAX TYPE MODAL */}
      {editingTxType && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-slate-800">Chỉnh Sửa Loại Thuế & Ngày Áp Dụng</h3>
            <p className="text-xs text-slate-500">Mức thuế cũ sẽ được tự động lưu vào Lịch sử mức thuế trong quá khứ.</p>

            <form onSubmit={handleSaveEditedTxType} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên loại giao dịch</label>
                <input
                  type="text"
                  required
                  value={editTypeName}
                  onChange={e => setEditTypeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức thuế mới (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={editTypeRate}
                  onChange={e => setEditTypeRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày giờ bắt đầu áp dụng mức thuế mới *</label>
                <input
                  type="datetime-local"
                  required
                  value={editTypeEffectiveFrom}
                  onChange={e => setEditTypeEffectiveFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTxType(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md"
                >
                  Lưu & Ghi Lịch Sử
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAX RATE HISTORY MODAL */}
      {viewingRateHistoryType && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  📜 Lịch Sử Mức Thuế: {viewingRateHistoryType.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mức thuế hiện tại: <strong className="text-rose-600 font-mono font-black">{viewingRateHistoryType.rate}%</strong> (Áp dụng từ: {viewingRateHistoryType.effectiveFrom ? new Date(viewingRateHistoryType.effectiveFrom).toLocaleString('vi-VN') : 'Hiện tại'})
                </p>
              </div>
              <button
                onClick={() => setViewingRateHistoryType(null)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
              {Array.isArray(viewingRateHistoryType.rateHistory) && viewingRateHistoryType.rateHistory.length > 0 ? (
                viewingRateHistoryType.rateHistory.map((h: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Mức thuế trong quá khứ #{idx + 1}</span>
                      <span className="bg-rose-100 text-rose-800 font-mono font-bold px-2 py-0.5 rounded-md">{h.rate}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Khoảng thời gian: <span className="font-semibold text-slate-700">{h.effectiveFrom ? new Date(h.effectiveFrom).toLocaleString('vi-VN') : 'Trước'}</span> ➔ <span className="font-semibold text-slate-700">{h.effectiveTo ? new Date(h.effectiveTo).toLocaleString('vi-VN') : 'Sau'}</span>
                    </div>
                    {h.changedBy && (
                      <div className="text-[10px] text-slate-400">Người cập nhật: {h.changedBy}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-12">
                  Loại giao dịch này chưa có lần thay đổi mức thuế nào trong quá khứ.
                </div>
              )}
            </div>

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setViewingRateHistoryType(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE BASE UNIT MODAL */}
      {showChangeBaseUnitModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 border border-slate-200 shadow-2xl bg-white space-y-4">
            <h3 className="text-base font-black text-slate-800">Đổi Đơn Vị Tiền Tệ Cơ Sở</h3>
            <p className="text-xs text-slate-500">
              Bạn có thể tự do đặt tên cho đơn vị tiền tệ gốc của bản đồ (ví dụ: <code>xu</code>, <code>coin</code>, <code>gem</code>, <code>đồng</code>, <code>vàng</code>...).
            </p>

            <form onSubmit={handleChangeBaseUnit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Tên đơn vị tiền tệ cơ sở mới..."
                value={newBaseUnitInput}
                onChange={e => setNewBaseUnitInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeBaseUnitModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHOOSE TAX HOLDER MODAL */}
      {showTaxHolderModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl bg-white">
            <h3 className="text-base font-black text-slate-800 mb-2">Chọn Người Giữ Thuế Chính</h3>
            <p className="text-xs text-slate-500 mb-4">Tìm và chỉ định người chịu trách nhiệm giữ ngân sách và phê duyệt các giao dịch kinh tế của bản đồ.</p>

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
                <p className="text-xs text-slate-400 font-mono">NDID: {taxHolderUser.userId}</p>
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
