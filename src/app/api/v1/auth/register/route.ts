import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { RegisterSchema } from "@/schemas/auth.schema";
import { AuditService } from "@/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, departmentId, rollNumber, employeeId, phone } =
      result.data;

    // Security rule: Public registration cannot create ADMIN accounts
    if (role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin accounts cannot be registered publicly." },
        { status: 403 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "STUDENT",
      departmentId: departmentId || undefined,
      rollNumber,
      employeeId,
      phone,
      isActive: true,
    });

    const sessionPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      departmentId: newUser.departmentId?.toString(),
      rollNumber: newUser.rollNumber,
      employeeId: newUser.employeeId,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json(
      {
        success: true,
        user: sessionPayload,
        message: "Registration successful",
      },
      { status: 201 }
    );

    setSessionCookie(response, token);

    await AuditService.logAction({
      actorId: newUser._id.toString(),
      action: "USER_REGISTER",
      entityType: "AUTH",
      entityId: newUser._id.toString(),
      details: { email: newUser.email, role: newUser.role },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
