import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { InstallModalProvider } from '@/lib/context/InstallModalContext';
import ExtensionInstallModal from './components/landing/ExtensionInstallModal';
import DesktopAdvisoryModal from './components/landing/DesktopAdvisoryModal';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'], 
  variable: '--font-body',
  display: 'swap'
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Orbit Translate — Đọc Không Ngắt Quãng. Dịch, Hiểu, Nhớ Vĩnh Viễn.',
  description:
    'Chrome Extension tra từ & dịch thuật ngữ cảnh 0.1s nối liền WebApp học tập bằng thuật toán FSRS Spaced Repetition.',
  keywords: [
    'Orbit Translate',
    'Chrome extension dịch tiếng anh',
    'học từ vựng FSRS',
    'spaced repetition',
    'phân tích ngữ pháp AI',
    'tra từ ngữ cảnh',
  ],
  openGraph: {
    title: 'Orbit Translate — Dịch, Hiểu, Nhớ Vĩnh Viễn',
    description:
      'Chrome Extension tra từ & dịch thuật ngữ cảnh nối liền WebApp học tập FSRS.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased font-body bg-[#0F1117] text-gray-100" suppressHydrationWarning>
        <InstallModalProvider>
          {children}
          <ExtensionInstallModal />
          <DesktopAdvisoryModal />
        </InstallModalProvider>
      </body>
    </html>
  );
}
