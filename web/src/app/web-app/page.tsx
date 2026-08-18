'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Layers, 
  FileSearch, 
  CheckCircle2, 
  RotateCw, 
  Volume2, 
  Calendar, 
  Zap, 
  Check, 
  X, 
  TrendingUp, 
  ArrowRight,
  LineChart,
  Cpu
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import ScrollReveal from '../components/landing/ScrollReveal';
import Link from 'next/link';

// Dynamic import of 3D WebGL Forgetting Curve component to avoid SSR hydration issues
const FSRS3DCurve = dynamic(() => import('../components/3d/FSRS3DCurve'), { ssr: false });

const modules = [
  {
    id: 'study-hub',
    badge: 'Module 01',
    icon: <Brain className="w-6 h-6 text-indigo-400" />,
    title: 'Study Hub — Quản Lý Kho Từ Vựng Thông Minh',
    desc: 'Toàn bộ từ vựng được tự động phân nhóm theo trình độ CEFR (A1 → C2) kèm chỉ số độ ổn định trí nhớ (Stability) và ngày cần ôn tập tiếp theo do FSRS tính toán.',
    highlights: [
      'Phân loại từ vựng tự động A1 → C2',
      'Đồng bộ tức thời từ Chrome Extension',
      'Lọc theo ngữ cảnh, bài báo và chủ đề',
    ],
    route: '/study-hub',
    ctaText: 'Vào Study Hub',
  },
  {
    id: 'scan-extract',
    badge: 'Module 02',
    icon: <FileSearch className="w-6 h-6 text-sky-400" />,
    title: 'Scan & Extract AI — Quét & Trích Xuất Ngữ Liệu',
    desc: 'Dán đoạn văn bản hoặc tải file PDF học thuật, AI phân tích toàn bộ từ vựng quan trọng, bóc tách cấu trúc câu ngữ pháp và tạo bộ thẻ học chỉ trong 1 thao tác.',
    highlights: [
      'Trích xuất tự động từ bài báo học thuật',
      'Tạo danh sách từ vựng kèm ngữ cảnh',
      'Tiết kiệm 90% thời gian tạo flashcard',
    ],
    route: '/scan-extract',
    ctaText: 'Trải nghiệm Scan & Extract',
  },
  {
    id: 'practice',
    badge: 'Module 03',
    icon: <Layers className="w-6 h-6 text-emerald-400" />,
    title: 'Practice Mode — 3 Chế Độ Luyện Tập Đa Giác Quan',
    desc: 'Không chỉ lật thẻ, bạn rèn luyện phản xạ qua Flashcard 3D, Trắc nghiệm ngữ cảnh (Quiz), và Luyện gõ từ vựng (Typing) kết hợp phát âm giọng bản xứ.',
    highlights: [
      'Flashcard 3D trực quan với 4 nút đánh giá FSRS',
      'Luyện gõ từ và nhận diện phiên âm IPA',
      'Trắc nghiệm điền từ vào câu gốc thực tế',
    ],
    route: '/study-hub/practice',
    ctaText: 'Vào phòng luyện tập',
  },
  {
    id: 'key-router',
    badge: 'Module 04',
    icon: <Cpu className="w-6 h-6 text-violet-400" />,
    title: 'Smart AI Key Pool Router & BYOK Security',
    desc: 'Hỗ trợ thêm API Key cá nhân (Bring Your Own Key) với mã hóa AES-GCM tại máy, kết hợp hệ thống cân bằng tải tự động xoay vòng giữa Gemini 2.5 Flash và OpenAI với 99.99% uptime.',
    highlights: [
      'Xoay vòng key thông minh, zero rate-limit',
      'Bảo mật mã hóa lưu trữ local trên trình duyệt',
      'Tự động fallback model khi server AI gặp sự cố',
    ],
    route: '/settings',
    ctaText: 'Cấu hình API Key & Model',
  },
];

