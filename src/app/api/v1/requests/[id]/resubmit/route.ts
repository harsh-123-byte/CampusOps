import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RequestService } from "@/services/request.service";
import { UpdateRequestSchema } from "@/schemas/request.schema";

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
    const body = await req.json();
    const result = UpdateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const request = await RequestService.resubmitRequest(id, session.id, result.data);

    return NextResponse.json({
      success: true,
      request,
      message: "Application resubmitted successfully with your updates",
    });
  } catch (error: any) {
    console.error("Resubmit error:", error);
    return NextResponse.json({ error: error.message || "Failed to resubmit request" }, { status: 400 });
  }
}
