export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type RequestType =
  | "BONAFIDE"
  | "NOC"
  | "EVENT_PERMISSION"
  | "LAB_ACCESS"
  | "MAINTENANCE"
  | "OTHER";

export type RequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type StepStatus = "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "SKIPPED";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  rollNumber?: string;
  employeeId?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headOfDepartmentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IApprovalStep {
  _id: string;
  requestId: string;
  stepNumber: number;
  title: string;
  assignedRole: UserRole;
  assignedFacultyId?: string | { _id: string; name: string; email: string };
  status: StepStatus;
  comments?: string;
  actionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttachment {
  _id: string;
  requestId?: string;
  uploaderId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  storageProvider: "CLOUDINARY" | "LOCAL";
  publicId?: string;
  createdAt: string;
}

export interface IAIAnalysis {
  _id: string;
  requestId?: string;
  rawInput?: string;
  suggestedCategory?: RequestType;
  priority?: RequestPriority;
  suggestedDepartmentId?: string;
  confidenceScore?: number;
  detectedMissingFields?: string[];
  extractedFields?: Record<string, any>;
  suggestions?: string[];
  summary?: string;
  isFallback: boolean;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId: string | { _id: string; name: string; email: string; role: string };
  action: string;
  entityType: "SERVICE_REQUEST" | "USER" | "DEPARTMENT" | "APPROVAL_STEP" | "AUTH";
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IServiceRequest {
  _id: string;
  requestNumber: string;
  studentId: string | IUser;
  departmentId: string | IDepartment;
  type: RequestType;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  rejectionReason?: string;
  changeRequestComment?: string;
  formData: Record<string, any>;
  attachments: (string | IAttachment)[];
  currentStepIndex: number;
  approvalSteps: (string | IApprovalStep)[];
  aiAnalysisId?: string | IAIAnalysis;
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  rollNumber?: string;
  employeeId?: string;
}
