'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PracticeQuestion } from '@/lib/types';
import { Rating } from '@/../../shared/fsrs';
import { evaluateWritingAnswer } from '@/lib/practice/engine';
import { useLearningSettings } from '@/lib/practice/LearningSettingsContext';
import { useLearningSound } from '@/lib/practice/useLearningSound';

interface TypingModeProps {
  question: PracticeQuestion;
  onNext: (isCorrect: boolean | null, rating: Rating, timeTakenMs: number | null) => void;
  currentIndex: number;
  totalQuestions: number;
}

export default function TypingMode({ question, onNext, currentIndex, totalQuestions }: TypingModeProps) {
  const [inputValue, setInputValue] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<'correct' | 'incorrect' | 'almost' | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const { settings } = useLearningSettings();
  const { playCorrect, playIncorrect, forceSpeak, speak } = useLearningSound();
  const word = question.word;

  // Reset state when word changes
  useEffect(() => {
    setInputValue('');
    setIsEvaluated(false);
    setEvaluationResult(null);
    setStartTime(Date.now());
    // Auto focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [question]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isEvaluated || !inputValue.trim()) return;

    const result = evaluateWritingAnswer(inputValue, word.term);
    setEvaluationResult(result);
    setIsEvaluated(true);

    const isCorrect = result === 'correct' || result === 'almost';
    const rating = isCorrect ? (result === 'correct' ? 3 : 2) : 1;
    const timeTaken = Date.now() - startTime;
    
    if (isCorrect) {
      playCorrect();
      if (settings.autoPronounce && word?.term) {
        setTimeout(() => speak(word.term), 300); // speak after sound effect
      }
    } else {
      playIncorrect();
      if (settings.autoPronounce && word?.term) {
        setTimeout(() => speak(word.term), 400); // speak correct word after error
      }
    }

    // Auto proceed
    const delay = settings.autoAdvance ? (isCorrect ? 1500 : 2500) : (isCorrect ? 2000 : 4000);
    setTimeout(() => {
      onNext(isCorrect, rating, timeTaken);
    }, delay);
  };

  const handleSpeak = useCallback((e?: React.MouseEvent, text?: string, lang?: string) => {
    if (e) e.stopPropagation();
    if (text) forceSpeak(text, lang || 'en-US');
  }, [forceSpeak]);

  if (!word) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans">


      <div className="bg-[#181A22] border border-white/5 rounded-2xl shadow-lg p-8 md:p-12 mt-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
           <span className="text-sm font-semibold text-indigo-400 tracking-wider uppercase">Type the English term</span>
           <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
             {word.translation}
           </h2>
           {word.exampleSentence && (
             <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-xl text-left w-full max-w-lg">
                <p className="text-gray-300 italic text-lg leading-relaxed">"... {word.exampleTranslation}"</p>
             </div>
           )}
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="relative max-w-lg mx-auto"
          animate={{
            x: evaluationResult === 'incorrect' ? [0, -10, 10, -10, 10, 0] : 0,
            scale: evaluationResult === 'correct' ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.4 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isEvaluated}
            placeholder="Type your answer in English..."
            className={`w-full p-5 text-xl bg-white/5 border-b-4 focus:bg-white/10 outline-none transition-all rounded-t-xl
              ${!isEvaluated 
                ? 'border-white/20 focus:border-indigo-500 text-white placeholder-gray-500' 
                : evaluationResult === 'correct'
                  ? 'border-green-500 text-green-400 bg-green-500/10'
                  : evaluationResult === 'almost'
                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                    : 'border-red-500 text-red-400 bg-red-500/10'
              }
            `}
          />
          {!isEvaluated && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg disabled:opacity-30 disabled:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {isEvaluated && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
               <button
                  type="button"
                  onClick={(e) => handleSpeak(e, word.term)}
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
            </div>
          )}
        </motion.form>

        {isEvaluated && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-6 text-center max-w-lg mx-auto"
          >
            {evaluationResult === 'correct' && (
              <p className="text-green-400 font-medium text-lg flex items-center justify-center gap-2">
                <span className="text-2xl">🎉</span> Correct!
              </p>
            )}
            {evaluationResult === 'almost' && (
              <div className="space-y-1">
                 <p className="text-orange-400 font-medium text-lg">Almost!</p>
                 <p className="text-gray-400">The correct spelling is: <strong className="text-white tracking-wide">{word.term}</strong></p>
              </div>
            )}
            {evaluationResult === 'incorrect' && (
              <div className="space-y-1">
                 <p className="text-red-400 font-medium text-lg">Incorrect</p>
                 <p className="text-gray-400">The correct answer is: <strong className="text-white tracking-wide">{word.term}</strong></p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
