import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";
import { validateBody, teacherProfilePatchSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { session, error } = await requireRole("TEACHER");
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
        specialization: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        youtubeUrl: true,
        telegramUrl: true,
        websiteUrl: true,
        xpPoints: true,
        createdAt: true,
        subjectType: true,
        englishProfile: {
          select: {
            teachingExperience: true, languages: true, availability: true,
            lessonFormat: true, universityDegree: true, teachingMaterials: true,
            studentResults: true, lessonPrice: true, ieltsScore: true,
            hasTesolTefl: true, hasTrialLesson: true, whatsappUrl: true,
          }
        }
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const courses = await prisma.course.findMany({
      where: { teacherId: session.userId },
      select: {
        id: true,
        title: true,
        status: true,
        enrollments: { select: { studentId: true } },
      },
    });

    const allStudentIds = courses.flatMap((c) => c.enrollments.map((e) => e.studentId));
    const uniqueStudentCount = new Set(allStudentIds).size;

    const skillsArray: string[] = (() => {
      try {
        const parsed = JSON.parse(user.skills as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
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
      whatsappUrl: user.englishProfile?.whatsappUrl ?? null,
      createdAt: user.createdAt.toISOString(),
      stats: {
        courseCount: courses.length,
        uniqueStudentCount,
      },
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
      })),
    });
  } catch (err) {
    console.error("GET /api/teacher/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, error: authError } = await requireRole("TEACHER");
    if (authError) return authError;

    const { data, error: validationError } = await validateBody(req, teacherProfilePatchSchema);
    if (validationError) return validationError;

    const {
      name, avatar, coverPhoto,
      bio, specialization,
      linkedinUrl, githubUrl, youtubeUrl, telegramUrl, websiteUrl, whatsappUrl,
      skills,
      teachingExperience, languages, availability, lessonFormat,
      universityDegree, teachingMaterials, studentResults,
      lessonPrice, ieltsScore, hasTesolTefl, hasTrialLesson,
    } = data;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subjectType: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(specialization !== undefined && { specialization: specialization || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(youtubeUrl !== undefined && { youtubeUrl: youtubeUrl || null }),
        ...(telegramUrl !== undefined && { telegramUrl: telegramUrl || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
        ...(skills !== undefined && { skills: skills != null ? JSON.stringify(skills) : null }),
        ...(user.subjectType === "ENGLISH" && {
          englishProfile: {
            upsert: {
              create: {
                teachingExperience: teachingExperience || null,
                languages: languages || null,
                availability: availability || null,
                lessonFormat: lessonFormat || null,
                universityDegree: universityDegree || null,
                teachingMaterials: teachingMaterials || null,
                studentResults: studentResults || null,
                lessonPrice: lessonPrice,
                ieltsScore: ieltsScore,
                hasTesolTefl: !!hasTesolTefl,
                hasTrialLesson: !!hasTrialLesson,
                whatsappUrl: whatsappUrl || null,
              },
              update: {
                ...(teachingExperience !== undefined && { teachingExperience: teachingExperience || null }),
                ...(languages !== undefined && { languages: languages || null }),
                ...(availability !== undefined && { availability: availability || null }),
                ...(lessonFormat !== undefined && { lessonFormat: lessonFormat || null }),
                ...(universityDegree !== undefined && { universityDegree: universityDegree || null }),
                ...(teachingMaterials !== undefined && { teachingMaterials: teachingMaterials || null }),
                ...(studentResults !== undefined && { studentResults: studentResults || null }),
                ...(lessonPrice !== undefined && { lessonPrice }),
                ...(ieltsScore !== undefined && { ieltsScore }),
                ...(hasTesolTefl !== undefined && { hasTesolTefl }),
                ...(hasTrialLesson !== undefined && { hasTrialLesson }),
                ...(whatsappUrl !== undefined && { whatsappUrl: whatsappUrl || null }),
              }
            }
          }
        }),
      },
      select: {
        id: true, name: true, avatar: true, coverPhoto: true,
        bio: true, specialization: true, skills: true,
        linkedinUrl: true, githubUrl: true,
        youtubeUrl: true, telegramUrl: true, websiteUrl: true,
        subjectType: true,
        englishProfile: {
          select: {
            teachingExperience: true, languages: true, availability: true,
            lessonFormat: true, universityDegree: true, teachingMaterials: true,
            studentResults: true, lessonPrice: true, ieltsScore: true,
            hasTesolTefl: true, hasTrialLesson: true, whatsappUrl: true,
          }
        },
      },
    });

    const skillsArray: string[] = (() => {
      try {
        const parsed = JSON.parse(updated.skills as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();

    return NextResponse.json({
      success: true,
      id: updated.id,
      name: updated.name,
      avatar: updated.avatar ?? null,
      coverPhoto: updated.coverPhoto ?? null,
      bio: updated.bio ?? null,
      specialization: updated.specialization ?? null,
      skills: skillsArray,
      linkedinUrl: updated.linkedinUrl ?? null,
      githubUrl: updated.githubUrl ?? null,
      youtubeUrl: updated.youtubeUrl ?? null,
      telegramUrl: updated.telegramUrl ?? null,
      websiteUrl: updated.websiteUrl ?? null,
      subjectType: updated.subjectType ?? "PROGRAMMING",
      teachingExperience: updated.englishProfile?.teachingExperience ?? null,
      languages: updated.englishProfile?.languages ?? null,
      availability: updated.englishProfile?.availability ?? null,
      lessonFormat: updated.englishProfile?.lessonFormat ?? null,
      universityDegree: updated.englishProfile?.universityDegree ?? null,
      teachingMaterials: updated.englishProfile?.teachingMaterials ?? null,
      studentResults: updated.englishProfile?.studentResults ?? null,
      lessonPrice: updated.englishProfile?.lessonPrice ?? null,
      ieltsScore: updated.englishProfile?.ieltsScore ?? null,
      hasTesolTefl: updated.englishProfile?.hasTesolTefl ?? false,
      hasTrialLesson: updated.englishProfile?.hasTrialLesson ?? false,
      whatsappUrl: updated.englishProfile?.whatsappUrl ?? null,
    });
  } catch (err) {
    console.error("PATCH /api/teacher/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
