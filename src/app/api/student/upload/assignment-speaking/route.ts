import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";

const ALLOWED_MIME_TYPES = ["audio/webm", "audio/ogg", "audio/mpeg", "audio/wav"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit for student audio

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl tanlanmagan" }, { status: 400 });
    }
    
    // Some browsers send different mime types for webm
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type) || file.name.endsWith(".webm");
    
    if (!isValidMime) {
      return NextResponse.json({ error: "Noto'g'ri audio formati: " + file.type }, { status: 400 });
    }
    
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Fayl hajmi juda katta" }, { status: 400 });
    }

    // Verify enrollment
    if (courseId) {
       const enrollment = await prisma.enrollment.findFirst({
         where: { studentId: session.userId, courseId: courseId }
       });
       if (!enrollment) {
         return NextResponse.json({ error: "Siz kursga a'zo emassiz" }, { status: 403 });
       }
    }

    const ext = file.name.split(".").pop() || "webm";
    const filename = `res-${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "submissions", "speaking");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/submissions/speaking/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Student speaking upload error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
