import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { AuditService } from "@/services/audit.service";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    await connectDB();
    const { purgeDemoData } = await import("@/lib/cleanup");
    await purgeDemoData();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const query: any = {
      email: { $not: /@(campusops\.demo|example\.com)$/i },
    };
    if (role && role !== "ALL") query.role = role;
    if (search && search.trim().length > 0) {
      const reg = new RegExp(search.trim(), "i");
      query.$and = [
        { email: { $not: /@(campusops\.demo|example\.com)$/i } },
        { $or: [{ name: reg }, { email: reg }, { rollNumber: reg }, { employeeId: reg }] },
      ];
    }

    const users = await User.find(query)
      .populate("departmentId", "code name")
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, departmentId, rollNumber, employeeId, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role === "ADMIN") {
      return NextResponse.json(
        { error: "Only one single administrator is permitted in the system. You cannot create additional admin accounts." },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      departmentId: departmentId ? new mongoose.Types.ObjectId(departmentId) : undefined,
      rollNumber,
      employeeId,
      phone,
      isActive: true,
    });

    await AuditService.logAction({
      actorId: session.id,
      action: "ADMIN_CREATE_USER",
      entityType: "USER",
      entityId: user._id.toString(),
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, isActive, role, departmentId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (typeof isActive === "boolean") user.isActive = isActive;
    if (role) {
      if (role === "ADMIN" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Cannot promote user to Admin. Only one administrator is permitted." },
          { status: 400 }
        );
      }
      user.role = role;
    }
    if (departmentId !== undefined) {
      user.departmentId = departmentId ? new mongoose.Types.ObjectId(departmentId) : undefined;
    }

    await user.save();

    await AuditService.logAction({
      actorId: session.id,
      action: "ADMIN_UPDATE_USER",
      entityType: "USER",
      entityId: userId,
      details: { isActive, role, departmentId },
    });

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
