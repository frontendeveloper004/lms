import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import { computeStreak } from "@/lib/streak";
import prisma from "@/lib/prisma";
import { validateBody, studentProfilePatchSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { session, error } = await requireRole("STUDENT");
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
        createdAt: true,
        _count: {
          select: { enrollments: true, certificates: true },
        },
        completedLessons: { select: { createdAt: true } },
        completedQuizzes: { select: { createdAt: true } },
        enrollments: {
          include: {
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

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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

    return NextResponse.json({
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
        learningStreak,
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
    });
  } catch (err) {
    console.error("GET /api/student/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, error: authError } = await requireRole("STUDENT");
    if (authError) return authError;

    const { data, error: validationError } = await validateBody(req, studentProfilePatchSchema);
    if (validationError) return validationError;

    const { name, bio, location, goal, skills, linkedinUrl, githubUrl, telegramUrl, websiteUrl, coverPhoto } = data;

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(coverPhoto !== undefined && { coverPhoto: coverPhoto || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(location !== undefined && { location: location || null }),
        ...(goal !== undefined && { goal: goal || null }),
        ...(skills !== undefined && { skills: skills != null ? JSON.stringify(skills) : null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(telegramUrl !== undefined && { telegramUrl: telegramUrl || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
      },
      select: {
        id: true, name: true, avatar: true, bio: true,
        location: true, goal: true, skills: true,
        linkedinUrl: true, githubUrl: true, telegramUrl: true, websiteUrl: true,
      },
    });

    const skillsArray: string[] = (() => {
      try {
        const parsed = JSON.parse(updated.skills as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();

    return NextResponse.json({ success: true, ...updated, skills: skillsArray });
  } catch (err) {
    console.error("PATCH /api/student/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
