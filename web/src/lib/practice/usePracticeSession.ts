import { useState, useEffect, useCallback } from 'react';
import type { VocabularyItem, PracticeModeType, PracticeQuestion } from '@/lib/types';
import { Rating } from '@/../../shared/fsrs';
import { generatePracticeSequence, evaluateWritingAnswer } from './engine';
import { createPracticeSession, submitReviewResult, completePracticeSession } from '@/app/actions/practice';

export function usePracticeSession(words: VocabularyItem[], mode: PracticeModeType) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<VocabularyItem[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect to update elapsed time every second
  useEffect(() => {
    if (isCompleted || !isReady) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, isReady]);

  // Initialize session
  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (words.length === 0) {
        setIsReady(true);
        return;
      }
      const seq = generatePracticeSequence(words, mode);
      setQuestions(seq);
      setIsReady(true);
      
      // Create session in DB asynchronously without blocking UI
      try {
        const res = await createPracticeSession(mode, seq.length);
        if (isMounted && res.sessionId) {
          setSessionId(res.sessionId);
        }
      } catch (err) {
        console.warn('Could not create practice session:', err);
      }
    }
    init();

    return () => {
      isMounted = false;
    };
  }, [words, mode]);

  const currentQuestion = questions[currentIndex] || null;

  const handleNext = useCallback(async (
    isCorrect: boolean | null,
    rating: Rating,
    timeTakenMs: number | null = null
  ) => {
    if (!currentQuestion) return;

    if (isCorrect === true) {
      setCorrectCount(prev => prev + 1);
    } else if (isCorrect === false) {
      setWrongWords(prev => {
        if (!prev.find(w => w.id === currentQuestion.word.id)) {
          return [...prev, currentQuestion.word];
        }
        return prev;
      });
    }

    // Submit result to backend (fire and forget to not block UI)
    submitReviewResult(
      sessionId,
      currentQuestion.word.id,
      currentQuestion.type,
      isCorrect,
      rating,
      currentQuestion.word.srs || {
        stability: 0, difficulty: 0, elapsedDays: 0, scheduledDays: 0, 
        repetitions: 0, lapses: 0, state: 'new', nextReviewDate: new Date().toISOString(), retrievability: 1.0
      },
      timeTakenMs
    );

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      if (sessionId) {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const accuracy = questions.length > 0 ? (finalCorrect) / questions.length * 100 : 0;
        completePracticeSession(sessionId, finalCorrect, accuracy);
      }
    }
  }, [currentIndex, questions, sessionId, currentQuestion, correctCount]);

  const getTimeTakenStr = () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetSession = useCallback(async () => {
    // Soft reset without a full page reload
    setIsCompleted(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongWords([]);
    setElapsedSeconds(0);
    
    // Generate a fresh shuffled sequence
    const seq = generatePracticeSequence(words, mode);
    setQuestions(seq);
    
    // Create new session in backend
    try {
      const res = await createPracticeSession(mode, seq.length);
      if (res.sessionId) {
        setSessionId(res.sessionId);
      }
    } catch (err) {
      console.warn('Could not recreate practice session:', err);
    }
  }, [words, mode]);

  return {
    isReady,
    isCompleted,
    questions,
    currentIndex,
    currentQuestion,
    correctCount,
    wrongWords,
    timeTakenStr: getTimeTakenStr(),
    handleNext,
    resetSession,
    totalQuestions: questions.length
  };
}
