'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_DECKS, INITIAL_VOCABULARY, TODAY_EXTENSION_DECK } from '@/lib/mockData';
import type { Deck, VocabularyItem } from '@/lib/types';
import { getUserWords, getUserDecks } from '@/lib/services/supabaseService';
import { createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';

import { LearningSettingsProvider } from '@/lib/practice/LearningSettingsContext';

// Create a Context to pass data to child mode pages
interface PracticeContextType {
  vocabList: VocabularyItem[];
  handleComplete: () => void;
  handleNextMode: (currentModeId: string) => void;
}

export const PracticeContext = createContext<PracticeContextType>({
  vocabList: [],
  handleComplete: () => {},
  handleNextMode: () => {},
});

export function usePracticeData() {
  return useContext(PracticeContext);
}

function PracticeLayoutContent({ children, deckId }: { children: React.ReactNode, deckId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract current mode from pathname (e.g. /study-hub/practice/deck_ext_today/flashcard -> flashcard)
  const currentMode = pathname?.split('/').pop() || 'flashcard';

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const activeUserId = user.id;
      const wordsRes = await getUserWords(activeUserId);
      const loadedWords = wordsRes.success ? wordsRes.data : [];
      // Fetch words for this specific deck only
      let wordsForDeck: VocabularyItem[] = [];
      if (deckId === 'deck_ext_today') {
        const extWords = loadedWords.filter(w => (w as any).sourceType !== 'SCAN_EXTRACT' && (w as any).source_type !== 'SCAN_EXTRACT');
        wordsForDeck = extWords.length > 0 ? extWords : loadedWords;
      } else if (deckId === 'deck_scan_ai' || deckId.startsWith('deck_scan_')) {
        wordsForDeck = loadedWords.filter(w => (w as any).sourceType === 'SCAN_EXTRACT' || (w as any).source_type === 'SCAN_EXTRACT' || w.deckId === deckId);
      } else {
        wordsForDeck = loadedWords.filter(w => w.deckId === deckId);
      }
      setVocabList(wordsForDeck);

      const decksRes = await getUserDecks(activeUserId);
      const loadedDecks = decksRes.success ? decksRes.data : [];

      if (deckId === 'deck_ext_today') {
        setSelectedDeck({
          ...TODAY_EXTENSION_DECK,
          totalWords: wordsForDeck.length,
        });
      } else if (deckId === 'deck_scan_ai' || deckId.startsWith('deck_scan_')) {
        const existingScanDeck = loadedDecks.find((d) => d.id === deckId || d.category === 'Scan AI');
        setSelectedDeck(existingScanDeck ? { ...existingScanDeck, totalWords: wordsForDeck.length } : {
          id: deckId,
          title: 'Tài Liệu Scan AI',
          description: 'Từ vựng & ngữ pháp trích xuất từ tài liệu Scan AI',
          category: 'Scan AI',
          totalWords: wordsForDeck.length,
          masteredWords: 0,
          lastStudied: 'Hôm nay',
          color: 'from-indigo-600 to-purple-600',
          iconName: 'FileSearch',
        });
      } else if (deckId) {
        const deck = loadedDecks.find((d) => d.id === deckId) || MOCK_DECKS.find((d) => d.id === deckId);
        if (deck) setSelectedDeck(deck);
      } else {
        setSelectedDeck(loadedDecks[0] || MOCK_DECKS[0]);
      }
      setIsLoading(false);
    }
    loadData();
  }, [deckId]);

  const isSyncedTodayPractice = selectedDeck?.id === 'deck_ext_today';

  const handleComplete = () => {
    router.push('/study-hub');
  };

  const modes = [
    { id: 'flashcard', label: '🃏 Flashcards' },
    { id: 'quiz', label: '📝 Quiz' },
    { id: 'typing', label: '✍️ Typing' },
    { id: 'matching', label: '🧩 Match' },
    { id: 'grammar', label: '📖 Grammar' },
  ];

  const handleNextMode = (currentModeId: string) => {
    const currentIndex = modes.findIndex((m) => m.id === currentModeId);
    if (currentIndex >= 0 && currentIndex < modes.length - 1) {
      const nextModeId = modes[currentIndex + 1].id;
      router.push(`/study-hub/practice/${deckId}/${nextModeId}`);
    } else {
      router.push('/study-hub');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading Vocabulary...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto pb-4">
      {/* 1. Header: Back Button & Deck Info */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={() => router.push('/study-hub')}
          className="inline-flex items-center gap-2 text-xs font-mono-data text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Study Hub
        </button>

        <div className="flex items-center gap-3 text-right">
          {isSyncedTodayPractice && (
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] border border-amber-500/20 font-bold font-mono-data flex items-center gap-1">
              <Flame className="w-3 h-3" /> Synced Today
            </span>
          )}
          <h2 className="text-sm font-bold text-white font-heading">
            {selectedDeck?.title || 'Loading...'}
          </h2>
          <span className="text-xs text-gray-500 font-mono-data">
            ({selectedDeck?.totalWords || vocabList.length} words)
          </span>
        </div>
      </div>

      {/* 2. Mode Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {modes.map((mode) => (
          <Link
            key={mode.id}
            href={`/study-hub/practice/${deckId}/${mode.id}`}
            className={`py-1.5 px-4 rounded-lg text-xs font-mono-data font-bold transition-all ${
              currentMode === mode.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {mode.label}
          </Link>
        ))}
      </div>

      {/* 3. Practice Area (Rendered via Children) */}
      <div className="flex-1 min-h-0 w-full relative">
        <PracticeContext.Provider value={{ vocabList, handleComplete, handleNextMode }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </PracticeContext.Provider>
      </div>
    </div>
  );
}

import { use } from 'react';

export default function PracticeLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = use(params);
  return (
    <LearningSettingsProvider>
      <Suspense fallback={<div className="text-white text-center p-8">Loading layout...</div>}>
        <PracticeLayoutContent deckId={deckId}>{children}</PracticeLayoutContent>
      </Suspense>
    </LearningSettingsProvider>
  );
}
