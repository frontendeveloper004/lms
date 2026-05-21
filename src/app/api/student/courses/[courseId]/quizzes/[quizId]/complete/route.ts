import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { checkCourseCompletion } from "@/lib/course-completion";
import { awardRankingXp } from "@/lib/ranking-system";
import { trackActivity } from "@/lib/challenges";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ro'yxatdan o'ting" }, { status: 401 });
    }

    const { courseId, quizId } = await params;
    const { score } = await req.json();

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Siz kursga a'zo emassiz" }, { status: 403 });
    }

    // Save completed quiz (upsert — retake allowed)
    await prisma.completedQuiz.upsert({
      where: { userId_quizId: { userId: session.userId, quizId } },
      update: { score },
      create: { userId: session.userId, quizId, score },
    });

    // Award XP using centralized ranking logic
    await awardRankingXp(session.userId, 20);

    // Track activity for weekly challenges
    await trackActivity(session.userId, "QUIZZES", 1);
    await trackActivity(session.userId, "XP", 20);

    // Check if course is fully completed & update progress
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
