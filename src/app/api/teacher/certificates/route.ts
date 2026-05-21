import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const certificates = await prisma.teacherCertificate.findMany({
      where: { teacherId: session.userId },
      orderBy: { orderIdx: "asc" },
      select: { id: true, name: true, issuer: true, year: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(certificates);
  } catch (err) {
    console.error("GET /api/teacher/certificates error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireRole("TEACHER");
    if (error) return error;

    const body = await req.json();
    const { name, issuer, year, imageUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Sertifikat nomi kiritilishi shart" }, { status: 400 });
    }

    const count = await prisma.teacherCertificate.count({ where: { teacherId: session.userId } });
    if (count >= 10) {
      return NextResponse.json({ error: "Maksimal 10 ta sertifikat qo'shish mumkin" }, { status: 400 });
    }

    const cert = await prisma.teacherCertificate.create({
      data: {
        name: name.trim(),
        issuer: issuer?.trim() || null,
        year: year ? parseInt(year) : null,
        imageUrl: imageUrl?.trim() || null,
        orderIdx: count,
        teacherId: session.userId,
      },
      select: { id: true, name: true, issuer: true, year: true, imageUrl: true, orderIdx: true },
    });

    return NextResponse.json(cert, { status: 201 });
  } catch (err) {
    console.error("POST /api/teacher/certificates error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
