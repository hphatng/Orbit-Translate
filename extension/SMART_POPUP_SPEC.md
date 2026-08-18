# SMART_POPUP_SPEC.md — Giao diện dịch thông minh (Selected-to-Translate Popup)

> Đặc tả này bổ sung cho `docs/UI_UX_STANDARD.md` (nguyên tắc 3 lớp thông tin) và `docs/ARCHITECTURE.md` (data flow). Agent code phần popup PHẢI đọc cả 3 file trước khi triển khai.
>
> Mockup tham chiếu: xem ảnh/preview UI trong session làm việc — cấu trúc, spacing, và hành vi bật/tắt trong file này mô tả chính xác mockup đó.

## 1. Vấn đề đang sửa so với bản hiện tại

Screenshot bản hiện tại cho thấy 2 lỗi UX cần sửa:
1. **Grammar breakdown và Related words luôn hiện full**, không có cách thu gọn → popup quá cao, chiếm gần hết màn hình dù user chỉ cần tra nghĩa nhanh.
2. **Không có Contextual Example** dù đây là tính năng đã cam kết trong blueprint.

→ Nguyên tắc sửa: mọi mục ngoài Lớp 1 (nghĩa + IPA) phải **có thể tắt hẳn qua Settings** (ẩn hoàn toàn khỏi DOM, không chỉ ẩn UI) **và** với Grammar/Related words, khi đã bật thì vẫn **thu gọn mặc định dạng accordion** (Lớp 3).

## 2. Cấu trúc 3 lớp — ánh xạ vào 6 tính năng

| Lớp | Tính năng | Trạng thái mặc định khi bật | Có thể tắt hẳn qua Settings? |
|---|---|---|---|
| 1 (luôn hiện) | Nghĩa dịch (chậm lại) | Luôn hiện, không toggle | Không |
| 2 (hiện phẳng nếu bật) | IPA + phát âm | Hiện | Có |
| 2 | Difficulty rating (badge CEFR) | Hiện | Có |
| 2 | Contextual example | Hiện | Có |
| 2 | Spaced Repetition hint | Hiện | Có |
| 3 (accordion, thu gọn mặc định) | Grammar breakdown | Ẩn (đóng), chỉ hiện tiêu đề + chevron | Có |
| 3 (accordion, thu gọn mặc định) | Related words (synonyms/antonyms) | Ẩn (đóng), chỉ hiện tiêu đề + chevron | Có |

## 3. Đặc tả từng tính năng

### 3.1 IPA pronunciation + Audio
- **Nguồn dữ liệu**: trả về cùng lúc với Instant Translate response (không gọi API riêng, để giữ < 300ms).
- **UI**: `/IPA/` + icon loa cạnh nó, cùng hàng với từ gốc.
- **Audio**: dùng Web Speech API (`SpeechSynthesisUtterance`) làm fallback miễn phí cho MVP; nếu sau này có TTS chất lượng cao hơn (Google TTS) thì thay ở tầng service, UI không đổi.
- **Khi tắt**: ẩn toàn bộ dòng IPA, dòng "chậm lại" (translation) dịch lên sát dưới từ gốc, không để lại khoảng trống.
- **Edge case**: nếu AI không trả được IPA (từ hiếm/cụm từ dài) → ẩn cả icon loa, không hiện `//` trống.

### 3.2 Contextual example
- **Nguồn dữ liệu**: Deep Dissection async job — KHÔNG chờ lúc Instant Translate, vì tốn token. Lúc đầu popup hiện placeholder skeleton (1 dòng xám nhấp nháy nhẹ), thay bằng câu ví dụ thật khi job trả về (thường 1-3s sau, qua realtime subscription của Supabase hoặc polling ngắn).
- **UI**: 1 câu duy nhất, từ khoá được bôi đậm trong câu, kèm nhãn nguồn nhỏ bên dưới (VD: "Nguồn: corpus ngữ cảnh"). Không hiện danh sách nhiều câu ví dụ — đúng nguyên tắc "1 ví dụ, không phải nhiều".
- **Khi tắt**: không gọi phần prompt sinh example trong Deep Dissection job (tiết kiệm token thật, không chỉ ẩn UI) — xem §5 quy tắc cost.
- **Edge case**: nếu AI không sinh được ví dụ phù hợp → ẩn cả section, không hiện "Không có ví dụ".

### 3.3 Grammar breakdown
- **Nguồn dữ liệu**: Deep Dissection async job, chỉ phân tích khi user **mở accordion lần đầu** nếu muốn tối ưu chi phí hơn nữa (lazy-load), hoặc phân tích sẵn cùng lúc với example nếu chi phí chấp nhận được — quyết định này để CTO (bạn) chọn ở bước triển khai, mặc định đề xuất: **phân tích sẵn cùng batch với CEFR tagging** (rẻ hơn gọi AI 2 lần), chỉ ẩn UI bằng accordion.
- **UI**: accordion đóng mặc định, tiêu đề "Phân tích ngữ pháp" + icon + chevron. Click để mở, có transition chiều cao mượt (không giật).
- **Khi tắt (Settings)**: ẩn hẳn cả tiêu đề accordion, không chỉ đóng nó lại.
- **Nội dung**: 1 câu giải thích ngắn (dạng "slowed = quá khứ của to slow (verb) → ..."), không viết dài dòng — đây là hint nhanh, không phải bài học ngữ pháp đầy đủ.

