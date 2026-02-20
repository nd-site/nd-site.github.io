# Digital Giao Thừa Experience 2026

Một trải nghiệm web cinematic theo tinh thần **sang trọng – ấm áp – hiện đại – truyền thống Việt Nam**, thiết kế để có thể nâng cấp thành landing page thương hiệu.

## 1) Kiến trúc đề xuất

- **Stack:** HTML/CSS/ES Modules thuần để chạy nhẹ trên GitHub Pages, không cần build step.
- **State management:** finite state machine (`stateMachine.js`) để kiểm soát story flow, countdown và celebration mà không reload trang.
- **Render strategy:**
  - Canvas nền (`backgroundCanvas`) cho bụi vàng ambient.
  - Canvas pháo hoa (`fireworksCanvas`) chỉ khởi tạo bằng `dynamic import()` khi vào celebration mode (lazy load).
  - DOM/CSS cho scene layer, câu đối và lời chúc cá nhân hoá.
- **Audio:** Web Audio API tạo ambience + firework pulse để tránh tải file âm thanh lớn.
- **Performance:** adaptive quality theo mobile/reduced-motion, giới hạn số particle, tách animation khỏi logic business.

## 2) Cấu trúc thư mục

```txt
tet-2026/
├─ index.html
├─ styles.css
├─ README.md
└─ js/
   ├─ app.js           # Orchestrator: state flow, countdown, UX events
   ├─ stateMachine.js  # Finite state machine dùng chung
   ├─ scene.js         # Parallax, blossom, ambient dust + WebAudio
   └─ fireworks.js     # Fireworks particle engine (lazy loaded)
```

## 3) Story flow

1. **Intro Cinematic**: màn đen + bụi vàng + copy "Tết đang về…"
2. **Countdown** (nếu trước mốc): cập nhật realtime tới `01/01/2026 00:00:00` local.
3. **Digital Tết Scene**: parallax + lantern sway + blossom drift.
4. **Câu đối thư pháp**: SVG stroke reveal + ink bleed filter.
5. **Wish cá nhân hoá**: nhập tên, animate glow/scale.
6. **Celebration Mode**: bật pháo hoa, lặp theo chu kỳ hợp lý, không reload.

## 4) Triển khai production

### Deploy trên GitHub Pages

- Đặt thư mục `tet-2026` trong repo Pages.
- Truy cập: `https://<your-domain>/tet-2026/`.
- Vì không có backend/build, chỉ cần commit và push.

### Nếu muốn scale thành campaign thực thụ

- Dùng Next.js + ISR để có CMS cho nội dung lời chúc.
- Tách config (palette, copy, timeline) thành JSON remote.
- Thêm analytics events cho conversion funnel (intro complete, name submit, share click).
- Dùng CDN + cache-control cho asset media nặng.

## 5) Tối ưu thêm

- Thêm worker cho simulation pháo hoa trên thiết bị mạnh.
- Thêm device profiling (FPS sampling) để hạ/đẩy quality runtime.
- Bổ sung tính năng `Share URL` chứa tên cá nhân hoá qua query string.
- Tạo preset style theo vùng miền (mai/đào, typography, âm sắc).
