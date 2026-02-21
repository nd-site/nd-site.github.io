/**
 * ND Labs — Global Navigation Bar
 * Behavior: exactly like a browser tab bar.
 *   • Always fixed at the very top of the viewport
 *   • Content always starts below it (spacer pushes everything down)
 *   • Never overlaps anything
 *   • Brand always visible; links scroll horizontally when narrow
 */
(function () {
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

    /* ── Responsive: hide label text on very small screens ── */
    @media (max-width: 500px) {
      .nd-lbl { display: none; }
      .nd-nav-link { padding: 6px 8px; }
      #nd-brand-name { display: none; }
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
  brand.innerHTML = `<img src="/logo.png" alt="ND Labs"><span id="nd-brand-name">ND Labs</span>`;

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
      userSection.innerHTML = `
        <a href="/auth/settings/" class="nd-nav-link" title="Cài đặt tài khoản">
          <img src="${u.photoURL || '/logo.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
          <span class="nd-lbl">${u.ndid || 'ND Member'}</span>
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
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
