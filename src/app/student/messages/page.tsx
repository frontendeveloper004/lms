import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { StudentMessagesClient } from "./StudentMessagesClient";

export default async function StudentMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/login");

  return (
    <Suspense>
      <StudentMessagesClient currentUserId={session.userId} />
    </Suspense>
  );
}
