import { connectDB } from "@/lib/db";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Department } from "@/models/Department";
import { User } from "@/models/User";
import { WorkflowService } from "@/services/workflow.service";
import { NotificationService } from "@/services/notification.service";
import { AuditService } from "@/services/audit.service";
import { AIService } from "@/services/ai.service";
import { AIAnalysis } from "@/models/AIAnalysis";
import { CreateRequestInput, UpdateRequestInput } from "@/schemas/request.schema";
import mongoose from "mongoose";

export class RequestService {
  /**
   * Generates formatted sequential request numbers: REQ-YYYY-XXXX
   */
  static async generateRequestNumber(): Promise<string> {
    await connectDB();
    const year = new Date().getFullYear();
    const count = await ServiceRequest.countDocuments();
    const seq = (count + 1).toString().padStart(4, "0");
    return `REQ-${year}-${seq}`;
  }

  /**
   * Creates a new request (DRAFT or SUBMITTED)
   */
  static async createRequest(studentId: string, input: CreateRequestInput) {
    await connectDB();

    const requestNumber = await this.generateRequestNumber();
    const isSubmitted = input.status === "SUBMITTED";

    // Create the ServiceRequest document
    const request = new ServiceRequest({
      requestNumber,
      studentId: new mongoose.Types.ObjectId(studentId),
      departmentId: new mongoose.Types.ObjectId(input.departmentId),
      type: input.type,
      title: input.title,
      description: input.description,
      priority: input.priority || "NORMAL",
      status: isSubmitted ? "SUBMITTED" : "DRAFT",
      formData: input.formData || {},
      attachments: (input.attachments || []).map((id) => new mongoose.Types.ObjectId(id)),
      submittedAt: isSubmitted ? new Date() : undefined,
    });

    await request.save();

    // Trigger AI Classification asynchronously or synchronously for immediate metadata
    try {
      const aiResult = await AIService.classifyRequest(input.title, input.description);
      const aiDoc = await AIAnalysis.create({
        requestId: request._id,
        rawInput: `${input.title}\n${input.description}`,
        suggestedCategory: aiResult.data.suggestedCategory,
        priority: aiResult.data.priority,
        confidenceScore: aiResult.data.confidenceScore,
        detectedMissingFields: aiResult.data.detectedMissingFields,
        suggestions: aiResult.data.suggestions,
        summary: aiResult.data.summary,
        isFallback: aiResult.isFallback,
      });
      request.aiAnalysisId = aiDoc._id;
      await request.save();
    } catch (e) {
      console.warn("AI pre-classification on create skipped:", e);
    }

    if (isSubmitted) {
      // Initialize workflow steps and assign faculty
      const stepIds = await WorkflowService.initializeWorkflowSteps(
        request._id as mongoose.Types.ObjectId,
        request.type,
        request.departmentId,
        input.assignedFacultyId
      );
      request.approvalSteps = stepIds;
      await request.save();

      // Student notification
      await NotificationService.createNotification({
        userId: studentId,
        title: "Application Submitted Successfully",
        message: `Your application ${requestNumber} for ${request.type.replace(/_/g, " ")} is now under review.`,
        type: "SUCCESS",
        link: `/student/requests/${request._id}`,
      });
    }

    await AuditService.logAction({
      actorId: studentId,
      action: isSubmitted ? "SUBMIT_REQUEST" : "CREATE_DRAFT",
      entityType: "SERVICE_REQUEST",
      entityId: request._id.toString(),
      details: { requestNumber, type: request.type, status: request.status },
    });

    return request;
  }

