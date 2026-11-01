import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ChatService } from "@/services/chat.service";
import connectDB from "@/lib/db";
import { ServiceRequest } from "@/models/ServiceRequest";
import { z } from "zod";

const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { message, history } = validation.data;

    // Connect to database to fetch user context
    await connectDB();

    let contextRequests: Array<{
      requestNumber: string;
      title: string;
      type: string;
      status: string;
      priority: string;
      createdAt?: string | Date;
      changeRequestComment?: string;
      rejectionReason?: string;
    }> = [];
    let pendingCount = 0;
    let totalCount = 0;

    try {
      if (session.role === "STUDENT") {
        contextRequests = await ServiceRequest.find({ studentId: session.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("requestNumber title type status priority createdAt changeRequestComment rejectionReason")
          .lean();
      } else if (session.role === "FACULTY") {
        const [pending, reqs] = await Promise.all([
          ServiceRequest.countDocuments({ status: { $in: ["SUBMITTED", "IN_REVIEW"] } }),
          ServiceRequest.find({ status: { $in: ["SUBMITTED", "IN_REVIEW"] } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("requestNumber title type status priority createdAt")
            .lean(),
        ]);
        pendingCount = pending;
        contextRequests = reqs;
      } else if (session.role === "ADMIN") {
        const [total, pending, reqs] = await Promise.all([
          ServiceRequest.countDocuments(),
          ServiceRequest.countDocuments({ status: { $in: ["SUBMITTED", "IN_REVIEW"] } }),
          ServiceRequest.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("requestNumber title type status priority createdAt")
            .lean(),
        ]);
        totalCount = total;
        pendingCount = pending;
        contextRequests = reqs;
      }
    } catch (dbErr) {
      console.warn("Could not retrieve live context from database for chat:", dbErr);
    }

    const result = await ChatService.chatWithAssistant({
      message,
      history,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        departmentName: session.departmentName,
        rollNumber: session.rollNumber,
      },
      contextData: {
        requests: contextRequests,
        pendingCount,
        totalCount,
      },
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      isFallback: result.isFallback,
      provider: result.provider,
      suggestions: result.suggestions,
    });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat message";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
