const DEFAULT_PREFERENCES = {
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
  geminiApiKeys: [],
  ttsVoice: '',
  ttsRate: 1.0,
  ttsPitch: 1.0
};

let currentApiKeys = [];
let isEditingKeys = false;

function renderAccountStatus() {
  const container = document.getElementById('account-status-container');
  const avatar = document.getElementById('account-avatar');
  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  const badgeEl = document.getElementById('account-badge');
  const syncStatusEl = document.getElementById('account-sync-status');
  const btnConnect = document.getElementById('btnConnectAuth');

  if (!container || !btnConnect) return;

  chrome.runtime.sendMessage({ type: 'GET_SYNC_STATUS' }, (statusRes) => {
    chrome.storage.sync.get(['orbitAuthToken'], (res) => {
      const auth = res.orbitAuthToken;
      const isConnected = (statusRes && statusRes.status === 'connected') || (auth && auth.email);

      if (isConnected && (auth?.email || statusRes?.user?.email)) {
        const userEmail = auth?.email || statusRes?.user?.email;
        const userName = auth?.fullName || statusRes?.user?.user_metadata?.full_name || userEmail.split('@')[0];

        avatar.innerText = (userName || userEmail)[0].toUpperCase();
        avatar.style.background = '#e0e7ff';
        avatar.style.color = '#4338ca';
        avatar.style.borderColor = '#c7d2fe';
        
        nameEl.innerText = userName || 'User';
        
        badgeEl.innerHTML = '<span style="width: 4px; height: 4px; border-radius: 50%; background: #10b981;"></span> Connected';
        badgeEl.style.background = '#ecfdf5';
        badgeEl.style.color = '#059669';
        badgeEl.style.borderColor = '#a7f3d0';

        if (emailEl) {
          emailEl.innerText = userEmail;
          emailEl.style.display = 'block';
        }

        if (syncStatusEl) {
          const pendingCount = statusRes?.queue?.pending || 0;
          syncStatusEl.innerText = pendingCount > 0 ? `Syncing (${pendingCount} pending)` : 'Supabase live sync active';
          syncStatusEl.style.display = 'block';
        }

        btnConnect.innerText = 'Sign Out';
        btnConnect.style.background = 'transparent';
        btnConnect.style.borderColor = 'transparent';
        btnConnect.style.color = '#64748b';
        btnConnect.style.boxShadow = 'none';
        btnConnect.onmouseover = () => {
          btnConnect.style.background = '#f1f5f9';
          btnConnect.style.color = '#0f172a';
        };
        btnConnect.onmouseout = () => {
          btnConnect.style.background = 'transparent';
          btnConnect.style.color = '#64748b';
        };

        btnConnect.onclick = () => {
          chrome.runtime.sendMessage({ type: 'DISCONNECT_ACCOUNT' }, () => {
            renderAccountStatus();
          });
        };
      } else {
        avatar.innerText = '?';
        avatar.style.background = '#f1f5f9';
        avatar.style.color = '#475569';
        avatar.style.borderColor = '#e2e8f0';
        
        nameEl.innerText = 'Guest';
        
        badgeEl.innerHTML = '<span style="width: 4px; height: 4px; border-radius: 50%; background: #94a3b8;"></span> Not Connected';
        badgeEl.style.background = '#f8fafc';
        badgeEl.style.color = '#64748b';
        badgeEl.style.borderColor = '#e2e8f0';
        
        if (emailEl) emailEl.style.display = 'none';
        if (syncStatusEl) syncStatusEl.style.display = 'none';

        btnConnect.innerText = 'Connect Account';
        btnConnect.style.background = 'white';
        btnConnect.style.borderColor = '#cbd5e1';
        btnConnect.style.color = '#0f172a';
        btnConnect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
        btnConnect.onmouseover = () => {
          btnConnect.style.background = '#f8fafc';
          btnConnect.style.borderColor = '#94a3b8';
        };
        btnConnect.onmouseout = () => {
          btnConnect.style.background = 'white';
          btnConnect.style.borderColor = '#cbd5e1';
        };

        btnConnect.onclick = () => {
          const extId = chrome.runtime.id;
          chrome.tabs.create({ url: `http://localhost:3000/auth/extension-connect?extensionId=${extId}` });
        };
      }
    });
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (changes.orbitAuthToken || changes.supabaseSession) {
    renderAccountStatus();
  }
});

// Listen for broadcasted tokens from extension-callback tab
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ORBIT_EXTENSION_AUTH_SUCCESS') {
    const { access_token, refresh_token, user } = event.data;
    chrome.runtime.sendMessage({
      type: 'SET_ORBIT_AUTH_TOKEN',
      access_token,
      refresh_token,
      user
    }, () => {
      renderAccountStatus();
    });
  }
});

