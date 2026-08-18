'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2, ChevronLeft, ChevronRight, Check, X, Maximize2 } from 'lucide-react';
import { VocabularyItem } from '@/lib/types';
import { Rating } from '@/../../shared/fsrs';
import confetti from 'canvas-confetti';
import { motion, useAnimation } from 'framer-motion';
import { useLearningSettings } from '@/lib/practice/LearningSettingsContext';
import { useLearningSound } from '@/lib/practice/useLearningSound';
import GrammarBreakdownDisplay from './GrammarBreakdownDisplay';

interface FlashcardModeProps {
  word: VocabularyItem;
  onNext: (isCorrect: boolean | null, rating: Rating, timeTakenMs: number | null) => void;
  currentIndex: number;
  totalQuestions: number;
}

export default function FlashcardMode({ word, onNext, currentIndex, totalQuestions }: FlashcardModeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const controls = useAnimation();
  
  const { settings } = useLearningSettings();
  const { playCorrect, playIncorrect, forceSpeak, speak } = useLearningSound();

  // Reset state when word changes (isolated from settings toggles)
  useEffect(() => {
    setIsFlipped(false);
    setStartTime(Date.now());
    controls.set({ x: 0 }); // reset animation
    
    // Auto pronounce on new card with smooth entrance delay
    if (settings.autoPronounce && word?.term) {
      const timer = setTimeout(() => {
        speak(word.term, 'en-US');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [word?.id]);

  const handleSpeak = useCallback((e?: React.MouseEvent, text?: string, lang?: string) => {
    if (e) e.stopPropagation();
    if (text) forceSpeak(text, lang);
  }, [forceSpeak]);

  const handleRating = useCallback(async (rating: Rating) => {
    const timeTaken = Date.now() - startTime;
    
    // Gamification
    if (rating >= 3) {
      // Good or Easy
      playCorrect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });
      onNext(true, rating, timeTaken);
    } else {
      // Again or Hard
      playIncorrect();
      await controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      onNext(false, rating, timeTaken);
    }
  }, [onNext, startTime, controls, playCorrect, playIncorrect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
      if (e.key === 's' || e.key === 'S') {
        handleSpeak(undefined, word.term);
      }
      if (isFlipped) {
        if (e.key === '1') handleRating(1); // Again
        if (e.key === '2') handleRating(2); // Hard
        if (e.key === '3') handleRating(3); // Good
        if (e.key === '4') handleRating(4); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleSpeak, handleRating, word.term]);

  if (!word) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans">


      {/* Flip Card Container - Quizlet Minimalist Style */}
      <motion.div
        animate={controls}
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[500px] cursor-pointer relative perspective-1000 group"
      >
        <div 
          className={`w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateX(180deg)]' : ''}`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full bg-[#181A22] rounded-2xl border border-white/5 shadow-lg p-10 flex flex-col justify-center items-center [backface-visibility:hidden]">

            
            <button
              onClick={(e) => handleSpeak(e, word.term, 'en-US')}
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
              title="Phát âm tiếng Anh"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <h2 className="text-5xl sm:text-6xl font-semibold text-white tracking-tight z-10">
              {word.term}
            </h2>
            <div className="absolute bottom-8 text-sm font-medium text-gray-500 tracking-wide uppercase z-10">Click to flip</div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full bg-[#181A22] rounded-2xl border border-white/5 shadow-lg p-10 flex flex-col justify-center items-center [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <button
              onClick={(e) => handleSpeak(e, word.translation, 'vi-VN')}
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
              title="Đọc nghĩa tiếng Việt"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col items-center justify-center w-full max-w-lg text-center space-y-6 z-10">
               <h3 className="text-4xl font-medium text-white">
                 {word.translation}
               </h3>
               {word.phonetic && (
                 <p className="text-xl text-gray-400 font-mono tracking-wide">{word.phonetic}</p>
               )}
               {word.exampleSentence && (
                 <div className="mt-4 p-5 bg-white/5 rounded-xl border border-white/10 text-left w-full relative group">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-gray-300 italic text-lg leading-relaxed">&ldquo;{word.exampleSentence}&rdquo;</p>
                      <button 
                        onClick={(e) => handleSpeak(e, word.exampleSentence, 'en-US')}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-white/5 transition-colors shrink-0"
                        title="Đọc câu ví dụ tiếng Anh"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    {word.exampleTranslation && (
                      <p className="text-gray-500 mt-3 text-sm">{word.exampleTranslation}</p>
                    )}
                 </div>
               )}
               {/* Grammar breakdown for GRAMMAR entry items */}
               {word.grammarBreakdown && (
                 <GrammarBreakdownDisplay breakdown={word.grammarBreakdown} />
               )}
            </div>
            <div className="absolute bottom-8 text-sm font-medium text-gray-500 tracking-wide uppercase z-10">Click to flip</div>
          </div>
        </div>
      </motion.div>

      {/* FSRS Rating Buttons - Only visible when flipped */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3 md:gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-2xl mx-auto">
          <button
            onClick={() => handleRating(1)}
            className="py-4 px-2 rounded-xl bg-[#181A22] border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 group transition-all flex flex-col items-center gap-1"
          >
            <span className="text-gray-300 group-hover:text-red-400 font-medium transition-colors">Again</span>
            <span className="text-xs text-gray-600 font-mono">1</span>
          </button>
          
          <button
            onClick={() => handleRating(2)}
            className="py-4 px-2 rounded-xl bg-[#181A22] border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 group transition-all flex flex-col items-center gap-1"
          >
            <span className="text-gray-300 group-hover:text-orange-400 font-medium transition-colors">Hard</span>
            <span className="text-xs text-gray-600 font-mono">2</span>
          </button>

          <button
            onClick={() => handleRating(3)}
            className="py-4 px-2 rounded-xl bg-[#181A22] border border-white/5 hover:border-green-500/50 hover:bg-green-500/10 group transition-all flex flex-col items-center gap-1"
          >
            <span className="text-gray-300 group-hover:text-green-400 font-medium transition-colors">Good</span>
            <span className="text-xs text-gray-600 font-mono">3</span>
          </button>

          <button
            onClick={() => handleRating(4)}
            className="py-4 px-2 rounded-xl bg-[#181A22] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 group transition-all flex flex-col items-center gap-1"
          >
            <span className="text-gray-300 group-hover:text-blue-400 font-medium transition-colors">Easy</span>
            <span className="text-xs text-gray-600 font-mono">4</span>
          </button>
        </div>
      )}
    </div>
  );
}
