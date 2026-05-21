/**
 * Server-side data fetching functions for student pages.
 * To'g'ridan-to'g'ri Prisma orqali DB dan ma'lumot oladi —
 * HTTP fetch() yo'q, network round-trip yo'q, Neon cold start yo'q.
 */

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { computeStreak } from "@/lib/streak";
import { redirect } from "next/navigation";
import { getStudentChallenges, seedWeeklyChallenges } from "../challenges";

// ── Auth helper ───────────────────────────────────────────────────────────────
export async function requireStudentSession() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
  return session;
}

// ── Dashboard: enrollments + xp ───────────────────────────────────────────────
export async function getStudentDashboardData(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: {
      id: true,
      progress: true,
      courseId: true,
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          category: { select: { name: true } },
          teacher: { select: { id: true, name: true, avatar: true } },
        },
      },
      student: {
        select: {
          certificates: {
            select: { id: true, courseId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const [user, challenges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { 
        xpPoints: true,
        seasonalXp: true,
        league: true,
        streak: true,
        pointsToNextLeague: true
      },
    }),
    (async () => {
      await seedWeeklyChallenges();
      return getStudentChallenges(studentId);
    })()
  ]);

  return { 
    enrollments, 
    xp: user?.xpPoints ?? 0,
    seasonalXp: user?.seasonalXp ?? 0,
    league: user?.league ?? "BRONZA",
    streak: user?.streak ?? 0,
    pointsToNextLeague: user?.pointsToNextLeague ?? 500,
    challenges: challenges || []
  };
}

