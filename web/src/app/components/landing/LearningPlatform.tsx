'use client';

import ScrollReveal from './ScrollReveal';
import { RefreshCcw, DownloadCloud, Layers, LineChart, Brain } from 'lucide-react';

export default function LearningPlatform() {
  return (
    <section id="learning" className="relative py-24 sm:py-32 overflow-hidden bg-[#08090A] border-t border-white/5">
      {/* Subtle grid background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none"></div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left — Dashboard Mockup */}
          <ScrollReveal direction="left" delay={200}>
            <div className="relative">
              <div className="bg-[#0C0C0C] rounded-[20px] overflow-hidden select-none border border-white/10 shadow-[var(--shadow-xl)]">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#111111] border-b border-white/5">
                  <div className="flex gap-1.5 opacity-60">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex-1 mx-4 flex justify-center">
                    <div className="bg-white/5 rounded-md px-4 py-1 text-xs text-gray-500 border border-white/5 truncate">
                      orbit-translate.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-5 bg-[#08090A]">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Tổng từ vựng</span>
                      <div className="text-3xl font-black text-white mt-1">247</div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ôn hôm nay</span>
                      <div className="text-3xl font-black text-white mt-1">12</div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Trình độ C</span>
                      <div className="text-3xl font-black text-white mt-1">38</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { term: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', translation: 'kiên cường', cefr: 'C1' },
                      { term: 'ambiguous', phonetic: '/æmˈbɪɡ.ju.əs/', translation: 'mơ hồ', cefr: 'B2' },
                      { term: 'perpetuate', phonetic: '/pəˈpetʃ.u.eɪt/', translation: 'duy trì mãi', cefr: 'C1' },
                      { term: 'scrutiny', phonetic: '/ˈskruː.tɪ.ni/', translation: 'sự giám sát', cefr: 'C2' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#111111] hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-[15px] font-extrabold text-white">{item.term}</h4>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            item.cefr === 'C2' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 
                            item.cefr === 'C1' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.cefr}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">{item.phonetic}</p>
                        <div className="mt-3">
                          <p className="text-[13px] font-semibold text-gray-300">{item.translation}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <div className="px-6 py-3 rounded-full bg-white text-black font-bold text-[13px] flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform cursor-pointer">
                      ⚡ Vào Luyện Thẻ SRS
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating icon */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center shadow-2xl animate-[float_6s_ease-in-out_infinite] z-20 hidden sm:flex backdrop-blur-md">
                <Brain className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Content */}
          <div className="space-y-8">
            <ScrollReveal delay={100}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[13px] font-medium tracking-wide shadow-sm mb-2">
                <Brain className="w-4 h-4 text-violet-400" />
                Học Tập Thông Minh
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white leading-[1.1] tracking-tight">
                Biến từ vựng thành <br className="hidden sm:block" />
                <span className="text-gradient">kiến thức vĩnh cửu</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-xl">
                Hệ thống học tập thông minh — mạnh mẽ hơn cả Quizlet. Từ vựng tự đồng bộ từ Extension vào Web App, kết hợp thuật toán FSRS Spaced Repetition để bạn nhớ sâu, nhớ lâu.
              </p>
            </ScrollReveal>

            <div className="space-y-6 pt-4">
              {[
                { icon: <RefreshCcw className="w-5 h-5 text-indigo-400" />, title: 'Thuật toán FSRS Spaced Repetition', desc: 'AI tính toán thời điểm ôn tập tối ưu cho từng từ, đảm bảo bạn nhớ vĩnh viễn với số lần ôn tập ít nhất.' },
                { icon: <DownloadCloud className="w-5 h-5 text-indigo-400" />, title: 'Đồng bộ hóa tức thì', desc: 'Mọi từ vựng bạn tra trên Chrome tự động xuất hiện trong Dashboard — không cần thao tác chép tay.' },
                { icon: <Layers className="w-5 h-5 text-indigo-400" />, title: 'Chế độ luyện tập đa dạng', desc: 'Hỗ trợ nhiều hình thức học: Flashcard lật mặt, Trắc nghiệm (Multiple choice), và Gõ từ (Typing).' },
                { icon: <LineChart className="w-5 h-5 text-indigo-400" />, title: 'Theo dõi tiến trình chi tiết', desc: 'Biểu đồ Heatmap và thống kê giúp bạn biết chính xác vốn từ vựng của mình đang tăng lên mỗi ngày.' },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={400 + i * 100}>
                  <div className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-white/10">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-white mb-1 tracking-tight">{item.title}</h3>
                      <p className="text-[14px] text-[#71717A] leading-relaxed pr-4">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
