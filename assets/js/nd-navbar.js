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
    { href: '/chat/', label: 'ChatND by ND Labs', icon: 'ph-chat-circle-dots' },
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
      top: 95px !important;
      left: 16px !important;
      bottom: auto !important;
      width: 42px !important;
      height: 42px !important;
      border-radius: 12px !important;
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
      transform: scale(1.05) !important;
      color: #0070f3 !important;
      border-color: rgba(0, 112, 243, 0.3) !important;
      box-shadow: 0 8px 30px rgba(0, 112, 243, 0.15) !important;
    }
    #nd-tools-fab i {
      font-size: 1.25rem !important;
    }
    
    /* ── Panel Wrapper ── */
    #nd-tools-panel {
      position: fixed !important;
      top: 145px !important;
      left: 16px !important;
      bottom: auto !important;
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
    
    /* Shift FAB and Panel down when quiz is active to avoid covering the back button */
    body.quiz-active #nd-tools-fab {
      top: 160px !important;
    }
    body.quiz-active #nd-tools-panel {
      top: 210px !important;
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
      
      // Role badge config
      const roleCfg = {
        admin:   { cls: 'role-admin',   label: 'Admin' },
        teacher: { cls: 'role-teacher', label: 'GV' },
        student: { cls: 'role-student', label: 'HS' },
        member:  { cls: 'role-other',   label: 'TV' }
      };

      const role = u.role || 'member';
      const eduRole = u.eduRole || '';

      // Fallback for old sessions
      let resolvedEduRole = eduRole;
      if (!resolvedEduRole) {
        if (role === 'admin') resolvedEduRole = u.subrole || 'student';
        else if (role === 'teacher') resolvedEduRole = 'teacher';
        else if (role === 'student') resolvedEduRole = 'student';
      }

      let badges = [];
      if (role === 'admin') {
        badges.push(`<span class="nd-role-badge ${roleCfg.admin.cls}">${roleCfg.admin.label}</span>`);
      }
      if (resolvedEduRole === 'teacher') {
        badges.push(`<span class="nd-role-badge ${roleCfg.teacher.cls}">${roleCfg.teacher.label}</span>`);
      } else if (resolvedEduRole === 'student') {
        badges.push(`<span class="nd-role-badge ${roleCfg.student.cls}">${roleCfg.student.label}</span>`);
      }

      if (badges.length === 0) {
        badges.push(`<span class="nd-role-badge ${roleCfg.member.cls}">${roleCfg.member.label}</span>`);
      }
      const roleBadgeHtml = badges.join('');

      let adminLink = '';
      if (role === 'admin') {
        adminLink = `
          <a href="/admin/" class="nd-nav-link" style="color: #0070f3;" title="Bảng quản trị Admin">
            <i class="ph-bold ph-shield-checkered"></i><span class="nd-lbl">Admin</span>
          </a>
        `;
      }
      const cleanNdid = (u.ndid || 'ND Member').replace(/^@/, '');
      userSection.innerHTML = `
        ${adminLink}
        <a href="/auth/settings/" class="nd-nav-link" title="Cài đặt tài khoản" style="gap: 6px;">
          <img src="${u.photoURL || '/assets/images/logo.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;">
          <span class="nd-lbl" style="display:flex; align-items:center; gap:4px;">
            ${cleanNdid}
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

  /* ── Notification Bell Context ── */
  const notifyWrapper = document.createElement('div');
  notifyWrapper.id = 'nd-navbar-notify-wrapper';
  notifyWrapper.style.cssText = 'position: relative; display: flex; align-items: center; margin-left: auto; flex-shrink: 0;';
  notifyWrapper.innerHTML = `
    <button id="nd-navbar-notify-btn" title="Thông báo" style="background: transparent; border: none; padding: 6px; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; position: relative; outline: none;">
      <i class="ph-duotone ph-bell" style="font-size: 1.25rem;"></i>
      <span id="nd-navbar-notify-badge" style="display: none; position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 1.5px solid #fff;"></span>
    </button>
  `;

  const notifyModal = document.createElement('div');
  notifyModal.id = 'nd-navbar-notify-modal';
  notifyModal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100009;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.25s ease;
    box-sizing: border-box;
  `;
  notifyModal.innerHTML = `
    <div id="nd-navbar-notify-content" style="
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-radius: 28px;
      max-width: 650px;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transform: scale(0.95);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-height: 85vh;
      box-sizing: border-box;
    ">
      <div style="
        padding: 20px 28px;
        border-bottom: 1px solid #f1f5f9;
        font-weight: 800;
        font-size: 16px;
        color: #1e293b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
        box-sizing: border-box;
        width: 100%;
      ">
        <span style="display: flex; align-items: center; gap: 8px;">🔔 BẢNG TIN THÔNG BÁO</span>
        <div style="display: flex; align-items: center; gap: 14px;">
          <button id="nd-notify-mark-all" style="background: transparent; border: none; font-size: 12px; font-weight: 800; color: #0070f3; cursor: pointer; padding: 0;">Đánh dấu đã đọc</button>
          <button id="nd-notify-close-btn" style="background: #e2e8f0; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 13px; font-weight: bold; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
        </div>
      </div>
      <div id="nd-navbar-notify-list" style="
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
        max-height: calc(85vh - 75px);
        background: white;
      ">
        <div style="padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; font-weight: 600;">Đang tải thông báo...</div>
      </div>
    </div>
  `;

  function storageClear() {
    localStorage.removeItem('nd_user');
    window.location.reload();
  }

  inner.appendChild(brand);
  inner.appendChild(sep);
  inner.appendChild(linksDiv);
  inner.appendChild(notifyWrapper);
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
    document.body.appendChild(notifyModal);
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
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">Đồng hồ đếm ngược</span>
        
        <!-- Timer Modes -->
        <div class="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1">
          <button id="nd-pomo-mode-btn" class="flex-1 py-1.5 text-[10px] font-bold text-slate-700 rounded-lg bg-white shadow-sm border-0 cursor-pointer">Pomodoro</button>
          <button id="nd-custom-mode-btn" class="flex-1 py-1.5 text-[10px] font-bold text-slate-500 rounded-lg border-0 bg-transparent cursor-pointer">Tùy chỉnh</button>
        </div>
        
        <!-- Custom Inputs -->
        <div id="nd-timer-custom-inputs" class="hidden mb-4 flex items-center justify-center gap-1.5">
          <div class="flex flex-col items-center">
            <input type="number" id="nd-timer-min" min="0" max="999" value="25" class="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-bold font-mono">
            <span class="text-[8px] text-slate-400 font-bold mt-1 uppercase">Phút</span>
          </div>
          <span class="font-bold text-slate-400 mb-4">:</span>
          <div class="flex flex-col items-center">
            <input type="number" id="nd-timer-sec" min="0" max="59" value="0" class="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-bold font-mono">
            <span class="text-[8px] text-slate-400 font-bold mt-1 uppercase">Giây</span>
          </div>
          <button id="nd-timer-set-btn" class="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-lg border-0 cursor-pointer mb-4">Đặt</button>
        </div>

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

    // Dragging & Panel Positioning Logic
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let buttonStartX = 0;
    let buttonStartY = 0;
    let hasDraggedSignificant = false;

    function repositionPanel() {
      const fabRect = fab.getBoundingClientRect();
      const panelWidth = 300;
      const panelHeight = panel.offsetHeight || 330;
      
      let newLeft = fabRect.left;
      let newTop = fabRect.bottom + 8;
      
      if (newLeft + panelWidth > window.innerWidth) {
        newLeft = window.innerWidth - panelWidth - 16;
      }
      if (newLeft < 16) {
        newLeft = 16;
      }
      
      if (newTop + panelHeight > window.innerHeight) {
        newTop = fabRect.top - panelHeight - 8;
      }
      if (newTop < 80) {
        newTop = 80;
      }

      panel.style.setProperty('left', newLeft + 'px', 'important');
      panel.style.setProperty('top', newTop + 'px', 'important');
      panel.style.setProperty('bottom', 'auto', 'important');
    }

    fab.addEventListener('pointerdown', (e) => {
      isDragging = true;
      hasDraggedSignificant = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      
      const rect = fab.getBoundingClientRect();
      buttonStartX = rect.left;
      buttonStartY = rect.top;
      
      fab.style.transition = 'none';
      fab.setPointerCapture(e.pointerId);
    });

    fab.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDraggedSignificant = true;
      }
      
      let newLeft = buttonStartX + deltaX;
      let newTop = buttonStartY + deltaY;
      
      const fabSize = 42;
      const minTop = 80; 
      const maxTop = window.innerHeight - fabSize - 16;
      const minLeft = 16;
      const maxLeft = window.innerWidth - fabSize - 16;
      
      newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
      newTop = Math.max(minTop, Math.min(maxTop, newTop));
      
      fab.style.setProperty('left', newLeft + 'px', 'important');
      fab.style.setProperty('top', newTop + 'px', 'important');
      fab.style.setProperty('bottom', 'auto', 'important');
      
      if (panel.style.display === 'flex') {
        repositionPanel();
      }
    });

    fab.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      fab.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      fab.releasePointerCapture(e.pointerId);
      
      if (hasDraggedSignificant) {
        e.stopPropagation();
        e.preventDefault();
        fab.dataset.dragged = "true";
      }
    });

    fab.addEventListener('click', (e) => {
      if (hasDraggedSignificant) {
        return;
      }
      e.stopPropagation();
      const isVisible = panel.style.display === 'flex';
      if (isVisible) {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'flex';
        const currentUrl = window.location.href;
        document.getElementById('nd-tools-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
        document.getElementById('nd-tools-qr-url').value = currentUrl;
        
        setTimeout(repositionPanel, 0);
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

    // Pomodoro & Custom Timer Logic
    let pomoInterval = null;
    let pomoTimeLeft = 25 * 60;
    let pomoMode = 'pomo'; // 'pomo' or 'custom'
    const pomoDisplay = document.getElementById('nd-pomo-time');
    const pomoModeBtn = document.getElementById('nd-pomo-mode-btn');
    const customModeBtn = document.getElementById('nd-custom-mode-btn');
    const customInputsDiv = document.getElementById('nd-timer-custom-inputs');
    const minInput = document.getElementById('nd-timer-min');
    const secInput = document.getElementById('nd-timer-sec');

    function updatePomoDisplay() {
      const mins = Math.floor(pomoTimeLeft / 60);
      const secs = pomoTimeLeft % 60;
      pomoDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Toggle Pomodoro Mode
    pomoModeBtn.addEventListener('click', () => {
      pomoMode = 'pomo';
      pomoModeBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-700');
      pomoModeBtn.classList.remove('bg-transparent', 'text-slate-500');
      customModeBtn.classList.add('bg-transparent', 'text-slate-500');
      customModeBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-700');
      customInputsDiv.classList.add('hidden');
      
      clearInterval(pomoInterval);
      pomoInterval = null;
      pomoTimeLeft = 25 * 60;
      updatePomoDisplay();
    });

    // Toggle Custom Mode
    customModeBtn.addEventListener('click', () => {
      pomoMode = 'custom';
      customModeBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-700');
      customModeBtn.classList.remove('bg-transparent', 'text-slate-500');
      pomoModeBtn.classList.add('bg-transparent', 'text-slate-500');
      pomoModeBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-700');
      customInputsDiv.classList.remove('hidden');
    });

    // Set Custom Timer
    document.getElementById('nd-timer-set-btn').addEventListener('click', () => {
      const m = Math.max(0, parseInt(minInput.value) || 0);
      const s = Math.max(0, Math.min(59, parseInt(secInput.value) || 0));
      minInput.value = m;
      secInput.value = s;
      
      clearInterval(pomoInterval);
      pomoInterval = null;
      pomoTimeLeft = m * 60 + s;
      updatePomoDisplay();
    });

    document.getElementById('nd-pomo-start').addEventListener('click', () => {
      if (pomoInterval) return;
      pomoInterval = setInterval(() => {
        if (pomoTimeLeft > 0) {
          pomoTimeLeft--;
          updatePomoDisplay();
        } else {
          clearInterval(pomoInterval);
          pomoInterval = null;
          alert(pomoMode === 'pomo' ? 'Pomodoro hoàn thành! Hãy nghỉ ngơi chút nhé.' : 'Đồng hồ đếm ngược đã kết thúc!');
          pomoTimeLeft = pomoMode === 'pomo' ? 25 * 60 : 0;
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
      if (pomoMode === 'pomo') {
        pomoTimeLeft = 25 * 60;
      } else {
        const m = Math.max(0, parseInt(minInput.value) || 0);
        const s = Math.max(0, Math.min(59, parseInt(secInput.value) || 0));
        pomoTimeLeft = m * 60 + s;
      }
      updatePomoDisplay();
    });

    // Notes Logic
    const notesTextarea = document.getElementById('nd-notes-text');
    notesTextarea.value = localStorage.getItem('nd_quick_notes') || '';
    notesTextarea.addEventListener('input', () => {
      localStorage.setItem('nd_quick_notes', notesTextarea.value);
    });

    // ── Notification Interactions & Real-time Firebase Synchronization ──
    const notifyBtn = document.getElementById('nd-navbar-notify-btn');
    const notifyCloseBtn = document.getElementById('nd-notify-close-btn');
    const notifyMarkAll = document.getElementById('nd-notify-mark-all');
    let notificationsList = [];

    function openNotifyModal() {
      if (!notifyModal) return;
      notifyModal.style.display = 'flex';
      void notifyModal.offsetWidth;
      notifyModal.style.opacity = '1';
      const content = notifyModal.querySelector('#nd-navbar-notify-content');
      if (content) content.style.transform = 'scale(1)';
      
      if (notificationsList.length > 0) {
        const maxStt = Math.max(...notificationsList.map(n => n.stt || 0));
        localStorage.setItem('nd_last_read_stt', maxStt.toString());
        const badge = document.getElementById('nd-navbar-notify-badge');
        if (badge) badge.style.display = 'none';
      }
    }

    function closeNotifyModal() {
      if (!notifyModal) return;
      notifyModal.style.opacity = '0';
      const content = notifyModal.querySelector('#nd-navbar-notify-content');
      if (content) content.style.transform = 'scale(0.95)';
      setTimeout(() => {
        notifyModal.style.display = 'none';
      }, 250);
    }

    if (notifyBtn && notifyModal) {
      notifyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNotifyModal();
      });

      if (notifyCloseBtn) {
        notifyCloseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeNotifyModal();
        });
      }

      notifyModal.addEventListener('click', (e) => {
        if (e.target === notifyModal) {
          closeNotifyModal();
        }
      });

      if (notifyMarkAll) {
        notifyMarkAll.addEventListener('click', () => {
          if (notificationsList.length > 0) {
            const maxStt = Math.max(...notificationsList.map(n => n.stt || 0));
            localStorage.setItem('nd_last_read_stt', maxStt.toString());
            const badge = document.getElementById('nd-navbar-notify-badge');
            if (badge) badge.style.display = 'none';
          }
        });
      }

    // ── Toast Alert & Detail View Dialogs ──
    function showToastNotification(title, info) {
      let container = document.getElementById('nd-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'nd-toast-container';
        container.style.cssText = 'position: fixed; top: 85px; right: 20px; z-index: 100015; display: flex; flex-direction: column; gap: 10px; max-width: 340px; width: 90%; pointer-events: none;';
        document.body.appendChild(container);
      }
      
      const toast = document.createElement('div');
      toast.style.cssText = `
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 4px solid #0070f3;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        cursor: pointer;
        font-family: 'Plus Jakarta Sans', sans-serif;
      `;
      
      const cleanInfo = info.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1');
      
      toast.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
          <span style="font-weight: 800; font-size: 11px; color: #0070f3; display: flex; align-items: center; gap: 6px;">🔔 THÔNG BÁO MỚI</span>
          <button style="background: transparent; border: none; font-size: 10px; color: #94a3b8; cursor: pointer; padding: 0;">✕</button>
        </div>
        <div style="font-weight: 800; font-size: 12.5px; color: #0f172a; margin-top: 2px;">${title}</div>
        <div style="font-size: 11px; color: #64748b; line-height: 1.4; max-height: 50px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${cleanInfo}</div>
      `;
      
      toast.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
          openNotifyModal();
          toast.style.transform = 'translateX(120%)';
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 400);
        }
      });
      
      toast.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      });
      
      container.appendChild(toast);
      void toast.offsetWidth;
      toast.style.transform = 'translateX(0)';
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.transform = 'translateX(120%)';
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 400);
        }
      }, 8000);
    }

    function showNotificationDetail(title, info, date, time) {
      let detailModal = document.getElementById('nd-notify-detail-modal');
      if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'nd-notify-detail-modal';
        detailModal.style.cssText = `
          display: none;
          position: fixed;
          inset: 0;
          z-index: 100019;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          opacity: 0;
          transition: opacity 0.2s ease;
          box-sizing: border-box;
        `;
        document.body.appendChild(detailModal);
      }
      
      detailModal.innerHTML = `
        <div style="
          background: #fff;
          border-radius: 24px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          padding: 26px 32px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transform: scale(0.95);
          transition: transform 0.2s ease;
          box-sizing: border-box;
          text-align: left;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; font-family: monospace;">📅 ${date} &nbsp; ${time}</span>
            <button id="nd-notify-detail-close" style="background: #f1f5f9; border: none; border-radius: 50%; width: 26px; height: 26px; font-size: 11px; font-weight: bold; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>
          <h4 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.4;">${title}</h4>
          <p style="font-size: 15px; color: #475569; line-height: 1.65; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${parseMarkdownLinks(info)}</p>
        </div>
      `;
      
      detailModal.style.display = 'flex';
      void detailModal.offsetWidth;
      detailModal.style.opacity = '1';
      detailModal.firstElementChild.style.transform = 'scale(1)';
      
      const closeBtn = detailModal.querySelector('#nd-notify-detail-close');
      closeBtn.onclick = () => {
        detailModal.style.opacity = '0';
        detailModal.firstElementChild.style.transform = 'scale(0.95)';
        setTimeout(() => detailModal.style.display = 'none', 200);
      };
      
      detailModal.onclick = (e) => {
        if (e.target === detailModal) {
          closeBtn.onclick();
        }
      };
    }

    // Initialize Firebase listener with auto-fallback
    (async () => {
      let dbUrl = "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app";
      try {
        if (typeof getEduKeys === 'function') {
          const keys = await getEduKeys();
          if (keys && keys.fbDatabaseURL) {
            dbUrl = keys.fbDatabaseURL;
          }
        }
      } catch (e) {}

      const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl + 'notifications.json' : dbUrl + '/notifications.json';

      function fallbackFetch(url) {
        const busterUrl = url + (url.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
        fetch(busterUrl)
          .then(res => {
            if (!res.ok) throw new Error("Status " + res.status);
            return res.json();
          })
          .then(data => {
            updateNotificationList(data);
          })
          .catch(err => {
            console.error("REST API notification fetch failed", err);
            const listContainer = document.getElementById('nd-navbar-notify-list');
            if (listContainer) {
              listContainer.innerHTML = `<div style="padding: 16px; text-align: center; color: #ef4444; font-size: 10px; font-weight: 700; line-height: 1.4;">⚠️ Không thể kết nối cơ sở dữ liệu. Vui lòng mở quyền đọc (Read Rules) tại nhánh '/notifications' hoặc cấu hình lại Firebase.</div>`;
            }
          });
      }

      try {
        const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
        let attempts = 0;
        const checkDb = setInterval(() => {
          attempts++;
          if (window.firebaseDb) {
            clearInterval(checkDb);
            try {
              const triggerRef = ref(window.firebaseDb, 'notifications_trigger');
              let firstLoad = true;
              onValue(triggerRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.timestamp) {
                  const busterUrl = cleanDbUrl + (cleanDbUrl.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
                  fetch(busterUrl)
                    .then(res => res.json())
                    .then(newData => {
                      updateNotificationList(newData);
                      if (!firstLoad) {
                        showToastNotification(data.title, data.info);
                      }
                      firstLoad = false;
                    })
                    .catch(e => console.error("Error fetching notifications on trigger", e));
                }
              }, (error) => {
                console.error("Firebase trigger subscription failed, falling back to REST", error);
                fallbackFetch(cleanDbUrl);
              });
            } catch (e) {
              console.error("Firebase trigger initialization failed, falling back to REST", e);
              fallbackFetch(cleanDbUrl);
            }
          } else if (attempts > 15) { // ~4.5 seconds timeout
            clearInterval(checkDb);
            fallbackFetch(cleanDbUrl);
          }
        }, 300);
      } catch (err) {
        console.error("Firebase Realtime Database dynamic load failed, using fallback REST API", err);
        fallbackFetch(cleanDbUrl);
      }
    })();
  }

    function updateNotificationList(data) {
      const listContainer = document.getElementById('nd-navbar-notify-list');
      const badge = document.getElementById('nd-navbar-notify-badge');
      if (!listContainer) return;
      
      if (!data) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">Không có thông báo mới nào.</div>`;
        if (badge) badge.style.display = 'none';
        return;
      }
      
      notificationsList = Object.values(data);
      notificationsList.sort((a, b) => (b.stt || 0) - (a.stt || 0));
      
      if (notificationsList.length === 0) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">Không có thông báo mới nào.</div>`;
        if (badge) badge.style.display = 'none';
        return;
      }
      
      const lastReadStt = parseInt(localStorage.getItem('nd_last_read_stt') || '0');
      const maxStt = Math.max(...notificationsList.map(n => n.stt || 0));
      
      if (maxStt > lastReadStt) {
        if (badge) badge.style.display = 'block';
      } else {
        if (badge) badge.style.display = 'none';
      }
      
      // Group notifications by date
      const groups = {};
      notificationsList.forEach(item => {
        const dateStr = item.date || 'Thông báo khác';
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(item);
      });
      
      listContainer.innerHTML = '';
      
      // Get unique dates in order of appearance (latest date first)
      const uniqueDates = [];
      notificationsList.forEach(item => {
        const d = item.date || 'Thông báo khác';
        if (!uniqueDates.includes(d)) {
          uniqueDates.push(d);
        }
      });
      
      function parseMarkdownLinks(text) {
        if (!text) return '';
        return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" style="color: #0070f3 !important; text-decoration: underline !important; font-weight: 800 !important;" onclick="event.stopPropagation();">$1</a>');
      }

      uniqueDates.forEach(dateStr => {
        // Date Group Header
        const groupHeader = document.createElement('div');
        groupHeader.style.cssText = 'padding: 8px 16px; background: #f8fafc; font-size: 11px; font-weight: 800; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #f1f5f9; box-sizing: border-box; width: 100%;';
        groupHeader.innerHTML = `📅 &nbsp; ${dateStr}`;
        listContainer.appendChild(groupHeader);
        
        // Notifications in this date group
        groups[dateStr].forEach(item => {
          const itemEl = document.createElement('div');
          const borderAccent = item.color || '#0070f3';
          
          itemEl.style.cssText = `padding: 14px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: flex-start; gap: 12px; transition: background 0.2s; cursor: pointer; box-sizing: border-box; width: 100%; text-align: left;`;
          
          itemEl.onmouseenter = () => { itemEl.style.background = '#f8fafc'; };
          itemEl.onmouseleave = () => { itemEl.style.background = 'transparent'; };
          
          itemEl.innerHTML = `
            <!-- Left: Hour -->
            <div style="font-size: 11.5px; font-weight: 800; color: #94a3b8; width: 40px; text-align: right; flex-shrink: 0; padding-top: 1.5px; font-family: monospace;">
              ${item.time || ''}
            </div>
            <!-- Vertical color bar -->
            <div style="width: 4px; align-self: stretch; background: ${borderAccent}; border-radius: 2px; flex-shrink: 0;"></div>
            <!-- Right: content -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;">
              <span class="nd-notify-title-text" style="font-weight: 800; font-size: 13.5px; color: #1e293b; line-height: 1.3; display: flex; align-items: center; flex-wrap: wrap;">${item.title || 'Thông báo'}</span>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; white-space: normal; word-wrap: break-word;">${parseMarkdownLinks(item.info || '')}</p>
            </div>
          `;
          
          // Click handler logic:
          const hasLinkMatch = item.info && item.info.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
          if (hasLinkMatch) {
            itemEl.title = "Bấm để mở liên kết";
            const badgeSpan = document.createElement('span');
            badgeSpan.style.cssText = 'font-size: 9px; font-weight: 800; color: #0070f3; background: #e0f2fe; padding: 2px 6px; border-radius: 6px; margin-left: 6px; display: inline-flex; align-items: center; gap: 2px;';
            badgeSpan.innerHTML = '🔗 Mở link';
            itemEl.querySelector('.nd-notify-title-text').appendChild(badgeSpan);
            
            itemEl.addEventListener('click', (e) => {
              if (e.target.tagName !== 'A') {
                window.open(hasLinkMatch[2], '_blank');
              }
            });
          } else {
            itemEl.title = "Bấm để xem chi tiết";
            itemEl.addEventListener('click', () => {
              showNotificationDetail(item.title, item.info, dateStr, item.time);
            });
          }
          
          listContainer.appendChild(itemEl);
        });
      });
    }
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
