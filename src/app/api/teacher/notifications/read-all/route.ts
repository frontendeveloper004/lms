import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { notificationService } from "@/lib/notification-service";

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const updatedCount = await notificationService.markAllAsRead(session.userId as string);

    return NextResponse.json({ success: true, updatedCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
