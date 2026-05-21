import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        specialization: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        youtubeUrl: true,
        telegramUrl: true,
        websiteUrl: true,
        subjectType: true,
        englishProfile: {
          select: {
            teachingExperience: true, languages: true, availability: true,
            lessonFormat: true, universityDegree: true, teachingMaterials: true,
            studentResults: true, lessonPrice: true, ieltsScore: true,
            hasTesolTefl: true, hasTrialLesson: true, whatsappUrl: true,
          }
        },
        createdAt: true,
        taughtCourses: {
          where: { status: "APPROVED" },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            level: true,
            price: true,
            xpPoints: true,
            category: { select: { name: true } },
            enrollments: { select: { studentId: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        teacherProjects: {
          orderBy: { orderIdx: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            imageUrl: true,
          },
        },
        teacherCertificates: {
          orderBy: { orderIdx: "asc" },
          select: {
            id: true,
            name: true,
            issuer: true,
            year: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "O'qituvchi topilmadi" }, { status: 404 });
    }

    // Compute stats
    const allStudentIds = user.taughtCourses.flatMap((c) =>
      c.enrollments.map((e) => e.studentId)
    );
    const uniqueStudentCount = new Set(allStudentIds).size;
    const totalEnrollments = allStudentIds.length;

    // Parse skills JSON
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
      specialization: user.specialization ?? null,
      skills: skillsArray,
      linkedinUrl: user.linkedinUrl ?? null,
      githubUrl: user.githubUrl ?? null,
      youtubeUrl: user.youtubeUrl ?? null,
      telegramUrl: user.telegramUrl ?? null,
      websiteUrl: user.websiteUrl ?? null,
      whatsappUrl: user.englishProfile?.whatsappUrl ?? null,
      subjectType: user.subjectType ?? "PROGRAMMING",
      teachingExperience: user.englishProfile?.teachingExperience ?? null,
      languages: user.englishProfile?.languages ?? null,
      availability: user.englishProfile?.availability ?? null,
      lessonFormat: user.englishProfile?.lessonFormat ?? null,
      universityDegree: user.englishProfile?.universityDegree ?? null,
      teachingMaterials: user.englishProfile?.teachingMaterials ?? null,
      studentResults: user.englishProfile?.studentResults ?? null,
      lessonPrice: user.englishProfile?.lessonPrice ?? null,
      ieltsScore: user.englishProfile?.ieltsScore ?? null,
      hasTesolTefl: user.englishProfile?.hasTesolTefl ?? false,
      hasTrialLesson: user.englishProfile?.hasTrialLesson ?? false,
      memberSince: user.createdAt.toISOString(),
      stats: {
        courseCount: user.taughtCourses.length,
        uniqueStudentCount,
        totalEnrollments,
      },
      courses: user.taughtCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        image: c.image ?? null,
        level: c.level,
        price: c.price,
        xpPoints: c.xpPoints,
        category: c.category.name,
        studentCount: c.enrollments.length,
      })),
      projects: user.teacherProjects,
      certificates: user.teacherCertificates,
    });
  } catch (err) {
    console.error("GET /api/teachers/[teacherId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
