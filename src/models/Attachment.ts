import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachmentDocument extends Document {
  requestId?: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  storageProvider: "CLOUDINARY" | "LOCAL";
  publicId?: string;
  fileData?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachmentDocument>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "ServiceRequest", index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    url: { type: String, required: true },
    storageProvider: {
      type: String,
      enum: ["CLOUDINARY", "LOCAL"],
      default: "LOCAL",
      required: true,
    },
    publicId: { type: String },
    fileData: { type: String },
  },
  { timestamps: true }
);

export const Attachment: Model<IAttachmentDocument> =
  mongoose.models.Attachment || mongoose.model<IAttachmentDocument>("Attachment", AttachmentSchema);

export default Attachment;
