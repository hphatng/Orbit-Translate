import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  const validUrl = url && (url.startsWith('http://') || url.startsWith('https://'))
    ? url
    : 'https://placeholder.supabase.co';

  const validKey = key || 'placeholder-key';

  return createServerClient(validUrl, validKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component
        }
      },
    },
  });
}
