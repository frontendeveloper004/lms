import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Use a transaction to ensure atomic deletion
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { studentId: session.userId } }),
      prisma.user.delete({ where: { id: session.userId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
