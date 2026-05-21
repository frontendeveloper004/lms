import { NextRequest, NextResponse } from 'next/server';
import { decryptRefreshToken, encrypt } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/cookies';
import prisma from '@/lib/prisma';

const IS_PROD = process.env.NODE_ENV === 'production';
const ACCESS_MAX_AGE = 60 * 60 * 24; // 24 soat

/**
 * GET /api/auth/refresh
 *
 * Middleware tomonidan chaqiriladi — refresh_token cookie'ni tekshirib,
 * yangi session (access token) cookie o'rnatadi va redirect qiladi.
 *
 * Xavfsizlik:
 *  - refresh_token imzosi tekshiriladi (jose)
 *  - DB'dagi tokenVersion bilan solishtiriladi (revoke mexanizmi)
 *  - Agar token revoke qilingan bo'lsa — ikki cookie ham o'chiriladi
 */
export async function GET(req: NextRequest) {
  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? '/';
  const refreshCookie = req.cookies.get('refresh_token')?.value;

  // Refresh token yo'q — login ga
  if (!refreshCookie) {
    return redirectToLogin(req, redirectTo);
  }

  const payload = await decryptRefreshToken(refreshCookie);

  // Token imzosi noto'g'ri yoki muddati tugagan
  if (!payload) {
    const res = redirectToLogin(req, redirectTo);
    clearAuthCookies(res);
    return res;
  }

  // DB dan foydalanuvchini olish — tokenVersion va role kerak
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, tokenVersion: true },
  });

  // Foydalanuvchi o'chirilgan yoki tokenVersion mos kelmaydi (revoke)
  if (!user || user.tokenVersion !== payload.version) {
    const res = redirectToLogin(req, redirectTo);
    clearAuthCookies(res);
    return res;
  }

  // Yangi access token yaratish
  const newAccessToken = await encrypt({ userId: user.id, role: user.role });

  // Redirect — asl manzilga
  const destination = new URL(redirectTo.startsWith('/') ? redirectTo : '/', req.url);
  const response = NextResponse.redirect(destination);

  response.cookies.set('session', newAccessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: ACCESS_MAX_AGE,
    path: '/',
  });

  return response;
}

function redirectToLogin(req: NextRequest, from: string): NextResponse {
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('from', from);
  return NextResponse.redirect(loginUrl);
}
