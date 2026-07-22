/**
 * EduSpace — Media & File Storage Service
 * 
 * Tác dụng:
 *   • Quản lý việc tải hình ảnh người dùng (avatar), tài liệu và tệp thông tin lên đám mây.
 *   • Hỗ trợ tự động nén tối ưu ảnh sang định dạng WebP trước khi gửi đi.
 *   • Thông báo lỗi chung chung an toàn cho người dùng, bảo mật hệ thống backend.
 */

async function getImgBBKey() {
    let key = null;
    if (typeof window.getEduKeys === 'function') {
        try {
            const keys = await window.getEduKeys();
            if (keys && keys.imgbbApiKey && !keys.imgbbApiKey.includes('PLACEHOLDER')) {
                key = keys.imgbbApiKey;
            }
        } catch (_) {}
    }
    if (!key && typeof EDU_CONFIG !== 'undefined' && EDU_CONFIG.imgbbApiKey && !EDU_CONFIG.imgbbApiKey.includes('PLACEHOLDER')) {
        key = EDU_CONFIG.imgbbApiKey;
    }
    return key;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

window.uploadToImgBB = async function (file, customKey = null) {
    const key = customKey || (await getImgBBKey());
    if (!key) {
        throw new Error('Chưa cấu hình API Key lưu trữ.');
    }

    // Nén ảnh sang WebP trước khi upload
    let processedFile = file;
    if (file instanceof File && file.type.startsWith('image/')) {
        try {
            processedFile = await compressImageWebP(file, 800, 0.85);
        } catch (_) {}
    }

    // Chuyển file sang Base64 chuẩn cho ImgBB API (bỏ tiền tố data:image/...;base64,)
    let base64String = '';
    if (typeof processedFile === 'string') {
        base64String = processedFile.replace(/^data:image\/[a-z]+;base64,/, '');
    } else {
        const fullBase64 = await fileToBase64(processedFile);
        base64String = fullBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    }

    const formData = new FormData();
    formData.append('image', base64String);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        throw new Error('Lỗi máy chủ lưu trữ.');
    }

    const data = await res.json();
    if (data && data.success && data.data) {
        return data.data.display_url || data.data.url;
    }
    throw new Error('Không thể lưu hình ảnh.');
};

window.uploadToCloudflare = async function (file, options = {}) {
    if (!file) {
        throw new Error('Vui lòng chọn tệp để tải lên.');
    }

    const folder = options.folder || 'uploads';
    const uid = options.uid || 'guest';
    const filename = options.filename || `${uid}_${Date.now()}_${file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'file'}`;

    // 1. Kiểm tra cấu hình Cloudflare Worker Endpoint
    let workerUrl = null;
    try {
        if (typeof EDU_CONFIG !== 'undefined' && EDU_CONFIG.cloudflareWorkerUrl && !EDU_CONFIG.cloudflareWorkerUrl.includes('PLACEHOLDER')) {
            workerUrl = EDU_CONFIG.cloudflareWorkerUrl;
        }
        if (!workerUrl && typeof window.getEduKeys === 'function') {
            const keys = await window.getEduKeys();
            if (keys && keys.cloudflareWorkerUrl && !keys.cloudflareWorkerUrl.includes('PLACEHOLDER')) {
                workerUrl = keys.cloudflareWorkerUrl;
            }
        }
    } catch (_) {}

    // Nếu tệp là hình ảnh, tối ưu hóa kích thước trước khi tải lên
    let processedFile = file;
    if (file instanceof File && file.type.startsWith('image/')) {
        try {
            processedFile = await compressImageWebP(file, options.maxWidth || 800, options.quality || 0.85);
        } catch (_) {}
    }

    // Nếu đã cấu hình Cloudflare Worker Endpoint -> ưu tiên tải lên Cloudflare R2
    if (workerUrl) {
        try {
            const formData = new FormData();
            formData.append('file', processedFile, filename);
            formData.append('folder', folder);
            formData.append('uid', uid);
            if (options.extra) {
                formData.append('extra', JSON.stringify(options.extra));
            }

            const res = await fetch(workerUrl, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) return data.url;
                if (data.success && data.result?.url) return data.result.url;
            }
        } catch (_) {}
    }

    // 2. Tải qua dịch vụ lưu trữ ảnh ImgBB
    if ((file instanceof File && file.type.startsWith('image/')) || typeof file === 'string') {
        try {
            const uploadedUrl = await window.uploadToImgBB(processedFile);
            if (uploadedUrl) return uploadedUrl;
        } catch (_) {}
    }

    // 3. Fallback WebP Data URL
    if (file instanceof File && file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Lỗi xử lý hình ảnh.'));
            reader.readAsDataURL(processedFile);
        });
    }

    throw new Error('Không thể tải tệp lên.');
};

/**
 * Helper: Nén và chuyển đổi hình ảnh sang WebP bằng HTML5 Canvas
 */
function compressImageWebP(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], (file.name || 'image').replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas Error'));
                    }
                },
                'image/webp',
                quality
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}
