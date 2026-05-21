// Server Component — initial data DB dan olinadi, loading spinner yo'q
import { requireTeacherSession, getTeacherCourses } from "@/lib/data/teacher";
import prisma from "@/lib/prisma";
import { CoursesClient } from "./CoursesClient";

export default async function TeacherCoursesPage() {
  const session = await requireTeacherSession();
  const courses = await getTeacherCourses(session.userId);

  // Serialize dates for client
  const serialized = courses.map((c) => ({
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  }));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subjectType: true }
  }).catch(() => null);

  return <CoursesClient initialCourses={serialized} subjectType={user?.subjectType || "PROGRAMMING"} />;
}
