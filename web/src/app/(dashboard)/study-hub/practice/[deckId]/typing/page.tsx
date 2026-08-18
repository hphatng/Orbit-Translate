'use client';

import { usePracticeData } from '../layout';
import PracticeSessionWrapper from '@/app/components/dashboard/practice/PracticeSessionWrapper';

export default function TypingPage() {
  const { vocabList, handleComplete } = usePracticeData();

  return (
    <PracticeSessionWrapper 
      words={vocabList || []} 
      mode="typing" 
      onComplete={handleComplete} 
    />
  );
}
