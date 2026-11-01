import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { purgeDemoData } from "@/lib/cleanup";

export async function POST() {
  try {
    await connectDB();
    await purgeDemoData();
    return NextResponse.json({
      success: true,
      message: "All dummy/demo accounts and requests have been purged from the database.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

