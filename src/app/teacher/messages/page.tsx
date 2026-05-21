import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { TeacherMessagesClient } from "./TeacherMessagesClient";

export default async function TeacherMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") redirect("/login");

  return (
    <Suspense>
      <TeacherMessagesClient currentUserId={session.userId} />
    </Suspense>
  );
}
