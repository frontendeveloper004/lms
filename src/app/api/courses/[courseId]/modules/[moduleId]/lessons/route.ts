import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { moduleId } = await params;

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { orderIdx: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;
    const { title, videoUrl, content, orderIdx, attachmentUrl } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Nomi kiritilishi shart" }, { status: 400 });
    }

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    const newLesson = await prisma.lesson.create({
      data: {
        title,
        videoUrl,
        content,
        orderIdx,
        moduleId,
        attachmentUrl: attachmentUrl ?? null,
      },
    });

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
