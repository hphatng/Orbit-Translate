import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  // Auto-fix URL if user omitted https://
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Ensure valid fallback URL so createBrowserClient never throws an unhandled crash
  const validUrl = url && (url.startsWith('http://') || url.startsWith('https://'))
    ? url
    : 'https://placeholder.supabase.co';

  const validKey = key || 'placeholder-key';

  return createBrowserClient(validUrl, validKey);
}
