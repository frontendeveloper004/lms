/**
 * Server-side data fetching functions for teacher pages.
 * Bu funksiyalar to'g'ridan-to'g'ri Prisma orqali DB dan ma'lumot oladi —
 * HTTP fetch() yo'q, network round-trip yo'q, Neon cold start yo'q.
 */

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

// ── Auth helper ───────────────────────────────────────────────────────────────
export async function requireTeacherSession() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }
  return session;
}

// ── Teacher dashboard data ────────────────────────────────────────────────────
export async function getTeacherDashboardData(teacherId: string) {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      _count: { select: { enrollments: true } },
      modules: {
        select: {
          _count: { select: { lessons: true, quizzes: true } },
          assignment: { select: { id: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  return courses;
}

// ── Teacher courses list ──────────────────────────────────────────────────────
export async function getTeacherCourses(teacherId: string) {
  return prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      price: true,
      createdAt: true,
      image: true,
      xpPoints: true,
      category: { select: { name: true } },
      _count: { select: { enrollments: true } },
      modules: {
        select: {
          id: true,
          _count: { select: { lessons: true, quizzes: true } },
          assignment: { select: { id: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Teacher students list ─────────────────────────────────────────────────────
export async function getTeacherStudents(teacherId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId } },
    select: {
      studentId: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by student
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      joined: Date;
      courseCount: number;
      courses: string[];
    }
  >();

  for (const enr of enrollments) {
    if (!studentMap.has(enr.studentId)) {
      studentMap.set(enr.studentId, {
        id: enr.student.id,
        name: enr.student.name,
        email: enr.student.email,
        avatar: enr.student.avatar ?? null,
        joined: enr.student.createdAt,
        courseCount: 1,
        courses: [enr.course.title],
      });
    } else {
      const s = studentMap.get(enr.studentId)!;
      s.courseCount += 1;
      s.courses.push(enr.course.title);
    }
  }

  return Array.from(studentMap.values());
}

// ── Teacher submissions ───────────────────────────────────────────────────────
export async function getTeacherSubmissions(teacherId: string) {
  const teacherCourses = await prisma.course.findMany({
    where: { teacherId },
    select: { id: true, title: true },
  });

  const courseIds = teacherCourses.map((c) => c.id);

  const assignments = await prisma.assignment.findMany({
    where: { module: { courseId: { in: courseIds } } },
    select: {
      id: true,
      title: true,
      module: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
      submissions: {
        select: {
          id: true,
          status: true,
          score: true,
          feedback: true,
          xpBonus: true,
          submittedAt: true,
          gradedAt: true,
          gradedBy: true,
          aiScore: true,
          aiFeedback: true,
          aiGradedAt: true,
          aiConfidence: true,
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  const result = assignments.flatMap((assignment) =>
    assignment.submissions.map((sub) => ({
      submissionId: sub.id,
      status: sub.status,
      score: sub.score,
      feedback: sub.feedback,
      xpBonus: sub.xpBonus,
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt,
      gradedBy: sub.gradedBy,
      aiScore: sub.aiScore,
      aiFeedback: sub.aiFeedback,
      aiGradedAt: sub.aiGradedAt,
      aiConfidence: sub.aiConfidence,
      student: sub.student,
      assignment: { id: assignment.id, title: assignment.title },
      module: { id: assignment.module.id, title: assignment.module.title },
      course: {
        id: assignment.module.course.id,
        title: assignment.module.course.title,
      },
    }))
  );

  result.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return { submissions: result, courses: teacherCourses };
}

// ── Teacher profile ───────────────────────────────────────────────────────────
export async function getTeacherProfile(teacherId: string) {
  const [user, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        specialization: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        youtubeUrl: true,
        telegramUrl: true,
        websiteUrl: true,
        xpPoints: true,
        createdAt: true,
        subjectType: true,
      },
    }),
    prisma.course.findMany({
      where: { teacherId },
      select: {
        id: true,
        title: true,
        status: true,
        enrollments: { select: { studentId: true } },
      },
    }),
  ]);

  if (!user) return null;

  const allStudentIds = courses.flatMap((c) => c.enrollments.map((e) => e.studentId));
  const uniqueStudentCount = new Set(allStudentIds).size;

  return {
    ...user,
    skills: (() => {
      try {
        const parsed = JSON.parse(user.skills as string);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })(),
    stats: { courseCount: courses.length, uniqueStudentCount },
    courses: courses.map((c) => ({ id: c.id, title: c.title, status: c.status })),
  };
}
