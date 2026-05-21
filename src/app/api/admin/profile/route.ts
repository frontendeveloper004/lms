import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { session, error } = await requireRole("ADMIN");
    if (error) return error;

    const [user, totalUsers, approvedCourses, pendingCourses] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      }),
      prisma.user.count(),
      prisma.course.count({ where: { status: "APPROVED" } }),
      prisma.course.count({ where: { status: "PENDING" } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      createdAt: user.createdAt.toISOString(),
      stats: { totalUsers, approvedCourses, pendingCourses },
    });
  } catch (err) {
    console.error("GET /api/admin/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
