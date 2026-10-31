import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  rollNumber?: string;
  employeeId?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN"],
      default: "STUDENT",
      required: true,
      index: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    rollNumber: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
