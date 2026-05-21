import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { clearAuthCookies } from '@/lib/cookies';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/logout-all
 *
 * Barcha qurilmalardan chiqish:
 *  - tokenVersion increment qilinadi → barcha mavjud refresh token'lar bekor bo'ladi
 *  - Joriy qurilmaning cookie'lari ham o'chiriladi
 */
export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Avtorizatsiya talab etiladi' }, { status: 401 });
  }

  // tokenVersion ni oshirish — barcha eski refresh token'lar bekor bo'ladi
  await prisma.user.update({
    where: { id: session.userId },
    data: { tokenVersion: { increment: 1 } },
  });

  const response = NextResponse.json(
    { message: "Barcha qurilmalardan chiqildi" },
    { status: 200 }
  );

  clearAuthCookies(response);
  return response;
}
