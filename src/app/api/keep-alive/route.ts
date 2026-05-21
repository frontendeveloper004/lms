/**
 * GET /api/keep-alive
 *
 * Neon PostgreSQL "scale to zero" muammosini hal qilish uchun.
 * Bu endpoint har 4 daqiqada bir marta chaqirilishi kerak —
 * shunda Neon hech qachon uxlamaydi va cold start bo'lmaydi.
 *
 * Ishlatish usullari:
 * 1. Vercel Cron Job (vercel.json da sozlash)
 * 2. Upstash QStash
 * 3. cron-job.org (bepul)
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Cron secret bilan himoya — tasodifiy chaqiruvlardan saqlash
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Eng yengil query — DB ni uyg'otish uchun yetarli
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "Neon is awake",
    });
  } catch (error) {
    console.error("[keep-alive] DB ping failed:", error);
    return NextResponse.json({ ok: false, error: "DB ping failed" }, { status: 500 });
  }
}
