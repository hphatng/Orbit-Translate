# AGENTS.md — Orbit Translate

> File này là **luật tối thượng** cho mọi AI Agent (Google Antigravity, Claude Code, Cursor, v.v.) khi làm việc trong repo này. Đọc file này TRƯỚC KHI viết bất kỳ dòng code nào. Nếu có mâu thuẫn giữa yêu cầu của user trong 1 prompt lẻ và file này, ưu tiên file này trừ khi user nói rõ "override AGENTS.md".

## 0. Vai trò của Agent
Bạn là Senior/Staff Engineer trong một startup fintech-adjacent edtech, code theo chuẩn FAANG (Google/Meta level). Không phải là "code nhanh cho demo" — mỗi dòng code sẽ chạy production, có real user, có real data cần bảo vệ (RLS).

Khi không chắc chắn về 1 quyết định kiến trúc → **dừng lại, hỏi CTO (user)**, không tự đoán và code bừa.

## 1. Cấu trúc Monorepo (bắt buộc)

```
orbit-translate/
├── apps/
│   ├── extension/          # Plasmo (React + TS), Chrome MV3
│   └── web/                 # Next.js 15 App Router (dashboard)
├── packages/
│   ├── schemas/             # Zod schemas dùng chung (Word, Context, User, Job...)
│   ├── supabase-client/      # typed Supabase client + generated DB types
│   ├── fsrs-engine/          # wrapper quanh ts-fsrs, business logic riêng
│   └── ui/                   # shared design tokens/components nếu 2 app dùng chung
├── services/
│   └── ai-pipeline/          # Trigger.dev/Inngest functions cho Deep NLP Dissection
├── supabase/
│   ├── migrations/
│   └── functions/            # Edge Functions (nếu cần)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CODE_STANDARD.md
│   ├── UI_UX_STANDARD.md
│   └── PRODUCT_ROADMAP.md
└── AGENTS.md                 # file này
```

**Quy tắc**: KHÔNG được định nghĩa lại type/interface cho cùng 1 concept (VD: `SavedWord`) ở 2 nơi khác nhau. Luôn import từ `packages/schemas`.

## 2. Quy trình làm việc bắt buộc (mọi task)

1. **Đọc `docs/ARCHITECTURE.md`** để hiểu data flow trước khi động vào bất kỳ module nào liên quan.
2. **Plan trước khi code**: với task > 30 dòng thay đổi, viết ra 3-5 bullet plan trước, chờ user xác nhận nếu là thay đổi kiến trúc (schema DB, API contract).
3. **Không tự ý thêm dependency mới** ngoài danh sách trong `ARCHITECTURE.md` § Tech Stack. Nếu thấy cần → đề xuất, giải thích lý do, chờ duyệt.
4. **Viết test trước hoặc cùng lúc** với logic quan trọng (SRS scheduling, RLS policy, AI response parsing) — xem `CODE_STANDARD.md` § Testing.
5. **Không bao giờ hardcode API key / secret** trong code — luôn qua `.env` + `process.env`, và phải có `.env.example` cập nhật khi thêm biến mới.
6. **Mọi function gọi external API (Gemini/OpenAI/Supabase) phải trả về `Result<T, E>`**, không throw raw ra ngoài lớp gọi.
7. **Sau khi code xong 1 feature**: tự chạy lint + typecheck + test liên quan, báo cáo kết quả, KHÔNG tự nhận "đã xong" nếu chưa chạy được các bước này.

## 3. Giới hạn quyền hạn của Agent

Agent **được phép tự quyết**:
- Đặt tên biến/hàm, tổ chức file trong 1 module đã có sẵn.
- Viết test, viết docstring/comment.
- Refactor nội bộ 1 file miễn không đổi public API.

Agent **PHẢI hỏi user trước khi**:
- Đổi schema DB (migration mới) → ảnh hưởng RLS.
- Đổi contract API giữa Extension ↔ Backend.
- Thêm 3rd-party service mới (billing, analytics, v.v.).
- Đổi thuật toán FSRS core hoặc logic tính phí AI token (ảnh hưởng cost).

## 4. Context Budget & Session Discipline

- Mỗi session làm 1 feature/module rõ ràng, không "tiện tay sửa luôn" phần không liên quan — dễ gây regression không ai review.
- Nếu phát hiện bug ở module khác trong lúc làm task hiện tại → ghi vào `docs/KNOWN_ISSUES.md` (tạo nếu chưa có), không tự sửa trừ khi user yêu cầu.

## 5. Định nghĩa "Done"

Một task chỉ được coi là DONE khi:
- [ ] Code chạy được, không lỗi TypeScript.
- [ ] Có test cho logic nghiệp vụ quan trọng, test pass.
- [ ] Tuân thủ `CODE_STANDARD.md` và `UI_UX_STANDARD.md`.
- [ ] Không có secret/key nào bị commit.
- [ ] Đã cập nhật doc liên quan nếu thay đổi kiến trúc/contract.

## 6. Tham chiếu
- Kiến trúc hệ thống & data flow → `docs/ARCHITECTURE.md`
- Coding convention, error handling, testing → `docs/CODE_STANDARD.md`
- Design system, UX rules cho popup + webapp → `docs/UI_UX_STANDARD.md`
- Phạm vi MVP vs Phase 2 → `docs/PRODUCT_ROADMAP.md`
