// Orbit Translate - Content Script (Shadow DOM Isolated Smart Popup)

(function () {
  if (window.__orbitTranslateInjected) return;
  window.__orbitTranslateInjected = true;

  let shadowHost = null;
  let shadowRoot = null;
  let currentSelectionText = '';
  let currentContextSentence = '';
  let lastPopupData = null;
  let lastPopupRect = null;
  let lastPopupPrefs = null;
  let activeTranslationId = 0;

  // Global Drag State for Popup
  let popupDragOffsetX = 0;
  let popupDragOffsetY = 0;
  let isDragging = false;
  let dragInitialX = 0;
  let dragInitialY = 0;
  let selectionTimeout = null;

  // Auto-detect Supabase Auth Session when user visits WebApp (seamless zero-click connection)
  if (window.location.origin === 'http://localhost:3000' || window.location.hostname.includes('orbittranslate.ai')) {
    const syncWebSession = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.access_token && parsed.user) {
                console.log('[Orbit Content] Auto-syncing Supabase Auth to Extension for:', parsed.user.email);
                chrome.runtime.sendMessage({
                  type: 'SET_ORBIT_AUTH_TOKEN',
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                  user: parsed.user
                });
                break;
              }
            }
          }
        }
      } catch (e) {}
    };

    syncWebSession();
    window.addEventListener('storage', syncWebSession);
  }

  document.addEventListener('mouseup', (e) => { 
    isDragging = false; 

    if (shadowRoot) {
      const popup = shadowRoot.querySelector('.orbit-popup');
      if (popup) {
        const path = e.composedPath();
        if (path.includes(popup)) {
          return;
        }
      }
    }

    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      handleSelectionTranslation();
    }, 150);
  });

  document.addEventListener('dblclick', (e) => {
    if (shadowRoot) {
      const popup = shadowRoot.querySelector('.orbit-popup');
      if (popup) {
        const path = e.composedPath();
        if (path.includes(popup)) {
          return;
        }
      }
    }
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      handleSelectionTranslation();
    }, 50);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && shadowRoot) {
      popupDragOffsetX = e.clientX - dragInitialX;
      popupDragOffsetY = e.clientY - dragInitialY;
      const popup = shadowRoot.querySelector('.orbit-popup');
      if (popup) {
        popup.style.animation = 'none'; // Prevent CSS animation from overriding drag transform
        popup.style.transform = `translate3d(${popupDragOffsetX}px, ${popupDragOffsetY}px, 0) scale(var(--orbit-scale, 1))`;
      }
    }
  });

  // Default user preferences fallback
  const DEFAULT_PREFERENCES = {
    autoPlayAudio: true,
    showIPA: true,
    showContext: true,
    showGrammar: true,
    showDifficulty: true,
    showRelated: true,
    showSRS: true,
    theme: 'dark'
  };

  // Create Shadow DOM Container for CSS isolation
  function initShadowDOM() {
    if (shadowHost) return;
    shadowHost = document.createElement('div');
    shadowHost.id = 'orbit-translate-root';
    shadowHost.style.position = 'absolute';
    shadowHost.style.zIndex = '2147483647'; // Max z-index
    shadowHost.style.top = '0px';
    shadowHost.style.left = '0px';
    shadowHost.style.pointerEvents = 'none';

    document.body.appendChild(shadowHost);
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Inject Shadow DOM Styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      :host {
        --bg-primary: #121212;
        --bg-secondary: #1c1c1c;
        --bg-tertiary: #27272a;
        --text-primary: #f4f4f5;
        --text-secondary: #a1a1aa;
        --border-color: #27272a;
        --accent-color: #3b82f6;
        --accent-hover: #60a5fa;
        --badge-bg: #78350f;
        --badge-text: #fcd34d;
        --srs-bg: #1f1f22;

        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-primary);
      }
      
      :host(.theme-light) {
        --bg-primary: #ffffff;
        --bg-secondary: #f4f4f5;
        --bg-tertiary: #e4e4e7;
        --text-primary: #18181b;
        --text-secondary: #71717a;
        --border-color: #e4e4e7;
        --accent-color: #2563eb;
        --accent-hover: #1d4ed8;
        --badge-bg: #fef3c7;
        --badge-text: #d97706;
        --srs-bg: #f8fafc;
      }

      .orbit-popup {
        position: absolute;
        z-index: 2147483647;
        width: 380px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        pointer-events: auto;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--text-primary);
        animation: orbitFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform: scale(var(--orbit-scale, 1));
        transform-origin: top left;
      }
      .orbit-popup.orbit-popup-long {
        width: 600px;
      }
      @keyframes orbitFadeIn {
        from { opacity: 0; transform: translateY(8px) scale(calc(var(--orbit-scale, 1) * 0.98)); }
        to { opacity: 1; transform: translateY(0) scale(var(--orbit-scale, 1)); }
      }
      @keyframes orbitSpin {
        100% { transform: rotate(360deg); }
      }
      .spin-anim {
        animation: orbitSpin 1s linear infinite;
        transform-origin: center;
      }
      
      .orbit-popup::before {
        content: "";
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        transform: rotate(45deg);
        z-index: -1;
      }
      .orbit-popup.arrow-bottom::before {
        bottom: -8px;
        left: 20px;
        border-top: none;
        border-left: none;
      }
      .orbit-popup.arrow-top::before {
        top: -8px;
        left: 20px;
        border-bottom: none;
        border-right: none;
      }
      .orbit-popup.no-arrow::before {
        display: none !important;
      }
      
      .orbit-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
        cursor: grab;
      }
      .orbit-topbar:active { cursor: grabbing; }
      .orbit-lang-select {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .orbit-lang-icon {
        color: var(--text-secondary);
        display: flex;
        align-items: center;
      }
      .orbit-top-actions {
        display: flex;
        gap: 16px;
        color: var(--text-secondary);
      }
      .orbit-icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s;
      }
      .orbit-icon-btn:hover { color: var(--text-primary); }
      
      .orbit-body {
        padding: 20px;
      }
      .orbit-main-term-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .orbit-term-container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      .orbit-term {
        font-weight: 700;
        font-size: 26px;
        color: var(--text-primary);
        margin: 0;
      }
      
      .orbit-phonetic {
        font-size: 14px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      
      .orbit-badge {
        background: var(--badge-bg);
        color: var(--badge-text);
        padding: 4px 8px;
        border-radius: 6px;
        text-align: center;
        font-weight: 700;
        font-size: 12px;
      }
      
      .orbit-translation-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .orbit-translation-text {
        font-size: 26px;
        font-weight: 700;
        color: var(--accent-color);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: opacity 0.3s ease;
        line-height: 1.3;
      }
      
      .orbit-long-text .orbit-term {
        font-size: 16px;
        font-weight: 500;
        line-height: 1.5;
      }
      .orbit-long-text .orbit-translation-text {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.5;
      }
      .orbit-long-text .orbit-phonetic {
        display: none;
      }
      .orbit-long-text .orbit-translation-row {
        align-items: flex-start;
      }
      .orbit-ai-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        word-break: break-word;
        white-space: pre-wrap;
        max-width: 100%;
        box-sizing: border-box;
      }
      .orbit-ai-badge.loading {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
      }
      .orbit-ai-badge.loading svg {
        animation: orbitSpin 1s linear infinite;
      }
      .orbit-ai-badge.done {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
      
      hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 16px 0;
      }
      
      .orbit-section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--accent-color); 
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .orbit-example-container {
        margin-top: 12px;
        border-top: 1px solid var(--border-color);
        padding-top: 16px;
      }
      .orbit-example-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--accent-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .orbit-example-item {
        font-size: 15px;
        line-height: 1.5;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px dashed var(--border-color);
      }
      .orbit-example-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .orbit-ex-en {
        color: var(--text-primary);
        margin-bottom: 6px;
      }
      .orbit-ex-en strong {
        font-weight: 700;
      }
      .orbit-ex-vi {
        color: var(--accent-color);
        font-weight: 600;
        font-style: italic;
        margin-top: 4px;
      }
      
      .orbit-accordion {
        margin-top: 16px;
        border-top: 1px solid var(--border-color);
        padding-top: 16px;
      }
      .orbit-accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
      }
      .orbit-chevron {
        color: var(--text-secondary);
        transition: transform 0.2s;
      }
      .orbit-chevron.open {
        transform: rotate(180deg);
      }
      .orbit-accordion-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out, margin-top 0.3s ease-in-out;
        margin-top: 0;
        padding-left: 24px;
      }
      .orbit-accordion-content.open {
        max-height: 500px;
        margin-top: 12px;
      }
      
      .orbit-grammar-text {
        font-size: 14px;
        color: var(--text-primary);
        line-height: 1.5;
      }
      .orbit-tags-row {
        display: flex;
        align-items: flex-start;
        font-size: 13px;
        margin-bottom: 10px;
      }
      .orbit-tags-label {
        color: var(--text-secondary);
        width: 75px;
        flex-shrink: 0;
        padding-top: 2px;
      }
      .orbit-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .orbit-tag {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
      }
      
      .orbit-footer {
        background: var(--srs-bg);
        margin: 0 20px 20px 20px;
        padding: 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .orbit-srs-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .orbit-srs-desc {
        font-size: 13px;
        color: var(--text-primary);
        line-height: 1.5;
      }
      .orbit-srs-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .orbit-srs-btn:hover {
        background: var(--bg-tertiary);
      }
    `;
    shadowRoot.appendChild(style);
  }

  // Hide existing popup and cleanup
  function removePopup() {
    if (shadowRoot) {
      const popup = shadowRoot.querySelector('.orbit-popup');
      if (popup) popup.remove();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Play Audio TTS
  function playAudio(text, prefs = {}) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      const rate = prefs.ttsRate || 1.0;
      const pitch = prefs.ttsPitch || 1.0;
      const voiceURI = prefs.ttsVoice || '';
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      if (voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === voiceURI);
        if (voice) utterance.voice = voice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Google UK English Female'));
        if (premiumVoice) utterance.voice = premiumVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }

  // Render Smart Popup
  function renderPopup(data, rect, prefs) {
    lastPopupData = data;
    lastPopupRect = rect;
    lastPopupPrefs = prefs;
    initShadowDOM();
    removePopup();

    if (prefs.theme === 'light') {
      shadowHost.classList.add('theme-light');
    } else {
      shadowHost.classList.remove('theme-light');
    }

    const popup = document.createElement('div');
    popup.className = 'orbit-popup';
    if (data.term.length > 50) {
      popup.classList.add('orbit-popup-long');
    }

    if (prefs.popupSize && prefs.popupSize !== '100') {
      const scale = parseInt(prefs.popupSize) / 100;
      popup.style.setProperty('--orbit-scale', scale);
    }

    const iconAudio = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
    const iconCopy = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    const iconCheck = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    const iconSettings = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
    const iconBell = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
    const iconClose = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    const iconStar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    const iconRepeat = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';
    const iconChevron = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    const iconMenu = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    const iconTag = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>';

    const wordCount = data.term.trim().split(/\s+/).length;
    const isSentence = wordCount > 3;
    const sentenceCount = (data.term.match(/[.!?]+/g) || []).length;
    const isTooLong = sentenceCount > 3;

    let difficultyHtml = '';
    let posBadge = '';

    if (!isSentence && data.partOfSpeech) {
      let posColor = 'var(--text-secondary)';
      let posBg = 'var(--bg-tertiary)';
      const posLow = data.partOfSpeech.toLowerCase();
      if (posLow.includes('noun')) { posColor = '#3b82f6'; posBg = 'rgba(59, 130, 246, 0.15)'; }
      else if (posLow.includes('verb')) { posColor = '#ef4444'; posBg = 'rgba(239, 68, 68, 0.15)'; }
      else if (posLow.includes('adj')) { posColor = '#f59e0b'; posBg = 'rgba(245, 158, 11, 0.15)'; }
      else if (posLow.includes('adv')) { posColor = '#8b5cf6'; posBg = 'rgba(139, 92, 246, 0.15)'; }

      posBadge = `<div class="orbit-badge" style="color: ${posColor}; background: ${posBg}; margin-right: 8px;">${data.partOfSpeech}</div>`;
    }

    if (!isSentence && prefs.showDifficulty) {
      let cefr = data.cefrLevel || 'B2';
      difficultyHtml = `
        <div style="display: flex; align-items: center;">
          ${posBadge}
          <div class="orbit-badge">${cefr}</div>
        </div>
      `;
    } else if (posBadge) {
      difficultyHtml = posBadge;
    }

    let ipaHtml = '';
    if (prefs.showIPA && data.phonetic) {
      ipaHtml = `
        <div class="orbit-phonetic">
          <span>${data.phonetic}</span>
          <button class="orbit-icon-btn orbit-audio-trigger" title="Listen">
            ${iconAudio}
          </button>
        </div>
      `;
    }

    function buildExampleHtml(examplesArray) {
      if (!examplesArray || examplesArray.length === 0) return '';
      const iconQuote = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

      let html = `<div class="orbit-example-title">${iconQuote} Ví dụ ngữ cảnh</div>`;
      examplesArray.forEach((ex) => {
        let highlightEn = ex.en;
        if (data.term) {
          const termStr = data.term.trim();
          if (termStr.split(/\s+/).length === 1) {
            let wordsEn = highlightEn.split(/([^a-zA-Z0-9_'-]+)/);
            let termLow = termStr.toLowerCase();
            let bestScore = -999;
            let matches = [];

            function similarity(s1, s2) {
              let s = 0;
              let min = Math.min(s1.length, s2.length);
              for (let i = 0; i < min; i++) {
                if (s1[i] === s2[i]) s++;
                else break;
              }
              s -= Math.abs(s1.length - s2.length) * 0.5;
              return s;
            }

            wordsEn.forEach((w, i) => {
              if (/[a-zA-Z]/.test(w)) {
                let score = similarity(w.toLowerCase(), termLow);
                if (score > termLow.length * 0.4) {
                  if (score > bestScore) {
                    bestScore = score;
                    matches = [i];
                  } else if (score === bestScore) {
                    matches.push(i);
                  }
                }
              }
            });

            matches.forEach(idx => {
              wordsEn[idx] = `<strong class="orbit-highlight">${wordsEn[idx]}</strong>`;
            });
            if (matches.length > 0) highlightEn = wordsEn.join('');
          } else {
            const regexStr = '(' + termStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')';
            const regex = new RegExp(regexStr, 'gi');
            highlightEn = highlightEn.replace(regex, '<strong class="orbit-highlight">$1</strong>');
          }
        }

        html += `
          <div class="orbit-example-item">
            <div class="orbit-ex-en-row" style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div class="orbit-ex-en">${highlightEn}</div>
              <button class="orbit-icon-btn orbit-audio-example-trigger" data-text="${ex.en.replace(/"/g, '&quot;')}" title="Nghe câu này">${iconAudio}</button>
            </div>
            ${ex.vi ? `<div class="orbit-ex-vi">${ex.vi}</div>` : ''}
          </div>
        `;
      });
      return html;
    }

    let exampleHtml = '';
    if (prefs.showContext && !isSentence) {
      let examplesToRender = data.examples && data.examples.length > 0 ? data.examples : [];

      if (examplesToRender.length > 0) {
        exampleHtml = `
          <div class="orbit-example-container" id="orbit-examples-wrapper" style="transition: opacity 0.3s;">
            ${buildExampleHtml(examplesToRender)}
          </div>
        `;
      } else if (prefs.useGemini !== false && (!prefs.geminiApiKeys || prefs.geminiApiKeys.length === 0)) {
        exampleHtml = `
          <div class="orbit-example-container" id="orbit-examples-wrapper" style="transition: opacity 0.3s;">
            <div class="orbit-grammar-text" style="padding: 12px 0; color: var(--text-secondary);">Vui lòng nhập Gemini API Key trong Cài đặt để sử dụng tính năng.</div>
          </div>
        `;
      } else if (prefs.useGemini !== false) {
        exampleHtml = `
          <div class="orbit-example-container orbit-ai-pulse" id="orbit-examples-wrapper" style="transition: opacity 0.3s;">
             <svg style="vertical-align: middle; margin-right: 6px; display: inline-block; animation: spin 2s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
             Đang lấy ví dụ ngữ cảnh...
          </div>
        `;
      }
    }

    let grammarHtml = '';
    if (prefs.showGrammar && isSentence) {
      let innerContent = '';
      if (isTooLong) {
        innerContent = `<div class="orbit-grammar-text" style="color: #ef4444; padding: 12px 0;">Đoạn văn quá dài (>3 câu). Vui lòng bôi đen tối đa 3 câu để xem phân tích ngữ pháp.</div>`;
      } else if (prefs.useGemini === false) {
        innerContent = `<div class="orbit-grammar-text" style="padding: 12px 0; color: var(--text-secondary);">Vui lòng mở chức năng Dịch ngữ cảnh AI để sử dụng tính năng này.</div>`;
      } else if (!prefs.geminiApiKeys || prefs.geminiApiKeys.length === 0) {
        innerContent = `<div class="orbit-grammar-text" style="padding: 12px 0; color: var(--text-secondary);">Vui lòng nhập Gemini API Key trong Cài đặt để sử dụng tính năng.</div>`;
      } else {
        innerContent = `
          <div class="orbit-grammar-text orbit-ai-pulse" id="orbit-grammar-wrapper" style="padding: 12px 0;">
             <svg style="vertical-align: middle; margin-right: 6px; display: inline-block; animation: spin 2s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> 
             Đang phân tích cấu trúc ngữ pháp...
          </div>
          <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
      }
      const autoExpand = prefs.autoExpandAccordion === true;
      grammarHtml = `
        <div class="orbit-accordion ${autoExpand ? 'orbit-accordion-open' : ''}" style="margin-top: 16px;">
          <div class="orbit-accordion-header orbit-grammar-toggle">
            <div class="orbit-section-title">
              ${iconMenu} Phân tích ngữ pháp
            </div>
            <div class="orbit-chevron">${iconChevron}</div>
          </div>
          <div class="orbit-accordion-content" style="${autoExpand ? 'max-height: 500px;' : ''}">
            ${innerContent}
          </div>
        </div>
      `;
    }

    let relatedHtml = '';
    if (prefs.showRelated && ((data.synonyms && data.synonyms.length) || (data.antonyms && data.antonyms.length))) {
      let syns = '';
      if (data.synonyms && data.synonyms.length) {
        syns = `
          <div class="orbit-tags-row">
            <div class="orbit-tags-label">Synonyms:</div>
            <div class="orbit-tags-list">${data.synonyms.map(s => `<span class="orbit-tag">${s}</span>`).join('')}</div>
          </div>
        `;
      }

      let ants = '';
      if (data.antonyms && data.antonyms.length) {
        ants = `
          <div class="orbit-tags-row">
            <div class="orbit-tags-label">Antonyms:</div>
            <div class="orbit-tags-list">${data.antonyms.map(s => `<span class="orbit-tag">${s}</span>`).join('')}</div>
          </div>
        `;
      }

      relatedHtml = `
        <div class="orbit-accordion" style="margin-top: 16px; margin-bottom: 0px;">
          <div class="orbit-accordion-header orbit-related-toggle">
            <div class="orbit-section-title">
              ${iconTag} Từ liên quan
            </div>
            <div class="orbit-chevron">${iconChevron}</div>
          </div>
          <div class="orbit-accordion-content">
            ${syns}
            ${ants}
          </div>
        </div>
      `;
    }

    let srsHtml = '';
    const times = data.translationHistoryCount || 1;
    if (prefs.showSRS) {
      srsHtml = `
        <div class="orbit-footer">
          <div class="orbit-srs-info">
            <div style="color: var(--accent-color);">${iconRepeat}</div>
            <div class="orbit-srs-desc">
              Bạn đã gặp từ này ${times} lần tuần qua.<br>
              Ôn tập tiếp theo: 2 ngày nữa.
            </div>
          </div>
          <button class="orbit-srs-btn" id="orbit-srs-btn">
            Ôn tập
          </button>
        </div>
      `;
    }

    popup.innerHTML = `
      <style>
        .orbit-popup-dynamic-style {}
      </style>
      <div class="orbit-topbar">
        <div class="orbit-lang-select">
          English 
          <span class="orbit-lang-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg></span>
          Tiếng Việt
        </div>
        <div class="orbit-top-actions">
          <button class="orbit-icon-btn" title="Notifications">${iconBell}</button>
          <button class="orbit-icon-btn" id="orbit-open-settings" title="Settings">${iconSettings}</button>
          <button class="orbit-icon-btn" id="orbit-close" title="Close">${iconClose}</button>
        </div>
      </div>

      <div class="orbit-body ${data.term.length > 50 ? 'orbit-long-text' : ''}">
        <div class="orbit-main-term-row">
          <h1 class="orbit-term">${data.term}</h1>
          <div style="display:flex; align-items:center; gap: 12px;">
            <button class="orbit-icon-btn" id="orbit-star-btn" title="Save to Vocabulary">${iconStar}</button>
            ${difficultyHtml}
          </div>
        </div>
        ${ipaHtml}

        <div class="orbit-translation-row">
          <div style="flex: 1; min-width: 0; padding-right: 12px;">
            <div class="orbit-translation-text" id="orbit-main-translation">
              ${data.translation}
            </div>
            ${(prefs.useGemini !== false && prefs.geminiApiKeys && prefs.geminiApiKeys.length > 0) && data.context && data.context.original && data.context.original.length > data.term.length ? `
              <div class="orbit-ai-badge loading" id="orbit-ai-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> AI Context Loading...</div>
            ` : ''}
          </div>
          <div style="display:flex; align-items:center; gap: 16px;">
            <button class="orbit-icon-btn orbit-audio-trigger" title="Listen Translation">${iconAudio}</button>
            <button class="orbit-icon-btn orbit-copy-btn" title="Copy">${iconCopy}</button>
          </div>
        </div>

        ${exampleHtml}
        ${grammarHtml}
        ${relatedHtml}
      </div>

      ${srsHtml}
    `;

    shadowRoot.appendChild(popup);

    const popupHeight = popup.offsetHeight || 380;
    const popupWidth = popup.classList.contains('orbit-popup-long') ? 480 : 380;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let topPos = 0;
    let arrowClass = 'arrow-top';

    if (spaceBelow >= popupHeight + 15) {
      topPos = window.scrollY + rect.bottom + 12;
      arrowClass = 'arrow-top';
    } else if (spaceAbove >= popupHeight + 15) {
      topPos = window.scrollY + rect.top - popupHeight - 12;
      arrowClass = 'arrow-bottom';
    } else {
      topPos = window.scrollY + Math.max(10, (window.innerHeight - popupHeight) / 2);
      arrowClass = 'no-arrow';
    }

    let leftPos = Math.min(window.innerWidth - popupWidth, Math.max(10, window.scrollX + rect.left));
    popup.style.top = (topPos + popupDragOffsetY) + 'px';
    popup.style.left = (leftPos + popupDragOffsetX) + 'px';
    popup.classList.add(arrowClass);

    const arrowLeftPos = Math.max(20, Math.min(popupWidth - 60, (window.scrollX + rect.left + (rect.width / 2)) - leftPos - 8));

    const styleTag = popup.querySelector('style');
    if (styleTag) {
      styleTag.textContent = `.orbit-popup::before { left: ${arrowLeftPos}px !important; }`;
    }

    const hasContextOrIsLong = data.context && data.context.original && (data.context.original.length > data.term.length || isSentence);

    if (prefs.useGemini !== false && prefs.geminiApiKeys && prefs.geminiApiKeys.length > 0 && hasContextOrIsLong) {
      const apiKeys = prefs.geminiApiKeys;

      chrome.runtime.sendMessage({
        type: 'AI_SMART_ANALYZE',
        text: data.term,
        context: data.context.original,
        apiKeys: apiKeys,
        isSentence: isSentence
      }, (res) => {
        const aiBadge = popup.querySelector('#orbit-ai-badge');
        const mainTrans = popup.querySelector('#orbit-main-translation');
        
        if (res && res.success && res.data) {
          if (mainTrans && res.data.translation) {
            mainTrans.style.opacity = '0';
            setTimeout(() => {
              mainTrans.textContent = res.data.translation;
              data.translation = res.data.translation;
              mainTrans.style.opacity = '1';

              aiBadge.className = 'orbit-ai-badge done';
              aiBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> AI Translated';
            }, 150);
          } else if (mainTrans && res.data.raw) {
            mainTrans.textContent = res.data.raw;
          }

          if (isSentence && prefs.showGrammar && res.data.grammarAnalysis) {
            const grammarWrapper = popup.querySelector('#orbit-grammar-wrapper');
            if (grammarWrapper) {
              grammarWrapper.style.opacity = '0';
              grammarWrapper.style.transition = 'opacity 0.3s';
              setTimeout(() => {
                let gHtml = '<ul style="margin: 0; padding-left: 20px; color: var(--text-primary); line-height: 1.5;">';
                res.data.grammarAnalysis.forEach(g => {
                  gHtml += `<li style="margin-bottom: 8px;"><strong style="color: var(--accent-color);">${g.structure}</strong>: ${g.explanation}</li>`;
                });
                gHtml += '</ul>';
                grammarWrapper.innerHTML = gHtml;
                grammarWrapper.style.opacity = '1';
              }, 150);
            }
          }

          if (!isSentence && prefs.showContext && res.data.examples && res.data.examples.length > 0) {
            const exWrapper = popup.querySelector('#orbit-examples-wrapper');
            if (exWrapper) {
              exWrapper.style.opacity = '0';
              setTimeout(() => {
                exWrapper.innerHTML = buildExampleHtml(res.data.examples);
                exWrapper.style.opacity = '1';
                attachExampleAudioListeners(exWrapper);
              }, 150);
            }
          }
        } else {
          if (aiBadge) {
            aiBadge.className = 'orbit-ai-badge';
            aiBadge.style.background = 'rgba(239, 68, 68, 0.15)';
            aiBadge.style.color = '#ef4444';
            aiBadge.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            
            let shortError = res?.error || 'Rate limit';
            if (shortError.toLowerCase().includes('quota') || shortError.toLowerCase().includes('429')) {
              shortError = 'Quota exceeded';
            } else if (shortError.length > 80) {
              shortError = shortError.substring(0, 80) + '...';
            }
            aiBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> AI Failed: <span title="' + (res?.error || '').replace(/"/g, '&quot;') + '">' + shortError + '</span>';
          }
        }
      });
    }

    popup.querySelector('#orbit-close').addEventListener('click', removePopup);
    popup.querySelector('#orbit-open-settings').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    });

    const copyBtn = popup.querySelector('.orbit-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.translation).then(() => {
          copyBtn.style.color = '#10b981';
          copyBtn.innerHTML = iconCheck;
          setTimeout(() => {
            copyBtn.style.color = 'var(--text-secondary)';
            copyBtn.innerHTML = iconCopy;
          }, 1500);
        });
      });
    }

    const starBtn = popup.querySelector('#orbit-star-btn');
    if (starBtn) {
      starBtn.addEventListener('click', () => {
        starBtn.style.color = '#f59e0b';
        starBtn.style.transform = 'scale(1.2)';
        starBtn.setAttribute('title', 'Đã lưu vào bộ từ vựng');
        setTimeout(() => {
          starBtn.style.transform = 'scale(1)';
        }, 200);

        chrome.runtime.sendMessage({
          type: 'SAVE_VOCABULARY',
          vocab: {
            id: 'vocab_' + Date.now(),
            term: data.term,
            translation: data.translation,
            phonetic: data.phonetic,
            partOfSpeech: data.partOfSpeech,
            cefrLevel: data.cefrLevel,
            context: data.context,
            examples: data.examples,
            synonyms: data.synonyms,
            antonyms: data.antonyms,
            createdAt: new Date().toISOString()
          }
        });
      });
    }

    if (prefs.showSRS && popup.querySelector('#orbit-srs-btn')) {
      popup.querySelector('#orbit-srs-btn').addEventListener('click', () => {
        window.open('http://localhost:3000/dashboard', '_blank');
      });
    }

    const grammarToggle = popup.querySelector('.orbit-grammar-toggle');
    if (grammarToggle) {
      grammarToggle.addEventListener('click', () => {
        const content = grammarToggle.nextElementSibling;
        const chevron = grammarToggle.querySelector('.orbit-chevron');
        content.classList.toggle('open');
        chevron.classList.toggle('open');
      });
    }

    const relatedToggle = popup.querySelector('.orbit-related-toggle');
    if (relatedToggle) {
      relatedToggle.addEventListener('click', () => {
        const content = relatedToggle.nextElementSibling;
        const chevron = relatedToggle.querySelector('.orbit-chevron');
        content.classList.toggle('open');
        chevron.classList.toggle('open');
      });
    }

    const audioTrigger = popup.querySelector('.orbit-audio-trigger');
    if (audioTrigger && data.phonetic) {
      audioTrigger.addEventListener('click', () => {
        playAudio(data.audioText || data.term, prefs);
      });
    }

    function attachExampleAudioListeners(container) {
      const btns = container.querySelectorAll('.orbit-audio-example-trigger');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const text = e.currentTarget.getAttribute('data-text');
          if (text) playAudio(text, prefs);
        });
      });
    }
    attachExampleAudioListeners(popup);

    const topbar = popup.querySelector('.orbit-topbar');
    topbar.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      dragInitialX = e.clientX - popupDragOffsetX;
      dragInitialY = e.clientY - popupDragOffsetY;
    });

    if (prefs.autoPlayAudio !== false && data.phonetic && data.phonetic !== '...') {
      playAudio(data.audioText || data.term, prefs);
    }

    // Apply any existing drag offset (preserves position across re-renders)
    if (popupDragOffsetX !== 0 || popupDragOffsetY !== 0) {
      popup.style.animation = 'none'; // Prevent CSS animation from overriding preserved transform
      popup.style.transform = `translate3d(${popupDragOffsetX}px, ${popupDragOffsetY}px, 0) scale(var(--orbit-scale, 1))`;
    }

    const cleanTrans = (data.translation || '').replace(/<[^>]*>?/gm, '').trim();
    if (data.term && cleanTrans && data.phonetic !== '...' && !cleanTrans.startsWith('Lỗi:')) {
      chrome.runtime.sendMessage({
        type: 'SAVE_VOCABULARY',
        vocab: {
          id: 'vocab_' + Date.now(),
          term: data.term,
          translation: cleanTrans,
          phonetic: data.phonetic || '',
          partOfSpeech: data.partOfSpeech || '',
          cefrLevel: data.cefrLevel || 'B2',
          context: data.context,
          examples: data.examples || [],
          synonyms: data.synonyms || [],
          antonyms: data.antonyms || [],
          createdAt: new Date().toISOString()
        }
      });
    }
  }

  function handleSelectionTranslation() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      removePopup();
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 1 || text.length > 5000) {
      removePopup();
      currentSelectionText = '';
      return;
    }
    
    // Prevent popup for URLs or link-like text
    const isUrlText = /^https?:\/\//i.test(text) || 
                      /^www\./i.test(text) || 
                      (!/\s/.test(text) && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(text));

    // Prevent popup if selection is inside an anchor tag
    let isInsideLink = false;
    if (selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      while (node && node !== document.body && node !== document) {
        if (node.nodeName && node.nodeName.toUpperCase() === 'A') {
          isInsideLink = true;
          break;
        }
        node = node.parentNode;
      }
    }

    if (isUrlText || isInsideLink) {
      removePopup();
      currentSelectionText = '';
      return;
    }
    
    // Prevent double triggering for the exact same text
    if (text === currentSelectionText) return;

    let sentenceText = text;
    try {
      const anchorNode = selection.anchorNode;
      if (anchorNode) {
        let parentEl = anchorNode.parentElement;
        if (parentEl) {
          let block = parentEl.closest('p, article, section, li, blockquote, div.paragraph, div[class*="text"]');
          if (!block) {
            block = parentEl;
            while (block && block.parentElement && block.textContent.length < 50 && block.tagName !== 'BODY') {
              block = block.parentElement;
            }
          }
          if (block && block.textContent) {
            sentenceText = block.textContent.trim().slice(0, 500);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to get context sentence", e);
    }
    currentContextSentence = sentenceText.trim();
    currentSelectionText = text;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const thisTranslationId = ++activeTranslationId;

    const processTranslation = () => {
      chrome.storage.sync.get(['preferences'], (result) => {
        if (thisTranslationId !== activeTranslationId) return;
        const prefs = result.preferences || DEFAULT_PREFERENCES;
  
        // Reset drag offset when a completely new selection is made
        popupDragOffsetX = 0;
        popupDragOffsetY = 0;
  
        const loadingData = {
          term: text,
          translation: `<div style="display:flex; align-items:center; gap:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" class="spin-anim"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> 
            <span style="color: var(--text-secondary)">Đang dịch...</span>
          </div>`,
          phonetic: '...',
          cefrLevel: '...',
          translationHistoryCount: 0,
          context: { original: currentContextSentence }
        };
  
        let renderTimeout = setTimeout(() => {
          renderPopup(loadingData, rect, prefs);
        }, 250);
  
        chrome.runtime.sendMessage({
          type: 'GET_VOCAB_HISTORY_COUNT',
          term: text
        }, (resp) => {
          const historyCount = (resp && resp.count) ? resp.count : 0;
  
          chrome.runtime.sendMessage({
            type: 'TRANSLATE_TEXT',
            text: text
          }, (response) => {
            if (thisTranslationId !== activeTranslationId) return;
            clearTimeout(renderTimeout);
            let data;
            if (response && response.success && response.data) {
              data = response.data;
              data.context = { original: data.contextOriginal || currentContextSentence, translation: '' };
              data.translationHistoryCount = historyCount;
            } else {
              data = {
                term: text,
                translation: text.length > 20 ? 'Lỗi: Không thể dịch lúc này.' : `Lỗi dịch vụ cho "${text}"`,
                phonetic: `/${text.toLowerCase()}/`,
                cefrLevel: 'B2',
                synonyms: [],
                translationHistoryCount: historyCount,
                context: { original: currentContextSentence },
                grammarBreakdown: { structure: `Lỗi kết nối`, explanation: `Vui lòng thử lại sau.` }
              };
            }
            renderPopup(data, rect, prefs);
          });
        });
      });
    };

    const hasViDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text);

    if (chrome.i18n && chrome.i18n.detectLanguage) {
      chrome.i18n.detectLanguage(text, (detectResult) => {
        const isVi = detectResult && detectResult.languages && detectResult.languages.length > 0 && detectResult.languages[0].language === 'vi';
        if ((isVi && detectResult.isReliable) || hasViDiacritics) {
          removePopup();
          currentSelectionText = '';
          return;
        }
        processTranslation();
      });
    } else {
      if (hasViDiacritics) {
        removePopup();
        currentSelectionText = '';
        return;
      }
      processTranslation();
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'PING') {
      sendResponse({ status: 'PONG' });
      return true;
    }
    if (request.type === 'ORBIT_TRIGGER_TRANSLATION') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim()) {
        handleSelectionTranslation();
      } else if (request.text) {
        const fakeRect = {
          left: window.innerWidth / 2 - 100,
          top: window.innerHeight / 2 - 50,
          right: window.innerWidth / 2 + 100,
          bottom: window.innerHeight / 2,
          width: 200,
          height: 50
        };
        chrome.storage.sync.get(['preferences'], (result) => {
          const prefs = result.preferences || DEFAULT_PREFERENCES;
          
          popupDragOffsetX = 0;
          popupDragOffsetY = 0;
          
          const loadingData = {
            term: request.text,
            translation: `<div style="display:flex; align-items:center; gap:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" class="spin-anim"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> 
              <span style="color: var(--text-secondary)">Đang dịch...</span>
            </div>`,
            phonetic: '...',
            cefrLevel: '...',
            translationHistoryCount: 0,
            context: { original: request.text }
          };
          
          let renderTimeout = setTimeout(() => {
            renderPopup(loadingData, fakeRect, prefs);
          }, 250);
          
          chrome.runtime.sendMessage({
            type: 'TRANSLATE_TEXT',
            text: request.text
          }, (response) => {
            clearTimeout(renderTimeout);
            let data;
            if (response && response.success && response.data) {
              data = response.data;
              data.context = { original: request.text, translation: '' };
              data.translationHistoryCount = 0;
            } else {
              data = {
                term: request.text,
                translation: `Lỗi dịch vụ cho "${request.text}"`,
                phonetic: `/${request.text.toLowerCase()}/`,
                cefrLevel: 'B2',
                translationHistoryCount: 0,
                grammarBreakdown: { structure: `Lỗi kết nối`, explanation: `Vui lòng thử lại sau.` }
              };
            }
            renderPopup(data, fakeRect, prefs);
          });
        });
      }
      sendResponse({ status: 'OK' });
    }
  });

  // Listen for Auth Sync message from WebApp window
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ORBIT_EXTENSION_AUTH_SUCCESS') {
      chrome.runtime.sendMessage({
        type: 'SET_ORBIT_AUTH_TOKEN',
        access_token: event.data.access_token,
        refresh_token: event.data.refresh_token,
        user: event.data.user
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removePopup();
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (shadowRoot) {
      const popup = shadowRoot.querySelector('.orbit-popup');
      if (popup) {
        const path = e.composedPath();
        if (!path.includes(popup)) {
          removePopup();
        }
      }
    }
  });

  // Realtime options sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.preferences && shadowHost && shadowHost.style.display !== 'none') {
      const newPrefs = changes.preferences.newValue || {
        targetLanguage: 'vi',
        autoPlayAudio: true,
        showIPA: true,
        showContext: true,
        showGrammar: true,
        autoExpandAccordion: false,
        showDifficulty: true,
        showRelated: true,
        showSRS: true,
        theme: 'dark',
        popupSize: '100',
        useGemini: true,
        geminiApiKeys: []
      };
      if (lastPopupData && lastPopupRect) {
        // Debounce slightly to prevent flicker on rapid changes
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          renderPopup(lastPopupData, lastPopupRect, newPrefs);
        }, 50);
      }
    }
  });

})();
