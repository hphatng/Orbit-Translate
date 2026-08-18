'use client';

import ScrollReveal from './ScrollReveal';
import ExtensionMockup from './ExtensionMockup';
import { SpellCheck2, AlignLeft, Volume2, Tags, Quote, Merge, BrainCircuit, Zap, CheckCircle2 } from 'lucide-react';

export default function TranslationShowcase() {
  return (
    <section id="translation" className="relative py-32 overflow-hidden bg-[#08090A] border-t border-white/5">
      <div className="section-container relative z-10">
        <div className="text-center mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[13px] font-medium tracking-wide shadow-sm mx-auto mb-6">
              <Zap className="w-4 h-4 text-indigo-400" />
              AI Translation
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="landing-heading text-4xl sm:text-5xl text-white mb-6 tracking-tight">
              Dịch chính xác —{' '}
              <span className="text-gradient">Hiểu sâu ngữ cảnh</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="landing-body text-lg sm:text-xl max-w-2xl mx-auto text-[#A1A1AA] leading-relaxed">
              Không chỉ dịch nghĩa đen, Orbit Translate phân tích ngữ pháp, cung cấp ví dụ ngữ cảnh thực tế và gợi ý từ đồng/trái nghĩa — giúp bạn hiểu sâu sắc mọi từ vựng.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Word Translation */}
          <ScrollReveal direction="left" delay={200}>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                    <SpellCheck2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white font-heading tracking-tight">Tra Từ Đơn</h3>
                </div>
                <p className="text-[16px] text-[#A1A1AA] leading-relaxed">
                  Bôi đen một từ bất kỳ → Popup xuất hiện tức thì với đầy đủ nghĩa, phát âm IPA chuẩn, trình độ CEFR, ví dụ ngữ cảnh thực tế và từ liên quan.
                </p>
              </div>

              <div className="space-y-4 bg-[#0C0C0C] p-6 rounded-2xl border border-white/5 shadow-[var(--shadow-sm)]">
                {[
                  { icon: <Volume2 className="w-4 h-4 text-gray-300"/>, text: 'Phát âm IPA chuẩn với audio giọng đọc tự nhiên' },
                  { icon: <Tags className="w-4 h-4 text-gray-300"/>, text: 'Tự động phân loại trình độ CEFR (A1 → C2)' },
                  { icon: <Quote className="w-4 h-4 text-gray-300"/>, text: 'Tạo ví dụ ngữ cảnh song ngữ siêu thực tế' },
                  { icon: <Merge className="w-4 h-4 text-gray-300"/>, text: 'Gợi ý từ đồng nghĩa & trái nghĩa thông minh' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[14px] text-gray-300 font-medium">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="relative pt-6 flex justify-center lg:justify-start">
                <div className="w-full max-w-[360px] relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-blue-600/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <ExtensionMockup mode="word" className="relative mx-auto lg:mx-0 transform group-hover:scale-[1.02] transition-transform duration-500" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Sentence Translation */}
          <ScrollReveal direction="right" delay={400}>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                    <AlignLeft className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white font-heading tracking-tight">Dịch Cả Câu & Đoạn Văn</h3>
                </div>
                <p className="text-[16px] text-[#A1A1AA] leading-relaxed">
                  Bôi đen cả đoạn văn bản khó → AI dịch toàn văn mượt mà như người bản xứ, đồng thời bóc tách phân tích chi tiết cấu trúc ngữ pháp (Deep NLP).
                </p>
              </div>

              <div className="space-y-4 bg-[#0C0C0C] p-6 rounded-2xl border border-white/5 shadow-[var(--shadow-sm)]">
                {[
                  { icon: <BrainCircuit className="w-4 h-4 text-gray-300"/>, text: 'Deep NLP — Phân tích chi tiết cấu trúc ngữ pháp' },
                  { icon: <CheckCircle2 className="w-4 h-4 text-gray-300"/>, text: 'Dịch toàn bộ câu/đoạn trôi chảy, đúng ngữ cảnh' },
                  { icon: <Zap className="w-4 h-4 text-gray-300"/>, text: 'AI tự động nhận diện cụm danh từ & cụm giới từ' },
                  { icon: <CheckCircle2 className="w-4 h-4 text-gray-300"/>, text: 'Hiển thị kết quả tức thì trực tiếp trên trang web' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[14px] text-gray-300 font-medium">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="relative pt-6 flex justify-center lg:justify-start">
                <div className="w-full max-w-[420px] relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-blue-600/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <ExtensionMockup mode="sentence" className="relative mx-auto lg:mx-0 transform group-hover:scale-[1.02] transition-transform duration-500" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
