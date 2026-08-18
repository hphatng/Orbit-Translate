import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/img/logo_2.png';

export default function Footer() {
  return (
    <footer className="bg-[#080B12] border-t border-white/5 py-12 sm:py-16 text-left">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <Image 
                src={logoImg} 
                alt="Orbit Translate Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="font-extrabold text-base text-white tracking-tight font-heading">
                Orbit<span className="text-indigo-400 ml-0.5">Translate</span>
              </span>
            </Link>
            <p className="text-[13px] text-gray-400 leading-relaxed font-normal">
              Trợ lý AI bôi đen tra từ &amp; dịch thuật ngữ cảnh nối liền WebApp học tập FSRS. Đọc không ngắt quãng, nhớ vĩnh viễn.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-gray-300 mb-4">Sản Phẩm</h4>
            <ul className="space-y-2.5">
              <li><Link href="/#learning-loop" className="text-xs text-gray-400 hover:text-white transition-colors">Vòng Lặp Học Tập Khép Kín</Link></li>
              <li><Link href="/extension" className="text-xs text-gray-400 hover:text-white transition-colors">Chrome Extension Tra Từ</Link></li>
              <li><Link href="/web-app" className="text-xs text-gray-400 hover:text-white transition-colors">WebApp Study Hub</Link></li>
              <li><Link href="/web-app#fsrs-algorithm" className="text-xs text-gray-400 hover:text-white transition-colors">Thuật Toán FSRS Engine</Link></li>
              <li><a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Cài Đặt Extension Free →</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-gray-300 mb-4">Tài Nguyên</h4>
            <ul className="space-y-2.5">
              <li><Link href="/docs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Tài Liệu Hướng Dẫn (Docs)</Link></li>
              <li><Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">Dashboard Quản Lý</Link></li>
              <li><Link href="/dashboard/practice" className="text-xs text-gray-400 hover:text-white transition-colors">Luyện Thẻ SRS Flashcard</Link></li>
              <li><Link href="/web-app#fsrs-algorithm" className="text-xs text-gray-400 hover:text-white transition-colors">Nghiên Cứu FSRS vs SM-2</Link></li>
              <li><Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">Đăng Nhập Tài Khoản</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-gray-300 mb-4">Kết Nối &amp; Hỗ Trợ</h4>
            <ul className="space-y-2.5">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Discord Community</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Twitter / X</a></li>
              <li><a href="mailto:support@orbit-translate.app" className="text-xs text-gray-400 hover:text-white transition-colors">Liên Hệ Hỗ Trợ (Email)</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-data text-xs">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Orbit Translate. Powered by FSRS Algorithm &amp; Gemini AI.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Chính sách Bảo mật</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Điều khoản Sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

