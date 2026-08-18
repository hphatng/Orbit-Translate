'use client';

import { usePracticeData } from '../layout';
import PracticeSessionWrapper from '@/app/components/dashboard/practice/PracticeSessionWrapper';

export default function FlashcardPage() {
  const { vocabList, handleComplete } = usePracticeData();

  return (
    <PracticeSessionWrapper 
      words={vocabList || []} 
      mode="flashcard" 
      onComplete={handleComplete} 
    />
  );
}
