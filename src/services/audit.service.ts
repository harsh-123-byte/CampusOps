import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export class AuditService {
  static async logAction({
    actorId,
    action,
    entityType,
    entityId,
    details = {},
    ipAddress,
  }: {
    actorId: string | mongoose.Types.ObjectId;
    action: string;
    entityType: "SERVICE_REQUEST" | "USER" | "DEPARTMENT" | "APPROVAL_STEP" | "AUTH";
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }) {
    try {
      await connectDB();
      return await AuditLog.create({
        actorId: new mongoose.Types.ObjectId(actorId.toString()),
        action,
        entityType,
        entityId,
        details,
        ipAddress,
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
      // Non-blocking for critical user flow, but logged
      return null;
    }
  }

  static async getRecentLogs(limit: number = 50, filter?: { entityType?: string; action?: string }) {
    await connectDB();
    const query: any = {};
    if (filter?.entityType) query.entityType = filter.entityType;
    if (filter?.action) query.action = filter.action;

    return AuditLog.find(query)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
