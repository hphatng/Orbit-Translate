'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Briefcase, ArrowRight } from 'lucide-react';
import { MOCK_PROFILE, INITIAL_VOCABULARY } from '@/lib/mockData';
import type { UserProfile, VocabularyItem, Deck } from '@/lib/types';
import { getUserProfile, getUserWords, getUserDecks } from '@/lib/services/supabaseService';
import { createClient } from '@/lib/supabase/client';
import DailyProgressWidget from '@/app/components/dashboard/DailyProgressWidget';

export default function DashboardView() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileRes = await getUserProfile(user.id);
      if (profileRes.success) {
        setProfile(profileRes.data);
      } else {
        setProfile({
          id: user.id,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          targetCefr: 'B2',
          dailyGoal: 20,
          streakDays: 0,
          totalWordsLearned: 0,
          masteryRate: 0,
          bio: '',
          occupation: '',
        });
      }
      
      const wordsRes = await getUserWords(user.id);
      if (wordsRes.success) {
        setVocabList(wordsRes.data);
      } else {
        setVocabList([]);
      }
      
      const decksRes = await getUserDecks(user.id);
      if (decksRes.success) {
        setDecks(decksRes.data);
      } else {
        setDecks([]);
      }
    }

    loadUserData();

    // Revalidate automatically whenever the user focuses back on the website tab
    const onFocus = () => loadUserData();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadUserData();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Supabase Realtime Channel for instant live updates when words are synced from extension
    const channel = supabase
      .channel('realtime_words_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'words' }, () => {
        loadUserData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTakePractices = () => {
    router.push('/study-hub/practice?deckId=deck_ext_today');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
      {/* Welcome Header Section */}
      <div className="col-span-1 md:col-span-12 mb-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
          Welcome back, {profile?.fullName.split(' ')[0] || 'User'}.
        </h2>
        <p className="text-sm text-gray-400 font-mono-data">
          Your daily focus is ready. You have {vocabList.length} items synced from Chrome Extension.
        </p>
      </div>

      {/* Left Column (Primary Focus - 8 Cols) */}
      <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
        {/* Continue Learning Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-heading text-xl font-bold text-white">Continue Learning</h3>
            <button
              onClick={() => router.push('/study-hub')}
              className="text-xs font-mono-data font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View Library <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Today Chrome Extension Card (Core Default Deck - Instant Zero-Delay Render) */}
            <div
              onClick={handleTakePractices}
              className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <div className="h-full progress-bar-fill w-0" />
              </div>

              <div className="flex justify-between items-start mb-4 mt-1">
                <div className="bg-[#13121b] p-2.5 rounded-xl border border-amber-500/30">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
                <span className="text-[11px] font-mono-data font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  🔥 Synced Today
                </span>
              </div>

              <div>
                <h4 className="font-heading text-lg font-bold text-white mb-1">
                  Chrome Extension Synced
                </h4>
                <p className="text-xs text-gray-400 mb-6 font-mono-data">
                  {vocabList.length > 0
                    ? `${vocabList.filter(w => (w as any).sourceType !== 'SCAN_EXTRACT' && (w as any).source_type !== 'SCAN_EXTRACT').length || vocabList.length} từ vựng vừa bôi đen tra từ`
                    : 'Chưa có từ vựng hôm nay — Bôi đen từ trên web để tự động đồng bộ'}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto">
                <div className="flex -space-x-2">
                  {profile?.avatarUrl && (
                    <img
                      className="w-6 h-6 rounded-full border border-[#0F172A]"
                      src={profile.avatarUrl}
                      alt="User"
                    />
                  )}
                  <div className="w-6 h-6 rounded-full border border-[#0F172A] bg-amber-500/20 flex items-center justify-center text-[9px] font-mono-data text-amber-300 font-bold">
                    +{vocabList.filter(w => (w as any).sourceType !== 'SCAN_EXTRACT' && (w as any).source_type !== 'SCAN_EXTRACT').length || vocabList.length}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTakePractices();
                  }}
                  className="btn-primary-indigo text-xs font-mono-data font-bold px-4 py-1.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:scale-105"
                >
                  Take Practices!
                </button>
              </div>
            </div>

            {/* 2. Tài Liệu Scan AI Card (Core Default Deck - Instant Zero-Delay Render) */}
            {(() => {
              const scanDeck = decks.find(d => d.category === 'Scan AI' || d.id === 'deck_scan_ai' || d.title.toLowerCase().includes('scan') || d.title.toLowerCase().includes('tài liệu'));
              const scanCount = scanDeck?.totalWords ?? vocabList.filter(w => (w as any).sourceType === 'SCAN_EXTRACT' || (w as any).source_type === 'SCAN_EXTRACT').length;
              const scanDeckId = scanDeck?.id || 'deck_scan_ai';

              return (
                <div 
                  onClick={() => router.push(`/study-hub/practice?deckId=${scanDeckId}`)}
                  className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer border-indigo-500/40 shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col justify-between min-h-[220px]"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div className="h-full progress-bar-fill w-0" />
                  </div>

                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div className="bg-[#13121b] p-2.5 rounded-xl border border-indigo-500/30">
                      <Briefcase className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-mono-data font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      Scan AI
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading text-lg font-bold text-white mb-1">
                      Tài Liệu Scan AI
                    </h4>
                    <p className="text-xs text-gray-400 mb-6 font-mono-data">
                      {scanCount > 0 ? `${scanCount} từ vựng trong bộ` : 'Chưa có từ trích xuất — Vào Scan & Extract để quét tài liệu'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex -space-x-2">
                      {profile?.avatarUrl && (
                        <img
                          className="w-6 h-6 rounded-full border border-[#0F172A]"
                          src={profile.avatarUrl}
                          alt="User"
                        />
                      )}
                      <div className="w-6 h-6 rounded-full border border-[#0F172A] bg-indigo-500/20 flex items-center justify-center text-[9px] font-mono-data text-indigo-300 font-bold">
                        +{scanCount}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/study-hub/practice?deckId=${scanDeckId}`);
                      }}
                      className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono-data font-bold text-gray-300 hover:text-white transition-colors"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </div>

      {/* Right Column (Widgets - 4 Cols) */}
      <div className="col-span-1 md:col-span-4">
        {profile && <DailyProgressWidget profile={profile} />}
      </div>
    </div>
  );
}
