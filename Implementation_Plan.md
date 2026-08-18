# Extension ↔ WebApp Synchronization System

## Technical Audit

### Current Extension → Supabase Flow
- **SAVE_VOCABULARY** handler in `background.js:240-277`: saves locally to `chrome.storage.local` (`vocabularies` array), then fire-and-forget `POST` to `http://localhost:3000/api/extension/sync`
- **No authentication token** is sent with the sync request
- **No offline queue** — if the POST fails, data is lost server-side
- **No deduplication** — each save creates a new DB row (no UPSERT)
- **No idempotency** — same word saved twice creates duplicate records

### Current WebApp → Supabase Flow
- [supabaseService.ts](file:///d:/HUB/AI_Cert/Product/Orbit_Translate/web/src/lib/services/supabaseService.ts): client-side queries using `createClient()` (browser Supabase)
- Uses **hardcoded UUID** `'00000000-0000-0000-0000-000000000000'` in dashboard layout and study-hub — no real auth-based user resolution
- Falls back to `MOCK_DATA` when Supabase returns empty or errors

### Current Authentication Mechanism
- **WebApp**: Supabase Auth via `@supabase/ssr` (server + client), OAuth callback at `/auth/callback`
- **Extension→WebApp auth**: `externally_connectable` in manifest allows `localhost:3000` and `*.orbittranslate.ai` to send messages via `chrome.runtime.sendMessage(extensionId, ...)`
- `background.js:175-186`: `onMessageExternal` handler stores `tokenData` in `chrome.storage.sync.orbitAuthToken`
- `options.js`: Connect button opens `http://localhost:3000/auth/extension-callback` (this route **does not exist yet**)
- **⚠️ CRITICAL**: The `orbitAuthToken` stored is just `{ email, fullName }` — **no Supabase access/refresh token**, so the extension cannot make authenticated Supabase calls

### Existing Vocabulary Schema
**Table `public.words`** (from migration 2):
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` |
| `user_id` | UUID | FK → `auth.users`, NOT NULL |
| `deck_id` | UUID | FK → `decks`, nullable |
| `term` | TEXT | NOT NULL |
| `phonetic` | TEXT | |
| `translation` | TEXT | NOT NULL |
| `cefr_level` | TEXT | |
| `part_of_speech` | TEXT | |
| `example_sentence` | TEXT | |
| `example_translation` | TEXT | |
| `context_text` | TEXT | |
| `grammar_breakdown` | TEXT | |
| `source_url` | TEXT | |
| `tags` | TEXT[] | DEFAULT `'{}'` |
| `fsrs_state` | JSONB | FSRS parameters |
| `next_review_at` | TIMESTAMPTZ | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

✅ **Reusable** — schema covers 90% of what we need.

### Existing SRS Schema
- `fsrs_state` JSONB column on `words` table
- [shared/fsrs.ts](file:///d:/HUB/AI_Cert/Product/Orbit_Translate/shared/fsrs.ts): Full FSRS v4 implementation with `scheduleReview()` and `createInitialSRSData()`
- [practice.ts](file:///d:/HUB/AI_Cert/Product/Orbit_Translate/web/src/app/actions/practice.ts): Server actions using FSRS correctly

### Existing Practice Mode Schema
- `practice_sessions` table (migration 3): tracks mode, status, score
- `practice_history` table (migration 3): logs per-question results
- Full RLS on both tables ✅

### Existing API Endpoints
- `POST /api/extension/sync` — **BROKEN**: uses anon key without auth, trusts `userId` from client (defaults to `00000000-...`), no UPSERT

### Existing RLS Policies
✅ All tables have proper RLS: `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE on `words`, `decks`, `folders`, `profiles`, `practice_sessions`, `practice_history`

### Missing Components for Extension ↔ WebApp Sync

| Component | Status |
|---|---|
| Extension auth callback page on WebApp | ❌ Missing |
| Supabase session token in Extension | ❌ Only stores name/email |
| Authenticated sync API route | ❌ Current route uses anon key |
| Offline sync queue | ❌ |
| Retry with exponential backoff | ❌ |
| Idempotent UPSERT | ❌ |
| Text normalization for dedup | ❌ |
| `normalized_text` column on words | ❌ |
| `source_type` column on words | ❌ |
| `lookup_count` column on words | ❌ |
| `client_event_id` for idempotency | ❌ |
| Extension sync status UI | ❌ |
| WebApp auth-based user resolution | ❌ Hardcoded UUID |
| Flashcard back side data flow | ⚠️ Works but `srs` mapping may be incomplete |

---

## Proposed Changes

> [!IMPORTANT]
> The user said "WAIT for no user confirmation" — proceeding with implementation after audit.

### Design Decisions

1. **Auth flow**: Extension opens WebApp page → user logs in → WebApp generates one-time pairing code → stores it in `extension_pairing_codes` table → Extension polls/receives the Supabase `access_token` + `refresh_token` securely via the existing `externally_connectable` mechanism → Extension creates an authenticated Supabase client using the public anon key + user token.

2. **Direct Supabase from Extension**: Since the Extension can hold the public anon key (already safe per Supabase architecture) and the user's JWT, it can call Supabase directly — no need to proxy through the WebApp API route for basic CRUD. This eliminates the broken `/api/extension/sync` route and uses RLS properly.

3. **Normalization**: Add `normalized_text` column. `UNIQUE(user_id, normalized_text, language_pair)` constraint prevents duplicates. UPSERT on conflict updates `lookup_count`, `last_seen_at`, and enriches data.

4. **Offline queue**: Pure `chrome.storage.local` queue with exponential backoff retry in background.js.

5. **WebApp user resolution**: Replace hardcoded UUID with `supabase.auth.getUser()` calls.

---

### Phase 1 — Database Migration (new migration #4)

#### [NEW] `supabase/migrations/20260816100000_sync_infrastructure.sql`

Add columns to `words`:
- `normalized_text TEXT` — lowercase trimmed Unicode-normalized
- `source_type TEXT DEFAULT 'EXTENSION'` — `EXTENSION | SCAN_EXTRACT | DOCUMENT_TRANSLATE | MANUAL`
- `source_title TEXT`
- `source_context TEXT`  
- `lookup_count INTEGER DEFAULT 1`
- `last_seen_at TIMESTAMPTZ`
- `client_event_id TEXT` — for idempotency

Add `UNIQUE` constraint: `(user_id, normalized_text)` on `words`

Add table `extension_pairing_codes`:
- `id UUID PK`
- `user_id UUID FK → auth.users`
- `code TEXT UNIQUE` — crypto-random 32-char
- `expires_at TIMESTAMPTZ`
- `used_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`
- RLS: user can only read their own codes

---

### Phase 2 — Extension Auth Flow

#### [NEW] `web/src/app/auth/extension-connect/page.tsx`
- Page that generates a pairing code for the logged-in user
- Stores code in `extension_pairing_codes` table (30-second TTL)
- Sends Supabase session tokens to Extension via `chrome.runtime.sendMessage(extensionId, ...)` using `externally_connectable`
- Immediately invalidates the pairing code after use

#### [MODIFY] `extension/background.js`
- `onMessageExternal` handler: Accept full Supabase session `{ access_token, refresh_token, user }` instead of just `{ email, fullName }`
- Store tokens securely in `chrome.storage.local` (not sync — tokens are too large for sync quota)
- Create a Supabase client instance from stored tokens
- Add token refresh logic

#### [NEW] `extension/sync-manager.js`
- `SyncManager` class: handles all Supabase communication
- `init()`: loads auth tokens, creates Supabase client
- `isAuthenticated()`: checks token validity
- `syncVocabulary(vocab)`: upserts to Supabase with idempotency
- `getAuthStatus()`: returns connection state
- `refreshToken()`: handles token refresh

#### [NEW] `extension/sync-queue.js`
- `SyncQueue` class: offline-first queue
- Queue stored in `chrome.storage.local` key `syncQueue`
- Items: `{ id, type, payload, status, retryCount, createdAt, lastAttemptAt }`
- Statuses: `PENDING → SYNCING → SYNCED / FAILED`
- Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, max 60s
- Max retries: 10
- `flush()`: processes pending items
- `add(event)`: adds item to queue
- Periodic flush every 30s when online

---

### Phase 3 — Extension Sync Integration

#### [MODIFY] `extension/background.js`
- SAVE_VOCABULARY handler: add vocab to SyncQueue instead of direct HTTP POST
- Import and initialize SyncManager + SyncQueue
- Add `GET_SYNC_STATUS` message handler
- Add `DISCONNECT_ACCOUNT` message handler

#### [MODIFY] `extension/popup.html` / `extension/popup.js`
- Show sync status: Connected/Guest/Syncing/Offline
- Show pending sync count
- Show last sync time

#### [MODIFY] `extension/content.js`
- Save button: show sync feedback (✓ Saved, ↻ Syncing, ✓ Synced)

---

### Phase 4 — WebApp Auth-Based Data Loading

#### [MODIFY] `web/src/app/(dashboard)/layout.tsx`
- Replace hardcoded UUID with real Supabase auth user
- Create server component wrapper that fetches user

#### [MODIFY] `web/src/lib/services/supabaseService.ts`
- Replace `userId` parameter pattern with auth-based queries (user from Supabase session)
- Remove mock data fallbacks for authenticated users

#### [MODIFY] `web/src/app/(dashboard)/study-hub/page.tsx`
- Load real user decks and words from authenticated Supabase session

---

### Phase 5 — Flashcard Fix & Practice Integration

#### [MODIFY] `web/src/app/actions/practice.ts`
- `fetchPracticeItems`: ensure `srs` field is properly mapped from `fsrs_state` JSONB
- Include `source_type` filter so Extension words are included

#### [MODIFY] `web/src/app/components/dashboard/practice/FlashcardMode.tsx`
- **Already works correctly**: front shows `word.term`, back shows `word.translation`
- The data flow issue is upstream — `VocabularyItem.srs` mapping from `fsrs_state` is inconsistent
- Fix: ensure `fetchPracticeItems` returns proper `srs` field (not the raw JSONB as `fsrs`)

#### [MODIFY] `web/src/lib/types.ts`
- Remove duplicate `fsrs` field on `VocabularyItem` — consolidate to `srs: SRSData`

---

### Phase 6 — Delete Broken Sync Route

#### [DELETE] `web/src/app/api/extension/sync/route.ts`
- This route is insecure (no auth, trusts client userId, uses anon key directly)
- Replaced by direct Extension → Supabase via authenticated client

---

## Verification Plan

### Automated Tests
- RLS policy tests via Supabase SQL (user A cannot read user B's words)
- UPSERT idempotency test (same `client_event_id` doesn't create duplicates)
- Normalization unit tests
- FSRS `scheduleReview` already has implicit coverage

### Manual Verification  
1. Install extension, connect account via WebApp
2. Save vocabulary from extension
3. Check it appears in WebApp study-hub
4. Run flashcard practice — verify front/back content
5. Rate a card — verify FSRS state updates in DB
6. Go offline, save vocab, reconnect — verify queue flushes
7. Save same word twice — verify UPSERT (no duplicate)
