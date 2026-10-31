import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RequestService } from "@/services/request.service";
import { CreateRequestSchema } from "@/schemas/request.schema";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const result = await RequestService.getRequests({
      role: session.role,
      userId: session.id,
      departmentId: session.role === "FACULTY" ? session.departmentId : departmentId,
      status,
      type,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = CreateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const request = await RequestService.createRequest(session.id, result.data);

    return NextResponse.json(
      {
        success: true,
        request,
        message:
          result.data.status === "SUBMITTED"
            ? "Request submitted successfully"
            : "Draft saved successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 500 });
  }
}
