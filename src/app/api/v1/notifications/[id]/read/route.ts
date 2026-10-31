import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const notification = await NotificationService.markAsRead(id, session.id);

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: error.message || "Failed to mark as read" }, { status: 500 });
  }
}
