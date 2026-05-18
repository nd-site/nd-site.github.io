/**
 * ND Labs & EduSpace Global Version Indicator
 * Generated at: 2026-05-18 16:45
 * Version format: ver:<năm (2025=0)>.<tháng>.<ngày>.<giờ><phút>
 */
(function () {
    const VERSION = "ver:1.5.18.1645";

    function injectVersionBadge() {
        if (document.getElementById('nd-version-badge')) return;

        // Create style tag for beautiful premium styling
        const style = document.createElement('style');
        style.id = 'nd-version-badge-css';
        style.textContent = `
            #nd-version-badge {
                position: fixed !important;
                bottom: 12px !important;
                right: 12px !important;
                z-index: 2147483647 !important;
                padding: 4px 10px !important;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                font-size: 10px !important;
                font-weight: 700 !important;
                color: #64748b !important;
                background: rgba(248, 250, 252, 0.75) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(226, 232, 240, 0.8) !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 
                            0 1px 2px rgba(0, 0, 0, 0.02) !important;
                pointer-events: none !important; /* Clicks pass through */
                user-select: none !important;
                letter-spacing: 0.5px !important;
                transition: opacity 0.3s ease !important;
            }
            /* Subtle dark mode support */
            @media (prefers-color-scheme: dark) {
                #nd-version-badge {
                    background: rgba(15, 23, 42, 0.75) !important;
                    color: #94a3b8 !important;
                    border-color: rgba(51, 65, 85, 0.8) !important;
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
