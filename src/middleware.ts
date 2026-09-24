import { NextResponse, type NextRequest } from 'next/server';
import { getDisabledFeaturePaths } from '@/config/features';

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  const disabledPaths = getDisabledFeaturePaths();
  if (disabledPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  const isLoggedIn = Boolean(request.cookies.get('access_token')?.value);
  const protectedRoutes = ['/', '/scan', '/manualAddData', '/history', '/profile', '/settings', '/welcome'];
  const isProtectedRoute = protectedRoutes.some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(path))
  );
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (!isLoggedIn && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
