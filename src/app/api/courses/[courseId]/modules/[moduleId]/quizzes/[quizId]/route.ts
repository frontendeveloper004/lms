import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { validateBody, createQuizSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, quizId } = await params;
    const { data, error: validationError } = await validateBody(req, createQuizSchema);
    if (validationError) return validationError;

    const { title, questions } = data;

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        questions: {
          deleteMany: {},
          create: questions.map((q: any) => ({
            text: q.text,
            options: typeof q.options === "string" ? q.options : JSON.stringify(q.options),
            correctIdx: q.correctIdx,
          }))
        }
      },
      include: { questions: true }
    });

    return NextResponse.json({ ...updatedQuiz, questions: updatedQuiz.questions.map((q) => ({ ...q, options: (() => { try { return JSON.parse(q.options as string); } catch { return []; } })() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, quizId } = await params;

    const courseOwned = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (courseOwned?.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Boshqalar kursini o'zgartira olmaysiz" }, { status: 403 });
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
