'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import logoImg from '@/img/logo_2.png';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...props}>
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('next') || searchParams.get('redirect') || searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const isConfigured = 
    envUrl.length > 0 && 
    envUrl !== 'https://placeholder.supabase.co' && 
    !envUrl.includes('your-project');

  useEffect(() => {
    async function checkAuth() {
      if (isConfigured) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            router.replace(redirectTarget);
          } else {
            localStorage.removeItem('orbit_logged_in');
          }
        } catch {
          localStorage.removeItem('orbit_logged_in');
        }
      }
    }
    checkAuth();
  }, [isConfigured, redirectTarget, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      if (isConfigured || process.env.NODE_ENV === 'production') {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem('orbit_logged_in', 'true');
      localStorage.setItem('orbit_user_email', email);

      setTimeout(() => {
        setIsLoading(false);
        window.location.href = redirectTarget;
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi kết nối Supabase.');
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      localStorage.setItem('orbit_logged_in', 'true');
      localStorage.setItem('orbit_user_email', `google_user@orbittranslate.ai`);

      if (isConfigured || process.env.NODE_ENV === 'production') {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTarget)}`,
          },
        });
        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }
      } else {
        setTimeout(() => {
          setIsLoading(false);
          window.location.href = redirectTarget;
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra.');
      setIsLoading(false);
    }
  };

  const handleGithubClick = () => {
    setErrorMessage('');
    setInfoMessage('Tính năng đăng nhập với GitHub đang trong giai đoạn phát triển. Vui lòng tiếp tục với Google hoặc Email.');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Về trang chủ</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <Image src={logoImg} alt="Orbit Translate" width={30} height={30} className="rounded-lg" />
          <span className="font-extrabold text-lg text-white tracking-tight font-heading">
            Orbit<span className="text-indigo-400">Translate</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          <div className="card-obsidian p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#131722]/95 backdrop-blur-2xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono-data font-bold mb-3">
                <Sparkles className="w-3 h-3" /> Welcome back
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mb-2">
                Đăng Nhập WebApp
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Truy cập kho từ vựng đã lưu &amp; luyện tập thẻ FSRS
              </p>
            </div>

            {!isConfigured && (
              <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-data leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Chưa nạp .env.local:</strong> Hãy tạo file <code className="bg-amber-500/20 px-1 rounded">web/.env.local</code> và restart dev server (<code className="bg-amber-500/20 px-1 rounded">npm run dev</code>) để kết nối Supabase thật.
                </div>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all hover:border-white/25 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Tiếp tục với Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubClick}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all hover:border-white/25 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <GithubIcon />
                  <span>Tiếp tục với GitHub</span>
                </div>
                <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Đang phát triển
                </span>
              </button>
            </div>

            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-data leading-relaxed flex items-start gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </motion.div>
            )}

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-white/10" />
              <span className="shrink-0 px-3 text-[11px] font-mono-data font-semibold uppercase tracking-wider text-gray-500 bg-[#131722] select-none">
                Hoặc Email
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-data flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-data font-bold text-gray-300 mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono-data font-bold text-gray-300">
                    MẬT KHẨU
                  </label>
                  <a href="#" className="text-xs text-indigo-400 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-indigo w-full justify-center py-3.5 text-sm font-bold mt-6 shadow-lg shadow-indigo-600/20 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Đăng Nhập Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
              Chưa có tài khoản Orbit Translate?{' '}
              <Link href={`/signup${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : ''}`} className="text-indigo-400 font-bold hover:underline ml-1">
                Đăng ký ngay
              </Link>
            </div>

          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-gray-500 font-mono-data border-t border-white/5">
        © {new Date().getFullYear()} Orbit Translate. Bảo mật dữ liệu với Supabase RLS.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-white">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
