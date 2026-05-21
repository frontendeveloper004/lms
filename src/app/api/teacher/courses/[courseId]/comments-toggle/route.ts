import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/teacher/courses/[courseId]/comments-toggle
// Teacher enables or disables comments for their course
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true, commentsEnabled: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (course.teacherId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { commentsEnabled: !course.commentsEnabled },
    select: { commentsEnabled: true },
  });

  return NextResponse.json({ commentsEnabled: updated.commentsEnabled });
}
