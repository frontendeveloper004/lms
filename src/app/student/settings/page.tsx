// Server Component — initial profile data DB dan olinadi
// Forma va interaktiv qismlar uchun eski "use client" komponent ishlatiladi
import { requireStudentSession, getStudentProfileData } from "@/lib/data/student";
import StudentSettingsClient from "./StudentSettingsClient";
import { redirect } from "next/navigation";

export default async function StudentSettingsPage() {
  const session = await requireStudentSession();
  const profile = await getStudentProfileData(session.userId);

  if (!profile) redirect("/login");

  return <StudentSettingsClient initialProfile={profile} />;
}
