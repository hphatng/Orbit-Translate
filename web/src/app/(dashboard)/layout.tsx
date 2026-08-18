'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MOCK_PROFILE } from '@/lib/mockData';
import { UserProfile } from '@/lib/types';
import { getUserProfile } from '@/lib/services/supabaseService';
import { createClient } from '@/lib/supabase/client';
import SideNavBar from '@/app/components/dashboard/SideNavBar';
import TopAppBar from '@/app/components/dashboard/TopAppBar';
import SettingsModalView from '@/app/components/dashboard/SettingsModalView';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [searchQuery, setSearchQuery] = useState('');
  const [prevRoute, setPrevRoute] = useState('/dashboard');
  const router = useRouter();
  const pathname = usePathname();

  // Track previous route for smart close button
  useEffect(() => {
    if (pathname && !pathname.startsWith('/settings')) {
      setPrevRoute(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileRes = await getUserProfile(user.id);
      if (profileRes.success) {
        setProfile(profileRes.data);
      } else {
        // Fallback profile if the user hasn't setup profile or error
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
    }
    loadUserData();
  }, []);

  const handleTakePractices = () => {
    router.push('/study-hub/practice?deckId=deck_ext_today');
  };

  return (
    <div suppressHydrationWarning className="bg-[#0F172A] text-[#e4e1ee] flex min-h-screen font-sans">
      <SideNavBar
        profile={profile}
      />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-[#0F172A]">
        {/* We only show the TopAppBar on standard dashboard pages, not necessarily during a practice session */}
        {!pathname?.startsWith('/study-hub/practice') && (
          <TopAppBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStartSession={handleTakePractices}
          />
        )}

        <div className="p-4 md:p-8 flex-1 max-w-[1280px] w-full mx-auto">
          {children}
        </div>
      </main>

      <SettingsModalView 
        profile={profile} 
        onSaveProfile={setProfile} 
        prevRoute={prevRoute} 
      />
    </div>
  );
}