### 3.4 Difficulty rating (CEFR badge)
- **Nguồn dữ liệu**: Deep Dissection job, field `cefr_level` (A1-C2).
- **UI**: badge nhỏ góc phải trên, màu theo bảng đã chốt trong `UI_UX_STANDARD.md` §4 (xanh lá A1-A2, vàng cam B1-B2, đỏ nhạt C1-C2).
- **Khi tắt**: ẩn badge, layout dòng "từ gốc + nút Lưu" dịch sang phải lấp khoảng trống (không để hở).
- **Edge case**: trong lúc chờ Deep Dissection job trả kết quả (từ mới lưu lần đầu), hiện badge dạng skeleton xám thay vì không hiện gì — tránh layout nhảy khi kết quả về.

### 3.5 Related words (synonyms/antonyms)
- **Nguồn dữ liệu**: Deep Dissection job, cùng batch với grammar.
- **UI**: accordion đóng mặc định giống Grammar breakdown, tối đa hiện 3-4 từ mỗi nhóm (đồng nghĩa/trái nghĩa), dạng pill nhỏ, không phải link (chỉ để đọc, không cần click — tránh nhầm là nút chức năng).
- **Khi tắt**: ẩn hẳn accordion này.
- **Edge case**: nếu không có trái nghĩa (từ trung tính) → ẩn hẳn dòng "Trái nghĩa", không hiện "None" như bản hiện tại (chữ "None" gây cảm giác thiếu sót, không cần thiết).

### 3.6 Spaced Repetition hint
- **Nguồn dữ liệu**: query nhanh `review_schedule` + `review_logs` theo `word_id` khi mở popup cho 1 từ đã từng lưu trước đó. Nếu là từ hoàn toàn mới (chưa từng lưu) → không hiện section này (không có gì để hint).
- **UI**: nền xám nhạt phân biệt với phần trên, 1 dòng ngắn ("Bạn đã gặp từ này N lần tuần qua · Ôn tập tiếp theo: X ngày nữa") + nút "Ôn tập" mở webapp dashboard ở tab mới.
- **Khi tắt**: ẩn hẳn section + nút.

## 4. Quy tắc Responsive khi bật/tắt (bắt buộc AI Agent tuân thủ khi code)

1. **Không dùng `visibility: hidden` hay `opacity: 0`** cho các mục bị tắt trong Settings — phải là loại bỏ khỏi render tree (React: return `null`/conditional render; không dùng CSS ẩn) để không để lại khoảng trắng.
2. **Popup có `max-width` cố định (336-340px), height tự động theo nội dung** — không set height cố định, không set `min-height` giả để "cho đẹp".
3. **Đổi trạng thái toggle → re-render ngay, có transition chiều cao mượt** (200-250ms) cho khối bị ẩn/hiện để tránh giật cục — nhưng KHÔNG animate cho lần render đầu tiên khi popup mới mở (chỉ animate khi user chủ động toggle trong Settings).
4. **Thứ tự các section cố định** dù bật/tắt bao nhiêu mục: Header → Từ gốc + IPA → Bản dịch → Ví dụ → Grammar (accordion) → Related words (accordion) → SRS hint. Không đảo thứ tự theo việc mục nào đang bật, tránh gây rối vì user quen vị trí.
5. **Accordion Grammar/Related**: trạng thái đóng/mở là **per-session**, không lưu persist — mỗi lần mở popup mới, accordion về trạng thái đóng mặc định.
6. **Toggle Settings**: trạng thái bật/tắt của 6 tính năng **lưu vào `chrome.storage.sync`** (đồng bộ giữa các máy user đăng nhập cùng tài khoản Chrome), không lưu vào Supabase — đây là preference cục bộ của extension, không phải dữ liệu học tập.

## 5. Ràng buộc Cost (liên kết với `ARCHITECTURE.md` §4)

Khi user tắt 1 tính năng thuộc Lớp 2/3 dựa trên AI (Contextual example, Grammar, Related words, Difficulty), Deep Dissection job **phải kiểm tra Settings của user trước khi build prompt** và loại phần tương ứng ra khỏi prompt gửi AI — không gọi AI sinh dữ liệu rồi mới ẩn ở UI. Đây là quy tắc bắt buộc, không phải tối ưu tuỳ chọn, vì ảnh hưởng trực tiếp chi phí vận hành freemium.

## 6. Zod Schema tham chiếu (đặt trong `packages/schemas/popup.ts`)

```typescript
export const PopupSettingsSchema = z.object({
  showIpaAudio: z.boolean().default(true),
  showContextExample: z.boolean().default(true),
  showGrammarBreakdown: z.boolean().default(true),
  showDifficultyRating: z.boolean().default(true),
  showRelatedWords: z.boolean().default(true),
  showSrsHint: z.boolean().default(true),
});

export const InstantTranslateResponseSchema = z.object({
  word: z.string(),
  translation: z.string(),
  ipa: z.string().nullable(),
});

export const WordAnalysisSchema = z.object({
  wordId: z.string(),
  cefrLevel: z.enum(["A1","A2","B1","B2","C1","C2"]).nullable(),
  contextExample: z.string().nullable(),
  grammarNote: z.string().nullable(),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
});
```

## 7. Definition of Done cho phần popup này
- [ ] Cả 6 toggle hoạt động, tắt = biến mất khỏi DOM (kiểm tra bằng DevTools, không chỉ nhìn bằng mắt).
- [ ] Popup test trên Wikipedia/Medium/NYTimes/BBC/VnExpress không vỡ layout (theo `UI_UX_STANDARD.md` §5).
- [ ] Deep Dissection job không gọi AI cho phần tính năng đã tắt trong Settings của user đó.
- [ ] Accordion Grammar/Related đóng mặc định mỗi lần mở popup mới.
- [ ] Không có trường hợp nào hiện "None"/"N/A" trống — luôn ẩn hẳn section nếu không có dữ liệu.
