import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { notifyUser } from "@/app/api/messages/sse/route";
import { validateBody, sendMessageSchema } from "@/lib/validations";

// GET /api/messages?with=userId — fetch conversation between current user and another user
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");
  if (!withUserId) return NextResponse.json({ error: "Missing 'with' param" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: withUserId },
        { senderId: withUserId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Mark messages sent to current user as read
  await prisma.message.updateMany({
    where: {
      senderId: withUserId,
      receiverId: session.userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  const parsedMessages = messages.map((m) => ({
    ...m,
    reactions: (() => { try { return JSON.parse(m.reactions as string); } catch { return {}; } })(),
  }));

  return NextResponse.json(parsedMessages);
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await validateBody(req, sendMessageSchema);
  if (error) return error;

  const { receiverId, text } = data;

  // Only allow teacher↔student messaging
  // Eski yondashuv: 2 ta alohida findUnique — yangi: bitta findMany
  const users = await prisma.user.findMany({
    where: { id: { in: [session.userId, receiverId] } },
    select: { id: true, role: true },
  });

  const sender = users.find((u) => u.id === session.userId);
  const receiver = users.find((u) => u.id === receiverId);

  if (!sender || !receiver) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const validPair =
    (sender.role === "TEACHER" && receiver.role === "STUDENT") ||
    (sender.role === "STUDENT" && receiver.role === "TEACHER");

  if (!validPair) {
    return NextResponse.json({ error: "Messaging only allowed between teacher and student" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      text: text.trim(),
      senderId: session.userId,
      receiverId,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  const messageWithParsed = {
    ...message,
    reactions: (() => { try { return JSON.parse(message.reactions as string); } catch { return {}; } })(),
  };

  // Notify receiver via SSE — await qilish shart (Redis'ga yozib ulgurishini kutamiz)
  await Promise.all([
    notifyUser(receiverId, { type: "new_message", message: messageWithParsed }),           // receiver: in-memory + Redis fallback
    notifyUser(session.userId, { type: "new_message", message: messageWithParsed }, { skipRedis: true }), // sender: faqat in-memory (duplicate oldini olish)
  ]);

  return NextResponse.json(messageWithParsed, { status: 201 });
}
