import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId } = await params;
    const { status } = await req.json();

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { status },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
