/**
 * Hàm đọc và xử lý tệp JSON
 */
function processFile() {
    const fileInput = document.getElementById('jsonFile');
    const resultsDiv = document.getElementById('results');
    const file = fileInput.files[0];

    if (!file) {
        resultsDiv.innerHTML = '<p class="placeholder" style="color: #fe2c55;">Vui lòng chọn một tệp JSON để xem Wrapped.</p>';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            displayWrapped(data, resultsDiv);
        } catch (e) {
            resultsDiv.innerHTML = '<p class="placeholder" style="color: #fe2c55;">Lỗi: Tệp không phải là JSON hợp lệ hoặc có cấu trúc không đúng.</p>';
        }
    };

    reader.readAsText(file);
}

/**
 * Hàm hiển thị dữ liệu wrapped
 * LƯU Ý: Cấu trúc JSON của TikTok Wrapped thực tế có thể khác,
 * đây là ví dụ minh họa cách hiển thị một số trường cơ bản.
 */
function displayWrapped(data, resultsDiv) {
    // Xóa nội dung cũ
    resultsDiv.innerHTML = '<h2>🎉 Tổng Kết TikTok Wrapped Của Bạn 🎉</h2>';

    let htmlContent = '';

    // --- Ví dụ 1: Tổng thời gian xem (Giả định trường "TotalTimeSpent") ---
    // (Lưu ý: Bạn cần biết chính xác cấu trúc dữ liệu JSON TikTok của mình)
    if (data.TotalTimeSpent) {
        htmlContent += `
            <div class="wrapped-section">
                <h3>⏰ Tổng Thời Gian Xem</h3>
                <p>Bạn đã dành **${data.TotalTimeSpent}** để xem video TikTok.</p>
                <p>Đây là một con số **ấn tượng**!</p>
            </div>
        `;
    }

    // --- Ví dụ 2: Lượt thích nhiều nhất (Giả định trường "MostLikedVideoCategory") ---
    if (data.MostLikedVideoCategory) {
        htmlContent += `
            <div class="wrapped-section">
                <h3>💖 Thể Loại Yêu Thích Nhất</h3>
                <p>Bạn đã like nhiều video nhất trong thể loại: **${data.MostLikedVideoCategory}**.</p>
            </div>
        `;
    }

    // --- Ví dụ 3: 5 tài khoản được xem nhiều nhất (Giả định trường "TopCreators") ---
    if (Array.isArray(data.TopCreators) && data.TopCreators.length > 0) {
        let topCreatorsList = '<ul>';
        data.TopCreators.slice(0, 5).forEach((creator, index) => {
            topCreatorsList += `<li>**#${index + 1}:** ${creator}</li>`;
        });
        topCreatorsList += '</ul>';

        htmlContent += `
            <div class="wrapped-section">
                <h3>🌟 Top 5 Creator Được Xem Nhiều Nhất</h3>
                ${topCreatorsList}
            </div>
        `;
    }
    
    // Nếu không có dữ liệu cụ thể nào được tìm thấy
    if (htmlContent === '') {
         htmlContent = `
            <p class="placeholder">Không tìm thấy các trường dữ liệu Wrapped cụ thể trong tệp JSON của bạn (TotalTimeSpent, MostLikedVideoCategory, TopCreators).</p>
            <p class="placeholder">Vui lòng kiểm tra lại cấu trúc dữ liệu.</p>
        `;
    }

    resultsDiv.innerHTML += htmlContent;
}

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('jsonFile');
    const dropText = document.getElementById('dropText');

    // 1. Kích hoạt input file khi click vào dropZone
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 2. Lắng nghe sự kiện chọn tệp (khi dùng hộp thoại)
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            processFile(fileInput.files[0]);
            dropText.textContent = `Đã chọn tệp: ${fileInput.files[0].name}. Đang xử lý...`;
        }
    });

    // 3. Xử lý Kéo & Thả (Drag and Drop)
    
    // Ngăn chặn mặc định
    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Xử lý khi thả tệp
    window.handleDrop = function(event) {
        event.preventDefault();
        dropZone.classList.remove('drag-over');

        const files = event.dataTransfer.files;

        if (files.length > 0 && files[0].name.endsWith('.json')) {
            processFile(files[0]);
            dropText.textContent = `Đã thả tệp: ${files[0].name}. Đang xử lý...`;
        } else {
            document.getElementById('results').innerHTML = '<p class="placeholder" style="color: #fe2c55;">⚠️ Vui lòng thả một tệp JSON hợp lệ.</p>';
            dropText.textContent = 'Chỉ chấp nhận tệp JSON. Thử lại.';
        }
    }

    // Khởi tạo text ban đầu
    dropText.textContent = 'Kéo & thả tệp JSON vào đây, hoặc nhấn để chọn tệp.';
});


