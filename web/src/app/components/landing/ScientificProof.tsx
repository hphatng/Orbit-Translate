'use client';

import { Check, X, ShieldCheck, Zap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function ScientificProof() {
  return (
    <section id="proof" className="relative py-28 overflow-hidden bg-[#0F1117] border-t border-white/5">
      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bằng Chứng Khoa Học
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-6">
              Vì sao FSRS vượt trội hơn <br />
              <span className="text-highlighter-gradient">các phương pháp học cũ?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              So sánh hiệu quả học tập giữa thuật toán FSRS (Free Spaced Repetition Scheduler) của Orbit Translate và phương pháp Anki SM-2 / Quizlet truyền thống.
            </p>
          </ScrollReveal>
        </div>

        {/* Comparison Table */}
        <ScrollReveal delay={300} className="max-w-4xl mx-auto">
          <div className="card-obsidian overflow-hidden border border-white/10 shadow-2xl">
            
            <div className="grid grid-cols-12 bg-[#13151C] p-5 border-b border-white/10 font-heading text-sm font-bold text-gray-300">
              <div className="col-span-5 text-left">Tiêu chí so sánh</div>
              <div className="col-span-3 text-center text-gray-500">Google Dịch / Quizlet</div>
              <div className="col-span-4 text-center text-yellow-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Orbit FSRS Engine
              </div>
            </div>

            <div className="divide-y divide-white/5 text-sm">
              
              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Thuật toán ôn tập</div>
                <div className="col-span-3 text-center text-gray-500 font-mono-data">Không có / SM-2 cũ</div>
                <div className="col-span-4 text-center text-emerald-400 font-mono-data font-bold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                  FSRS 2026 (AI State)
                </div>
              </div>

              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Tỉ lệ thuộc từ sau 6 tháng</div>
                <div className="col-span-3 text-center text-red-400 font-mono-data">Dưới 30%</div>
                <div className="col-span-4 text-center text-yellow-400 font-mono-data font-bold">
                  Trên 90% (Cam kết)
                </div>
              </div>

              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Thời gian ôn tập mỗi ngày</div>
                <div className="col-span-3 text-center text-gray-500 font-mono-data">20 - 30 phút/ngày</div>
                <div className="col-span-4 text-center text-emerald-400 font-mono-data font-bold">
                  Chỉ 5 phút/ngày (Giảm 3x)
                </div>
              </div>

              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Lưu ngữ cảnh bài viết gốc</div>
                <div className="col-span-3 text-center text-gray-500 flex justify-center"><X className="w-4 h-4 text-red-400" /></div>
                <div className="col-span-4 text-center text-emerald-400 flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
              </div>

              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Phân tích ngữ pháp Deep NLP</div>
                <div className="col-span-3 text-center text-gray-500 flex justify-center"><X className="w-4 h-4 text-red-400" /></div>
                <div className="col-span-4 text-center text-emerald-400 flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
              </div>

              <div className="grid grid-cols-12 p-5 items-center">
                <div className="col-span-5 text-left font-semibold text-white">Xuất 1-click sang Quizlet/Anki</div>
                <div className="col-span-3 text-center text-gray-500 flex justify-center"><X className="w-4 h-4 text-red-400" /></div>
                <div className="col-span-4 text-center text-emerald-400 flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
              </div>

            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
