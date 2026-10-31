import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";

export async function GET() {
  try {
    await connectDB();
    const departments = await Department.find({ isActive: true })
      .populate("headOfDepartmentId", "name email")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Departments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}
