import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const { certId } = await params;
    const body = await req.json();
    const { name, issuer, year, imageUrl } = body;

    const existing = await prisma.teacherCertificate.findUnique({ where: { id: certId } });
    if (!existing || existing.teacherId !== session.userId) {
      return NextResponse.json({ error: "Sertifikat topilmadi" }, { status: 404 });
    }

    const updated = await prisma.teacherCertificate.update({
      where: { id: certId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(issuer !== undefined && { issuer: issuer?.trim() || null }),
        ...(year !== undefined && { year: year ? parseInt(year) : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      },
      select: { id: true, name: true, issuer: true, year: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/teacher/certificates/[certId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const { certId } = await params;

    const existing = await prisma.teacherCertificate.findUnique({ where: { id: certId } });
    if (!existing || existing.teacherId !== session.userId) {
      return NextResponse.json({ error: "Sertifikat topilmadi" }, { status: 404 });
    }

    await prisma.teacherCertificate.delete({ where: { id: certId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/teacher/certificates/[certId] error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
