'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';
import HeroDemoSwitcher from './HeroDemoSwitcher';
import { useInstallModal } from '@/lib/context/InstallModalContext';

// Dynamic import of 3D WebGL background to avoid SSR hydration issues
const HeroFloatingWords3D = dynamic(() => import('../3d/HeroFloatingWords3D'), { ssr: false });

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

export default function HeroSection() {
  const { openInstallModal } = useInstallModal();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#0B0F17] flex flex-col items-center overflow-hidden">

      {/* Reader Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cohesive Indigo Glow Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] w-[900px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute top-[30%] w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[130px] mix-blend-screen" />
      </div>

      {/* 3D WebGL Background Floating Words, Letters & IPA Phonetic Symbols */}
      <HeroFloatingWords3D />

      <div className="section-container relative z-10 w-full max-w-[1080px] flex flex-col items-center text-center">

        {/* Top Product Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 text-[13px] font-medium tracking-wide backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chrome Extension V3 + WebApp FSRS Khép Kín</span>
          </div>
        </motion.div>

        {/* Main Headline with Generous Interline Spacing */}
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="landing-heading text-4xl sm:text-6xl lg:text-[4.5rem] text-white mb-8 leading-[1.3] sm:leading-[1.25] mx-auto max-w-[1020px]"
        >
          <span className="block pb-1">Đọc không ngắt quãng.</span>
          <span className="block text-gradient-indigo pt-1 sm:pt-2">Dịch, hiểu và nhớ vĩnh viễn.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg lg:text-[19px] mb-10 max-w-3xl text-gray-300 leading-[1.6] mx-auto"
        >
          Chrome Extension tra từ &amp; dịch thuật ngữ cảnh 0.1s nối liền WebApp <br className="hidden sm:inline" />
          học tập bằng thuật toán FSRS — giúp bạn thuộc từ dài hạn mà không cần chép tay.
        </motion.p>

        {/* Centered Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex justify-center items-center mb-6"
        >
          <button 
            onClick={openInstallModal}
            className="btn-primary-indigo text-[15px] !py-3.5 !px-8 flex items-center gap-2.5 cursor-pointer shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.6)] transition-all" 
            id="hero-cta-primary"
          >
            <ChromeIcon className="w-5 h-5" />
            <span>Thêm vào Chrome — Miễn phí</span>
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 mb-12"
        >
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Miễn phí 100%</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Không cần thẻ tín dụng</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Đồng bộ 1-click sang WebApp</span>
        </motion.div>

        {/* Interactive 2-Tab Demo Widget */}
        <HeroDemoSwitcher />

      </div>

      {/* Right Side Floating "Cuộn để khám phá" Indicator (Fades out smoothly upon scrolling) */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.25 } }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="hidden lg:flex fixed right-6 xl:right-10 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 select-none pointer-events-auto"
          >
            <a
              href="#learning-loop"
              className="group flex flex-col items-center gap-3 text-gray-500 hover:text-indigo-400 transition-colors"
              title="Cuộn để khám phá"
            >
              {/* Animated vertical track line */}
              <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-indigo-500/40 to-indigo-400 relative overflow-hidden">
                <div className="w-full h-1/2 bg-white animate-pulse" />
              </div>

              <span className="[writing-mode:vertical-rl] font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 group-hover:text-indigo-300 transition-colors">
                Cuộn để khám phá
              </span>

              <ArrowDown className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-y-1 transition-transform animate-bounce" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

