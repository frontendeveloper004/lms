import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ courseId: string; assignmentId: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, assignmentId } = await params;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Siz kursga a'zo emassiz" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          select: {
            course: {
              select: { 
                id: true, 
                title: true,
                teacher: { select: { subjectType: true } }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });
    }

    // Get student's submission if any
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId: session.userId },
      },
      select: {
        id: true,
        htmlCode: true,
        cssCode: true,
        jsCode: true,
        filesCode: true,
        status: true,
        score: true,
        feedback: true,
        xpBonus: true,
        submittedAt: true,
        gradedAt: true,
        gradedBy: true,
        aiScore: true,
        aiFeedback: true,
        aiConfidence: true,
      },
    });

    return NextResponse.json({
      assignment: {
        ...assignment,
        starterCode: assignment.starterCode ? (() => { try { return JSON.parse(assignment.starterCode as string); } catch { return assignment.starterCode; } })() : null,
      },
      submission: submission ? {
        ...submission,
        filesCode: submission.filesCode ? (() => { try { return JSON.parse(submission.filesCode as string); } catch { return null; } })() : null,
      } : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
