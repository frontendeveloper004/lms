import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { CourseComments } from "@/components/CourseComments";
import { MessageCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default async function TeacherCourseCommentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== "TEACHER") redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, teacherId: true },
  });
  if (!course || course.teacherId !== session.userId) redirect("/teacher");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back — goes to wherever user came from */}
      <BackButton />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Kurs muhokamasi</h1>
          <p className="text-sm text-slate-500 font-medium">{course.title}</p>
        </div>
      </div>

      {/* Comments — showToggle=true gives teacher the ON/OFF switch */}
      <CourseComments
        courseId={courseId}
        currentUserId={session.userId}
        currentUserRole="TEACHER"
        teacherId={course.teacherId}
        showToggle={true}
      />
    </div>
  );
}
