importScripts('./sync-manager.js', './sync-queue.js');

// Background Service Worker for Orbit Translate (Manifest V3)

const DEFAULT_PREFERENCES = {
  targetLanguage: 'vi',
  autoPlayAudio: true,
  showIPA: true,
  showGrammarBreakdown: true,
  showMemoryHint: true,
  showCEFRLevel: true,
  theme: 'dark',
  quizletAutoCopyFormat: true,
  ttsVoice: '',
  ttsRate: 1.0,
  ttsPitch: 1.0
};

class MemoryCache {
  constructor(maxSize = 50, storageKey = 'orbitMemCache') {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.storageKey = storageKey;
    chrome.storage.local.get([this.storageKey], (res) => {
      if (res[this.storageKey]) {
        try {
          const parsed = JSON.parse(res[this.storageKey]);
          for (const [k, v] of parsed) {
            this.cache.set(k, v);
          }
        } catch(e) {}
      }
    });
  }
  
  saveToStorage() {
    chrome.storage.local.set({ [this.storageKey]: JSON.stringify(Array.from(this.cache.entries())) });
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    this.saveToStorage();
    return value;
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
    this.saveToStorage();
  }
}

const aiCache = new MemoryCache(50, 'aiMemoryCacheV2');
const translateCache = new MemoryCache(200, 'translateMemoryCacheV2');

const syncManager = new SyncManager();
const syncQueue = new SyncQueue(syncManager);

// Initialize sync system
(async () => {
  await syncManager.init();
  await syncQueue.init();
  // Set up periodic flush every 30 seconds
  setInterval(() => syncQueue.flush(), 30000);
})();

const keyHealth = new Map();

chrome.storage.local.get(['keyHealthState'], (res) => {
  if (res.keyHealthState) {
    const now = Date.now();
    for (const [key, health] of Object.entries(res.keyHealthState)) {
      if (health.until > now || health.state === 'DEAD') {
        keyHealth.set(key, health);
      }
    }
  }
});

function saveKeyHealth() {
  const state = {};
  for (const [key, health] of keyHealth.entries()) {
    state[key] = health;
  }
  chrome.storage.local.set({ keyHealthState: state });
}

let currentKeyIndex = 0;
let AI_MODELS = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-2.0-flash-exp'];

// Load currentKeyIndex from storage on startup
chrome.storage.local.get(['currentKeyIndex'], (data) => {
  if (data && typeof data.currentKeyIndex === 'number') {
    currentKeyIndex = data.currentKeyIndex;
  }
});

async function refreshGeminiModels(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      let models = data.models
        .filter(m => {
          if (!m.supportedGenerationMethods || !m.supportedGenerationMethods.includes('generateContent')) return false;
          const name = m.name.toLowerCase();
          if (!name.includes('gemini')) return false;
          if (name.includes('-tts') || name.includes('-vision') || name.includes('learnlm') || name.includes('gemini-1.0')) return false;
          if (name.includes('-exp-')) return false;
          return true;
        })
        .map(m => m.name.replace('models/', ''));
      
      models.sort((a, b) => {
        const aFlash = a.includes('flash');
        const bFlash = b.includes('flash');
        if (aFlash && !bFlash) return -1;
        if (!aFlash && bFlash) return 1;
        
        const aLatest = a.includes('latest');
        const bLatest = b.includes('latest');
        if (aLatest && !bLatest) return -1;
        if (!aLatest && bLatest) return 1;
        
        return 0;
      });
      
      if (models.length > 0) {
        AI_MODELS = models;
        await chrome.storage.local.set({ 
          aiModelsCacheV2: { models, expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000 } 
        });
      }
    }
  } catch (error) {
    console.warn('[Orbit API] Failed to refresh models:', error);
  }
}

