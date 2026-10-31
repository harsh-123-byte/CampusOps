import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Department } from "@/models/Department";
import { AIService } from "@/services/ai.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    await connectDB();
    const [totalRequests, pendingCount, approvedCount, rejectedCount, depts] = await Promise.all([
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: { $in: ["SUBMITTED", "IN_REVIEW"] } }),
      ServiceRequest.countDocuments({ status: "APPROVED" }),
      ServiceRequest.countDocuments({ status: "REJECTED" }),
      Department.find({ isActive: true }).lean(),
    ]);

    const departmentBreakdown = await Promise.all(
      depts.map(async (d) => {
        const count = await ServiceRequest.countDocuments({ departmentId: d._id });
        return { name: d.name, count, avgHours: 24 };
      })
    );

    const insights = await AIService.getAdminInsights({
      totalRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
      departmentBreakdown,
    });

    return NextResponse.json({
      success: true,
      insights: insights.data,
      isFallback: insights.isFallback,
      provider: insights.isFallback ? "Deterministic Rule Engine (Fallback)" : "Google Gemini 1.5 Flash",
    });
  } catch (error: any) {
    console.error("AI insights error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI insights" }, { status: 500 });
  }
}
