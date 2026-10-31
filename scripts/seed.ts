import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Department } from "../src/models/Department";
import { ServiceRequest } from "../src/models/ServiceRequest";
import { ApprovalStep } from "../src/models/ApprovalStep";
import { Notification } from "../src/models/Notification";
import { AuditLog } from "../src/models/AuditLog";
import { AIAnalysis } from "../src/models/AIAnalysis";

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
const DEMO_PASSWORD = "Demo@123456";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  console.log("🌱 Starting CampusOps Database Seeding...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB:", MONGODB_URI);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    ServiceRequest.deleteMany({}),
    ApprovalStep.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    AIAnalysis.deleteMany({}),
  ]);
  console.log("Cleared existing collections.");

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // 1. Create Departments
  const departmentsData = [
    {
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Department of Computing, AI, and Software Engineering",
      isActive: true,
    },
    {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Department of Microelectronics, Embedded Systems, and IoT",
      isActive: true,
    },
    {
      code: "MECH",
      name: "Mechanical Engineering",
      description: "Department of Robotics, CAD/CAM, and Thermal Systems",
      isActive: true,
    },
    {
      code: "CIVIL",
      name: "Civil Engineering",
      description: "Department of Structural, Environmental, and Geo-Tech",
      isActive: true,
    },
    {
      code: "ADMIN",
      name: "General Administration & Registrar Office",
      description: "Central Academic Records, Certificates & Student Affairs",
      isActive: true,
    },
  ];

  const createdDepts = await Department.insertMany(departmentsData);
  const deptMap: Record<string, any> = {};
  createdDepts.forEach((d) => {
    deptMap[d.code] = d;
  });
  console.log(`Created ${createdDepts.length} departments.`);

  // 2. Create Users
  // Admin
  const adminUser = await User.create({
    name: "Dr. Eleanor Vance",
    email: "admin@campusops.demo",
    passwordHash,
    role: "ADMIN",
    departmentId: deptMap.ADMIN._id,
    employeeId: "ADM-9001",
    phone: "+1 555-0100",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  // Faculty Members
  const faculty1 = await User.create({
    name: "Prof. Marcus Thorne",
    email: "faculty@campusops.demo",
    passwordHash,
    role: "FACULTY",
    departmentId: deptMap.CSE._id,
    employeeId: "FAC-4012",
    phone: "+1 555-0122",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  const faculty2 = await User.create({
    name: "Dr. Sarah Jenkins",
    email: "sjenkins@campusops.demo",
    passwordHash,
    role: "FACULTY",
    departmentId: deptMap.ECE._id,
    employeeId: "FAC-4055",
    phone: "+1 555-0144",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  // Assign HODs to departments
  await Department.findByIdAndUpdate(deptMap.CSE._id, { headOfDepartmentId: faculty1._id });
  await Department.findByIdAndUpdate(deptMap.ADMIN._id, { headOfDepartmentId: adminUser._id });

  // Students
  const student1 = await User.create({
    name: "Aiden Scott",
    email: "student@campusops.demo",
    passwordHash,
    role: "STUDENT",
    departmentId: deptMap.CSE._id,
    rollNumber: "2024CS1042",
    phone: "+1 555-0188",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  const student2 = await User.create({
    name: "Maya Patel",
    email: "maya.patel@campusops.demo",
    passwordHash,
    role: "STUDENT",
    departmentId: deptMap.ECE._id,
    rollNumber: "2024EC2019",
    phone: "+1 555-0199",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  console.log("Created demo users: Admin, 2 Faculty, 2 Students.");

  // 3. Create Sample Requests with realistic workflows
  const sampleRequestsData = [
    {
      requestNumber: "REQ-2026-0001",
      studentId: student1._id,
      departmentId: deptMap.ADMIN._id,
      type: "BONAFIDE",
      title: "Bonafide Certificate for National Scholarship Application",
      description:
        "Applying for the State Merit Engineering Scholarship 2026-2027. Need an authenticated bonafide certificate confirming enrollment, current year, and good conduct.",
      priority: "HIGH",
      status: "APPROVED",
      formData: {
        purpose: "Scholarship",
        academicYear: "2026-2027",
        currentSemester: "6th Semester",
      },
      submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    {
      requestNumber: "REQ-2026-0002",
      studentId: student1._id,
      departmentId: deptMap.CSE._id,
      type: "NOC",
      title: "No Objection Certificate for Google Summer Internship",
      description:
        "Selected as a Software Engineering Intern at Google Mountain View / Bangalore office for June-August 2026. Requesting departmental NOC for attendance and credits.",
      priority: "URGENT",
      status: "IN_REVIEW",
      formData: {
        companyName: "Google LLC",
        role: "Software Engineering Intern",
        duration: "12 Weeks (June 1 - August 25, 2026)",
        location: "Hybrid / Bangalore",
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      currentStepIndex: 1,
    },
    {
      requestNumber: "REQ-2026-0003",
      studentId: student1._id,
      departmentId: deptMap.CSE._id,
      type: "LAB_ACCESS",
      title: "Advanced GPU Cluster Access for LLM Fine-Tuning Project",
      description:
        "Requires night & weekend access to the High-Performance Computing NVIDIA A100 workstation lab for training our campus assistant model.",
      priority: "NORMAL",
      status: "SUBMITTED",
      formData: {
        labName: "Turing AI & HPC Laboratory",
        supervisorName: "Prof. Marcus Thorne",
        accessTiming: "6:00 PM - 11:00 PM (Weekdays & Weekends)",
      },
      submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      currentStepIndex: 0,
    },
    {
      requestNumber: "REQ-2026-0004",
      studentId: student1._id,
      departmentId: deptMap.CSE._id,
      type: "EVENT_PERMISSION",
      title: "Annual Hackathon 2026 - Campus Auditorium Booking",
      description:
        "ACM Student Chapter organizing HackCampus 2026 with 150 participating collegiate teams. Need auditorium and LAN lab access.",
      priority: "HIGH",
      status: "CHANGES_REQUESTED",
      changeRequestComment:
        "Please provide approval letter from Campus Security regarding overnight stay rules and fire safety plan.",
      formData: {
        eventName: "HackCampus 2026",
        expectedTurnout: "250 students",
        dates: "Nov 14 - Nov 15, 2026",
      },
      submittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      currentStepIndex: 0,
    },
    {
      requestNumber: "REQ-2026-0005",
      studentId: student2._id,
      departmentId: deptMap.ADMIN._id,
      type: "MAINTENANCE",
      title: "Air Conditioning Repair in 3rd Floor VLSI CAD Lab",
      description:
        "The primary AC unit in Room 304 has stopped cooling, leading to thermal throttling on high-end FPGA synthesis machines.",
      priority: "URGENT",
      status: "APPROVED",
      formData: {
        block: "Technology Tower Block A",
        roomNumber: "Room 304 (VLSI Lab)",
        issueType: "Cooling & Electrical",
      },
      submittedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
    {
      requestNumber: "REQ-2026-0006",
      studentId: student2._id,
      departmentId: deptMap.ECE._id,
      type: "BONAFIDE",
      title: "Study Certificate for Passport Renewal",
      description:
        "Applying for international passport renewal for upcoming IEEE student conference abroad. Need verified study certificate.",
      priority: "NORMAL",
      status: "SUBMITTED",
      formData: {
        purpose: "Passport Renewal",
        passportOffice: "Regional Passport Office",
      },
      submittedAt: new Date(Date.now() - 12 * 3600 * 1000),
      currentStepIndex: 0,
    },
    {
      requestNumber: "REQ-2026-0007",
      studentId: student1._id,
      departmentId: deptMap.MECH._id,
      type: "OTHER",
      title: "Inter-College Robotics Workshop Attendance",
      description: "Requesting duty leave permission for attending IIT Techfest Robotics Championship.",
      priority: "NORMAL",
      status: "DRAFT",
      formData: {
        destination: "IIT Bombay",
        duration: "4 Days",
      },
    },
  ];

  for (const r of sampleRequestsData) {
    const createdReq: any = await ServiceRequest.create(r as any);

    // Create approval steps for non-drafts
    if (r.status !== "DRAFT") {
      if (r.type === "NOC" || r.type === "EVENT_PERMISSION") {
        const step1 = await ApprovalStep.create({
          requestId: createdReq._id,
          stepNumber: 1,
          title: "Faculty Advisor Review",
          assignedRole: "FACULTY",
          assignedFacultyId: faculty1._id,
          status: r.status === "CHANGES_REQUESTED" ? "CHANGES_REQUESTED" : r.status === "IN_REVIEW" || r.status === "APPROVED" ? "APPROVED" : "PENDING",
          comments: r.status === "CHANGES_REQUESTED" ? r.changeRequestComment : "Advisor verified and recommended.",
          actionDate: new Date(),
        });

        const step2 = await ApprovalStep.create({
          requestId: createdReq._id,
          stepNumber: 2,
          title: "Head of Department Final Authorization",
          assignedRole: "FACULTY",
          assignedFacultyId: faculty2._id,
          status: r.status === "APPROVED" ? "APPROVED" : "PENDING",
          comments: r.status === "APPROVED" ? "Final Dean approval granted." : undefined,
          actionDate: r.status === "APPROVED" ? new Date() : undefined,
        });

        createdReq.approvalSteps = [step1._id, step2._id];
      } else {
        const step1 = await ApprovalStep.create({
          requestId: createdReq._id,
          stepNumber: 1,
          title: "Department Faculty Approval",
          assignedRole: "FACULTY",
          assignedFacultyId: faculty1._id,
          status: r.status === "APPROVED" ? "APPROVED" : "PENDING",
          comments: r.status === "APPROVED" ? "Verified and signed digitally." : undefined,
          actionDate: r.status === "APPROVED" ? new Date() : undefined,
        });

        createdReq.approvalSteps = [step1._id];
      }

      // Attach AI Analysis
      const aiDoc = await AIAnalysis.create({
        requestId: createdReq._id,
        suggestedCategory: r.type,
        priority: r.priority,
        confidenceScore: 0.94,
        detectedMissingFields: r.status === "CHANGES_REQUESTED" ? ["Fire safety clearance letter"] : [],
        suggestions: ["All required academic criteria fulfilled.", "Fast-tracked verification."],
        summary: `AI analyzed ${r.title} with high confidence. All core credentials valid.`,
        isFallback: true,
      });

      createdReq.aiAnalysisId = aiDoc._id;
      await createdReq.save();
    }
  }

  console.log(`Created ${sampleRequestsData.length} sample requests with approval workflows.`);

  // 4. Create Notifications
  const sampleNotifications = [
    {
      userId: student1._id,
      title: "Request Approved! 🎉",
      message: "Your Bonafide Certificate request REQ-2026-0001 has been approved and ready for collection.",
      type: "SUCCESS",
      link: "/student/requests",
      isRead: false,
    },
    {
      userId: student1._id,
      title: "Action Needed: Changes Requested",
      message: "Prof. Marcus requested safety updates on your Hackathon application REQ-2026-0004.",
      type: "WARNING",
      link: "/student/requests",
      isRead: false,
    },
    {
      userId: faculty1._id,
      title: "New Request Assigned",
      message: "Aiden Scott submitted REQ-2026-0003 for Turing GPU Lab Access.",
      type: "INFO",
      link: "/faculty/inbox",
      isRead: false,
    },
    {
      userId: faculty1._id,
      title: "Pending Review Reminder",
      message: "NOC Request REQ-2026-0002 has been in review for 48 hours.",
      type: "WARNING",
      link: "/faculty/inbox",
      isRead: true,
    },
    {
      userId: adminUser._id,
      title: "Campus Security Alert",
      message: "Facility maintenance ticket REQ-2026-0005 marked resolved by Facilities team.",
      type: "INFO",
      link: "/admin/analytics",
      isRead: true,
    },
  ];

  await Notification.insertMany(sampleNotifications);
  console.log(`Created ${sampleNotifications.length} sample notifications.`);

  // 5. Create Initial Audit Logs
  await AuditLog.create([
    {
      actorId: adminUser._id,
      action: "PLATFORM_INITIALIZED",
      entityType: "AUTH",
      entityId: adminUser._id.toString(),
      details: { version: "1.0.0", environment: "production-ready" },
    },
    {
      actorId: student1._id,
      action: "SUBMIT_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: "REQ-2026-0001",
      details: { type: "BONAFIDE" },
    },
    {
      actorId: faculty1._id,
      action: "APPROVE_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: "REQ-2026-0001",
      details: { stepNumber: 1, isFinal: true },
    },
  ]);
  console.log("Created initial audit trail.");

  console.log("\n=========================================");
  console.log("🎉 CAMPUSOPS SEEDING COMPLETE!");
  console.log("=========================================");
  console.log("DEMO ACCOUNTS:");
  console.log("1. Student:  student@campusops.demo  /  Password: Demo@123456");
  console.log("2. Faculty:  faculty@campusops.demo  /  Password: Demo@123456");
  console.log("3. Admin:    admin@campusops.demo    /  Password: Demo@123456");
  console.log("=========================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
