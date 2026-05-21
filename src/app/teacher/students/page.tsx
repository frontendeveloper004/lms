// Server Component — ma'lumot DB dan to'g'ridan-to'g'ri olinadi
import { requireTeacherSession, getTeacherStudents } from "@/lib/data/teacher";
import { StudentsClient } from "./StudentsClient";

export default async function TeacherStudentsPage() {
  const session = await requireTeacherSession();
  const students = await getTeacherStudents(session.userId);

  // Date ni serialize qilish (Server → Client)
  const serialized = students.map((s) => ({
    ...s,
    joined: s.joined instanceof Date ? s.joined.toISOString() : String(s.joined),
  }));

  return <StudentsClient students={serialized} />;
}
