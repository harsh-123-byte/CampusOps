import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AIService } from "@/services/ai.service";
import { z } from "zod";

const ClassifyInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ClassifyInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const classification = await AIService.classifyRequest(result.data.title, result.data.description);

    return NextResponse.json({
      success: true,
      data: classification.data,
      isFallback: classification.isFallback,
      provider: classification.isFallback ? "Deterministic Rule Engine (Fallback)" : "Google Gemini 1.5 Flash",
    });
  } catch (error: any) {
    console.error("AI classify error:", error);
    return NextResponse.json({ error: error.message || "Failed to classify request" }, { status: 500 });
  }
}
