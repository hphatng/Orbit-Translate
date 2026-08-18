'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Timer, Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { VocabularyItem } from '@/lib/types';
import PracticeResultScreen from './PracticeResultScreen';
import { useLearningSound } from '@/lib/practice/useLearningSound';

interface MatchingModeProps {
  words: VocabularyItem[];
  onComplete: () => void;
}

interface Tile {
  id: string;
  wordId: string;
  text: string;
  type: 'term' | 'translation';
}

export default function MatchingMode({ words, onComplete }: MatchingModeProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const { playCorrect, playIncorrect, playComplete } = useLearningSound();

  // Initialize matching grid (up to 6 pairs = 12 tiles)
  useEffect(() => {
    const selectedWords = words.slice(0, 6);
    const generatedTiles: Tile[] = [];

    selectedWords.forEach((w) => {
      generatedTiles.push({
        id: `term_${w.id}`,
        wordId: w.id,
        text: w.term,
        type: 'term',
      });
      generatedTiles.push({
        id: `trans_${w.id}`,
        wordId: w.id,
        text: w.translation,
        type: 'translation',
      });
    });

    // Shuffle tiles
    setTiles(generatedTiles.sort(() => 0.5 - Math.random()));
  }, [words]);

  // Timer counter
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleTileClick = (tile: Tile) => {
    if (matchedIds.includes(tile.wordId) || wrongTileIds.includes(tile.id)) return;

    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    // Check if match
    if (selectedTile.wordId === tile.wordId && selectedTile.type !== tile.type) {
      const newMatched = [...matchedIds, tile.wordId];
      setMatchedIds(newMatched);
      setSelectedTile(null);
      
      // Play sound
      playCorrect();

      // Check if all matched
      if (newMatched.length === Math.min(words.length, 6)) {
        setIsGameOver(true);
        setTimeout(() => playComplete(), 300);
      }
    } else {
      // Wrong match
      playIncorrect();
      setWrongTileIds([selectedTile.id, tile.id]);
      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTile(null);
      }, 700);
    }
  };

  if (words.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center font-sans bg-[#0F1117] p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400">
          <Puzzle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Words to Match</h3>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          You don&apos;t have any vocabulary items in this deck to play Matching Game. Sync some words from the extension first!
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

  return (
    <div className="flex flex-col h-full w-full font-sans bg-[#0F1117]">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#181A22] shrink-0">
        <div className="flex items-center gap-3 text-indigo-400">
          <Puzzle className="w-5 h-5" />
          <span className="font-semibold text-white tracking-wide">Match</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-300 font-mono-data text-sm">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="w-8">{timerSeconds}s</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 font-mono-data text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{matchedIds.length} / {Math.min(words.length, 6)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
        {!isGameOver ? (
          <div className="w-full max-w-5xl h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
            {tiles.map((tile) => {
              const isMatched = matchedIds.includes(tile.wordId);
              const isSelected = selectedTile?.id === tile.id;
              const isWrong = wrongTileIds.includes(tile.id);

              let cardStyle = 'bg-[#292D3E] border-white/5 text-gray-100 hover:bg-[#32374C] hover:border-white/10 shadow-sm';

              if (isMatched) {
                cardStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default shadow-none';
              } else if (isWrong) {
                cardStyle = 'bg-red-500/20 border-red-500 text-red-300';
              } else if (isSelected) {
                cardStyle = 'bg-[#3A4161] border-indigo-400 text-white font-bold shadow-lg shadow-indigo-500/20';
              }

              return (
                <motion.button
                  key={tile.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isMatched ? 0 : 1, 
                    scale: isMatched ? 0.9 : 1,
                    x: isWrong ? [0, -10, 10, -10, 10, 0] : 0,
                  }}
                  transition={{ 
                    duration: isWrong ? 0.4 : 0.2,
                    opacity: { duration: 0.3 }
                  }}
                  whileTap={!isMatched && !isWrong ? { scale: 0.97 } : {}}
                  onClick={() => handleTileClick(tile)}
                  disabled={isMatched}
                  className={`rounded-2xl border flex items-center justify-center p-6 text-center transition-colors pointer-events-auto
                    ${isMatched ? 'pointer-events-none' : ''}
                    ${cardStyle}`}
                  style={{ minHeight: '120px' }}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-medium tracking-tight break-words max-w-full">
                    {tile.text}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Victory Screen */
          <PracticeResultScreen
            score={Math.min(words.length, 6)}
            total={Math.min(words.length, 6)}
            accuracy={100}
            timeTaken={`${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
            xpEarned={Math.min(words.length, 6) * 5}
            wrongWords={[]}
            onRetry={() => {
              setMatchedIds([]);
              setWrongTileIds([]);
              setSelectedTile(null);
              setTimerSeconds(0);
              setIsGameOver(false);
              // reshuffle
              setTiles(prev => [...prev].sort(() => 0.5 - Math.random()));
            }}
            onContinue={onComplete}
          />
        )}
      </div>
    </div>
  );
}
