"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApprovalTimeline } from "@/components/requests/ApprovalTimeline";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileCheck,
  AlertTriangle,
  Send,
  Ban,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";

function StudentRequestDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingChanges, setSubmittingChanges] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Resubmission fields
  const [resubmitDescription, setResubmitDescription] = useState("");

  const fetchRequest = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setResubmitDescription(data.request.description || "");
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

  const handleResubmit = async () => {
    if (!resubmitDescription.trim() || resubmitDescription.trim().length < 10) {
      toast.error("Please provide an updated explanation of at least 10 characters");
      return;
    }

    setSubmittingChanges(true);
    try {
      const res = await fetch(`/api/v1/requests/${id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: resubmitDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resubmission failed");

      toast.success("Changes resubmitted to faculty reviewer!");
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to resubmit application");
    } finally {
      setSubmittingChanges(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this application?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/requests/${id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      toast.success("Application cancelled");
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel application");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitDraft = async () => {
    try {
      const res = await fetch(`/api/v1/requests/${id}/submit`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit draft");

      toast.success("Draft submitted for review!");
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit draft");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Application Details" requiredRole="STUDENT">
        <div className="p-16 text-center text-sm text-slate-500">
          Loading application details...
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Not Found" requiredRole="STUDENT">
        <div className="p-16 text-center">
          <p className="text-sm text-slate-500 mb-4">Application not found or inaccessible.</p>
          <Link href="/student/requests">
            <Button size="sm">Back to My Applications</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stepsData = (request.approvalSteps || []).map((step: any) => ({
    stepNumber: step.stepNumber,
    title: step.title,
    assignedRole: step.assignedRole,
    assignedFacultyName: step.assignedFacultyId?.name,
    status: step.status,
    comments: step.comments,
    actionDate: step.actionDate,
  }));

  const canCancel = ["DRAFT", "SUBMITTED", "IN_REVIEW"].includes(request.status);

  return (
    <DashboardLayout title={`Request ${request.requestNumber}`} requiredRole="STUDENT">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/student/requests"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>

        <div className="flex items-center gap-2">
          {request.status === "DRAFT" && (
            <Button size="sm" onClick={handleSubmitDraft}>
              <Send className="w-3.5 h-3.5 mr-1" /> Submit Draft
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              loading={cancelling}
              onClick={handleCancel}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <Ban className="w-3.5 h-3.5 mr-1" /> Cancel Application
            </Button>
          )}
        </div>
      </div>

      {request.status === "CHANGES_REQUESTED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Action Required: Faculty Requested Changes
              </h4>
              <p className="text-xs text-amber-800 mt-1 mb-3">
                Reviewer comment: &quot;{request.changeRequestComment}&quot;
              </p>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
                <label className="block text-xs font-semibold text-slate-800">
                  Update Statement & Address Reviewer Feedback:
                </label>
                <textarea
                  rows={3}
                  value={resubmitDescription}
                  onChange={(e) => setResubmitDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Button
                  size="sm"
                  loading={submittingChanges}
                  onClick={handleResubmit}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Resubmit for Approval
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
                  {request.requestNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{request.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <TypeBadge type={request.type} />
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Department</span>
                <span className="font-semibold text-slate-800">
                  {request.departmentId?.name || "General Administration"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Filed On</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(request.createdAt)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Current Review Stage</span>
                <span className="font-semibold text-slate-800">
                  Step {request.currentStepIndex + 1} of {request.approvalSteps?.length || 1}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Application Statement
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {request.description}
              </p>
            </div>

            {request.formData && Object.keys(request.formData).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category Attributes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(request.formData).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
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
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Attached Documentation
              </h4>
              {(!request.attachments || request.attachments.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No files attached to this request.</p>
              ) : (
                <div className="space-y-2">
                  {request.attachments.map((att: any) => (
                    <div
                      key={att._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{att.fileName}</span>
                        <span className="text-[10px] text-slate-400">
                          ({Math.round((att.fileSize || 0) / 1024)} KB • {att.storageProvider})
                        </span>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        View File <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {request.aiAnalysisId && (
            <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/30 rounded-2xl border border-indigo-100 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Gemini AI Pre-Screening Summary
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
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
    </DashboardLayout>
  );
}

export default function StudentRequestDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <StudentRequestDetailContent />
    </Suspense>
  );
}
