'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, RotateCcw, Target, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { VocabularyItem } from '@/lib/types';

interface PracticeResultScreenProps {
  score: number;
  total: number;
  accuracy: number;
  timeTaken: string; // e.g., "2:45"
  xpEarned: number;
  wrongWords: VocabularyItem[];
  onRetry: () => void;
  onContinue: () => void;
}

export default function PracticeResultScreen({
  score,
  total,
  accuracy,
  timeTaken,
  xpEarned,
  wrongWords,
  onRetry,
  onContinue,
}: PracticeResultScreenProps) {
  // Animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={containerVars}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto mt-8 font-sans"
    >
      {/* 1. Header & Accuracy Ring */}
      <motion.div variants={itemVars} className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight mb-2">
          Hoàn thành xuất sắc!
        </h2>
        <p className="text-gray-400 text-sm">
          Tuyệt vời, bạn đã vượt qua {total} từ vựng trong phiên học này.
        </p>
      </motion.div>

      {/* 2. Main Stats Cards */}
      <motion.div variants={itemVars} className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center flex flex-col items-center justify-center">
          <Target className="w-5 h-5 text-indigo-400 mb-2" />
          <span className="text-2xl font-black text-white font-mono-data">{accuracy}%</span>
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Chính xác</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center flex flex-col items-center justify-center">
          <Clock className="w-5 h-5 text-emerald-400 mb-2" />
          <span className="text-2xl font-black text-white font-mono-data">{timeTaken}</span>
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Thời gian</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 text-center flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="w-5 h-5 text-amber-400 mb-2 relative z-10" />
          <span className="text-2xl font-black text-amber-300 font-mono-data relative z-10">+{xpEarned}</span>
          <span className="text-[10px] text-amber-500/70 font-bold tracking-wider uppercase mt-1 relative z-10">XP Nhận được</span>
        </div>
      </motion.div>

      {/* 3. Review Wrong Words (If any) */}
      {wrongWords.length > 0 && (
        <motion.div variants={itemVars} className="mb-10">
          <h3 className="text-sm font-bold text-white font-heading mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" /> Cần chú ý hơn ({wrongWords.length} từ)
          </h3>
          <div className="glass-card border border-rose-500/10 rounded-2xl p-2 bg-rose-500/5 overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              <div className="flex flex-col gap-1">
                {wrongWords.map((word) => (
                  <div key={word.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white font-heading">{word.term}</p>
                      {word.phonetic && <p className="text-[10px] text-gray-500 font-mono-data">{word.phonetic}</p>}
                    </div>
                    <span className="text-sm text-gray-300">{word.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Action Buttons */}
      <motion.div variants={itemVars} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Làm lại chế độ này
        </button>
        <button
          onClick={onContinue}
          className="btn-primary-indigo w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          Tiếp tục bài tiếp theo <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
