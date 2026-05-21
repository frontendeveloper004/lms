import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { notificationService } from "@/lib/notification-service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
    }

    const { notificationId } = await params;

    await notificationService.markAsRead(notificationId, session.userId as string);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Bildirishnoma topilmadi") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Ruxsat etilmagan") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
