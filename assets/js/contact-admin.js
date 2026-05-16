/**
 * Contact Admin FAB Component
 * Shared contact widget for all EduSpace pages.
 */

const contactData = [
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
    },
    {
        name: "Facebook Admin Nhật Đăng",
        url: "https://facebook.com/nhatdang10.nd",
        icon: "facebook",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
        color: "#1877F2"
    },
    {
        name: "Messenger Admin Nhật Đăng",
        url: "https://m.me/nhatdang10.nd",
        icon: "message-circle",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
        color: "#0084FF"
    },
    {
        name: "Telegram Admin Nhật Đăng",
        url: "https://t.me/nhatdang10",
        icon: "send",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
        color: "#26A5E4"
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
                left: 2rem;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }

            .contact-main-btn {
                background: #2563eb;
                color: white;
                height: 3rem;
                padding: 0 1.25rem;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0;
                box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                cursor: pointer;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                border: none;
                font-weight: 700;
                font-size: 0.875rem;
                overflow: hidden;
                width: auto;
                min-width: 3rem;
            }

            .contact-main-btn span {
                max-width: 0;
                opacity: 0;
                white-space: nowrap;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                margin-left: 0;
            }

            .contact-main-btn.expanded {
                gap: 0.5rem;
                padding: 0 1.25rem;
            }

            .contact-main-btn.expanded span {
                max-width: 150px;
                opacity: 1;
                margin-left: 0.5rem;
            }

            .contact-main-btn:hover {
                transform: scale(1.05) translateY(-2px);
                box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5);
                background: #1d4ed8;
                gap: 0.5rem;
            }

            .contact-main-btn:hover span {
                max-width: 150px;
                opacity: 1;
                margin-left: 0.5rem;
            }

            .contact-main-btn.active {
                background: #2563eb;
                box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
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
                visibility: visible;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.8);
                pointer-events: auto; /* Allow clicking the text */
                cursor: pointer;
                transition: all 0.3s ease;
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
                <button class="contact-main-btn expanded" id="contactMainBtn" onclick="contactAdminUI.toggle()">
                    <i data-lucide="headset" class="w-5 h-5"></i>
                    <span>Liên hệ Admin</span>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        const menu = document.getElementById('contactMenu');
        if (typeof contactData !== 'undefined') {
            contactData.forEach(contact => {
                const item = document.createElement('a');
                item.href = contact.url;
                item.target = "_blank";
                item.className = "contact-item group";

                const iconHTML = contact.logo
                    ? `<img src="${contact.logo}" class="w-6 h-6 object-contain" alt="${contact.name}">`
                    : `<i data-lucide="${contact.icon}" class="w-5 h-5" style="color: ${contact.color}"></i>`;

                item.innerHTML = `
                    ${iconHTML}
                    <span class="contact-tooltip">${contact.name}</span>
                `;
                menu.appendChild(item);
            });
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // 3-second collapse logic
        const btn = document.getElementById('contactMainBtn');
        clearTimeout(contactTimer);
        contactTimer = setTimeout(() => {
            if (!menu.classList.contains('show')) {
                btn.classList.remove('expanded');
            }
        }, 3000);
    }

    function toggle() {
        const menu = document.getElementById('contactMenu');
        const btn = document.getElementById('contactMainBtn');
        const isActive = menu.classList.toggle('show');
        btn.classList.toggle('active', isActive);

        if (isActive) {
            btn.classList.add('expanded');
            clearTimeout(contactTimer);
        } else {
            btn.classList.remove('expanded');
        }

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
