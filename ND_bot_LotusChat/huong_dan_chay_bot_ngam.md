# Hướng dẫn chạy Bot ngầm (khi đã đóng IDE)

Để bot luôn hoạt động kể cả khi bạn đóng phần mềm lập trình (như Cursor/VSCode) hoặc tắt cửa sổ Terminal, cách tốt nhất là sử dụng một công cụ quản lý tiến trình (Process Manager) như **PM2**.

## 1. Cài đặt PM2
Mở terminal của bạn và chạy lệnh sau để cài đặt PM2 vào hệ thống máy tính (yêu cầu chạy dưới quyền Administrator nếu cần):
```bash
npm install -g pm2
```

## 2. Khởi chạy Bot bằng PM2

Hiện tại chúng ta đang có 2 phiên bản bot chạy cho 2 Token khác nhau (`chat_bot.js` và `chat_bot2.js`). 

Để khởi chạy ngầm cả hai bot này, hãy chạy các lệnh sau trong thư mục chứa mã nguồn (`d:\Project\ChatBot\ND_bot_LotusChat`):

```bash
# Chạy bot số 1
pm2 start chat_bot.js --name "LotusBot-1"

# Chạy bot số 2
pm2 start chat_bot2.js --name "LotusBot-2"
```

## 3. Các lệnh quản lý cơ bản của PM2

> [!TIP]
> PM2 giúp tự động khởi động lại bot nếu bị lỗi (crash) và giúp bạn xem log một cách cực kỳ dễ dàng.

Dưới đây là một số lệnh thường dùng bạn nên lưu lại:

- **Xem danh sách các bot đang chạy:**
  ```bash
  pm2 list
  ```
- **Xem nhật ký (logs) của bot để biết bot đang phản hồi ai:**
  ```bash
  pm2 logs
  ```
  *(nhấn `Ctrl + C` để thoát màn hình xem log)*

- **Dừng một bot:**
  ```bash
  pm2 stop LotusBot-1
  ```
- **Khởi động lại một bot:**
  ```bash
  pm2 restart LotusBot-1
  ```
- **Xoá bot khỏi PM2 (tắt hoàn toàn):**
  ```bash
  pm2 delete LotusBot-1
  ```

## 4. Tự động chạy bot khi khởi động lại máy tính (Tuỳ chọn)
Nếu bạn muốn máy tính mỗi khi bật lên là bot tự động chạy, bạn có thể thiết lập script khởi động của PM2:
```bash
pm2 save
pm2 startup
```
*(Hãy làm theo hướng dẫn trên màn hình sau khi gõ lệnh `pm2 startup`)*
