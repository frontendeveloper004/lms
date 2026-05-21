import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const EXT_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
    }
    if (session.role !== "TEACHER" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl tanlanmagan" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Faqat PDF yoki DOCX formatlar qabul qilinadi" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Fayl hajmi 10 MB dan oshmasligi kerak" },
        { status: 400 }
      );
    }

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
      }
      if (course.teacherId !== session.userId && session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Bu kursga fayl yuklay olmaysiz" },
          { status: 403 }
        );
      }
    }

    const ext = EXT_MAP[file.type];
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "lessons");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/lessons/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Lesson attachment upload error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
