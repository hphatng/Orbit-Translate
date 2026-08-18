'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  Key,
  Cpu,
  Layers,
  Zap,
  Brain,
  Volume2,
  Bookmark,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info,
  Search,
  Globe,
  HelpCircle,
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useInstallModal } from '@/lib/context/InstallModalContext';

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

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface DocSection {
  id: string;
  title: string;
  category: string;
}

const docSections: DocSection[] = [
  { id: 'overview', title: 'Tổng quan Hệ Thống', category: 'Bắt Đầu Nhanh' },
  { id: 'installation', title: 'Cài Đặt Chrome Extension', category: 'Bắt Đầu Nhanh' },
  { id: 'api-setup', title: 'Nạp & Quản Lý Gemini API Key', category: 'Cấu Hình & API' },
  { id: 'key-pool', title: 'Cơ Chế Round-Robin Key Pool', category: 'Cấu Hình & API' },
  { id: 'lookup-features', title: 'Tra Từ Ngữ Cảnh 0.1s & TTS', category: 'Tính Năng Extension' },
  { id: 'deep-nlp', title: 'Phân Tích Cú Pháp Deep NLP & CEFR', category: 'Tính Năng Extension' },
  { id: 'webapp-sync', title: 'Kết Nối & Đồng Bộ Với WebApp', category: 'Hệ Sinh Thái' },
  { id: 'fsrs-study', title: 'Ôn Tập Thuật Toán FSRS Spaced Repetition', category: 'Hệ Sinh Thái' },
  { id: 'troubleshooting', title: 'Khắc Phục Sự Cố & FAQ', category: 'Hỗ Trợ' },
];

