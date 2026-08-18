'use client';

import { ShieldCheck, TrendingUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ExploreLink from './ExploreLink';

export default function HomeFSRSTeaser() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0B0F17] border-t border-white/5">
      <div className="section-container relative z-10">
        
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Nghiên Cứu Khoa Học Trí Nhớ</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5 [text-wrap:balance]">
                Vì sao FSRS vượt trội hơn <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">mọi phương pháp học cũ?</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
                FSRS (Free Spaced Repetition Scheduler) là thuật toán hiện đại nhất thay thế chuẩn SM-2 từ năm 1987. AI tính toán chính xác đường cong quên của não bộ, giúp bạn thuộc từ dài hạn với thời gian ôn tập tối thiểu.
              </p>
            </ScrollReveal>
          </div>

          {/* 3 Metric Value Props */}
          <ScrollReveal delay={200}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              
              <div className="card-obsidian p-6 text-center border-emerald-500/20 bg-emerald-950/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono-data mb-1">
                  &gt;90%
                </div>
                <div className="text-xs font-bold text-white mb-1">Tỉ Lệ Nhớ Sau 6 Tháng</div>
                <p className="text-[12px] text-gray-400">So với dưới 30% khi học vẹt thông thường</p>
              </div>

              <div className="card-obsidian p-6 text-center border-indigo-500/20 bg-indigo-950/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono-data mb-1">
                  5 Phút
                </div>
                <div className="text-xs font-bold text-white mb-1">Ôn Tập Mỗi Ngày</div>
                <p className="text-[12px] text-gray-400">Giảm 3 lần số lần lặp lại so với Anki cũ</p>
              </div>

              <div className="card-obsidian p-6 text-center border-sky-500/20 bg-sky-950/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono-data mb-1">
                  100%
                </div>
                <div className="text-xs font-bold text-white mb-1">Cá Nhân Hóa Trí Nhớ</div>
                <p className="text-[12px] text-gray-400">Tự đo lường độ khó từng từ của riêng bạn</p>
              </div>

            </div>
          </ScrollReveal>

          {/* Action Link to #fsrs-algorithm on /web-app */}
          <ScrollReveal delay={300}>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-heading flex items-center justify-center sm:justify-start gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Xem chi tiết biểu đồ đường cong quên &amp; bảng so sánh FSRS
                </h4>
                <p className="text-xs text-gray-400">
                  Tìm hiểu cơ sở toán học và cơ chế tính toán Stability / Difficulty trong WebApp.
                </p>
              </div>

              <ExploreLink href="/web-app#fsrs-algorithm" variant="pill" className="whitespace-nowrap flex-shrink-0">
                Xem Thuật Toán FSRS
              </ExploreLink>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
