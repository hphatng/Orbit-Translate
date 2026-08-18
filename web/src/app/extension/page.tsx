'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  Link2, 
  Zap, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck, 
  DownloadCloud, 
  HelpCircle,
  Brain, 
  Bookmark, 
  Cpu, 
  RefreshCw, 
  Lock, 
  Clock 
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import ScrollReveal from '../components/landing/ScrollReveal';
import ExtensionMockup from '../components/landing/ExtensionMockup';
import ExtensionVideoShowcase from '../components/landing/ExtensionVideoShowcase';

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

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
    title: 'Tra Từ & Dịch Ngữ Cảnh 0.1s',
    desc: 'Chỉ cần bôi đen bất kỳ từ hoặc cụm từ nào, popup thông minh xuất hiện tức thời mà không che khuất dòng đọc chính của bạn.',
    tag: 'Tốc độ tức thì',
  },
  {
    icon: <Brain className="w-6 h-6 text-sky-400" />,
    title: 'Deep NLP Dissection — Bóc Tách Câu',
    desc: 'Phân tích toàn diện cấu trúc ngữ pháp mệnh đề, nhận diện cụm động từ (phrasal verbs) và thành ngữ (idioms) trong ngữ cảnh học thuật.',
    tag: 'Deep NLP AI',
  },
  {
    icon: <Bookmark className="w-6 h-6 text-amber-400" />,
    title: 'Đánh Giá Cấp Độ CEFR & Từ Loại',
    desc: 'Tự động phân loại từ vựng theo khung chuẩn Châu Âu A1 → C2 kèm từ loại (noun, verb, adj), giúp bạn đánh giá ngay độ khó.',
    tag: 'CEFR A1-C2',
  },
  {
    icon: <Link2 className="w-6 h-6 text-emerald-400" />,
    title: 'Lưu Trọn Vẹn Câu Gốc & URL',
    desc: 'Mỗi từ vựng được lưu kèm chính xác câu văn thực tế bạn vừa đọc và link bài viết gốc. Bạn luôn nhớ từ trong ngữ cảnh thực.',
    tag: 'Context Preservation',
  },
  {
    icon: <Volume2 className="w-6 h-6 text-violet-400" />,
    title: 'Phát Âm IPA & Audio Bản Xứ',
    desc: 'Phiên âm quốc tế chuẩn kèm phát âm giọng đọc bản xứ tự nhiên, hỗ trợ rèn luyện phát âm chính xác từ lần đầu gặp từ.',
    tag: 'Phonetic TTS',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
    title: 'Smart AI Key Pool Router',
    desc: 'Cơ chế điều phối xoay vòng đa Key Round-Robin, tự động Cooldown khi chạm 429 quota và fallback model mượt mà không gián đoạn.',
    tag: 'Round-Robin Pool',
  },
];

const installSteps = [
  {
    step: '01',
    title: 'Cài Đặt Từ Chrome Web Store',
    desc: 'Truy cập Chrome Web Store và bấm nút "Thêm vào Chrome" (Add to Chrome). Quá trình diễn ra tự động trong chưa đầy 5 giây.',
  },
  {
    step: '02',
    title: 'Ghim Lên Thanh Công Cụ',
    desc: 'Bấm vào biểu tượng mảnh ghép (Extensions) ở góc trên bên phải trình duyệt, sau đó chọn Ghim (Pin) Orbit Translate.',
  },
  {
    step: '03',
    title: 'Bôi Đen & Trải Nghiệm',
    desc: 'Mở bất kỳ bài báo, tài liệu tiếng Anh (TechCrunch, Medium, Wikipedia...) và bôi đen từ hoặc câu để trải nghiệm popup AI tức thì.',
  },
];

