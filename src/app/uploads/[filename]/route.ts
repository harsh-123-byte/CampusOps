import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import { Attachment } from "@/models/Attachment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, safeFilename);

    let fileBuffer: Buffer | null = null;
    let contentType = "application/octet-stream";

    // 1. Try reading from local disk if available
    try {
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
      }
    } catch {
      // Ignored in serverless environments
    }

    // 2. Fetch from MongoDB Atlas base64 storage if not on disk
    if (!fileBuffer) {
      await connectDB();
      const attachment = await Attachment.findOne({
        $or: [
          { url: `/uploads/${safeFilename}` },
          { url: `/uploads/${filename}` },
          { url: safeFilename },
          { fileName: safeFilename },
          { fileName: filename },
        ],
      });

      if (attachment && (attachment as any).fileData) {
        fileBuffer = Buffer.from((attachment as any).fileData, "base64");
        // Attempt disk caching only if filesystem is writable
        try {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          fs.writeFileSync(filePath, fileBuffer);
        } catch {
          // Read-only filesystem on Vercel is expected
        }
      }
    }

    if (!fileBuffer) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>File Not Found</h2>
          <p>The requested document <code>${safeFilename}</code> could not be found.</p>
        </body></html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Determine correct MIME type
    const ext = path.extname(safeFilename).toLowerCase();
    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".svg") {
      contentType = "image/svg+xml";
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error("Error serving uploaded file:", err);
    return new NextResponse("Error serving document", { status: 500 });
  }
}
