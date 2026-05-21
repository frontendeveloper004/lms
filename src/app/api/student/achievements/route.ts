import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Eski yondashuv: 3 ta alohida query ───────────────────────────────────
    // 1. user.findUnique (xpPoints, claimedBadges)
    // 2. enrollment.findMany (progress)
    // 3. completedLesson.count
    //
    // ── Yangi yondashuv: bitta query bilan hamma narsa ───────────────────────
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        xpPoints: true,
        claimedBadges: true,
        enrollments: {
          select: { progress: true },
        },
        _count: {
          select: { completedLessons: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    const completedLessonsCount = user._count.completedLessons;
    const enrollments = user.enrollments;
    const completedCourses = enrollments.filter((e) => e.progress >= 100).length;

    let claimedBadgesArr: string[] = [];
    try {
      const parsed = JSON.parse(user.claimedBadges as string);
      claimedBadgesArr = Array.isArray(parsed) ? parsed : [];
    } catch { claimedBadgesArr = []; }

    const totalXp = user.xpPoints || 0;

    const allBadges = [
      {
        id: "newbie",
        name: "Boshlanish",
        icon: "sprout",
        description: "Birinchi kursga yozildingiz",
        unlocked: enrollments.length > 0,
        rewardXp: 150,
      },
      {
        id: "first_lesson",
        name: "Ilk qadam",
        icon: "star",
        description: "Birinchi darsni yakunladi",
        unlocked: completedLessonsCount >= 1,
        rewardXp: 100,
      },
      {
        id: "collector",
        name: "Kolleksioner",
        icon: "zap",
        description: "3 ta kursga yozildingiz",
        unlocked: enrollments.length >= 3,
        rewardXp: 200,
      },
      {
        id: "learner_10",
        name: "O'quvchi",
        icon: "book",
        description: "10 ta darsni yakunladi",
        unlocked: completedLessonsCount >= 10,
        rewardXp: 300,
      },
      {
        id: "scholar",
        name: "Bilimdon",
        icon: "target",
        description: "Birinchi kursni tugatdingiz",
        unlocked: completedCourses > 0,
        rewardXp: 500,
      },
      {
        id: "researcher_50",
        name: "Tadqiqotchi",
        icon: "flame",
        description: "50 ta darsni yakunladi",
        unlocked: completedLessonsCount >= 50,
        rewardXp: 1000,
      },
      {
        id: "expert",
        name: "Ekspert",
        icon: "trophy",
        description: "2000+ XP to'pladingiz",
        unlocked: totalXp >= 2000,
        rewardXp: 1500,
      },
      {
        id: "master",
        name: "Master",
        icon: "crown",
        description: "5000+ XP to'pladingiz",
        unlocked: totalXp >= 5000,
        rewardXp: 2500,
      },
    ];

    const badges = allBadges.map((b) => ({
      ...b,
      claimed: claimedBadgesArr.includes(b.id),
    }));

    return NextResponse.json({
      xp: totalXp,
      level: Math.floor(totalXp / 100) + 1,
      badges,
      totalCourses: enrollments.length,
      completedCourses,
    });
  } catch (error) {
    console.error("Achievements error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
