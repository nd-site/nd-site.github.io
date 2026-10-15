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

  /* ─── Điều hướng tự động: /eduspace/... → /edu/... ────────────────── */
  (function redirectEduspaceCurrentPage() {
    try {
      const rawPath = window.location.pathname;
      if (rawPath.startsWith('/eduspace') || rawPath.startsWith('/admin/eduspace') || rawPath === '/eduspace') {
        const targetPath = rawPath
          .replace(/^\/admin\/eduspace(\/|$)/, '/admin/edu$1')
          .replace(/^\/eduspace(\/|$)/, '/edu$1');
        if (targetPath !== rawPath) {
          const target = targetPath + window.location.search + window.location.hash;
          window.location.replace(target);
          return;
        }
      }
    } catch (_) {}
  })();

  /* ─── Tự động điều hướng tất cả liên kết trỏ đến /eduspace/... → /edu/... ─── */
  (function initEduspaceLinkRedirector() {
    function redirectEduspaceHref(href) {
      if (!href || typeof href !== 'string') return href;
      return href
        .replace(/(^|https?:\/\/[^\/]+)\/admin\/eduspace(\/|$)/g, '$1/admin/edu$2')
        .replace(/(^|https?:\/\/[^\/]+)\/eduspace(\/|$)/g, '$1/edu$2');
    }

    function patchAnchor(a) {
      if (!a || !a.getAttribute) return;
      const href = a.getAttribute('href');
      if (href && (href.includes('/eduspace') || href.includes('/admin/eduspace'))) {
        const newHref = redirectEduspaceHref(href);
        if (newHref !== href) {
          a.setAttribute('href', newHref);
        }
      }
    }

    function scanAllLinks(root) {
      try {
        const doc = root || document;
        const links = doc.querySelectorAll ? doc.querySelectorAll('a[href*="eduspace"]') : [];
        links.forEach(patchAnchor);
      } catch (_) {}
    }

    // Quét ngay khi khởi tạo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => scanAllLinks(document));
    } else {
      scanAllLinks(document);
    }

    // Tự động quét và chuẩn hóa các liên kết được render động (DOM mutations)
    if (typeof MutationObserver !== 'undefined' && document.documentElement) {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'childList') {
            m.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                if (node.tagName === 'A') patchAnchor(node);
                scanAllLinks(node);
              }
            });
          } else if (m.type === 'attributes' && m.attributeName === 'href') {
            patchAnchor(m.target);
          }
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href']
      });
    }

    // Bắt sự kiện click trực tiếp (capture phase) để đảm bảo mọi cú nhấp chuột đều được điều hướng
    document.addEventListener('click', function (e) {
      const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && (href.includes('/eduspace') || href.includes('/admin/eduspace'))) {
        const newHref = redirectEduspaceHref(href);
        if (newHref !== href) {
          anchor.setAttribute('href', newHref);
        }
      }
    }, true);
  })();

  /* ─── Tự động nạp font.js và nd-accounts.js cho toàn bộ hệ thống ───── */
  if (!document.querySelector('script[src*="font.js"]')) {
    const fontScript = document.createElement('script');
    fontScript.src = '/font/font.js';
    document.head.appendChild(fontScript);
  }
  if (!document.querySelector('script[src*="nd-accounts.js"]')) {
    const accScript = document.createElement('script');
    accScript.src = '/assets/js/nd-accounts.js';
    document.head.appendChild(accScript);
  }
  if (!document.querySelector('script[src*="canonical-auth.js"]')) {
    const authScript = document.createElement('script');
    authScript.src = '/assets/js/canonical-auth.js';
    document.head.appendChild(authScript);
  }

  /* ─── Hệ thống Nạp & Điều Phối AI Assistant (<tên>_ai.js) ──────────── */
  (function loadAIAssistant() {
    // Registry cấu hình các loại AI Assistant
    // Dễ dàng mở rộng thêm các file <ten>_ai.js mới trong tương lai
    const AI_REGISTRY = [
      {
        id: 'edu_ai',
        name: 'EduAI Assistant',
        script: '/assets/js/edu_ai.js',
        // Chỉ áp dụng cho các trang thuộc phân hệ EduND
        matcher: (p) => p.startsWith('/edu') || p.includes('/admin/edu') || p.includes('/admin/edu')
      },
      {
        id: 'nd_ai',
        name: 'NDAI Assistant',
        script: '/assets/js/nd_ai.js',
        // Áp dụng cho tất cả các trang còn lại của ND Labs
        matcher: () => true
      }
    ];

    const currentPath = window.location.pathname;
    const target = AI_REGISTRY.find(item => item.matcher(currentPath));

    if (target) {
      // 1. Tự động nạp api-service.js nếu chưa có
      if (!window.eduspaceAI && !document.querySelector('script[src*="api-service.js"]')) {
        const apiScript = document.createElement('script');
        apiScript.src = '/assets/js/api-service.js';
        document.head.appendChild(apiScript);
      }

      // 2. Nạp script AI tương ứng
      if (!document.querySelector(`script[src*="${target.id}.js"]`)) {
        const aiScript = document.createElement('script');
        aiScript.src = target.script;
        aiScript.defer = true;
        aiScript.setAttribute('data-ai-id', target.id);
        document.head.appendChild(aiScript);
      }
    }
  })();

  /* ─── Ngăn chặn lưu Cache trình duyệt (Luôn lấy mã mới nhất từ Server) ─── */
  (function enforceServerFreshness() {
    try {
      const metaTags = [
        { key: 'Cache-Control', val: 'no-cache, no-store, must-revalidate' },
        { key: 'Pragma', val: 'no-cache' },
        { key: 'Expires', val: '0' }
      ];
      metaTags.forEach(item => {
        if (!document.querySelector(`meta[http-equiv="${item.key}"]`)) {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', item.key);
          meta.setAttribute('content', item.val);
          document.head.appendChild(meta);
        }
      });

      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
      }
    } catch (_) {}
  })();
  /* ─── Ngăn chặn zoom in/out tuỳ tiện nhưng không ép cứng desktop ─── */
  let metaViewport = document.querySelector('meta[name="viewport"]');
  if (!metaViewport) {
    metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    document.head.appendChild(metaViewport);
  }
  metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');

  const NAV_H = 52; // navbar height in px — single source of truth

  const NAV_LINKS = [
    { href: '/', label: 'Trang Chủ', icon: 'ph-house-simple' },
    { href: '/edu/', label: 'EduND', icon: 'ph-graduation-cap' },
    { href: 'https://dnaai-site.vercel.app', label: 'HeartSpace', icon: 'ph-heart', external: true },
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
      max-width: 1600px;
      width: 100%;
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
      gap: 8px;
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
      width: 28px;
      height: 28px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      flex-shrink: 0;
    }
    #nd-brand-name {
      background: linear-gradient(to right, #2563eb, #0ea5e9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ── Divider ── */
    .nd-sep {
      width: 1px;
      height: 20px;
      background: #cbd5e1;
      margin: 0 10px;
      flex-shrink: 0;
    }

    /* ── Links Wrapper: takes remaining width with overflow indicator ── */
    #nd-navbar-links-wrapper {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    /* ── Links: scrollable, smooth swipe ── */
    #nd-navbar-links {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      transition: all 0.3s ease;
    }
    #nd-navbar-links::-webkit-scrollbar {
      display: none;
    }

    /* ── Overflow Blue Scroll Indicator with Fade Boundary ── */
    #nd-nav-overflow-indicator {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 44px;
      display: none;
      align-items: center;
      justify-content: flex-end;
      padding-right: 6px;
      background: linear-gradient(to right, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.82) 40%, rgba(248, 250, 252, 0.98) 100%);
      pointer-events: auto;
      cursor: pointer;
      z-index: 10;
      transition: opacity 0.2s ease;
    }
    #nd-nav-overflow-indicator i {
      color: #0284c7;
      font-size: 16px;
      font-weight: 800;
      animation: pulseNavIndicator 1.5s infinite;
    }
    @keyframes pulseNavIndicator {
      0%, 100% { transform: translateX(0); opacity: 0.8; }
      50% { transform: translateX(3px); opacity: 1; }
    }

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

    /* ── Mobile Hamburger ── */
    #nd-hamburger {
      display: none;
      background: transparent;
      border: none;
      font-size: 24px;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }

    /* ── Responsive: Hamburger menu ── */
    @media (max-width: 768px) {
      .nd-lbl { display: inline; }
      #nd-brand-name { display: none; }
      .nd-role-badge { display: none; }
      #nd-hamburger { display: flex; align-items: center; justify-content: center; }
      #nd-navbar-links {
        position: fixed;
        top: 50px;
        left: -100%;
        width: 250px;
        height: calc(100vh - 50px);
        background: rgba(255, 255, 255, 0.98);
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
        box-shadow: 4px 0 15px rgba(0,0,0,0.05);
        z-index: 99999;
      }
      #nd-navbar-links.open { left: 0; }
      #nd-navbar-links .nd-nav-link { width: 100%; padding: 12px 16px; margin-bottom: 8px; box-sizing: border-box; }
      #nd-navbar-user {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        margin-left: auto;
      }
      #nd-navbar-user .nd-nav-link {
        width: auto !important;
        padding: 4px 6px !important;
        margin: 0 !important;
        font-size: 0.78rem !important;
      }
      #nd-navbar-user .nd-admin-link .nd-lbl,
      #nd-navbar-user #nd-admin-reload-btn .nd-lbl {
        display: none !important;
      }
      #nd-navbar-user #nd-account-switcher-trigger .nd-lbl {
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    /* ── Tools Dropdown Panel ── */
    #nd-tools-panel {
      position: fixed !important;
      top: 56px !important;
      right: 76px !important;
      left: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: 92vw !important;
      background: rgba(255, 255, 255, 0.98) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(226, 232, 240, 1) !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05) !important;
      z-index: 100015 !important;
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

  // Links Wrapper & Container with Overflow Indicator
  const linksWrapper = document.createElement('div');
  linksWrapper.id = 'nd-navbar-links-wrapper';

  const linksDiv = document.createElement('div');
  linksDiv.id = 'nd-navbar-links';

  NAV_LINKS.forEach(({ href, label, icon, external }) => {
    const a = document.createElement('a');
    a.className = 'nd-nav-link' + (isActive(href) ? ' nd-active' : '');
    a.href = href;
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (isActive(href)) a.setAttribute('aria-current', 'page');
    a.innerHTML = `<i class="ph-duotone ${icon}" aria-hidden="true"></i><span class="nd-lbl">${label}</span>`;
    linksDiv.appendChild(a);
  });

  // Blue Overflow Indicator with Fade
  const overflowIndicator = document.createElement('div');
  overflowIndicator.id = 'nd-nav-overflow-indicator';
  overflowIndicator.title = 'Cuộn sang phải để xem thêm tab';
  overflowIndicator.innerHTML = '<i class="ph-bold ph-caret-right"></i>';
  overflowIndicator.onclick = () => {
    linksDiv.scrollBy({ left: 140, behavior: 'smooth' });
  };

  linksWrapper.appendChild(linksDiv);
  linksWrapper.appendChild(overflowIndicator);

  function checkNavOverflow() {
    if (!linksDiv || !overflowIndicator) return;
    const isOverflowing = linksDiv.scrollWidth > linksDiv.clientWidth + 4;
    const isScrolledToEnd = linksDiv.scrollLeft >= linksDiv.scrollWidth - linksDiv.clientWidth - 8;

    if (isOverflowing && !isScrolledToEnd && linksDiv.clientWidth > 160) {
      overflowIndicator.style.display = 'flex';
    } else {
      overflowIndicator.style.display = 'none';
    }
  }

  linksDiv.addEventListener('scroll', checkNavOverflow);
  window.addEventListener('resize', checkNavOverflow);
  setTimeout(checkNavOverflow, 500);

  // Hamburger Button
  const hamburger = document.createElement('button');
  hamburger.id = 'nd-hamburger';
  hamburger.innerHTML = '<i class="ph-duotone ph-list"></i>';
  hamburger.onclick = () => {
    linksDiv.classList.toggle('open');
    if (linksDiv.classList.contains('open')) {
      hamburger.innerHTML = '<i class="ph-duotone ph-x"></i>';
    } else {
      hamburger.innerHTML = '<i class="ph-duotone ph-list"></i>';
    }
  };

  /* ── User Session Context ── */
  const userSection = document.createElement('div');
  userSection.id = 'nd-navbar-user';
  userSection.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-left: 10px; flex-shrink: 0;';

  // Render user profile or login links in navbar
  function renderNavbarUser(userObj) {
    let u = userObj;
    if (u === undefined) {
      const activeAcc = window.NDAccounts ? window.NDAccounts.getActiveAccount() : null;
      const storedUser = localStorage.getItem('nd_user');
      if (activeAcc) {
        u = activeAcc;
      } else if (storedUser) {
        try { u = JSON.parse(storedUser); } catch (_) { u = null; }
      }
    }

    if (u && (u.ndid || u.displayName || u.email)) {
      try {
        // Role badge config
        const roleCfg = {
          admin:   { cls: 'role-admin',   label: 'Admin' },
          teacher: { cls: 'role-teacher', label: 'GV' },
          student: { cls: 'role-student', label: 'HS' },
          member:  { cls: 'role-other',   label: 'TV' }
        };

        let role = u.role || 'member';
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
        if (role === 'admin' || (u && u.adminLevel === 'owner')) {
          adminLink = `
            <a href="/admin/" class="nd-nav-link nd-admin-link" style="color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-weight: 700;" title="Hệ thống Quản trị Admin">
              <i class="ph-bold ph-shield-checkered" style="color: #d97706;"></i><span class="nd-lbl">Quản trị</span>
            </a>
            <button id="nd-admin-reload-btn" class="nd-nav-link nd-admin-reload" style="color: #ef4444; border: none; background: transparent; cursor: pointer; padding: 5px 8px;" title="Yêu cầu tải lại trang cho tất cả">
              <i class="ph-bold ph-arrows-clockwise"></i><span class="nd-lbl">Tải lại</span>
            </button>
          `;
        }

        const activeIdx = (function() {
          try {
            const p = new URLSearchParams(window.location.search);
            const uParam = p.get('u');
            if (uParam !== null && !isNaN(parseInt(uParam, 10))) return parseInt(uParam, 10);
          } catch (_) {}
          return 0;
        })();

        userSection.style.position = 'relative';
        userSection.innerHTML = `
          ${adminLink}
          <button type="button" id="nd-account-switcher-trigger" class="nd-nav-link" style="gap: 6px; background: transparent; border: none; cursor: pointer; padding: 4px 8px; border-radius: 12px;">
            <img src="${u.photoURL || '/assets/images/logo.png'}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1.5px solid #0070f3;">
            <span class="nd-lbl" style="display:flex; align-items:center; gap:4px;">
              ${u.ndid || 'Đang tải...'}
              ${roleBadgeHtml}
              <i class="ph-bold ph-caret-down" style="font-size: 11px; color: #64748b;"></i>
            </span>
          </button>
        `;

        // Account Switcher Popover Modal
        const popover = document.createElement('div');
        popover.id = 'nd-account-switcher-popover';
        popover.style.cssText = `
          display: none;
          position: absolute;
          top: 48px;
          right: 0;
          width: 320px;
          max-width: min(320px, 92vw);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          padding: 18px;
          z-index: 100010;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
        `;

        function renderAccountSwitcherDropdown() {
          const allAccounts = window.NDAccounts ? window.NDAccounts.getAllAccounts() : [u];
          let accountsListHtml = '';

          allAccounts.forEach((acc, idx) => {
            const isCurr = idx === activeIdx;
            const targetUrl = idx === 0 ? window.location.pathname : `${window.location.pathname}?u=${idx}`;
            accountsListHtml += `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 12px; background: ${isCurr ? '#f0f9ff' : '#ffffff'}; border: 1px solid ${isCurr ? '#bae6fd' : '#f1f5f9'}; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <img src="${acc.photoURL || '/assets/images/logo.png'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isCurr ? '#0284c7' : '#cbd5e1'}; shrink: 0;">
                  <div style="min-width: 0;">
                    <div style="font-size: 12px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${acc.displayName || acc.fullname || 'ND Member'}</div>
                    <div style="font-size: 10.5px; color: #64748b; font-family: monospace;">${acc.ndid || '—'}</div>
                  </div>
                </div>
                <div>
                  ${isCurr ? '<span style="font-size: 10px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 100px;">Đang dùng</span>' : `<a href="${targetUrl}" style="font-size: 11px; font-weight: 700; color: #0070f3; text-decoration: none; padding: 4px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">Chuyển</a>`}
                </div>
              </div>
            `;
          });

          popover.innerHTML = `
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: #64748b; text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span>Tài khoản NDID (${allAccounts.length}/10)</span>
              <button id="close-acc-popover" style="border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 14px;">✕</button>
            </div>

            <div style="max-height: 220px; overflow-y: auto; margin-bottom: 12px;">
              ${accountsListHtml}
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
              ${(role === 'admin' || (u && u.adminLevel === 'owner')) ? `
                <a href="/admin/" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #fffbeb; color: #b45309; text-decoration: none; font-size: 12px; font-weight: 700; border: 1px solid #fde68a;">
                  <i class="ph-bold ph-shield-checkered" style="font-size: 15px; color: #d97706;"></i> Hệ thống Quản trị
                </a>
              ` : ''}
              ${allAccounts.length < 10 ? `
                <a href="/auth/login/?addAccount=true" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #f8fafc; color: #0070f3; text-decoration: none; font-size: 12px; font-weight: 700; border: 1px dashed #93c5fd;">
                  <i class="ph-bold ph-user-plus" style="font-size: 15px;"></i> Thêm tài khoản khác
                </a>
              ` : ''}
              <a href="${activeIdx > 0 ? `/auth/settings/?u=${activeIdx}` : '/auth/settings/'}" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #ffffff; color: #334155; text-decoration: none; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0;">
                <i class="ph-bold ph-gear" style="font-size: 15px;"></i> Cài đặt tài khoản
              </a>
              <button id="popover-logout-current-btn" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; width: 100%; font-family: inherit;">
                <i class="ph-bold ph-sign-out" style="font-size: 15px;"></i> Đăng xuất tài khoản này
              </button>
              <button id="popover-logout-all-btn" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; width: 100%; font-family: inherit;">
                <i class="ph-bold ph-power" style="font-size: 15px;"></i> Đăng xuất tất cả tài khoản
              </button>
            </div>
          `;
        }

        userSection.appendChild(popover);

        // Click handler inside popover
        popover.onclick = (e) => {
          const closeBtn = e.target.closest('#close-acc-popover');
          const logoutCurrent = e.target.closest('#popover-logout-current-btn');
          const logoutAll = e.target.closest('#popover-logout-all-btn');

          if (closeBtn) {
            popover.style.display = 'none';
          } else if (logoutCurrent) {
            if (window.canonicalAuth) { try { window.canonicalAuth.logout(); } catch (_) {} }
            if (window.NDAccounts) {
              const activeIdx = window.NDAccounts.getActiveIndexFromUrl();
              window.NDAccounts.removeAccount(activeIdx);
            } else storageClear();
          } else if (logoutAll) {
            if (window.canonicalAuth) { try { window.canonicalAuth.logout(); } catch (_) {} }
            if (window.NDAccounts) window.NDAccounts.removeAllAccounts();
            else storageClear();
          }
        };

        const trigger = userSection.querySelector('#nd-account-switcher-trigger');
        if (trigger) {
          trigger.onclick = (e) => {
            e.stopPropagation();
            renderAccountSwitcherDropdown();
            popover.style.display = popover.style.display === 'block' ? 'none' : 'block';
          };
        }
      } catch (e) {
        storageClear();
      }
    } else {
      userSection.style.position = '';
      userSection.innerHTML = `
        <a href="/auth/login/" class="nd-nav-link" style="color: #0070f3;">Đăng nhập</a>
        <a href="/auth/register/" class="nd-nav-link nd-active" style="padding: 5px 10px;">NDID</a>
      `;
    }
  }

  // Initial render
  renderNavbarUser();

  // Listen to canonical auth state changes
  window.addEventListener('nd-auth-state-changed', (e) => {
    if (e.detail && e.detail.profile) {
      renderNavbarUser(e.detail.profile);
    } else if (e.detail && e.detail.codeId === null) {
      renderNavbarUser(null);
    }
  });

  // Close popover when clicking anywhere else
  document.body.addEventListener('click', (e) => {
    const popover = document.getElementById('nd-account-switcher-popover');
    if (popover && popover.style.display === 'block') {
      if (!e.target.closest('#nd-account-switcher-popover') && !e.target.closest('#nd-account-switcher-trigger')) {
        popover.style.display = 'none';
      }
    }
  });

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

  /* ─── System Commands Listener (Tải lại trang) ─── */
  async function initSystemCommands() {
    if (!window.firebaseDb) return;
    try {
      const { ref, onValue, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');
      const cmdRef = ref(window.firebaseDb, 'system_commands/reload');
      let firstLoad = true;
      onValue(cmdRef, (snapshot) => {
        if (firstLoad) {
          firstLoad = false;
          return;
        }
        const data = snapshot.val();
        // Bỏ qua lệnh nếu cũ hơn 10 giây
        if (data && data.timestamp && (Date.now() - data.timestamp < 10000)) {
          showReloadModal();
        }
      });
      
      // Bắt sự kiện click vào nút gửi lệnh tải lại
      document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('#nd-admin-reload-btn');
        if (btn) {
          if (confirm('Gửi lệnh tải lại trang cho tất cả người dùng đang online?')) {
            set(cmdRef, { timestamp: Date.now() }).catch(err => {
              alert('Lỗi khi gửi lệnh: ' + err.message);
            });
          }
        }
      });
    } catch (e) {
      console.error('Lỗi khi khởi tạo system commands:', e);
    }
  }

  if (window.firebaseDb) {
    initSystemCommands();
  } else {
    window.addEventListener('firebase-ready', initSystemCommands);
  }

  function showReloadModal() {
    if (document.getElementById('nd-reload-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'nd-reload-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      z-index: 999999; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.98); padding: 24px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; max-width: 90%; width: 340px; font-family: 'Plus Jakarta Sans', sans-serif; transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <i class="ph-duotone ph-arrows-clockwise" style="font-size: 52px; color: #ef4444; margin-bottom: 12px; display: inline-block;"></i>
        <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 18px; font-weight: 800;">Lệnh Cập Nhật Hệ Thống</h3>
        <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14.5px; line-height: 1.5;">Trang web sẽ tự động tải lại sau <span id="nd-reload-countdown" style="font-weight: 800; color: #ef4444; font-size: 16px;">3</span> giây để đồng bộ dữ liệu mới nhất...</p>
        <button id="nd-cancel-reload-btn" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; font-size: 14px; width: 100%;">Hủy Tải Lại</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.children[0].style.transform = 'scale(1)';
    });
    
    let timeLeft = 3;
    const countSpan = document.getElementById('nd-reload-countdown');
    
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.reload();
      } else {
        countSpan.textContent = timeLeft;
      }
    }, 1000);
    
    document.getElementById('nd-cancel-reload-btn').addEventListener('click', () => {
      clearInterval(timer);
      modal.style.opacity = '0';
      modal.children[0].style.transform = 'scale(0.95)';
      setTimeout(() => modal.remove(), 300);
    });
  }

  /* ── Quick Tools Button in Navbar ── */
  const toolsWrapper = document.createElement('div');
  toolsWrapper.id = 'nd-navbar-tools-wrapper';
  toolsWrapper.style.cssText = 'position: relative; display: flex; align-items: center; margin-left: auto; flex-shrink: 0;';
  toolsWrapper.innerHTML = `
    <button id="nd-navbar-tools-btn" type="button" title="Công cụ tiện ích" style="padding: 6px 10px; border-radius: 12px; border: 1px solid rgba(226,232,240,0.8); background: rgba(255,255,255,0.85); color: #475569; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; font-family: inherit;">
      <i class="ph-duotone ph-qr-code" style="font-size: 14px; color: #2563eb;"></i>
      <span class="nd-lbl">Tiện ích</span>
    </button>
  `;

  inner.appendChild(brand);
  inner.appendChild(sep);
  inner.appendChild(linksWrapper);
  inner.appendChild(toolsWrapper);
  inner.appendChild(notifyWrapper);
  inner.appendChild(userSection);
  inner.appendChild(hamburger);
  nav.appendChild(inner);

  /* ─── Spacer: pushes page content below fixed bar ──────── */
  const spacer = document.createElement('div');
  spacer.id = 'nd-navbar-spacer';
  spacer.setAttribute('aria-hidden', 'true');

  /* ─── Mount into DOM ──────────────────────────────────── */
  function mount() {
    if (document.getElementById('nd-navbar') || document.querySelector('header[data-nd-react-navbar="true"]')) return; // idempotent
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

    // Create Panel
    const panel = document.createElement('div');
    panel.id = 'nd-tools-panel';
    panel.innerHTML = `
      <div class="nd-tools-tab-header">
        <button class="nd-tools-tab-btn active" id="nd-tab-btn-qr"><i class="ph-duotone ph-qr-code"></i>Mã QR</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-calc"><i class="ph-duotone ph-calculator"></i>Máy tính</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-timer"><i class="ph-duotone ph-timer"></i>Pomodoro</button>
        <button class="nd-tools-tab-btn" id="nd-tab-btn-notes"><i class="ph-duotone ph-note-pencil"></i>Ghi chú</button>
        <button id="nd-tools-close-btn" style="border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 13px; font-weight: bold; padding: 0 8px;">✕</button>
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

    // Toggle Tools Panel from Navbar Button
    const toolsBtn = document.getElementById('nd-navbar-tools-btn');
    if (toolsBtn) {
      toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = panel.style.display === 'flex';
        if (isVisible) {
          panel.style.display = 'none';
        } else {
          // Close other popovers if open
          const accPopover = document.getElementById('nd-account-switcher-popover');
          if (accPopover) accPopover.style.display = 'none';
          if (notifyModal) {
            notifyModal.style.opacity = '0';
            setTimeout(() => { notifyModal.style.display = 'none'; }, 200);
          }
          panel.style.display = 'flex';
          const currentUrl = window.location.href;
          const qrImg = document.getElementById('nd-tools-qr-img');
          if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
          const qrUrl = document.getElementById('nd-tools-qr-url');
          if (qrUrl) qrUrl.value = currentUrl;
        }
      });
    }

    const toolsCloseBtn = document.getElementById('nd-tools-close-btn');
    if (toolsCloseBtn) {
      toolsCloseBtn.addEventListener('click', () => {
        panel.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !e.target.closest('#nd-navbar-tools-btn')) {
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

    // ── Helper: Rich Text, Formatting & User Tagging Parser ──
    function formatRichNotification(raw) {
      if (!raw) return '';
      let s = String(raw)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

      // Bold: **text**
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic: *text* (not surrounded by other asterisks)
      s = s.replace(/(^|[^\*])\*([^\*\n\r]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
      // Underline: __text__
      s = s.replace(/__([^_]+)__/g, '<u>$1</u>');
      // Markdown links: [label](url)
      s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0070f3 !important; text-decoration: underline !important; font-weight: 700 !important;" onclick="event.stopPropagation();">$1</a>');
      // Raw URLs: https://...
      s = s.replace(/(^|[^"'])(https?:\/\/[a-zA-Z0-9_\-\.\/\?%&=#+@!:,]+)/g, (match, prefix, url) => {
        if (prefix.includes('href=') || prefix.includes('src=')) return match;
        return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0070f3 !important; text-decoration: underline !important; font-weight: 700 !important;" onclick="event.stopPropagation();">${url}</a>`;
      });
      // Tagged users: @username (Rule #2 & #3: preserve raw NDID)
      s = s.replace(/(^|[\s(>])@([a-zA-Z0-9_.-]+)/g, '$1<span class="nd-user-tag" style="background: #eff6ff; color: #1d4ed8; padding: 1px 7px; border-radius: 6px; font-weight: 700; border: 1px solid #bfdbfe; font-size: 0.9em; display: inline-flex; align-items: center; gap: 2px;">@$2</span>');
      // Auto line breaks if not rich HTML
      if (!s.includes('<p>') && !s.includes('<div') && !s.includes('<br')) {
        s = s.replace(/\n/g, '<br>');
      }
      return s;
    }

    // ── Helper: Audience Filtering ──
    function shouldShowNotification(item, currentUser) {
      if (!item.target || item.target.type === 'all' || !item.target.type) {
        return true;
      }
      const isUserAdmin = currentUser && (currentUser.role === 'admin' || currentUser.adminLevel === 'owner');
      if (item.target.type === 'group') {
        if (isUserAdmin) return true;
        if (!currentUser) return false;
        const g = item.target.groupRole;
        if (g === 'student' && (currentUser.eduRole === 'student' || !currentUser.eduRole)) return true;
        if (g === 'teacher' && currentUser.eduRole === 'teacher') return true;
        if (g === 'admin' && currentUser.role === 'admin') return true;
        if (g === 'member' && currentUser) return true;
        if (g === 'grade_10' && String(currentUser.grade).includes('10')) return true;
        if (g === 'grade_11' && String(currentUser.grade).includes('11')) return true;
        if (g === 'grade_12' && String(currentUser.grade).includes('12')) return true;
        return false;
      }
      if (item.target.type === 'user') {
        if (isUserAdmin) return true;
        if (!currentUser) return false;
        const recipients = item.target.recipients || [];
        const myNdid = (currentUser.ndid || '').toLowerCase().trim();
        const myCodeId = (currentUser.codeId || currentUser.uid || '').toLowerCase().trim();
        return recipients.some(r => {
          const target = String(r).toLowerCase().trim().replace(/^@/, '');
          return target === myNdid || target === myCodeId;
        });
      }
      return true;
    }

    // ── Helper: Sender Badge Renderer ──
    function renderSenderBadge(sender) {
      if (!sender) return '';
      let badgeHtml = '';
      if (sender.type === 'admin' || sender.adminNdid) {
        const adminTag = sender.adminNdid ? sender.adminNdid : (sender.name || 'Quản trị viên');
        badgeHtml = `<span style="display: inline-flex; align-items: center; gap: 4px; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 10px; padding: 2px 7px; border-radius: 6px; border: 1px solid #fde68a;">
          <i class="ph-bold ph-shield-check" style="font-size: 11px;"></i> ${adminTag}
        </span>`;
      } else if (sender.name) {
        badgeHtml = `<span style="display: inline-flex; align-items: center; gap: 4px; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 10px; padding: 2px 7px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <i class="ph-bold ph-user" style="font-size: 11px;"></i> ${sender.name}
        </span>`;
      }
      let collabHtml = '';
      if (sender.collaborators && Array.isArray(sender.collaborators) && sender.collaborators.length > 0) {
        const collabs = sender.collaborators.map(c => `<span style="background: #eff6ff; color: #1d4ed8; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 9.5px; border: 1px solid #bfdbfe;">@${String(c).replace(/^@/, '')}</span>`).join(' ');
        collabHtml = `<span style="font-size: 10px; color: #64748b; margin-left: 4px; display: inline-flex; align-items: center; gap: 3px;">cùng ${collabs}</span>`;
      }
      if (!badgeHtml && !collabHtml) return '';
      return `<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 4px;">${badgeHtml}${collabHtml}</div>`;
    }

    // ── Helper: Target Badge Renderer ──
    function renderTargetBadge(target) {
      if (!target || target.type === 'all' || !target.type) {
        return `<span style="font-size: 9px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 6px;">🌐 Tất cả</span>`;
      }
      if (target.type === 'group') {
        const labelMap = {
          student: 'Học sinh',
          teacher: 'Giáo viên',
          admin: 'Quản trị viên',
          member: 'Thành viên',
          grade_10: 'Khối 10',
          grade_11: 'Khối 11',
          grade_12: 'Khối 12'
        };
        const label = labelMap[target.groupRole] || target.groupRole;
        return `<span style="font-size: 9px; font-weight: 800; color: #7c3aed; background: #f3e8ff; padding: 2px 6px; border-radius: 6px;">👥 Nhóm: ${label}</span>`;
      }
      if (target.type === 'user') {
        return `<span style="font-size: 9px; font-weight: 800; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 6px;">🔒 Cá nhân</span>`;
      }
      return '';
    }

    // ── Toast Alert Dialog ──
    function showToastNotification(item) {
      if (!item) return;
      const title = item.title || 'Thông báo mới';
      const info = item.info || item.content || '';
      const image = item.image || '';
      const textColor = item.textColor || '#0f172a';

      let container = document.getElementById('nd-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'nd-toast-container';
        container.style.cssText = 'position: fixed; top: 85px; right: 20px; z-index: 100015; display: flex; flex-direction: column; gap: 10px; max-width: 360px; width: 90%; pointer-events: none;';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.style.cssText = `
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 4px solid ${item.color || '#0070f3'};
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06);
        padding: 12px 16px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        cursor: pointer;
        font-family: 'Plus Jakarta Sans', sans-serif;
      `;

      const cleanInfo = String(info).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1').replace(/<[^>]+>/g, '');
      const imgHtml = image ? `<img src="${image}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 10px; flex-shrink: 0; border: 1px solid #e2e8f0;">` : '';

      toast.innerHTML = `
        ${imgHtml}
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 800; font-size: 10px; color: #0070f3; display: flex; align-items: center; gap: 4px;">🔔 THÔNG BÁO MỚI</span>
            <button style="background: transparent; border: none; font-size: 10px; color: #94a3b8; cursor: pointer; padding: 0;">✕</button>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: ${textColor}; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4; max-height: 38px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${cleanInfo}</div>
        </div>
      `;

      toast.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
          showNotificationDetail(item, item.date || 'Hôm nay');
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

    // ── Full Detail Modal with Rich Formatting, Sender, Image & Link ──
    function showNotificationDetail(item, dateStr) {
      if (!item) return;
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
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.2s ease;
          box-sizing: border-box;
        `;
        document.body.appendChild(detailModal);
      }

      const title = item.title || 'Thông báo';
      const bodyContent = formatRichNotification(item.content || item.info || '');
      const textColor = item.textColor || '#0f172a';
      const imageHtml = item.image ? `
        <div style="margin: 14px 0; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; max-height: 260px; background: #f8fafc;">
          <img src="${item.image}" alt="Banner" style="width: 100%; max-height: 260px; object-fit: contain; display: block;" onerror="this.parentElement.style.display='none';">
        </div>
      ` : '';

      const actionButtonHtml = item.link ? `
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background: #2563eb; color: #ffffff !important; padding: 8px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none !important; box-shadow: 0 4px 12px rgba(37,99,235,0.25); transition: opacity 0.2s;">
            <span>${item.linkText || 'Mở liên kết'}</span>
            <i class="ph-bold ph-arrow-square-out" style="font-size: 14px;"></i>
          </a>
        </div>
      ` : '';

      detailModal.innerHTML = `
        <div style="
          background: #fff;
          border-radius: 24px;
          max-width: 520px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          padding: 24px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transform: scale(0.95);
          transition: transform 0.2s ease;
          box-sizing: border-box;
          text-align: left;
        ">
          <!-- Top Row: Date & Close -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 800; color: #94a3b8; font-family: monospace;">📅 ${dateStr} &nbsp; ${item.time || ''}</span>
              ${renderTargetBadge(item.target)}
            </div>
            <button id="nd-notify-detail-close" style="background: #f1f5f9; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 12px; font-weight: bold; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">✕</button>
          </div>

          <!-- Sender Badge -->
          ${renderSenderBadge(item.sender)}

          <!-- Title -->
          <h4 style="font-size: 18px; font-weight: 800; color: ${textColor}; margin: 8px 0 10px 0; line-height: 1.35;">${title}</h4>

          <!-- Attached Image -->
          ${imageHtml}

          <!-- Rich Body -->
          <div style="font-size: 14px; color: #334155; line-height: 1.65; word-wrap: break-word;">${bodyContent}</div>

          <!-- Action Button -->
          ${actionButtonHtml}
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

    // ── Realtime Synchronization (Firestore Primary + Realtime Database Fallback) ──
    (async () => {
      let isSynced = false;

      // 1. Try Firestore Real-time Snapshot
      async function tryFirestoreSync() {
        if (!window.firebaseFirestore) return false;
        try {
          const { collection, onSnapshot, query, orderBy, limit } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
          const q = query(collection(window.firebaseFirestore, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
          let initialLoad = true;

          onSnapshot(q, (snapshot) => {
            const notifs = {};
            snapshot.forEach(doc => {
              notifs[doc.id] = { id: doc.id, ...doc.data() };
            });
            updateNotificationList(notifs);

            if (!initialLoad) {
              snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                  const data = change.doc.data();
                  showToastNotification(data);
                }
              });
            }
            initialLoad = false;
            isSynced = true;
          }, (err) => {
            console.warn("Firestore notification subscription unavailable:", err);
            tryRtdbSync();
          });
          return true;
        } catch (e) {
          return false;
        }
      }

      // 2. Realtime Database / REST fallback
      async function tryRtdbSync() {
        let dbUrl = "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app";
        try {
          if (typeof getEduKeys === 'function') {
            const keys = await getEduKeys();
            if (keys && keys.fbDatabaseURL) dbUrl = keys.fbDatabaseURL;
          }
        } catch (e) {}

        const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl + 'notifications.json' : dbUrl + '/notifications.json';

        // Try RTDB event trigger
        if (window.firebaseDb) {
          try {
            const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
            const notifRef = ref(window.firebaseDb, 'notifications');
            onValue(notifRef, (snap) => {
              const val = snap.val();
              if (val) {
                updateNotificationList(val);
                isSynced = true;
              }
            }, () => fetchFallback(cleanDbUrl));
            return;
          } catch (_) {}
        }

        fetchFallback(cleanDbUrl);
      }

      function fetchFallback(url) {
        if (isSynced) return;
        const busterUrl = url + (url.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
        fetch(busterUrl)
          .then(res => {
            if (!res.ok) throw new Error("Status " + res.status);
            return res.json();
          })
          .then(data => {
            if (data) updateNotificationList(data);
          })
          .catch(() => {
            const listContainer = document.getElementById('nd-navbar-notify-list');
            if (listContainer && (!notificationsList || notificationsList.length === 0)) {
              listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">Chưa có thông báo mới.</div>`;
            }
          });
      }

      // Wait for Firebase readiness
      const success = await tryFirestoreSync();
      if (!success) {
        window.addEventListener('firebase-ready', async () => {
          const ok = await tryFirestoreSync();
          if (!ok) tryRtdbSync();
        }, { once: true });
        setTimeout(() => { if (!isSynced) tryRtdbSync(); }, 1500);
      }
    })();
  }

  // ── Render Notification List in Bell Dropdown ──
  function updateNotificationList(data) {
    const listContainer = document.getElementById('nd-navbar-notify-list');
    const badge = document.getElementById('nd-navbar-notify-badge');
    if (!listContainer) return;

    if (!data) {
      listContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">Không có thông báo mới nào.</div>`;
      if (badge) badge.style.display = 'none';
      return;
    }

    let currentUser = null;
    try {
      const rawUser = localStorage.getItem('nd_user');
      if (rawUser) currentUser = JSON.parse(rawUser);
    } catch (_) {}

    const nowTime = Date.now();
    notificationsList = Object.entries(data).map(([k, item]) => {
      return { id: item.id || k, ...item };
    }).filter(item => {
      // 1. Time scheduling check
      if (item.scheduled) {
        if (item.scheduledTimestamp) {
          if (item.scheduledTimestamp > nowTime) return false;
        } else if (item.date && item.time) {
          try {
            const dParts = item.date.split('/');
            const tParts = item.time.split(':');
            if (dParts.length === 3 && tParts.length === 2) {
              const sched = new Date(dParts[2], dParts[1] - 1, dParts[0], tParts[0], tParts[1]).getTime();
              if (sched > nowTime) return false;
            }
          } catch (_) {}
        }
      }
      // 2. Audience target filtering
      return shouldShowNotification(item, currentUser);
    });

    notificationsList.sort((a, b) => (b.createdAt || b.stt || 0) - (a.createdAt || a.stt || 0));

    if (notificationsList.length === 0) {
      listContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">Không có thông báo mới nào.</div>`;
      if (badge) badge.style.display = 'none';
      return;
    }

    const lastReadStt = parseInt(localStorage.getItem('nd_last_read_stt') || '0', 10);
    const maxStt = Math.max(...notificationsList.map(n => n.createdAt || n.stt || 0));

    if (maxStt > lastReadStt) {
      if (badge) badge.style.display = 'block';
    } else {
      if (badge) badge.style.display = 'none';
    }

    // Group notifications by date
    const groups = {};
    const uniqueDates = [];
    notificationsList.forEach(item => {
      const d = item.date || 'Hôm nay';
      if (!groups[d]) {
        groups[d] = [];
        uniqueDates.push(d);
      }
      groups[d].push(item);
    });

    listContainer.innerHTML = '';

    uniqueDates.forEach(dateStr => {
      // Date Group Header
      const groupHeader = document.createElement('div');
      groupHeader.style.cssText = 'padding: 8px 16px; background: #f8fafc; font-size: 11px; font-weight: 800; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #f1f5f9; box-sizing: border-box; width: 100%; display: flex; align-items: center; justify-content: space-between;';
      groupHeader.innerHTML = `<span>📅 &nbsp; ${dateStr}</span>`;
      listContainer.appendChild(groupHeader);

      // Items in this date group
      groups[dateStr].forEach(item => {
        const itemEl = document.createElement('div');
        const borderAccent = item.color || '#0070f3';
        const textColor = item.textColor || '#1e293b';

        itemEl.style.cssText = `padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: flex-start; gap: 10px; transition: background 0.15s; cursor: pointer; box-sizing: border-box; width: 100%; text-align: left;`;

        itemEl.onmouseenter = () => { itemEl.style.background = '#f8fafc'; };
        itemEl.onmouseleave = () => { itemEl.style.background = 'transparent'; };

        const thumbHtml = item.image ? `<img src="${item.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; flex-shrink: 0; border: 1px solid #e2e8f0;" onerror="this.style.display='none';">` : '';
        const linkBadge = item.link ? `<span style="font-size: 9px; font-weight: 800; color: #0070f3; background: #e0f2fe; padding: 2px 6px; border-radius: 6px; margin-left: 6px; display: inline-flex; align-items: center; gap: 2px;">🔗 ${item.linkText || 'Mở link'}</span>` : '';

        itemEl.innerHTML = `
          <!-- Left: Hour & Color Bar -->
          <div style="font-size: 11px; font-weight: 800; color: #94a3b8; width: 36px; text-align: right; flex-shrink: 0; padding-top: 2px; font-family: monospace;">
            ${item.time || ''}
          </div>
          <div style="width: 3.5px; align-self: stretch; background: ${borderAccent}; border-radius: 2px; flex-shrink: 0;"></div>
          <!-- Center: Content -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0;">
            ${renderSenderBadge(item.sender)}
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span class="nd-notify-title-text" style="font-weight: 800; font-size: 13px; color: ${textColor}; line-height: 1.35; display: flex; align-items: center; flex-wrap: wrap;">
                ${item.title || 'Thông báo'}
                ${linkBadge}
              </span>
              ${renderTargetBadge(item.target)}
            </div>
            <div style="font-size: 11.5px; color: #64748b; line-height: 1.45; margin: 0; max-height: 38px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${formatRichNotification(item.info || item.content || '')}
            </div>
          </div>
          <!-- Right: Image Thumbnail if any -->
          ${thumbHtml}
        `;

        itemEl.addEventListener('click', () => {
          showNotificationDetail(item, dateStr);
        });

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
