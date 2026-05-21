import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { validateBody, createQuizSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const quizzes = await prisma.quiz.findMany({
      where: { moduleId },
      include: { questions: true },
      orderBy: { orderIdx: "asc" },
    });
    const parsed = quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: (() => { try { return JSON.parse(q.options as string); } catch { return []; } })(),
      })),
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;
    const { data, error: validationError } = await validateBody(req, createQuizSchema);
    if (validationError) return validationError;

    const { title, questions } = data;

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    // Get current quiz count for orderIdx
    const count = await prisma.quiz.count({ where: { moduleId } });

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        moduleId,
        orderIdx: count + 1,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: typeof q.options === "string" ? q.options : JSON.stringify(q.options),
            correctIdx: q.correctIdx,
          }))
        }
      },
      include: { questions: true }
    });

    return NextResponse.json({ ...newQuiz, questions: newQuiz.questions.map((q) => ({ ...q, options: (() => { try { return JSON.parse(q.options as string); } catch { return []; } })() })) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
