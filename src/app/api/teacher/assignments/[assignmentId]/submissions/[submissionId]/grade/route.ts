import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { createNotificationForGrading } from "@/lib/notification-triggers";
import { checkCourseCompletion } from "@/lib/course-completion";
import { awardRankingXp } from "@/lib/ranking-system";
import { trackActivity } from "@/lib/challenges";

type Params = { params: Promise<{ assignmentId: string; submissionId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { assignmentId, submissionId } = await params;

    // Verify the assignment exists and the teacher owns the course
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });
    }

    if (assignment.module.course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.assignmentId !== assignmentId) {
      return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });
    }

    const { score, feedback, xpBonus } = await req.json();

    // Validate score
    if (score === undefined || score === null || typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json({ error: "Ball 0 dan 100 gacha bo'lishi kerak" }, { status: 400 });
    }

    // Validate feedback
    if (!feedback || !String(feedback).trim()) {
      return NextResponse.json({ error: "Fikr-mulohaza kiritilishi shart" }, { status: 400 });
    }

    // Validate xpBonus
    if (xpBonus === undefined || xpBonus === null || typeof xpBonus !== "number" || xpBonus < 100 || xpBonus > 1000) {
      return NextResponse.json({ error: "XP bonus 100 dan 1000 gacha bo'lishi kerak" }, { status: 400 });
    }

    // XP farqini hisoblash (agar AI allaqachon XP bergan bo'lsa)
    const previousXpBonus = submission.xpBonus ?? 0;
    const xpDiff = Math.round(xpBonus) - previousXpBonus;

    // Update submission and adjust student XP atomically
    // Note: awardRankingXp handles both xpPoints and seasonalXp
    const [updatedSubmission] = await prisma.$transaction([
      prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: Math.round(score),
          feedback: String(feedback).trim(),
          xpBonus: Math.round(xpBonus),
          status: "GRADED",
          gradedBy: "TEACHER", // Teacher override
          gradedAt: new Date(),
        },
      }),
    ]);

    // Use centralized ranking system for XP and league management
    await awardRankingXp(submission.studentId, xpDiff);

    // Track activity for weekly challenges
    if (xpDiff > 0) {
      await trackActivity(submission.studentId, "XP", xpDiff);
    }

    // Update progress & check for certificate after grading
    await checkCourseCompletion(submission.studentId, assignment.module.course.id);

    // Fire-and-forget: do NOT await, do NOT block the response
    createNotificationForGrading(
      submissionId,
      submission.studentId,
      session.userId as string,
      assignment.module.course.id
    ).catch((err) => console.error('[Grade] Notification trigger failed:', err));

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
