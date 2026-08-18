'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Network, BookOpenText, BarChart3, GitMerge, BookmarkPlus, Globe2, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface FeatureItem {
  icon: ReactNode;
  title: string;
  titleVi: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: <Network className="w-5 h-5 text-gray-300" />,
    title: 'Deep NLP Dissection',
    titleVi: 'Phân tích ngữ pháp sâu',
    description: 'AI phân tích cấu trúc ngữ pháp chi tiết từng câu — nhận diện clause, phrase, tense, và giải thích vai trò từng thành phần.',
  },
  {
    icon: <BookOpenText className="w-5 h-5 text-gray-300" />,
    title: 'Context Sentences',
    titleVi: 'Ví dụ ngữ cảnh thực tế',
    description: 'Mỗi từ vựng đi kèm câu ví dụ song ngữ từ nguồn thực tế, có audio phát âm — giúp bạn nhớ từ qua ngữ cảnh thay vì học vẹt.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-gray-300" />,
    title: 'CEFR Classification',
    titleVi: 'Phân loại trình độ CEFR',
    description: 'Tự động phân loại từ vựng theo chuẩn châu Âu A1 → C2, giúp bạn biết chính xác trình độ của mình và lên kế hoạch học tập.',
  },
  {
    icon: <GitMerge className="w-5 h-5 text-gray-300" />,
    title: 'Synonyms & Antonyms',
    titleVi: 'Từ đồng/trái nghĩa AI',
    description: 'AI tự động gợi ý từ đồng nghĩa và trái nghĩa, mở rộng vốn từ vựng theo cụm — cách học hiệu quả nhất theo nghiên cứu.',
  },
  {
    icon: <BookmarkPlus className="w-5 h-5 text-gray-300" />,
    title: '1-Click Save',
    titleVi: 'Lưu với một cú click',
    description: 'Lưu từ vựng vào kho học cùng toàn bộ ngữ cảnh, phát âm, ví dụ — chỉ với 1 click. Tự động đồng bộ lên webapp để ôn tập.',
  },
  {
    icon: <Globe2 className="w-5 h-5 text-gray-300" />,
    title: 'Multi-language',
    titleVi: 'Hỗ trợ đa ngôn ngữ',
    description: 'Dịch sang nhiều ngôn ngữ đích khác nhau — không chỉ Tiếng Việt. Mở rộng khả năng học đa ngôn ngữ của bạn.',
  },
];

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <ScrollReveal delay={100 + (index % 3) * 100} direction="up" className="h-full">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative h-full bg-[#0C0C0C] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors duration-500 overflow-hidden group cursor-default"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* Spotlight Glare Effect */}
        <motion.div
          animate={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.06), transparent 40%)`
          }}
          transition={{ ease: "linear", duration: 0.15 }}
          className="pointer-events-none absolute inset-0 z-10 transition duration-300"
        />

        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-20 shadow-sm group-hover:bg-white/10 transition-colors">
          {feature.icon}
        </div>
        
        <div className="relative z-20">
          <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-400 mb-4">{feature.titleVi}</p>
          <p className="text-[15px] text-[#A1A1AA] leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative py-32 overflow-hidden bg-[#08090A]">
      <div className="section-container relative z-10">
        <div className="text-center mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[13px] font-medium tracking-wide shadow-sm mx-auto mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Tính năng cốt lõi
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h2 className="landing-heading text-4xl sm:text-5xl text-white mb-6 tracking-tight">
              Hơn cả một từ điển — <br className="hidden sm:block" />
              <span className="text-gradient">Trợ lý học Anh Văn thông minh</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="landing-body text-lg sm:text-xl max-w-2xl mx-auto text-[#A1A1AA] leading-relaxed">
              Mỗi tính năng được thiết kế để bạn không chỉ dịch, mà thực sự hiểu và ghi nhớ — biến mọi trang web thành không gian học tập liền mạch.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
