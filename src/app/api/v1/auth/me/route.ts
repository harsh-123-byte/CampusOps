import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.id).populate("departmentId", "code name").lean();

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const dept = user.departmentId as any;

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: dept?._id?.toString(),
        departmentName: dept?.name,
        departmentCode: dept?.code,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
