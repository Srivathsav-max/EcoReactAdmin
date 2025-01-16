import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add auth routes that should be public
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forget-password',
  '/verify-otp',
  '/reset-password'
];

// Add API routes that should be public
const publicApiRoutes = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/forget-password',
  '/api/auth/reset-password'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.includes(pathname) || 
      publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('token');

  // Redirect to login if no token and trying to access protected route
  if (!token) {
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