async function loadModelsFromCache(apiKey) {
  try {
    const data = await chrome.storage.local.get(['aiModelsCacheV2']);
    const now = Date.now();
    if (data.aiModelsCacheV2 && now < data.aiModelsCacheV2.expiresAt) {
      AI_MODELS = data.aiModelsCacheV2.models;
      return;
    }
    if (apiKey) {
      await refreshGeminiModels(apiKey);
    }
  } catch (error) {
    console.warn('[Orbit API] loadModelsFromCache error:', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['preferences'], (result) => {
    let prefs = result.preferences;
    if (!prefs) {
      chrome.storage.sync.set({ preferences: DEFAULT_PREFERENCES });
    } else {
      let updated = false;
      if (prefs.geminiApiKey && (!prefs.geminiApiKeys || prefs.geminiApiKeys.length === 0)) {
        prefs.geminiApiKeys = [prefs.geminiApiKey];
        updated = true;
      }
      if (typeof prefs.useGemini === 'undefined') {
        prefs.useGemini = true;
        updated = true;
      }
      if (updated) {
        chrome.storage.sync.set({ preferences: prefs });
      }
    }
  });

  chrome.contextMenus.create({
    id: 'orbit-translate-selection',
    title: 'Dịch "%s" với Orbit Translate',
    contexts: ['selection']
  });
});

// Handle external messages from WebApp http://localhost:3000
if (chrome.runtime.onMessageExternal) {
  chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.type === 'ORBIT_EXTENSION_AUTH_SUCCESS') {
      const { access_token, refresh_token, user } = request;
      syncManager.setSession(access_token, refresh_token, user).then(() => {
        // Also store basic user info for UI display
        chrome.storage.sync.set({ 
          orbitAuthToken: { 
            email: user?.email, 
            fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            userId: user?.id 
          } 
        });
        syncQueue.flush(); // Flush any pending items
        sendResponse({ success: true, saved: true });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
  });
}

// Handle Context Menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'orbit-translate-selection') {
    if (tab && tab.id !== undefined && tab.id >= 0) {
      const sendPayload = () => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ORBIT_TRIGGER_TRANSLATION',
          text: info.selectionText ? info.selectionText.trim() : ''
        });
      };

      chrome.tabs.sendMessage(tab.id, { type: 'PING' }, () => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            setTimeout(sendPayload, 100);
          }).catch(err => {
            console.error('Injection failed:', err);
            if (tab.url && tab.url.startsWith('file://')) {
              chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
            }
          });
        } else {
          sendPayload();
        }
      });
    }
  }
});

