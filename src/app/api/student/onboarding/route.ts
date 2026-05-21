import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { z } from "zod";
import { QUESTIONS } from "@/lib/onboarding-questions";

// ── Validation ────────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  // 10 ta savolga berilgan javoblar (0 | 1 | 2 — variant indeksi)
  answers: z.array(z.number().int().min(0).max(2)).length(10),
  skipped: z.boolean().optional().default(false),
});

// ── GET: onboarding holati ────────────────────────────────────────────────────

export async function GET() {
  const { session, error } = await requireRole("STUDENT");
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: { onboardingCompleted: true },
  });

  return NextResponse.json({ onboardingCompleted: user?.onboardingCompleted ?? false });
}

// ── POST: javoblarni saqlash + AI tahlil ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole("STUDENT");
  if (error) return error;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { answers, skipped } = parsed.data;

  // Onboarding bir marta — completed deb belgilaymiz
  await prisma.user.update({
    where: { id: session!.userId },
    data: { onboardingCompleted: true },
  });

  if (skipped) {
    return NextResponse.json({ success: true, skipped: true, track: null, courses: [] });
  }

  // ── Mavjud kurslar ────────────────────────────────────────────────────────
  const courses = await prisma.course.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      title: true,
      description: true,
      level: true,
      price: true,
      xpPoints: true,
      image: true,
      category: { select: { name: true } },
      teacher: { select: { name: true, avatar: true } },
    },
    take: 60,
    orderBy: { createdAt: "desc" },
  });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, track: null, courses: [], personalMessage: "" });
  }

  // ── AI tahlil ─────────────────────────────────────────────────────────────
  try {
    const groq = new Groq({ apiKey });

    // Savollar va javoblarni matn ko'rinishida tayyorlaymiz
    const answersText = QUESTIONS.map((q, i) => {
      const chosen = q.options[answers[i]];
      return `${i + 1}. ${q.text}\n   Javob: "${chosen.label}" — ${chosen.value}`;
    }).join("\n\n");

    const coursesJson = JSON.stringify(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description.slice(0, 120),
        level: c.level,
        category: c.category.name,
      }))
    );

    const prompt = `Siz IT ta'lim bo'yicha ekspert psixolog va karyera maslahatchiisiz.

Quyida bir talabaning 10 ta psixologik savolga bergan javoblari keltirilgan.
Ushbu javoblar asosida:
1. Talabaga AYNAN QAYSI dasturlash yo'nalishi mos ekanligini aniqlang
2. Nega aynan shu yo'nalish mos ekanligini O'ZBEK TILIDA tushuntiring
3. Mavjud kurslardan unga mos PRIMARY (1-3 ta) va SECONDARY (2-4 ta) kurslarni tanlang
4. Talabaga shaxsiy motivatsion xabar yozing

## Talaba javoblari:
${answersText}

## Mavjud kurslar:
${coursesJson.length > 100 ? coursesJson : "Hozircha kurslar yo'q"}

## IT yo'nalishlari (birini tanlang):
- WEB_DEV: Frontend/Backend/Fullstack web dasturlash
- MOBILE_DEV: Android/iOS/Flutter mobil ilovalar
- GAME_DEV: O'yin yaratish (Unity, Unreal)
- CYBER_SECURITY: Kiberxavfsizlik, ethical hacking
- AI_ML: Sun'iy intellekt, machine learning, data science
- BACKEND: Server, API, database, DevOps
- UI_UX: Dizayn, foydalanuvchi tajribasi

Faqat quyidagi JSON formatda javob bering:
{
  "track": {
    "id": "WEB_DEV",
    "name": "Web Dasturlash",
    "emoji": "🌐",
    "description": "Nima uchun bu yo'nalish sizga mos (2-3 jumla, O'zbek tilida)",
    "strengths": ["Kuchli tomoningiz 1", "Kuchli tomoningiz 2", "Kuchli tomoningiz 3"]
  },
  "primary": [{ "courseId": "...", "reason": "..." }],
  "secondary": [{ "courseId": "...", "reason": "..." }],
  "personalMessage": "Shaxsiy motivatsion xabar (O'zbek tilida, 2-3 jumla)"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let ai: {
      track: { id: string; name: string; emoji: string; description: string; strengths: string[] } | null;
      primary: { courseId: string; reason: string }[];
      secondary: { courseId: string; reason: string }[];
      personalMessage: string;
    };

    try { ai = JSON.parse(raw); } catch {
      ai = { track: null, primary: [], secondary: [], personalMessage: "" };
    }

    // Course ID validate
    const validIds = new Set(courses.map((c) => c.id));
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const primaryCourses = (ai.primary ?? [])
      .filter((r) => validIds.has(r.courseId))
      .slice(0, 3)
      .map((r) => ({ ...courseMap.get(r.courseId)!, reason: r.reason, type: "primary" as const }));

    // Secondary faqat primary 3 tadan kam bo'lsa to'ldirish uchun
    const remaining = 3 - primaryCourses.length;
    const secondaryCourses = remaining > 0
      ? (ai.secondary ?? [])
          .filter((r) => validIds.has(r.courseId))
          .slice(0, remaining)
          .map((r) => ({ ...courseMap.get(r.courseId)!, reason: r.reason, type: "secondary" as const }))
      : [];

    return NextResponse.json({
      success: true,
      track: ai.track ?? null,
      courses: [...primaryCourses, ...secondaryCourses],
      personalMessage: ai.personalMessage ?? "",
    });
  } catch (err) {
    console.error("AI onboarding error:", err);
    return NextResponse.json({ success: true, track: null, courses: [], personalMessage: "" });
  }
}
