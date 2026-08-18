function normalizeVocabText(text) {
  return text.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
}

class SyncManager {
  constructor() {
    this.supabaseUrl = 'https://ipcjibzdkchcizcqmffy.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY2ppYnpka2NoY2l6Y3FtZmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU4NDUsImV4cCI6MjEwMjI2MTg0NX0.pwbWdsWD5QwRxrKx8KB7HS3RmFtI-fzhionPcsbCVGI';
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.status = 'disconnected'; // disconnected | connected | syncing | error | token_expired
  }
  
  async init() {
    const data = await chrome.storage.local.get(['supabaseSession']);
    if (data.supabaseSession && data.supabaseSession.accessToken) {
      this.accessToken = data.supabaseSession.accessToken;
      this.refreshToken = data.supabaseSession.refreshToken;
      this.user = data.supabaseSession.user;
      this.status = 'connected';
      console.log('[SyncManager] Session loaded for user:', this.user?.email || this.user?.id);
    }
  }

  async isAuthenticated() {
    if (!this.accessToken || !this.user?.id) {
      await this.init();
    }
    return !!this.accessToken && !!this.user?.id;
  }

  async setSession(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
    this.status = 'connected';
    await chrome.storage.local.set({
      supabaseSession: { accessToken, refreshToken, user }
    });
  }

  async refreshSession() {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAnonKey
        },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      await this.setSession(data.access_token, data.refresh_token, data.user);
      return true;
    } catch (e) {
      this.status = 'token_expired';
      return false;
    }
  }

  async clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.status = 'disconnected';
    await chrome.storage.local.remove(['supabaseSession']);
  }

  async getStatus() {
    return { status: this.status, user: this.user };
  }
  
  async _supabaseRequest(method, path, body, headers = {}) {
    if (!await this.isAuthenticated()) throw new Error('Not authenticated');

    const doRequest = async () => {
      const defaultHeaders = {
        'apikey': this.supabaseAnonKey,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...headers
      };
      
      const options = { method, headers: defaultHeaders };
      if (body) options.body = JSON.stringify(body);

      return fetch(`${this.supabaseUrl}${path}`, options);
    };

    let response = await doRequest();
    
    if (response.status === 401) {
      console.log('[SyncManager] 401 Unauthorized received, attempting token refresh...');
      const refreshed = await this.refreshSession();
      if (refreshed) {
        response = await doRequest();
      } else {
        throw new Error('Unauthorized and refresh failed');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SyncManager] Supabase request failed: HTTP ${response.status}`, errorText);
      throw new Error(`Supabase request failed: ${response.status} ${errorText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return null;
    }
    
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async upsertVocabulary(vocab) {
    if (!this.user || !this.user.id) {
      throw new Error('No user to associate vocabulary with');
    }

    const termText = (vocab.term || '').trim();
    if (!termText) return null;

    const normText = normalizeVocabText(termText);
    
    // Ensure all text columns are strictly string primitives (prevent PostgREST 400 json-to-text type errors)
    const toSafeString = (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val.original || JSON.stringify(val);
      return String(val);
    };

    const payload = {
      user_id: this.user.id,
      term: termText,
      normalized_text: normText,
      translation: toSafeString(vocab.translation),
      phonetic: toSafeString(vocab.phonetic),
      cefr_level: toSafeString(vocab.cefrLevel) || 'B2',
      part_of_speech: toSafeString(vocab.partOfSpeech) || 'noun',
      example_sentence: toSafeString(vocab.exampleSentence),
      example_translation: toSafeString(vocab.exampleTranslation),
      grammar_breakdown: vocab.grammarBreakdown ? (typeof vocab.grammarBreakdown === 'object' ? JSON.stringify(vocab.grammarBreakdown) : String(vocab.grammarBreakdown)) : null,
      source_type: 'EXTENSION',
      source_url: toSafeString(vocab.sourceUrl),
      source_title: toSafeString(vocab.sourceTitle),
      source_context: toSafeString(vocab.sourceContext),
      context_text: toSafeString(vocab.sourceContext),
      lookup_count: typeof vocab.lookupCount === 'number' ? vocab.lookupCount : 1,
      updated_at: new Date().toISOString()
    };

    try {
      console.log(`[SyncManager] Upserting vocabulary "${normText}" to Supabase...`);
      
      // Try atomic upsert with resolution=merge-duplicates on unique (user_id, normalized_text)
      const res = await this._supabaseRequest(
        'POST', 
        '/rest/v1/words?on_conflict=user_id,normalized_text', 
        payload,
        { 'Prefer': 'resolution=merge-duplicates,return=representation' }
      );
      console.log(`[SyncManager] Successfully upserted "${normText}":`, res);
      return res;
    } catch (err) {
      console.warn(`[SyncManager] Atomic upsert failed, attempting fallback query/patch...`, err.message);
      try {
        const existing = await this._supabaseRequest(
          'GET', 
          `/rest/v1/words?user_id=eq.${this.user.id}&normalized_text=eq.${encodeURIComponent(normText)}&select=id`
        );
        
        if (existing && existing.length > 0) {
          return await this._supabaseRequest('PATCH', `/rest/v1/words?id=eq.${existing[0].id}`, payload);
        } else {
          return await this._supabaseRequest('POST', '/rest/v1/words', payload);
        }
      } catch (fallbackErr) {
        console.error(`[SyncManager] Failed to upsert "${normText}":`, fallbackErr);
        throw fallbackErr;
      }
    }
  }
}
