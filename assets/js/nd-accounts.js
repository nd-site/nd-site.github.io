/**
 * ND Labs — Multi-Account Management Core (Hệ thống quản lý đa tài khoản phong cách Google)
 * Hỗ trợ tối đa 10 tài khoản (chỉ mục từ 0 đến 9), định tuyến thông qua tham số URL `?u=<0..9>`.
 */

(function () {
  const MAX_ACCOUNTS = 10;

  // Lấy chỉ mục tài khoản hiện tại từ URL query (?u=0..9)
  function getActiveIndexFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const u = params.get('u');
      if (u !== null && !isNaN(parseInt(u, 10))) {
        const idx = parseInt(u, 10);
        if (idx >= 0 && idx < MAX_ACCOUNTS) return idx;
      }
    } catch (_) {}
    
    // Nếu URL không có ?u=, lấy từ localStorage
    try {
      const storedIdx = localStorage.getItem('nd_active_index');
      if (storedIdx !== null && !isNaN(parseInt(storedIdx, 10))) {
        const idx = parseInt(storedIdx, 10);
        if (idx >= 0 && idx < MAX_ACCOUNTS) return idx;
      }
    } catch (_) {}

    return 0; // Mặc định tài khoản 0
  }

  // Lấy danh sách tất cả tài khoản đã đăng nhập
  function getAllAccounts() {
    try {
      const raw = localStorage.getItem('nd_accounts');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list.slice(0, MAX_ACCOUNTS);
      }
    } catch (_) {}

    // Fallback: nếu chưa có nd_accounts nhưng có nd_user đơn lẻ
    try {
      const single = localStorage.getItem('nd_user');
      if (single) {
        const u = JSON.parse(single);
        if (u && (u.uid || u.ndid)) {
          const list = [u];
          localStorage.setItem('nd_accounts', JSON.stringify(list));
          return list;
        }
      }
    } catch (_) {}

    return [];
  }

  // Lấy thông tin tài khoản hiện đang active
  function getActiveAccount() {
    const accounts = getAllAccounts();
    const activeIdx = getActiveIndexFromUrl();
    if (accounts.length === 0) return null;
    return accounts[activeIdx] || accounts[0] || null;
  }

  // Đồng bộ session tài khoản active vào nd_user để tương thích 100% các trang
  function syncActiveAccountToSession() {
    const active = getActiveAccount();
    const activeIdx = getActiveIndexFromUrl();
    if (active) {
      localStorage.setItem('nd_user', JSON.stringify(active));
      localStorage.setItem('nd_active_index', activeIdx.toString());
    }
  }

  // Thêm hoặc cập nhật tài khoản vào danh sách đa tài khoản
  function saveAccount(accountData, setAsActive = true) {
    if (!accountData) return;
    const accounts = getAllAccounts();
    
    // Tìm xem tài khoản đã tồn tại chưa (theo uid hoặc ndid hoặc email)
    const existingIdx = accounts.findIndex(a => 
      (a.uid && a.uid === accountData.uid) || 
      (a.ndid && a.ndid === accountData.ndid) || 
      (a.email && accountData.email && a.email === accountData.email)
    );

    let targetIdx = 0;
    if (existingIdx >= 0) {
      // Cập nhật thông tin tài khoản đã có
      accounts[existingIdx] = { ...accounts[existingIdx], ...accountData };
      targetIdx = existingIdx;
    } else {
      // Thêm mới nếu chưa đủ 10 tài khoản
      if (accounts.length < MAX_ACCOUNTS) {
        accounts.push(accountData);
        targetIdx = accounts.length - 1;
      } else {
        // Nếu đã đủ 10 tài khoản, ghi đè tài khoản active hiện tại
        const curr = getActiveIndexFromUrl();
        accounts[curr] = accountData;
        targetIdx = curr;
      }
    }

    localStorage.setItem('nd_accounts', JSON.stringify(accounts));
    if (setAsActive) {
      localStorage.setItem('nd_active_index', targetIdx.toString());
      localStorage.setItem('nd_user', JSON.stringify(accounts[targetIdx]));
    }
    return targetIdx;
  }

  // Chuyển đổi sang tài khoản tại chỉ mục index (0..9)
  function switchAccount(index) {
    const accounts = getAllAccounts();
    if (index >= 0 && index < accounts.length) {
      localStorage.setItem('nd_active_index', index.toString());
      localStorage.setItem('nd_user', JSON.stringify(accounts[index]));
      
      const currentUrl = new URL(window.location.href);
      if (index === 0) {
        currentUrl.searchParams.delete('u');
      } else {
        currentUrl.searchParams.set('u', index.toString());
      }
      window.location.href = currentUrl.toString();
    }
  }

  // Đăng xuất một tài khoản cụ thể theo index
  function removeAccount(index) {
    let accounts = getAllAccounts();
    if (index >= 0 && index < accounts.length) {
      accounts.splice(index, 1);
      localStorage.setItem('nd_accounts', JSON.stringify(accounts));
      if (accounts.length === 0) {
        localStorage.removeItem('nd_user');
        localStorage.removeItem('nd_active_index');
        window.location.href = '/auth/login/';
      } else {
        const nextIdx = Math.max(0, index - 1);
        switchAccount(nextIdx);
      }
    }
  }

  // Đăng xuất toàn bộ tài khoản
  function removeAllAccounts() {
    localStorage.removeItem('nd_accounts');
    localStorage.removeItem('nd_user');
    localStorage.removeItem('nd_active_index');
    window.location.href = '/auth/login/';
  }

  // Tạo URL kèm tham số ?u= tương ứng
  function buildUrlWithAccount(urlStr, targetIndex = null) {
    try {
      const url = new URL(urlStr, window.location.origin);
      const activeIdx = targetIndex !== null ? targetIndex : getActiveIndexFromUrl();
      if (activeIdx > 0) {
        url.searchParams.set('u', activeIdx.toString());
      }
      return url.pathname + url.search + url.hash;
    } catch (_) {
      return urlStr;
    }
  }

  // Khởi chạy đồng bộ
  syncActiveAccountToSession();

  // Export toàn cục
  window.NDAccounts = {
    MAX_ACCOUNTS,
    getActiveIndexFromUrl,
    getAllAccounts,
    getActiveAccount,
    saveAccount,
    switchAccount,
    removeAccount,
    removeAllAccounts,
    buildUrlWithAccount,
    syncActiveAccountToSession
  };
})();
