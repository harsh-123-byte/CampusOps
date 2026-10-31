import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RequestService } from "@/services/request.service";
import { UpdateRequestSchema } from "@/schemas/request.schema";
import { connectDB } from "@/lib/db";
import { ServiceRequest } from "@/models/ServiceRequest";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const request = await RequestService.getRequestById(id);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Authorization check
    const studentId = (request.studentId as any)?._id?.toString() || request.studentId.toString();
    if (session.role === "STUDENT" && studentId !== session.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ request });
  } catch (error: any) {
    console.error("Get request error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch request" }, { status: 500 });
  }
}

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
    const body = await req.json();
    const result = UpdateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const request = await ServiceRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (session.role === "STUDENT" && request.studentId.toString() !== session.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!["DRAFT", "CHANGES_REQUESTED"].includes(request.status) && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: `Cannot edit request in status ${request.status}` },
        { status: 400 }
      );
    }

    if (result.data.title) request.title = result.data.title;
    if (result.data.description) request.description = result.data.description;
    if (result.data.departmentId)
      request.departmentId = new mongoose.Types.ObjectId(result.data.departmentId);
    if (result.data.priority) request.priority = result.data.priority;
    if (result.data.formData) request.formData = result.data.formData;
    if (result.data.attachments)
      request.attachments = result.data.attachments.map((a) => new mongoose.Types.ObjectId(a));

    await request.save();

    return NextResponse.json({ success: true, request, message: "Request updated successfully" });
  } catch (error: any) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: error.message || "Failed to update request" }, { status: 500 });
  }
}
