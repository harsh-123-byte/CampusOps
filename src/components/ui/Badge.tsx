import React from "react";
import { cn } from "@/lib/utils";
import { RequestStatus, RequestPriority, RequestType } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200",
    outline: "border-slate-300 text-slate-700 bg-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
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
      return <Badge variant="success">Approved</Badge>;
    case "SUBMITTED":
      return <Badge variant="info">Submitted</Badge>;
    case "IN_REVIEW":
      return <Badge variant="purple">In Review</Badge>;
    case "CHANGES_REQUESTED":
      return <Badge variant="warning">Changes Requested</Badge>;
    case "REJECTED":
      return <Badge variant="danger">Rejected</Badge>;
    case "CANCELLED":
      return <Badge variant="default">Cancelled</Badge>;
    case "DRAFT":
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  switch (priority) {
    case "URGENT":
      return <Badge variant="danger">⚡ Urgent</Badge>;
    case "HIGH":
      return <Badge variant="warning">High Priority</Badge>;
    case "LOW":
      return <Badge variant="default">Low</Badge>;
    case "NORMAL":
    default:
      return <Badge variant="outline">Normal</Badge>;
  }
}

export function TypeBadge({ type }: { type: RequestType }) {
  const map: Record<RequestType, { label: string; variant: any }> = {
    BONAFIDE: { label: "Bonafide", variant: "info" },
    NOC: { label: "NOC", variant: "purple" },
    EVENT_PERMISSION: { label: "Event Permission", variant: "success" },
    LAB_ACCESS: { label: "Lab Access", variant: "warning" },
    MAINTENANCE: { label: "Maintenance", variant: "danger" },
    OTHER: { label: "Other", variant: "default" },
  };

  const item = map[type] || { label: type, variant: "default" };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
