'use client';

import { Brain, Layers, FileSearch } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ExploreLink from './ExploreLink';

export default function HomeWebAppTeaser() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0F1117] border-t border-white/5">
      <div className="section-container relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono-data font-bold tracking-wider uppercase mb-6">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nền Tảng Học Tập WebApp</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl text-white [text-wrap:balance]">
                Biến từ vựng đã lưu thành <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">phản xạ ghi nhớ vĩnh viễn</span>
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={150}>
            <ExploreLink href="/web-app" variant="pill" className="self-start md:self-auto">
              Khám phá Study Hub &amp; Các chế độ luyện tập
            </ExploreLink>
          </ScrollReveal>
        </div>

        {/* 3 Standout Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Module 1: Study Hub */}
          <ScrollReveal delay={150}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  Study Hub Thông Minh
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Quản lý toàn bộ kho từ vựng đã tra trên trình duyệt, phân loại tự động theo bộ lọc CEFR và theo dõi ngày ôn tập.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                📊 Tự động phân cấp A1 → C2
              </div>
            </div>
          </ScrollReveal>

          {/* Module 2: Scan & Extract */}
          <ScrollReveal delay={250}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  Scan &amp; Extract AI
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Tải lên tài liệu PDF, hình ảnh chụp sách hoặc văn bản để AI tự động trích xuất từ vựng quan trọng kèm ngữ cảnh bài học.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                📄 Trích xuất từ tài liệu 1-click
              </div>
            </div>
          </ScrollReveal>

          {/* Module 3: Practice Modes */}
          <ScrollReveal delay={350}>
            <div className="card-obsidian p-7 h-full flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  3 Chế Độ Luyện Tập
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed mb-4">
                  Rèn luyện phản xạ qua Thẻ Flashcard 3D FSRS, Bài thi Trắc nghiệm tráo đề, và Gõ từ vựng theo ngữ cảnh câu thực tế.
                </p>
              </div>
              <div className="text-[11px] font-mono-data text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                🎯 Flashcard + Quiz + Typing
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
