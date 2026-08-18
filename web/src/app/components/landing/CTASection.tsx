'use client';

import ScrollReveal from './ScrollReveal';
import Link from 'next/link';
import { LogIn, ArrowRight, CheckCircle2 } from 'lucide-react';

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

export default function CTASection() {
  return (
    <section id="cta" className="relative py-20 lg:py-28 bg-[#0B0F17] overflow-hidden border-t border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <ScrollReveal>
            <h2 className="landing-heading text-4xl sm:text-5xl lg:text-[3.5rem] text-white mb-6 leading-[1.15] [text-wrap:balance]">
              Bắt đầu hành trình đọc hiểu <br className="hidden sm:inline" />
              <span className="text-gradient-indigo sm:whitespace-nowrap">thông minh hơn ngay hôm nay.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed [text-wrap:balance]">
              Chọn điểm xuất phát phù hợp với nhu cầu của bạn. <br className="hidden sm:inline" />
              Miễn phí 100%, không cần thẻ tín dụng.
            </p>
          </ScrollReveal>
        </div>

        {/* TWO CLEAR ENTRY POINT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* ENTRY POINT 1: CHROME EXTENSION (For Readers) */}
          <ScrollReveal delay={250} className="h-full">
            <div className="card-obsidian p-8 sm:p-10 h-full flex flex-col justify-between border-indigo-500/30 hover:border-indigo-500/60 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-md">
                  <ChromeIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono-data font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  Dành cho Người Đọc Tài Liệu
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 font-heading">
                  Cài Chrome Extension
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  Tra từ ngữ cảnh 0.1s, phát âm IPA, gán nhãn CEFR và dịch mượt trực tiếp trên bất kỳ trang web nào bạn truy cập.
                </p>
              </div>

              <div>
                <a 
                  href="https://chromewebstore.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary-indigo w-full justify-center text-sm py-3.5" 
                  id="cta-card-install"
                >
                  <ChromeIcon className="w-4 h-4" />
                  <span>Thêm vào Chrome — Miễn phí</span>
                </a>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono-data">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cài đặt xong trong 10 giây
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ENTRY POINT 2: DASHBOARD (For Learners) */}
          <ScrollReveal delay={350} className="h-full">
            <div className="card-obsidian p-8 sm:p-10 h-full flex flex-col justify-between border-white/10 hover:border-white/25 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-md">
                  <LogIn className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono-data font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  Dành cho Học Viên Ôn Tập
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 font-heading">
                  Đăng Nhập WebApp
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  Vào Dashboard quản lý kho từ vựng đã lưu, xem biểu đồ tiến trình và luyện tập thẻ 3D bằng thuật toán FSRS.
                </p>
              </div>

              <div>
                <Link href="/login" className="btn-secondary-dark w-full justify-center text-sm py-3.5" id="cta-card-dashboard">
                  <span>Vào Dashboard Quản Lý</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                </Link>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono-data">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tự động đồng bộ với Extension
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}

