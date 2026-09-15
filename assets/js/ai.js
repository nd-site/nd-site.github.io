/**
 * Deprecated: ai.js has been refactored into:
 *   - /assets/js/edu_ai.js (EduAI Assistant for EduSpace)
 *   - /assets/js/nd_ai.js (NDAI Assistant for ND Labs)
 * 
 * This file is maintained for backward compatibility.
 */
(function() {
    if (!document.querySelector('script[src*="edu_ai.js"]')) {
        const s = document.createElement('script');
        s.src = '/assets/js/edu_ai.js';
        s.defer = true;
        document.head.appendChild(s);
    }
})();
