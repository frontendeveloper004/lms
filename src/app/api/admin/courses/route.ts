import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        teacher: { select: { name: true, email: true } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedCourses = courses.map((c) => ({
      ...c,
      technologies: c.technologies ? (() => { try { return JSON.parse(c.technologies as string); } catch { return null; } })() : null,
    }));

    return NextResponse.json(parsedCourses);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
