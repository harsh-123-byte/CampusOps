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
    <div className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-slate-700" />
        Official Approval Pipeline
      </h3>

      <div className="relative">
        <div className="space-y-7">
          {steps.map((step, idx) => {
            const isCompleted = step.status === "APPROVED";
            const isRejected = step.status === "REJECTED";
            const isChanges = step.status === "CHANGES_REQUESTED";
            const isCurrent = idx === currentStepIndex && overallStatus !== "APPROVED" && overallStatus !== "REJECTED";

            return (
              <div key={idx} className="relative flex items-start gap-3.5">
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-3.5 top-7 w-px h-full -ml-[0.5px] ${
                      isCompleted ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Status Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isRejected ? (
                    <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                  ) : isChanges ? (
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-300 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center text-xs font-medium">
                      {step.stepNumber}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{step.title}</h4>
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
                      className={`mt-2 p-2.5 rounded-md text-xs border ${
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