/**
 * Hàm đọc và xử lý tệp JSON (đã cập nhật để nhận file trực tiếp)
 */
function processFile(file) {
    const resultsDiv = document.getElementById('results');

    if (!file) {
        resultsDiv.innerHTML = '<p class="placeholder" style="color: #fe2c55;">Vui lòng chọn một tệp JSON để xem Wrapped.</p>';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            displayWrapped(data, resultsDiv);
        } catch (e) {
            resultsDiv.innerHTML = '<p class="placeholder" style="color: #fe2c55;">Lỗi: Tệp không phải là JSON hợp lệ hoặc có cấu trúc không đúng.</p>';
        }
    };

    reader.readAsText(file);
}

/**
 * Hàm hiển thị dữ liệu wrapped (Giữ nguyên)
 */
function displayWrapped(data, resultsDiv) {
    // ... (Giữ nguyên nội dung hàm displayWrapped đã sửa ở lần trước)
    // Tôi sẽ không dán lại toàn bộ để giữ mã súc tích, bạn chỉ cần giữ nguyên phần này.
    
    // ... nội dung từ script.js (lần 2)
    resultsDiv.innerHTML = '<h2>🔥 Vòng Lặp Wrapped 🔥</h2>';

    let htmlContent = '';

    // --- Ví dụ 1: Tổng thời gian xem ---
    if (data.TotalTimeSpent) {
        htmlContent += `
            <div class="wrapped-section">
                <h3>⏳ Tổng Thời Gian Lướt</h3>
                <p>Bạn đã dành **${data.TotalTimeSpent}** để lướt xem video.</p>
                <p>Bạn đúng là một **Trendsetter** chính hiệu! ✨</p>
            </div>
        `;
    }

    // --- Ví dụ 2: Lượt thích nhiều nhất ---
    if (data.MostLikedVideoCategory) {
        htmlContent += `
            <div class="wrapped-section">
                <h3>💡 Chủ Đề Thu Hút Nhất</h3>
                <p>Bạn đã "thả tim" nhiều nhất cho nội dung về: **${data.MostLikedVideoCategory}**.</p>
                <p>Xem ra đây là sở thích bất tận của bạn! ❤️</p>
            </div>
        `;
    }

    // --- Ví dụ 3: 5 tài khoản được xem nhiều nhất ---
    if (Array.isArray(data.TopCreators) && data.TopCreators.length > 0) {
        let topCreatorsList = '<ol style="padding-left: 20px;">';
        data.TopCreators.slice(0, 5).forEach((creator, index) => {
            const icon = index === 0 ? '👑' : '🔥';
            topCreatorsList += `<li>${icon} **${creator}** (Top ${index + 1})</li>`;
        });
        topCreatorsList += '</ol>';

        htmlContent += `
            <div class="wrapped-section">
                <h3>🎤 Top Creator Của Bạn</h3>
                ${topCreatorsList}
                <p>Những người sáng tạo đã chiếm sóng màn hình của bạn.</p>
            </div>
        `;
    }
    
    // Nếu không có dữ liệu cụ thể nào được tìm thấy
    if (htmlContent === '') {
         htmlContent = `
            <p class="placeholder">Không tìm thấy dữ liệu Wrapped theo định dạng mẫu. Hãy chắc chắn tệp JSON chứa các trường như: **TotalTimeSpent, MostLikedVideoCategory, TopCreators**.</p>
            <p class="placeholder">Bắt đầu lại quá trình Lên Xu Hướng nào! 🚀</p>
        `;
    }

    resultsDiv.innerHTML += htmlContent;
}