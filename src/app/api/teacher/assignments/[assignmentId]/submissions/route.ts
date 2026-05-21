import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ assignmentId: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { assignmentId } = await params;

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

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const parsedSubmissions = submissions.map((s) => ({
      ...s,
      filesCode: s.filesCode ? (() => { try { return JSON.parse(s.filesCode as string); } catch { return null; } })() : null,
    }));

    return NextResponse.json(parsedSubmissions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
