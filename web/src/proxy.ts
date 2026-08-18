import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const isConfigured = 
    envUrl.length > 0 && 
    envUrl !== 'https://placeholder.supabase.co' && 
    !envUrl.includes('your-project');

  // If Supabase is not configured, we ONLY bypass in development for mock mode.
  // In production, missing .env is a CRITICAL security failure, so we NEVER bypass.
  if (!isConfigured) {
    if (process.env.NODE_ENV === 'production') {
      const isProtectedRoute = ['/dashboard', '/study-hub', '/scan-extract', '/documents-translate']
        .some((route) => request.nextUrl.pathname.startsWith(route));
      if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }
    // Development mode bypass
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/study-hub', '/scan-extract', '/documents-translate'];
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // If user is accessing a protected route and is NOT logged in, redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, fonts, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
