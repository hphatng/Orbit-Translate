'use client';

import { BookOpen, Sparkles, Brain } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ExploreLink from './ExploreLink';

const steps = [
  {
    step: '01',
    icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
    title: 'Đọc & Tra Từ Tức Thì',
    app: 'Chrome Extension V3',
    description: 'Đọc báo, tài liệu hay bài viết trên bất kỳ website nào. Bôi đen từ đơn hoặc cả câu để nhận phát âm IPA, nhãn CEFR và phân tích ngữ pháp Deep NLP trong 0.1s.',
    highlight: 'Tra từ không gián đoạn',
    route: '/extension',
    ctaText: 'Khám phá Extension →',
  },
  {
    step: '02',
    icon: <Sparkles className="w-6 h-6 text-sky-400" />,
    title: 'Tự Động Đồng Bộ Ngữ Cảnh',
    app: 'Cloud Sync Realtime',
    description: 'Bấm 1 click để lưu từ vựng cùng chính xác câu văn gốc thực tế và link bài báo vào WebApp. Không còn cảnh vừa đọc vừa chép tay vào sổ hay app rời.',
    highlight: 'Lưu trọn vẹn ngữ cảnh',
    route: '/web-app',
    ctaText: 'Xem Study Hub →',
  },
  {
    step: '03',
    icon: <Brain className="w-6 h-6 text-emerald-400" />,
    title: 'Ôn FSRS, Nhớ Vĩnh Viễn',
    app: 'FSRS Next-Gen Engine',
    description: 'Thuật toán FSRS tự tính toán thời điểm bạn sắp quên để nhắc ôn tập đúng lúc. Duy trì tỉ lệ ghi nhớ trên 90% sau 6 tháng với số lần ôn ít hơn 3 lần.',
    highlight: 'Nhớ lâu gấp 2-3 lần',
    route: '/web-app#fsrs-algorithm',
    ctaText: 'Xem thuật toán FSRS →',
  },
];

export default function LearningLoop() {
  return (
    <section id="learning-loop" className="relative py-20 lg:py-28 overflow-hidden bg-[#0B0F17] border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
              ✨ Điểm Khác Biệt Cốt Lõi
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-6 leading-tight [text-wrap:balance]">
              Không chỉ là tra từ. Đây là một <br className="hidden sm:inline" />
              <span className="text-gradient-indigo">Vòng Lặp Ghi Nhớ Khép Kín.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
              Hầu hết người học quên 90% từ vựng sau 7 ngày tra trên trình duyệt vì thiếu bước ôn tập có hệ thống.
              Orbit giải quyết triệt để vấn đề này.
            </p>
          </ScrollReveal>
        </div>

        {/* 3-Step Horizontal Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((item, index) => (
            <ScrollReveal key={index} delay={index * 120} className="h-full">
              <div className="card-obsidian p-7 sm:p-8 h-full flex flex-col justify-between relative group hover:border-indigo-500/40 transition-all duration-300">
                
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-mono-data font-extrabold text-gray-600 group-hover:text-indigo-400 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* App Badge */}
                  <span className="inline-block text-[11px] font-mono-data font-bold text-indigo-400 uppercase tracking-wider mb-2">
                    {item.app}
                  </span>

                  {/* Title & Desc */}
                  <h3 className="text-xl font-bold text-white mb-3 font-heading tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Footer with Tag & Route CTA */}
                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 text-xs">
                    {item.highlight}
                  </span>
                  
                  <ExploreLink href={item.route}>
                    {item.ctaText}
                  </ExploreLink>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Closed Loop Visual Connector Banner */}
        <ScrollReveal delay={400} className="mt-10">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg flex-shrink-0">
                🔄
              </div>
              <div className="text-left">
                <h4 className="text-base font-bold text-white font-heading">
                  Học từ vựng tự nhiên từ chính thói quen đọc hàng ngày
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Không cần dành 2 tiếng chép từ vựng thủ công. Đọc đến đâu, từ vựng tự chảy vào bộ nhớ FSRS đến đó.
                </p>
              </div>
            </div>
            
            <ExploreLink href="/extension" variant="pill" className="whitespace-nowrap flex-shrink-0">
              Trải nghiệm Vòng Lặp Ngay
            </ExploreLink>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}

