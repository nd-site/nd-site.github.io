(function () {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        #web-toast-container {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 100000;
            pointer-events: none;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .web-toast {
            background: rgba(15, 23, 42, 0.95);
            color: white;
            padding: 14px 28px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            animation: toastIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            font-weight: 600;
            font-size: 15px;
            pointer-events: auto;
            border: 1px solid rgba(255,255,255,0.1);
        }
        @keyframes toastIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .custom-confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100001;
            animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.id = 'web-toast-container';
    document.body.appendChild(container);

    // Override alert
    window.alert = function (message) {
        const toast = document.createElement('div');
        toast.className = 'web-toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = '0.4s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    };

    // Override confirm (Note: This is async-ish but we'll try to keep it simple)
    const nativeConfirm = window.confirm;
    // We can't easily make confirm synchronous, so we'll just show it. 
    // Most modern code should use async/await or we can just keep native confirm for now if it's too risky.
    // But the user wants "in-web". Let's provide a better alert first.

    window.showNotification = window.alert;
})();
