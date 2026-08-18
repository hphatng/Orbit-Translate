'use client';

import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import LearningLoop from './components/landing/LearningLoop';
import HomeExtensionTeaser from './components/landing/HomeExtensionTeaser';
import HomeWebAppTeaser from './components/landing/HomeWebAppTeaser';
import HomeFSRSTeaser from './components/landing/HomeFSRSTeaser';
import CTASection from './components/landing/CTASection';
import Footer from './components/landing/Footer';

export default function Home() {
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

