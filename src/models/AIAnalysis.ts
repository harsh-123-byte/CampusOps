import mongoose, { Schema, Document, Model } from "mongoose";
import { RequestType, RequestPriority } from "@/types";

export interface IAIAnalysisDocument extends Document {
  requestId?: mongoose.Types.ObjectId;
  rawInput?: string;
  suggestedCategory?: RequestType;
  priority?: RequestPriority;
  suggestedDepartmentId?: mongoose.Types.ObjectId;
  confidenceScore?: number;
  detectedMissingFields?: string[];
  extractedFields?: Record<string, any>;
  suggestions?: string[];
  summary?: string;
  isFallback: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysisDocument>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "ServiceRequest", index: true },
    rawInput: { type: String },
    suggestedCategory: {
      type: String,
      enum: ["BONAFIDE", "NOC", "EVENT_PERMISSION", "LAB_ACCESS", "MAINTENANCE", "OTHER"],
    },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },
    suggestedDepartmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    confidenceScore: { type: Number, default: 0.85 },
    detectedMissingFields: [{ type: String }],
    extractedFields: { type: Schema.Types.Mixed, default: {} },
    suggestions: [{ type: String }],
    summary: { type: String },
    isFallback: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AIAnalysis: Model<IAIAnalysisDocument> =
  mongoose.models.AIAnalysis || mongoose.model<IAIAnalysisDocument>("AIAnalysis", AIAnalysisSchema);

export default AIAnalysis;
