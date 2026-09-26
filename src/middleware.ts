import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always allow public routes, setup wizard, and API endpoints
  const publicRoutes = ['/', '/portal-select', '/employee/login', '/hr/login', '/employee/setup'];
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next({ request });
  }

  // If using placeholder Supabase config, bypass server-side redirection and let client-side AuthContext guard routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (supabaseUrl.includes('placeholder') || !supabaseUrl.startsWith('http')) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated - redirect to appropriate login
  if (!user) {
    if (pathname.startsWith('/hr')) {
      return NextResponse.redirect(new URL('/hr/login', request.url));
    }
    return NextResponse.redirect(new URL('/employee/login', request.url));
  }

  // Get user role from metadata
  const userRole = user.user_metadata?.role as string;

  // HR route protection - only hr_manager or admin
  if (pathname.startsWith('/hr')) {
    if (userRole !== 'hr_manager' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
  }

  // Employee route protection - only employee role
  if (pathname.startsWith('/employee') && !pathname.includes('/login')) {
    if (userRole !== 'employee') {
      return NextResponse.redirect(new URL('/hr/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
