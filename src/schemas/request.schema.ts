import { z } from "zod";

export const CreateRequestSchema = z.object({
  type: z.enum(["BONAFIDE", "NOC", "EVENT_PERMISSION", "LAB_ACCESS", "MAINTENANCE", "OTHER"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  departmentId: z.string().min(1, "Department is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  formData: z.record(z.string(), z.any()).default({}),
  attachments: z.array(z.string()).default([]),
  assignedFacultyId: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("SUBMITTED"),
});

export const UpdateRequestSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).optional(),
  departmentId: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  formData: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
});

export const ApproveActionSchema = z.object({
  comments: z.string().optional(),
});

export const RejectActionSchema = z.object({
  reason: z.string().min(5, "Rejection reason is mandatory and must be at least 5 characters"),
});

export const RequestChangesActionSchema = z.object({
  comments: z.string().min(5, "Change request comments are mandatory and must be at least 5 characters"),
});

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type UpdateRequestInput = z.infer<typeof UpdateRequestSchema>;
