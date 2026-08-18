'use client';

import { Search, Bell, History, Play } from 'lucide-react';
import Image from 'next/image';
import logoImg from '@/img/logo_2.png';

interface TopAppBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStartSession: () => void;
}

export default function TopAppBar({ searchQuery, onSearchChange, onStartSession }: TopAppBarProps) {
  return (
    <header className="flex justify-between items-center px-4 md:px-8 h-16 w-full top-0 sticky z-30 bg-[#1E293B]/80 backdrop-blur-md border-b border-white/10 text-white font-sans">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <Image src={logoImg} alt="Logo" width={28} height={28} className="rounded-lg object-contain" />
          <span className="font-heading font-extrabold text-white text-base tracking-tight">
            Orbit<span className="text-indigo-400">Translate</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-[#13121b]/80 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vocabulary, sets, or folders..."
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-400 font-sans"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="text-gray-400 hover:text-indigo-300 transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <Bell className="w-5 h-5" />
        </button>

        <button className="text-gray-400 hover:text-indigo-300 transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <History className="w-5 h-5" />
        </button>

        <button
          onClick={onStartSession}
          className="btn-primary-indigo text-xs font-mono-data font-bold px-5 py-2 rounded-full shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Take Practices!</span>
        </button>
      </div>
    </header>
  );
}
