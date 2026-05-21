import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        modules: {
          include: { 
            lessons: true,
            quizzes: { orderBy: { orderIdx: "asc" } },
            assignment: true,
          },
          orderBy: { orderIdx: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    const publicCourse = {
      ...course,
      technologies: course.technologies ? (() => { try { return JSON.parse(course.technologies as string); } catch { return null; } })() : null,
      modules: course.modules.map((mod: any) => ({
        ...mod,
        lessons: mod.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          orderIdx: lesson.orderIdx,
        })),
        quizzes: mod.quizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          orderIdx: quiz.orderIdx,
        })),
        assignment: mod.assignment ? {
          id: mod.assignment.id,
          title: mod.assignment.title,
        } : null
      }))
    };

    return NextResponse.json(publicCourse);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId } = await params;
    const { title, description, level, categoryName, price, image, xpPoints, introVideo, technologies } = await req.json();

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
      include: { category: true }
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    let categoryId = courseOwned?.categoryId;
    if (categoryName && categoryName !== courseOwned?.category?.name) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        image: image || undefined,
        xpPoints: xpPoints ? Number(xpPoints) : undefined,
        level: level as any,
        price: Number(price),
        introVideo: introVideo !== undefined ? (introVideo || null) : undefined,
        technologies: technologies !== undefined ? (technologies != null ? JSON.stringify(technologies) : null) : undefined,
        ...(categoryId && { categoryId }),
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'chira olmaysiz" }, { status: 403 });
    }

    await prisma.course.delete({ where: { id: courseId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
