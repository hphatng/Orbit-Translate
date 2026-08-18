'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  FolderArchive,
  Terminal,
  Sparkles,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useInstallModal } from '@/lib/context/InstallModalContext';

function ChromeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const GITHUB_REPO_URL = 'https://github.com/hphatng/Orbit-Translate';
const DIRECT_DOWNLOAD_URL = '/downloads/orbit-extension-v3.zip';
const GITHUB_ZIP_FALLBACK = 'https://github.com/hphatng/Orbit-Translate/archive/refs/heads/main.zip';

export default function ExtensionInstallModal() {
  const { isOpen, closeInstallModal } = useInstallModal();
  const [downloadStep, setDownloadStep] = useState<'connecting' | 'preparing' | 'ready'>('connecting');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick-install' | 'github'>('quick-install');

  const triggerDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = DIRECT_DOWNLOAD_URL;
      link.download = 'orbit-extension-v3.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(GITHUB_ZIP_FALLBACK, '_blank');
    }
  };

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Trigger download progression when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const t1 = setTimeout(() => {
      setDownloadStep('preparing');
    }, 450);

    const t2 = setTimeout(() => {
      setDownloadStep('ready');
      triggerDownload();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeInstallModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeInstallModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeInstallModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Obsidian Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-2xl bg-[#0F131C] border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 my-auto"
          >
            {/* Top Accent Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-white/5 flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                  <ChromeIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white font-heading">
                      Cài Đặt Orbit Translate Extension
                    </h3>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      V3 Manifest
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Gói cài đặt trực tiếp từ GitHub Repository chính thức
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeInstallModal}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Đóng popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Server Connection & Download Status Bar */}
            <div className="px-6 py-3.5 bg-[#141923] border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                {downloadStep === 'connecting' && (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400/40 border-t-indigo-400 animate-spin" />
                    <span className="text-indigo-300 font-mono">Đang kết nối kho GitHub...</span>
                  </>
                )}
                {downloadStep === 'preparing' && (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" />
                    <span className="text-sky-300 font-mono">Đang nén gói Orbit Extension v3...</span>
                  </>
                )}
                {downloadStep === 'ready' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-mono font-medium">
                      Đã gửi lệnh tải file orbit-extension-v3.zip (303 KB)
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={triggerDownload}
                  className="btn-primary-indigo !py-1.5 !px-3 !text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải lại file .ZIP</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 pt-4 flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('quick-install')}
                className={`pb-3 text-xs font-semibold tracking-wide transition-colors relative flex items-center gap-2 ${
                  activeTab === 'quick-install' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3 Bước Kích Hoạt Trong Chrome</span>
                {activeTab === 'quick-install' && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('github')}
                className={`ml-6 pb-3 text-xs font-semibold tracking-wide transition-colors relative flex items-center gap-2 ${
                  activeTab === 'github' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Mã Nguồn &amp; GitHub Release</span>
                {activeTab === 'github' && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500"
                  />
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-6">
              {activeTab === 'quick-install' ? (
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      01
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-indigo-400" />
                        Giải nén file ZIP vừa tải về
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Nhấp chuột phải vào file <span className="text-indigo-300 font-mono">orbit-extension-v3.zip</span> trong thư mục Downloads và chọn <strong>Extract All (Giải nén)</strong> vào một thư mục cố định.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      02
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-sky-400" />
                        Mở Quản lý Tiện ích Chrome &amp; Bật Developer Mode
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Mở một tab mới trên Chrome và truy cập địa chỉ bên dưới, sau đó gạt bật công tắc <strong>Developer mode (Chế độ nhà phát triển)</strong> ở góc trên bên phải:
                      </p>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-gray-200">
                        <span className="text-emerald-400 select-all">chrome://extensions</span>
                        <button
                          onClick={copyChromeUrl}
                          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-gray-300 hover:text-white transition-colors"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? 'Đã sao chép!' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      03
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Tải tiện ích đã giải nén (Load Unpacked)
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Nhấn nút <strong>Load unpacked (Tải tiện ích đã giải nén)</strong> ở góc trái và chọn thư mục vừa giải nén. Extension sẽ kích hoạt ngay tức khắc và sẵn sàng bôi đen tra từ 0.1s!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <GithubIcon className="w-4 h-4 text-gray-300" />
                        <span>GitHub Repository Chính Thức</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Open Source
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Mã nguồn mở hoàn toàn được bảo trì trên GitHub. Bạn có thể tự clone repo, build hoặc đóng góp tính năng mới cho Orbit Translate.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary-dark !py-2 !px-3 !text-xs flex items-center gap-1.5"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Xem Repository (hphatng/Orbit-Translate)</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                      <a
                        href={GITHUB_ZIP_FALLBACK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary-dark !py-2 !px-3 !text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải Source Code ZIP từ GitHub</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                    <span>
                      Sau khi cài đặt xong, bạn có thể nhập Gemini API Key cá nhân trong trang Cài đặt của Extension hoặc sử dụng Pool Key Round-Robin mặc định để tra từ miễn phí 100%.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0B0F17] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/docs"
                onClick={closeInstallModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Xem tài liệu hướng dẫn &amp; FAQ chi tiết →</span>
              </Link>
              <button
                onClick={closeInstallModal}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors w-full sm:w-auto"
              >
                Hoàn tất &amp; Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