export default function WebAppPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<'Again' | 'Hard' | 'Good' | 'Easy'>('Good');
  const [nextInterval, setNextInterval] = useState('7 ngày (Good)');

  const handleGrade = (grade: 'Again' | 'Hard' | 'Good' | 'Easy', interval: string) => {
    setSelectedGrade(grade);
    setNextInterval(interval);
    setIsFlipped(true);
  };

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#0B0F17] text-gray-100 selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#0B0F17] flex flex-col items-center">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
          <div className="absolute top-[-10%] w-[900px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] mix-blend-screen" />
          <div className="absolute top-[35%] w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px] mix-blend-screen" />
        </div>

        <div className="section-container relative z-10 w-full max-w-[1050px] text-center flex flex-col items-center">
          
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6 backdrop-blur-md">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nền Tảng Quản Lý &amp; Ôn Tập WebApp</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="landing-heading text-4xl sm:text-6xl lg:text-[4.5rem] text-white mb-6 leading-[1.2] max-w-4xl mx-auto [text-wrap:balance]">
              Biến từ vựng đã tra thành <br className="hidden sm:inline" />
              <span className="text-gradient-indigo">kiến thức ghi nhớ vĩnh cửu.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 [text-wrap:balance]">
              Kho tri thức từ vựng tự động đồng bộ từ Chrome Extension, tích hợp thuật toán FSRS Spaced Repetition thế hệ mới giúp bạn thuộc từ với 5 phút mỗi ngày.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-14">
              <Link
                href="/login"
                className="btn-primary-indigo text-[15px]"
                id="webapp-hero-cta"
              >
                <span>Bắt đầu học miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#fsrs-algorithm" className="btn-secondary-dark text-[15px]">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Tìm hiểu thuật toán FSRS</span>
              </a>
            </div>
          </ScrollReveal>

          {/* WebApp Dashboard Mockup Preview */}
          <ScrollReveal delay={250} className="w-full max-w-[920px]">
            <div className="bg-[#151923] rounded-2xl border border-white/10 shadow-[var(--shadow-card)] text-left relative overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0F131C] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="bg-white/5 rounded-md px-4 py-1 text-[11px] font-mono-data text-gray-400 border border-white/5">
                  orbit-translate.app/dashboard/study-hub
                </div>
                <div className="text-xs font-mono-data text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FSRS Engine Active</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-indigo-400">Tổng từ vựng</span>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1">248</div>
                    <span className="text-[10px] text-gray-400">Đã đồng bộ</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-emerald-400">Cần ôn hôm nay</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">14</div>
                    <span className="text-[10px] text-emerald-400/80">Lịch FSRS</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-sky-400">Độ duy trì</span>
                    <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">93.2%</div>
                    <span className="text-[10px] text-sky-400/80">Trí nhớ ổn định</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-amber-400">Chuỗi ngày (Streak)</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">7 ngày 🔥</div>
                    <span className="text-[10px] text-gray-400">Liên tục</span>
                  </div>
                </div>

                {/* Vocabulary Cards Sample Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { word: 'resilient', ipa: '/rɪˈzɪl.i.ənt/', vi: 'kiên cường, phục hồi nhanh', cefr: 'C1', due: 'Hôm nay', dueColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                    { word: 'streamline', ipa: '/ˈstriːm.laɪn/', vi: 'tối ưu hóa quy trình', cefr: 'B2', due: '2 ngày tới', dueColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                    { word: 'perpetuate', ipa: '/pəˈpetʃ.u.eɪt/', vi: 'duy trì kéo dài', cefr: 'C1', due: '5 ngày tới', dueColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                    { word: 'scrutiny', ipa: '/ˈskruː.tɪ.ni/', vi: 'sự kiểm tra kỹ lưỡng', cefr: 'C2', due: '1 tuần tới', dueColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-extrabold text-white">{item.word}</h4>
                          <span className="text-xs font-mono-data text-gray-400">{item.ipa}</span>
                        </div>
                        <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.cefr}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-3">{item.vi}</p>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-data">
                        <span className="text-gray-500">Lịch ôn tập:</span>
                        <span className={`px-2 py-0.5 rounded border ${item.dueColor}`}>
                          {item.due}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <Link
                    href="/dashboard"
                    className="btn-primary-indigo text-xs !py-2.5 !px-6"
                  >
                    ⚡ Trải Nghiệm Dashboard Quản Lý Kho Từ
                  </Link>
                </div>

              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 4 Core WebApp Modules Showcase */}
      <section className="relative py-20 lg:py-28 bg-[#0B0F17] border-t border-white/5">
        <div className="section-container relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                ✨ 4 Trụ Cột Nền Tảng Học Tập
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-5 [text-wrap:balance]">
                Bộ công cụ hoàn chỉnh cho <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">người học tiếng Anh học thuật</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed [text-wrap:balance]">
                Từ việc thu thập từ vựng trên trình duyệt đến các buổi ôn tập khoa học và cân bằng tải API AI cá nhân, WebApp là trung tâm quản trị tri thức của bạn.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {modules.map((m, idx) => (
              <ScrollReveal key={m.id} delay={100 + idx * 100}>
                <div className="card-obsidian p-8 h-full flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {m.icon}
                      </div>
                      <span className="text-xs font-mono-data text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 font-heading">
                      {m.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {m.desc}
                    </p>

                    <div className="space-y-2 mb-8">
                      {m.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Link
                      href={m.route}
                      className="btn-secondary-dark w-full justify-center text-xs py-3"
                    >
                      <span>{m.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* FSRS Algorithm Deep-Dive (Anchor #fsrs-algorithm) */}
      <section id="fsrs-algorithm" className="relative py-20 lg:py-28 bg-[#0F1117] border-t border-white/5 scroll-mt-20">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-0 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="section-container relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thuật Toán FSRS Spaced Repetition Engine</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-5 mt-2 [text-wrap:balance]">
                Cơ chế tối ưu <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">Đường Cong Quên (Forgetting Curve)</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed [text-wrap:balance]">
                FSRS (Free Spaced Repetition Scheduler) mô hình hóa trạng thái trí nhớ theo 3 biến số khoa học: <strong>Độ bền vững (Stability - S)</strong>, <strong>Độ khó (Difficulty - D)</strong> và <strong>Khả năng hồi tưởng (Retrievability - R)</strong>.
              </p>
            </ScrollReveal>
          </div>

          {/* 3D WebGL Forgetting Curve Visualization */}
          <div className="max-w-4xl mx-auto mb-16">
            <ScrollReveal delay={150}>
              <FSRS3DCurve />
            </ScrollReveal>
          </div>

          {/* Interactive FSRS Card & Interval Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
            
            {/* Left: 3D Flashcard */}
            <ScrollReveal delay={150} className="lg:col-span-6 flex flex-col items-center">
              <div className="text-xs font-mono-data text-gray-400 mb-3 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Bấm thẻ để lật hoặc chọn 1 trong 4 mức đánh giá FSRS:</span>
              </div>

              <div className="w-full max-w-[420px] h-[270px] perspective-[1000px] relative">
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full relative cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* FRONT */}
                  <div 
                    className="absolute inset-0 card-obsidian p-8 flex flex-col justify-between items-center text-center rounded-2xl border-white/10 shadow-2xl bg-[#11141C]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between w-full text-xs font-mono-data text-gray-400 border-b border-white/5 pb-2.5">
                      <span className="text-gray-400">Mặt trước (Word)</span>
                      <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">C1 Advanced</span>
                    </div>

                    <div className="my-auto space-y-2">
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                        resilient
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-[#38BDF8] font-mono-data">
                        <span>/rɪˈzɪl.i.ənt/</span>
                        <Volume2 className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 font-mono-data flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-indigo-400" />
                      Chạm thẻ để xem kết quả FSRS &amp; nghĩa tiếng Việt
                    </div>
                  </div>

                  {/* BACK */}
                  <div 
                    className="absolute inset-0 card-obsidian p-8 flex flex-col justify-between text-left rounded-2xl border-indigo-500/40 shadow-2xl bg-[#151926]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="flex items-center justify-between w-full text-xs font-mono-data border-b border-white/5 pb-2.5">
                      <span className="text-indigo-400 font-bold">✨ FSRS Calculation</span>
                      <span className="text-emerald-400 font-bold">Lịch ôn: {nextInterval}</span>
                    </div>

                    <div className="space-y-2 my-auto">
                      <h4 className="text-2xl font-bold text-white">kiên cường, mau phục hồi</h4>
                      <p className="text-xs text-gray-300 italic">
                        &quot;The community was resilient in the face of adversity.&quot;
                      </p>
                      <p className="text-xs text-[#38BDF8]">
                        Cộng đồng đã rất kiên cường trước nghịch cảnh.
                      </p>
                    </div>

                    <div className="text-xs text-emerald-400 font-mono-data bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Thuật toán FSRS: Đã tối ưu lịch ôn tiếp theo!
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 4 Rating Buttons */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-[420px] mt-4">
                <button
                  onClick={() => handleGrade('Again', '1 ngày (Again)')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono-data font-bold border transition-colors ${
                    selectedGrade === 'Again' ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                  }`}
                >
                  Quên <span className="block text-[10px] opacity-70">1 ngày</span>
                </button>

                <button
                  onClick={() => handleGrade('Hard', '3 ngày (Hard)')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono-data font-bold border transition-colors ${
                    selectedGrade === 'Hard' ? 'bg-amber-500/30 border-amber-500 text-amber-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                  }`}
                >
                  Khó <span className="block text-[10px] opacity-70">3 ngày</span>
                </button>

                <button
                  onClick={() => handleGrade('Good', '7 ngày (Good)')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono-data font-bold border transition-colors ${
                    selectedGrade === 'Good' ? 'bg-indigo-500/30 border-indigo-500 text-indigo-300' : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25'
                  }`}
                >
                  Tốt <span className="block text-[10px] opacity-70">7 ngày</span>
                </button>

                <button
                  onClick={() => handleGrade('Easy', '14 ngày (Easy)')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono-data font-bold border transition-colors ${
                    selectedGrade === 'Easy' ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                >
                  Dễ <span className="block text-[10px] opacity-70">14 ngày</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Right: Scientific Forgetting Curve Explanation */}
            <ScrollReveal delay={250} className="lg:col-span-6 space-y-6 text-left">
              <div className="card-obsidian p-7 border-white/10 space-y-4">
                <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Đường cong quên được duỗi thẳng ra sao?
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Theo nghiên cứu tâm lý học Ebbinghaus, não bộ quên 80% kiến thức mới sau 48 giờ nếu không ôn tập.
                </p>
                <div className="space-y-3 font-mono-data text-xs pt-1">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-2">
                    <span className="font-bold">❌ Học vẹt truyền thống:</span>
                    <span>Ôn tập dồn dập trong 1 ngày → Quên 95% sau 1 tuần.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                    <span className="font-bold">⚠️ Thuật toán SM-2 cũ (1987):</span>
                    <span>Khoảng cách cố định, lặp lại quá nhiều lần gây lãng phí 60% thời gian.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                    <span className="font-bold">✅ FSRS Engine (2026):</span>
                    <span>Nhắc ôn chính xác lúc sắp quên (Retention 90%) → Độ bền tăng cấp số nhân.</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Scientific Comparison Table */}
          <ScrollReveal delay={300} className="max-w-4xl mx-auto">
            <div className="card-obsidian overflow-hidden border border-white/10 shadow-2xl">
              
              <div className="grid grid-cols-12 bg-[#13151C] p-5 border-b border-white/10 font-heading text-sm font-bold text-gray-300">
                <div className="col-span-5 text-left">Tiêu chí so sánh</div>
                <div className="col-span-3 text-center text-gray-500">Google Dịch / Quizlet</div>
                <div className="col-span-4 text-center text-emerald-400 flex items-center justify-center gap-1 font-bold">
                  <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" /> Orbit FSRS Engine
                </div>
              </div>

              <div className="divide-y divide-white/5 text-sm">
                
                <div className="grid grid-cols-12 p-5 items-center">
                  <div className="col-span-5 text-left font-semibold text-white">Thuật toán lập lịch</div>
                  <div className="col-span-3 text-center text-gray-500 font-mono-data">Không có / SM-2 cũ</div>
                  <div className="col-span-4 text-center text-emerald-400 font-mono-data font-bold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                    FSRS AI State
                  </div>
                </div>

                <div className="grid grid-cols-12 p-5 items-center">
                  <div className="col-span-5 text-left font-semibold text-white">Tỉ lệ thuộc từ sau 6 tháng</div>
                  <div className="col-span-3 text-center text-red-400 font-mono-data">Dưới 30%</div>
                  <div className="col-span-4 text-center text-emerald-400 font-mono-data font-bold">
                    Trên 90% (Cam kết)
                  </div>
                </div>

                <div className="grid grid-cols-12 p-5 items-center">
                  <div className="col-span-5 text-left font-semibold text-white">Thời gian ôn tập mỗi ngày</div>
                  <div className="col-span-3 text-center text-gray-500 font-mono-data">25 - 30 phút</div>
                  <div className="col-span-4 text-center text-emerald-400 font-mono-data font-bold">
                    Chỉ 5 phút (Giảm 3x)
                  </div>
                </div>

                <div className="grid grid-cols-12 p-5 items-center">
                  <div className="col-span-5 text-left font-semibold text-white">Lưu kèm câu gốc và URL bài viết</div>
                  <div className="col-span-3 text-center text-gray-500 flex justify-center"><X className="w-4 h-4 text-red-400" /></div>
                  <div className="col-span-4 text-center text-emerald-400 flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
                </div>

                <div className="grid grid-cols-12 p-5 items-center">
                  <div className="col-span-5 text-left font-semibold text-white">Quét trích xuất OCR từ PDF/ảnh</div>
                  <div className="col-span-3 text-center text-gray-500 flex justify-center"><X className="w-4 h-4 text-red-400" /></div>
                  <div className="col-span-4 text-center text-emerald-400 flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
                </div>

              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative py-20 bg-gradient-to-b from-[#0B0F17] to-[#080B12] border-t border-white/5 text-center">
        <div className="section-container relative z-10 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-6 [text-wrap:balance]">
              Bắt đầu ghi nhớ từ vựng vĩnh viễn
            </h2>
            <p className="text-gray-300 text-base mb-8 max-w-xl mx-auto [text-wrap:balance]">
              Đăng nhập WebApp miễn phí để quản lý kho từ vựng và luyện tập FSRS mỗi ngày.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="btn-primary-indigo text-base !py-3.5 !px-8"
              >
                <span>Đăng Nhập WebApp — Bắt Đầu Học</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/extension"
                className="btn-secondary-dark text-base !py-3.5 !px-8"
              >
                <span>Xem Chrome Extension</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
