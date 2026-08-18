# UI_UX_STANDARD.md — Orbit Translate

## 0. Design Language — Minimalism (Flat), KHÔNG dùng Neumorphism

> Quyết định đã chốt, Agent không tự ý đổi sang phong cách khác (glassmorphism, neumorphism, skeuomorphism...) khi chưa được duyệt.

Lý do: popup phải hiển thị đè lên nền của hàng nghìn trang web khác nhau (sáng/tối/màu tuỳ ý) qua Shadow DOM. Neumorphism phụ thuộc vào shadow đôi khớp với 1 màu nền cụ thể → vỡ layout, kém contrast, không đạt AA accessibility, và tốn render hơn không cần thiết — đi ngược tinh thần "nhanh hơn Simple Translate".

Quy tắc cụ thể khi code:
- Nền phẳng (`--surface-2` cho card popup), **không** dùng box-shadow đôi (inset + outset) kiểu neumorphism.
- Phân tách khối bằng **border 1px hoặc hairline divider**, không dựa vào shadow để tạo độ nổi.
- Shadow chỉ dùng 1 lớp nhẹ cho chính popup nổi trên trang web (VD: `0 8px 24px rgba(0,0,0,.12)`), không dùng cho từng element con bên trong.
- Border-radius nhất quán 8-12px (đã quy định ở §4), không bo tròn quá lớn kiểu "soft blob".
- Icon: outline style (không filled, không 3D/skeuomorphic).

## 1. Nguyên tắc UX cốt lõi
Sản phẩm cạnh tranh trực tiếp với Simple Translate — điểm khác biệt duy nhất là **popup phải "biết nhiều hơn nhưng không làm chậm user"**. Nếu popup chậm hơn hoặc rối hơn Simple Translate, user quay lại tool cũ ngay.

**Quy tắc vàng**: Layer 1 (nghĩa + phát âm) hiện ngay lập tức. Mọi thứ khác (grammar, synonyms, SRS hint) là **progressive disclosure** — không nhồi hết vào 1 lần nhìn.

## 2. Extension Popup — Cấu trúc thông tin (3 lớp)

**Lớp 1 — luôn hiện, không cần thao tác thêm** (đây là thứ quyết định tốc độ cảm nhận):
- Nghĩa tiếng Việt
- IPA + nút phát âm

**Lớp 2 — hiện nếu user đã bật trong Settings** (optional toggles theo đúng yêu cầu):
- Contextual example (1 câu, không phải danh sách dài)
- Difficulty badge (A1-C2, màu sắc phân biệt — xem bảng màu §4)
- Spaced Repetition hint dạng 1 dòng nhỏ, không nổi bật: *"Bạn đã gặp từ này 3 lần tuần qua"*

**Lớp 3 — cần click "Xem thêm" mới hiện**:
- Grammar breakdown
- Synonyms/antonyms/collocations

Lý do tách lớp 3 riêng: đây là nội dung tốn không gian và không phải ai cũng cần mỗi lần tra từ — ép hiện mặc định sẽ làm popup nặng, chậm cảm nhận, đi ngược lại điểm mạnh cốt lõi so với Simple Translate.

## 3. Nút "Save" — thao tác quan trọng nhất trong toàn bộ product
Đây là hành động biến "dịch rồi quên" thành "dịch rồi nhớ" — toàn bộ giá trị sản phẩm nằm ở đây, UI phải:
- 1 click, luôn ở vị trí cố định (VD: góc phải popup), không đổi vị trí giữa các lần dịch.
- Có feedback tức thì (icon đổi trạng thái, không cần toast/notification riêng).
- Không yêu cầu thêm bước nào khác (không popup "chọn category" — AI tự phân loại ở background).

## 4. Design Tokens

### Màu theo Difficulty (CEFR)
| Level | Màu | Ý nghĩa |
|---|---|---|
| A1-A2 | `#4ADE80` (xanh lá nhạt) | Dễ |
| B1-B2 | `#FBBF24` (vàng cam) | Trung bình |
| C1-C2 | `#F87171` (đỏ nhạt) | Khó |

Không dùng đỏ/xanh gắt (kiểu "đúng/sai") — đây là thang độ khó, không phải đánh giá đúng sai, tránh gây cảm giác tiêu cực khi gặp từ khó.

### Typography
- Font UI: hệ thống (San Francisco/Segoe/Roboto tuỳ OS) — không tự host font riêng cho extension, tránh tăng bundle size không cần thiết.
- Từ tiếng Anh: monospace nhẹ hoặc font có hỗ trợ tốt IPA symbols (VD: Inter, đã test tốt với ký tự IPA).

### Spacing & Size popup
- Popup width cố định 320-360px — không auto-resize theo nội dung dài (tránh giật layout khi Lớp 2/3 load xong sau).
- Border-radius nhất quán 8-12px toàn bộ component.

## 5. Shadow DOM & CSS Isolation (bắt buộc kỹ thuật, ảnh hưởng trực tiếp UX)
- Toàn bộ style của popup PHẢI nằm trong Shadow DOM riêng — không leak ra ngoài, và ngược lại không bị site host override (kể cả các site có CSS aggressive như Medium/NYTimes).
- Test bắt buộc trước khi release feature UI: Wikipedia, Medium, NYTimes, BBC (đúng theo `ARCHITECTURE.md`/plan gốc) + ít nhất 1 trang tiếng Việt phổ biến (VD: VnExpress) vì layout RTL/font tiếng Việt có thể ảnh hưởng vị trí popup.

## 6. WebApp Dashboard — nguyên tắc riêng

- **Vocabulary Hub**: mặc định sort theo "mới học gần đây", cho phép filter theo CEFR/topic/source — nhưng KHÔNG để mặc định là 1 bảng dữ liệu khô khan kiểu spreadsheet, ưu tiên card layout gợi cảm giác "bộ sưu tập" hơn.
- **Review/Quiz mode**: full-screen, distraction-free (giống Anki/Quizlet), ẩn navigation chính trong lúc ôn tập để tránh user thoát giữa chừng.
- **Streak/progress**: hiển thị rõ ràng nhưng không dùng dark pattern kiểu ép buộc (không dùng thông báo tội lỗi "bạn đã bỏ lỡ 3 ngày!") — tạo động lực tích cực, không tạo áp lực tiêu cực.

## 7. Accessibility tối thiểu cho MVP
- Toàn bộ nút bấm trong popup có `aria-label`.
- Contrast ratio tối thiểu AA cho text trên popup (đặc biệt vì popup có thể đè lên nền sáng/tối tuỳ trang web — cần có background riêng, không transparent).
- Audio pronunciation phải có phương án fallback (nếu Text-to-Speech API lỗi, ẩn nút thay vì hiện nút chết).

## 8. Nguyên tắc chống "feature creep" trong UI
Mỗi khi thêm 1 toggle/tính năng mới vào popup, tự hỏi: *"Cái này có làm chậm lớp 1 (nghĩa + IPA) không?"* Nếu có → phải đẩy xuống lớp 2/3, không được đánh đổi tốc độ cảm nhận của tính năng cốt lõi.
