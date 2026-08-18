let totalRequests = 0;
let successRequests = 0;
let cacheHits = 0;
let totalLatency = 0;

const btnStart = document.getElementById('btn-start');
const btnCache = document.getElementById('btn-cache');
const btnClear = document.getElementById('btn-clear');
const logContainer = document.getElementById('log-container-inner');
const emptyState = document.getElementById('empty-state');

// DOM Stats
const stTotal = document.getElementById('stat-total');
const stSuccess = document.getElementById('stat-success');
const stLatency = document.getElementById('stat-latency');
const stCache = document.getElementById('stat-cache');

function updateStats() {
  stTotal.textContent = totalRequests;
  stSuccess.textContent = successRequests;
  stCache.textContent = cacheHits;
  stLatency.textContent = successRequests > 0 ? Math.round(totalLatency / successRequests) + ' ms' : '0 ms';
}

function addLogEntry(id, term, status, latency, model, keyIndex, isCache) {
  if (emptyState) emptyState.style.display = 'none';
  
  const div = document.createElement('div');
  div.className = 'grid-row log-item';
  
  let statusHtml = '';
  if (status === 'Pending') {
    statusHtml = `<span class="text-sky font-medium"><span class="loader"></span> Đang xử lý</span>`;
  } else if (status === 'Success') {
    statusHtml = `<span class="text-emerald font-medium">Thành công</span>`;
  } else {
    statusHtml = `<span class="text-red font-medium">Lỗi</span>`;
  }

  let latencyHtml = latency ? `<span class="${latency < 100 ? 'text-emerald' : 'text-amber'} font-mono">${latency}ms</span>` : '-';
  
  let sourceHtml = isCache 
    ? `<span class="tag-cache">RAM Cache</span>` 
    : `<span class="tag-api">API Network</span>`;

  let modelHtml = model ? `<div class="model-info">${model}</div><div class="key-info">Key #${keyIndex}</div>` : '-';

  div.innerHTML = `
    <div class="col-id">#${id}</div>
    <div class="col-term" title="${term}">${term}</div>
    <div id="status-${id}">${statusHtml}</div>
    <div id="lat-${id}">${latencyHtml}</div>
    <div id="mod-${id}">${modelHtml}</div>
    <div style="text-align: right;" id="src-${id}">${status === 'Pending' ? '' : sourceHtml}</div>
  `;
  
  logContainer.prepend(div);
  return div;
}

function updateLogEntry(id, success, data) {
  const statusEl = document.getElementById(`status-${id}`);
  const latEl = document.getElementById(`lat-${id}`);
  const modEl = document.getElementById(`mod-${id}`);
  const srcEl = document.getElementById(`src-${id}`);

  if (success && data.meta) {
    statusEl.innerHTML = `<span class="text-emerald font-medium">Thành công</span>`;
    latEl.innerHTML = `<span class="${data.meta.latency < 100 ? 'text-emerald' : 'text-amber'} font-mono">${data.meta.latency}ms</span>`;
    modEl.innerHTML = `<div class="model-info">${data.meta.model}</div><div class="key-info">Key #${data.meta.keyIndex}</div>`;
    srcEl.innerHTML = data.meta.cached ? `<span class="tag-cache">RAM Cache</span>` : `<span class="tag-api">API Network</span>`;
    
    successRequests++;
    totalLatency += data.meta.latency;
    if (data.meta.cached) cacheHits++;
  } else {
    statusEl.innerHTML = `<span class="text-red font-medium">Lỗi</span>`;
    latEl.innerHTML = `-`;
    modEl.innerHTML = `<div class="text-red" style="font-size: 11px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.error || 'Unknown Error'}">${data.error || 'Failed'}</div>`;
    srcEl.innerHTML = '';
  }
  updateStats();
}

let requestCounter = 0;

async function sendTestRequest(term, isSentence) {
  requestCounter++;
  const id = requestCounter;
  totalRequests++;
  updateStats();

  addLogEntry(id, term, 'Pending', null, null, null, false);

  chrome.storage.sync.get(['preferences'], (data) => {
    const apiKeys = data.preferences?.geminiApiKeys || [];
    
    if (apiKeys.length === 0) {
      updateLogEntry(id, false, { error: 'No API Keys Configured' });
      return;
    }

    chrome.runtime.sendMessage({
      type: 'AI_SMART_ANALYZE',
      text: term,
      context: `This is a test context for ${term}.`,
      apiKeys: apiKeys,
      isSentence: isSentence
    }, (res) => {
      if (res && res.success) {
        updateLogEntry(id, true, res);
      } else {
        updateLogEntry(id, false, res || { error: 'No response' });
      }
    });
  });
}

btnStart.addEventListener('click', () => {
  const terms = [
    "resilient", 
    "innovative technology", 
    "Orbit Translate helps me a lot.", 
    "ephemeral", 
    "Load balancing is crucial for scale."
  ];
  
  // Fire 5 concurrent requests
  terms.forEach(term => {
    const isSentence = term.split(' ').length > 3;
    sendTestRequest(term, isSentence);
  });
});

btnCache.addEventListener('click', () => {
  // Fire a request that was likely already fired (forces RAM Cache)
  sendTestRequest("resilient", false);
});

btnClear.addEventListener('click', () => {
  logContainer.innerHTML = '';
  logContainer.appendChild(emptyState);
  emptyState.style.display = 'block';
  totalRequests = 0;
  successRequests = 0;
  cacheHits = 0;
  totalLatency = 0;
  requestCounter = 0;
  updateStats();
});
