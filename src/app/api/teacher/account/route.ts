import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Use a transaction to ensure atomic deletion of the teacher and their courses
    await prisma.$transaction(async (tx) => {
      // Find all courses taught by the teacher
      const courses = await tx.course.findMany({
        where: { teacherId: session.userId },
        select: { id: true }
      });

      // Delete each course. This will trigger cascading deletes for modules, lessons, etc.
      // Prism's deleteMany doesn't trigger cascades for some DBs, 
      // but manually deleting courses one by one (or with a good schema) is safer.
      for (const course of courses) {
        await tx.course.delete({ where: { id: course.id } });
      }

      // Finally delete the user
      await tx.user.delete({ where: { id: session.userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete teacher account error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
