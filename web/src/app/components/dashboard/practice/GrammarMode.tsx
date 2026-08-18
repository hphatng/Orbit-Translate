'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, Sparkles, ArrowRight, Lightbulb, Info } from 'lucide-react';
import { GrammarExercise } from '@/lib/types';
import { useLearningSound } from '@/lib/practice/useLearningSound';

interface GrammarModeProps {
  exercises: GrammarExercise[];
  onComplete: () => void;
}

export default function GrammarMode({ exercises, onComplete }: GrammarModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const { playCorrect, playIncorrect, playComplete } = useLearningSound();

  const currentExercise = exercises[currentIndex] || exercises[0];

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentExercise.correctAnswer) {
      setScore((prev) => prev + 100);
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playComplete();
      onComplete();
    }
  };

  if (!currentExercise) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono-data">
        <div className="flex items-center gap-2 text-indigo-400">
          <BookOpen className="w-4 h-4" />
          <span>Luyện Ngữ Pháp & Cấu Trúc • Bài {currentIndex + 1} / {exercises.length}</span>
        </div>

        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Điểm: {score}
        </div>
      </div>

      {/* Grammar Point Tag */}
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono-data flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" />
        <div>
          <strong>Chủ điểm ngữ pháp:</strong> {currentExercise.grammarPoint}
        </div>
      </div>

      {/* Question Sentence Box */}
      <div className="p-8 rounded-3xl bg-[#131722] border border-white/10 text-center shadow-xl space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-sans leading-relaxed">
          {currentExercise.sentence.split('______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block border-b-2 border-indigo-400 px-4 py-0.5 mx-1 font-mono-data text-indigo-300 font-bold bg-white/5 rounded">
                  {selectedOption || '...'}
                </span>
              )}
            </span>
          ))}
        </h2>

        <p className="text-sm text-gray-400 italic">
          &rarr; {currentExercise.translation}
        </p>
      </div>

      {/* 4 Grammar Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentExercise.options.map((option, idx) => {
          const isCorrect = option === currentExercise.correctAnswer;
          const isSelected = selectedOption === option;

          let btnStyle = 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/20';
            } else if (isSelected) {
              btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
            } else {
              btnStyle = 'bg-white/5 border-white/5 text-gray-500 opacity-50';
            }
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: (isAnswered && isCorrect) ? [1, 1.05, 1] : 1,
                x: (isAnswered && isSelected && !isCorrect) ? [0, -8, 8, -8, 8, 0] : 0
              }}
              transition={{ 
                duration: (isAnswered && isSelected && !isCorrect) ? 0.4 : 0.3,
                delay: idx * 0.05 
              }}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={`p-4 rounded-2xl border text-left text-sm font-sans transition-all flex items-center justify-between ${btnStyle}`}
            >
              <span className="font-mono-data">{option}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Detailed Grammar Explanation */}
      {isAnswered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 leading-relaxed space-y-1 font-sans">
            <div className="flex items-center gap-1.5 font-mono-data font-bold text-indigo-400">
              <Info className="w-4 h-4" /> Giải Thích Ngữ Pháp Chi Tiết:
            </div>
            <p className="text-gray-300 pl-5">{currentExercise.explanation}</p>
          </div>

          <button
            onClick={handleNext}
            className="btn-primary-indigo w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30"
          >
            <span>Bài Ngữ Pháp Tiếp Theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
