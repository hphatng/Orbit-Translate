'use client';

import { usePracticeData } from '../layout';
import MatchingMode from '@/app/components/dashboard/practice/MatchingMode';

export default function MatchingPage() {
  const { vocabList, handleComplete } = usePracticeData();

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[#11131A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <MatchingMode 
        words={vocabList || []} 
        onComplete={handleComplete} 
      />
    </div>
  );
}
