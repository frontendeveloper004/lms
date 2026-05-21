import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { notifyUser } from "@/app/api/messages/sse/route";

// PATCH /api/messages/[messageId] — edit message text
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (message.senderId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (message.deletedAt) {
    return NextResponse.json({ error: "Cannot edit deleted message" }, { status: 400 });
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { text: text.trim(), isEdited: true },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  await Promise.all([
    notifyUser(message.receiverId, { type: "message_updated", message: updated }),
    notifyUser(message.senderId,   { type: "message_updated", message: updated }),
  ]);

  return NextResponse.json(updated);
}

// DELETE /api/messages/[messageId] — soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (message.senderId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  await Promise.all([
    notifyUser(message.receiverId, { type: "message_updated", message: deleted }),
    notifyUser(message.senderId,   { type: "message_updated", message: deleted }),
  ]);

  return NextResponse.json({ success: true });
}
