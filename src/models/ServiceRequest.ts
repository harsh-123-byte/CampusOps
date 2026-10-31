import mongoose, { Schema, Document, Model } from "mongoose";
import { RequestStatus, RequestType, RequestPriority } from "@/types";

export interface IServiceRequestDocument extends Document {
  requestNumber: string;
  studentId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  type: RequestType;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  rejectionReason?: string;
  changeRequestComment?: string;
  formData: Record<string, any>;
  attachments: mongoose.Types.ObjectId[];
  currentStepIndex: number;
  approvalSteps: mongoose.Types.ObjectId[];
  aiAnalysisId?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequestDocument>(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    type: {
      type: String,
      enum: ["BONAFIDE", "NOC", "EVENT_PERMISSION", "LAB_ACCESS", "MAINTENANCE", "OTHER"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "IN_REVIEW",
        "CHANGES_REQUESTED",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "DRAFT",
      required: true,
      index: true,
    },
    rejectionReason: { type: String, trim: true },
    changeRequestComment: { type: String, trim: true },
    formData: { type: Schema.Types.Mixed, default: {} },
    attachments: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    currentStepIndex: { type: Number, default: 0 },
    approvalSteps: [{ type: Schema.Types.ObjectId, ref: "ApprovalStep" }],
    aiAnalysisId: { type: Schema.Types.ObjectId, ref: "AIAnalysis" },
    submittedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ studentId: 1, status: 1 });
ServiceRequestSchema.index({ departmentId: 1, status: 1 });
ServiceRequestSchema.index({ createdAt: -1 });

export const ServiceRequest: Model<IServiceRequestDocument> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequestDocument>("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;
