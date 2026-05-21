import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ro'yxatdan o'ting" }, { status: 401 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: { select: { name: true } }, // Minimal category info
        teacher: { select: { subjectType: true } },
        modules: {
          include: {
            lessons: {
              orderBy: { orderIdx: "asc" },
              include: {
                completedBy: {
                  where: { userId: session.userId },
                  select: { id: true }
                }
              }
            },
            quizzes: {
              orderBy: { orderIdx: "asc" },
              include: {
                questions: true,
              }
            },
            assignment: {
              include: {
                submissions: {
                  where: { studentId: session.userId },
                  select: { id: true, status: true },
                }
              }
            }
          },
          orderBy: { orderIdx: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    // Get completed quizzes separately (safe fallback)
    let completedQuizIds = new Set<string>();
    try {
      const completedQuizzes = await (prisma as any).completedQuiz.findMany({
        where: { userId: session.userId },
        select: { quizId: true },
      });
      completedQuizIds = new Set(completedQuizzes.map((cq: any) => cq.quizId));
    } catch { /* table may not exist yet */ }

    // Check if certificate exists (course is fully completed)
    let earnedCertificateId: string | null = null;
    try {
      const cert = await prisma.certificate.findFirst({
        where: { userId: session.userId, courseId },
      });
      if (cert) earnedCertificateId = cert.id;
    } catch { /* ignore */ }

    // First pass: collect completion info per module
    const moduleCompletionMap = new Map<string, { allLessonsDone: boolean; quizDone: boolean; assignmentSubmitted: boolean }>();
    for (const mod of course.modules) {
      const allLessonsDone = mod.lessons.every((l: any) => l.completedBy.length > 0);
      const quizDone = mod.quizzes.length === 0 || mod.quizzes.every((q: any) => completedQuizIds.has(q.id));
      const assignmentSubmitted = !mod.assignment || mod.assignment.submissions.length > 0;
      moduleCompletionMap.set(mod.id, { allLessonsDone, quizDone, assignmentSubmitted });
    }

    // Build transformed modules with isLocked
    const sortedMods = [...course.modules].sort((a: any, b: any) => a.orderIdx - b.orderIdx);

    const transformedModules = sortedMods.map((mod: any, modIdx: number) => {
      // Previous module must be fully done (all lessons + quiz + assignment if exists) to unlock this module's first lesson
      const prevModFullyDone = modIdx === 0
        ? true
        : (() => {
            const prevMod = sortedMods[modIdx - 1];
            const info = moduleCompletionMap.get(prevMod.id)!;
            return info.allLessonsDone && info.quizDone && info.assignmentSubmitted;
          })();

      const sortedLessons = [...mod.lessons].sort((a: any, b: any) => a.orderIdx - b.orderIdx);
      const transformedLessons = sortedLessons.map((lesson: any, lessonIdx: number) => {
        let isLocked: boolean;
        if (modIdx === 0 && lessonIdx === 0) {
          isLocked = false;
        } else if (lessonIdx === 0) {
          isLocked = !prevModFullyDone;
        } else {
          const prevLesson = sortedLessons[lessonIdx - 1];
          isLocked = prevLesson.completedBy.length === 0;
        }
        return {
          ...lesson,
          isCompleted: lesson.completedBy.length > 0,
          isLocked,
        };
      });

      // Quiz is locked until all lessons in this module are completed
      const allModLessonsDone = sortedLessons.every((l: any) => l.completedBy.length > 0);
      const transformedQuizzes = [...mod.quizzes]
        .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
        .map((quiz: any) => ({
          ...quiz,
          isCompleted: completedQuizIds.has(quiz.id),
          isLocked: !allModLessonsDone,
          questions: quiz.questions.map((q: any) => ({
            ...q,
            options: (() => { try { return JSON.parse(q.options as string); } catch { return Array.isArray(q.options) ? q.options : []; } })(),
          }))
        }));

      // Assignment item (if exists)
      let assignmentItem = null;
      if (mod.assignment) {
        const quizDone = mod.quizzes.length === 0 || mod.quizzes.every((q: any) => completedQuizIds.has(q.id));
        // Assignment is locked if: previous module not fully done OR current module's quiz not done
        const assignmentLocked = !prevModFullyDone || !quizDone;
        const submission = mod.assignment.submissions[0] ?? null;

        let status: 'locked' | 'unlocked' | 'submitted' | 'graded';
        if (assignmentLocked) {
          status = 'locked';
        } else if (!submission) {
          status = 'unlocked';
        } else if (submission.status === 'GRADED') {
          status = 'graded';
        } else {
          status = 'submitted';
        }

        assignmentItem = {
          type: 'assignment' as const,
          id: mod.assignment.id,
          title: mod.assignment.title,
          status,
          isLocked: assignmentLocked,
        };
      }

      return {
        ...mod,
        lessons: transformedLessons,
        quizzes: transformedQuizzes,
        assignment: assignmentItem,
      };
    });

    const curriculum = {
      ...course,
      modules: transformedModules,
      earnedCertificateId,
    };

    return NextResponse.json(curriculum);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
