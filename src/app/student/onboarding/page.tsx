// Server Component — DB dan onboardingCompleted tekshiradi
// Agar allaqachon tugallangan bo'lsa → /student ga redirect
import { redirect } from "next/navigation";
import { requireStudentSession } from "@/lib/data/student";
import prisma from "@/lib/prisma";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await requireStudentSession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboardingCompleted: true },
  });

  // Onboarding allaqachon tugallangan — qaytib kirish mumkin emas
  if (user?.onboardingCompleted) {
    redirect("/student");
  }

  return <OnboardingClient />;
}
