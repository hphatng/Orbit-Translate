// Extension Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const statTotalEl = document.getElementById('stat-total');
  const statDueEl = document.getElementById('stat-due');
  const openWebBtn = document.getElementById('open-web');
  const exportQuizletBtn = document.getElementById('export-quizlet');
  const searchInput = document.getElementById('search-input');
  const statusBadge = document.getElementById('sync-status-badge');

  let currentVocabs = [];

  // Check auth and sync status
  chrome.runtime.sendMessage({ type: 'GET_SYNC_STATUS' }, (res) => {
    if (res && res.status === 'connected') {
      const email = res.user?.email || 'User';
      statusBadge.innerText = `🟢 Connected`;
      statusBadge.style.color = '#10b981';
      statusBadge.title = email;
      
      const statSyncEl = document.getElementById('stat-sync');
      if (statSyncEl && res.queue) {
        const pendingCount = res.queue.pending + res.queue.failed;
        statSyncEl.innerText = pendingCount > 0 ? `${pendingCount} pending` : 'Synced';
        statSyncEl.style.color = pendingCount > 0 ? '#f59e0b' : '#10b981';
      }
    } else {
      statusBadge.innerText = '● Guest Mode';
      statusBadge.style.color = '#94a3b8';
      
      const statSyncEl = document.getElementById('stat-sync');
      if (statSyncEl) {
        statSyncEl.innerText = 'Offline';
        statSyncEl.style.color = '#94a3b8';
      }
    }
  });

  // Fetch Stats from storage
  chrome.storage.local.get(['vocabularies'], (data) => {
    currentVocabs = data.vocabularies || [];
    statTotalEl.innerText = currentVocabs.length;

    const now = new Date().toISOString();
    const dueCount = currentVocabs.filter(v => v.srs && v.srs.nextReviewDate <= now).length;
    statDueEl.innerText = dueCount;
  });

  // Open WebApp
  openWebBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://orbit-translate.vercel.app/dashboard' });
  });

  // 1-Click Auto Copy Quizlet CSV Format (Term \t Definition \n)
  exportQuizletBtn.addEventListener('click', () => {
    if (currentVocabs.length === 0) {
      alert('Bạn chưa lưu từ vựng nào để xuất Quizlet!');
      return;
    }

    const csvContent = currentVocabs.map(v => {
      const cleanTerm = v.term.replace(/\t|\n/g, ' ');
      const cleanMeaning = `${v.translation} [IPA: ${v.phonetic || ''}] (Ví dụ: ${v.context?.original || ''})`.replace(/\t|\n/g, ' ');
      return `${cleanTerm}\t${cleanMeaning}`;
    }).join('\n');

    navigator.clipboard.writeText(csvContent).then(() => {
      exportQuizletBtn.innerText = '✅ Đã Copy định dạng Quizlet!';
      exportQuizletBtn.style.background = '#16a34a';
      setTimeout(() => {
        exportQuizletBtn.innerText = '⚡ 1-Click Export Quizlet (CSV)';
        exportQuizletBtn.style.background = '#4255ff';
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy to clipboard', err);
    });
  });

  // Search input enter key handler
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      const term = searchInput.value.trim();
      chrome.tabs.create({ url: `https://orbit-translate.vercel.app/dashboard?search=${encodeURIComponent(term)}` });
    }
  });
});
