class SyncQueue {
  constructor(syncManager) {
    this.syncManager = syncManager;
    this.storageKey = 'orbitSyncQueue';
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 10;
    this.baseDelay = 1000; // 1 second
    this.maxDelay = 60000; // 60 seconds
  }
  
  async init() {
    const data = await chrome.storage.local.get([this.storageKey]);
    this.queue = data[this.storageKey] || [];
  }
  
  async _persist() {
    await chrome.storage.local.set({ [this.storageKey]: this.queue });
  }

  async add(eventType, payload) {
    if (!this.queue || !Array.isArray(this.queue) || this.queue.length === 0) {
      await this.init();
    }
    const item = {
      id: crypto.randomUUID(),
      eventType,
      payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      clientEventId: crypto.randomUUID()
    };
    this.queue.push(item);
    await this._persist();
    console.log(`[SyncQueue] Added item "${payload?.term}" to queue. Triggering immediate flush...`);
    await this.flush();
  }
  
  async flush() {
    if (this.isProcessing) {
      console.log('[SyncQueue] Already processing flush, skipping duplicate.');
      return;
    }
    const isAuth = await this.syncManager.isAuthenticated();
    if (!isAuth) {
      console.log('[SyncQueue] Not authenticated with Supabase yet. Words will stay queued in storage until user connects.');
      return;
    }
    
    this.isProcessing = true;
    try {
      const now = Date.now();
      for (let i = 0; i < this.queue.length; i++) {
        const item = this.queue[i];
        if (item.status === 'SYNCED') continue;
        
        if (item.status === 'FAILED' && item.lastAttemptAt) {
          const delay = this._getBackoffDelay(item.retryCount);
          if (now - new Date(item.lastAttemptAt).getTime() < delay) {
            continue;
          }
        }
        
        item.status = 'SYNCING';
        item.lastAttemptAt = new Date().toISOString();
        await this._persist();
        
        try {
          if (item.eventType === 'VOCABULARY_SAVED') {
            await this.syncManager.upsertVocabulary(item.payload);
          }
          item.status = 'SYNCED';
        } catch (e) {
          item.retryCount++;
          if (item.retryCount >= this.maxRetries) {
             item.status = 'DEAD';
          } else {
             item.status = 'FAILED';
          }
          console.error('[SyncQueue] item failed:', e);
        }
        await this._persist();
      }
      
      this.queue = this.queue.filter(item => item.status !== 'SYNCED' && item.status !== 'DEAD');
      await this._persist();
    } finally {
      this.isProcessing = false;
    }
  }
  
  async getStats() {
    return {
      pending: this.queue.filter(i => i.status === 'PENDING').length,
      syncing: this.queue.filter(i => i.status === 'SYNCING').length,
      synced: this.queue.filter(i => i.status === 'SYNCED').length,
      failed: this.queue.filter(i => i.status === 'FAILED').length,
      total: this.queue.length
    };
  }
  
  _getBackoffDelay(retryCount) {
    return Math.min(this.baseDelay * Math.pow(2, retryCount), this.maxDelay);
  }
}
