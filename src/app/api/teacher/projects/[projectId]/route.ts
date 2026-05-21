import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const { projectId } = await params;
    const body = await req.json();
    const { title, description, url, imageUrl } = body;

    const existing = await prisma.teacherProject.findUnique({ where: { id: projectId } });
    if (!existing || existing.teacherId !== session.userId) {
      return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
    }

    const updated = await prisma.teacherProject.update({
      where: { id: projectId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(url !== undefined && { url: url?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      },
      select: { id: true, title: true, description: true, url: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/teacher/projects/[projectId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const { projectId } = await params;

    const existing = await prisma.teacherProject.findUnique({ where: { id: projectId } });
    if (!existing || existing.teacherId !== session.userId) {
      return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
    }

    await prisma.teacherProject.delete({ where: { id: projectId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/teacher/projects/[projectId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
