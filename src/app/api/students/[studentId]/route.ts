import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { computeStreak } from "@/lib/streak";
import prisma from "@/lib/prisma";

// Public student profile — accessible by TEACHER and ADMIN only
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
    }
    if (session.role !== "TEACHER" && session.role !== "ADMIN" && session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { studentId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        location: true,
        goal: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        telegramUrl: true,
        websiteUrl: true,
        league: true,
        role: true,
        xpPoints: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                image: true,
                level: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          include: {
            course: { select: { id: true, title: true } },
          },
          orderBy: { issuedAt: "desc" },
        },
        completedLessons: { select: { createdAt: true } },
        completedQuizzes: { select: { createdAt: true } },
        claimedBadges: true,
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    // Compute streak
    const allTimestamps = [
      ...user.completedLessons.map((l) => l.createdAt),
      ...user.completedQuizzes.map((q) => q.createdAt),
    ];
    const learningStreak = computeStreak(allTimestamps);

    // XP level
    const xpLevel =
      user.xpPoints >= 5000 ? "Ekspert" :
      user.xpPoints >= 2000 ? "Ilg'or daraja" :
      user.xpPoints >= 500  ? "O'rta daraja" :
                              "Boshlang'ich";

    const completedEnrollments = user.enrollments.filter((e) => e.progress >= 100);
    const activeEnrollments = user.enrollments.filter((e) => e.progress < 100);

    // Parse badges
    const badges: string[] = (() => {
      try {
        const parsed = JSON.parse(user.claimedBadges as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();

    // Parse skills
    const skillsArray: string[] = (() => {
      try {
        const parsed = JSON.parse(user.skills as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();

    return NextResponse.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar ?? null,
      coverPhoto: user.coverPhoto ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      goal: user.goal ?? null,
      skills: skillsArray,
      linkedinUrl: user.linkedinUrl ?? null,
      githubUrl: user.githubUrl ?? null,
      telegramUrl: user.telegramUrl ?? null,
      websiteUrl: user.websiteUrl ?? null,
      xpPoints: user.xpPoints,
      league: user.league,
      xpLevel,
      learningStreak,
      memberSince: user.createdAt.toISOString(),
      badges,
      stats: {
        totalEnrollments: user.enrollments.length,
        completedCourses: completedEnrollments.length,
        activeCourses: activeEnrollments.length,
        certificateCount: user.certificates.length,
        learningStreak,
      },
      activeCourses: activeEnrollments.map((e) => ({
        id: e.courseId,
        title: e.course.title,
        image: e.course.image ?? null,
        level: e.course.level,
        category: e.course.category.name,
        progress: e.progress,
      })),
      completedCourses: completedEnrollments.map((e) => ({
        id: e.courseId,
        title: e.course.title,
        image: e.course.image ?? null,
        level: e.course.level,
        category: e.course.category.name,
        progress: 100,
      })),
      certificates: user.certificates.map((c) => ({
        id: c.id,
        issuedAt: c.issuedAt.toISOString(),
        course: { id: c.course.id, title: c.course.title },
      })),
    });
  } catch (err) {
    console.error("GET /api/students/[studentId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
