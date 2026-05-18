/**
 * ND Labs & EduSpace — Global Notification Ticker System
 * 
 * Tác dụng:
 *   • Tự động hiển thị thanh thông báo màu đỏ (red ticker) chạy chữ ngang từ phải qua trái.
 *   • Nằm ngay dưới thanh điều hướng (navbar), căn chỉnh theo phạm vi trung tâm để đảm bảo bố cục đẹp.
 *   • Tự động điều chỉnh khoảng trống đệm (spacer) của navbar để không đè lên nội dung trang.
 *   • Hỗ trợ nhiều thông báo chạy tuần tự liên tục (thông báo 1 hết sẽ tới thông báo 2...).
 * 
 * Hướng dẫn chỉnh sửa & Thêm liên kết tương tác:
 *   • Thêm, bớt hoặc sửa các thông báo trong mảng `ANNOUNCEMENTS` ngay phía dưới.
 *   • Có thể chèn mã HTML <a> để tạo link. Sử dụng class `nd-ticker-link` để định dạng đẹp.
 *   • Ví dụ: "Trải nghiệm ngay <a href='/duong-dan' class='nd-ticker-link'>tại đây</a>!"
 */

(function () {
  // DANH SÁCH CÁC THÔNG BÁO CHẠY NGANG (Dễ dàng thêm/sửa/xóa ở đây)
  const ANNOUNCEMENTS = [
    "Thông báo toàn hệ thống ND Labs! Hiện tại hệ thống tài khoản Auth và hệ thống trí tuệ nhân tạo AI trên nền tảng Web ND Labs đang được bảo trì. Chúng tôi sẽ cố gắng khắc phục sớm nhất có thể! Cảm ơn quý vị đã thông cảm!",
    "EduSpace by ND Labs vừa thêm vào hệ thống các bài thi thử TN THPT QG năm 2026. <a href='/eduspace/thptqg/2026/index.html' class='nd-ticker-link'>Trải nghiệm ngay tại đây!</a>"
  ];

  // Lọc lấy các thông báo thực tế hợp lệ (không rỗng)
  const validAnnouncements = (ANNOUNCEMENTS || []).map(a => a.trim()).filter(a => a.length > 0);

  const TICKER_H = 34; // Chiều cao thanh thông báo

  // CSS của thanh thông báo chạy chữ Premium
  const css = `
    #nd-ticker-bar {
      position: fixed !important;
      top: 50px !important; /* Ngay dưới navbar (50px) */
      left: 0 !important;
      right: 0 !important;
      height: ${TICKER_H}px !important;
      background: linear-gradient(90deg, #dc2626, #b91c1c) !important; /* Đỏ premium */
      z-index: 99999 !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15) !important;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
      display: flex !important;
      align-items: center !important;
      border-bottom: 1px solid #991b1b !important;
      box-sizing: border-box !important;
    }

    #nd-ticker-inner {
      max-width: 1200px !important; /* Khớp với giới hạn chiều rộng của navbar */
      width: 100% !important;
      margin: 0 auto !important;
      padding: 0 16px !important;
      display: flex !important;
      align-items: center !important;
      height: 100% !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    #nd-ticker-label {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      background: rgba(255, 255, 255, 0.18) !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      font-size: 10px !important;
      letter-spacing: 0.5px !important;
      margin-right: 12px !important;
      flex-shrink: 0 !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      text-transform: uppercase !important;
    }

    #nd-ticker-track {
      flex: 1 !important;
      overflow: hidden !important;
      height: 100% !important;
      position: relative !important;
      display: flex !important;
      align-items: center !important;
    }

    #nd-ticker-text {
      position: absolute !important;
      white-space: nowrap !important;
      color: #ffffff !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      will-change: transform !important;
    }

    /* Định dạng liên kết tương tác Premium trong dòng chữ chạy */
    .nd-ticker-link {
      color: #fef08a !important; /* Màu vàng sáng sang trọng nổi bật */
      text-decoration: underline !important;
      font-weight: 800 !important;
      margin-left: 6px !important;
      transition: color 0.2s ease !important;
      pointer-events: auto !important; /* Đảm bảo có thể click được */
    }
    .nd-ticker-link:hover {
      color: #ffffff !important;
    }
  `;

  let currentIndex = 0;
  let tickerTextEl = null;
  let tickerTrackEl = null;

  function injectTicker() {
    // Nếu không có bất kỳ thông báo hợp lệ nào, ẩn/hủy thanh ticker và đặt spacer về 50px chuẩn
    if (validAnnouncements.length === 0) {
      const existingBar = document.getElementById('nd-ticker-bar');
      if (existingBar) existingBar.remove();

      const spacer = document.getElementById('nd-navbar-spacer');
      if (spacer) {
        spacer.style.setProperty('height', '50px', 'important');
      }
      return;
    }

    if (document.getElementById('nd-ticker-bar')) return;

    // Inject CSS
    const style = document.createElement('style');
    style.id = 'nd-ticker-css';
    style.textContent = css;
    document.head.appendChild(style);

    // Tạo thanh thông báo
    const bar = document.createElement('div');
    bar.id = 'nd-ticker-bar';

    const inner = document.createElement('div');
    inner.id = 'nd-ticker-inner';

    // Nhãn Tin Mới
    const label = document.createElement('div');
    label.id = 'nd-ticker-label';
    label.innerHTML = `<span>📢</span> <span>Thông báo</span>`;

    // Khung chạy chữ
    const track = document.createElement('div');
    track.id = 'nd-ticker-track';

    const textSpan = document.createElement('div');
    textSpan.id = 'nd-ticker-text';

    track.appendChild(textSpan);
    inner.appendChild(label);
    inner.appendChild(track);
    bar.appendChild(inner);

    // Gắn vào DOM ngay dưới navbar
    const navbar = document.getElementById('nd-navbar');
    if (navbar) {
      navbar.parentNode.insertBefore(bar, navbar.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    tickerTextEl = textSpan;
    tickerTrackEl = track;

    // Tăng chiều cao của spacer navbar lên 50px + 34px = 84px để không đè nội dung trang
    const spacer = document.getElementById('nd-navbar-spacer');
    if (spacer) {
      spacer.style.setProperty('height', '84px', 'important');
    }

    startTicker();
  }

  function startTicker() {
    if (!tickerTextEl || !tickerTrackEl || validAnnouncements.length === 0) return;

    const text = validAnnouncements[currentIndex];
    tickerTextEl.innerHTML = text;

    const trackWidth = tickerTrackEl.offsetWidth;
    const textWidth = tickerTextEl.scrollWidth;

    // Thiết lập vị trí bắt đầu (bên phải ngoài màn hình của khung track)
    tickerTextEl.style.transform = `translateX(${trackWidth}px)`;
    tickerTextEl.style.transition = 'none';

    // Kích hoạt reflow
    tickerTextEl.offsetHeight;

    // Tính toán thời gian dựa trên tốc độ chạy (80px/giây)
    const speed = 80;
    const totalDistance = trackWidth + textWidth;
    const duration = totalDistance / speed;

    // Bắt đầu hiệu ứng chạy chữ mượt mà
    tickerTextEl.style.transition = `transform ${duration}s linear`;
    tickerTextEl.style.transform = `translateX(-${textWidth}px)`;

    // Đăng ký sự kiện chạy hết chữ để chuyển sang tin tiếp theo
    tickerTextEl.addEventListener('transitionend', onTickerComplete, { once: true });
  }

  function onTickerComplete() {
    if (validAnnouncements.length === 0) return;
    currentIndex = (currentIndex + 1) % validAnnouncements.length;
    startTicker();
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.body) {
    injectTicker();
  } else {
    document.addEventListener('DOMContentLoaded', injectTicker);
  }
})();
