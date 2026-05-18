/**
 * EduSpace AI Data Modal Proxy (data_modal.js)
 * Backward-compatibility wrapper for window.eduspaceAI.
 * All API handling and Firebase DB operations have been separated into /assets/js/api-service.js.
 */

// Dynamically inject api-service.js if not already loaded to maintain backward compatibility
(function() {
    if (typeof window.eduspaceAI === 'undefined' || !window.eduspaceAI.call) {
        if (document.readyState === 'loading') {
            document.write('<script src="/assets/js/api-service.js"></script>');
        } else {
            const script = document.createElement('script');
            script.src = '/assets/js/api-service.js';
            script.async = false;
            document.head.appendChild(script);
        }
    }
})();

// Elegant fallback proxy to prevent timing issues for synchronous callers
const eduspaceAI = {
    call: async function(payload) {
        let retries = 0;
        // Wait up to 2.5 seconds for api-service.js to load and instantiate window.eduspaceAI
        while ((typeof window.eduspaceAI === 'undefined' || window.eduspaceAI.call === this.call) && retries < 50) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }
        if (typeof window.eduspaceAI !== 'undefined' && window.eduspaceAI.call !== this.call) {
            return await window.eduspaceAI.call(payload);
        }
        throw new Error("Không thể khởi tạo dịch vụ kết nối API (api-service.js). Vui lòng tải lại trang.");
    }
};

// ONLY expose globally if window.eduspaceAI is not already defined by api-service.js
if (typeof window.eduspaceAI === 'undefined' || !window.eduspaceAI.call || window.eduspaceAI.call === eduspaceAI.call) {
    window.eduspaceAI = eduspaceAI;
}
