import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId } = await params;

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIdx: "asc" },
    });

    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId } = await params;
    const { title, orderIdx } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Nomi kiritilishi shart" }, { status: 400 });
    }

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    const newModule = await prisma.module.create({
      data: {
        title,
        orderIdx,
        courseId,
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
