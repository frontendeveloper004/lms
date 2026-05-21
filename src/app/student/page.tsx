// Server Component — useEffect + fetch yo'q, Neon cold start yo'q
import { requireStudentSession, getStudentDashboardData } from "@/lib/data/student";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function StudentDashboard() {
  const session = await requireStudentSession();

  // Onboarding tekshiruvi — faqat bir marta ko'rsatiladi
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) {
    redirect("/student/onboarding");
  }

  const { 
    enrollments, 
    xp, 
    seasonalXp, 
    league, 
    streak, 
    pointsToNextLeague,
    challenges 
  } = await getStudentDashboardData(session.userId);

  // Serialize dates for client
  const serialized = enrollments.map((e) => ({
    ...e,
    student: e.student
      ? {
          certificates: e.student.certificates?.map((c) => ({
            id: c.id,
            courseId: c.courseId,
          })) ?? [],
        }
      : undefined,
  }));

  return (
    <DashboardClient 
      enrollments={serialized} 
      xp={xp} 
      seasonalXp={seasonalXp}
      league={league}
      streak={streak}
      pointsToNextLeague={pointsToNextLeague}
      challenges={challenges}
    />
  );
}
