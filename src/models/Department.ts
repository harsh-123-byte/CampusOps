import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartmentDocument extends Document {
  code: string;
  name: string;
  description?: string;
  headOfDepartmentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    headOfDepartmentId: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Department: Model<IDepartmentDocument> =
  mongoose.models.Department || mongoose.model<IDepartmentDocument>("Department", DepartmentSchema);

export default Department;
