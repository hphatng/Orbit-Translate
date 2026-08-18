'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Lock, ArrowRight, Zap, LogIn, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ExtensionCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function checkAuthAndProcess() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const localLoggedIn = typeof window !== 'undefined' && localStorage.getItem('orbit_logged_in') === 'true';
        const localEmail = typeof window !== 'undefined' ? localStorage.getItem('orbit_user_email') : null;

        if (session || localLoggedIn) {
          const email = session?.user?.email || localEmail || 'user@orbittranslate.ai';
          const fullName = session?.user?.user_metadata?.full_name || email.split('@')[0] || 'User';
          const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

          setUserName(fullName);
          setUserEmail(email);

          const tokenData = {
            accessToken: session?.access_token || 'orbit_authenticated_session',
            userId: userId,
            email: email,
            fullName: fullName,
            connectedAt: new Date().toISOString(),
          };

          // Broadcast token to Extension via window postMessage & localStorage event
          window.postMessage({ type: 'ORBIT_EXTENSION_AUTH_SUCCESS', tokenData }, '*');
          localStorage.setItem('orbit_extension_auth', JSON.stringify(tokenData));
          localStorage.setItem('orbit_logged_in', 'true');
          localStorage.setItem('orbit_user_email', email);

          setStatus('authenticated');

          // Attempt to auto close window
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {
              // Browser policy fallback
            }
          }, 2000);
        } else {
          setStatus('unauthenticated');
        }
      } catch (err) {
        setStatus('unauthenticated');
      }
    }

    checkAuthAndProcess();
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-6 font-sans">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-mono-data">
          <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Đang kiểm tra trạng thái đăng nhập WebApp...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/15 rounded-full blur-[160px] pointer-events-none" />

        <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-3xl bg-[#131722] border border-amber-500/30 text-center shadow-2xl space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono-data font-bold">
                🔴 Yêu Cầu Đăng Nhập WebApp
              </span>

              <h1 className="text-2xl font-extrabold text-white mt-3 font-heading">
                Bạn Chưa Đăng Nhập Website!
              </h1>
              <p className="text-xs text-gray-300 font-mono-data mt-2 leading-relaxed">
                Vui lòng đăng nhập tài khoản Orbit Translate trên website trước khi tiến hành kết nối với Chrome Extension.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login?redirect=/auth/extension-callback"
                className="btn-primary-indigo w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Website Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/20 rounded-full blur-[160px] pointer-events-none" />

      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[#131722] border border-emerald-500/30 text-center shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono-data font-bold">
              🟢 Extension Connected
            </span>

            <h1 className="text-2xl font-extrabold text-white mt-3 font-heading">
              Kết Nối Thành Công!
            </h1>
            <p className="text-xs text-gray-300 font-mono-data mt-1">
              Tài khoản <strong className="text-indigo-300">{userName}</strong> ({userEmail}) đã được đồng bộ trực tiếp với Chrome Extension.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs font-mono-data text-gray-400 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Zap className="w-4 h-4 text-amber-400" /> Tính năng đã bật:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-gray-300">
              <li>Tra từ bôi đen tự động biến thành bài tập Trắc nghiệm / Flashcards 3D.</li>
              <li>Hiển thị Badge gợi ý Spaced Repetition FSRS ngay trên trình duyệt.</li>
              <li>Đồng bộ tức thời thời gian thực với WebApp.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                try {
                  window.close();
                } catch (e) {
                  // Fallback
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4 text-gray-400" />
              <span>Đóng Cửa Sổ Ngay (Close Tab)</span>
            </button>
            <p className="text-[11px] text-gray-500 font-mono-data">
              Trình duyệt có thể yêu cầu đóng tab thủ công do chính sách bảo mật.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