function saveOptions() {
  const prefs = {
    autoPlayAudio: document.getElementById('autoPlayAudio').checked,
    showIPA: document.getElementById('showIPA').checked,
    showContext: document.getElementById('showContext').checked,
    showGrammar: document.getElementById('showGrammar').checked,
    autoExpandAccordion: document.getElementById('autoExpandAccordion').checked,
    showDifficulty: document.getElementById('showDifficulty').checked,
    showRelated: document.getElementById('showRelated').checked,
    showSRS: document.getElementById('showSRS').checked,
    theme: document.getElementById('theme').value,
    popupSize: document.getElementById('popupSize').value,
    useGemini: document.getElementById('useGemini').checked,
    geminiApiKeys: currentApiKeys,
    ttsVoice: document.getElementById('ttsVoice').value,
    ttsRate: parseFloat(document.getElementById('ttsRate').value),
    ttsPitch: parseFloat(document.getElementById('ttsPitch').value)
  };
  
  chrome.storage.sync.set({ preferences: prefs }, () => {
    const status = document.getElementById('status');
    status.style.display = 'block';
    status.style.opacity = '1';
    
    document.body.className = prefs.theme === 'dark' ? '' : 'theme-light';
    
    setTimeout(() => {
      status.style.opacity = '0';
      setTimeout(() => status.style.display = 'none', 300);
    }, 2000);
  });
}

