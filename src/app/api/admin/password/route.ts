import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import { changePassword } from "@/lib/password";

export async function PATCH(req: Request) {
  try {
    const { session, error } = await requireRole("ADMIN");
    if (error) return error;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Barcha maydonlar to'ldirilishi shart" }, { status: 400 });
    }

    const result = await changePassword(session.userId, currentPassword, newPassword);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
