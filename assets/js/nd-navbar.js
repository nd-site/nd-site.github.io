/**
 * ND Labs — Global Navigation Bar (Thanh điều hướng toàn cục)
 * 
 * Tác dụng:
 *   • Đóng vai trò là thanh menu điều hướng chính xuất hiện ở đầu tất cả các trang.
 *   • Hoạt động tương tự như thanh tab của trình duyệt (Browser tab bar).
 *   • Luôn cố định ở phía trên cùng của viewport (fixed position).
 *   • Đảm bảo nội dung trang bắt đầu ngay bên dưới thông qua thẻ spacer động.
 *   • Hỗ trợ cuộn ngang thanh link trên thiết bị di động nhỏ mà không làm vỡ giao diện.
 *   • Tự động nạp bộ chỉ báo phiên bản (version.js) và bộ thông báo chạy chữ (announcements.js).
 */
(function () {
  /* ─── Chuyển hướng tự động: GitHub Pages → Firebase Hosting ────────── */
  // Mọi lượt truy cập vào nd-site.github.io đều được chuyển sang ndsite.web.app
  // để đảm bảo người dùng luôn dùng phiên bản chính thức duy nhất của hệ thống.
  if (window.location.hostname === 'nd-site.github.io') {
    const target = 'https://ndsite.web.app'
      + window.location.pathname
      + window.location.search
      + window.location.hash;
    window.location.replace(target);
    return; // Dừng mọi xử lý phía dưới — trang sẽ redirect ngay lập tức
  }
  /* ─── Tự động nạp font.js cho toàn bộ hệ thống ─────────────────────── */
  if (!document.querySelector('script[src*="font.js"]')) {
    const fontScript = document.createElement('script');
    fontScript.src = '/font/font.js';
    document.head.appendChild(fontScript);
  }
  /* ────────────────────────────────────────────────────────────────────── */


  const NAV_H = 50; // navbar height in px — single source of truth

  const NAV_LINKS = [
    { href: '/', label: 'Trang Chủ', icon: 'ph-house-simple' },
    { href: '/eduspace', label: 'EduSpace', icon: 'ph-graduation-cap' },
    { href: '/games', label: 'Game', icon: 'ph-game-controller' },
    { href: '/media', label: 'Media', icon: 'ph-film-strip' },
    { href: '/utils', label: 'Tiện Ích', icon: 'ph-wrench' },
    { href: '/psychology', label: 'Psychology', icon: 'ph-brain' },
  ];

  const path = window.location.pathname;
  function isActive(href) {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.startsWith(href);
  }

  /* ─── CSS ─────────────────────────────────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

    /* ── The bar: fixed, full-width, browser-tab feel ── */
    #nd-navbar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: ${NAV_H}px !important;
      z-index: 100000 !important;
      background: rgba(248, 250, 252, 0.97) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border-bottom: 1.5px solid #e2e8f0 !important;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04),
                  0 4px 16px rgba(0, 112, 243, 0.07) !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      box-sizing: border-box !important;
    }

    /* ── Spacer: same height as bar, pushes body content down ── */
    #nd-navbar-spacer {
      display: block !important;
      width: 100% !important;
      height: ${NAV_H}px !important;
      pointer-events: none !important;
      flex-shrink: 0 !important;
    }

    /* ── Inner row: centered with max-width ── */
    #nd-navbar-inner {
      height: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 0;
      box-sizing: border-box;
    }

    /* ── Brand (always visible) ── */
    #nd-navbar-brand {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      text-decoration: none;
      color: #0070f3;
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: -0.2px;
      padding-right: 4px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    #nd-navbar-brand img {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    /* ── Divider ── */
    .nd-sep {
      width: 1px;
      height: 20px;
      background: #cbd5e1;
      margin: 0 10px;
      flex-shrink: 0;
    }

    /* ── Links: scrollable, takes remaining width ── */
    #nd-navbar-links {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
    }
    #nd-navbar-links::-webkit-scrollbar { display: none; }

    /* ── Individual link ── */
    .nd-nav-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #64748b;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: background 0.15s ease, color 0.15s ease;
      -webkit-user-select: none;
      user-select: none;
    }
    .nd-nav-link i { font-size: 0.95rem; }
    .nd-nav-link:hover {
      background: rgba(0, 112, 243, 0.08);
      color: #0070f3;
    }
    .nd-nav-link.nd-active {
      background: linear-gradient(135deg, #0070f3, #00b4d8);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 112, 243, 0.28);
    }
    .nd-nav-link.nd-active:hover { color: #fff; }

    /* ── Role badge in navbar ── */
    .nd-role-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.6;
      flex-shrink: 0;
    }
    .nd-role-badge.role-admin   { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
    .nd-role-badge.role-teacher { background: #f3e8ff; color: #7c3aed; border: 1px solid #e9d5ff; }
    .nd-role-badge.role-student { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
    .nd-role-badge.role-other   { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

    /* ── Responsive: hide label text on very small screens ── */
    @media (max-width: 500px) {
      .nd-lbl { display: none; }
      .nd-nav-link { padding: 6px 8px; }
      #nd-brand-name { display: none; }
      .nd-role-badge { display: none; }
    }

    /* ── Floating Tool FAB ── */
    #nd-tools-fab {
      position: fixed !important;
      bottom: 24px !important;
      left: 24px !important;
      width: 46px !important;
      height: 46px !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.85) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1.5px solid rgba(226, 232, 240, 0.8) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
      z-index: 99999 !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      color: #64748b !important;
    }
    #nd-tools-fab:hover {
      transform: scale(1.08) !important;
      color: #0070f3 !important;
      border-color: rgba(0, 112, 243, 0.3) !important;
      box-shadow: 0 8px 30px rgba(0, 112, 243, 0.15) !important;
    }
    #nd-tools-fab i {
      font-size: 1.3rem !important;
    }
    
    /* ── Panel Wrapper ── */
    #nd-tools-panel {
      position: fixed !important;
      bottom: 82px !important;
      left: 24px !important;
      width: 300px !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(226, 232, 240, 1) !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
      z-index: 99999 !important;
      overflow: hidden !important;
      display: none;
      flex-direction: column !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      box-sizing: border-box !important;
    }
    #nd-tools-panel * {
      box-sizing: border-box !important;
    }
    
    /* ── Tabs Header ── */
    .nd-tools-tab-header {
      display: flex !important;
      background: #f8fafc !important;
      border-bottom: 1px solid #e2e8f0 !important;
      padding: 4px !important;
      gap: 2px !important;
    }
    .nd-tools-tab-btn {
      flex: 1 !important;
      padding: 8px 4px !important;
      border: none !important;
      background: transparent !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      color: #64748b !important;
      cursor: pointer !important;
      border-radius: 12px !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 3px !important;
    }
    .nd-tools-tab-btn.active {
      background: #fff !important;
      color: #0070f3 !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
    }
    .nd-tools-tab-btn i {
      font-size: 13px !important;
    }
    .nd-tools-tab-content {
      display: none;
      padding: 14px !important;
      max-height: 350px !important;
      overflow-y: auto !important;
    }
    .nd-tools-tab-content.active {
      display: block !important;
    }
    
    /* ── QR Section ── */
    .nd-qr-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 10px !important;
    }
    .nd-qr-img-wrapper {
      background: #fff !important;
      padding: 8px !important;
      border-radius: 12px !important;
      border: 1px solid #e2e8f0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 130px !important;
      height: 130px !important;
    }
    .nd-qr-img-wrapper img {
      width: 100% !important;
      height: 100% !important;
    }
    
    /* ── Notes Textarea ── */
    .nd-notes-area {
      width: 100% !important;
      height: 140px !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 10px !important;
      padding: 8px !important;
      font-size: 11.5px !important;
      resize: none !important;
      outline: none !important;
      font-family: inherit !important;
      color: #334155 !important;
    }
    .nd-notes-area:focus {
      border-color: #0070f3 !important;
    }
    
    /* ── Calculator Grid ── */
    .nd-calc-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 5px !important;
    }
    .nd-calc-screen {
      grid-column: span 4 !important;
      background: #f1f5f9 !important;
      border-radius: 8px !important;
      padding: 8px !important;
      text-align: right !important;
      font-family: monospace !important;
      font-size: 16px !important;
      color: #1e293b !important;
      margin-bottom: 6px !important;
      min-height: 38px !important;
      word-wrap: break-word !important;
      word-break: break-all !important;
    }
    .nd-calc-btn {
      padding: 8px !important;
      border: none !important;
      background: #f8fafc !important;
      color: #475569 !important;
      font-weight: 700 !important;
      font-size: 12px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .nd-calc-btn:hover {
      background: #e2e8f0 !important;
    }
    .nd-calc-btn.op {
      background: #e0f2fe !important;
      color: #0369a1 !important;
    }
    .nd-calc-btn.eq {
      background: #0070f3 !important;
      color: #fff !important;
    }
    .nd-calc-btn.eq:hover {
      background: #005ecb !important;
    }
    
    /* ── Pomodoro Timer ── */
    .nd-pomo-display {
      font-size: 28px !important;
      font-weight: 800 !important;
      text-align: center !important;
      color: #0f172a !important;
      font-family: monospace !important;
      margin-bottom: 10px !important;
    }
    .nd-pomo-controls {
      display: flex !important;
      justify-content: center !important;
      gap: 6px !important;
    }
    .nd-pomo-btn {
      padding: 6px 12px !important;
      border: none !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      border-radius: 6px !important;
      cursor: pointer !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'nd-navbar-css';
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);

  /* ─── Phosphor Icons (load once) ─────────────────────── */
  if (!document.querySelector('#nd-phosphor-icons')) {
    const ph = document.createElement('script');
    ph.id = 'nd-phosphor-icons';
    ph.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(ph);
  }

  /* ─── Build navbar ────────────────────────────────────── */
  const nav = document.createElement('nav');
  nav.id = 'nd-navbar';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'ND Labs site navigation');

  const inner = document.createElement('div');
  inner.id = 'nd-navbar-inner';

  // Brand
  const brand = document.createElement('a');
  brand.id = 'nd-navbar-brand';
  brand.href = '/';
  brand.title = 'ND Labs – Trang Chủ';
  brand.innerHTML = `<img src="/assets/images/logo.png" alt="ND Labs"><span id="nd-brand-name">ND Labs</span>`;

  // Separator
  const sep = document.createElement('div');
  sep.className = 'nd-sep';
  sep.setAttribute('aria-hidden', 'true');

  // Links
  const linksDiv = document.createElement('div');
  linksDiv.id = 'nd-navbar-links';

  NAV_LINKS.forEach(({ href, label, icon }) => {
    const a = document.createElement('a');
    a.className = 'nd-nav-link' + (isActive(href) ? ' nd-active' : '');
    a.href = href;
    if (isActive(href)) a.setAttribute('aria-current', 'page');
    a.innerHTML = `<i class="ph-duotone ${icon}" aria-hidden="true"></i><span class="nd-lbl">${label}</span>`;
    linksDiv.appendChild(a);
  });

  /* ── User Session Context ── */
  const userSection = document.createElement('div');
  userSection.id = 'nd-navbar-user';
  userSection.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-left: 10px; flex-shrink: 0;';

  // Try to get user from localStorage
  const storedUser = localStorage.getItem('nd_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      const role = u.role || 'other';
      const subrole = u.subrole || '';

      // Role badge config
      const roleCfg = {
        admin:   { cls: 'role-admin',   label: 'Admin' },
        teacher: { cls: 'role-teacher', label: 'GV' },
        student: { cls: 'role-student', label: 'HS' },
      };
      const rc = roleCfg[role] || { cls: 'role-other', label: 'TV' };
      let roleBadgeHtml = `<span class="nd-role-badge ${rc.cls}">${rc.label}</span>`;
      // Admin: show second badge for subrole if exists
      if (role === 'admin' && subrole && roleCfg[subrole]) {
        const sr = roleCfg[subrole];
        roleBadgeHtml += `<span class="nd-role-badge ${sr.cls}">${sr.label}</span>`;
      }

      let adminLink = '';
      if (role === 'admin') {
        adminLink = `
          <a href="/eduspace/admin/" class="nd-nav-link" style="color: #0070f3;" title="Bảng quản trị Admin">
            <i class="ph-bold ph-shield-checkered"></i><span class="nd-lbl">Admin</span>
          </a>
        `;
      }
      userSection.innerHTML = `
        ${adminLink}
        <a href="/auth/settings/" class="nd-nav-link" title="Cài đặt tài khoản" style="gap: 6px;">
          <img src="${u.photoURL || '/assets/images/logo.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;">
          <span class="nd-lbl" style="display:flex; align-items:center; gap:4px;">
            ${u.ndid || 'ND Member'}
            ${roleBadgeHtml}
          </span>
        </a>
      `;
    } catch (e) { storageClear(); }
  } else {
    userSection.innerHTML = `
      <a href="/auth/login/" class="nd-nav-link" style="color: #0070f3;">Đăng nhập</a>
      <a href="/auth/register/" class="nd-nav-link nd-active" style="padding: 5px 10px;">NDID</a>
    `;
  }

  function storageClear() {
    localStorage.removeItem('nd_user');
    window.location.reload();
  }

  inner.appendChild(brand);
  inner.appendChild(sep);
  inner.appendChild(linksDiv);
  inner.appendChild(userSection);
  nav.appendChild(inner);

  /* ─── Spacer: pushes page content below fixed bar ──────── */
  const spacer = document.createElement('div');
  spacer.id = 'nd-navbar-spacer';
  spacer.setAttribute('aria-hidden', 'true');

  /* ─── Mount into DOM ──────────────────────────────────── */
  function mount() {
    if (document.getElementById('nd-navbar')) return; // idempotent
    // nav is fixed — insert anywhere (visible immediately)
    document.body.insertBefore(nav, document.body.firstChild);
    // spacer must be the first element in the normal flow to push content
    document.body.insertBefore(spacer, document.body.firstChild);

    // Automatically load version.js to display version badge globally
    const vScript = document.createElement('script');
    vScript.src = '/assets/js/version.js';
    vScript.defer = true;
    document.head.appendChild(vScript);

    // Tự động tải tệp thông báo chạy chữ dưới navbar
    const aScript = document.createElement('script');
    aScript.src = '/assets/js/announcements.js';
    aScript.defer = true;
    document.head.appendChild(aScript);

    // Create FAB
    const fab = document.createElement('div');
    fab.id = 'nd-tools-fab';
    fab.title = 'Mã QR & Công cụ';
    fab.innerHTML = `<i class="ph-duotone ph-toolbox"></i>`;
    document.body.appendChild(fab);

    // Create Panel
    const panel = document.createElement('div');
    panel.id = 'nd-tools-panel';
    panel.innerHTML = `
      <div class="nd-tools-tab-header">
        <button class="nd-tools-tab-btn active" id="nd-tab-btn-qr"><i class="ph-duotone ph-qr-code"></i>Mã QR</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-calc"><i class="ph-duotone ph-calculator"></i>Máy tính</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-timer"><i class="ph-duotone ph-timer"></i>Pomodoro</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-notes"><i class="ph-duotone ph-note-pencil"></i>Ghi chú</button>
      </div>
      
      <!-- QR Content -->
      <div id="nd-tools-content-qr" class="nd-tools-tab-content active">
        <div class="nd-qr-container">
          <div class="nd-qr-img-wrapper">
            <img id="nd-tools-qr-img" src="" alt="QR Code">
          </div>
          <input type="text" id="nd-tools-qr-url" readonly>
          <button id="nd-tools-qr-copy-btn">
            <i class="ph-bold ph-copy"></i><span>Sao chép link</span>
          </button>
        </div>
      </div>
      
      <!-- Calc Content -->
      <div id="nd-tools-content-calc" class="nd-tools-tab-content">
        <div class="nd-calc-screen" id="nd-calc-display">0</div>
        <div class="nd-calc-grid" id="nd-calc-btns">
          <button class="nd-calc-btn op" data-val="C">C</button>
          <button class="nd-calc-btn op" data-val="(">(</button>
          <button class="nd-calc-btn op" data-val=")">)</button>
          <button class="nd-calc-btn op" data-val="/">/</button>
          <button class="nd-calc-btn" data-val="7">7</button>
          <button class="nd-calc-btn" data-val="8">8</button>
          <button class="nd-calc-btn" data-val="9">9</button>
          <button class="nd-calc-btn op" data-val="*">×</button>
          <button class="nd-calc-btn" data-val="4">4</button>
          <button class="nd-calc-btn" data-val="5">5</button>
          <button class="nd-calc-btn" data-val="6">6</button>
          <button class="nd-calc-btn op" data-val="-">-</button>
          <button class="nd-calc-btn" data-val="1">1</button>
          <button class="nd-calc-btn" data-val="2">2</button>
          <button class="nd-calc-btn" data-val="3">3</button>
          <button class="nd-calc-btn op" data-val="+">+</button>
          <button class="nd-calc-btn" data-val="0">0</button>
          <button class="nd-calc-btn" data-val=".">.</button>
          <button class="nd-calc-btn op" data-val="back">⌫</button>
          <button class="nd-calc-btn eq" data-val="=">=</button>
        </div>
      </div>
      
      <!-- Timer Content -->
      <div id="nd-tools-content-timer" class="nd-tools-tab-content">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">Đồng hồ Pomodoro</span>
        <div class="nd-pomo-display" id="nd-pomo-time">25:00</div>
        <div class="nd-pomo-controls">
          <button class="nd-pomo-btn bg-blue-600 text-white hover:bg-blue-700" id="nd-pomo-start">Bắt đầu</button>
          <button class="nd-pomo-btn bg-slate-200 text-slate-700 hover:bg-slate-300" id="nd-pomo-pause">Tạm dừng</button>
          <button class="nd-pomo-btn bg-rose-100 text-rose-600 hover:bg-rose-200" id="nd-pomo-reset">Reset</button>
        </div>
      </div>
      
      <!-- Notes Content -->
      <div id="nd-tools-content-notes" class="nd-tools-tab-content">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">Ghi chú nhanh</span>
        <textarea id="nd-notes-text" class="nd-notes-area" placeholder="Ghi chú nhanh ở đây... (Tự động lưu)"></textarea>
      </div>
    `;
    document.body.appendChild(panel);

    // Toggle panel
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display === 'flex';
      if (isVisible) {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'flex';
        // Generate QR code and link when opened
        const currentUrl = window.location.href;
        document.getElementById('nd-tools-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
        document.getElementById('nd-tools-qr-url').value = currentUrl;
      }
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== fab) {
        panel.style.display = 'none';
      }
    });

    // Tab Switch Logic
    const tabs = ['qr', 'calc', 'timer', 'notes'];
    tabs.forEach(tab => {
      document.getElementById(`nd-tab-btn-${tab}`).addEventListener('click', () => {
        tabs.forEach(t => {
          document.getElementById(`nd-tab-btn-${t}`).classList.toggle('active', t === tab);
          document.getElementById(`nd-tools-content-${t}`).classList.toggle('active', t === tab);
        });
      });
    });

    // Copy Link Logic
    document.getElementById('nd-tools-qr-copy-btn').addEventListener('click', () => {
      const copyInput = document.getElementById('nd-tools-qr-url');
      navigator.clipboard.writeText(copyInput.value).then(() => {
        const btn = document.getElementById('nd-tools-qr-copy-btn');
        const textSpan = btn.querySelector('span');
        const originalText = textSpan.innerText;
        textSpan.innerText = 'Đã sao chép!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          textSpan.innerText = originalText;
          btn.style.background = '#0070f3';
        }, 2000);
      });
    });

    // Calculator Logic
    let calcExpression = '';
    const calcDisplay = document.getElementById('nd-calc-display');
    document.getElementById('nd-calc-btns').addEventListener('click', (e) => {
      const btn = e.target.closest('.nd-calc-btn');
      if (!btn) return;
      const val = btn.getAttribute('data-val');
      if (val === 'C') {
        calcExpression = '';
        calcDisplay.innerText = '0';
      } else if (val === 'back') {
        calcExpression = calcExpression.slice(0, -1);
        calcDisplay.innerText = calcExpression || '0';
      } else if (val === '=') {
        try {
          if (calcExpression.trim() === '') return;
          const cleanExpr = calcExpression.replace(/[^0-9+\-*/().]/g, '');
          const result = new Function(`return ${cleanExpr}`)();
          calcDisplay.innerText = Number(result).toLocaleString('vi-VN', { maximumFractionDigits: 4 });
          calcExpression = String(result);
        } catch (err) {
          calcDisplay.innerText = 'Lỗi';
          calcExpression = '';
        }
      } else {
        calcExpression += val;
        calcDisplay.innerText = calcExpression;
      }
    });

    // Pomodoro Logic
    let pomoInterval = null;
    let pomoTimeLeft = 25 * 60;
    const pomoDisplay = document.getElementById('nd-pomo-time');
    
    function updatePomoDisplay() {
      const mins = Math.floor(pomoTimeLeft / 60);
      const secs = pomoTimeLeft % 60;
      pomoDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    document.getElementById('nd-pomo-start').addEventListener('click', () => {
      if (pomoInterval) return;
      pomoInterval = setInterval(() => {
        if (pomoTimeLeft > 0) {
          pomoTimeLeft--;
          updatePomoDisplay();
        } else {
          clearInterval(pomoInterval);
          pomoInterval = null;
          alert('Pomodoro hoàn thành! Hãy nghỉ ngơi chút nhé.');
          pomoTimeLeft = 25 * 60;
          updatePomoDisplay();
        }
      }, 1000);
    });

    document.getElementById('nd-pomo-pause').addEventListener('click', () => {
      clearInterval(pomoInterval);
      pomoInterval = null;
    });

    document.getElementById('nd-pomo-reset').addEventListener('click', () => {
      clearInterval(pomoInterval);
      pomoInterval = null;
      pomoTimeLeft = 25 * 60;
      updatePomoDisplay();
    });

    // Notes Logic
    const notesTextarea = document.getElementById('nd-notes-text');
    notesTextarea.value = localStorage.getItem('nd_quick_notes') || '';
    notesTextarea.addEventListener('input', () => {
      localStorage.setItem('nd_quick_notes', notesTextarea.value);
    });
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
