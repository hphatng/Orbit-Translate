'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  Smartphone,
  Tablet,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowRight,
  MonitorCheck,
} from 'lucide-react';

const STORAGE_KEY_DISMISSED = 'orbit_desktop_advisory_dismissed';
const STORAGE_KEY_PERMANENT = 'orbit_desktop_advisory_permanent';

export default function DesktopAdvisoryModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only run on browser
    if (typeof window === 'undefined') return;

    // Check if user previously opted out permanently or dismissed in this session
    const permanentDismissed = localStorage.getItem(STORAGE_KEY_PERMANENT);
    const sessionDismissed = sessionStorage.getItem(STORAGE_KEY_DISMISSED);

    if (permanentDismissed === 'true' || sessionDismissed === 'true') {
      return;
    }

    // Detect if viewport is below desktop threshold (< 1024px) or mobile device
    const checkDevice = () => {
      const isMobileOrTablet =
        window.innerWidth < 1024 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobileOrTablet) {
        setIsVisible(true);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
    }
  };

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Keyboard accessibility (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, dontShowAgain]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="desktop-advisory-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative w-full max-w-lg bg-[#0F131C] border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 my-auto"
          >
            {/* Top Accent Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

            {/* Header & Visual Illustration */}
            <div className="p-6 sm:p-7 border-b border-white/5 relative">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Header Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-data font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Gợi Ý Trải Nghiệm
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono-data">
                  v1.0 Desktop First
                </span>
              </div>

              {/* Title & Headline */}
              <h3
                id="desktop-advisory-title"
                className="text-xl font-bold text-white font-heading tracking-tight flex items-center gap-2"
              >
                Trải Nghiệm Tốt Nhất Trên Desktop
              </h3>
              <p className="text-xs text-gray-300/80 mt-1.5 leading-relaxed">
                Orbit Translate được tối ưu chuyên sâu cho máy tính (Laptop/PC) để khai phóng toàn bộ sức mạnh dịch thuật &amp; học tập.
              </p>
            </div>

            {/* Visual Device Status Cards */}
            <div className="px-6 py-4 bg-[#141923] border-b border-white/5">
              <div className="grid grid-cols-2 gap-3">
                {/* Desktop Ready Card */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-data bg-emerald-500/20 text-emerald-300">
                      100% Sẵn Sàng
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Desktop &amp; Laptop</h4>
                    <p className="text-[11px] text-emerald-200/70 mt-0.5">
                      Extension 0.1s, FSRS Study Hub &amp; phím tắt
                    </p>
                  </div>
                </div>

                {/* Mobile / Tablet In-Progress Card */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center">
                        <Tablet className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-data bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Đang Phát Triển
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">Mobile &amp; Tablet</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Giao diện cảm ứng đang được hoàn thiện
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Benefits Bullet List */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-white font-medium">Bôi đen tra từ 0.1s:</strong> Tiện ích Chrome Extension hoạt động mượt mà trên trình duyệt máy tính.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <MonitorCheck className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-white font-medium">Không gian học tập rộng rãi:</strong> Hỗ trợ phím tắt 1-4, gõ từ và phân tích ngữ pháp trực quan.
                  </p>
                </div>
              </div>

              {/* Copy Desktop Link Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden text-xs font-mono text-gray-400 pl-1">
                    <span className="text-indigo-400">🔗</span>
                    <span className="truncate">orbit-translate.vercel.app</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-xs font-medium text-indigo-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                  Gửi link sang máy tính để trải nghiệm trọn vẹn mọi tính năng
                </p>
              </div>

              {/* Don't show again toggle */}
              <div className="pt-1 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-1"
                  />
                  <span>Không hiển thị lại trên thiết bị này</span>
                </label>
              </div>
            </div>

            {/* Footer CTA Buttons */}
            <div className="px-6 py-4 bg-[#0B0F17] border-t border-white/5 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Tiếp Tục Xem Trên Thiết Bị Này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
