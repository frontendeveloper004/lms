import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
