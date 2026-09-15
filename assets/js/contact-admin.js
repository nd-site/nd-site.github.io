/**
 * EduSpace — Contact Admin Floating Action Button (Nút liên hệ hỗ trợ nổi)
 * 
 * Tác dụng:
 *   • Cung cấp nút hỗ trợ khách hàng nổi (Floating Action Button - FAB) ở góc dưới bên trái màn hình.
 *   • Khi nhấn sẽ bung mở các kênh liên hệ của Admin và ND Labs (Facebook, Messenger, Telegram).
 *   • Tự động thu gọn nhãn văn bản sau 3 giây để tiết kiệm không gian hiển thị trên màn hình.
 */

const contactData = [
    {
        name: "ChatND với Admin",
        url: "/chat?admin",
        icon: "message-square",
        logo: "/assets/images/logo.png",
        color: "#0284c7"
    },
    {
        name: "Facebook ND Labs",
        url: "https://facebook.com/ndlabs.nd",
        icon: "facebook",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
        color: "#1877F2"
    },
    {
        name: "Messenger ND Labs",
        url: "https://m.me/ndlabs.nd",
        icon: "message-circle",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
        color: "#0084FF"
    }
];

const contactAdminUI = (function () {
    let contactTimer = null;

    function injectStyles() {
        if (document.getElementById('contact-admin-styles')) return;
        const style = document.createElement('style');
        style.id = 'contact-admin-styles';
        style.innerHTML = `
            .contact-fab-container {
                position: fixed;
                bottom: 2rem;
                left: 1.5rem;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
                box-sizing: border-box;
            }

            @keyframes pulse-glow {
                0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
                100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
            }

            .contact-main-btn {
                background: #2563eb;
                color: white;
                height: 3.25rem;
                width: 3.25rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                border: none;
                position: relative;
                animation: pulse-glow 2.5s infinite;
            }

            .contact-main-btn:hover {
                transform: scale(1.08) translateY(-2px);
                background: #1d4ed8;
                animation: none;
                box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5);
            }

            .contact-main-btn:active, .contact-main-btn.active {
                transform: scale(0.95);
                background: #1e40af;
            }

            /* Tooltip for the main FAB */
            .contact-main-btn::after {
                content: attr(data-tooltip);
                position: absolute;
                left: 4rem;
                background: rgba(15, 23, 42, 0.95);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.75rem;
                font-weight: 700;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transform: translateX(-10px);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .contact-main-btn:hover::after {
                opacity: 1;
                visibility: visible;
                transform: translateX(0);
            }

            /* Hide the original span text to keep it a pure icon button */
            .contact-main-btn span.btn-label-text {
                display: none;
            }

            .contact-menu {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px) scale(0.9);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
            }

            .contact-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            .contact-item {
                background: white;
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                text-decoration: none;
                border: 1px solid #f1f5f9;
                position: relative;
            }

            .contact-item:hover {
                transform: scale(1.1) translateX(4px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
                background: #f8fafc;
            }

            .contact-tooltip {
                position: absolute;
                left: 3.25rem;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: #334155;
                padding: 0.35rem 0.85rem;
                border-radius: 0.75rem;
                font-size: 0.75rem;
                font-weight: 700;
                white-space: nowrap;
                opacity: 1;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.8);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            @media (max-width: 768px) {
                .contact-fab-container {
                    bottom: 16px;
                    left: 16px;
                    gap: 0.5rem;
                }
                .contact-main-btn {
                    height: 3.25rem;
                    width: 3.25rem;
                }
                .contact-item {
                    width: 2.5rem;
                    height: 2.5rem;
                }
                .contact-tooltip {
                    left: 3rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        injectStyles();
        if (document.getElementById('contactMainBtn')) return;

        const html = `
            <div class="contact-fab-container">
                <div class="contact-menu" id="contactMenu"></div>
                <button class="contact-main-btn" id="contactMainBtn" data-tooltip="Liên hệ Admin" onclick="contactAdminUI.toggle()">
                    <i data-lucide="headset" class="w-6 h-6"></i>
                    <span class="btn-label-text">Liên hệ Admin</span>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        renderItems(contactData);
        loadDynamicContacts();
        window.addEventListener('firebase-ready', loadDynamicContacts);
    }

    function renderItems(items) {
        const menu = document.getElementById('contactMenu');
        if (!menu || !Array.isArray(items)) return;
        menu.innerHTML = '';
        items.forEach(contact => {
            const item = document.createElement('a');
            item.href = contact.url;
            item.target = contact.url.startsWith('/') ? '_self' : '_blank';
            item.className = "contact-item group";

            const iconHTML = contact.logo
                ? `<img src="${contact.logo}" class="w-6 h-6 object-contain" alt="${contact.name}">`
                : `<i data-lucide="${contact.icon || 'message-square'}" class="w-5 h-5" style="color: ${contact.color || '#0284c7'}"></i>`;

            item.innerHTML = `
                ${iconHTML}
                <span class="contact-tooltip">${contact.name}</span>
            `;
            menu.appendChild(item);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function loadDynamicContacts() {
        try {
            if (window.firebaseFirestore) {
                const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
                const snap = await getDoc(doc(window.firebaseFirestore, 'config', 'contacts'));
                if (snap.exists() && Array.isArray(snap.data()?.list)) {
                    renderItems(snap.data().list);
                }
            } else if (window.firebaseDb) {
                const { ref, get } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
                const snap = await get(ref(window.firebaseDb, 'config/contacts'));
                if (snap.exists() && Array.isArray(snap.val())) {
                    renderItems(snap.val());
                }
            }
        } catch (_) {}
    }

    function toggle() {
        const menu = document.getElementById('contactMenu');
        const btn = document.getElementById('contactMainBtn');
        const isActive = menu.classList.toggle('show');
        btn.classList.toggle('active', isActive);

        const icon = btn.querySelector('i');
        if (isActive) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'headset');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init: init,
        toggle: toggle
    };
})();
