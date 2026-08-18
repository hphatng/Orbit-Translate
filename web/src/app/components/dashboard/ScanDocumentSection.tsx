'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Download, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Languages,
  Layers,
  Inbox,
  Key,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Zap
} from 'lucide-react';
import UnifiedDropzone from './UnifiedDropzone';

interface ScanDocumentSectionProps {
  onAddExtractedToDeck: (selectedItems: any[], jobId: string | null) => void;
}

type UIPhase = 'INPUT' | 'PROCESSING' | 'RESULTS';

export default function ScanDocumentSection({ onAddExtractedToDeck }: ScanDocumentSectionProps) {
  const [currentPhase, setCurrentPhase] = useState<UIPhase>('INPUT');
  const [selectedInput, setSelectedInput] = useState<{ type: 'file' | 'text'; payload: File | string } | null>(null);
  const [sourceText, setSourceText] = useState<string>('');

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [jobError, setJobError] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('WORD');

  // Source document drawer states
  const [isSourceExpanded, setIsSourceExpanded] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [apiKeyStatus, setApiKeyStatus] = useState<'LOADING' | 'HEALTHY' | 'MISSING'>('LOADING');
  const [keyCount, setKeyCount] = useState(0);

  // Quick API Key import states
  const [quickKeyInput, setQuickKeyInput] = useState('');
  const [quickKeyError, setQuickKeyError] = useState<string | null>(null);
  const [quickKeyLoading, setQuickKeyLoading] = useState(false);

  const fetchKeys = async () => {
    const { GeminiApiRouter } = await import('@/lib/geminiApiRouter');
    const router = GeminiApiRouter.getInstance();
    const keys = router.getKeys();
    
    if (Array.isArray(keys) && keys.length > 0) {
      setKeyCount(keys.length);
      const hasHealthy = keys.some((k: any) => k.status === 'HEALTHY' || k.status === 'ACTIVE');
      setApiKeyStatus(hasHealthy ? 'HEALTHY' : 'MISSING');
    } else {
      setApiKeyStatus('MISSING');
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleQuickAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickKeyInput.trim();
    if (!trimmed) return;
    setQuickKeyError(null);
    setQuickKeyLoading(true);

    try {
      const { GeminiApiRouter } = await import('@/lib/geminiApiRouter');
      const router = GeminiApiRouter.getInstance();
      const added = router.addKey(trimmed, 'My Gemini Key');
      if (added) {
        setQuickKeyInput('');
        await fetchKeys();
      } else {
        setQuickKeyError('API Key không hợp lệ hoặc đã có trong danh sách.');
      }
    } catch {
      setQuickKeyError('Lỗi khi lưu key. Vui lòng thử lại.');
    } finally {
      setQuickKeyLoading(false);
    }
  };

  const handleInputComplete = async (input: { type: 'file' | 'text'; payload: File | string }) => {
    setSelectedInput(input);
    if (input.type === 'text') {
      setSourceText(input.payload as string);
    } else {
      setSourceText('');
    }
    setCurrentPhase('PROCESSING');
    setJobStatus('UPLOADING');
    setExtractedItems([]);
    setJobError(null);
    
    try {
      const formData = new FormData();
      if (input.type === 'file') {
        formData.append('file', input.payload as File);
      } else {
        formData.append('text', input.payload as string);
      }

      // Pass API Keys to backend
      const { GeminiApiRouter } = await import('@/lib/geminiApiRouter');
      const keys = GeminiApiRouter.getInstance().getKeys();
      formData.append('apiKeys', JSON.stringify(keys));

      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('API Error:', res.status, errText);
        throw new Error(`API request failed: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      
      if (data.jobId) {
        setJobId(data.jobId);
        pollJobStatus(data.jobId);
      } else {
        throw new Error('No job ID returned');
      }
    } catch (e: any) {
      console.error(e);
      setJobStatus('FAILED');
      setJobError(e?.message || 'Không thể khởi động tiến trình phân tích.');
    }
  };

  const pollJobStatus = async (id: string) => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('document_jobs')
        .select('status, progress_percent, result_summary, error_message')
        .eq('id', id)
        .single();
        
      if (data) {
        setJobStatus(data.status === 'FAILED' ? 'FAILED' : `${data.status} (${data.progress_percent}%)`);
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
          if (data.status === 'COMPLETED') {
            if (data.result_summary?.extracted_items) {
               setExtractedItems(data.result_summary.extracted_items);
            }
            if (data.result_summary?.source_text) {
               setSourceText(data.result_summary.source_text);
            }
            setCurrentPhase('RESULTS');
          } else if (data.status === 'FAILED') {
            setJobError(data.error_message || 'Quá trình xử lý thất bại.');
            setCurrentPhase('RESULTS');
          }
        }
      }
    }, 2000);
  };

  const handleReset = () => {
    setCurrentPhase('INPUT');
    setSelectedInput(null);
    setSourceText('');
    setJobStatus('');
    setJobError(null);
  };

  const tabs = [
    { id: 'WORD', label: 'Từ vựng' },
    { id: 'PHRASE', label: 'Cụm từ' },
    { id: 'COLLOCATION', label: 'Collocations' },
    { id: 'IDIOM', label: 'Idioms' },
    { id: 'GRAMMAR', label: 'Ngữ pháp' },
    { id: 'PROPER_NOUN', label: 'Tên riêng' },
  ];

  const getTabCount = (tabId: string) => {
    return extractedItems.filter(item => item.entryType === tabId).length;
  };

  const currentTabItems = extractedItems.filter(item => item.entryType === activeTab);
  const selectedCount = extractedItems.filter(item => !item.unselected).length;
  const isAllCurrentTabSelected = currentTabItems.length > 0 && currentTabItems.every(item => !item.unselected);

  const toggleSelectAllInTab = () => {
    const shouldSelect = !isAllCurrentTabSelected;
    const newItems = extractedItems.map(item => {
      if (item.entryType === activeTab) {
        return { ...item, unselected: !shouldSelect };
      }
      return item;
    });
    setExtractedItems(newItems);
  };

  const handleCopySource = () => {
    if (!sourceText) return;
    navigator.clipboard.writeText(sourceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find sample document translation from items if available
  const sampleDocumentTranslation = extractedItems.find(item => item.context?.translation)?.context?.translation || '';

  const renderConciseContext = (originalSentence: string, term: string, highlightedTerm?: string) => {
    if (!originalSentence) return null;
    const target = highlightedTerm || term;
    
    // Find index of target term (case-insensitive)
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'i');
    const match = regex.exec(originalSentence);

    if (!match) {
      const words = originalSentence.split(/\s+/).filter(Boolean);
      const isLong = words.length > 10;
      const text = words.slice(0, 10).join(' ') + (isLong ? '...' : '');
      return <span>&ldquo;{text}&rdquo;</span>;
    }

    const matchIdx = match.index;
    const matchedText = match[0];
    const textBefore = originalSentence.slice(0, matchIdx);
    const textAfter = originalSentence.slice(matchIdx + matchedText.length);

    const wordsBefore = textBefore.split(/\s+/).filter(Boolean);
    const wordsAfter = textAfter.split(/\s+/).filter(Boolean);

    const maxBefore = 4;
    const maxAfter = 5;

    const hasPrefix = wordsBefore.length > maxBefore;
    const hasSuffix = wordsAfter.length > maxAfter;

    const snippetBefore = wordsBefore.slice(Math.max(0, wordsBefore.length - maxBefore)).join(' ');
    const snippetAfter = wordsAfter.slice(0, maxAfter).join(' ');

    return (
      <span>
        &ldquo;
        {hasPrefix && '... '}
        {snippetBefore ? snippetBefore + ' ' : ''}
        <strong className="text-indigo-300 font-bold underline decoration-indigo-500/70 underline-offset-2">
          {matchedText}
        </strong>
        {snippetAfter ? ' ' + snippetAfter : ''}
        {hasSuffix && ' ...'}
        &rdquo;
      </span>
    );
  };

  const getCefrBadgeStyle = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'A1':
      case 'A2':
        return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/10';
      case 'B1':
      case 'B2':
        return 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30 shadow-indigo-500/10';
      case 'C1':
      case 'C2':
        return 'text-purple-300 bg-purple-500/15 border-purple-500/30 shadow-purple-500/10';
      default:
        return 'text-gray-300 bg-white/10 border-white/15';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header / Hero Section (Compact & Polished) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              Scan &amp; Extract
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium font-mono-data">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Gemini AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Tải lên tài liệu (.pdf, .docx, .txt) hoặc dán văn bản để AI tự động trích xuất từ vựng, cụm từ &amp; ngữ pháp.
          </p>
        </div>

        {/* Compact Secondary System Status Pill */}
        <div className="flex items-center shrink-0 self-start sm:self-center">
          {apiKeyStatus === 'LOADING' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono-data">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <span>Đang kiểm tra API...</span>
            </div>
          )}
          {apiKeyStatus === 'HEALTHY' && (
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono-data"
              title="Cơ chế tự động xoay vòng API key đang hoạt động"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{keyCount} keys ready · Auto-rotation</span>
            </div>
          )}
          {apiKeyStatus === 'MISSING' && (
            <a 
              href="/settings/api-keys"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-500/20 transition-all font-mono-data shadow-lg shadow-amber-500/10 hover:scale-105"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Chưa có API key · Cài đặt ngay</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Input Phase */}
      {currentPhase === 'INPUT' && (
        <div className="pt-2">
          {apiKeyStatus === 'LOADING' ? (
            <div className="p-12 text-center rounded-3xl bg-[#131722]/80 border border-white/10 max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono-data text-gray-400">Đang kiểm tra cấu hình Gemini API...</p>
            </div>
          ) : apiKeyStatus === 'MISSING' ? (
            /* Locked Gatekeeper Card (Taste Skill FAANG-grade Lock UI) */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-[#131722]/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden font-sans text-center"
            >
              {/* Background Ambient Glow */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-600/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

              {/* Glowing Lock & Key Icon */}
              <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl border border-amber-500/30 animate-ping opacity-50" />
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 z-10">
                  <Key className="w-8 h-8" />
                </div>
              </div>

              {/* Title & Explanatory Text */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-heading tracking-tight">
                Yêu Cầu Gemini API Key Để Bắt Đầu
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto mb-6">
                Tính năng Scan &amp; Extract sử dụng mô hình AI của Google Gemini để phân tích ngữ nghĩa, phân loại cấp độ CEFR và ngữ pháp chuyên sâu. Vui lòng nhập API Key của bạn (BYOK) để mở khóa.
              </p>

              {/* 3 Privacy & Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left text-xs font-sans">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono-data text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Miễn Phí 100%
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Google AI Studio cấp hạn mức miễn phí 15 RPM thoải mái quét.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold font-mono-data text-[11px]">
                    <Lock className="w-3.5 h-3.5" /> Bảo Mật Cục Bộ
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Lưu trực tiếp trên máy của bạn, không bao giờ lưu vĩnh viễn trên server.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold font-mono-data text-[11px]">
                    <Zap className="w-3.5 h-3.5" /> Auto-Rotation
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Hỗ trợ thêm nhiều key tự động xoay vòng tránh Rate Limit.
                  </p>
                </div>
              </div>

              {/* Inline Quick Key Import Form */}
              <form onSubmit={handleQuickAddKey} className="max-w-md mx-auto space-y-3 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type="password"
                      value={quickKeyInput}
                      onChange={(e) => {
                        setQuickKeyInput(e.target.value);
                        setQuickKeyError(null);
                      }}
                      placeholder="Dán Gemini API Key (AIzaSy...)"
                      className="w-full bg-[#090A0F] border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors font-mono-data"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={quickKeyLoading || !quickKeyInput.trim()}
                    className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-mono-data font-bold transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {quickKeyLoading ? (
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Lưu &amp; Quét Ngay</span>
                      </>
                    )}
                  </button>
                </div>
                {quickKeyError && (
                  <p className="text-xs text-rose-400 font-mono-data text-left">{quickKeyError}</p>
                )}
              </form>

              {/* Action Buttons & Links */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-data">
                <a
                  href="/settings/api-keys"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Mở Trang Cài Đặt Chi Tiết</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </a>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 hover:underline"
                >
                  <span>Lấy key miễn phí tại Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ) : (
            <UnifiedDropzone onInputComplete={handleInputComplete} maxSizeMB={25} />
          )}
        </div>
      )}

      {/* 3. Processing Phase (FAANG-grade Radar Scanner) */}
      {currentPhase === 'PROCESSING' && (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#131722] border border-white/10 shadow-2xl max-w-xl mx-auto relative overflow-hidden font-sans">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none" />

          {jobStatus === 'FAILED' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30 shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Quá trình xử lý thất bại</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
                {jobError || 'Đã xảy ra lỗi trong quá trình đọc hoặc phân tích tài liệu. Vui lòng thử lại.'}
              </p>
              <button 
                onClick={handleReset}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại thử file khác
              </button>
            </>
          ) : (
            <div className="space-y-6">
              {/* Radar Scanner Animation */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full border border-indigo-500/30 animate-pulse" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20 z-10">
                  <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1.5 font-heading tracking-tight">
                  Đang phân tích tài liệu Deep NLP...
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate max-w-md mx-auto">
                  {selectedInput?.type === 'file' 
                    ? `File: ${(selectedInput.payload as File).name}`
                    : 'Đang bóc tách từ vựng, cụm từ & cấu trúc ngữ pháp...'}
                </p>
              </div>

              {/* Multi-stage Progress Steps */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono-data">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-indigo-500/30 text-indigo-300 flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>1. Trích xuất text</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-indigo-500/30 text-indigo-300 flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>2. Deep AI Dissect</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span>3. Định dạng thẻ</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono-data text-indigo-300 font-bold tracking-wide">
                  TRẠNG THÁI: {jobStatus || 'Đang gửi yêu cầu'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Results Workspace Phase */}
      {currentPhase === 'RESULTS' && (
        <div className="rounded-2xl bg-[#131722] border border-white/10 shadow-xl overflow-hidden">
          {/* Workspace Document Info Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedInput?.type === 'file' ? (selectedInput.payload as File).name : 'Văn bản trực tiếp'}
                </h3>
                <p className="text-xs text-gray-400">
                  {extractedItems.length} mục trích xuất · {selectedCount} được chọn
                </p>
              </div>
            </div>

            {currentTabItems.length > 0 && (
              <button
                onClick={toggleSelectAllInTab}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 self-start sm:self-center"
              >
                {isAllCurrentTabSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Bỏ chọn tất cả tab này
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Chọn tất cả tab này
                  </>
                )}
              </button>
            )}
          </div>

          {/* DEDICATED SOURCE DOCUMENT VIEWER (Elegantly solves text repetition) */}
          {sourceText && (
            <div className="border-b border-white/10 bg-black/20 px-5 sm:px-6 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={() => setIsSourceExpanded(!isSourceExpanded)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors group"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Văn bản gốc</span>
                  <span className="text-[10px] font-mono-data text-gray-500 group-hover:text-gray-400">
                    ({sourceText.split(/\s+/).filter(Boolean).length} từ)
                  </span>
                  {isSourceExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {sampleDocumentTranslation && (
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        showTranslation 
                          ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' 
                          : 'bg-white/5 text-gray-400 hover:text-gray-200 border-white/10'
                      }`}
                      title="Xem bản dịch tiếng Việt của văn bản"
                    >
                      <Languages className="w-3 h-3" />
                      <span>{showTranslation ? 'Ẩn bản dịch' : 'Xem bản dịch'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopySource}
                    className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/10 transition-colors flex items-center gap-1"
                    title="Sao chép văn bản gốc"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {isSourceExpanded && (
                <div className="mt-3 space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#0F1117] border border-white/5 text-xs sm:text-sm text-gray-200 leading-relaxed max-h-48 overflow-y-auto select-text font-sans">
                    {sourceText}
                  </div>
                  {showTranslation && sampleDocumentTranslation && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-h-48 overflow-y-auto select-text">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 font-mono-data">
                        Bản dịch tham khảo:
                      </div>
                      {sampleDocumentTranslation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Category Tabs with Dynamic Count Badges and Sliding layoutId Indicator */}
          <div className="flex px-4 sm:px-6 border-b border-white/5 space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none relative">
            {tabs.map((tab) => {
              const count = getTabCount(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3.5 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-indigo-300' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono-data px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? 'bg-indigo-500/25 text-indigo-200' 
                      : count > 0 
                        ? 'bg-white/10 text-gray-300' 
                        : 'bg-white/5 text-gray-500'
                  }`}>
                    {count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Results Items List */}
          <div className="p-4 sm:p-6 min-h-[300px]">
            {jobError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Lỗi xử lý: </span>
                  <span>{jobError}</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {extractedItems.length === 0 ? (
                <motion.div
                  key="empty-total"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex flex-col items-center justify-center h-64 text-center p-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5 shadow-lg shadow-indigo-500/10">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white font-heading">Không tìm thấy mục học tập nào</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                    Văn bản quá ngắn hoặc không chứa thuật ngữ học tập phù hợp. Hãy thử dán một đoạn văn bản hoặc tải lên file khác.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl transition-all shadow-sm"
                  >
                    Thử lại với văn bản khác
                  </button>
                </motion.div>
              ) : currentTabItems.length === 0 ? (
                <motion.div
                  key={`empty-tab-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-200">
                    Chưa có mục nào trong tab &ldquo;{tabs.find(t => t.id === activeTab)?.label}&rdquo;
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                    Văn bản này không chứa cấu trúc hoặc loại từ tương ứng.
                  </p>
                  {tabs.find(t => getTabCount(t.id) > 0) && (
                    <button
                      onClick={() => {
                        const firstAvailable = tabs.find(t => getTabCount(t.id) > 0);
                        if (firstAvailable) setActiveTab(firstAvailable.id);
                      }}
                      className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                    >
                      Chuyển sang tab {tabs.find(t => getTabCount(t.id) > 0)?.label} ({getTabCount(tabs.find(t => getTabCount(t.id) > 0)?.id || '')})
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`items-tab-${activeTab}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {currentTabItems.map((item) => {
                    const globalIdx = extractedItems.indexOf(item);
                    const grammar = item.grammarBreakdown;
                    const synonyms = Array.isArray(item.synonyms) ? item.synonyms : [];
                    const antonyms = Array.isArray(item.antonyms) ? item.antonyms : [];
                    const collocations = Array.isArray(item.collocations) ? item.collocations : [];
                    let parsedGrammar: any = null;
                    if (grammar && typeof grammar === 'string') {
                      try { parsedGrammar = JSON.parse(grammar); } catch { parsedGrammar = null; }
                    } else if (grammar && typeof grammar === 'object') {
                      parsedGrammar = grammar;
                    }

                    const isGrammarTab = activeTab === 'GRAMMAR' || item.entryType === 'GRAMMAR' || item.entryType === 'SENTENCE_PATTERN';

                    return (
                      <div 
                        key={globalIdx} 
                        className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all ${
                          !item.unselected
                            ? 'bg-white/[0.03] border-white/10 hover:border-white/15'
                            : 'bg-white/[0.01] border-white/5 opacity-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={!item.unselected}
                          onChange={(e) => {
                            const newItems = [...extractedItems];
                            newItems[globalIdx].unselected = !e.target.checked;
                            setExtractedItems(newItems);
                          }}
                          className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 checked:bg-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer transition-colors" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2.5 flex-wrap">
                            <span className="font-bold text-base sm:text-lg text-white">{item.term}</span>
                            {item.phonetic && (
                              <span className="text-xs text-gray-400 font-mono-data">{item.phonetic}</span>
                            )}
                            {item.cefrLevel && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-mono-data font-bold ${getCefrBadgeStyle(item.cefrLevel)}`}>
                                {item.cefrLevel}
                              </span>
                            )}
                            {item.partOfSpeech && (
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/15 font-medium uppercase font-mono-data">
                                {item.partOfSpeech}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-200 mt-1.5 font-medium leading-relaxed">
                            {item.translation}
                          </p>

                          {/* Dedicated Grammar Breakdown Card View */}
                          {parsedGrammar && isGrammarTab && (
                            <div className="mt-2.5 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-indigo-300 font-mono-data bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/30">
                                  {parsedGrammar.structure}
                                </span>
                                {parsedGrammar.cefrLevel && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 font-mono-data font-semibold">
                                    {parsedGrammar.cefrLevel}
                                  </span>
                                )}
                              </div>
                              {parsedGrammar.explanation && (
                                <p className="text-xs text-gray-200 leading-relaxed">
                                  {parsedGrammar.explanation}
                                </p>
                              )}
                              {Array.isArray(parsedGrammar.partsOfSpeech) && parsedGrammar.partsOfSpeech.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {parsedGrammar.partsOfSpeech.map((posItem: any, posIdx: number) => (
                                    <span key={posIdx} className="text-[11px] bg-black/30 border border-white/5 px-2 py-0.5 rounded text-gray-300">
                                      <strong className="text-indigo-300">{posItem.word}</strong>: {posItem.meaning || posItem.pos}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Streamlined & Concise Context Snippet */}
                          {item.context?.original && !isGrammarTab && (
                            <div className="mt-2.5 pl-3 border-l-2 border-indigo-500/50 py-0.5 bg-white/[0.02] rounded-r-md">
                              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                                {renderConciseContext(item.context.original, item.term, item.context.highlightedTerm)}
                              </p>
                            </div>
                          )}

                          {/* Prominent Synonyms, Antonyms & Collocations Badges */}
                          {(synonyms.length > 0 || antonyms.length > 0 || collocations.length > 0) && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {synonyms.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono-data">Đồng nghĩa:</span>
                                  <span className="text-emerald-200 font-medium">{synonyms.join(', ')}</span>
                                </div>
                              )}
                              {antonyms.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25">
                                  <span className="text-[10px] font-bold text-rose-400 uppercase font-mono-data">Trái nghĩa:</span>
                                  <span className="text-rose-200 font-medium">{antonyms.join(', ')}</span>
                                </div>
                              )}
                              {collocations.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
                                  <span className="text-[10px] font-bold text-amber-400 uppercase font-mono-data">Collocations:</span>
                                  <span className="text-amber-200 font-medium">{collocations.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Bottom Action Bar (Clear Visual Hierarchy) */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02]">
            <button 
              onClick={handleReset}
              className="text-gray-400 hover:text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scan tài liệu khác
            </button>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button 
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-1.5"
                onClick={async () => {
                  const { ExportAdapter } = await import('@/lib/exportAdapters');
                  const itemsToExport = extractedItems.filter(item => !item.unselected);
                  ExportAdapter.export(itemsToExport, 'quizlet', 'orbit_translate_export');
                }}
              >
                <Download className="w-3.5 h-3.5" /> Xuất Quizlet
              </button>
              <button 
                disabled={selectedCount === 0}
                className="btn-primary-indigo text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={() => {
                  const itemsToSave = extractedItems.filter(item => !item.unselected);
                  onAddExtractedToDeck(itemsToSave, jobId);
                }}
              >
                <Check className="w-4 h-4" />
                Lưu vào Study Hub ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
