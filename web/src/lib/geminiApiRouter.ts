export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  addedAt: number;
  status: 'HEALTHY' | 'COOLDOWN' | 'DEAD';
  cooldownUntil?: number;
  lastUsedAt?: number;
}

const STORAGE_KEY = 'orbit_gemini_api_keys';
const KEY_HEALTH_STORAGE = 'orbit_gemini_key_health';

export class GeminiApiRouter {
  private static instance: GeminiApiRouter;
  private currentKeyIndex = 0;

  private constructor() {}

  public static getInstance(): GeminiApiRouter {
    if (!GeminiApiRouter.instance) {
      GeminiApiRouter.instance = new GeminiApiRouter();
    }
    return GeminiApiRouter.instance;
  }

  // Load stored keys
  public getKeys(): ApiKeyItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const raw = JSON.parse(saved);
      const now = Date.now();
      return raw.map((item: any, idx: number) => {
        const kStr = typeof item === 'string' ? item : item.key;
        const name = item.name || `Key ${idx + 1}`;
        const cooldownUntil = item.cooldownUntil || 0;

        let status: 'HEALTHY' | 'COOLDOWN' | 'DEAD' = item.status || 'HEALTHY';
        if (status === 'COOLDOWN' && now >= cooldownUntil) {
          status = 'HEALTHY';
        }

        return {
          id: item.id || `key_${idx}_${Date.now()}`,
          name,
          key: kStr,
          addedAt: item.addedAt || Date.now(),
          status,
          cooldownUntil,
          lastUsedAt: item.lastUsedAt,
        };
      });
    } catch (e) {
      return [];
    }
  }

  public saveKeys(keys: ApiKeyItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }

  // Single key add
  public addKey(keyString: string, name?: string): boolean {
    const trimmed = keyString.trim();
    if (!trimmed) return false;

    const keys = this.getKeys();
    const exists = keys.some((k) => k.key === trimmed);
    if (exists) return false;

    const newKeyItem: ApiKeyItem = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name?.trim() || `Gemini Key ${keys.length + 1}`,
      key: trimmed,
      addedAt: Date.now(),
      status: 'HEALTHY',
    };

    this.saveKeys([...keys, newKeyItem]);
    return true;
  }

  // Bulk add text/file regex extractor
  public bulkAddKeys(rawText: string): number {
    const regex = /(?:AIzaSy|AQ\.)[A-Za-z0-9_-]{33,}/g;
    const matches = rawText.match(regex);
    if (!matches) return 0;

    const keys = this.getKeys();
    let addedCount = 0;

    matches.forEach((kStr) => {
      const exists = keys.some((k) => k.key === kStr);
      if (!exists) {
        keys.push({
          id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: `Bulk Key ${keys.length + 1}`,
          key: kStr,
          addedAt: Date.now(),
          status: 'HEALTHY',
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.saveKeys(keys);
    }

    return addedCount;
  }

  public removeKey(id: string): void {
    const keys = this.getKeys().filter((k) => k.id !== id);
    this.saveKeys(keys);
  }

  public clearAllKeys(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  public async testKey(keyString: string): Promise<{ success: boolean; latency: number; error?: string }> {
    const startTime = performance.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${keyString}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
        }),
      });

      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);

      if (data.error) {
        return { success: false, latency, error: data.error.message || 'API Error' };
      }

      return { success: true, latency };
    } catch (err: any) {
      return { success: false, latency: Math.round(performance.now() - startTime), error: err?.message || 'Network Error' };
    }
  }

  // Execute AI call with Round-Robin Rotation & Fallback
  public async executeAI(prompt: string): Promise<{ success: boolean; data?: any; error?: string; usedKeyName?: string }> {
    let keys = this.getKeys();
    if (keys.length === 0) {
      return { success: false, error: 'Chưa có Google Gemini API Key nào được cài đặt. Vui lòng thêm Key vào cài đặt.' };
    }

    const now = Date.now();
    // Wake up cooled-down keys
    keys = keys.map((k) => {
      if (k.status === 'COOLDOWN' && k.cooldownUntil && now >= k.cooldownUntil) {
        return { ...k, status: 'HEALTHY', cooldownUntil: undefined };
      }
      return k;
    });

    const healthyKeys = keys.filter((k) => k.status === 'HEALTHY');
    if (healthyKeys.length === 0) {
      return { success: false, error: 'Tất cả API Keys đều đang trong thời gian chờ (Cooldown) hoặc bị vô hiệu hóa.' };
    }

    let lastError = 'All keys failed';
    const models = ['gemini-flash-latest', 'gemini-pro-latest'];

    for (let attempt = 0; attempt < healthyKeys.length; attempt++) {
      const keyIndex = (this.currentKeyIndex + attempt) % healthyKeys.length;
      const targetKey = healthyKeys[keyIndex];
      this.currentKeyIndex = (keyIndex + 1) % healthyKeys.length;

      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${targetKey.key}`;

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });

          const data = await res.json();
          if (data.error) {
            lastError = data.error.message || 'API Error';
            if (lastError.includes('API key not valid')) {
              targetKey.status = 'DEAD';
              this.saveKeys(keys);
              break;
            }
            if (lastError.includes('quota') || res.status === 429) {
              targetKey.status = 'COOLDOWN';
              targetKey.cooldownUntil = Date.now() + 60000;
              this.saveKeys(keys);
              break;
            }
            continue;
          }

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            targetKey.lastUsedAt = Date.now();
            this.saveKeys(keys);
            const text = data.candidates[0].content.parts[0].text;
            return { success: true, data: text, usedKeyName: targetKey.name };
          }
        } catch (err: any) {
          lastError = err?.message || 'Connection Error';
        }
      }
    }

    return { success: false, error: lastError };
  }
}
