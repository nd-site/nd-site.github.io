# 🍂 PoemND — Nền Tảng Học Thuộc Thơ Thông Minh & Mạng Xã Hội Thơ
> **Tên đầy đủ:** PoemND by ND Labs  
> **Công nghệ:** React (TSX) + Tailwind CSS + TypeScript + Firebase (Firestore/Auth/Hosting) + Google Gemini API (Free Tier)

---

## 📖 I. Giới Thiệu
**PoemND (by ND Labs)** là ứng dụng web động, real-time mang tính cách mạng kết hợp giữa **mạng xã hội chia sẻ thơ ca** và **nền tảng học thuộc thơ thông minh bằng khoa học não bộ (Cognitive Mnemonics)** kết hợp cùng **trí tuệ nhân tạo Gemini AI**.

### 🌟 Điểm Nhấn Thẩm Mỹ (UI/UX)
- **Gam màu chủ đạo:** Warm Autumn / Sáng mùa thu thanh nhã (`bg-amber-50`, `bg-orange-500`, điểm xuyết màu nâu gỗ trầm ấm `wood-800`).
- **Logo sáng tạo:** Chữ **Poem** uốn lượn thư pháp mang phong cách nghệ thuật cổ điển (*Dancing Script* / *Pacifico*) đi kèm hậu tố **ND by ND Labs**.
- **Phong cách:** Thiết kế thẻ giấy thi ca (*Paper textured card*), animation mượt mà, responsive 100% trên cả Desktop, Tablet và Mobile.

---

## 🎯 II. 5 Chế Độ Học Thuộc Thơ Thông Minh Độc Quyền

| Chế độ | Cơ chế khoa học | Trải nghiệm người dùng |
| :--- | :--- | :--- |
| **1. Lấp chỗ trống (Cloze Mode)** | Active Recall & Retrieval Practice | Tùy chọn ẩn 25%, 50%, 75% hoặc 100%. Hỗ trợ 2 phương thức: Chạm để hé lộ (*Tap to Reveal*) hoặc Thử thách gõ phím tự kiểm tra (*Type to Fill*). |
| **2. Chữ cái đầu (First-Letter Mode)** | Cognitive Initials Priming | Giữ lại ký tự đầu tiên của từng từ (`S M x r T T ơ`), kích thích não bộ tự tái tạo dòng thơ. Tích hợp Text-To-Speech luyện đọc nhẩm. |
| **3. Ngắt nhịp Karaoke (Rhythm & Flow)** | Auditory Rhythm Entrainment | Dựa trên thuộc tính `rhythm` (ví dụ `4/3`, `2/3`, `2/2/3`), hệ thống phân tách câu thành cụm nhịp trực quan và chạy Karaoke highlight theo nhịp phách. |
| **4. Flashcard 2 mặt (Visual Cues & Rhyme)** | Dual-Coding Theory (Hình ảnh + Ngôn từ) | Mặt 1 là sơ đồ gieo vần (`rhymeMapping`) tô màu trực quan; Mặt 2 là hình tượng nghệ thuật thị giác (`visualCue`) làm mỏ neo ký ức. |
| **5. Ghép câu đảo dòng (Scramble Puzzle)** | Structural Memory Reconstruction | Xáo trộn thứ tự các câu trong khổ thơ; người học di chuyển để xếp đúng vị trí. Bắn pháo hoa ăn mừng khi đạt 100%. |

---

## 🤖 III. Tích Hợp Gemini AI & Định Dạng Dữ Liệu Chuẩn

Khi người dùng muốn thêm bất kỳ bài thơ nào (từ sách giáo khoa hay thơ tự sáng tác), hệ thống hỗ trợ 3 cách linh hoạt:

### 1. Cấu trúc JSON Schema chuẩn mà PoemND yêu cầu:
```json
{
  "title": "Tên bài thơ",
  "author": "Tác giả",
  "genre": "Thơ 7 chữ",
  "meaning": "Tóm tắt giá trị nghệ thuật và bối cảnh tác phẩm",
  "stanzas": [
    {
      "stanzaIndex": 1,
      "lines": [
        "Sông Mã xa rồi Tây Tiến ơi!",
        "Nhớ về rừng núi, nhớ chơi vơi."
      ],
      "rhythm": "4/3",
      "visualCue": "Dòng sông Mã cuồn cuộn chảy qua núi rừng Tây Bắc bảng lảng khói sương",
      "rhymeMapping": {
        "ơi": "A",
        "chơi vơi": "A"
      }
    }
  ]
}
```

### 2. Các phương thức thêm thơ:
- **Cách 1: Gemini API Tự động (1-Click):** Dán văn bản thô bất kỳ -> Gemini 1.5 Flash tự bóc tách khổ, nhịp, vần và hình tượng.
- **Cách 2: Gemini Web Miễn phí 100% (Không cần API Key):** Bấm nút **"Sao chép Prompt chuẩn"** -> Dán vào [gemini.google.com](https://gemini.google.com) -> Copy kết quả JSON dán vào ứng dụng.
- **Cách 3: Soạn thảo & Nhập JSON trực tiếp:** Hỗ trợ kiểm tra cú pháp và sửa đổi tức thì.

---

## ☁️ IV. Kiến Trúc Lưu Trữ Miễn Phí (Free Tier)

Hệ thống được thiết kế theo cơ chế **Hybrid Offline-First**:
1. **Firebase Firestore (Gói Spark Miễn phí):** Lưu trữ realtime các bài thơ cộng đồng, lượt thích (Like), sổ tay lưu trữ (Bookmarks) và bình luận thảo luận.
2. **Local Storage Fallback:** Nếu chưa cấu hình Firebase, ứng dụng vẫn hoạt động 100% đầy đủ chức năng với kho thơ mẫu kinh điển (Tây Tiến, Sóng, Đây Thôn Vĩ Dạ, Đồng Chí...).
3. **Web Speech API:** Tận dụng bộ tổng hợp giọng nói tiếng Việt miễn phí có sẵn trên mọi trình duyệt hiện đại.

---

## 🚀 V. Hướng Dẫn Khởi Chạy & Triển Khai

### 1. Khởi chạy trên máy cục bộ (Local Development)
```bash
# Di chuyển vào thư mục dự án
cd poemnd

# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi động máy chủ phát triển
npm run dev
```
Trình duyệt sẽ mở tại `http://localhost:5173`.

### 2. Thiết lập Biến Môi trường (Tùy chọn)
Tạo file `.env` từ `.env.example`:
```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=your-project-id
```
*(Bạn cũng có thể cấu hình trực tiếp từ giao diện bằng cách bấm nút bánh răng Cài đặt trên góc phải màn hình!)*

### 3. Đóng gói & Triển khai lên Firebase Hosting (Miễn phí)
```bash
# 1. Đóng gói bản build production
npm run build

# 2. Đăng nhập Firebase CLI (chỉ cần làm lần đầu)
npx firebase login

# 3. Khởi tạo và Deploy
npx firebase deploy --only hosting
```

---

*Phát triển với sự tận tâm bởi **ND Labs** — Tôn vinh vẻ đẹp thi ca Việt Nam.*