  /**
   * Submit an existing draft request
   */
  static async submitDraft(requestId: string, studentId: string) {
    await connectDB();

    const request = await ServiceRequest.findOne({
      _id: new mongoose.Types.ObjectId(requestId),
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (!request) throw new Error("Request not found or unauthorized");
    if (request.status !== "DRAFT") throw new Error(`Request is already ${request.status}`);

    request.status = "SUBMITTED";
    request.submittedAt = new Date();

    const stepIds = await WorkflowService.initializeWorkflowSteps(
      request._id as mongoose.Types.ObjectId,
      request.type,
      request.departmentId
    );
    request.approvalSteps = stepIds;
    await request.save();

    await NotificationService.createNotification({
      userId: studentId,
      title: "Draft Submitted",
      message: `Your draft request ${request.requestNumber} has been officially submitted.`,
      type: "SUCCESS",
      link: `/student/requests/${request._id}`,
    });

    await AuditService.logAction({
      actorId: studentId,
      action: "SUBMIT_DRAFT",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
    });

    return request;
  }

  /**
   * Resubmit a request after changes were requested
   */
  static async resubmitRequest(requestId: string, studentId: string, updates: UpdateRequestInput) {
    await connectDB();

    const request = await ServiceRequest.findOne({
      _id: new mongoose.Types.ObjectId(requestId),
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (!request) throw new Error("Request not found");
    if (request.status !== "CHANGES_REQUESTED") {
      throw new Error("Only requests with CHANGES_REQUESTED status can be resubmitted");
    }

    if (updates.title) request.title = updates.title;
    if (updates.description) request.description = updates.description;
    if (updates.departmentId) request.departmentId = new mongoose.Types.ObjectId(updates.departmentId);
    if (updates.formData) request.formData = updates.formData;
    if (updates.attachments) {
      request.attachments = updates.attachments.map((id) => new mongoose.Types.ObjectId(id));
    }

    request.status = "SUBMITTED";
    request.currentStepIndex = 0;
    request.changeRequestComment = undefined;

    // Reset approval steps to PENDING
    const stepIds = await WorkflowService.initializeWorkflowSteps(
      request._id as mongoose.Types.ObjectId,
      request.type,
      request.departmentId
    );
    request.approvalSteps = stepIds;
    await request.save();

    await NotificationService.createNotification({
      userId: studentId,
      title: "Application Resubmitted",
      message: `Your changes for ${request.requestNumber} have been submitted for faculty re-evaluation.`,
      type: "INFO",
      link: `/student/requests/${request._id}`,
    });

    await AuditService.logAction({
      actorId: studentId,
      action: "RESUBMIT_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
    });

    return request;
  }

  /**
   * Cancel an eligible request
   */
  static async cancelRequest(requestId: string, actorId: string, role: string) {
    await connectDB();

    const query: any = { _id: new mongoose.Types.ObjectId(requestId) };
    if (role !== "ADMIN") {
      query.studentId = new mongoose.Types.ObjectId(actorId);
    }

    const request = await ServiceRequest.findOne(query);
    if (!request) throw new Error("Request not found or access denied");

    if (["APPROVED", "REJECTED", "CANCELLED"].includes(request.status)) {
      throw new Error(`Cannot cancel a request that is already ${request.status}`);
    }

    request.status = "CANCELLED";
    await request.save();

    await AuditService.logAction({
      actorId,
      action: "CANCEL_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
    });

    return request;
  }

  /**
   * Query requests with real MongoDB filtering, search, sorting, and pagination
   */
  static async getRequests({
    role,
    userId,
    departmentId,
    status,
    type,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    role: string;
    userId: string;
    departmentId?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    await connectDB();

    const andConditions: any[] = [];

    // Role-specific scoping
    if (role === "STUDENT") {
      andConditions.push({ studentId: new mongoose.Types.ObjectId(userId) });
    } else if (role === "FACULTY") {
      andConditions.push({ status: { $ne: "DRAFT" } });

      // Find all request IDs where this faculty is assigned to an approval step
      const { ApprovalStep } = await import("@/models/ApprovalStep");
      const assignedSteps = await ApprovalStep.find({
        assignedFacultyId: new mongoose.Types.ObjectId(userId),
      }).select("requestId");
      const assignedRequestIds = assignedSteps.map((s) => s.requestId);

      const facultyOrConditions: any[] = [
        { _id: { $in: assignedRequestIds } },
      ];

      if (departmentId) {
        facultyOrConditions.push({ departmentId: new mongoose.Types.ObjectId(departmentId) });
      }

      andConditions.push({ $or: facultyOrConditions });
    }

    // Status filter
    if (status && status !== "ALL") {
      andConditions.push({ status });
    }

    // Type filter
    if (type && type !== "ALL") {
      andConditions.push({ type });
    }

    // Search filter
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), "i");
      andConditions.push({
        $or: [
          { requestNumber: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
        ],
      });
    }

    const query: any = andConditions.length > 0 ? { $and: andConditions } : {};

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate("studentId", "name email rollNumber avatarUrl")
        .populate("departmentId", "code name")
        .populate({
          path: "approvalSteps",
          populate: { path: "assignedFacultyId", select: "name email" },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ServiceRequest.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single request details by ID
   */
  static async getRequestById(requestId: string) {
    await connectDB();

    return ServiceRequest.findById(requestId)
      .populate("studentId", "name email rollNumber phone avatarUrl")
      .populate("departmentId", "code name description")
      .populate({
        path: "approvalSteps",
        populate: { path: "assignedFacultyId", select: "name email employeeId" },
      })
      .populate("attachments")
      .populate("aiAnalysisId")
      .lean();
  }
}
