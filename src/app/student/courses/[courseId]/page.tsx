import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export default async function StudentCourseOverview({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // Get course structure
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { orderIdx: "asc" },
        include: {
          lessons: { orderBy: { orderIdx: "asc" } },
          quizzes: { orderBy: { orderIdx: "asc" } },
          assignment: true,
        },
      },
    },
  });

  if (!course || course.modules.length === 0) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Kurs materiallari tayyor emas</h1>
        <p className="text-slate-500">O'qituvchi hali darslarni yuklamagan.</p>
      </div>
    );
  }

  // Get completed lessons for this student
  const completedLessons = await prisma.completedLesson.findMany({
    where: { userId: session.userId },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(completedLessons.map(cl => cl.lessonId));

  // Get completed quizzes — use raw query to avoid Prisma client cache issue
  let completedQuizIds = new Set<string>();
  try {
    const completedQuizzes = await (prisma as any).completedQuiz.findMany({
      where: { userId: session.userId },
      select: { quizId: true },
    });
    completedQuizIds = new Set(completedQuizzes.map((cq: any) => cq.quizId));
  } catch {
    // CompletedQuiz table may not be in client yet — ignore
  }

  // Get submitted/completed assignments
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId: session.userId },
    select: { assignmentId: true, status: true },
  });
  const completedAssignmentIds = new Set(submissions.map(s => s.assignmentId));

  // Build ordered list of all items
  const allItems: { type: 'lesson' | 'quiz' | 'assignment'; id: string; isCompleted: boolean }[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      allItems.push({ type: 'lesson', id: lesson.id, isCompleted: completedLessonIds.has(lesson.id) });
    }
    for (const quiz of mod.quizzes) {
      allItems.push({ type: 'quiz', id: quiz.id, isCompleted: completedQuizIds.has(quiz.id) });
    }
    if (mod.assignment) {
      allItems.push({ type: 'assignment', id: mod.assignment.id, isCompleted: completedAssignmentIds.has(mod.assignment.id) });
    }
  }

  if (allItems.length === 0) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Kurs materiallari tayyor emas</h1>
        <p className="text-slate-500">O'qituvchi hali darslarni yuklamagan.</p>
      </div>
    );
  }

  // Find first incomplete item — if all done, go to first item
  const nextItem = allItems.find(item => !item.isCompleted) || allItems[0];

  if (nextItem.type === 'quiz') {
    redirect(`/student/courses/${courseId}/quizzes/${nextItem.id}`);
  } else if (nextItem.type === 'assignment') {
    redirect(`/student/courses/${courseId}/assignments/${nextItem.id}`);
  } else {
    redirect(`/student/courses/${courseId}/lessons/${nextItem.id}`);
  }
}
