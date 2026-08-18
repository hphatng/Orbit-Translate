'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, Copy, Check, Zap, AlertCircle, FileUp, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { GeminiApiRouter, ApiKeyItem } from '@/lib/geminiApiRouter';

export default function ApiKeysManager() {
  const router = GeminiApiRouter.getInstance();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'bulk'>('single');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency: number; error?: string } | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setKeys(router.getKeys());
  }, []);

  const refreshKeys = () => {
    setKeys(router.getKeys());
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!newKey.trim()) return;

    const added = router.addKey(newKey.trim(), newKeyName.trim() || undefined);
    if (added) {
      setNewKey('');
      setNewKeyName('');
      refreshKeys();
      setNotice({ type: 'success', msg: 'Đã thêm Google Gemini API Key thành công!' });
    } else {
      setNotice({ type: 'error', msg: 'API Key không hợp lệ hoặc đã tồn tại trong danh sách.' });
    }
  };

  const handleBulkAdd = () => {
    setNotice(null);
    if (!bulkText.trim()) return;

    const addedCount = router.bulkAddKeys(bulkText);
    if (addedCount > 0) {
      setBulkText('');
      refreshKeys();
      setNotice({ type: 'success', msg: `Đã tự động trích xuất & thêm ${addedCount} API Keys mới!` });
    } else {
      setNotice({ type: 'error', msg: 'Không tìm thấy API Key (dạng AIzaSy...) hợp lệ nào trong văn bản dán.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotice(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          const addedCount = router.bulkAddKeys(content);
          refreshKeys();
          if (addedCount > 0) {
            setNotice({ type: 'success', msg: `Đã thêm thành công ${addedCount} API Keys từ file!` });
          } else {
            setNotice({ type: 'error', msg: 'Không tìm thấy API Key hợp lệ trong file upload.' });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDelete = (id: string) => {
    router.removeKey(id);
    refreshKeys();
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ API Keys trong danh sách?')) {
      router.clearAllKeys();
      refreshKeys();
    }
  };

  const handleCopy = (id: string, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestKey = async (item: ApiKeyItem) => {
    setTestingId(item.id);
    setTestResult(null);
    const res = await router.testKey(item.key);
    setTestingId(null);
    setTestResult({ id: item.id, ...res });
  };

  const maskKey = (keyStr: string) => {
    if (keyStr.length <= 14) return '••••••••••••••••';
    return `${keyStr.substring(0, 8)}••••••••••••${keyStr.substring(keyStr.length - 6)}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8] text-[10px] font-mono-data font-bold mb-2 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Multi-Key Round Robin
          </div>
          <p className="text-xs text-gray-400">
            Tự động điều phối tải, xoay vòng Key &amp; tránh Rate Limit 429.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5 font-mono-data text-xs shrink-0">
          <Key className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-white font-bold">{keys.length} Keys Sẵn Sàng</span>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-mono-data flex items-center gap-2 border ${
            notice.type === 'success'
              ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Add Keys Input Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveSubTab('single')}
            className={`relative px-4 py-2 text-[11px] font-mono-data font-bold uppercase tracking-wider transition-colors ${
              activeSubTab === 'single' ? 'text-[#818CF8]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {activeSubTab === 'single' && (
              <motion.div layoutId="apiKeySubTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
            Thêm 1 Key Nhãn
          </button>
          <button
            onClick={() => setActiveSubTab('bulk')}
            className={`relative px-4 py-2 text-[11px] font-mono-data font-bold uppercase tracking-wider transition-colors ${
              activeSubTab === 'bulk' ? 'text-[#818CF8]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {activeSubTab === 'bulk' && (
              <motion.div layoutId="apiKeySubTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
            Thêm Hàng Loạt
          </button>
        </div>

        <div className="bg-[#090A0F]/50 border border-white/5 rounded-2xl p-5">
          {activeSubTab === 'single' ? (
            <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-mono-data font-bold text-gray-500 uppercase tracking-wider mb-1">Tên nhãn (tuỳ chọn)</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="vd: Key Dự Phòng 1"
                  className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] transition-colors font-sans"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-mono-data font-bold text-gray-500 uppercase tracking-wider mb-1">Google Gemini API Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] transition-colors font-mono-data"
                />
              </div>
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full justify-center px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Key
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono-data font-bold text-gray-500 uppercase tracking-wider mb-1">Dán danh sách Key (Tự động bóc tách)</label>
                <textarea
                  rows={2}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Dán văn bản hoặc danh sách chứa nhiều API Keys (dạng AIzaSy...)"
                  className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] transition-colors font-mono-data resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono-data font-bold text-gray-300 transition-colors">
                  <FileUp className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Upload File (.txt / .json)</span>
                  <input type="file" accept=".txt,.json" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={handleBulkAdd}
                  className="px-5 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex items-center gap-2"
                >
                  ⚡ Trích Xuất &amp; Thêm Keys
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono-data font-bold text-gray-500 uppercase tracking-wider">
            DANH SÁCH KEYS ĐÃ THÊM ({keys.length})
          </span>

          {keys.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-mono-data text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
            </button>
          )}
        </div>

        {keys.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-gray-500 text-xs font-mono-data space-y-3">
            <Key className="w-8 h-8 mx-auto opacity-40 text-[#6366F1]" />
            <p className="text-gray-400">Chưa có API Key nào được thiết lập.</p>
            <p className="text-[11px] opacity-70">Thêm key cá nhân để sử dụng tính năng Scan &amp; Dịch tự động.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            {keys.map((item, idx) => {
              const isTesting = testingId === item.id;
              const result = testResult?.id === item.id ? testResult : null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans hover:border-white/10 hover:bg-[#12151D] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 shrink-0 rounded-md bg-white/5 text-gray-400 text-[10px] font-mono-data font-bold flex items-center justify-center border border-white/5">
                      {idx + 1}
                    </span>

                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.status === 'HEALTHY' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[9px] font-mono-data font-bold tracking-wider uppercase border border-[#10B981]/20">
                            Active
                          </span>
                        )}
                        {item.status === 'COOLDOWN' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-mono-data font-bold tracking-wider uppercase border border-[#F59E0B]/20">
                            Cooldown
                          </span>
                        )}
                        {item.status === 'DEAD' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-mono-data font-bold tracking-wider uppercase border border-red-500/20">
                            Invalid
                          </span>
                        )}
                      </div>

                      <div className="font-mono-data text-gray-500 text-[11px] mt-0.5">
                        {maskKey(item.key)}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {/* Latency Test Result */}
                    {result && (
                      <span
                        className={`font-mono-data text-[11px] px-2 py-1 rounded-md ${
                          result.success ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {result.success ? `⚡ ${result.latency}ms` : 'Lỗi'}
                      </span>
                    )}

                    {/* Test Button */}
                    <button
                      onClick={() => handleTestKey(item)}
                      disabled={isTesting}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                      title="Ping Test"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#F59E0B]' : 'hover:text-[#F59E0B]'}`} />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(item.id, item.key)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                      title="Copy Key"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 hover:text-white" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Xóa Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
