import { NextResponse } from 'next/server';
import { encrypt, encryptRefreshToken, SessionPayload } from '@/lib/auth';

const IS_PROD = process.env.NODE_ENV === 'production';

// Access token: 15 daqiqa
const ACCESS_MAX_AGE = 60 * 60 * 24; // 24 soat
// Refresh token: 30 kun
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Login / register'dan keyin ikki cookie o'rnatadi:
 *   session       — access token (15 daqiqa, httpOnly)
 *   refresh_token — refresh token (30 kun, httpOnly)
 */
export async function setAuthCookies(
  response: NextResponse,
  payload: SessionPayload,
  tokenVersion: number
): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    encrypt(payload),
    encryptRefreshToken({ userId: payload.userId, version: tokenVersion }),
  ]);

  response.cookies.set('session', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: ACCESS_MAX_AGE,
    path: '/',
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE,
    path: '/',
  });
}

/**
 * Logout — ikki cookie ham o'chiriladi.
 */
export function clearAuthCookies(response: NextResponse): void {
  // Option 1: Using delete() helper
  response.cookies.delete('session');
  response.cookies.delete('refresh_token');

  // Option 2: Explicitly setting with maxAge: 0 and expires for extra safety
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}
