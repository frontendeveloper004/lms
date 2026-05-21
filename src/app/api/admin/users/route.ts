import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { taughtCourses: true, enrollments: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const VALID_ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }

    // Role validatsiyasi — ixtiyoriy string qabul qilinmasligi kerak
    if (!VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: `Noto'g'ri role. Ruxsat etilgan: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as ValidRole },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