const faqs = [
  {
    q: 'Orbit Extension có hoạt động trên mọi website không?',
    a: 'Có. Orbit Translate hoạt động mượt mà trên tất cả các trang web tin tức, blog chuyên ngành, tài liệu kỹ thuật, và cả trình đọc PDF trên trình duyệt Chrome.',
  },
  {
    q: 'Extension có làm chậm trình duyệt Chrome không?',
    a: 'Hoàn toàn không. Orbit Translate được xây dựng trên chuẩn Google Chrome Manifest V3 mới nhất, tối ưu bộ nhớ cực thấp và script chỉ kích hoạt khi bạn thực hiện thao tác bôi đen.',
  },
  {
    q: 'Tôi có cần đăng nhập để sử dụng tính năng tra từ không?',
    a: 'Bạn có thể tra từ đơn và dịch câu hoàn toàn tự do ngay sau khi cài đặt. Đăng nhập tài khoản sẽ kích hoạt tính năng tự động đồng bộ từ vựng sang WebApp để ôn tập FSRS.',
  },
  {
    q: 'Dữ liệu duyệt web của tôi có được bảo mật không?',
    a: 'Orbit Translate cam kết bảo mật quyền riêng tư tuyệt đối. Chúng tôi không theo dõi, không thu thập và không lưu trữ lịch sử duyệt web của người dùng.',
  },
];

