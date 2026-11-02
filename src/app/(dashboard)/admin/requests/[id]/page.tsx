"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
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
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";

function AdminRequestDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Application Audit" requiredRole="ADMIN">
        <div className="p-16 text-center text-sm text-slate-500">Loading audit details...</div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Not Found" requiredRole="ADMIN">
        <div className="p-16 text-center text-sm text-slate-500">Application not found.</div>
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

  return (
    <DashboardLayout title={`Admin Inspection: ${request.requestNumber}`} requiredRole="ADMIN">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/requests"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Master Registry
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" /> Administrative Oversight Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile Overview */}
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
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
              Department: {request.departmentId?.name || "General"}
            </span>
          </div>

          {/* Application Details */}
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
                Application Statement
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50/80 p-3.5 rounded-md border border-slate-200 leading-relaxed">
                {request.description}
              </p>
            </div>

            {/* Form Attributes */}
            {request.formData && Object.keys(request.formData).length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Category Attributes
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

            {/* Uploaded Documents */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Uploaded Documentation
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

          {/* AI Analysis */}
          {request.aiAnalysisId && (
            <div className="bg-white rounded-lg border border-slate-200/90 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
                  Gemini AI Pre-Screening Audit
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {request.aiAnalysisId.summary}
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Timeline */}
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

export default function AdminRequestDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AdminRequestDetailContent />
    </Suspense>
  );
}
