import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { validateBody, loginSchema } from "@/lib/validations";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { data, error } = await validateBody(req, loginSchema);
    if (error) return error;

    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        passwordHash: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    }

    const response = NextResponse.json(
      { message: "Muvaffaqiyatli kirdingiz", role: user.role },
      { status: 200 }
    );

    await setAuthCookies(
      response,
      { userId: user.id, role: user.role },
      user.tokenVersion
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
