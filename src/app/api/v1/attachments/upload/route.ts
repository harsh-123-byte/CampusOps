import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Attachment } from "@/models/Attachment";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestId = formData.get("requestId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported types: PDF, JPG, JPEG, PNG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit. Please compress or choose a smaller file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fileUrl = `/uploads/${safeName}`;

    // On local environments, attempt to cache to public/uploads
    // On Vercel / serverless lambdas (read-only filesystem), disk writes fail and are safely caught
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeName);
      await writeFile(filePath, buffer);
    } catch (diskErr: any) {
      console.log(
        "Serverless environment detected (read-only filesystem): saving document directly to MongoDB Atlas storage."
      );
    }

    await connectDB();
    const attachment = await Attachment.create({
      requestId: requestId || undefined,
      uploaderId: session.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: fileUrl,
      storageProvider: "LOCAL",
      fileData: buffer.toString("base64"),
    });

    const attachmentObj = attachment.toObject();
    delete (attachmentObj as any).fileData;

    return NextResponse.json(
      {
        success: true,
        attachment: attachmentObj,
        message: "File uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
