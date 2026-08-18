'use client';

import { useState } from 'react';
import { BookOpen, Settings2 } from 'lucide-react';
import { usePracticeSession } from '@/lib/practice/usePracticeSession';
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import TypingMode from './TypingMode';
import type { VocabularyItem, PracticeModeType } from '@/lib/types';
import PracticeResultScreen from './PracticeResultScreen';
import { usePracticeData } from '@/app/(dashboard)/study-hub/practice/[deckId]/layout';
import LearningSettingsModal from './LearningSettingsModal';

interface PracticeSessionWrapperProps {
  words: VocabularyItem[];
  mode: PracticeModeType;
  onComplete: () => void;
}

export default function PracticeSessionWrapper({ words, mode, onComplete }: PracticeSessionWrapperProps) {
  const { handleNextMode } = usePracticeData();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    isReady,
    isCompleted,
    currentQuestion,
    currentIndex,
    totalQuestions,
    correctCount,
    wrongWords,
    timeTakenStr,
    handleNext,
    resetSession
  } = usePracticeSession(words, mode);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading Practice Session...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center font-sans bg-[#11131A] rounded-2xl border border-white/5 p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Words in This Deck</h3>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          You don&apos;t have any vocabulary items in this deck yet. Select and translate words with the Orbit Translate Chrome extension to add them automatically!
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono-data font-bold transition-colors"
        >
          Back to Study Hub
        </button>
      </div>
    );
  }

  // Calculate Progress
  const progressPercent = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[#11131A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
      <LearningSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentMode={mode} 
      />
      
      {/* Session Header (Progress Bar & Settings) */}
      <header className="flex flex-col flex-shrink-0 pt-4 pb-3 px-6 lg:px-8 border-b border-white/5 bg-[#181A22]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-xs font-mono-data font-medium tracking-wide">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-500 font-mono-data uppercase tracking-wider hidden sm:block">
              Orbit Translate Practice
            </span>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors bg-white/5 hover:bg-white/10"
              title="Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 md:p-8 relative">
        {isCompleted ? (
          <PracticeResultScreen
            score={correctCount}
            total={totalQuestions}
            accuracy={totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}
            timeTaken={timeTakenStr}
            xpEarned={correctCount * 10} // Dummy XP for now
            wrongWords={wrongWords}
            onRetry={resetSession}
            onContinue={() => {
              if (handleNextMode) {
                handleNextMode(mode);
              } else {
                onComplete();
              }
            }}
          />
        ) : !currentQuestion ? (
          <div className="text-center text-gray-400">
            No valid questions available for this mode.
          </div>
        ) : currentQuestion.type === 'flashcard' ? (
          <FlashcardMode
            word={currentQuestion.word}
            onNext={handleNext}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
          />
        ) : currentQuestion.type === 'multiple_choice' ? (
          <QuizMode
            question={currentQuestion}
            onNext={handleNext}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
          />
        ) : currentQuestion.type === 'writing' ? (
          <TypingMode
            question={currentQuestion}
            onNext={handleNext}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
          />
        ) : (
          <div>Unknown question type</div>
        )}
      </main>
    </div>
  );
}
