import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campusops";

async function clean() {
  console.log("Connecting to MongoDB Atlas at:", MONGODB_URI.replace(/:([^:@]+)@/, ":****@"));
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../src/models/User");
  const { ServiceRequest } = await import("../src/models/ServiceRequest");
  const { ApprovalStep } = await import("../src/models/ApprovalStep");
  const { Notification } = await import("../src/models/Notification");
  const { AuditLog } = await import("../src/models/AuditLog");
  const { AIAnalysis } = await import("../src/models/AIAnalysis");
  const { Attachment } = await import("../src/models/Attachment");

  // Find all demo / seed users
  const demoUsers = await User.find({
    $or: [
      { email: { $regex: /campusops\.demo/i } },
      { email: { $regex: /example\.com/i } },
      { name: { $in: ["Dr. Eleanor Vance", "Aiden Scott", "Prof. Marcus Thorne", "Dr. Sarah Jenkins", "Maya Patel"] } },
    ],
  });

  const demoUserIds = demoUsers.map((u) => u._id);
  console.log(`Found ${demoUserIds.length} dummy user accounts to remove.`);

  // Find all dummy / seed requests
  const demoRequests = await ServiceRequest.find({
    $or: [
      { studentId: { $in: demoUserIds } },
      { requestNumber: { $regex: /^REQ-2026-000[0-9]/i } },
    ],
  });

  const demoReqIds = demoRequests.map((r) => r._id);
  console.log(`Found ${demoReqIds.length} dummy requests to remove.`);

  if (demoReqIds.length > 0) {
    await ApprovalStep.deleteMany({ requestId: { $in: demoReqIds } });
    await AIAnalysis.deleteMany({ requestId: { $in: demoReqIds } });
    await Attachment.deleteMany({ requestId: { $in: demoReqIds } });
    await ServiceRequest.deleteMany({ _id: { $in: demoReqIds } });
  }

  if (demoUserIds.length > 0) {
    await Notification.deleteMany({ userId: { $in: demoUserIds } });
    await AuditLog.deleteMany({ actorId: { $in: demoUserIds } });
    await User.deleteMany({ _id: { $in: demoUserIds } });
  }

  // Remove any remaining dummy requests or audit logs
  await ServiceRequest.deleteMany({ requestNumber: { $regex: /^REQ-2026-000/i } });
  await AuditLog.deleteMany({ "details.email": { $regex: /campusops\.demo/i } });

  // List remaining real users in the database
  const remainingUsers = await User.find({}, "name email role isActive");
  console.log("\n==========================================");
  console.log("✅ DUMMY DATA PURGE COMPLETE!");
  console.log(`Remaining REAL Users in Database (${remainingUsers.length}):`);
  remainingUsers.forEach((u) => {
    console.log(` • [${u.role}] ${u.name} (${u.email}) - Active: ${u.isActive}`);
  });
  console.log("==========================================\n");

  process.exit(0);
}

clean().catch((e) => {
  console.error("Error cleaning demo users:", e.message);
  process.exit(1);
});
