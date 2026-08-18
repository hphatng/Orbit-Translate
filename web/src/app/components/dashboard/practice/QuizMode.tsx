'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PracticeQuestion } from '@/lib/types';
import { Rating } from '@/../../shared/fsrs';
import { useLearningSettings } from '@/lib/practice/LearningSettingsContext';
import { useLearningSound } from '@/lib/practice/useLearningSound';

interface QuizModeProps {
  question: PracticeQuestion;
  onNext: (isCorrect: boolean | null, rating: Rating, timeTakenMs: number | null) => void;
  currentIndex: number;
  totalQuestions: number;
}

export default function QuizMode({ question, onNext, currentIndex, totalQuestions }: QuizModeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const { settings } = useLearningSettings();
  const { playCorrect, playIncorrect, forceSpeak, speak } = useLearningSound();
  const word = question.word;
  const options = question.options || [];

  // Reset state when question changes (isolated from settings toggles)
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStartTime(Date.now());
    
    // Auto pronounce when question loads with smooth entrance delay
    if (settings.autoPronounce && word?.term) {
      const timer = setTimeout(() => {
        speak(word.term, 'en-US');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [question.word.id]);

  const handleSpeak = useCallback((e?: React.MouseEvent, text?: string, lang?: string) => {
    if (e) e.stopPropagation();
    if (text) forceSpeak(text, lang || 'en-US');
  }, [forceSpeak]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    const timeTaken = Date.now() - startTime;
    const isCorrect = option === word.translation;
    
    // Play sound feedback
    if (isCorrect) playCorrect();
    else playIncorrect();
    
    // Auto proceed after a short delay so user can see if they were right/wrong
    const delay = settings.autoAdvance ? 1200 : 2500; // longer delay if auto-advance is off so they can read
    
    setTimeout(() => {
      // In QuizMode, correct usually maps to a Good(3) rating in FSRS, wrong maps to Again(1)
      const rating = isCorrect ? 3 : 1;
      onNext(isCorrect, rating, timeTaken);
    }, delay);
  };

  if (!word) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans">


      <div className="bg-[#181A22] border border-white/5 rounded-2xl shadow-lg p-8 md:p-12 mt-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <span className="text-sm font-semibold text-indigo-400 tracking-wider uppercase">Select the correct meaning</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              {word.term}
            </h2>
          </div>
          <button
            onClick={(e) => handleSpeak(e, word.term)}
            className="p-3 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === word.translation;
            
            let btnClass = "relative w-full p-6 text-left rounded-xl border transition-all duration-200 outline-none flex items-center gap-4 group ";
            
            if (!isAnswered) {
              btnClass += "border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-gray-200 bg-white/5";
            } else {
              if (isCorrectOption) {
                btnClass += "border-green-500 bg-green-500/20 text-green-400 z-10 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
              } else if (isSelected && !isCorrectOption) {
                btnClass += "border-red-500 bg-red-500/20 text-red-400 z-10 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
              } else {
                btnClass += "border-white/5 bg-transparent text-gray-600 opacity-50";
              }
            }

            return (
              <motion.button
                key={index}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={btnClass}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: (isAnswered && isCorrectOption) ? [1, 1.05, 1] : 1,
                  x: (isAnswered && isSelected && !isCorrectOption) ? [0, -10, 10, -10, 10, 0] : 0
                }}
                transition={{ 
                  duration: (isAnswered && isSelected && !isCorrectOption) ? 0.4 : 0.3,
                  delay: index * 0.05 
                }}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm transition-colors ${!isAnswered ? 'bg-white/10 text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400' : isCorrectOption ? 'bg-green-500/30 text-green-400' : isSelected ? 'bg-red-500/30 text-red-400' : 'bg-white/5 text-gray-600'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-lg font-medium">{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
