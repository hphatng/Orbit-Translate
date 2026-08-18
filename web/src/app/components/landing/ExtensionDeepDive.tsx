'use client';

import { AlignLeft, Link2, History, Volume2, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function ExtensionDeepDive() {
  return (
    <section id="extension-features" className="relative py-28 overflow-hidden bg-[#0B0F17] border-t border-white/5">
      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-4">
              ⚡ Chrome Extension Features
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="landing-heading text-3xl sm:text-5xl text-white mb-6">
              Tra từ tức thì — <br />
              <span className="text-gradient-indigo">Thấu hiểu ngữ cảnh sâu sắc</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Không chỉ dịch nghĩa thô. Orbit Extension bóc tách cấu trúc câu, tự động phân loại độ khó và lưu giữ toàn bộ bối cảnh bài viết của bạn.
            </p>
          </ScrollReveal>
        </div>

        {/* Asymmetric Hierarchical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LARGE CORE CARD (2 Columns Wide) — Deep NLP & CEFR */}
          <ScrollReveal delay={150} className="lg:col-span-2">
            <div className="card-obsidian p-8 sm:p-10 h-full flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <AlignLeft className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono-data text-xs font-bold">
                    Lõi Differentiator
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-heading tracking-tight">
                  Phân Tích Ngữ Pháp Deep NLP & Gán Nhãn CEFR
                </h3>
                <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">
                  AI bóc tách câu phức thành các thành phần ngữ pháp (Noun Phrase, Prepositional Phrase, Relative Clause), đồng thời gán nhãn trình độ Châu Âu (A1 → C2) giúp bạn đánh giá ngay độ khó của bài viết.
                </p>

                {/* Simulated Interactive Grammar Tree Box */}
                <div className="p-5 rounded-xl bg-[#0F131C] border border-white/10 space-y-3 font-mono-data text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Sample NLP Analysis:</span>
                    <span className="text-emerald-400 font-bold">CEFR: C1 (Advanced)</span>
                  </div>
                  <div className="space-y-2 pt-1 text-left">
                    <div className="text-gray-300">
                      • <span className="text-[#38BDF8] font-bold">Noun Phrase</span>: &apos;The product development system&apos; (Chủ ngữ chính)
                    </div>
                    <div className="text-gray-300">
                      • <span className="text-[#38BDF8] font-bold">Prepositional Phrase</span>: &apos;for teams and agents&apos; (Bổ nghĩa đối tượng)
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* CARD 2: Context Capturing */}
          <ScrollReveal delay={250} className="lg:col-span-1">
            <div className="card-obsidian p-8 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6">
                  <Link2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-heading">
                  Trích Xuất Câu Gốc & URL
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Từ vựng được lưu kèm theo chính câu văn thực tế bạn vừa đọc và link nguồn bài viết. Bạn luôn nhớ được hoàn cảnh xuất hiện của từ.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F131C] border border-white/5 text-xs text-gray-400 font-mono-data truncate">
                🔗 techcrunch.com/.../flock-safety
              </div>
            </div>
          </ScrollReveal>

          {/* CARD 3: Frequency Reminder */}
          <ScrollReveal delay={350} className="lg:col-span-1">
            <div className="card-obsidian p-8 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-heading">
                  Nhắc Nhở Tần Suất Gặp Từ
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  AI ghi nhớ và cảnh báo thông minh: *&quot;Bạn đã gặp từ này 3 lần trong tuần qua tại 2 bài báo khác nhau!&quot;*
                </p>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono-data font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Đã gặp 3 lần tuần này
              </div>
            </div>
          </ScrollReveal>

          {/* CARD 4: IPA & Audio TTS */}
          <ScrollReveal delay={450} className="lg:col-span-2">
            <div className="card-obsidian p-8 sm:p-10 h-full flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-heading">
                    Phát Âm IPA Chuẩn Quốc Tế & Audio Giọng Thật
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                    Tích hợp phiên âm IPA chuẩn Anh-Anh / Anh-Mỹ kèm âm thanh giọng đọc TTS tự nhiên, giúp bạn luyện nghe và phát âm đúng ngay từ lần đầu tra từ.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0F131C] border border-white/10 font-mono-data text-center w-full sm:w-auto">
                  <div className="text-xs text-gray-500 mb-1">IPA Phonetic:</div>
                  <div className="text-xl font-bold text-[#38BDF8]">/dɪˈvɛləpmənt/</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Audio Native</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
