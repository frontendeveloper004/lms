import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { validateBody, createCourseSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan harakat" }, { status: 403 });
    }

    const { data, error } = await validateBody(req, createCourseSchema);
    if (error) return error;

    const { title, description, level, categoryName, price, image, xpPoints, introVideo, technologies } = data;

    // Upsert the category so it exists
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image: image || undefined,
        xpPoints,
        level,
        price,
        categoryId: category.id,
        teacherId: session.userId,
        introVideo: introVideo || undefined,
        technologies: technologies != null ? JSON.stringify(technologies) : undefined,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ...course,
      technologies: course.technologies ? (() => { try { return JSON.parse(course.technologies as string); } catch { return null; } })() : null,
    }, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Kursni yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan harakat" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: {
        teacherId: session.userId,
      },
      include: {
        category: true,
        _count: {
          select: { enrollments: true, modules: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedCourses = courses.map((c) => ({
      ...c,
      technologies: c.technologies ? (() => { try { return JSON.parse(c.technologies as string); } catch { return null; } })() : null,
    }));

    return NextResponse.json(parsedCourses, { status: 200 });
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json({ error: "Ma'lumotlarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
