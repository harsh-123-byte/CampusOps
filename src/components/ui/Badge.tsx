import React from "react";
import { cn } from "@/lib/utils";
import { RequestStatus, RequestPriority, RequestType } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200/80",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80",
    danger: "bg-rose-50 text-rose-800 border-rose-200/80",
    info: "bg-blue-50 text-blue-800 border-blue-200/80",
    purple: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
    outline: "border-slate-200 text-slate-700 bg-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          Approved
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          Submitted
        </Badge>
      );
    case "IN_REVIEW":
      return (
        <Badge variant="purple">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
          In Review
        </Badge>
      );
    case "CHANGES_REQUESTED":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
          Changes Requested
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          Rejected
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="default">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          Cancelled
        </Badge>
      );
    case "DRAFT":
    default:
      return (
        <Badge variant="outline">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          Draft
        </Badge>
      );
  }
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  switch (priority) {
    case "URGENT":
      return (
        <Badge variant="danger" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 animate-none" />
          Urgent
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
          High
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="default">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          Low
        </Badge>
      );
    case "NORMAL":
    default:
      return (
        <Badge variant="outline">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          Normal
        </Badge>
      );
  }
}

export function TypeBadge({ type }: { type: RequestType }) {
  const map: Record<RequestType, { label: string; variant: any }> = {
    BONAFIDE: { label: "Bonafide", variant: "info" },
    NOC: { label: "NOC", variant: "purple" },
    EVENT_PERMISSION: { label: "Event Permission", variant: "default" },
    LAB_ACCESS: { label: "Lab Access", variant: "default" },
    MAINTENANCE: { label: "Maintenance", variant: "default" },
    OTHER: { label: "General", variant: "default" },
  };

  const item = map[type] || { label: type, variant: "default" };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
