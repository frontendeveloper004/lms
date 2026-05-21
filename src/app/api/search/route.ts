import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // SQLite'da contains case-insensitive ishlaydi (default)
    const courses = await prisma.course.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        level: true,
        price: true,
        xpPoints: true,
        createdAt: true,
        category: { select: { name: true } },
        teacher: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
