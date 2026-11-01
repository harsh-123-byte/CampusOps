import { connectDB } from "@/lib/db";
import { ServiceRequest } from "@/models/ServiceRequest";
import { ApprovalStep } from "@/models/ApprovalStep";
import { User } from "@/models/User";
import { NotificationService } from "@/services/notification.service";
import { AuditService } from "@/services/audit.service";
import { RequestType } from "@/types";
import mongoose from "mongoose";

export class WorkflowService {
  /**
   * Initializes approval steps based on request type and department, with support for specific faculty assignment
   */
  static async initializeWorkflowSteps(
    requestId: mongoose.Types.ObjectId,
    requestType: RequestType,
    departmentId: mongoose.Types.ObjectId,
    preferredFacultyId?: string
  ) {
    await connectDB();

    let primaryFaculty: any = null;
    let secondaryFaculty: any = null;

    // 1. If student specified a preferred faculty member, assign them directly
    if (preferredFacultyId && mongoose.Types.ObjectId.isValid(preferredFacultyId)) {
      primaryFaculty = await User.findOne({
        _id: new mongoose.Types.ObjectId(preferredFacultyId),
        role: "FACULTY",
        isActive: true,
      });
    }

    // 2. Otherwise find available faculty in this department, or fallback to any active faculty
    if (!primaryFaculty) {
      const facultyList = await User.find({
        role: "FACULTY",
        isActive: true,
        $or: [{ departmentId }, { departmentId: { $exists: false } }],
      }).limit(2);

      primaryFaculty = facultyList[0] || (await User.findOne({ role: "FACULTY", isActive: true }));
      secondaryFaculty = facultyList[1] || primaryFaculty;
    } else {
      secondaryFaculty = primaryFaculty;
    }

    const stepsToCreate = [];

    if (requestType === "NOC" || requestType === "EVENT_PERMISSION") {
      // 2-step approval workflow
      stepsToCreate.push({
        requestId,
        stepNumber: 1,
        title: "Faculty Advisor Review",
        assignedRole: "FACULTY",
        assignedFacultyId: primaryFaculty?._id,
        status: "PENDING",
      });
      stepsToCreate.push({
        requestId,
        stepNumber: 2,
        title: "Head of Department Final Authorization",
        assignedRole: "FACULTY",
        assignedFacultyId: secondaryFaculty?._id || primaryFaculty?._id,
        status: "PENDING",
      });
    } else {
      // 1-step approval workflow
      stepsToCreate.push({
        requestId,
        stepNumber: 1,
        title: "Department Faculty Approval",
        assignedRole: "FACULTY",
        assignedFacultyId: primaryFaculty?._id,
        status: "PENDING",
      });
    }

    // Delete any old steps if resubmitting
    await ApprovalStep.deleteMany({ requestId });

    const createdSteps = await ApprovalStep.insertMany(stepsToCreate);
    const stepIds = createdSteps.map((s) => s._id);

    // Notify assigned faculty for the first step
    if (primaryFaculty) {
      await NotificationService.createNotification({
        userId: primaryFaculty._id,
        title: "New Request Assigned",
        message: `A new ${requestType.replace(/_/g, " ")} request requires your review.`,
        type: "INFO",
        link: `/faculty/requests/${requestId}`,
      });
    }

    return stepIds;
  }