// Handle internal messages from Content Script or Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_ORBIT_AUTH_TOKEN') {
    const { access_token, refresh_token, user } = request;
    syncManager.setSession(access_token, refresh_token, user).then(() => {
      chrome.storage.sync.set({ 
        orbitAuthToken: { 
          email: user?.email, 
          fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
          userId: user?.id 
        } 
      });
      syncQueue.flush();
      sendResponse({ success: true, saved: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (request.type === 'GET_VOCAB_HISTORY_COUNT') {
    const term = (request.term || '').toLowerCase();
    chrome.storage.local.get(['vocabularies', 'translationHistory'], (data) => {
      const history = data.translationHistory || {};
      const count = history[term] || 0;
      sendResponse({ count });
    });
    return true;
  }

  if (request.type === 'SAVE_VOCABULARY') {
    const vocab = request.vocab;
    const term = (vocab.term || '').trim();
    if (!term) {
      sendResponse({ success: false, error: 'Empty term' });
      return true;
    }
    const termLow = term.toLowerCase();

    chrome.storage.local.get(['vocabularies', 'translationHistory'], (data) => {
      const vocabularies = data.vocabularies || [];
      const history = data.translationHistory || {};
      
      history[termLow] = (history[termLow] || 0) + 1;

      const existingIndex = vocabularies.findIndex(v => (v.term || '').toLowerCase() === termLow);
      if (existingIndex >= 0) {
        vocabularies[existingIndex] = { ...vocabularies[existingIndex], ...vocab, updatedAt: new Date().toISOString() };
      } else {
        vocabularies.unshift(vocab);
      }

      chrome.storage.local.set({ vocabularies, translationHistory: history }, () => {
        const sourceContext = typeof vocab.context === 'object' && vocab.context !== null
          ? (vocab.context.original || '')
          : (typeof vocab.contextOriginal === 'string' ? vocab.contextOriginal : (typeof vocab.context === 'string' ? vocab.context : ''));

        const exEn = vocab.exampleSentence || (Array.isArray(vocab.examples) && vocab.examples[0]?.en) || '';
        const exVi = vocab.exampleTranslation || (Array.isArray(vocab.examples) && vocab.examples[0]?.vi) || '';

        // Queue for async Supabase sync
        syncQueue.add('VOCABULARY_SAVED', {
          term: vocab.term,
          translation: vocab.translation || '',
          phonetic: vocab.phonetic || '',
          cefrLevel: vocab.cefrLevel || 'B2',
          partOfSpeech: vocab.partOfSpeech || '',
          exampleSentence: exEn,
          exampleTranslation: exVi,
          grammarBreakdown: vocab.grammarBreakdown || '',
          sourceUrl: sender?.tab?.url || vocab.sourceUrl || '',
          sourceTitle: sender?.tab?.title || vocab.sourceTitle || '',
          sourceContext: sourceContext,
          lookupCount: history[termLow] || 1,
        });

        sendResponse({ success: true, total: vocabularies.length });
      });
    });
    return true;
  }

  if (request.type === 'GET_ALL_VOCABULARIES') {
    chrome.storage.local.get(['vocabularies'], (data) => {
      sendResponse({ vocabularies: data.vocabularies || [] });
    });
    return true;
  }

  if (request.type === 'GET_SYNC_STATUS') {
    syncManager.getStatus().then(status => {
      syncQueue.getStats().then(queueStats => {
        sendResponse({ ...status, queue: queueStats });
      });
    });
    return true;
  }

  if (request.type === 'DISCONNECT_ACCOUNT') {
    syncManager.clearSession().then(() => {
      chrome.storage.sync.remove('orbitAuthToken', () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    return true;
  }

  async function executeAI(prompt, apiKeys, allowPro = false) {
    const startTime = performance.now();
    const cached = aiCache.get(prompt);
    if (cached) {
      return { success: true, data: cached, meta: { latency: Math.round(performance.now() - startTime), keyIndex: -1, model: 'cache', cached: true } };
    }

    let lastError = 'All keys exhausted or dead.';
    const now = Date.now();

    const apiKeyForModelFetch = typeof apiKeys[0] === 'string' ? apiKeys[0] : apiKeys[0].key;
    await loadModelsFromCache(apiKeyForModelFetch);

    for (let k = 0; k < apiKeys.length; k++) {
      const kStr = typeof apiKeys[k] === 'string' ? apiKeys[k] : apiKeys[k].key;
      const health = keyHealth.get(kStr);
      if (health && health.state === 'COOLDOWN' && now >= health.until) {
        keyHealth.set(kStr, { state: 'HEALTHY', until: 0 });
      }
    }

    const startingKeyIndex = currentKeyIndex;
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const keyIndex = (startingKeyIndex + attempt) % apiKeys.length;
      const apiKeyObj = apiKeys[keyIndex];
      const apiKey = typeof apiKeyObj === 'string' ? apiKeyObj : apiKeyObj.key;
      
      const health = keyHealth.get(apiKey) || { state: 'HEALTHY', until: 0 };
      if (health.state !== 'HEALTHY') continue;

      currentKeyIndex = (keyIndex + 1) % apiKeys.length;
      chrome.storage.local.set({ currentKeyIndex });
      
      let allowedModels = AI_MODELS;
      if (!allowPro) {
        allowedModels = AI_MODELS.filter(m => !m.includes('pro'));
        if (allowedModels.length === 0) allowedModels = AI_MODELS;
      }
      
      let keyExhausted = false;
      
      for (let m = 0; m < allowedModels.length; m++) {
        const model = allowedModels[m];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
            })
          });
          const data = await res.json();

          if (data.error) {
            lastError = data.error.message || 'API Error';
            if (lastError.toLowerCase().includes('api key not valid')) {
              keyHealth.set(apiKey, { state: 'DEAD', until: 0 });
              saveKeyHealth();
              keyExhausted = true;
              break;
            }
            if (lastError.toLowerCase().includes('quota') || lastError.toLowerCase().includes('rate limit') || lastError.toLowerCase().includes('exhausted') || res.status === 429) {
              let cooldownSeconds = 60;
              const retryMatch = lastError.match(/retry in ([\d\.]+)s/);
              if (retryMatch && retryMatch[1]) {
                cooldownSeconds = Math.ceil(parseFloat(retryMatch[1]));
              }
              console.warn(`[Orbit API] Key ${keyIndex} Rate Limit. Cooldown ${cooldownSeconds}s.`);
              keyHealth.set(apiKey, { state: 'COOLDOWN', until: Date.now() + (cooldownSeconds * 1000) });
              saveKeyHealth();
              keyExhausted = true;
              break;
            }
            console.warn(`[Orbit API] Model ${model} failed:`, lastError);
            continue;
          } 
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            let aiResult = data.candidates[0].content.parts[0].text.trim();
            let parsedData = null;
            try {
              parsedData = JSON.parse(aiResult);
            } catch(e) {
              parsedData = { raw: aiResult };
            }
            
            aiCache.set(prompt, parsedData);
            const latency = Math.round(performance.now() - startTime);
            return { success: true, data: parsedData, meta: { latency, keyIndex, model, cached: false } };
          }
        } catch (error) {
          lastError = error.message;
          console.warn(`[Orbit API] Model ${model} connection error:`, lastError);
        }
      }
    }
    
    return { success: false, error: lastError };
  }

  if (request.type === 'AI_SMART_ANALYZE') {
    const { text, context, apiKeys, isSentence } = request;
    if (!apiKeys || apiKeys.length === 0) return sendResponse({ success: false, error: 'No API Key' });

    let prompt = `Bạn là chuyên gia ngôn ngữ. Dịch MỤC TIÊU sang tiếng Việt, dựa vào NGỮ CẢNH để dịch chính xác.\nNGỮ CẢNH: "${context}"\nMỤC TIÊU CẦN DỊCH: "${text}"\n\nYÊU CẦU BẮT BUỘC:\n1. Bản dịch tiếng Việt ngắn gọn, tự nhiên. KHÔNG dịch toàn bộ NGỮ CẢNH.\n`;
    
    if (isSentence) {
      prompt += `2. Phân tích 1 cấu trúc ngữ pháp quan trọng nhất trong MỤC TIÊU.\n3. Trả về JSON: {"translation": "bản dịch", "grammarAnalysis": [{"structure": "tên", "explanation": "giải thích"}]}`;
    } else {
      prompt += `2. Xác định loại từ (Part of Speech) và sáng tạo 2 câu ví dụ siêu đơn giản (A2-B1) có sử dụng MỤC TIÊU.\n3. Trả về JSON: {"translation": "bản dịch", "partOfSpeech": "loại từ", "examples": [{"en": "ví dụ tiếng Anh", "vi": "bản dịch tiếng Việt"}]}`;
    }

    executeAI(prompt, apiKeys, false).then(res => {
      sendResponse(res);
    });
    return true;
  }

  const SYMBOL_MAP = {
    '.': 'dot', ',': 'comma', '?': 'question mark', '!': 'exclamation mark', '-': 'hyphen',
    '_': 'underscore', ':': 'colon', ';': 'semicolon', '"': 'quotation mark', "'": 'apostrophe',
    '(': 'left parenthesis', ')': 'right parenthesis', '[': 'left square bracket', ']': 'right square bracket',
    '{': 'left curly bracket', '}': 'right curly bracket', '+': 'plus sign', '=': 'equals sign',
    '*': 'asterisk', '/': 'slash', '\\': 'backslash', '|': 'vertical bar', '@': 'at sign',
    '#': 'hashtag', '$': 'dollar sign', '%': 'percent sign', '^': 'caret', '&': 'ampersand',
    '~': 'tilde', '`': 'backtick', '<': 'less than', '>': 'greater than', '∑': 'summation',
    '≈': 'approximately equal', '≠': 'not equal', '≤': 'less than or equal to', '≥': 'greater than or equal to',
    '∞': 'infinity', 'π': 'pi', '√': 'square root', '∫': 'integral', 'µ': 'micro', 'Δ': 'delta',
    'Ω': 'omega', '©': 'copyright', '®': 'registered trademark', '™': 'trademark', '€': 'euro',
    '£': 'pound', '¥': 'yen', '°': 'degree', '“': 'left double quotation mark',
    '”': 'right double quotation mark', '‘': 'left single quotation mark',
    '’': 'right single quotation mark', '—': 'em dash', '–': 'en dash', '…': 'ellipsis'
  };

  if (request.type === 'TRANSLATE_TEXT') {
    const text = request.text;
    let queryText = text;
    if (text.length === 1 && SYMBOL_MAP[text]) {
      queryText = SYMBOL_MAP[text];
    }
    const gTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(queryText)}`;
    const dictionaryUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(queryText.toLowerCase())}`;

    const cached = translateCache.get(text);
    if (cached && (!SYMBOL_MAP[text] || cached.audioText)) {
      sendResponse({ success: true, data: cached });
      return true;
    }

    async function processTranslation() {
      try {
        const [gResult, dictResult] = await Promise.allSettled([
          fetch(gTranslateUrl).then(res => res.json()),
          fetch(dictionaryUrl).then(res => res.json())
        ]);

        let translatedText = text;
        if (gResult.status === 'fulfilled' && gResult.value && gResult.value[0]) {
          translatedText = gResult.value[0].map(item => item[0]).join('');
        }

        let resultData = {
          term: text,
          audioText: queryText,
          translation: translatedText,
          phonetic: `/${queryText.toLowerCase()}/`,
          cefrLevel: text.length > 8 ? 'C1' : text.length > 5 ? 'B2' : 'A2',
          synonyms: [],
          antonyms: [],
          examples: [],
          contextOriginal: '',
          grammarBreakdown: {
            structure: `Cấu trúc "${text}"`,
            explanation: `Bản dịch từ Google Translate.`
          }
        };

        if (dictResult.status === 'fulfilled' && Array.isArray(dictResult.value) && dictResult.value.length > 0) {
          const dictEntry = dictResult.value[0];
          
          if (dictEntry.phonetic) resultData.phonetic = dictEntry.phonetic;
          else if (dictEntry.phonetics && dictEntry.phonetics.length > 0) {
            const ph = dictEntry.phonetics.find(p => p.text);
            if (ph) resultData.phonetic = ph.text;
          }

          if (dictEntry.meanings && dictEntry.meanings.length > 0) {
            const meaning = dictEntry.meanings[0];
            resultData.partOfSpeech = meaning.partOfSpeech;
            resultData.grammarBreakdown.structure = `${text} (${meaning.partOfSpeech})`;
            
            if (meaning.definitions && meaning.definitions.length > 0) {
              const def = meaning.definitions[0];
              resultData.grammarBreakdown.explanation = def.definition;
              
              for (const d of meaning.definitions) {
                if (d.example && resultData.examples.length < 2) {
                  resultData.examples.push({ en: d.example, vi: '' });
                }
              }
            }

            if (meaning.synonyms && meaning.synonyms.length > 0) {
              resultData.synonyms = meaning.synonyms.slice(0, 3);
            }
            if (meaning.antonyms && meaning.antonyms.length > 0) {
              resultData.antonyms = meaning.antonyms.slice(0, 3);
            }
          }
        }

        if (resultData.examples.length > 0) {
          await Promise.all(resultData.examples.map(async (ex) => {
            try {
              const exTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(ex.en)}`;
              const exRes = await fetch(exTranslateUrl);
              const exJson = await exRes.json();
              if (exJson && exJson[0]) {
                ex.vi = exJson[0].map(item => item[0]).join('');
              }
            } catch (e) {
              console.error("Failed to translate fallback example", e);
            }
          }));
        }

        translateCache.set(text, resultData);
        sendResponse({ success: true, data: resultData });
      } catch (error) {
        console.error(error);
        sendResponse({ success: false, error: error.toString() });
      }
    }

    processTranslation();
    return true;
  }
});
