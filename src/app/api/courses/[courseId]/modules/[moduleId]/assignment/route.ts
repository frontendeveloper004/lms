import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { validateBody, createAssignmentSchema, updateAssignmentSchema } from "@/lib/validations";

type Params = { params: Promise<{ courseId: string; moduleId: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { moduleId },
    });

    if (!assignment) return NextResponse.json(null);

    return NextResponse.json({
      ...assignment,
      starterCode: assignment.starterCode ? (() => { try { return JSON.parse(assignment.starterCode as string); } catch { return assignment.starterCode; } })() : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { data, error: validationError } = await validateBody(req, createAssignmentSchema);
    if (validationError) return validationError;

    const { title, description, rubric, taskType, starterCode, attachmentUrl } = data;

    // Check if assignment already exists
    const existing = await prisma.assignment.findUnique({ where: { moduleId } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu modul uchun topshiriq allaqachon mavjud" },
        { status: 409 }
      );
    }

    // starterCode is stored as JSON string in SQLite
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        rubric,
        moduleId,
        taskType,
        starterCode: starterCode ?? null,
        attachmentUrl: attachmentUrl ?? null,
      },
});

    return NextResponse.json({
      ...assignment,
      starterCode: assignment.starterCode ? (() => { try { return JSON.parse(assignment.starterCode as string); } catch { return assignment.starterCode; } })() : null,
    }, { status: 201 });
  } catch (error) {
    console.error("[Assignment POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({ where: { moduleId } });
    if (!assignment) return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });

    const { data, error: validationError } = await validateBody(req, updateAssignmentSchema);
    if (validationError) return validationError;

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rubric !== undefined) updateData.rubric = data.rubric;
    if (data.taskType !== undefined) updateData.taskType = data.taskType;
    if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl;
    if (data.starterCode !== undefined) {
      // Store starterCode as-is (JSON string) for SQLite
      updateData.starterCode = data.starterCode ?? null;
    }

    const updated = await prisma.assignment.update({
      where: { moduleId },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      starterCode: updated.starterCode ? (() => { try { return JSON.parse(updated.starterCode as string); } catch { return updated.starterCode; } })() : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, moduleId } = await params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    if (course.teacherId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({ where: { moduleId } });
    if (!assignment) return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });

    await prisma.assignment.delete({ where: { moduleId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
