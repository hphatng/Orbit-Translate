'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

declare const chrome: any;

export default function ExtensionConnectPage() {
  const [status, setStatus] = useState<'loading' | 'connecting' | 'success' | 'error' | 'no-extension'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const [extensionId, setExtensionId] = useState<string | null>(null);

  useEffect(() => {
    // Extract extensionId from URL
    const params = new URLSearchParams(window.location.search);
    const extId = params.get('extensionId');
    if (extId) setExtensionId(extId);

    async function connectExtension() {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login with return URL and preserve extensionId
        const currentUrl = encodeURIComponent(`/auth/extension-connect${extId ? `?extensionId=${extId}` : ''}`);
        window.location.href = `/login?next=${currentUrl}`;
        return;
      }

      if (!extId) {
        setStatus('no-extension');
        setErrorMsg('Extension ID not provided in URL.');
        return;
      }

      setStatus('connecting');

      try {
        // Use chrome.runtime.sendMessage to send the session back to the extension
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage(extId, {
            type: 'ORBIT_EXTENSION_AUTH_SUCCESS',
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user,
          }, (response: any) => {
             if (chrome.runtime.lastError) {
                setStatus('error');
                setErrorMsg('Could not establish connection with the extension. Ensure it is installed and enabled.');
             } else {
                setStatus('success');
                setTimeout(() => window.close(), 3000);
             }
          });
        } else {
           setStatus('error');
           setErrorMsg('Chrome Extension API is not available on this page.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to connect');
      }
    }
    
    connectExtension();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1E293B] rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
        {status === 'loading' || status === 'connecting' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Connecting to Extension</h2>
              <p className="text-sm text-gray-400">Please wait while we securely connect your account...</p>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Connected Successfully!</h2>
              <p className="text-sm text-gray-400">You can now safely close this tab and return to the extension.</p>
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Connection Failed</h2>
              <p className="text-sm text-red-400">{errorMsg}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Extension Not Found</h2>
              <p className="text-sm text-gray-400">Please install the Orbit Translate extension first.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
