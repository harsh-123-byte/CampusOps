import { User } from "@/models/User";
import { ServiceRequest } from "@/models/ServiceRequest";
import { ApprovalStep } from "@/models/ApprovalStep";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import { AIAnalysis } from "@/models/AIAnalysis";

let isPurged = false;

/**
 * Automatically purges all mock / demo users and associated seed transactions
 * from the database so that only genuine users registered by the university exist.
 */
export async function purgeDemoData(): Promise<void> {
  if (isPurged) return;

  try {
    // 1. Identify all demo users
    const demoUsers = await User.find({
      $or: [
        { email: { $regex: /@(campusops\.demo|example\.com)$/i } },
        { name: { $in: ["Dr. Eleanor Vance", "Aiden Scott", "Prof. Marcus Thorne", "Dr. Sarah Jenkins", "Maya Patel"] } },
      ],
    }).select("_id");

    const demoUserIds = demoUsers.map((u) => u._id);

    if (demoUserIds.length > 0) {
      // 2. Identify demo requests
      const demoRequests = await ServiceRequest.find({
        $or: [
          { studentId: { $in: demoUserIds } },
          { requestNumber: { $regex: /^REQ-2026-000[0-9]/i } },
        ],
      }).select("_id");

      const demoRequestIds = demoRequests.map((r) => r._id);

      // 3. Delete all related transactions
      if (demoRequestIds.length > 0) {
        await ApprovalStep.deleteMany({ requestId: { $in: demoRequestIds } });
        await AIAnalysis.deleteMany({ requestId: { $in: demoRequestIds } });
        await ServiceRequest.deleteMany({ _id: { $in: demoRequestIds } });
      }

      await Notification.deleteMany({ userId: { $in: demoUserIds } });
      await AuditLog.deleteMany({ actorId: { $in: demoUserIds } });
      await User.deleteMany({ _id: { $in: demoUserIds } });

      console.log(
        `🧹 [Purge Clean] Successfully removed ${demoUserIds.length} dummy demo accounts and ${demoRequestIds.length} demo requests from database.`
      );
    }

    isPurged = true;
  } catch (err) {
    console.warn("⚠️ Demo data cleanup warning:", err);
  }
}

