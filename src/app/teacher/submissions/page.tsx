// Server Component — initial data DB dan olinadi, loading spinner yo'q
import { requireTeacherSession, getTeacherSubmissions } from "@/lib/data/teacher";
import SubmissionsPageClient from "./SubmissionsClient";

export default async function TeacherSubmissionsPage() {
  const session = await requireTeacherSession();
  const { submissions, courses } = await getTeacherSubmissions(session.userId);

  // Serialize dates for client component
  const serializedSubmissions = submissions.map((s) => ({
    ...s,
    submittedAt:
      s.submittedAt instanceof Date ? s.submittedAt.toISOString() : String(s.submittedAt),
    gradedAt: s.gradedAt
      ? s.gradedAt instanceof Date ? s.gradedAt.toISOString() : String(s.gradedAt)
      : null,
    aiGradedAt: s.aiGradedAt
      ? s.aiGradedAt instanceof Date ? s.aiGradedAt.toISOString() : String(s.aiGradedAt)
      : null,
  }));

  return <SubmissionsPageClient initialSubmissions={serializedSubmissions} courses={courses} />;
}
