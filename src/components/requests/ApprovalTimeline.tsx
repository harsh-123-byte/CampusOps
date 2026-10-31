"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StepProps {
  stepNumber: number;
  title: string;
  assignedRole: string;
  assignedFacultyName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "SKIPPED";
  comments?: string;
  actionDate?: string;
}

export function ApprovalTimeline({
  steps,
  currentStepIndex,
  overallStatus,
}: {
  steps: StepProps[];
  currentStepIndex: number;
  overallStatus: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-blue-600" />
        Official Approval Pipeline
      </h3>

      <div className="relative">
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = step.status === "APPROVED";
            const isRejected = step.status === "REJECTED";
            const isChanges = step.status === "CHANGES_REQUESTED";
            const isCurrent = idx === currentStepIndex && overallStatus !== "APPROVED" && overallStatus !== "REJECTED";

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-full -ml-[1px] ${
                      isCompleted ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Status Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : isRejected ? (
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-4 ring-white">
                      <XCircle className="w-5 h-5" />
                    </div>
                  ) : isChanges ? (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center ring-4 ring-white">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-4 ring-white animate-pulse">
                      <Clock className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center ring-4 ring-white text-xs font-semibold">
                      {step.stepNumber}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.assignedFacultyName ? `Assigned to: ${step.assignedFacultyName}` : `Role: ${step.assignedRole}`}
                      </p>
                    </div>
                    {step.actionDate && (
                      <span className="text-[11px] text-slate-400">{formatDate(step.actionDate)}</span>
                    )}
                  </div>

                  {step.comments && (
                    <div
                      className={`mt-2 p-3 rounded-xl text-xs border ${
                        isRejected
                          ? "bg-rose-50/70 border-rose-200 text-rose-900"
                          : isChanges
                          ? "bg-amber-50/70 border-amber-200 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-semibold block mb-0.5">
                        {isRejected ? "Reason for Rejection:" : isChanges ? "Changes Requested:" : "Decision Note:"}
                      </span>
                      {step.comments}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
