'use client';

import { usePracticeData } from '../layout';
import GrammarMode from '@/app/components/dashboard/practice/GrammarMode';
import { generateGrammarExercises } from '@/lib/practice/engine';

export default function GrammarPage() {
  const { vocabList, handleComplete } = usePracticeData();

  // Generate exercises dynamically from vocabList
  const exercises = generateGrammarExercises(vocabList || []);

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[#11131A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {exercises.length > 0 ? (
        <GrammarMode 
          exercises={exercises} 
          onComplete={handleComplete} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 h-[400px] text-center">
          <h3 className="text-xl font-bold text-white mb-2">Not Enough Data</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            You need to sync words that contain example sentences to use Grammar Mode. Try translating full sentences with Orbit Translate extension!
          </p>
          <button
            onClick={handleComplete}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono-data font-bold transition-colors"
          >
            Back to Study Hub
          </button>
        </div>
      )}
    </div>
  );
}