// ── Achievements ──────────────────────────────────────────────────────────────
export async function getStudentAchievementsData(studentId: string) {
  const [achievementsData, certificates] = await Promise.all([
    // Bitta query bilan hamma narsa
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        xpPoints: true,
        claimedBadges: true,
        enrollments: { select: { progress: true } },
        _count: { select: { completedLessons: true } },
      },
    }),
    prisma.certificate.findMany({
      where: { userId: studentId },
      select: {
        id: true,
        issuedAt: true,
        course: { select: { title: true, certificateImage: true } },
      },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  if (!achievementsData) return null;

  const completedLessonsCount = achievementsData._count.completedLessons;
  const enrollments = achievementsData.enrollments;
  const completedCourses = enrollments.filter((e) => e.progress >= 100).length;
  const claimedBadgesArr: string[] = (() => {
    try {
      const parsed = JSON.parse(achievementsData.claimedBadges as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();
  const totalXp = achievementsData.xpPoints || 0;

  const allBadges = [
    { id: "newbie", name: "Boshlanish", icon: "sprout", description: "Birinchi kursga yozildingiz", unlocked: enrollments.length > 0, rewardXp: 150 },
    { id: "first_lesson", name: "Ilk qadam", icon: "star", description: "Birinchi darsni yakunladi", unlocked: completedLessonsCount >= 1, rewardXp: 100 },
    { id: "collector", name: "Kolleksioner", icon: "zap", description: "3 ta kursga yozildingiz", unlocked: enrollments.length >= 3, rewardXp: 200 },
    { id: "learner_10", name: "O'quvchi", icon: "book", description: "10 ta darsni yakunladi", unlocked: completedLessonsCount >= 10, rewardXp: 300 },
    { id: "scholar", name: "Bilimdon", icon: "target", description: "Birinchi kursni tugatdingiz", unlocked: completedCourses > 0, rewardXp: 500 },
    { id: "researcher_50", name: "Tadqiqotchi", icon: "flame", description: "50 ta darsni yakunladi", unlocked: completedLessonsCount >= 50, rewardXp: 1000 },
    { id: "expert", name: "Ekspert", icon: "trophy", description: "2000+ XP to'pladingiz", unlocked: totalXp >= 2000, rewardXp: 1500 },
    { id: "master", name: "Master", icon: "crown", description: "5000+ XP to'pladingiz", unlocked: totalXp >= 5000, rewardXp: 2500 },
  ];

  return {
    xp: totalXp,
    level: Math.floor(totalXp / 100) + 1,
    badges: allBadges.map((b) => ({ ...b, claimed: claimedBadgesArr.includes(b.id) })),
    totalCourses: enrollments.length,
    completedCourses,
    certificates,
  };
}

// ── Settings / Profile ────────────────────────────────────────────────────────
export async function getStudentProfileData(studentId: string) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
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
      xpPoints: true,
      seasonalXp: true,
      league: true,
      streak: true,
      pointsToNextLeague: true,
      createdAt: true,
      _count: { select: { enrollments: true, certificates: true } },
      completedLessons: { select: { createdAt: true } },
      completedQuizzes: { select: { createdAt: true } },
      enrollments: {
        select: {
          courseId: true,
          progress: true,
          course: {
            select: {
              id: true, title: true, image: true, level: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      certificates: {
        orderBy: { issuedAt: "desc" },
        take: 5,
        select: {
          id: true,
          issuedAt: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!user) return null;

  const allTimestamps = [
    ...user.completedLessons.map((l) => l.createdAt),
    ...user.completedQuizzes.map((q) => q.createdAt),
  ];
  const learningStreak = computeStreak(allTimestamps);
  const skillsArray: string[] = (() => {
    try {
      const parsed = JSON.parse(user.skills as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();
  const completedEnrollments = user.enrollments.filter((e) => e.progress >= 100);
  const activeEnrollments = user.enrollments.filter((e) => e.progress < 100);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
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
    createdAt: user.createdAt.toISOString(),
    stats: {
      enrollmentCount: user._count.enrollments,
      certificateCount: user._count.certificates,
      learningStreak: user.streak, // Use the persistent streak
      seasonalXp: user.seasonalXp,
      league: user.league,
      pointsToNextLeague: user.pointsToNextLeague,
      completedCount: completedEnrollments.length,
      activeCount: activeEnrollments.length,
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
    })),
    recentCertificates: user.certificates.map((c) => ({
      id: c.id,
      issuedAt: c.issuedAt.toISOString(),
      course: { title: c.course.title },
    })),
  };
}

// ── Ranking: Global & Seasonal ───────────────────────────────────────────────
export async function getRankingData(studentId: string) {
  const [globalTop, seasonalTop, weeklyTop, currentUser] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { xpPoints: "desc" },
      take: 10,
      select: { id: true, name: true, avatar: true, xpPoints: true, league: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { seasonalXp: "desc" },
      take: 10,
      select: { id: true, name: true, avatar: true, seasonalXp: true, league: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { weeklyXp: "desc" },
      take: 10,
      select: { id: true, name: true, avatar: true, weeklyXp: true, league: true },
    }),
    prisma.user.findUnique({
      where: { id: studentId },
      select: { xpPoints: true, seasonalXp: true, weeklyXp: true, name: true, league: true },
    }),
  ]);

  const aiPerformanceTop: any[] = [];

  // Calculate current user's ranks (approximate using count)
  const [globalRank, seasonalRank, weeklyRank] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        xpPoints: { gt: currentUser?.xpPoints ?? 0 },
      },
    }),
    prisma.user.count({
      where: {
        role: "STUDENT",
        seasonalXp: { gt: currentUser?.seasonalXp ?? 0 },
      },
    }),
    prisma.user.count({
      where: {
        role: "STUDENT",
        weeklyXp: { gt: currentUser?.weeklyXp ?? 0 },
      },
    }),
  ]);

  return {
    globalTop,
    seasonalTop,
    weeklyTop,
    aiPerformanceTop,
    myStats: {
      ...currentUser,
      globalRank: globalRank + 1,
      seasonalRank: seasonalRank + 1,
      weeklyRank: weeklyRank + 1,
    },
  };
}
