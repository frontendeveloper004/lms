import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Faqat talabalar kursga yozila oladi" }, { status: 403 });
    }

    const { courseId } = await params;

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Siz bu kursga allaqachon yozilgansiz" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.userId,
        courseId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
