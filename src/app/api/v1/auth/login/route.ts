import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Department } from "@/models/Department";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { LoginSchema } from "@/schemas/auth.schema";
import { AuditService } from "@/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email: email.toLowerCase() }).populate("departmentId");

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is disabled. Please contact administrator." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const dept = user.departmentId as any;
    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: dept?._id?.toString(),
      departmentName: dept?.name,
      rollNumber: user.rollNumber,
      employeeId: user.employeeId,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: "Login successful",
    });

    setSessionCookie(response, token);

    await AuditService.logAction({
      actorId: user._id.toString(),
      action: "USER_LOGIN",
      entityType: "AUTH",
      entityId: user._id.toString(),
      details: { email: user.email, role: user.role },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
