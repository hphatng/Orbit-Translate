'use client';

import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/img/logo_2.png';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileSearch,
  BookMarked,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

import { usePathname } from 'next/navigation';

interface SideNavBarProps {
  profile: UserProfile;
}

export default function SideNavBar({
  profile,
}: SideNavBarProps) {
  const pathname = usePathname();
  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'study_hub', href: '/study-hub', label: 'Study Hub', icon: BookOpen },
    { id: 'scan', href: '/scan-extract', label: 'Scan & Extract', icon: FileSearch },
    { id: 'documents', href: '/documents-translate', label: 'Documents Translate', icon: BookMarked },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full py-6 bg-[#1E293B]/70 backdrop-blur-xl border-r border-white/10 w-64 fixed left-0 top-0 z-40 text-white font-sans justify-between">
      {/* Brand Header with Official 3D Icon & Bold Orbit Translate Text */}
      <div>
        <div className="px-5 mb-8 flex items-center gap-3 cursor-pointer group">
          <Image
            src={logoImg}
            alt="Orbit Translate Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105"
            priority
          />

          <div>
            <h1 className="font-heading font-extrabold text-white text-lg sm:text-xl leading-none tracking-tight flex items-center">
              Orbit<span className="text-[#818CF8]">Translate</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono-data mt-1">AI Language Partner</p>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex flex-col gap-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Highlight if exact match or if it's a sub-route (e.g. /study-hub/practice belongs to /study-hub except if we specifically have a flashcards route)
            let isActive = false;
            if (pathname) {
              if (item.href === '/study-hub') {
                isActive = pathname.startsWith('/study-hub'); // Highlight for all sub-routes too
              } else {
                isActive = pathname.startsWith(item.href);
              }
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 text-xs font-mono-data font-bold rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-500 bg-indigo-500/10 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="space-y-4 px-3">
        {/* Upgrade / Pro Badge */}
        <div className="px-3">
          <Link
            href="/settings"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono-data text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Upgrade to Premium</span>
          </Link>
        </div>

        {/* Settings & Help */}
        <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-2.5 text-xs font-mono-data font-semibold rounded-xl transition-colors ${
              pathname?.startsWith('/settings')
                ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-500 bg-indigo-500/10 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings &amp; API Keys</span>
          </Link>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono-data font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
