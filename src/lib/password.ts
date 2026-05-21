import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

type ChangePasswordResult =
  | { success: true }
  | { error: string; status: number };

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) return { error: "User not found", status: 404 };

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) return { error: "Joriy parol noto'g'ri", status: 400 };

  if (newPassword.length < 8) {
    return { error: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak", status: 400 };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
