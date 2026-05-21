import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

type RequireRoleResult =
  | { session: { userId: string; role: string }; error: null }
  | { session: null; error: NextResponse };

export async function requireRole(allowedRole: string): Promise<RequireRoleResult> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  // Case-insensitive comparison to handle any casing differences
  if (session.role?.toUpperCase() !== allowedRole.toUpperCase()) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden", sessionRole: session.role, required: allowedRole }, { status: 403 }),
    };
  }
  return { session, error: null };
}
