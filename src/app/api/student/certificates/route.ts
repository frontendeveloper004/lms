import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.userId },
      include: {
        user: { select: { name: true } },
        course: {
          select: { title: true, certificateImage: true }
        }
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
