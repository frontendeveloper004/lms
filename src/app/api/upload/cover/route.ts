import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
    }
    if (session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl tanlanmagan" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Faqat JPG, PNG yoki WebP formatlar qabul qilinadi" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Fayl hajmi 5 MB dan oshmasligi kerak" },
        { status: 400 }
      );
    }

    const ext = EXT_MAP[file.type];
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "covers");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/covers/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Cover upload error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
