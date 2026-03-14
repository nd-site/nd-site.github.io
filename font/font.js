/**
 * font.js - Central Font Management for EduSpace
 * Purpose: Dynamically injects font styles to all pages.
 * To use: Add <script src="/font/font.js"></script> to any HTML <head>.
 */

(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @font-face {
            font-family: 'Play';
            src: url('/font/font-play/Play-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'Play';
            src: url('/font/font-play/Play-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
        }

        /* System-wide font override */
        * {
            font-family: 'Play', sans-serif !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('EduSpace: Font system loaded (Play).');
})();
