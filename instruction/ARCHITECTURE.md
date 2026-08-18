# ARCHITECTURE.md — Orbit Translate

## 1. Nguyên tắc thiết kế
1. **Instant path phải nhanh** (< 300ms cảm nhận): user bôi đen từ → thấy nghĩa ngay. Không được để bất kỳ AI call "nặng" nào nằm trên đường này.
2. **Deep analysis luôn async**: mọi thứ tốn token/thời gian (grammar breakdown, CEFR tagging) chạy nền, không block UI.
3. **RLS là tuyến phòng thủ chính**, không phải application-layer check. Mọi bảng chứa dữ liệu user phải có RLS policy trước khi có API route đọc/ghi nó.
4. **Cost-aware by default**: mọi lời gọi AI phải đi qua cache-check trước (xem §4).

## 2. Tech Stack chính thức (KHÔNG đổi nếu chưa được duyệt)

| Layer | Lựa chọn | Lý do |
|---|---|---|
| Extension | Plasmo (React + TS), Shadow DOM | MV3-ready, xử lý sẵn CSS isolation |
| WebApp | Next.js 15 App Router + Tailwind | Server Components, SEO cho landing page, quen thuộc |
| Monorepo | Turborepo + pnpm workspaces | Share type/schema giữa extension & web |
| DB & Auth | Supabase (Postgres + RLS + Auth) | Realtime, Auth built-in, free tier tốt |
| Validation | Zod (dùng chung trong `packages/schemas`) | Runtime + compile-time type safety |
| Instant AI | Gemini 1.5/2.0 Flash (fallback GPT-4o-mini) | Rẻ, nhanh, tốt cho EN-VN |
| Async Job Queue | Trigger.dev (hoặc Inngest) | Vượt giới hạn timeout serverless, retry tự động |
| Cache | Upstash Redis | Serverless, pay-per-request, không tự vận hành |
| SRS Algorithm | `ts-fsrs` | Implementation FSRS chuẩn, đã test kỹ |
| Hosting | Vercel (web) + Supabase Cloud | Zero-ops cho giai đoạn MVP |

## 3. Data Flow tổng quan

```
[User bôi đen từ/câu trên trang web]
        │
        ▼
Extension Content Script ──(1)──► Instant Translate Edge Function (Gemini Flash)
        │                                   │
        │                          check Upstash cache trước
        │                                   │
        ◄──────── trả nghĩa < 300ms ────────┘
        │
        │ (user chọn "Save")
        ▼
Extension ──(2)──► POST /api/words (word, context sentence, source URL, timestamp)
        │
        ▼
Supabase Postgres (bảng `saved_words`, RLS theo user_id)
        │
        │ trigger event
        ▼
Trigger.dev job "deep-dissection" ──(3)──► Gemini Flash (prompt phân tích sâu)
        │
        ▼
Ghi kết quả vào `word_analysis` (CEFR, topic, grammar, synonyms)
        │
        ▼
WebApp Dashboard đọc `saved_words` + `word_analysis` qua Supabase client (RLS tự lọc theo user)
        │
        ▼
FSRS Engine tính lịch ôn tập tiếp theo → bảng `review_schedule`
```

## 4. Cost Control Layer (quan trọng — đây là rủi ro lớn nhất của freemium AI product)

- **Cache-first**: trước khi gọi Gemini cho instant translate, check Upstash bằng key `hash(word + source_lang + target_lang)`. Từ vựng phổ thông sẽ trùng lặp cao giữa các user → tiết kiệm đáng kể.
- **Rate limit theo user_id + IP** ở tầng Edge Function, không chỉ dựa vào Gemini's own limit.
- **Token budget theo tier**: Free tier có `daily_ai_call_limit` lưu trong bảng `user_quota`, check trước mỗi lần gọi AI (không phải sau).
- Deep Dissection Job PHẢI ghi log `tokens_used` mỗi lần chạy để sau này build billing/analytics.

## 5. Database Schema (khung ban đầu — Agent triển khai chi tiết, không tự đổi tên bảng)

- `users` (quản lý bởi Supabase Auth)
- `user_quota` — free/paid tier, daily_calls_used, reset_at
- `saved_words` — id, user_id, word, context_sentence, source_url, source_lang, target_lang, created_at
- `word_analysis` — word_id (FK), cefr_level, topic_tags[], grammar_note, synonyms[], antonyms[], collocations[]
- `review_schedule` — word_id (FK), user_id, due_date, stability, difficulty, review_count (theo field chuẩn của FSRS)
- `review_logs` — mỗi lần user ôn tập, để tính lại FSRS

Mọi bảng có `user_id` → bắt buộc RLS policy `user_id = auth.uid()` trước khi merge PR.

## 6. API Contract giữa Extension ↔ Backend

Định nghĩa trong `packages/schemas/api.ts` bằng Zod, dùng chung cho cả request validation ở backend lẫn type ở extension. Không định nghĩa tay 2 lần.

Ví dụ nguyên tắc đặt tên endpoint:
- `POST /api/translate/instant` — instant path, có cache
- `POST /api/words` — lưu từ + trigger async job
- `GET /api/words?date=today` — cho popup hiển thị "hôm nay đã học N từ"
- `POST /api/export/quizlet` — sinh CSV theo format Quizlet

## 7. Phase 1 (MVP) vs Phase 2 — ràng buộc kiến trúc

Phase 1 KHÔNG build:
- Full Webpage Parser (tốn token, cần UI reader riêng).
- Multi-language ngoài EN-VN (schema đã để sẵn `source_lang`/`target_lang` nhưng logic chỉ cần chạy tốt EN↔VN).
- Quizlet auto-sync qua API (chỉ cần 1-click copy CSV).

Nhưng schema DB phải thiết kế để KHÔNG cần breaking migration khi mở rộng sang Phase 2 (VD: `topic_tags` là array ngay từ đầu, không phải string đơn).

## 8. Observability (tối thiểu cho MVP)
- Log mọi lỗi AI call (Gemini timeout/rate-limit) vào bảng `error_logs` hoặc qua Sentry free tier.
- Dashboard admin đơn giản (có thể chỉ là Supabase Studio) để theo dõi token usage theo ngày.