export default function DocsPage() {
  const { openInstallModal } = useInstallModal();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (const section of docSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredSections = docSections.filter((sec) =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#090C14] text-gray-100 selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-12 lg:pt-36 lg:pb-16 bg-[#090C14] border-b border-white/5 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono-data font-bold tracking-wider uppercase backdrop-blur-md">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Orbit Translate Documentation</span>
            </div>

            <h1 className="landing-heading text-3xl sm:text-5xl text-white [text-wrap:balance]">
              Tài Liệu Hướng Dẫn &amp; <br className="hidden sm:inline" />
              <span className="text-gradient-indigo">Kiến Trúc Hoạt Động</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Hướng dẫn toàn diện từ cài đặt Chrome Extension, cấu hình Gemini API Key, bóc tách ngữ pháp Deep NLP đến cơ chế đồng bộ FSRS WebApp.
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={openInstallModal}
                className="btn-primary-indigo !py-2 !px-4 !text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Extension ZIP (303 KB)</span>
              </button>

              <a
                href="https://github.com/hphatng/Orbit-Translate"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-dark !py-2 !px-4 !text-xs flex items-center gap-2"
              >
                <GithubIcon className="w-3.5 h-3.5 text-gray-300" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation Layout (Sidebar + Content) */}
      <div className="section-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION (Desktop 3 cols) */}
          <aside className="lg:col-span-3 sticky top-24 space-y-6 hidden lg:block bg-[#0D111A] p-5 rounded-2xl border border-white/10 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Search filter in sidebar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Categories */}
            {['Bắt Đầu Nhanh', 'Cấu Hình & API', 'Tính Năng Extension', 'Hệ Sinh Thái', 'Hỗ Trợ'].map((cat) => {
              const items = filteredSections.filter((s) => s.category === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-300 px-2 block">
                    {cat}
                  </span>
                  <nav className="space-y-1">
                    {items.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeSection === item.id
                            ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeSection === item.id ? 'text-indigo-400 translate-x-0.5' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
                      </a>
                    ))}
                  </nav>
                </div>
              );
            })}
          </aside>

          {/* MAIN DOCUMENTATION CONTENT (Center 9 cols) */}
          <div className="lg:col-span-9 space-y-16 text-left">
            
            {/* 1. OVERVIEW */}
            <section id="overview" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Nhanh</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                1. Tổng quan Vòng Lặp Học Tập Khép Kín
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                <strong>Orbit Translate</strong> giải quyết triệt để vấn đề lớn nhất của người đọc tiếng Anh chuyên ngành: <span className="text-indigo-300">tra từ rời rạc, không ghi nhớ ngữ cảnh và nhanh chóng quên lãng sau vài ngày</span>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <ChromeIcon className="w-4 h-4" />
                    <span>Chrome Extension (Input Layer)</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tra từ tức thì 0.1s trực tiếp trên mọi trang web. Phân tích ngữ cảnh, bóc tách cấu trúc câu Deep NLP, gán nhãn CEFR và lưu kèm trọn vẹn câu gốc &amp; URL bài báo.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Brain className="w-4 h-4" />
                    <span>WebApp Study Hub (Retention Layer)</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tự động đồng bộ kho từ vựng và câu ngữ cảnh, tính toán lịch ôn tập tối ưu bằng thuật toán giãn cách thời gian <strong>FSRS (Free Spaced Repetition Scheduler)</strong>.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 2. DETAILED INSTALLATION */}
            <section id="installation" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Download className="w-4 h-4" />
                <span>Hướng Dẫn Cài Đặt</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                2. Cài Đặt Chrome Extension (Manifest V3)
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Orbit Translate tương thích 100% với tất cả trình duyệt nền tảng Chromium: <strong>Google Chrome, Microsoft Edge, Brave, Cốc Cốc, Opera, Arc</strong>.
              </p>

              {/* Step by step card */}
              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-bold text-white">Tải gói cài đặt và Giải nén file .ZIP</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-9">
                    Tải gói <span className="text-indigo-300 font-mono">orbit-extension-v3.zip</span> (303 KB) về máy tính. Nhấp chuột phải và chọn <strong>Extract All (Giải nén)</strong> vào một thư mục lưu trữ cố định (ví dụ: <code className="text-emerald-400 font-mono bg-black/40 px-2 py-0.5 rounded">D:\Orbit-Extension</code>).
                  </p>
                  <div className="pl-9 pt-1">
                    <button
                      onClick={openInstallModal}
                      className="btn-primary-indigo !py-2 !px-4 !text-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải gói Extension (.ZIP) Ngay</span>
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-bold text-white">Mở Trang Quản Lý Tiện Ích Chrome</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-9">
                    Mở tab mới trên trình duyệt Chrome và truy cập đường dẫn:
                  </p>
                  <div className="ml-9 flex items-center justify-between p-3 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-gray-200">
                    <span className="text-emerald-400 select-all">chrome://extensions</span>
                    <button
                      onClick={() => copyToClipboard('chrome://extensions', 'chrome-url')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300 hover:text-white transition-colors"
                    >
                      {copiedId === 'chrome-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'chrome-url' ? 'Đã chép!' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed pl-9">
                    Tại góc trên bên phải màn hình, gạt bật công tắc <strong>Developer mode (Chế độ dành cho nhà phát triển)</strong>.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-bold text-white">Tải Tiện Ích Đã Giải Nén (Load Unpacked)</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-9">
                    Nhấn vào nút <strong>Load unpacked (Tải tiện ích đã giải nén)</strong> ở góc trên bên trái, sau đó chọn thư mục bạn vừa giải nén ở Bước 1. Orbit Translate sẽ lập tức xuất hiện trong danh sách tiện ích!
                  </p>
                  <div className="ml-9 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      <strong>Mẹo nhỏ:</strong> Nhấn biểu tượng Mảnh Ghép (Puzzle icon) trên thanh công cụ Chrome và bấm <strong>Ghim (Pin)</strong> Orbit Translate để tiện theo dõi trạng thái và mở bảng cài đặt nhanh.
                    </span>
                  </div>
                </div>

              </div>
            </section>

            <hr className="border-white/5" />

            {/* 3. API SETUP & GEMINI KEY */}
            <section id="api-setup" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Cấu Hình &amp; API</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                3. Hướng Dẫn Lấy &amp; Nạp Google Gemini API Key
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Orbit Translate sử dụng mô hình <strong>Gemini 2.5 Flash / Flash-Lite</strong> với tốc độ phản hồi cực nhanh (dưới 0.1s) và hoàn toàn <strong>miễn phí 100%</strong> (hạn mức lên đến 15 yêu cầu/phút và 1.500 yêu cầu/ngày).
              </p>

              {/* How to get API key */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#0D111A] to-[#121824] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Các bước lấy API Key từ Google AI Studio (Miễn phí):
                </h3>

                <ol className="space-y-3 text-xs sm:text-sm text-gray-300 pl-4 list-decimal marker:text-indigo-400 marker:font-mono marker:font-bold">
                  <li>
                    Truy cập cổng Google AI Studio chính thức:{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-mono underline inline-flex items-center gap-1"
                    >
                      aistudio.google.com/app/apikey
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Đăng nhập bằng tài khoản Google bất kỳ.</li>
                  <li>Bấm nút <strong>Create API key (Tạo khóa API)</strong> và chọn một dự án Google Cloud có sẵn hoặc bấm tạo mới tự động.</li>
                  <li>Sao chép chuỗi ký tự API Key có dạng: <code className="font-mono text-emerald-400 bg-black/50 px-2 py-0.5 rounded">AIzaSy...</code>.</li>
                  <li>
                    Nhấp vào biểu tượng Orbit Translate trên thanh công cụ trình duyệt → chọn tab <strong>Cài Đặt (Settings)</strong> → dán API Key vào ô và bấm <strong>Lưu Key</strong>.
                  </li>
                </ol>

                <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <span>
                    <strong>Bảo Mật Tuyệt Đối (BYOK - Bring Your Own Key):</strong> API Key của bạn được mã hóa và lưu trữ cục bộ trong <code className="font-mono text-white">chrome.storage.local</code> của trình duyệt. Không ai, kể cả máy chủ Orbit Translate, có quyền truy cập vào khóa này.
                  </span>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 4. ROUND-ROBIN KEY POOL */}
            <section id="key-pool" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Kiến Trúc Cân Bằng Tải</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                4. Cơ Chế Xoay Vòng Round-Robin Key Pool &amp; Cooldown 429
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Khi đọc tài liệu dài hoặc quét liên tục, bạn có thể gặp giới hạn RPM (Requests Per Minute). Orbit Translate giải quyết triệt để vấn đề này với thuật toán <strong>Key Pool Router</strong> độc quyền:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-heading">Xoay Vòng Round-Robin</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bạn có thể nạp từ 2 đến 10 API Keys. Mỗi lần tra từ, hệ thống tự động luân chuyển Key tiếp theo, nhân bội băng thông xử lý.
                  </p>
                </div>

                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-heading">Tự Động Cooldown 429</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Nếu 1 Key chạm giới hạn Rate Limit (HTTP 429), Key đó sẽ tự động đưa vào danh sách chờ (Cooldown 60s) và chuyển tiếp request sang Key khác.
                  </p>
                </div>

                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-heading">Tích Hợp Fallback Model</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tự động chuyển đổi giữa <code className="text-indigo-300">gemini-2.5-flash</code> và <code className="text-indigo-300">gemini-flash-lite</code> nếu một model gặp sự cố đường truyền.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 5. EXTENSION FEATURES */}
            <section id="lookup-features" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Tính Năng Trực Quan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                5. Tra Từ Ngữ Cảnh 0.1s &amp; Audio Bản Xứ
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Chỉ cần dùng chuột bôi đen bất kỳ từ vựng hoặc câu văn tiếng Anh nào trên bài báo, popup thông minh sẽ xuất hiện ngay sát con trỏ:
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-gray-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Phát Âm Chuẩn Audio Bản Xứ &amp; Phiên Âm IPA:</strong> Bấm vào biểu tượng loa để nghe giọng đọc chuẩn en-US/vi-VN tự nhiên kèm phiên âm quốc tế chuẩn xác (VD: <span className="text-sky-300 font-mono">/dɪˈvɛləpmənt/</span>).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <Bookmark className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Lưu Trọn Vẹn Câu Gốc &amp; URL Nguồn:</strong> Khi bạn bấm <strong>&quot;Lưu từ vựng&quot;</strong>, Extension sẽ tự động ghi nhớ toàn bộ câu văn gốc và link trang web bạn đang đọc, giúp bạn không bao giờ phải học từ cô lập.
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 6. DEEP NLP & CEFR */}
            <section id="deep-nlp" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>Trí Tuệ Nhân Tạo Chuyên Sâu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                6. Phân Tích Cú Pháp Deep NLP &amp; Gắn Nhãn CEFR
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Khác với các công cụ dịch từ thông thường, Orbit Translate áp dụng mô hình ngôn ngữ phân tích chuyên sâu cho từng câu:
              </p>

              <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Bóc Tách Cấu Trúc Ngữ Pháp Tầng Sâu (Grammar Breakdown)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tự động nhận diện cụm động từ (Phrasal Verbs), thành ngữ (Idioms), mệnh đề quan hệ (Relative Clauses), cấu trúc câu bị động, điều kiện, v.v.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    A1 - Căn bản
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    B1 / B2 - Trung cấp
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    C1 / C2 - Thành thạo Chuyên ngành
                  </span>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 7. WEBAPP SYNC */}
            <section id="webapp-sync" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Hệ Sinh Thái Khép Kín</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                7. Kết Nối &amp; Đồng Bộ Dữ Liệu Với WebApp Study Hub
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Để kết nối Extension với tài khoản học tập trên WebApp, bạn chỉ cần thực hiện 1 bước duy nhất:
              </p>

              <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đồng Bộ 1-Click Tự Động:
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Khi đăng nhập vào WebApp tại <Link href="/login" className="text-indigo-400 underline">/login</Link>, Extension sẽ tự động nhận diện phiên đăng nhập và đồng bộ token bảo mật. Mọi từ vựng bạn lưu khi lướt web sẽ ngay lập tức xuất hiện trong <Link href="/dashboard" className="text-indigo-400 underline">Dashboard Quản Lý</Link>.
                </p>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 8. FSRS SPACED REPETITION */}
            <section id="fsrs-study" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>Thuật Toán Trí Nhớ FSRS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                8. Ôn Tập Thuật Toán FSRS (Free Spaced Repetition Scheduler)
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                FSRS là thuật toán lặp lại ngắt quãng thế hệ mới nhất (vượt trội hơn 30% so với SM-2 cũ của Anki), mô hình hóa chính xác đường cong quên lãng dựa trên 4 biến số:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Độ Ổn Định</span>
                  <strong className="text-sm font-mono text-emerald-400">Stability (S)</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Độ Khó Từ</span>
                  <strong className="text-sm font-mono text-amber-400">Difficulty (D)</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Độ Lưu Giữ</span>
                  <strong className="text-sm font-mono text-sky-400">Retrievability (R)</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Chu Kỳ Ôn</span>
                  <strong className="text-sm font-mono text-purple-400">Optimal Interval</strong>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* 9. TROUBLESHOOTING & FAQ */}
            <section id="troubleshooting" className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Hỗ Trợ Kỹ Thuật</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                9. Khắc Phục Sự Cố Thường Gặp (Troubleshooting)
              </h2>

              <div className="space-y-4">
                
                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Lỗi 429: &quot;Resource has been exhausted (Quota Exceeded)&quot;?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong>Nguyên nhân:</strong> Bạn đã gửi quá nhiều yêu cầu vượt quá giới hạn 15 RPM của 1 Key cá nhân.<br />
                    <strong>Khắc phục:</strong> Nạp thêm 1-2 Google Gemini API Keys vào danh sách Key Pool trong Extension để kích hoạt chế độ xoay vòng Round-Robin tự động.
                  </p>
                </div>

                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-400" />
                    Extension không hiện popup trên trang web mới mở?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong>Khắc phục:</strong> Sau khi cài đặt Extension lần đầu, hãy <strong>F5 (Reload)</strong> lại các tab trình duyệt đang mở để script được nạp vào trang. Lưu ý Extension không chạy trên các trang hệ thống của Chrome (<code className="text-emerald-400 font-mono">chrome://...</code>).
                  </p>
                </div>

                <div className="card-obsidian p-5 space-y-2 border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    Cách cập nhật Extension khi có phiên bản mới trên GitHub?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tải file <code className="text-indigo-300 font-mono">orbit-extension-v3.zip</code> mới nhất và giải nén đè vào thư mục cũ. Sau đó vào <code className="text-emerald-400 font-mono">chrome://extensions</code> và bấm nút biểu tượng <strong>Làm mới (Reload ↻)</strong> trên thẻ Orbit Translate.
                  </p>
                </div>

              </div>
            </section>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
