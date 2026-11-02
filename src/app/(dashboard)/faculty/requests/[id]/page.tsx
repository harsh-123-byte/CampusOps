"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ApprovalTimeline } from "@/components/requests/ApprovalTimeline";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Sparkles,
  Lock,
  Loader2,
} from "lucide-react";

function FacultyReviewContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal dialog states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);

  // Action inputs
  const [approveComments, setApproveComments] = useState("Verified and approved according to department standards.");
  const [rejectReason, setRejectReason] = useState("");
  const [changeComments, setChangeComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
      } else {
        toast.error("Application not found");
      }
    } catch {
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/approvals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, comments: approveComments }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      toast.success("Application successfully approved! Student notified.");
      setShowApproveModal(false);
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Mandatory rejection reason of at least 5 characters is required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/approvals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, reason: rejectReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");

      toast.success("Application rejected with reason recorded.");
      setShowRejectModal(false);
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changeComments.trim() || changeComments.trim().length < 5) {
      toast.error("Specific change instructions of at least 5 characters are required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/approvals/request-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, comments: changeComments }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request changes");

      toast.success("Change request dispatched to student.");
      setShowChangesModal(false);
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to request changes");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Review Application" requiredRole="FACULTY">
        <div className="p-16 text-center text-sm text-slate-500">Loading application...</div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Not Found" requiredRole="FACULTY">
        <div className="p-16 text-center">
          <p className="text-sm text-slate-500 mb-4">Application not found.</p>
          <Link href="/faculty/inbox">
            <Button size="sm">Back to Inbox</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isPendingReview = ["SUBMITTED", "IN_REVIEW"].includes(request.status);

  const stepsData = (request.approvalSteps || []).map((step: any) => ({
    stepNumber: step.stepNumber,
    title: step.title,
    assignedRole: step.assignedRole,
    assignedFacultyName: step.assignedFacultyId?.name,
    status: step.status,
    comments: step.comments,
    actionDate: step.actionDate,
  }));

  return (
    <DashboardLayout title={`Review ${request.requestNumber}`} requiredRole="FACULTY">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/faculty/inbox"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Approval Inbox
        </Link>

        {isPendingReview ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowChangesModal(true)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Request Changes
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Request
            </Button>

            <Button
              size="sm"
              variant="success"
              onClick={() => setShowApproveModal(true)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Application
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" /> Decision Finalized: {request.status}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200/90 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-center border border-slate-200">
                {request.studentId?.name?.slice(0, 2).toUpperCase() || "ST"}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">{request.studentId?.name}</h3>
                <p className="text-xs text-slate-500">
                  {request.studentId?.email} • Roll #{request.studentId?.rollNumber || "2024CS1042"}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
              Enrolled Student
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400 block mb-1">
                  {request.requestNumber}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{request.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <TypeBadge type={request.type} />
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Statement of Purpose / Justification
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50/80 p-3.5 rounded-md border border-slate-200 leading-relaxed">
                {request.description}
              </p>
            </div>

            {request.formData && Object.keys(request.formData).length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Application Parameters
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(request.formData).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-md bg-slate-50/80 border border-slate-200">
                      <span className="text-slate-400 text-[10px] capitalize block">
                        {k.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="font-medium text-slate-800">{String(v || "-")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Verified Attachments
              </h4>
              {(!request.attachments || request.attachments.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No attachments submitted.</p>
              ) : (
                <div className="space-y-2">
                  {request.attachments.map((att: any) => (
                    <div
                      key={att._id}
                      className="flex items-center justify-between p-2.5 rounded-md bg-slate-50/80 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">{att.fileName}</span>
                        <span className="text-[10px] text-slate-400">
                          ({Math.round((att.fileSize || 0) / 1024)} KB • {att.storageProvider})
                        </span>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-900 hover:text-blue-600 font-medium inline-flex items-center gap-1"
                      >
                        Inspect Document <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {request.aiAnalysisId && (
            <div className="bg-white rounded-lg border border-slate-200/90 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
                  Gemini AI Pre-Screening Verification
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {request.aiAnalysisId.summary}
              </p>
            </div>
          )}
        </div>

        <div>
          <ApprovalTimeline
            steps={stepsData}
            currentStepIndex={request.currentStepIndex || 0}
            overallStatus={request.status}
          />
        </div>
      </div>

      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Service Request"
        description={`Record official authorization for ${request.requestNumber}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approval Note / Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={approveComments}
              onChange={(e) => setApproveComments(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="success" loading={actionLoading} onClick={handleApprove}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
        description="A clear and mandatory rejection reason must be documented for student transparency."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-rose-700 mb-1.5">
              Mandatory Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this application cannot be granted..."
              className="w-full text-xs px-3 py-2 rounded-md border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showChangesModal}
        onClose={() => setShowChangesModal(false)}
        title="Request Changes From Student"
        description="Specify the exact revisions or additional documents the student must provide."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-700 mb-1.5">
              Mandatory Feedback / Required Changes *
            </label>
            <textarea
              rows={3}
              required
              value={changeComments}
              onChange={(e) => setChangeComments(e.target.value)}
              placeholder="e.g. Please attach your official internship offer letter with company stamp..."
              className="w-full text-xs px-3 py-2 rounded-md border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowChangesModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={actionLoading}
              onClick={handleRequestChanges}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Send Change Request
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function FacultyReviewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <FacultyReviewContent />
    </Suspense>
  );
}
