import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, decryptRefreshToken } from '@/lib/auth';

// ─── Simple in-memory rate limiter (Redis kerak emas) ────────────────────────

interface RateLimitEntry { count: number; resetAt: number; }
const store = new Map<string, RateLimitEntry>();

function checkLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= max) return false; // blocked
  entry.count++;
  return true;
}

function rateLimitResponse() {
  return NextResponse.json(
    { error: "So'rovlar limiti oshib ketdi. Iltimos, keyinroq urinib ko'ring." },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
}

function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
}

// ─── Protected page routes ────────────────────────────────────────────────────

const protectedRoutes = ['/student', '/teacher', '/admin'];

// ─── Main proxy function ──────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── API Rate Limiting ──────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = getIP(request);
    let allowed = true;

    if (pathname.startsWith('/api/auth/')) {
      allowed = checkLimit(`auth:${ip}`, 10, 60_000);
    } else if (pathname.startsWith('/api/upload/') || pathname.startsWith('/api/uploadthing')) {
      allowed = checkLimit(`upload:${ip}`, 20, 60_000);
    } else if (pathname.startsWith('/api/piston')) {
      allowed = checkLimit(`piston:${ip}`, 30, 60_000);
    } else {
      allowed = checkLimit(`api:${ip}`, 100, 60_000);
    }

    if (!allowed) return rateLimitResponse();
    return NextResponse.next();
  }

  // ── Page Auth Guards ───────────────────────────────────────────────────────
  const session = request.cookies.get('session')?.value;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    // Session yo'q — refresh token bor-yo'qligini tekshiramiz
    const refreshCookie = request.cookies.get('refresh_token')?.value;
    if (refreshCookie) {
      const refreshPayload = await decryptRefreshToken(refreshCookie);
      if (refreshPayload) {
        // Refresh token yaroqli — /api/auth/refresh ga yo'naltiramiz
        // U DB'dan tokenVersion tekshirib yangi session cookie beradi
        const refreshUrl = new URL('/api/auth/refresh', request.url);
        refreshUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(refreshUrl);
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const payload = await decrypt(session);
    if (payload?.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
    if (payload?.role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (payload?.role === 'STUDENT') return NextResponse.redirect(new URL('/student', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtectedRoute && session) {
    const payload = await decrypt(session);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ── Onboarding redirect (faqat STUDENT uchun, bir marta) ──────────────
    if (
      payload.role === 'STUDENT' &&
      pathname.startsWith('/student') &&
      pathname !== '/student/onboarding' &&
      !pathname.startsWith('/api/')
    ) {
      // onboardingCompleted ni cookie'dan emas, DB'dan tekshirish kerak
      // Lekin middleware'da DB yo'q — shuning uchun student/page.tsx da tekshiramiz
      // Bu yerda faqat /student/onboarding ga yo'naltirish logikasi sahifada bo'ladi
    }

    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (
      pathname.startsWith('/teacher') &&
      !pathname.startsWith('/teachers') &&
      payload.role !== 'TEACHER' &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (
      pathname.startsWith('/students/') &&
      payload.role !== 'TEACHER' &&
      payload.role !== 'ADMIN' &&
      payload.role !== 'STUDENT'
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API route'lar — rate limiting uchun
    '/api/:path*',
    // Page route'lar — auth guard uchun (static fayllar excluded)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
