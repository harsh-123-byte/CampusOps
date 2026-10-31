import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await NotificationService.markAllAsRead(session.id);
    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json({ error: error.message || "Failed to mark all as read" }, { status: 500 });
  }
}
