import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const projects = await prisma.teacherProject.findMany({
      where: { teacherId: session.userId },
      orderBy: { orderIdx: "asc" },
      select: { id: true, title: true, description: true, url: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET /api/teacher/projects error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const body = await req.json();
    const { title, description, url, imageUrl } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Loyiha nomi kiritilishi shart" }, { status: 400 });
    }

    const count = await prisma.teacherProject.count({ where: { teacherId: session.userId } });
    if (count >= 6) {
      return NextResponse.json({ error: "Maksimal 6 ta loyiha qo'shish mumkin" }, { status: 400 });
    }

    const project = await prisma.teacherProject.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        url: url?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        orderIdx: count,
        teacherId: session.userId,
      },
      select: { id: true, title: true, description: true, url: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("POST /api/teacher/projects error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
