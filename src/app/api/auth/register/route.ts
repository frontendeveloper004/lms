import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { validateBody, registerSchema } from "@/lib/validations";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { data, error } = await validateBody(req, registerSchema);
    if (error) return error;

    const { name, email, password, role, subjectType } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email bilan allaqachon ro'yxatdan o'tilgan" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, subjectType },
      select: { id: true, role: true, tokenVersion: true },
    });

    const response = NextResponse.json(
      { message: "Muvaffaqiyatli ro'yxatdan o'tdingiz", role: user.role },
      { status: 201 }
    );

    await setAuthCookies(
      response,
      { userId: user.id, role: user.role },
      user.tokenVersion
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
