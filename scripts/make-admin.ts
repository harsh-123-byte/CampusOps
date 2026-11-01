import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Department } from "../src/models/Department";
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

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email) {
    console.log("Usage: npx tsx scripts/make-admin.ts <email> [optional-password]");
    process.exit(1);
  }

  console.log("Connecting to database...");
  await mongoose.connect(MONGODB_URI);

  let adminDept = await Department.findOne({ code: "ADMIN" });
  if (!adminDept) {
    adminDept = await Department.create({
      code: "ADMIN",
      name: "General Administration & Registrar Office",
      description: "Central Academic Records & Student Affairs",
      isActive: true,
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = "ADMIN";
    existing.departmentId = adminDept._id as any;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      existing.passwordHash = await bcrypt.hash(password, salt);
    }
    existing.isActive = true;
    await existing.save();
    console.log(`✅ User "${email}" has been successfully promoted to ADMIN role!`);
    if (password) {
      console.log(`🔑 Password updated to: "${password}"`);
    }
  } else {
    const passToUse = password || "Admin@123456";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passToUse, salt);

    await User.create({
      name: "Administrator",
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      departmentId: adminDept._id,
      employeeId: "ADM-" + Math.floor(1000 + Math.random() * 9000),
      isActive: true,
    });
    console.log(`✅ Created new ADMIN user: "${email}" with password: "${passToUse}"`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});