function renderApiKeys() {
  const list = document.getElementById('apiKeysList');
  const count = document.getElementById('apiKeysCount');
  const emptyState = document.getElementById('emptyKeysState');
  
  list.innerHTML = '';
  
  if (currentApiKeys.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    
    if (isEditingKeys && currentApiKeys.length > 0) {
      const deleteAllDiv = document.createElement('div');
      deleteAllDiv.style.padding = '8px 24px';
      deleteAllDiv.style.borderBottom = '1px solid #e2e8f0';
      deleteAllDiv.style.textAlign = 'right';
      
      const delAllBtn = document.createElement('button');
      delAllBtn.textContent = 'Xóa tất cả';
      delAllBtn.style.background = '#ef4444';
      delAllBtn.style.color = 'white';
      delAllBtn.style.border = 'none';
      delAllBtn.style.padding = '4px 12px';
      delAllBtn.style.borderRadius = '4px';
      delAllBtn.style.fontSize = '12px';
      delAllBtn.style.cursor = 'pointer';
      delAllBtn.onclick = () => {
        if (confirm('Bạn có chắc muốn xóa TOÀN BỘ API Keys?')) {
          currentApiKeys = [];
          renderApiKeys();
          saveOptions();
        }
      };
      deleteAllDiv.appendChild(delAllBtn);
      list.appendChild(deleteAllDiv);
    }
    
    const keysToRender = isEditingKeys ? currentApiKeys : currentApiKeys.slice(0, 3);
    
    keysToRender.forEach((keyObj, index) => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.padding = '12px 24px';
      div.style.borderBottom = '1px solid #e2e8f0';
      
      const nameDiv = document.createElement('div');
      nameDiv.style.flex = '1';
      nameDiv.innerHTML = `<div style="font-size: 13px; font-weight: 500; color: #1e293b;">${keyObj.name || 'Default Key'}</div>`;
      
      const keyStr = keyObj.key || keyObj;
      const maskedKey = keyStr.substring(0, 8) + '•••••••••••••••••••••••••' + keyStr.substring(keyStr.length - 6);
      
      const keyDiv = document.createElement('div');
      keyDiv.style.flex = '2';
      keyDiv.style.paddingLeft = '20px';
      keyDiv.style.display = 'flex';
      keyDiv.style.alignItems = 'center';
      keyDiv.style.gap = '12px';
      
      const keySpan = document.createElement('div');
      keySpan.style.background = '#f1f5f9';
      keySpan.style.padding = '4px 8px';
      keySpan.style.borderRadius = '4px';
      keySpan.style.fontFamily = 'monospace';
      keySpan.style.fontSize = '13px';
      keySpan.style.color = '#475569';
      keySpan.style.border = '1px solid #e2e8f0';
      keySpan.textContent = maskedKey;
      
      const copyBtn = document.createElement('button');
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      copyBtn.style.background = 'none';
      copyBtn.style.border = 'none';
      copyBtn.style.color = '#6b7280';
      copyBtn.style.cursor = 'pointer';
      copyBtn.title = 'Copy Key';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(keyStr);
        copyBtn.style.color = '#10b981';
        setTimeout(() => copyBtn.style.color = '#6b7280', 1500);
      };
      
      const actionsDiv = document.createElement('div');
      actionsDiv.style.width = '80px';
      actionsDiv.style.textAlign = 'right';
      
      const delBtn = document.createElement('button');
      delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
      delBtn.style.background = 'none';
      delBtn.style.border = 'none';
      delBtn.style.color = '#ef4444';
      delBtn.style.cursor = 'pointer';
      delBtn.title = 'Xóa Key';
      delBtn.onclick = () => {
        if(confirm(`Bạn có chắc muốn xóa key "${keyObj.name || 'Default Key'}"?`)) {
          currentApiKeys.splice(index, 1);
          renderApiKeys();
          saveOptions();
        }
      };
      
      keyDiv.appendChild(keySpan);
      keyDiv.appendChild(copyBtn);
      
      if (isEditingKeys) {
        actionsDiv.appendChild(delBtn);
      }
      
      div.appendChild(nameDiv);
      div.appendChild(keyDiv);
      div.appendChild(actionsDiv);
      
      list.appendChild(div);
    });
    
    if (!isEditingKeys && currentApiKeys.length > 3) {
      const moreDiv = document.createElement('div');
      moreDiv.style.padding = '12px 24px';
      moreDiv.style.textAlign = 'center';
      moreDiv.style.fontSize = '12px';
      moreDiv.style.color = '#64748b';
      moreDiv.textContent = `+${currentApiKeys.length - 3} keys bị ẩn. Bấm "Quản lý Keys" để xem.`;
      list.appendChild(moreDiv);
    }
  }
  
  count.textContent = `${currentApiKeys.length}/10`;
  
  const addBtn = document.getElementById('addApiKeyBtn');
  const toggleBtn = document.getElementById('toggleNewKeyFormBtn');
  const fileInput = document.getElementById('apiKeysFileInput');
  if (currentApiKeys.length >= 10) {
    addBtn.disabled = true;
    addBtn.style.opacity = '0.5';
    toggleBtn.disabled = true;
    toggleBtn.style.opacity = '0.5';
    fileInput.disabled = true;
  } else {
    addBtn.disabled = false;
    addBtn.style.opacity = '1';
    toggleBtn.disabled = false;
    toggleBtn.style.opacity = '1';
    fileInput.disabled = false;
  }
}

