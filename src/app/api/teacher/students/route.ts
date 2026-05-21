import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    // Get all enrollments for courses taught by this teacher
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: session.userId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Group by student to return unique students with their course count
    const studentMap = new Map();

    enrollments.forEach((enr: any) => {
      if (!studentMap.has(enr.studentId)) {
        studentMap.set(enr.studentId, {
          id: enr.student.id,
          name: enr.student.name,
          email: enr.student.email,
          avatar: enr.student.avatar ?? null,
          joined: enr.student.createdAt,
          courseCount: 1,
          courses: [enr.course.title]
        });
      } else {
        const student = studentMap.get(enr.studentId);
        student.courseCount += 1;
        student.courses.push(enr.course.title);
      }
    });

    const studentsList = Array.from(studentMap.values());

    return NextResponse.json(studentsList);
  } catch (error) {
    console.error("[TEACHER_STUDENTS_GET]", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
