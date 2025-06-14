import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin'];
  const adminRoutes = ['/admin'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // For frontend-only middleware, we'll just check if token exists
      // The actual validation will be done by the backend API
      
      // For admin routes, we need to decode the token to check role
      // Since we can't use jsonwebtoken in edge runtime, we'll do a simple check
      if (isAdminRoute) {
        // This is a simplified check - the backend will do proper validation
        // In a real scenario, you might want to make an API call to validate
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};