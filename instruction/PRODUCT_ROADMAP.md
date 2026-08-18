# PRODUCT_ROADMAP.md — Orbit Translate

## 1. Nguyên tắc scope
MVP phải trả lời được câu hỏi: *"User có thực sự quay lại webapp để ôn tập không, hay chỉ dùng phần dịch rồi bỏ?"* — đây là rủi ro giả định lớn nhất. Toàn bộ Phase 1 tối ưu để đo được điều này càng sớm càng tốt, không phải để "đủ tính năng".

## 2. Phase 1 — MVP (mục tiêu: launch trong 6-8 tuần với 1-2 người)

### Must-have
- [ ] Extension: select-to-translate từ đơn (Instant Layer), IPA + audio.
- [ ] Extension: nút Save (từ + câu ngữ cảnh + URL nguồn).
- [ ] Extension: Spaced Repetition hint đơn giản (đếm số lần gặp từ trong 7 ngày).
- [ ] Backend: Deep Dissection async job — CEFR tagging + topic tagging cho từ đã lưu.
- [ ] WebApp: Vocabulary Hub (list từ đã lưu, filter theo ngày/CEFR).
- [ ] WebApp: Flashcard mode dùng FSRS (không cần Quiz đa dạng ngay).
- [ ] WebApp: Export CSV format chuẩn Quizlet (copy 1-click).
- [ ] Auth: Google OAuth qua Supabase.
- [ ] Freemium giới hạn: daily AI call quota cho free tier.

### Explicitly NOT trong Phase 1
- Full Webpage Parser / phân tích cả trang.
- Dịch đoạn văn dài + grammar breakdown cho cả đoạn (chỉ dịch từ đơn + câu ngữ cảnh ngắn).
- Multi-language ngoài EN-VN.
- Quiz mode đa dạng (Multiple Choice, Type-the-word, Fill-in-blank) — chỉ Flashcard trước.
- Quizlet API auto-sync.
- Subscription/payment thật (chỉ cần giới hạn quota, chưa cần Stripe).
- Mobile app.

### Success metric để quyết định đi tiếp Phase 2
- % user quay lại webapp ôn tập trong 7 ngày sau khi cài extension (target gợi ý: >20% là tín hiệu tốt cho edtech tool).
- Số từ trung bình/user/tuần được lưu.

## 3. Phase 2 (chỉ làm sau khi có tín hiệu retention từ Phase 1)

- Dịch đoạn văn + Grammar breakdown đầy đủ.
- Full Webpage Parser (cần UI reader mode riêng — tốn nhiều effort UI, không làm sớm).
- Quiz modes đầy đủ (Multiple Choice, Type-the-word, Context Fill-in-blank).
- Subscription thật (Stripe/PayOS/VNPay tuỳ target user VN hay quốc tế).
- Mở rộng multi-language.
- Quizlet 2 chiều import/export, có thể xét thêm Anki `.apkg` export.

## 4. Phase 3 (ý tưởng xa, chưa cam kết)
- Social/leaderboard giữa bạn bè.
- Mobile app (React Native, share logic FSRS với webapp qua package chung).
- Browser khác ngoài Chrome (Firefox/Edge) — Plasmo hỗ trợ sẵn nên effort thấp hơn dự kiến, có thể cân nhắc sớm hơn Phase 3 nếu rẻ.

## 5. Rủi ro cần theo dõi liên tục
| Rủi ro | Mitigation |
|---|---|
| Chi phí AI vượt kiểm soát khi scale free tier | Cache-first + quota cứng theo user (xem `ARCHITECTURE.md` §4) |
| User dùng để dịch nhưng không quay lại ôn tập (core risk) | Đo retention sớm, không build thêm feature dịch trước khi có tín hiệu ôn tập tốt |
| Quizlet không có public API ổn định | Không phụ thuộc — 1-click CSV copy là đủ cho MVP, SRS native là lợi thế cạnh tranh dài hạn |
| CSS conflict trên site lớn làm hỏng trải nghiệm, mất trust ngay từ đầu | Test bắt buộc trên 4-5 site lớn trước mỗi release (xem `UI_UX_STANDARD.md` §5) |
