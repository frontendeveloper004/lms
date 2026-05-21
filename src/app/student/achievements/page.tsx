// Server Component — DB dan to'g'ridan-to'g'ri, loading spinner yo'q
import { requireStudentSession, getStudentAchievementsData } from "@/lib/data/student";
import { AchievementsClient } from "./AchievementsClient";
import { redirect } from "next/navigation";

export default async function AchievementsPage() {
  const session = await requireStudentSession();
  const data = await getStudentAchievementsData(session.userId);

  if (!data) redirect("/login");

  // Serialize dates
  const serialized = {
    ...data,
    certificates: data.certificates.map((c) => ({
      ...c,
      issuedAt: c.issuedAt instanceof Date ? c.issuedAt.toISOString() : String(c.issuedAt),
    })),
  };

  return <AchievementsClient initialData={serialized} />;
}
