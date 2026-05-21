import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET /api/messages/unread-count — total unread messages for current user
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: {
      receiverId: session.userId,
      isRead: false,
    },
  });

  return NextResponse.json({ count });
}
