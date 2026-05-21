import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { notificationService } from "@/lib/notification-service";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
    }

    await notificationService.markAllAsRead(session.userId as string);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
