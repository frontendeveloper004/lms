import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.userId },
      include: {
        course: {
          include: { 
            category: true,
            teacher: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        student: {
          select: {
            certificates: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