  /**
   * Process approval action: APPROVE
   */
  static async approve(requestId: string, actorId: string, comments?: string) {
    await connectDB();

    const request = await ServiceRequest.findById(requestId).populate("approvalSteps");
    if (!request) throw new Error("Request not found");

    if (request.status !== "SUBMITTED" && request.status !== "IN_REVIEW") {
      throw new Error(`Cannot approve request in ${request.status} status`);
    }

    const steps = await ApprovalStep.find({ requestId }).sort({ stepNumber: 1 });
    const currentStep = steps[request.currentStepIndex];

    if (!currentStep) throw new Error("Approval step not found");

    // Check authorization: Actor must be assigned faculty or Admin
    const actor = await User.findById(actorId);
    if (!actor) throw new Error("Actor not found");

    const isAssigned =
      !currentStep.assignedFacultyId ||
      currentStep.assignedFacultyId.toString() === actorId.toString();

    if (!isAssigned && actor.role !== "ADMIN") {
      throw new Error("You are not authorized to approve this step");
    }

    // Update current step
    currentStep.status = "APPROVED";
    currentStep.comments = comments || "Approved";
    currentStep.actionDate = new Date();
    await currentStep.save();

    const isLastStep = request.currentStepIndex >= steps.length - 1;

    if (isLastStep) {
      // Completed all steps!
      request.status = "APPROVED";
      request.completedAt = new Date();
      await request.save();

      // Notify student
      await NotificationService.createNotification({
        userId: request.studentId,
        title: "Request Approved! 🎉",
        message: `Your request ${request.requestNumber} has been officially approved.`,
        type: "SUCCESS",
        link: `/student/requests/${request._id}`,
      });
    } else {
      // Advance to next step
      request.currentStepIndex += 1;
      request.status = "IN_REVIEW";
      await request.save();

      const nextStep = steps[request.currentStepIndex];
      if (nextStep && nextStep.assignedFacultyId) {
        await NotificationService.createNotification({
          userId: nextStep.assignedFacultyId,
          title: "Action Required: Step 2 Approval",
          message: `Request ${request.requestNumber} has completed initial review and is ready for your authorization.`,
          type: "INFO",
          link: `/faculty/requests/${request._id}`,
        });
      }
    }

    await AuditService.logAction({
      actorId,
      action: "APPROVE_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
      details: {
        stepNumber: currentStep.stepNumber,
        isFinal: isLastStep,
        comments,
      },
    });

    return request;
  }

  /**
   * Process approval action: REJECT
   */
  static async reject(requestId: string, actorId: string, reason: string) {
    await connectDB();

    if (!reason || reason.trim().length < 5) {
      throw new Error("A clear rejection reason of at least 5 characters is required.");
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) throw new Error("Request not found");

    if (request.status !== "SUBMITTED" && request.status !== "IN_REVIEW") {
      throw new Error(`Cannot reject request in ${request.status} status`);
    }

    const steps = await ApprovalStep.find({ requestId }).sort({ stepNumber: 1 });
    const currentStep = steps[request.currentStepIndex];

    if (currentStep) {
      currentStep.status = "REJECTED";
      currentStep.comments = reason;
      currentStep.actionDate = new Date();
      await currentStep.save();
    }

    request.status = "REJECTED";
    request.rejectionReason = reason;
    request.completedAt = new Date();
    await request.save();

    // Notify student
    await NotificationService.createNotification({
      userId: request.studentId,
      title: "Request Rejected",
      message: `Your request ${request.requestNumber} was rejected. Reason: ${reason}`,
      type: "DANGER",
      link: `/student/requests/${request._id}`,
    });

    await AuditService.logAction({
      actorId,
      action: "REJECT_REQUEST",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
      details: { reason },
    });

    return request;
  }

  /**
   * Process approval action: REQUEST_CHANGES
   */
  static async requestChanges(requestId: string, actorId: string, comments: string) {
    await connectDB();

    if (!comments || comments.trim().length < 5) {
      throw new Error("Specific change comments of at least 5 characters are required.");
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) throw new Error("Request not found");

    if (request.status !== "SUBMITTED" && request.status !== "IN_REVIEW") {
      throw new Error(`Cannot request changes on request in ${request.status} status`);
    }

    const steps = await ApprovalStep.find({ requestId }).sort({ stepNumber: 1 });
    const currentStep = steps[request.currentStepIndex];

    if (currentStep) {
      currentStep.status = "CHANGES_REQUESTED";
      currentStep.comments = comments;
      currentStep.actionDate = new Date();
      await currentStep.save();
    }

    request.status = "CHANGES_REQUESTED";
    request.changeRequestComment = comments;
    await request.save();

    // Notify student
    await NotificationService.createNotification({
      userId: request.studentId,
      title: "Changes Requested on Your Application",
      message: `The reviewer has requested changes on ${request.requestNumber}: "${comments}"`,
      type: "WARNING",
      link: `/student/requests/${request._id}`,
    });

    await AuditService.logAction({
      actorId,
      action: "REQUEST_CHANGES",
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
      details: { comments },
    });

    return request;
  }
}
