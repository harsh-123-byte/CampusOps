import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AIService } from "@/services/ai.service";
import { z } from "zod";

const AssistInputSchema = z.object({
  requestType: z.string().optional(),
  draftTitle: z.string().optional(),
  draftDescription: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = AssistInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const advice = await AIService.getAssistantAdvice(result.data);

    return NextResponse.json({
      success: true,
      data: advice.data,
      isFallback: advice.isFallback,
      provider: advice.isFallback ? "Deterministic Rule Engine (Fallback)" : "Google Gemini 1.5 Flash",
    });
  } catch (error: any) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch AI assistance" }, { status: 500 });
  }
}
