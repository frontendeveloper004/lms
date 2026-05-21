import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { notificationService } from "@/lib/notification-service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(session.userId as string);

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
