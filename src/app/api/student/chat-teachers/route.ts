import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET /api/student/chat-teachers — teachers of courses the student is enrolled in + online status
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      course: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              avatar: true,
              specialization: true,
              onlineStatus: { select: { isOnline: true, lastSeen: true } },
            },
          },
        },
      },
    },
  });

  // Deduplicate by teacher id
  const teacherMap = new Map<string, {
    id: string;
    name: string;
    avatar: string | null;
    specialization: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
  }>();

  enrollments.forEach((enr) => {
    const t = enr.course.teacher;
    if (!teacherMap.has(t.id)) {
      teacherMap.set(t.id, {
        id: t.id,
        name: t.name,
        avatar: t.avatar ?? null,
        specialization: t.specialization ?? null,
        isOnline: t.onlineStatus?.isOnline ?? false,
        lastSeen: t.onlineStatus?.lastSeen ?? null,
      });
    }
  });

  return NextResponse.json(Array.from(teacherMap.values()));
}
