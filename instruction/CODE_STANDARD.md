# CODE_STANDARD.md — Orbit Translate

## 1. Nguyên tắc chung
Code phải đọc được bởi 1 engineer khác (hoặc bạn 6 tháng sau) mà không cần hỏi lại tác giả. Ưu tiên rõ ràng hơn "khôn khéo".

## 2. TypeScript — bắt buộc strict mode

```jsonc
// tsconfig.json (base, dùng chung qua packages/tsconfig)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```
Cấm dùng `any`. Nếu thực sự cần kiểu chưa xác định → dùng `unknown` + narrow bằng Zod.

## 3. Error Handling — Result<T> Pattern (bắt buộc cho mọi I/O)

Không dùng `try/catch` trần trong business logic. Wrap mọi call ra ngoài (AI API, Supabase, network) bằng kiểu `Result`:

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type AppError =
  | { kind: "RATE_LIMIT"; retryAfterMs: number }
  | { kind: "AI_TIMEOUT" }
  | { kind: "INVALID_INPUT"; issues: string[] }
  | { kind: "DB_ERROR"; cause: unknown };

async function translateInstant(
  word: string
): Promise<Result<Translation>> {
  const cached = await cache.get(word);
  if (cached) return { ok: true, value: cached };

  try {
    const res = await geminiClient.translate(word);
    return { ok: true, value: res };
  } catch (err) {
    if (isRateLimitError(err)) {
      return { ok: false, error: { kind: "RATE_LIMIT", retryAfterMs: 2000 } };
    }
    return { ok: false, error: { kind: "AI_TIMEOUT" } };
  }
}
```

Ở tầng UI (popup/extension), luôn xử lý cả 2 nhánh `ok`/không `ok` — không được để lỗi rơi ra console im lặng. Người dùng cuối phải thấy trạng thái hợp lý (VD: "Đang bận, thử lại sau" thay vì popup trống).

## 4. Validation — Zod ở mọi biên hệ thống
Mọi input từ extension → API, từ AI response → DB, đều phải parse qua Zod schema trong `packages/schemas` trước khi dùng. Không tin dữ liệu từ AI trả về là đúng format — luôn `safeParse` và có fallback.

## 5. Testing

| Loại | Bắt buộc cho |
|---|---|
| Unit test | FSRS scheduling logic, cost/cache logic, Zod schema edge cases |
| Integration test | RLS policies (mỗi bảng: user A không đọc được data user B) |
| E2E (Playwright) | Flow chính: select text → translate → save → xuất hiện trên dashboard |

Không merge code có test fail. Coverage không cần 100% nhưng **logic tính điểm FSRS và RLS phải có test**, không thương lượng.

## 6. Naming & Structure
- File: `kebab-case.ts`. Component React: `PascalCase.tsx`.
- Function xử lý nghiệp vụ: verb rõ ràng (`calculateNextReviewDate`, không phải `process`).
- Không đặt logic nghiệp vụ trong React component — tách ra `packages/*` hoặc `lib/` để test độc lập với UI.

## 7. Git Workflow
- Branch: `feature/xxx`, `fix/xxx`, `chore/xxx`.
- Commit message: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`).
- PR bắt buộc mô tả: (1) thay đổi gì, (2) tại sao, (3) đã test như thế nào.
- Không commit trực tiếp vào `main`.

## 8. Secrets & Config
- Mọi API key qua `.env`, không commit `.env` thật.
- `.env.example` phải luôn đồng bộ khi thêm biến môi trường mới.
- Client-side (extension) tuyệt đối không chứa secret key của Gemini/OpenAI — mọi call AI phải qua backend proxy.

## 9. Performance discipline (đặc biệt cho Extension)
- Content script không được block main thread của trang chủ (dùng debounce cho selection listener).
- Shadow DOM styles phải scoped hoàn toàn — test trên Wikipedia/Medium/NYTimes trước khi coi feature UI là "done" (xem thêm `docs/UI_UX_STANDARD.md`).
- Không fetch lại toàn bộ vocabulary list mỗi lần mở popup — cache local (IndexedDB/chrome.storage) và sync incremental.

## 10. AI-generated code review checklist (dành riêng cho code do Agent viết)
Trước khi coi 1 PR do AI Agent tạo là sẵn sàng merge, tự kiểm tra:
- [ ] Không có `any`, không có logic nghiệp vụ nhét trong component UI.
- [ ] Mọi external call có Result<T> + xử lý lỗi ở UI.
- [ ] Không có bảng DB mới thiếu RLS policy.
- [ ] Không có hardcoded string lặp lại 3+ lần (nên tách constant).
- [ ] Test đi kèm cho phần logic quan trọng, không chỉ test "happy path" cho có.
