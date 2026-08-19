'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import LearningLoop from './components/landing/LearningLoop';
import HomeExtensionTeaser from './components/landing/HomeExtensionTeaser';
import HomeWebAppTeaser from './components/landing/HomeWebAppTeaser';
import HomeFSRSTeaser from './components/landing/HomeFSRSTeaser';
import CTASection from './components/landing/CTASection';
import Footer from './components/landing/Footer';

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (
            params.has('download') ||
            params.has('install') ||
            params.get('action') === 'install' ||
            params.get('action') === 'download' ||
            window.location.hash.includes('install') ||
            window.location.hash.includes('download')
          ) {
            setCheckingAuth(false);
            return;
          }
        }

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace('/dashboard');
          return;
        }

        const localLoggedIn = typeof window !== 'undefined' && localStorage.getItem('orbit_logged_in') === 'true';
        if (localLoggedIn) {
          router.replace('/dashboard');
          return;
        }
      } catch {
        // Fallback to landing page
      } finally {
        setCheckingAuth(false);
      }
    }
    checkUserSession();
  }, [router]);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#0B0F17] text-gray-100 selection:bg-indigo-500/30">
      <Navbar />
      <HeroSection />
      <LearningLoop />
      <HomeExtensionTeaser />
      <HomeWebAppTeaser />
      <HomeFSRSTeaser />
      <CTASection />
      <Footer />
    </main>
  );
}


