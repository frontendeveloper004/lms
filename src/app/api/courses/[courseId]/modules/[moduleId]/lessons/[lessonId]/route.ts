import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;
    const { title, videoUrl, content, orderIdx, attachmentUrl } = await req.json();

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        videoUrl,
        content,
        orderIdx,
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
