'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import logoImg from '@/img/logo_2.png';

function ChromeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section spy for #fsrs-algorithm and #learning-loop
      const fsrsElement = document.getElementById('fsrs-algorithm');
      const loopElement = document.getElementById('learning-loop');

      const scrollPos = window.scrollY + 200;

      if (fsrsElement && scrollPos >= fsrsElement.offsetTop) {
        setActiveSection('fsrs-algorithm');
      } else if (loopElement && scrollPos >= loopElement.offsetTop && scrollPos < (loopElement.offsetTop + loopElement.offsetHeight)) {
        setActiveSection('learning-loop');
      } else {
        setActiveSection('');
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveSection(hash);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  const navItems = [
    { 
      label: 'Vòng Lặp Học Tập', 
      href: '/#learning-loop', 
      isActive: pathname === '/' && activeSection === 'learning-loop' 
    },
    { 
      label: 'Extension Tra Từ', 
      href: '/extension', 
      isActive: pathname === '/extension' 
    },
    { 
      label: 'WebApp & FSRS', 
      href: '/web-app', 
      isActive: pathname === '/web-app' && activeSection !== 'fsrs-algorithm' 
    },
    { 
      label: 'Thuật Toán FSRS', 
      href: '/web-app#fsrs-algorithm', 
      isActive: (pathname === '/web-app' && activeSection === 'fsrs-algorithm') || (typeof window !== 'undefined' && window.location.hash === '#fsrs-algorithm')
    },
  ];

  return (
    <header
      id="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" id="landing-logo">
            <div className="relative">
              <Image
                src={logoImg}
                alt="Orbit Translate Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-xl blur-md -z-10 group-hover:bg-indigo-500/40 transition-colors" />
            </div>
            <span className="font-extrabold text-[21px] tracking-tight font-heading text-white">
              Orbit<span className="text-indigo-400 ml-0.5">Translate</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-[13.5px] font-semibold transition-all duration-200 ${
                  item.isActive
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono-data font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Chuyển đổi ngôn ngữ hiển thị"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang}</span>
            </button>

            {/* Login */}
            <Link
              href="/login"
              className="text-[14px] font-semibold text-gray-300 hover:text-white transition-colors px-3 py-2"
              id="nav-login-btn"
            >
              Đăng nhập
            </Link>

            {/* Install Button */}
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-indigo flex items-center gap-2 !py-2 !px-4.5 !text-[13.5px]"
              id="nav-cta-btn"
            >
              <ChromeIcon className="w-4 h-4" />
              <span>Cài Extension</span>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            id="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#151923]/98 backdrop-blur-2xl border-t border-white/10 shadow-2xl absolute w-full left-0 top-full animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="section-container py-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-semibold px-3 py-2 rounded-lg transition-colors ${
                  item.isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                    : 'text-gray-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <hr className="border-white/10 my-1" />
            
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-sm text-gray-400">Ngôn ngữ giao diện:</span>
              <button
                onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')}
                className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono-data font-bold text-indigo-400"
              >
                {lang}
              </button>
            </div>

            <Link 
              href="/login" 
              onClick={() => setMobileOpen(false)} 
              className="text-base font-bold text-gray-200 px-3 py-2"
            >
              Đăng nhập WebApp
            </Link>

            <a 
              href="https://chromewebstore.google.com" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)} 
              className="btn-primary-indigo justify-center text-base py-3.5"
            >
              <ChromeIcon className="w-5 h-5" />
              Cài Extension Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

