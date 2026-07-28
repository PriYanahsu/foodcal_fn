import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    'https://comgkdwwfewrzhccmtud.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbWdrZHd3ZmV3cnpoY2NtdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTQwMzAsImV4cCI6MjA4NDE3MDAzMH0.mMESXf-OX2V-Xx3Sp7dhkw4ZYk_GelZdi6A8BlCaNuk',
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

  // Refresh session — keep cookies in sync for SSR / PKCE
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Let the OAuth callback route exchange the code without interference
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse;
  }

  const protectedRoutes = ['/', '/scan', '/manualAddData', '/history', '/profile'];
  const isProtectedRoute = protectedRoutes.some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(path))
  );

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
