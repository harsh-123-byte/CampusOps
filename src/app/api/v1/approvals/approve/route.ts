import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { WorkflowService } from "@/services/workflow.service";
import { ApproveActionSchema } from "@/schemas/request.schema";
import { z } from "zod";

const BodySchema = ApproveActionSchema.extend({
  requestId: z.string().min(1, "requestId is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "FACULTY" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only faculty or administrators can approve requests" }, { status: 403 });
    }

    const body = await req.json();
    const result = BodySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const { requestId, comments } = result.data;
    const updatedRequest = await WorkflowService.approve(requestId, session.id, comments);

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Approval recorded successfully",
    });
  } catch (error: any) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: error.message || "Failed to approve request" }, { status: 400 });
  }
}
