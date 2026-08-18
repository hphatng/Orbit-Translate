'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Lock, 
  Cpu, 
  Rocket, 
  CheckCircle2, 
  Bell, 
  ArrowRight, 
  FileText, 
  Layers, 
  Check,
  Zap,
  BookmarkCheck
} from 'lucide-react';

export default function BookTranslateSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !isSubscribed) {
      setIsSubscribed(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
    }, 400);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 280
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-10 px-4 font-sans relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative rounded-3xl bg-[#131722]/90 border border-white/10 p-6 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        {/* Top Floating Grid Pattern (Subtle Architectural Detail) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        {/* 1. Roadmap Stepper Badge (Replacing flat static pill) */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-[#0F1117]/90 border border-white/10 shadow-lg text-xs font-mono-data">
            {/* Phase 1 Pill */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phase 1: Live</span>
            </div>

            <div className="w-4 h-px bg-gradient-to-r from-emerald-500/60 to-purple-500/60" />

            {/* Phase 2 Pulsing Pill */}
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span>Phase 2: Documents Engine</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Hero Visual: Layered Floating Document Illustration */}
        <motion.div variants={itemVariants} className="relative z-10 flex justify-center mb-8">
          <div className="relative w-72 h-44 sm:w-80 sm:h-48">
            {/* Layer 1: Back document (Source EPUB / Paper) */}
            <motion.div
              animate={{ y: [-3, 3, -3], rotate: [-4, -3, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 left-4 w-60 sm:w-68 h-36 sm:h-40 rounded-2xl bg-[#090A0F] border border-white/10 p-4 shadow-xl opacity-60"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-16 h-2 rounded bg-white/15" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-1.5 rounded bg-white/10" />
                <div className="w-4/5 h-1.5 rounded bg-white/10" />
                <div className="w-3/4 h-1.5 rounded bg-white/10" />
                <div className="w-2/3 h-1.5 rounded bg-white/10" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono-data text-gray-500">
                <span>EN Original</span>
                <span>p. 142</span>
              </div>
            </motion.div>

            {/* Layer 2: Front document (Deep Translated Document with Glow Edge) */}
            <motion.div
              animate={{ y: [3, -3, 3], rotate: [2, 3, 2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-6 left-10 sm:left-12 w-60 sm:w-68 h-36 sm:h-40 rounded-2xl bg-[#181A22] border border-purple-500/40 p-4 shadow-2xl shadow-purple-500/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-[11px] font-mono-data font-bold text-purple-300">VI Bilingual Output</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-1.5 rounded bg-purple-400/40" />
                <div className="w-5/6 h-1.5 rounded bg-indigo-400/30" />
                <div className="w-4/5 h-1.5 rounded bg-purple-400/30" />
                <div className="w-2/3 h-1.5 rounded bg-indigo-400/20" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono-data text-purple-300">
                <span className="flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-purple-400" /> Layout Preserved
                </span>
                <span>100%</span>
              </div>
            </motion.div>

            {/* Central Floating Icon Pill */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-2 right-4 sm:right-6 w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 z-20"
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>

        {/* 3. Main Title & Description */}
        <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            Dịch Sách &amp; Research Paper Chuyên Sâu
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
            Engine AI chuyên dụng xử lý trọn vẹn Ebook (<span className="text-purple-300 font-mono-data font-semibold">.epub, .pdf hàng trăm trang</span>) với công nghệ Deep NLP đa tầng — bảo toàn 100% mục lục, bảng biểu, công thức toán &amp; thuật ngữ học tập.
          </p>
        </motion.div>

        {/* 4. Hierarchical Feature Cards (Standard vs Premium) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 relative z-10 text-left">
          {/* Card 1: Multi-Pass */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-heading text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Multi-Pass Translation
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Dịch ngữ cảnh đa tầng, tự động đối chiếu các chương trước để bảo đảm sự liền mạch văn phong.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono-data text-indigo-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Core Engine
            </div>
          </div>

          {/* Card 2: Smart Glossary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Rocket className="w-4 h-4" />
              </div>
              <h4 className="font-heading text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Smart Book Glossary
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Tự tạo bộ từ điển thuật ngữ độc bản riêng cho từng tài liệu và đồng bộ thẳng về Study Hub.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono-data text-purple-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto FSRS Sync
            </div>
          </div>

          {/* Card 3: High Precision (Premium Tier - Distinctive Depth & Border) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-500/15 to-transparent border border-purple-500/40 shadow-lg shadow-purple-500/10 hover:border-purple-400 transition-all flex flex-col justify-between space-y-3 relative group">
            <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/40 text-[9px] font-mono-data font-bold text-purple-200 uppercase tracking-wider">
              PREMIUM
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4 text-purple-300" />
              </div>
              <h4 className="font-heading text-sm font-bold text-purple-200 group-hover:text-white transition-colors">
                High-Precision LaTeX &amp; Charts
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Bảo lưu tuyệt đối các khối công thức toán LaTeX, biểu đồ và layout 2 cột của tài liệu học thuật.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono-data text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Zero Formula Distortion
            </div>
          </div>
        </motion.div>

        {/* 5. Interactive Early Access / Waitlist CTA */}
        <motion.div variants={itemVariants} className="pt-4 border-t border-white/10 relative z-10 max-w-md mx-auto">
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-1"
            >
              <div className="flex items-center justify-center gap-2 font-bold text-sm font-heading">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Bạn đã đăng ký nhận thông báo sớm!</span>
              </div>
              <p className="text-xs text-emerald-200/80 font-sans">
                Chúng tôi sẽ gửi email thông báo và kích hoạt 500 trang dịch tài liệu miễn phí khi Phase 2 mở thử nghiệm.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email để nhận thông báo..."
                  className="w-full bg-[#090A0F] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors font-sans"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono-data font-bold transition-all shadow-lg shadow-purple-600/30 hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Đăng Ký Chờ</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-center text-gray-400 font-mono-data">
                ✨ Tặng <strong className="text-purple-300 font-bold">500 trang dịch tài liệu AI</strong> cho thành viên đăng ký sớm.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

