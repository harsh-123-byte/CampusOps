import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const adminUser = await User.findOne({ role: "ADMIN" }).select("name email createdAt");

    return NextResponse.json({
      adminExists: !!adminUser,
      adminEmail: adminUser ? adminUser.email : null,
      adminName: adminUser ? adminUser.name : null,
    });
  } catch (error: any) {
    console.error("Check admin exists error:", error);
    return NextResponse.json({ adminExists: false }, { status: 500 });
  }
}

