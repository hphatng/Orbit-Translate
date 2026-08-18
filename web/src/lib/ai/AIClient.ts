/**
 * AIClient — single source of truth for AI calls in the Orbit Translate web app.
 *
 * Responsibilities:
 *  - Round-robin API key rotation
 *  - Per-key cooldown (with retry-after parsing) on 429 / quota
 *  - DEAD key marking on invalid key
 *  - Model fallback within a key (Pro → Flash → Flash-Latest)
 *  - Structured telemetry (NEVER logs raw API keys)
 *  - Strict JSON parsing + Zod schema validation
 *
 * NOT in this class:
 *  - Extraction prompt construction (see extractFromTextAI.ts)
 *  - Database persistence (see supabaseService.ts)
 *  - Key storage (keys come from `profiles.api_keys` JSONB column)
 *
 * Architecture constraint:
 *  - The web app uses this client. The Extension has its own runtime and
 *    its own rotation logic (background.js). We deliberately do NOT
 *    share code with the extension in this phase.
 */

import type { z } from 'zod';

// ============================================================
// TYPES
// ============================================================

export type KeyStatus = 'HEALTHY' | 'COOLDOWN' | 'DEAD';

export interface ApiKeyItem {
  id: string;
  name: string;
  /** The literal Gemini API key. NEVER log this field. */
  key: string;
  status?: KeyStatus;
  cooldownUntil?: number;
  lastUsedAt?: number;
}

export type ModelTier = 'document-extraction' | 'item-enrichment';

export interface ModelSpec {
  /** Gemini model id, used in the URL path. */
  id: string;
  /** Maximum output tokens to request. */
  maxOutputTokens: number;
  /** Sampling temperature. */
  temperature: number;
}

export interface AIClientConfig {
  /**
   * Ordered model preference for each tier. The client walks this list
   * for fallback. First entry is preferred.
   */
  models: Record<ModelTier, ModelSpec[]>;
  /** Cooldown duration fallback when Gemini does not return `retry-in`. */
  defaultCooldownMs: number;
  /** Max attempts per (key, model) pair before moving on. */
  maxRetriesPerKey: number;
  /** Max total attempts before giving up. */
  maxTotalAttempts: number;
}

export interface GenerateOptions<T> {
  /** Zod schema for the response. The client will validate. */
  responseSchema: z.ZodType<T>;
  /** System prompt. */
  systemPrompt: string;
  /** User prompt (concatenated with the document text by the caller). */
  userPrompt: string;
  /** Which tier to use. Drives model preference order. */
  tier: ModelTier;
}

export interface GenerateSuccess<T> {
  success: true;
  data: T;
  /** Telemetry. Safe to log. */
  meta: {
    keyId: string;
    model: string;
    latencyMs: number;
    attempts: number;
  };
}

export interface GenerateFailure {
  success: false;
  error: string;
  /** Telemetry. Safe to log. */
  meta: {
    attempts: number;
    lastErrorKind: 'validation' | 'quota' | 'invalid-key' | 'server' | 'network';
  };
}

export type GenerateResult<T> = GenerateSuccess<T> | GenerateFailure;

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_CONFIG: AIClientConfig = {
  models: {
    // Document-level extraction prefers fast, highly available models with high token limits.
    'document-extraction': [
      { id: 'gemini-flash-lite-latest', maxOutputTokens: 8192, temperature: 0.3 },
      { id: 'gemini-flash-latest', maxOutputTokens: 8192, temperature: 0.3 },
      { id: 'gemini-3.7-flash', maxOutputTokens: 8192, temperature: 0.3 },
      { id: 'gemini-pro-latest', maxOutputTokens: 8192, temperature: 0.3 },
    ],
    // Per-item enrichment prefers Flash-Lite for speed and cost.
    'item-enrichment': [
      { id: 'gemini-flash-lite-latest', maxOutputTokens: 2048, temperature: 0.2 },
      { id: 'gemini-flash-latest', maxOutputTokens: 2048, temperature: 0.2 },
    ],
  },
  defaultCooldownMs: 30_000,
  maxRetriesPerKey: 1,
  maxTotalAttempts: 15,
};

// ============================================================
// HELPERS
// ============================================================

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Mask an API key for safe logging. Returns the last 4 characters only.
 */
