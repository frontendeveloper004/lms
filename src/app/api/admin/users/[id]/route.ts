import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id: targetUserId } = await params;

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Checking if the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      // Check if trying to delete the only admin
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
         return NextResponse.json({ error: "Tizimdagi yagona adminni o'chirib bo'lmaydi" }, { status: 400 });
      }
    }

    if (targetUser.role === "TEACHER") {
      // Due to missing CASCADE onDelete on Course.teacherId, we manually delete their courses.
      // Database cascades on Course will automatically clean up Module, Lesson, Quiz, Enrollment, etc.
      await prisma.course.deleteMany({
        where: { teacherId: targetUserId },
      });
    }

    // Delete the user. This triggers db cascades for Enrollment, CompletedLesson, etc.
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
