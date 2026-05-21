import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ courseId: string; moduleId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    // Verify course ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    const body = await req.json();
    const data: { title?: string; orderIdx?: number } = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.orderIdx !== undefined) data.orderIdx = body.orderIdx;

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH module error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    // Verify course ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    await prisma.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE module error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