export default function ExtensionPage() {
  const [demoMode, setDemoMode] = useState<'word' | 'sentence'>('word');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#0B0F17] text-gray-100 selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#0B0F17] flex flex-col items-center">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
          <div className="absolute top-[-10%] w-[900px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] mix-blend-screen" />
          <div className="absolute top-[35%] w-[600px] h-[350px] bg-sky-600/10 rounded-full blur-[130px] mix-blend-screen" />
        </div>

        <div className="section-container relative z-10 w-full max-w-[1080px] text-center flex flex-col items-center">
          
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6 backdrop-blur-md">
              <ChromeIcon className="w-3.5 h-3.5" />
              <span>Chrome Extension Tra Từ Chuyên Sâu</span>
            </div>
          </ScrollReveal>

          {/* Strictly Formatted 2-Line Heading */}
          <ScrollReveal delay={100}>
            <h1 className="landing-heading text-3xl sm:text-5xl lg:text-[4rem] text-white mb-6 leading-[1.28] sm:leading-[1.24] max-w-4xl mx-auto">
              <span className="block pb-1">Đọc báo &amp; Tài liệu mượt mà.</span>
              <span className="block text-gradient-indigo pt-1 sm:pt-2">Dịch ngữ cảnh chỉ trong 0.1s</span>
            </h1>
          </ScrollReveal>

          {/* Strictly Formatted Subheading */}
          <ScrollReveal delay={150}>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 [text-wrap:balance]">
              Trợ lý Chrome Extension thông minh giúp bạn đọc hiểu mọi văn bản tiếng Anh chuyên ngành <br className="hidden sm:inline" />
              mà không cần chuyển tab hay tra từ điển rời rạc.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-12">
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-indigo text-[15px]"
                id="extension-hero-cta"
              >
                <ChromeIcon className="w-5 h-5" />
                <span>Thêm vào Chrome — Miễn phí 100%</span>
              </a>
              <a href="#install-guide" className="btn-secondary-dark text-[15px]">
                <span>Xem hướng dẫn cài đặt</span>
              </a>
            </div>
          </ScrollReveal>

          {/* Interactive Extension Showcase Widget (Spacious max-w-[1040px]) */}
          <ScrollReveal delay={250} className="w-full max-w-[1040px]">
            <div className="bg-[#151923] rounded-2xl border border-white/10 shadow-[var(--shadow-card)] text-left relative overflow-hidden">
              
              {/* Browser Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0F131C] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="bg-white/5 rounded-md px-4 py-1 text-[11px] font-mono-data text-gray-400 border border-white/5">
                  medium.com/engineering/modern-ai-architecture
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/5 text-[11px]">
                  <button
                    onClick={() => setDemoMode('word')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      demoMode === 'word' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Tra Từ Đơn
                  </button>
                  <button
                    onClick={() => setDemoMode('sentence')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      demoMode === 'sentence' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dịch Cả Câu NLP
                  </button>
                </div>
              </div>

              {/* Demo Content Area: 2-Column with Anchored Popup & Inspector */}
              <div className="p-5 sm:p-7 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left: Article with Anchored Popup */}
                  <div className="lg:col-span-7">
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/5 relative">
                      <div className="text-xs font-mono-data font-bold text-indigo-400 uppercase tracking-wider mb-2">
                        Medium Article Reader
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 font-heading tracking-tight leading-snug">
                        The product development system for teams and agents
                      </h3>

                      <div className="text-[14px] sm:text-[15px] text-gray-200 leading-[1.8] font-normal mb-3">
                        <p>
                          Purpose-built for planning and building products. Designed for the AI era. To address potential team needs, the system offers{' '}
                          <span
                            onClick={() => setDemoMode(demoMode === 'word' ? 'sentence' : 'word')}
                            className="relative inline cursor-pointer group"
                            title="Bấm để chuyển chế độ"
                          >
                            <span className="bg-indigo-500/30 text-indigo-200 font-bold px-1.5 py-0.5 rounded border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                              {demoMode === 'word' ? 'development' : 'The product development system for teams and agents'}
                            </span>
                          </span>{' '}
                          tools that streamline workflows across design and engineering teams.
                        </p>
                      </div>

                      {/* Anchored Popup */}
                      <div className="mt-3 relative z-20">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-indigo-500/80 ml-6 mb-[-1px] relative z-10" />
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={demoMode}
                            initial={{ opacity: 0, scale: 0.98, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="w-full"
                          >
                            <ExtensionMockup 
                              mode={demoMode} 
                              theme="dark" 
                              className="shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-indigo-500/40 bg-[#141416]/98 backdrop-blur-2xl" 
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Right: AI Key Router & Context Inspector */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <div className="text-xs font-mono-data font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Smart Key Router Live</span>
                      <span className="text-emerald-400 text-[11px] font-mono-data flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Multi-Key Failover
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono-data text-[11px]">
                        <span className="text-gray-400">Model Router:</span>
                        <span className="text-indigo-300 font-bold">Gemini 2.5 Flash</span>
                      </div>
                      <div className="flex items-center justify-between font-mono-data text-[11px]">
                        <span className="text-gray-400">Auto Failover:</span>
                        <span className="text-emerald-400 font-bold">Round-Robin Active</span>
                      </div>
                      <div className="flex items-center justify-between font-mono-data text-[10px] text-gray-400 pt-1 border-t border-white/5">
                        <span>Multi-Key Balancing</span>
                        <span>Auto-Cooldown khi chạm 429</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                      <div className="text-gray-400 font-mono-data text-[11px]">Cơ chế nhận diện:</div>
                      <div className="text-gray-200 text-xs leading-relaxed">
                        {demoMode === 'word' 
                          ? 'Tự động tra từ loại (Noun), chuẩn âm IPA Anh-Anh/Anh-Mỹ, và gợi ý từ đồng nghĩa trong ngữ cảnh thực tế.'
                          : 'Bóc tách cấu trúc câu phức, giải thích vai trò từng cụm từ và dịch thoát nghĩa tự nhiên theo phong cách chuyên ngành.'}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* NEW SECTION: Smart API Key Architecture & 3D Key Router Diagram */}
      <section id="key-architecture" className="relative py-20 lg:py-28 bg-[#090C14] border-t border-white/5">
        <div className="section-container relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kiến Trúc Điều Phối &amp; Cân Bằng Tải AI</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-5 [text-wrap:balance]">
                Cơ chế Thông minh <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">Đứng sau Tốc độ 0.1s</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed [text-wrap:balance]">
                Khám phá cách Orbit Translate bóc tách thuật ngữ chuyên ngành tức thì trong 0.1s kết hợp thuật toán phân phối tải Round-Robin &amp; tự động chuyển đổi dự phòng (Failover), đảm bảo việc đọc tài liệu của bạn diễn ra liền mạch 24/7.
              </p>
            </ScrollReveal>
          </div>

          {/* Professional Video Demo Showcase */}
          <div className="max-w-4xl mx-auto mb-14">
            <ScrollReveal delay={200}>
              <ExtensionVideoShowcase videoSrc="/videos/orbit-extension-demo.mp4" />
            </ScrollReveal>
          </div>

          {/* 3 Concrete User Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ScrollReveal delay={250}>
              <div className="card-obsidian p-6 h-full border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Xoay Vòng Round-Robin
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tự động luân chuyển yêu cầu qua từng Key trong cụm Pool theo con trỏ độc lập. Mỗi request nhận phản hồi nhanh nhất mà không làm dồn tải vào một endpoint duy nhất.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="card-obsidian p-6 h-full border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Tự Động Cooldown Khi 429
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Khi Google AI phản hồi chạm giới hạn Quota, hệ thống tạm đưa key vào hàng chờ (Cooldown 30-60s) và chuyển ngay sang key khả dụng khác. Bạn không hề thấy thông báo lỗi.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <div className="card-obsidian p-6 h-full border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Bảo Mật BYOK Trên Máy (Local)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Hỗ trợ thêm API Key cá nhân (Bring Your Own Key) với lưu trữ mã hóa cục bộ AES-GCM trong trình duyệt. Không chia sẻ token, đảm bảo quyền riêng tư trọn vẹn.
                </p>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="relative py-20 lg:py-28 bg-[#0B0F17] border-t border-white/5">
        <div className="section-container relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                ⚡ Tính Năng Toàn Diện
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-5 [text-wrap:balance]">
                Mọi công cụ bạn cần <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">ngay trong tầm con trỏ chuột</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed [text-wrap:balance]">
                Từng tính năng của Orbit Extension được thiết kế cẩn trọng để phục vụ người học tiếng Anh nghiêm túc, đọc tài liệu khoa học và báo chí quốc tế.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 80}>
                <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="inline-block text-[11px] font-mono-data font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      {item.tag}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 font-heading">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-emerald-400 font-mono-data">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sẵn sàng sử dụng 100%</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Step-by-Step Installation Guide */}
      <section id="install-guide" className="relative py-20 lg:py-28 bg-[#0F1117] border-t border-white/5">
        <div className="section-container relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-4">
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Hướng Dẫn Cài Đặt</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-5">
                Bắt đầu chỉ trong <br />
                <span className="text-gradient-indigo">3 bước đơn giản</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Không cần cài đặt phần mềm nặng nề, không cần quyền riêng tư nguy hiểm.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {installSteps.map((s, idx) => (
              <ScrollReveal key={idx} delay={idx * 120}>
                <div className="card-obsidian p-8 h-full flex flex-col justify-between border-white/10">
                  <div>
                    <span className="text-4xl font-mono-data font-black text-indigo-400/80 block mb-4">
                      {s.step}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 font-heading">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400} className="mt-12 text-center">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-indigo text-base !py-3.5 !px-8"
            >
              <ChromeIcon className="w-5 h-5" />
              <span>Cài Đặt Orbit Translate Ngay</span>
            </a>
          </ScrollReveal>

        </div>
      </section>

      {/* Dedicated Extension FAQ */}
      <section className="relative py-20 lg:py-28 bg-[#0B0F17] border-t border-white/5">
        <div className="section-container relative z-10 max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-4">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Câu Hỏi Thường Gặp</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-4xl text-white">
                Giải đáp thắc mắc về Chrome Extension
              </h2>
            </ScrollReveal>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 80}>
                <div className="card-obsidian border-white/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 text-white font-bold font-heading text-base hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${openFaq === index ? 'rotate-180 text-indigo-400' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-gray-400 leading-relaxed border-t border-white/5">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative py-20 bg-gradient-to-b from-[#0B0F17] to-[#080B12] border-t border-white/5 text-center">
        <div className="section-container relative z-10 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-6">
              Sẵn sàng nâng tầm trải nghiệm đọc tiếng Anh?
            </h2>
            <p className="text-gray-300 text-base mb-8 max-w-xl mx-auto">
              Cài đặt miễn phí 100%, không cần thẻ tín dụng. Trải nghiệm tra từ và học FSRS ngay hôm nay.
            </p>
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-indigo text-base !py-3.5 !px-8"
            >
              <ChromeIcon className="w-5 h-5" />
              <span>Thêm vào Chrome — Miễn phí</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
