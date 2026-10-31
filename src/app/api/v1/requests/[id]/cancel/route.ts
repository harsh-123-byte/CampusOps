import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RequestService } from "@/services/request.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const request = await RequestService.cancelRequest(id, session.id, session.role);

    return NextResponse.json({
      success: true,
      request,
      message: "Request cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel request error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel request" }, { status: 400 });
  }
}
