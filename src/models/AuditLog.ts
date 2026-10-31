import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLogDocument extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entityType: "SERVICE_REQUEST" | "USER" | "DEPARTMENT" | "APPROVAL_STEP" | "AUTH";
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ["SERVICE_REQUEST", "USER", "DEPARTMENT", "APPROVAL_STEP", "AUTH"],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
