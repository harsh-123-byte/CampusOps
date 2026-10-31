import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;

    const logs = await AuditService.getRecentLogs(limit, { entityType, action });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: error.message || "Failed to load audit logs" }, { status: 500 });
  }
}
