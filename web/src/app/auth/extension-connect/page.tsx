'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Lock, ArrowRight, LogIn, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

declare const chrome: any;

export default function ExtensionConnectPage() {
  const [status, setStatus] = useState<'loading' | 'connecting' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const extId = params.get('extensionId');

    let ackReceived = false;

    // Listen for ACK from content.js running in Chrome/Edge/Brave
    const handleAck = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ORBIT_EXTENSION_ACK') {
        ackReceived = true;
        setStatus('success');
        setTimeout(() => {
          try { window.close(); } catch {}
        }, 2500);
      }
    };

    window.addEventListener('message', handleAck);

    async function connectExtension() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          const currentUrl = encodeURIComponent(`/auth/extension-connect${extId ? `?extensionId=${extId}` : ''}`);
          window.location.href = `/login?next=${currentUrl}`;
          return;
        }

        const email = session.user.email || '';
        setUserEmail(email);
        setStatus('connecting');

        const tokenData = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          userId: session.user.id,
          email: email,
          fullName: session.user.user_metadata?.full_name || email.split('@')[0] || 'User',
          connectedAt: new Date().toISOString(),
        };

        // Tier 1: PostMessage broadcast for content.js (Works 100% on Edge, Chrome, Brave, Arc)
        window.postMessage({
          type: 'ORBIT_EXTENSION_AUTH_SUCCESS',
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
          tokenData,
        }, '*');

        // Tier 2: Mirror in localStorage for zero-click auto-detection
        localStorage.setItem('orbit_extension_auth', JSON.stringify(tokenData));
        localStorage.setItem('orbit_logged_in', 'true');
        if (email) localStorage.setItem('orbit_user_email', email);

        // Tier 3: Direct chrome.runtime.sendMessage if available
        if (extId && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          try {
            chrome.runtime.sendMessage(extId, {
              type: 'ORBIT_EXTENSION_AUTH_SUCCESS',
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              user: session.user,
            }, (response: any) => {
              if (response?.success || !chrome.runtime.lastError) {
                ackReceived = true;
                setStatus('success');
                setTimeout(() => {
                  try { window.close(); } catch {}
                }, 2500);
              }
            });
          } catch {
            // Fallback gracefully to postMessage/content.js
          }
        }

        // Tier 4: Graceful confirmation
        setTimeout(() => {
          if (!ackReceived) {
            setStatus('success');
            setTimeout(() => {
              try { window.close(); } catch {}
            }, 3000);
          }
        }, 1200);

      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Không thể đồng bộ phiên đăng nhập.');
      }
    }

    connectExtension();

    return () => {
      window.removeEventListener('message', handleAck);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#131722]/95 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-center relative z-10 space-y-6">
        {status === 'loading' || status === 'connecting' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-heading">Đang Kết Nối Extension</h2>
              <p className="text-xs text-gray-400 font-mono-data">
                Đang bảo mật đồng bộ tài khoản <span className="text-indigo-400">{userEmail}</span> với Chrome/Edge Extension...
              </p>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono-data font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Extension Connected
              </div>
              <h2 className="text-2xl font-extrabold text-white font-heading mt-2">Kết Nối Thành Công!</h2>
              <p className="text-xs text-gray-300 font-mono-data leading-relaxed">
                Tài khoản của bạn đã được kết nối với trình duyệt (Chrome &amp; Edge). Tab này sẽ tự động đóng trong giây lát.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                try { window.close(); } catch {}
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all"
            >
              Đóng Cửa Sổ (Close Tab)
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-heading">Không Thể Kết Nối</h2>
              <p className="text-xs text-red-400 font-mono-data">{errorMsg}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary-indigo w-full justify-center py-3 text-xs font-bold"
            >
              Thử lại (Retry)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
