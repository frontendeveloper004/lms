import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { checkCourseCompletion } from "@/lib/course-completion";
import { awardRankingXp } from "@/lib/ranking-system";
import { trackActivity } from "@/lib/challenges";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ro'yxatdan o'ting" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;

    // ── Enrollment tekshiruvi + lesson upsert + XP increment — parallel ──────
    // Eski yondashuv: 5 ta ketma-ket query
    // Yangi yondashuv: enrollment tekshiruvi, keyin qolganlarini parallel

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.userId,
          courseId,
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Siz kursga a'zo emassiz" }, { status: 403 });
    }

    // Lesson'ni complete qilish + XP berish — parallel
    // Complete the lesson
    await prisma.completedLesson.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        lessonId,
      },
    });

    // Award XP
    const rankingResult = await awardRankingXp(session.userId, 10);

    // Track activity for weekly challenges
    await trackActivity(session.userId, "LESSONS", 1);
    await trackActivity(session.userId, "XP", 10);

    // ── Progress & Completion — centralized ────────────────────────────────
    const { progress: progressPercent, isComplete: courseCompleted, certificateId } =
      await checkCourseCompletion(session.userId, courseId);

    return NextResponse.json({
      success: true,
      progress: progressPercent,
      courseCompleted,
      certificateId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
