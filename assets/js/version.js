/**
 * EduSpace — Global Version Indicator (Bộ Chỉ báo & Kiểm soát Phiên bản Toàn hệ thống)
 * Generated at: 2026-07-01 22:27
 * 
 * Tác dụng:
 *   • Khai báo số hiệu phiên bản hiện tại của ứng dụng.
 *   • Tự động tạo và hiển thị huy hiệu phiên bản (Version Badge) cao cấp ở góc dưới cùng giữa trang.
 *   • Giúp nhà phát triển và học viên dễ dàng nhận diện và đồng bộ phiên bản mới nhất của hệ thống.
 * 
 * Định dạng: ver:<năm (2025=0, 2026=1)>.<tháng>.<ngày>.<giờ><phút>
 */
(function () {
    const VERSION = "ver:1.7.1.2227"

    function injectVersionBadge() {
        if (document.getElementById('nd-version-badge')) return;

        // Create style tag for beautiful premium styling
        const style = document.createElement('style');
        style.id = 'nd-version-badge-css';
        style.textContent = `
            #nd-version-badge {
                position: fixed !important;
                bottom: 16px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                z-index: 2147483647 !important;
                padding: 5px 14px !important;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                font-size: 10.5px !important;
                font-weight: 700 !important;
                color: #475569 !important;
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(226, 232, 240, 1) !important;
                border-radius: 99px !important; /* Rounded pill style */
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05), 
                            0 1px 3px rgba(0, 0, 0, 0.02) !important;
                pointer-events: none !important; /* Clicks pass through */
                user-select: none !important;
                letter-spacing: 0.5px !important;
                transition: opacity 0.3s ease !important;
            }
            /* Subtle dark mode support */
            @media (prefers-color-scheme: dark) {
                #nd-version-badge {
                    background: rgba(30, 41, 59, 0.95) !important;
                    color: #cbd5e1 !important;
                    border-color: rgba(71, 85, 105, 0.8) !important;
                }
            }
        `;
        document.head.appendChild(style);

        // Create the badge element
        const badge = document.createElement('div');
        badge.id = 'nd-version-badge';
        badge.textContent = VERSION;

        document.body.appendChild(badge);
    }

    if (document.body) {
        injectVersionBadge();
    } else {
        document.addEventListener('DOMContentLoaded', injectVersionBadge);
    }
})();
