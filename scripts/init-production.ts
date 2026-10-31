import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Department } from "../src/models/Department";
import { ServiceRequest } from "../src/models/ServiceRequest";
import { ApprovalStep } from "../src/models/ApprovalStep";
import { Notification } from "../src/models/Notification";
import { AuditLog } from "../src/models/AuditLog";
import { AIAnalysis } from "../src/models/AIAnalysis";
import { Attachment } from "../src/models/Attachment";
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

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function initProduction() {
  const args = process.argv.slice(2);
  const adminEmail = args[0] || "admin@campusops.edu";
  const adminPassword = args[1] || "Admin@2026!";
  const adminName = args[2] || "System Administrator";

  console.log("🚀 Initializing CampusOps Production Database...");
  console.log("Connecting to:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  // 1. Clear out demo transactions and mock data
  console.log("Clearing all demo requests, approval steps, notifications, and mock users...");
  await Promise.all([
    ServiceRequest.deleteMany({}),
    ApprovalStep.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    AIAnalysis.deleteMany({}),
    Attachment.deleteMany({}),
    User.deleteMany({}),
  ]);

  // 2. Ensure official departments exist
  console.log("Setting up core institution departments...");
  const coreDepartments = [
    {
      name: "Computer Science & Engineering",
      code: "CSE",
      description: "Department of Computer Science & Engineering",
    },
    {
      name: "Electronics & Communication Engineering",
      code: "ECE",
      description: "Department of Electronics & Communication Engineering",
    },
    {
      name: "Mechanical Engineering",
      code: "MECH",
      description: "Department of Mechanical Engineering",
    },
    {
      name: "Campus Administration & Operations",
      code: "ADMIN",
      description: "Central Campus Administration, Maintenance, and Logistics",
    },
    {
      name: "Academic Affairs & Registrar",
      code: "ACAD",
      description: "Office of the Dean of Academic Affairs, Transcripts, and Verifications",
    },
  ];

  await Department.deleteMany({});
  const departments = await Department.insertMany(coreDepartments);
  const adminDept = departments.find((d) => d.code === "ADMIN");

  // 3. Create Real Primary Administrator
  const passwordHash = await hashPassword(adminPassword);
  const adminUser = await User.create({
    name: adminName,
    email: adminEmail.toLowerCase().trim(),
    passwordHash,
    role: "ADMIN",
    departmentId: adminDept?._id,
    isActive: true,
  });

  // 4. Create an audit log record
  await AuditLog.create({
    actorId: adminUser._id,
    action: "PRODUCTION_INITIALIZED",
    entityType: "USER",
    entityId: adminUser._id.toString(),
    details: {
      message: "CampusOps production database initialized. All demo requests purged.",
      adminEmail: adminUser.email,
    },
  });

  console.log("\n=======================================================");
  console.log("✅ PRODUCTION DATABASE INITIALIZED SUCCESSFULLY!");
  console.log("=======================================================");
  console.log(`Administrator Email:    ${adminEmail}`);
  console.log(`Administrator Password: ${adminPassword}`);
  console.log(`Administrator Name:     ${adminName}`);
  console.log("Departments Created:    5 core departments");
  console.log("Demo Requests/Accounts: 0 (completely wiped & clean)");
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

initProduction().catch((err) => {
  console.error("Initialization error:", err);
  process.exit(1);
});
