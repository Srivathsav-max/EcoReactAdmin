import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup'];
const authRoutes = ['/signin', '/signup'];
const apiAuthRoutes = ['/api/auth/signin', '/api/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host')!;

  // Check if it's the default admin domain
  const isAdminDomain = hostname === process.env.ADMIN_DOMAIN ||
                       hostname === 'localhost:3000' ||
                       hostname === '127.0.0.1:3000' ||
                       hostname === 'admin.lvh.me:3000' ||
                       hostname.startsWith('admin.');

  // Exclude static files and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Handle admin domain requests
  if (isAdminDomain) {
    // Allow access to auth pages
    if (authRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Check auth for admin routes
    const token = request.cookies.get('token')?.value;
    if (!token && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
  }
// Handle store domain requests
try {
  // Get store domain from hostname
  let storeDomain;
  
  if (hostname.includes('lvh.me:3000')) {
    // Handle local development domain
    const subdomain = hostname.split('.lvh.me:3000')[0];
    if (!subdomain || subdomain === 'admin') {
      return NextResponse.redirect(new URL('http://admin.lvh.me:3000', request.url));
    }
    storeDomain = subdomain;
  } else if (hostname.includes('vercel.app')) {
    // Handle Vercel preview deployments
    const subdomain = hostname.split('-')[0];
    if (!subdomain || subdomain === 'admin') {
      return NextResponse.redirect(new URL(process.env.ADMIN_DOMAIN!, request.url));
    }
    storeDomain = subdomain;
  } else {
    // Handle production domain
    const parts = hostname.split('.');
    if (parts.length < 2) {
      return NextResponse.redirect(new URL(process.env.ADMIN_DOMAIN!, request.url));
    }
    
    const subdomain = parts[0];
    if (!subdomain || subdomain === 'admin') {
      return NextResponse.redirect(new URL(process.env.ADMIN_DOMAIN!, request.url));
    }
    storeDomain = subdomain;
  }
    }

    // Allow access to store auth routes
    if (pathname.includes('/signin') || pathname.includes('/signup')) {
      return NextResponse.next();
    }

    // For protected store routes, verify customer auth
    if (!pathname.startsWith('/api')) {
      const customerToken = request.cookies.get('customer_token')?.value;
      if (!customerToken) {
        return NextResponse.redirect(new URL(`/store/${storeDomain}/signin`, request.url));
      }
    }

    // Rewrite store paths
    if (!pathname.startsWith('/store')) {
      return NextResponse.rewrite(new URL(`/store/${storeDomain}${pathname}`, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware Error]', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, /sitemap.xml (public files)
     */
    '/((?!_next|static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
}
