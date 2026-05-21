import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET /api/teacher/chat-students — unique students enrolled in teacher's courses + online status
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: session.userId } },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          avatar: true,
          onlineStatus: { select: { isOnline: true, lastSeen: true } },
        },
      },
    },
  });

  // Deduplicate by student id
  const studentMap = new Map<string, {
    id: string;
    name: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
  }>();

  enrollments.forEach((enr) => {
    const s = enr.student;
    if (!studentMap.has(s.id)) {
      studentMap.set(s.id, {
        id: s.id,
        name: s.name,
        avatar: s.avatar ?? null,
        isOnline: s.onlineStatus?.isOnline ?? false,
        lastSeen: s.onlineStatus?.lastSeen ?? null,
      });
    }
  });

  return NextResponse.json(Array.from(studentMap.values()));
}
