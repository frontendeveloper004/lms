import prisma from "@/lib/prisma";

export interface CourseCompletionResult {
  isComplete: boolean;
  progress: number;
  certificateId: string | null;
}

export async function checkCourseCompletion(
  studentId: string,
  courseId: string
): Promise<CourseCompletionResult> {
  // Load course with all modules, lessons, quizzes, and assignments in ONE query
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { include: { completedBy: { where: { userId: studentId } } } },
          quizzes: { include: { completedBy: { where: { userId: studentId } } } },
          assignment: {
            include: {
              submissions: { where: { studentId }, select: { status: true } },
            },
          },
        },
      },
    },
  });

  // If course not found, return incomplete
  if (!course) {
    return { isComplete: false, progress: 0, certificateId: null };
  }

  // If any condition is not met, return incomplete
  // Calculate total items and completed items for progress
  let totalLessons = 0;
  let doneLessons = 0;
  let totalQuizzes = 0;
  let doneQuizzes = 0;
  let totalAssignments = 0;
  let gradedAssignments = 0;

  for (const mod of course.modules) {
    totalLessons += mod.lessons.length;
    doneLessons += mod.lessons.filter(l => l.completedBy.length > 0).length;

    totalQuizzes += mod.quizzes.length;
    doneQuizzes += mod.quizzes.filter(q => q.completedBy.length > 0).length;

    if (mod.assignment) {
      totalAssignments += 1;
      if (mod.assignment.submissions.length > 0 && mod.assignment.submissions[0].status === "GRADED") {
        gradedAssignments += 1;
      }
    }
  }

  const totalItems = totalLessons + totalQuizzes + totalAssignments;
  const completedItems = doneLessons + doneQuizzes + gradedAssignments;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Update enrollment: save progress
  await prisma.enrollment.update({
    where: {
      studentId_courseId: { studentId, courseId },
    },
    data: {
      progress: progressPercent,
      ...(progressPercent === 100 ? { completedAt: new Date() } : {}),
    },
  });

  // Check if fully complete for certificate
  const allLessonsDone = doneLessons === totalLessons && totalLessons > 0;
  const allQuizzesDone = doneQuizzes === totalQuizzes;
  const allAssignmentsGraded = gradedAssignments === totalAssignments;

  if (!allLessonsDone || !allQuizzesDone || !allAssignmentsGraded) {
    return { isComplete: false, progress: progressPercent, certificateId: null };
  }

  // Create certificate if not exists (findUnique + create to avoid duplicates)
  let cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: studentId, courseId } },
  });

  if (!cert) {
    cert = await prisma.certificate.create({
      data: {
        userId: studentId,
        courseId,
        code: `CR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });
  }

  return { isComplete: true, progress: 100, certificateId: cert.id };
}