function maskKey(key: string): string {
  if (!key || key.length < 4) return '****';
  return `****${key.slice(-4)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiError {
  code?: number;
  message?: string;
  status?: string;
}

function isQuotaError(err: GeminiError): boolean {
  const m = (err.message ?? '').toLowerCase();
  return (
    err.code === 429 ||
    err.code === 503 ||
    m.includes('quota') ||
    m.includes('rate limit') ||
    m.includes('exhausted') ||
    m.includes('resource_exhausted') ||
    m.includes('high demand') ||
    m.includes('overloaded') ||
    m.includes('unavailable') ||
    m.includes('spikes in demand')
  );
}

function isInvalidKeyError(err: GeminiError): boolean {
  const m = (err.message ?? '').toLowerCase();
  return m.includes('api key not valid') || m.includes('permission_denied') || err.code === 403;
}

function parseRetryAfterMs(message: string | undefined, fallbackMs: number): number {
  if (!message) return fallbackMs;
  const m = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  if (m && m[1]) {
    return Math.max(1000, Math.ceil(parseFloat(m[1]) * 1000));
  }
  return fallbackMs;
}

// ============================================================
// CLIENT
// ============================================================

export class AIClient {
  private config: AIClientConfig;
  private keys: ApiKeyItem[];
  private cursor = 0;

  constructor(keys: ApiKeyItem[], config: Partial<AIClientConfig> = {}) {
    // Defensive copy so external mutation does not leak between clients/tests.
    this.keys = keys
      .filter((k) => !!k && !!k.key)
      .map((k) => ({
        id: k.id,
        name: k.name,
        key: k.key,
        status: k.status,
        cooldownUntil: k.cooldownUntil,
        lastUsedAt: k.lastUsedAt,
      }));
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** How many usable (HEALTHY or COOLDOWN-expired) keys we currently have. */
  public healthyKeyCount(): number {
    const now = Date.now();
    return this.keys.filter((k) => {
      if (!k.key) return false;
      if (k.status === 'DEAD') return false;
      if (k.status === 'COOLDOWN' && k.cooldownUntil && now < k.cooldownUntil) return false;
      return true;
    }).length;
  }

  /**
   * Execute one AI call with the configured fallback chain.
   * - Loops keys round-robin from a moving cursor.
   * - Within a key, walks the model preference list.
   * - On quota → mark COOLDOWN, jump to next key.
   * - On invalid key → mark DEAD, jump to next key.
   * - On validation error → return failure (no retry; caller decides).
   * - On other server error → try next model on same key, then next key.
   */
  public async generateStructured<T>(opts: GenerateOptions<T>): Promise<GenerateResult<T>> {
    if (this.keys.length === 0) {
      return {
        success: false,
        error: 'No API keys configured',
        meta: { attempts: 0, lastErrorKind: 'network' },
      };
    }

    const start = Date.now();
    let attempts = 0;
    let lastErrorKind: GenerateFailure['meta']['lastErrorKind'] = 'network';
    let lastError = 'Unknown error';

    // Wake expired cooldowns.
    this.refreshKeyStates();

    const models = this.config.models[opts.tier];
    const n = this.keys.length;

    // The starting key for this call. Cursor advances only at the END of
    // this call (or at the END of every iteration) so the rotation order
    // is deterministic across retries within one call.
    const startCursor = this.cursor;

    for (let i = 0; i < n && attempts < this.config.maxTotalAttempts; i++) {
      const idx = (startCursor + i) % n;
      const k = this.keys[idx];

      if (!k.key) continue;
      if (k.status === 'DEAD') continue;
      if (k.status === 'COOLDOWN' && k.cooldownUntil && Date.now() < k.cooldownUntil) continue;

      for (let mi = 0; mi < models.length && attempts < this.config.maxTotalAttempts; mi++) {
        const model = models[mi];
        attempts++;

        const t0 = Date.now();
        let res: Response;
        try {
          res = await fetch(`${GEMINI_BASE}/${model.id}:generateContent?key=${k.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: opts.systemPrompt }] },
              contents: [{ parts: [{ text: opts.userPrompt }] }],
              generationConfig: {
                temperature: model.temperature,
                maxOutputTokens: model.maxOutputTokens,
                responseMimeType: 'application/json',
              },
            }),
          });
        } catch (e) {
          lastError = e instanceof Error ? e.message : 'Network error';
          lastErrorKind = 'network';
          continue;
        }

        const latencyMs = Date.now() - t0;

        if (!res.ok) {
          let body: GeminiError = {};
          try {
            body = (await res.json()) as GeminiError;
          } catch {
            /* ignore */
          }
          lastError = body.message ?? `HTTP ${res.status}`;

          if (isQuotaError({ ...body, code: res.status })) {
            const cooldownMs = parseRetryAfterMs(body.message, this.config.defaultCooldownMs);
            lastErrorKind = 'quota';
            console.warn(
              `[AIClient] quota cooldown key=${maskKey(k.key)} model=${model.id} for ${Math.round(cooldownMs / 1000)}s (status ${res.status}), trying next model/key...`
            );
            if (mi === models.length - 1) {
              k.status = 'COOLDOWN';
              k.cooldownUntil = Date.now() + cooldownMs;
              this.persistKeyStates();
              break; // next key
            }
            continue; // try next model on this key!
          }

          if (isInvalidKeyError({ ...body, code: res.status })) {
            k.status = 'DEAD';
            this.persistKeyStates();
            lastErrorKind = 'invalid-key';
            console.warn(`[AIClient] invalid key key=${maskKey(k.key)} model=${model.id}`);
            break; // next key
          }

          // Other server error: try next model on same key.
          lastErrorKind = 'server';
          console.warn(
            `[AIClient] server error key=${maskKey(k.key)} model=${model.id} status=${res.status} msg=${lastError} latencyMs=${latencyMs}`
          );
          continue;
        }

        // Successful HTTP. Parse and validate.
        let json: unknown;
        try {
          json = await res.json();
        } catch (e) {
          lastError = 'Failed to parse Gemini JSON envelope';
          lastErrorKind = 'validation';
          continue;
        }

        const candidate = (json as any)?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const rawText: string | undefined =
          candidate?.content?.parts?.[0]?.text ??
          (typeof candidate?.content?.parts?.[0] === 'string'
            ? candidate.content.parts[0]
            : undefined);

        if (!rawText) {
          lastError = `Empty Gemini response (finishReason=${finishReason ?? 'unknown'})`;
          lastErrorKind = 'validation';
          console.warn(
            `[AIClient] empty response key=${maskKey(k.key)} model=${model.id} finishReason=${finishReason}`
          );
          continue;
        }

        const cleaned = rawText
          .replace(/^```(?:json)?/i, '')
          .replace(/```$/i, '')
          .trim();

        let parsed: unknown;
        try {
          parsed = JSON.parse(cleaned);
        } catch (e) {
          lastError = `AI returned non-JSON: ${cleaned.slice(0, 120)}`;
          lastErrorKind = 'validation';
          console.warn(`[AIClient] non-JSON response key=${maskKey(k.key)} model=${model.id}`);
          continue;
        }

        const result = opts.responseSchema.safeParse(parsed);
        if (!result.success) {
          lastError = 'AI output failed schema validation';
          lastErrorKind = 'validation';
          console.warn(
            `[AIClient] schema mismatch key=${maskKey(k.key)} model=${model.id}`,
            result.error.issues.slice(0, 3)
          );
          continue;
        }

        // Mark key healthy + bump lastUsedAt.
        k.status = 'HEALTHY';
        k.lastUsedAt = Date.now();
        k.cooldownUntil = undefined;
        this.persistKeyStates();

        // Advance cursor for the next call (round-robin).
        this.cursor = (idx + 1) % n;

        return {
          success: true,
          data: result.data,
          meta: {
            keyId: k.id,
            model: model.id,
            latencyMs: Date.now() - start,
            attempts,
          },
        };
      }
    }

    // Advance cursor for the next call (round-robin).
    this.cursor = (startCursor + 1) % n;

    return {
      success: false,
      error: lastError,
      meta: { attempts, lastErrorKind },
    };
  }

  /**
   * Wake keys whose cooldown has expired.
   */
  private refreshKeyStates(): void {
    const now = Date.now();
    for (const k of this.keys) {
      if (k.status === 'COOLDOWN' && k.cooldownUntil && now >= k.cooldownUntil) {
        k.status = 'HEALTHY';
        k.cooldownUntil = undefined;
      }
    }
  }

  /**
   * Persist key state changes back to the input array.
   * The caller (e.g. route handler) is responsible for writing the array
   * to wherever it stores it (e.g. profiles.api_keys JSONB).
   */
  private persistKeyStates(): void {
    // Mutates in-place. Caller holds the reference.
  }
}
