import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AIService } from "@/services/ai.service";
import { z } from "zod";

const ExtractInputSchema = z.object({
  text: z.string().min(1, "Document text is required"),
  fileName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ExtractInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const extraction = await AIService.extractDocumentInfo(result.data.text, result.data.fileName);

    return NextResponse.json({
      success: true,
      data: extraction.data,
      isFallback: extraction.isFallback,
      provider: extraction.isFallback ? "Deterministic Rule Engine (Fallback)" : "Google Gemini 1.5 Flash",
    });
  } catch (error: any) {
    console.error("AI extract error:", error);
    return NextResponse.json({ error: error.message || "Failed to extract document data" }, { status: 500 });
  }
}
