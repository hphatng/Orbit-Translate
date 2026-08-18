'use client';

import { AlignLeft, Volume2, Link2, Zap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ExploreLink from './ExploreLink';

export default function HomeExtensionTeaser() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0B0F17] border-t border-white/5">
      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trợ Lý Đọc Chrome Extension</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl text-white [text-wrap:balance]">
                Tra từ tức thì trong 0.1s — <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">Thấu hiểu ngữ cảnh sâu sắc</span>
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={150}>
            <ExploreLink href="/extension" variant="pill" className="self-start md:self-auto">
              Xem chi tiết Extension &amp; Hướng dẫn cài đặt
            </ExploreLink>
          </ScrollReveal>
        </div>

        {/* 3 Standout Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <ScrollReveal delay={150}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  Phân Tích Deep NLP &amp; CEFR
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Bóc tách câu phức thành các thành phần ngữ pháp cụ thể và gán nhãn độ khó A1 → C2 ngay trên màn hình.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                ✨ Deep Grammar Tree Analysis
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={250}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-sky-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                  <Link2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  Lưu Câu Gốc &amp; URL Nguồn
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Từ vựng được lưu kèm chính xác câu văn thực tế bạn vừa đọc và link bài viết gốc, tránh học vẹt từ cô lập.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
                🔗 Tự động liên kết URL bài đọc
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Smart AI Key Pool Router Highlight */}
          <ScrollReveal delay={350}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  Smart AI Key Pool Router
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Thuật toán xoay vòng và điều phối cụm API Key thông minh, tự động fallback model khi nghẽn mạng, đảm bảo phản hồi 0.1s liên tục.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                ⚡ Zero Rate-limit &amp; 99.99% Uptime
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
