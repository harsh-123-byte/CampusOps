import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const ReviewSubmissionSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  formData: z.record(z.string(), z.any()).optional().default({}),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number().optional(),
      })
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ReviewSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, title, description, formData, attachments } = parsed.data;

    const attachmentNames = attachments.map((a) => a.fileName);
    const apiKey = process.env.GEMINI_API_KEY;

    let geminiResult: any = null;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const models = [
          process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
          "gemini-3.1-flash-lite",
          "gemini-flash-latest",
          "gemini-3.8-flash",
        ];

        const prompt = `You are the CampusOps Pre-Submission Auditor.
Analyze this student's request before they submit it to faculty approvers:
- Request Type: ${type}
- Title: ${title}
- Description: ${description}
- Form Fields: ${JSON.stringify(formData)}
- Uploaded Files (${attachmentNames.length}): ${attachmentNames.join(", ") || "None"}

REQUIREMENTS RULES:
- NOC: Requires company offer letter with start/end dates and stipend details.
- BONAFIDE: Requires Student ID card and current semester fee clearance receipt.
- EVENT_PERMISSION: Requires event proposal/schedule and faculty coordinator endorsement.
- LAB_ACCESS: Requires project summary and supervisor approval note.
- MAINTENANCE: Requires room location and issue description/photo.
- SCHOLARSHIP (under BONAFIDE or OTHER): Requires semester marksheets and income certificate (if means-based).

Return STRICT JSON matching this format:
{
  "readinessScore": number (0 to 100),
  "status": "READY" | "NEEDS_ATTENTION" | "INCOMPLETE",
  "verifiedAttachments": string[],
  "missingAttachments": string[],
  "delayRisks": string[],
  "actionableTips": string[],
  "summary": string
}`;

        for (const m of models) {
          try {
            const timeoutMs = 12000;
            const generatePromise = ai.models.generateContent({
              model: m,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
            );

            const response = await Promise.race([generatePromise, timeoutPromise]);

            if (response.text) {
              geminiResult = JSON.parse(response.text);
              break;
            }
          } catch (mErr) {
            console.warn(`Review model ${m} skipped (${mErr})`);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini submission review error, falling back to rule engine:", geminiErr);
      }
    }

    // Deterministic fallback if Gemini is offline
    if (!geminiResult) {
      const lowerNames = attachmentNames.map((n) => n.toLowerCase());
      const hasOffer = lowerNames.some((n) => n.includes("offer") || n.includes("letter") || n.includes("intern"));
      const hasId = lowerNames.some((n) => n.includes("id") || n.includes("card") || n.includes("student"));
      const hasFee = lowerNames.some((n) => n.includes("fee") || n.includes("receipt") || n.includes("challan"));
      const hasMarksheet = lowerNames.some((n) => n.includes("mark") || n.includes("grade") || n.includes("transcript"));
      const hasProposal = lowerNames.some((n) => n.includes("proposal") || n.includes("event") || n.includes("schedule"));

      const verified: string[] = [];
      const missing: string[] = [];
      const delayRisks: string[] = [];
      const tips: string[] = [];
      let score = 85;

      if (type === "NOC") {
        if (hasOffer) {
          verified.push("Company Internship Offer Letter");
        } else {
          missing.push("Official Offer Letter on company letterhead");
          delayRisks.push("Reviewers will delay or request changes if the offer letter is not attached.");
          score -= 40;
        }
        if (!formData.companyName) {
          missing.push("Host Company Name");
          score -= 15;
        }
        if (!formData.internshipDuration) {
          missing.push("Internship Start & End Dates");
          delayRisks.push("Faculty requires exact date ranges to verify academic attendance.");
          score -= 15;
        }
        tips.push("Make sure the offer letter specifies working hours (hybrid, remote, or full-time).");
      } else if (type === "BONAFIDE") {
        if (hasId) {
          verified.push("Student ID Card Copy");
        } else {
          missing.push("Current Semester Student ID Card");
          score -= 25;
        }
        if (hasFee) {
          verified.push("Fee Payment Clearance Receipt");
        } else {
          missing.push("Current Semester Fee Receipt");
          delayRisks.push("Administration office checks fee clearance before signing bonafide.");
          score -= 20;
        }
        if (!formData.purpose) {
          missing.push("Purpose of Bonafide Certificate");
          score -= 15;
        }
        tips.push("State whether this certificate is for Education Loan, Passport, Visa, or Bus Pass.");
      } else if (type === "EVENT_PERMISSION") {
        if (hasProposal) {
          verified.push("Event Proposal & Agenda");
        } else {
          missing.push("Detailed Event Proposal document");
          delayRisks.push("Dean office will not allocate auditoriums without an event proposal.");
          score -= 35;
        }
        if (!formData.eventName) {
          missing.push("Official Event Name");
          score -= 15;
        }
        tips.push("Include estimated student headcount to ensure hall capacity.");
      } else {
        if (attachments.length > 0) {
          verified.push(`${attachments.length} Supporting Document(s)`);
        } else {
          missing.push("At least one supporting document or proof");
          delayRisks.push("Applications without documentation experience slower review times.");
          score -= 25;
        }
        tips.push("Ensure your description covers dates, purpose, and required departmental sign-offs.");
      }

      score = Math.max(20, Math.min(100, score));

      geminiResult = {
        readinessScore: score,
        status: score >= 85 ? "READY" : score >= 60 ? "NEEDS_ATTENTION" : "INCOMPLETE",
        verifiedAttachments: verified.length > 0 ? verified : ["Basic Application Info Formulated"],
        missingAttachments: missing,
        delayRisks: delayRisks.length > 0 ? delayRisks : ["No major delay factors detected."],
        actionableTips: tips,
        summary:
          score >= 85
            ? "Your application is well-structured and has high probability of swift approval."
            : "Review the missing items above to avoid revisions from your faculty reviewer.",
      };
    }

    return NextResponse.json({
      success: true,
      review: geminiResult,
      provider: apiKey ? "Google Gemini 3.8 Flash" : "CampusOps Verification Engine",
    });
  } catch (error: any) {
    console.error("AI review submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review submission" },
      { status: 500 }
    );
  }
}
