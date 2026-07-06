import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard', '/suppliers', '/risk-monitoring', '/ai-recommendations',
  '/global-map', '/analytics', '/settings', '/notifications', '/admin', '/profile',
];

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('accessToken')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/suppliers/:path*', '/risk-monitoring/:path*', '/ai-recommendations/:path*',
    '/global-map/:path*', '/analytics/:path*', '/settings/:path*', '/notifications/:path*',
    '/admin/:path*', '/profile/:path*',
  ],
};
