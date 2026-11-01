import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const faculty = await User.find({ role: "FACULTY", isActive: true })
      .select("name email departmentId employeeId")
      .populate("departmentId", "code name")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ faculty });
  } catch (error) {
    console.error("Fetch faculty error:", error);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}
