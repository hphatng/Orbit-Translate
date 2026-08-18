import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIClient, type ApiKeyItem } from '../lib/ai/AIClient';
import { z } from 'zod';

const TestSchema = z.object({ value: z.string() });

function newKey(id: string, suffix: string): ApiKeyItem {
  return { id, name: id, key: `AIza-${suffix}-${suffix}-${suffix}-${suffix}` };
}

function okFetch(payload: any, opts: { status?: number } = {}) {
  return vi.fn(async (_url: Parameters<typeof fetch>[0]) => ({
    ok: opts.status === undefined ? true : opts.status < 400,
    status: opts.status ?? 200,
    json: async () => ({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(payload) }] },
          finishReason: 'STOP',
        },
      ],
    }),
  }) as Response);
}

describe('AIClient', () => {
  let originalFetch: typeof fetch;
  let consoleWarnSpy: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns no-keys when there are no keys', async () => {
    const client = new AIClient([]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(false);
    expect(out.meta.attempts).toBe(0);
  });

  it('returns success on first attempt', async () => {
    globalThis.fetch = okFetch({ value: 'hello' });
    const client = new AIClient([newKey('k1', 'aaaa')]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(true);
    if (out.success) {
      expect(out.data.value).toBe('hello');
      expect(out.meta.attempts).toBe(1);
    }
  });

  it('rotates keys when one returns 429', async () => {
    let n = 0;
    const urls: string[] = [];
      globalThis.fetch = vi.fn(async (url: Parameters<typeof fetch>[0]) => {
      const u = typeof url === 'string' ? url : (url as URL).toString();
      n++;
      urls.push(u);
      if (u.includes('aaaa')) {
        return {
          ok: false,
          status: 429,
          json: async () => ({ message: 'rate limit' }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ value: 'b' }) }] } }],
        }),
      } as Response;
    });

    const k1 = newKey('k1', 'aaaa');
    const k2 = newKey('k2', 'bbbb');
    const client = new AIClient([k1, k2]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });

    expect(urls.length, JSON.stringify({ n, urls: urls.map((u) => u.slice(-30)), out })).toBeGreaterThanOrEqual(2);
    expect(out.success, JSON.stringify({ out, urls: urls.map((u) => u.slice(-30)) })).toBe(true);
  });

  it('marks key DEAD on invalid key error', async () => {
    const k1 = newKey('k1', 'aaaa');
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return {
        ok: false,
        status: 403,
        json: async () => ({ message: 'API key not valid. Please pass a valid API key.' }),
      } as Response;
    });
    const client = new AIClient([k1]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(false);
    if (!out.success) {
      // The persisted key state is internal; check via the lastErrorKind.
      expect(out.meta.lastErrorKind).toBe('invalid-key');
      // We did NOT loop back to the same key — only one key, so 1 attempt.
      expect(out.meta.attempts).toBe(1);
    }
  });

  it('skips COOLDOWN keys and tries a fresh one', async () => {
    const k1 = newKey('k1', 'aaaa');
    k1.status = 'COOLDOWN';
    k1.cooldownUntil = Date.now() + 60_000;

    let bCount = 0;
    globalThis.fetch = vi.fn(async (url: Parameters<typeof fetch>[0]) => {
      const u = typeof url === 'string' ? url : (url as URL).toString();
      if (u.includes('bbbb')) {
        bCount++;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: JSON.stringify({ value: 'b' }) }] } }],
          }),
        } as Response;
      }
      throw new Error('Should not call A while in cooldown');
    });

    const k2 = newKey('k2', 'bbbb');
    const client = new AIClient([k1, k2]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });

    expect(out.success).toBe(true);
    expect(bCount).toBeGreaterThanOrEqual(1);
  });

  it('parses retry-after in seconds from Gemini error message', async () => {
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return {
        ok: false,
        status: 429,
        json: async () => ({
          message: 'Resource has been exhausted. Please retry in 12.345s.',
        }),
      } as Response;
    });

    const k1 = newKey('k1', 'aaaa');
    const client = new AIClient([k1], { defaultCooldownMs: 1000 });
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(false);
    if (!out.success) {
      // Confirm the warn log includes the parsed retry-in seconds, not the default.
      const warnText = consoleWarnSpy.mock.calls.flat().join(' ');
      expect(warnText).toMatch(/12s/);
    }
  });

  it('strips markdown code fences from AI response', async () => {
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '```json\n{ "value": "stripped" }\n```' }],
              },
            },
          ],
        }),
      } as Response;
    });
    const client = new AIClient([newKey('k1', 'aaaa')]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.value).toBe('stripped');
  });

  it('fails validation without retrying when JSON does not match schema', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      calls++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ wrong: 'shape' }) }] } },
          ],
        }),
      } as Response;
    });
    const client = new AIClient([newKey('k1', 'aaaa'), newKey('k2', 'bbbb')]);
    const out = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.meta.lastErrorKind).toBe('validation');
    }
    // Does NOT infinite loop.
    expect(calls).toBeLessThan(20);
  });

  it('does NOT log raw keys — only masked versions in console', async () => {
    const k1 = newKey('k1', 'aaaa');
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return {
        ok: false,
        status: 403,
        json: async () => ({ message: 'API key not valid. Please pass a valid API key.' }),
      } as Response;
    });
    const client = new AIClient([k1]);
    await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: 's',
      userPrompt: 'u',
      responseSchema: TestSchema,
    });
    const allLogText = consoleWarnSpy.mock.calls.flat().join(' ');
    // Full raw key contains AIza-AAAA-AAAA-AAAA-aaaa. Should not appear.
    expect(allLogText).not.toContain('AIza-AAAA-AAAA-AAAA-aaaa');
    // Masked form ****aaaa is fine.
    expect(allLogText).toMatch(/aaaa/);
    // Verify the masked key format is used (not the raw key).
    expect(allLogText).toMatch(/\*\*\*\*aaaa/);
  });
});