import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";
import { AuditService } from "@/services/audit.service";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    await connectDB();
    const departments = await Department.find()
      .populate("headOfDepartmentId", "name email")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ departments });
  } catch (error: any) {
    console.error("Admin depts error:", error);
    return NextResponse.json({ error: error.message || "Failed to load departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, description, headOfDepartmentId } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Department code and name are required" }, { status: 400 });
    }

    await connectDB();
    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Department with this code already exists" }, { status: 409 });
    }

    const dept = await Department.create({
      code: code.toUpperCase(),
      name,
      description,
      headOfDepartmentId: headOfDepartmentId ? new mongoose.Types.ObjectId(headOfDepartmentId) : undefined,
      isActive: true,
    });

    await AuditService.logAction({
      actorId: session.id,
      action: "ADMIN_CREATE_DEPARTMENT",
      entityType: "DEPARTMENT",
      entityId: dept._id.toString(),
      details: { code: dept.code, name: dept.name },
    });

    return NextResponse.json({ success: true, department: dept, message: "Department created" }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create dept error:", error);
    return NextResponse.json({ error: error.message || "Failed to create department" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { departmentId, name, description, headOfDepartmentId, isActive } = body;

    if (!departmentId) {
      return NextResponse.json({ error: "departmentId is required" }, { status: 400 });
    }

    await connectDB();
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    if (name) dept.name = name;
    if (description !== undefined) dept.description = description;
    if (headOfDepartmentId !== undefined) {
      dept.headOfDepartmentId = headOfDepartmentId ? new mongoose.Types.ObjectId(headOfDepartmentId) : undefined;
    }
    if (typeof isActive === "boolean") dept.isActive = isActive;

    await dept.save();

    await AuditService.logAction({
      actorId: session.id,
      action: "ADMIN_UPDATE_DEPARTMENT",
      entityType: "DEPARTMENT",
      entityId: departmentId,
      details: { name, isActive },
    });

    return NextResponse.json({ success: true, department: dept, message: "Department updated" });
  } catch (error: any) {
    console.error("Admin update dept error:", error);
    return NextResponse.json({ error: error.message || "Failed to update department" }, { status: 500 });
  }
}
