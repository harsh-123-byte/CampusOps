import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getUserNotifications(session.id, 30),
      NotificationService.getUnreadCount(session.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
