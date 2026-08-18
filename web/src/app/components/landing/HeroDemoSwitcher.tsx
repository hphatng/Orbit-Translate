'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, 
  Volume2, 
  Calendar, 
  Brain, 
  MousePointer2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import ExtensionMockup from './ExtensionMockup';
import Link from 'next/link';

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

export default function HeroDemoSwitcher() {
  const [activeTab, setActiveTab] = useState<'extension' | 'webapp'>('extension');
  const [extMode, setExtMode] = useState<'word' | 'sentence'>('word');
  const [isFlipped, setIsFlipped] = useState(false);
  const [nextInterval, setNextInterval] = useState('7 ngày (Good)');

  const handleRating = (ratingText: string, interval: string) => {
    setNextInterval(interval);
    setIsFlipped(true);
  };


  return (
    <div className="w-full max-w-[1040px] relative">
      
      {/* Demo Switcher Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 px-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono-data">
          <MousePointer2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Trải nghiệm tương tác trực tiếp 2 chế độ:</span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('extension')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'extension'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChromeIcon className="w-3.5 h-3.5" />
            <span>1. Chrome Extension Tra Từ</span>
          </button>
          <button
            onClick={() => setActiveTab('webapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'webapp'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. WebApp Study Hub & FSRS</span>
          </button>
        </div>
      </div>

      {/* Main Demo Window */}
      <div className="bg-[#151923] rounded-2xl border border-white/10 shadow-[var(--shadow-card)] text-left relative overflow-hidden">
        
        {/* Window Chrome Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0F131C] border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="bg-white/5 rounded-md px-4 py-1 text-[11px] font-mono-data text-gray-400 border border-white/5">
            {activeTab === 'extension' ? 'techcrunch.com/2026/08/orbit-ai-system' : 'orbit-translate.app/dashboard/study-hub'}
          </div>
          <div className="text-xs font-mono-data text-indigo-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Live Demo</span>
          </div>
        </div>

        {/* Tab 1 Content: Chrome Extension Interactive Reader */}
        <AnimatePresence mode="wait">
          {activeTab === 'extension' && (
            <motion.div
              key="tab-extension"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-5 sm:p-7 relative"
            >
              {/* Secondary Sub-mode pills & Context Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-data font-bold text-indigo-400 uppercase tracking-wider">
                    TechCrunch Article Reader
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono-data hidden sm:inline">
                    • Nhấp vào từ bôi đậm để đổi chế độ
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/50 border border-white/10 text-[11px]">
                  <button
                    onClick={() => setExtMode('word')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      extMode === 'word' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Tra Từ Đơn (Word)
                  </button>
                  <button
                    onClick={() => setExtMode('sentence')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      extMode === 'sentence' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dịch Cả Câu (NLP)
                  </button>
                </div>
              </div>

              {/* 2-COLUMN LAYOUT: Left (Article & Anchored Popup) | Right (AI Inspector & Key Router) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Interactive Article with Closely Anchored Popup */}
                <div className="lg:col-span-7">
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/5 relative">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 font-heading tracking-tight leading-snug">
                      The product development system for teams and agents
                    </h3>

                    {/* Interactive Text Paragraph */}
                    <div className="text-[14px] sm:text-[15px] text-gray-200 leading-[1.8] font-normal relative">
                      <p>
                        Purpose-built for planning and building products. Designed for the AI era. To address potential team needs, the system offers{' '}

                        {/* Anchored Highlight Text */}
                        <span
                          onClick={() => setExtMode(extMode === 'word' ? 'sentence' : 'word')}
                          className="relative inline cursor-pointer group"
                          title="Bấm để chuyển đổi tra từ hoặc dịch cả câu"
                        >
                          <span className="bg-indigo-500/30 text-indigo-200 font-bold px-1.5 py-0.5 rounded border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                            {extMode === 'word' ? 'development' : 'The product development system for teams and agents'}
                          </span>
                        </span>

                        {' '}tools that streamline workflows across design and engineering teams.
                      </p>
                    </div>

                    {/* Anchored Pointer & Popup Container (Anchored directly under the active text) */}
                    <div className="mt-3 relative z-20">
                      {/* Top Pointer Arrow pointing up to the highlighted word */}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-indigo-500/80 ml-6 mb-[-1px] relative z-10" />
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={extMode}
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="w-full"
                        >
                          <ExtensionMockup 
                            mode={extMode} 
                            theme="dark" 
                            className="shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-indigo-500/40 bg-[#141416]/98 backdrop-blur-2xl" 
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: AI Context & Smart Key Pool Router Inspector (Option B) */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="text-xs font-mono-data font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span>AI Context &amp; Key Router</span>
                    <span className="text-emerald-400 text-[11px] font-normal flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Multi-Key Failover
                    </span>
                  </div>

                  {/* Inspector Card 1: Smart AI Key Pool Router Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono-data text-[11px]">Smart AI Key Pool:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono-data text-[10px] font-bold border border-emerald-500/20">
                        🟢 Round-Robin Active
                      </span>
                    </div>
                    <div className="text-white font-medium text-xs flex items-center justify-between">
                      <span>Model Router:</span>
                      <span className="font-mono-data text-indigo-300">Gemini 2.5 Flash / Flash-Lite</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[94%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono-data">
                      <span>Tự động Cooldown khi 429</span>
                      <span>Xoay vòng đa Key tức thì</span>
                    </div>
                  </div>

                  {/* Inspector Card 2: CEFR & Grammar Breakdown */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono-data text-[11px]">CEFR Classification:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono-data text-[10px] font-bold border border-indigo-500/25">
                        {extMode === 'word' ? 'B2 / C1 Academic' : 'Complex Compound Sentence'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-300 leading-relaxed">
                      {extMode === 'word' 
                        ? 'Từ vựng cốt lõi trong Agile/Software Development. Thường xuất hiện trong bài báo công nghệ.'
                        : 'Mệnh đề phức: To address [Infinitive Phrase], the system offers [Main Clause] tools that [Relative Clause].'}
                    </div>
                  </div>

                  {/* Inspector Card 3: Realtime Cloud Sync */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-mono-data uppercase">Realtime Database Sync</span>
                      <span className="text-white font-bold text-xs">PostgreSQL + Supabase RLS</span>
                    </div>
                    <span className="text-[10px] font-mono-data text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Auto-synced
                    </span>
                  </div>

                  {/* Call to action for Extension */}
                  <div className="pt-1">
                    <Link
                      href="/extension"
                      className="btn-secondary-dark w-full justify-center text-xs py-2.5"
                    >
                      <span>Xem toàn bộ 6 tính năng Extension</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </Link>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* Tab 2 Content: WebApp Study Hub & FSRS Interactive Flashcard */}
          {activeTab === 'webapp' && (
            <motion.div
              key="tab-webapp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8"
            >
              {/* Study Hub Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-gray-400">Từ đã lưu</span>
                  <div className="text-2xl font-extrabold text-white mt-0.5">248</div>
                  <span className="text-[10px] text-indigo-400">Đồng bộ từ Extension</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-emerald-400">Cần ôn hôm nay</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">14</div>
                  <span className="text-[10px] text-emerald-400/80">FSRS tính toán</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-sky-400">Độ duy trì trí nhớ</span>
                  <div className="text-2xl font-extrabold text-sky-400 mt-0.5">92.4%</div>
                  <span className="text-[10px] text-sky-400/80">Mục tiêu đạt chuẩn</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-amber-400">Chuỗi học (Streak)</span>
                  <div className="text-2xl font-extrabold text-amber-400 mt-0.5">7 ngày 🔥</div>
                  <span className="text-[10px] text-gray-400">Không ngắt quãng</span>
                </div>
              </div>

              {/* 3D Flashcard & Deck Interactive Demo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* 3D Flashcard */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="text-xs font-mono-data text-gray-400 mb-2.5 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>Bấm thẻ để lật mặt sau, hoặc chọn mức đánh giá:</span>
                  </div>

                  <div className="w-full max-w-[380px] h-[240px] perspective-[1000px] relative">
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full relative cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* FRONT */}
                      <div 
                        className="absolute inset-0 card-obsidian p-6 flex flex-col justify-between items-center text-center rounded-2xl border-white/10 shadow-xl bg-[#11141C]"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex items-center justify-between w-full text-xs font-mono-data text-gray-400 border-b border-white/5 pb-2">
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Thẻ FSRS</span>
                          <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">C1 Advanced</span>
                        </div>

                        <div className="my-auto space-y-1.5">
                          <h3 className="text-3xl font-extrabold text-white font-heading tracking-tight">
                            resilient
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-xs text-[#38BDF8] font-mono-data">
                            <span>/rɪˈzɪl.i.ənt/</span>
                            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-500 font-mono-data flex items-center gap-1">
                          <RotateCw className="w-3 h-3 text-indigo-400" />
                          Chạm để xem nghĩa &amp; câu ví dụ gốc
                        </div>
                      </div>

                      {/* BACK */}
                      <div 
                        className="absolute inset-0 card-obsidian p-6 flex flex-col justify-between text-left rounded-2xl border-indigo-500/40 shadow-xl bg-[#141824]"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="flex items-center justify-between w-full text-xs font-mono-data border-b border-white/5 pb-2">
                          <span className="text-indigo-400 font-bold">✨ FSRS Calculation</span>
                          <span className="text-emerald-400 font-bold">{nextInterval}</span>
                        </div>

                        <div className="space-y-1.5 my-auto">
                          <h4 className="text-xl font-bold text-white">kiên cường, mau phục hồi</h4>
                          <p className="text-xs text-gray-300 italic line-clamp-2">
                            &quot;The community was resilient in the face of adversity.&quot;
                          </p>
                        </div>

                        <div className="text-[11px] text-emerald-400 font-mono-data bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          FSRS: Lần ôn tiếp theo đã được lập lịch!
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 4 FSRS Rating Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 w-full max-w-[380px] mt-4">
                    <button
                      onClick={() => handleRating('Again', '1 ngày (Again)')}
                      className="py-2 px-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono-data font-bold hover:bg-red-500/25 transition-colors"
                    >
                      Quên <span className="block text-[10px] opacity-70">1d</span>
                    </button>
                    <button
                      onClick={() => handleRating('Hard', '3 ngày (Hard)')}
                      className="py-2 px-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono-data font-bold hover:bg-amber-500/25 transition-colors"
                    >
                      Khó <span className="block text-[10px] opacity-70">3d</span>
                    </button>
                    <button
                      onClick={() => handleRating('Good', '7 ngày (Good)')}
                      className="py-2 px-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono-data font-bold hover:bg-indigo-500/25 transition-colors"
                    >
                      Tốt <span className="block text-[10px] opacity-70">7d</span>
                    </button>
                    <button
                      onClick={() => handleRating('Easy', '14 ngày (Easy)')}
                      className="py-2 px-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono-data font-bold hover:bg-emerald-500/25 transition-colors"
                    >
                      Dễ <span className="block text-[10px] opacity-70">14d</span>
                    </button>
                  </div>
                </div>

                {/* Deck List Preview & WebApp CTAs */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-mono-data font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Kho từ vựng đang ôn tập
                  </div>

                  {[
                    { word: 'development', vi: 'sự phát triển', tag: 'C1', interval: 'Trong 2 ngày' },
                    { word: 'streamline', vi: 'tối ưu hóa quy trình', tag: 'B2', interval: 'Trong 5 ngày' },
                    { word: 'adversity', vi: 'nghịch cảnh', tag: 'C2', interval: 'Trong 9 ngày' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.word}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono-data">
                            {item.tag}
                          </span>
                        </div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{item.vi}</div>
                      </div>
                      <div className="text-[11px] font-mono-data text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        {item.interval}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Link
                      href="/web-app"
                      className="btn-secondary-dark w-full justify-center text-xs py-2.5"
                    >
                      <span>Khám phá toàn bộ tính năng WebApp</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </Link>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
