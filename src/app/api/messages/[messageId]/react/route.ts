import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { notifyUser } from "@/app/api/messages/sse/route";
import { validateBody, reactMessageSchema } from "@/lib/validations";

// POST /api/messages/[messageId]/react — toggle reaction
// body: { emoji: "👍" }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const { data, error } = await validateBody(req, reactMessageSchema);
  if (error) return error;
  const { emoji } = data;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only sender and receiver can react
  const isParticipant =
    message.senderId === session.userId || message.receiverId === session.userId;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Parse existing reactions: { "👍": ["userId1", ...] }
  let reactions: Record<string, string[]> = {};
  try {
    const parsed = JSON.parse(message.reactions as string);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      reactions = parsed as Record<string, string[]>;
    }
  } catch { reactions = {}; }

  const users = reactions[emoji] ?? [];
  const alreadyReacted = users.includes(session.userId);

  if (alreadyReacted) {
    // Toggle off
    const filtered = users.filter((id) => id !== session.userId);
    if (filtered.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = filtered;
    }
  } else {
    // Toggle on — remove user from any other emoji first (one reaction per user)
    for (const key of Object.keys(reactions)) {
      reactions[key] = reactions[key].filter((id) => id !== session.userId);
      if (reactions[key].length === 0) delete reactions[key];
    }
    reactions[emoji] = [...(reactions[emoji] ?? []), session.userId];
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { reactions: JSON.stringify(reactions) },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  const updatedWithParsed = {
    ...updated,
    reactions: (() => { try { return JSON.parse(updated.reactions as string); } catch { return {}; } })(),
  };

  await Promise.all([
    notifyUser(message.senderId,   { type: "message_updated", message: updatedWithParsed }),
    notifyUser(message.receiverId, { type: "message_updated", message: updatedWithParsed }),
  ]);

  return NextResponse.json(updatedWithParsed);
}