function restoreOptions() {
  renderAccountStatus();
  chrome.storage.sync.get(['preferences'], (result) => {
    const prefs = result.preferences || DEFAULT_PREFERENCES;
    
    document.getElementById('autoPlayAudio').checked = prefs.autoPlayAudio !== false;
    document.getElementById('showIPA').checked = prefs.showIPA !== false;
    document.getElementById('showContext').checked = prefs.showContext !== false;
    document.getElementById('showGrammar').checked = prefs.showGrammar !== false;
    document.getElementById('autoExpandAccordion').checked = prefs.autoExpandAccordion === true;
    document.getElementById('showDifficulty').checked = prefs.showDifficulty !== false;
    document.getElementById('showRelated').checked = prefs.showRelated !== false;
    document.getElementById('showSRS').checked = prefs.showSRS !== false;
    document.getElementById('theme').value = prefs.theme || 'dark';
    document.getElementById('popupSize').value = prefs.popupSize || '100';
    document.getElementById('useGemini').checked = prefs.useGemini !== false;
    
    document.getElementById('ttsRate').value = prefs.ttsRate || 1.0;
    document.getElementById('ttsRateVal').textContent = (prefs.ttsRate || 1.0) + 'x';
    document.getElementById('ttsPitch').value = prefs.ttsPitch || 1.0;
    document.getElementById('ttsPitchVal').textContent = prefs.ttsPitch || 1.0;
    
    window.preferredVoice = prefs.ttsVoice || '';
    
    let rawKeys = prefs.geminiApiKeys || [];
    currentApiKeys = rawKeys.map((k, idx) => {
      if (typeof k === 'string') {
        return { name: `Key ${idx + 1}`, key: k, addedAt: Date.now() };
      }
      return k;
    });
    
    if (prefs.geminiApiKey && currentApiKeys.length === 0) {
      currentApiKeys = [{ name: 'Default Key', key: prefs.geminiApiKey, addedAt: Date.now() }];
    }
    
    renderApiKeys();
    document.body.className = prefs.theme === 'dark' ? '' : 'theme-light';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

document.querySelectorAll('input[type="checkbox"]:not(#useGemini), select').forEach(input => {
  input.addEventListener('change', saveOptions);
});
document.getElementById('useGemini').addEventListener('change', saveOptions);

const toggleNewKeyFormBtn = document.getElementById('toggleNewKeyFormBtn');
const newKeyFormContainer = document.getElementById('newKeyFormContainer');
toggleNewKeyFormBtn.addEventListener('click', () => {
  isEditingKeys = !isEditingKeys;
  if (isEditingKeys) {
    newKeyFormContainer.style.display = 'block';
    toggleNewKeyFormBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Đóng';
  } else {
    newKeyFormContainer.style.display = 'none';
    toggleNewKeyFormBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Quản lý Keys';
  }
  renderApiKeys();
});

function addKeyFromText(text, name = null) {
  const matches = text.match(/(?:AIzaSy|AQ\.)[A-Za-z0-9_-]{33,}/g);
  let added = 0;
  if (matches) {
    matches.forEach((k) => {
      const exists = currentApiKeys.find(obj => obj.key === k);
      if (currentApiKeys.length < 10 && !exists) {
        currentApiKeys.push({
          name: name || `Key ${currentApiKeys.length + 1}`,
          key: k,
          addedAt: Date.now()
        });
        added++;
      }
    });
  }
  return added;
}

document.getElementById('addApiKeyBtn').addEventListener('click', () => {
  const input = document.getElementById('geminiApiKeyInput');
  const nameInput = document.getElementById('newKeyNameInput');
  const val = input.value.trim();
  const nameVal = nameInput.value.trim();
  
  if (val) {
    const added = addKeyFromText(val, nameVal);
    if (added > 0) {
      input.value = '';
      nameInput.value = '';
      renderApiKeys();
      saveOptions();
    } else {
      alert("Key không hợp lệ hoặc đã tồn tại.");
    }
  } else {
    alert("Vui lòng nhập API Key.");
  }
});

document.getElementById('apiKeysFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    const content = ev.target.result;
    const added = addKeyFromText(content);
    renderApiKeys();
    saveOptions();
    if (added > 0) {
      alert(`Đã thêm thành công ${added} API Keys từ file!`);
      newKeyFormContainer.style.display = 'none';
    } else {
      alert("Không tìm thấy API Key hợp lệ trong file.");
    }
    e.target.value = ''; 
  };
  reader.readAsText(file);
});

function populateVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const voiceSelect = document.getElementById('ttsVoice');
  voiceSelect.innerHTML = '<option value="">Default (Hệ thống)</option>';
  
  if (voices.length === 0) return;

  voices.forEach(voice => {
    if (voice.lang.startsWith('en') || voice.lang.startsWith('vi')) {
      const option = document.createElement('option');
      option.textContent = `${voice.name} (${voice.lang})`;
      
      if (voice.default) {
        option.textContent += ' -- DEFAULT';
      }
      
      option.value = voice.voiceURI;
      
      if (window.preferredVoice === voice.voiceURI) {
        option.selected = true;
      }
      
      voiceSelect.appendChild(option);
    }
  });
}

if ('speechSynthesis' in window) {
  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }
}

document.getElementById('ttsRate').addEventListener('input', (e) => {
  document.getElementById('ttsRateVal').textContent = e.target.value + 'x';
});
document.getElementById('ttsPitch').addEventListener('input', (e) => {
  document.getElementById('ttsPitchVal').textContent = e.target.value;
});

document.getElementById('btnTestVoice').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  const text = "Orbit Translate helps me conquer English every day.";
  const utterance = new SpeechSynthesisUtterance(text);
  
  const selectedVoiceURI = document.getElementById('ttsVoice').value;
  if (selectedVoiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
  }
  
  utterance.rate = parseFloat(document.getElementById('ttsRate').value) || 1.0;
  utterance.pitch = parseFloat(document.getElementById('ttsPitch').value) || 1.0;
  utterance.lang = 'en-US';
  
  window.speechSynthesis.speak(utterance);
});
