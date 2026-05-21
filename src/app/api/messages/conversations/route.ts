import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { areUsersOnline } from "@/lib/redis-pubsub";

// GET /api/messages/conversations — list all people current user has chatted with
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Bitta query bilan barcha unique partner ID'larni olish ───────────────
  // Eski yondashuv: 2 ta alohida findMany + Set
  // Yangi yondashuv: bitta raw-style aggregation
  const [sentPartners, receivedPartners] = await Promise.all([
    prisma.message.findMany({
      where: { senderId: session.userId, deletedAt: null },
      select: { receiverId: true },
      distinct: ["receiverId"],
    }),
    prisma.message.findMany({
      where: { receiverId: session.userId, deletedAt: null },
      select: { senderId: true },
      distinct: ["senderId"],
    }),
  ]);

  const partnerIds = new Set<string>();
  sentPartners.forEach((m) => partnerIds.add(m.receiverId));
  receivedPartners.forEach((m) => partnerIds.add(m.senderId));

  if (partnerIds.size === 0) return NextResponse.json([]);

  const partnerIdArr = Array.from(partnerIds);

  // ── Barcha ma'lumotlarni parallel batch query'lar bilan olish ────────────
  // Eski yondashuv: har bir partner uchun 4 ta query (N*4 queries)
  // Yangi yondashuv: 4 ta batch query (4 queries jami)

  const [lastMessages, unreadCounts, partners, onlineStatuses] = await Promise.all([
    // Har bir partner bilan oxirgi xabar
    prisma.message.findMany({
      where: {
        OR: partnerIdArr.flatMap((partnerId) => [
          { senderId: session.userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: session.userId },
        ]),
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        senderId: true,
        receiverId: true,
        text: true,
        createdAt: true,
      },
    }),

    // O'qilmagan xabarlar soni — barcha partnerlar uchun bitta query
    prisma.message.groupBy({
      by: ["senderId"],
      where: {
        senderId: { in: partnerIdArr },
        receiverId: session.userId,
        isRead: false,
        deletedAt: null,
      },
      _count: { id: true },
    }),

    // Barcha partner profillarini bitta query bilan
    prisma.user.findMany({
      where: { id: { in: partnerIdArr } },
      select: { id: true, name: true, avatar: true, role: true },
    }),

    // Barcha online statuslarni bitta Redis MGET bilan
    areUsersOnline(partnerIdArr),
  ]);

  // ── Lookup map'lar ────────────────────────────────────────────────────────
  const partnerMap = new Map(partners.map((p) => [p.id, p]));
  const unreadMap = new Map(
    unreadCounts.map((u) => [u.senderId, u._count.id])
  );

  // Har bir partner bilan oxirgi xabarni topish
  const lastMessageMap = new Map<string, (typeof lastMessages)[0]>();
  for (const msg of lastMessages) {
    const partnerId =
      msg.senderId === session.userId ? msg.receiverId : msg.senderId;
    if (!lastMessageMap.has(partnerId)) {
      lastMessageMap.set(partnerId, msg);
    }
  }

  // ── Natijalarni yig'ish ───────────────────────────────────────────────────
  const conversations = partnerIdArr
    .map((partnerId) => {
      const partner = partnerMap.get(partnerId);
      if (!partner) return null;

      const isOnline = onlineStatuses.get(partnerId) ?? false;
      const lastMessage = lastMessageMap.get(partnerId) ?? null;
      const unreadCount = unreadMap.get(partnerId) ?? 0;

      return {
        partner: {
          ...partner,
          isOnline,
          lastSeen: isOnline ? new Date() : null,
        },
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
      };
    })
    .filter(Boolean);

  // Sort by last message time (yangi xabar birinchi)
  conversations.sort((a, b) => {
    const aTime = a?.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b?.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });

  return NextResponse.json(conversations);
}
