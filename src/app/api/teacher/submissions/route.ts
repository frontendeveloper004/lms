import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status"); // "PENDING" | "GRADED" | null (all)

    // Get all courses owned by this teacher
    const teacherCourses = await prisma.course.findMany({
      where: session.role === "ADMIN" ? {} : { teacherId: session.userId },
      select: { id: true, title: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);
    const filteredCourseIds = courseId ? [courseId] : courseIds;

    // Get all assignments in those courses with their submissions
    const assignments = await prisma.assignment.findMany({
      where: {
        module: {
          courseId: { in: filteredCourseIds },
        },
      },
      include: {
        module: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        submissions: {
          where: status ? { status } : {},
          include: {
            student: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    // Flatten into a list of submissions with context
    const result = assignments.flatMap((assignment) =>
      assignment.submissions.map((sub) => ({
        submissionId: sub.id,
        status: sub.status,
        score: sub.score,
        feedback: sub.feedback,
        xpBonus: sub.xpBonus,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt,
        gradedBy: (sub as any).gradedBy ?? "PENDING",
        aiScore: (sub as any).aiScore ?? null,
        aiFeedback: (sub as any).aiFeedback ?? null,
        aiGradedAt: (sub as any).aiGradedAt ?? null,
        aiConfidence: (sub as any).aiConfidence ?? null,
        student: sub.student,
        assignment: {
          id: assignment.id,
          title: assignment.title,
        },
        module: {
          id: assignment.module.id,
          title: assignment.module.title,
        },
        course: {
          id: assignment.module.course.id,
          title: assignment.module.course.title,
        },
      }))
    );

    // Sort: PENDING first, then by submittedAt desc
    result.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return NextResponse.json({ submissions: result, courses: teacherCourses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
