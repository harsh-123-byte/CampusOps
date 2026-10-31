import mongoose, { Schema, Document, Model } from "mongoose";
import { StepStatus, UserRole } from "@/types";

export interface IApprovalStepDocument extends Document {
  requestId: mongoose.Types.ObjectId;
  stepNumber: number;
  title: string;
  assignedRole: UserRole;
  assignedFacultyId?: mongoose.Types.ObjectId;
  status: StepStatus;
  comments?: string;
  actionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalStepSchema = new Schema<IApprovalStepDocument>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: true, index: true },
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    assignedRole: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN"],
      default: "FACULTY",
      required: true,
    },
    assignedFacultyId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "SKIPPED"],
      default: "PENDING",
      required: true,
      index: true,
    },
    comments: { type: String, trim: true },
    actionDate: { type: Date },
  },
  { timestamps: true }
);

ApprovalStepSchema.index({ requestId: 1, stepNumber: 1 }, { unique: true });

export const ApprovalStep: Model<IApprovalStepDocument> =
  mongoose.models.ApprovalStep ||
  mongoose.model<IApprovalStepDocument>("ApprovalStep", ApprovalStepSchema);

export default ApprovalStep;
