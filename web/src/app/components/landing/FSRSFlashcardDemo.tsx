'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Volume2, Calendar, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function FSRSFlashcardDemo() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [nextInterval, setNextInterval] = useState('7 ngày (Good)');

  const handleRating = (_ratingText: string, interval: string) => {
    setNextInterval(interval);
    setIsFlipped(true);
  };

  return (
    <section id="fsrs-demo" className="relative py-28 overflow-hidden bg-[#0B0F17] border-t border-white/5">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="section-container relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Explanation */}
          <div className="space-y-8 text-left">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase">
                🧠 WebApp & FSRS Spaced Repetition
              </div>
            </ScrollReveal>

            {/* FIXED: Không ngắt dòng treo từ 'cũ' */}
            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-5xl text-white [text-wrap:balance]">
                Thuật toán FSRS — <br />
                <span className="text-gradient-indigo">Nhớ lâu gấp 2-3 lần <span className="inline-block">SM-2 cũ</span></span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed [text-wrap:balance]">
                FSRS (Free Spaced Repetition Scheduler) là thuật toán hiện đại nhất được chứng minh khoa học giúp tối ưu đường cong quên. AI tự tính toán thời điểm ôn tập chính xác dựa trên độ khó từ vựng và lịch sử ghi nhớ của bạn.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="space-y-4 font-mono-data text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Giảm 50%+ số lần ôn so với Anki/Quizlet truyền thống.</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Đảm bảo tỉ lệ duy trì trí nhớ trên 90% sau 6 tháng.</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Xuất dữ liệu 1-click sang Quizlet/Anki định dạng CSV.</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — INTERACTIVE 3D FLASHCARD DEMO */}
          <ScrollReveal delay={200}>
            <div className="relative flex flex-col items-center">
              
              <div className="text-xs font-mono-data text-gray-400 mb-3 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Click thử các mức đánh giá bên dưới để lật thẻ FSRS:</span>
              </div>

              {/* 3D Card Container */}
              <div className="w-full max-w-[420px] h-[340px] perspective-[1000px] relative">
                
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full relative cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  
                  {/* FRONT SIDE (Word + IPA) */}
                  <div 
                    className="absolute inset-0 card-obsidian p-8 flex flex-col justify-between items-center text-center rounded-2xl border-white/10 shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between w-full text-xs font-mono-data text-gray-400 border-b border-white/5 pb-3">
                      <span>Card Front</span>
                      <span className="text-indigo-400 font-bold">[C1 Advanced]</span>
                    </div>

                    <div className="my-auto space-y-2">
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                        resilient
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-[#38BDF8] font-mono-data">
                        <span>/rɪˈzɪl.i.ənt/</span>
                        <Volume2 className="w-4 h-4 text-gray-400 hover:text-white" />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 font-mono-data flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-indigo-400" />
                      Chạm vào thẻ để lật mặt sau
                    </div>
                  </div>

                  {/* BACK SIDE (Translation + FSRS Next Date) */}
                  <div 
                    className="absolute inset-0 card-obsidian p-8 flex flex-col justify-between text-left rounded-2xl border-indigo-500/40 shadow-2xl bg-[#171B26]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="flex items-center justify-between w-full text-xs font-mono-data text-gray-400 border-b border-white/5 pb-3">
                      <span className="text-indigo-400 font-bold">✨ FSRS Calculation</span>
                      <span className="text-emerald-400 font-bold">Lịch ôn: {nextInterval}</span>
                    </div>

                    <div className="space-y-3 my-auto">
                      <h4 className="text-2xl font-bold text-white">kiên cường, nảy nở</h4>
                      <p className="text-xs text-gray-300 italic">
                        &quot;The community was resilient in the face of adversity.&quot;
                      </p>
                      <p className="text-xs text-[#38BDF8]">
                        Cộng đồng đã rất kiên cường trước nghịch cảnh.
                      </p>
                    </div>

                    <div className="text-xs text-emerald-400 font-mono-data bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Thuật toán FSRS: Đã lưu kết quả ôn tập!
                    </div>
                  </div>

                </motion.div>
              </div>

              {/* 4 FSRS RATING BUTTONS */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-[420px] mt-5">
                <button
                  onClick={() => handleRating('Again', '1 ngày (Again)')}
                  className="py-2.5 px-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono-data font-bold hover:bg-red-500/25 transition-colors"
                >
                  Quên <span className="block text-[10px] opacity-70">1 ngày</span>
                </button>

                <button
                  onClick={() => handleRating('Hard', '3 ngày (Hard)')}
                  className="py-2.5 px-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono-data font-bold hover:bg-amber-500/25 transition-colors"
                >
                  Khó <span className="block text-[10px] opacity-70">3 ngày</span>
                </button>

                <button
                  onClick={() => handleRating('Good', '7 ngày (Good)')}
                  className="py-2.5 px-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono-data font-bold hover:bg-indigo-500/25 transition-colors"
                >
                  Tốt <span className="block text-[10px] opacity-70">7 ngày</span>
                </button>

                <button
                  onClick={() => handleRating('Easy', '14 ngày (Easy)')}
                  className="py-2.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono-data font-bold hover:bg-emerald-500/25 transition-colors"
                >
                  Dễ <span className="block text-[10px] opacity-70">14 ngày</span>
                </button>
              </div>

            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
