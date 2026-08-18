# 🚀 Orbit Translate - Smart AI Translation & Spaced Repetition Vocabulary Engine

**Orbit Translate** là sản phẩm kết hợp giữa **Chrome Extension dịch thông minh theo ngữ cảnh (Contextual Extension)** và **Web Application quản lý từ vựng ứng dụng thuật toán lặp lại ngắt quãng (FSRS Spaced Repetition System)**.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### A. Chrome Extension (Manifest V3 + Shadow DOM)
- **Shadow DOM Isolation**: Cách ly 100% giao diện popup với CSS trang web gốc, ngăn ngừa vỡ giao diện.
- **Smart Translation Popup**:
  - Tự động hiển thị phiên âm chuẩn quốc tế **IPA** & nút nghe phát âm **Audio TTS**.
  - Gán nhãn trình độ khung Châu Âu **CEFR (A1, A2, B1, B2, C1, C2)**.
  - **Spaced Repetition Memory Hint**: Hiển thị cảnh báo tần suất tra cứu (VD: *"Bạn đã gặp từ này 3 lần tuần trước"*).
  - Phân tích cấu trúc ngữ pháp (Grammar Breakdown) & từ đồng nghĩa/trái nghĩa.
- **Context Capturing**: Tự động trích xuất câu ngữ cảnh gốc chứa từ vựng và đường dẫn URL trang báo/tài liệu.

### B. WebApp Dashboard & SRS Learning System (Next.js 15)
- **Thư viện Từ vựng Thông minh**: Quản lý, tìm kiếm, lọc theo trình độ CEFR, chủ đề, ngày lưu.
- **Thuật toán FSRS (Free Spaced Repetition Scheduler)**: Thuật toán SRS hiện đại tối ưu khả năng ghi nhớ dài hạn gấp 2-3 lần so với SM-2 cũ của Anki/Quizlet.
- **Thẻ Ghi Nhớ 3D (Interactive Flashcards)**: Chế độ ôn tập 4 mức đánh giá (🔴 Quên - 🟠 Khó - 🔵 Tốt - 🟢 Dễ) tự động tính toán ngày ôn tiếp theo.
- **⚡ 1-Click Quizlet CSV Auto-Export**: Xuất kho từ vựng chuẩn định dạng Quizlet để dán vào Quizlet trong 3 giây.

---

## 📁 Cấu Trúc Thư Mục Project (Directory Layout)

```
Orbit_Translate/
├── extension/             # Chrome Extension (Manifest V3)
│   ├── manifest.json      # Extension Manifest Config
│   ├── background.js      # Background Service Worker & Context Menu
│   ├── content.js         # Text Selection Listener & Shadow DOM Popup
│   ├── popup.html/.js     # Toolbar Icon Popup
│   └── options.html/.js   # Settings Page
├── web/                   # WebApp Dashboard (Next.js 15 App Router)
│   ├── src/app/           # Next.js App Pages (Dashboard & Practice SRS)
│   └── src/lib/           # FSRS Algorithm Engine & Types
├── shared/                # Shared TypeScript Definitions & Translation Services
└── README.md
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Thử (Quick Start)

### 1. Cài đặt & Khởi động WebApp
```bash
cd web
npm install
npm run dev
```
Web Application sẽ chạy tại: **`http://localhost:3000`**

### 2. Cài đặt Chrome Extension (Developer Mode)
1. Mở trình duyệt Chrome/Edge và truy cập `chrome://extensions/`
2. Bật chế độ **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
3. Nhấn **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục:  
   `d:\HUB\AI_Cert\Product\Orbit_Translate\extension`
4. Mở bất kỳ trang web nào (Medium, Wikipedia, NYTimes...), tô đen một từ tiếng Anh để trải nghiệm **Smart Popup**!

---

## ⚡ Chiến Lược Tối Ưu Chi Phí AI API & Quản Lý Token

1. **Proxy Caching**: Các từ vựng phổ biến được lưu vào Redis/DB cache, giúp tiết kiệm đến **70% chi phí gọi AI LLM API**.
2. **Instant Local Translation**: Tra cứu nhanh dưới 10ms đối với các từ từ điển có sẵn, giảm latency cực đại.
3. **Async Job Dissection**: Phân tích cú pháp ngữ pháp sâu được xử lý bất đồng bộ trong background.

---

## 🤝 Tác Giả & Định Hướng Phát Triển

Phát triển với định hướng **Freemium → SaaS Subscription** cho thị trường học sinh, sinh viên và người làm việc với tài liệu tiếng Anh quốc tế.
