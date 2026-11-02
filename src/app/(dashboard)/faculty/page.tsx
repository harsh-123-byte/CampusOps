"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  UserCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function FacultyOverviewPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/requests?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = requests.filter((r) =>
    ["SUBMITTED", "IN_REVIEW"].includes(r.status)
  );
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");
  const changesRequests = requests.filter((r) => r.status === "CHANGES_REQUESTED");

  const weeklyLoadData = [
    { day: "Mon", processed: 5, pending: 2 },
    { day: "Tue", processed: 8, pending: 3 },
    { day: "Wed", processed: 12, pending: 4 },
    { day: "Thu", processed: 9, pending: 1 },
    { day: "Fri", processed: pendingRequests.length, pending: 2 },
  ];

  return (
    <DashboardLayout title="Faculty Approval Portal" requiredRole="FACULTY">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Review Portal — {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            You have <span className="font-semibold text-slate-900">{pendingRequests.length} pending applications</span> requiring departmental sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/faculty/processed">
            <Button variant="outline" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              History
            </Button>
          </Link>
          <Link href="/faculty/inbox">
            <Button size="sm">
              <Inbox className="w-3.5 h-3.5 mr-1" />
              Open Inbox ({pendingRequests.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Pending Review</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{pendingRequests.length}</p>
          <span className="text-xs text-blue-600 font-medium mt-0.5 block">Requires official action</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Approved</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{approvedRequests.length}</p>
          <span className="text-xs text-emerald-600 font-medium mt-0.5 block">Authorized endorsements</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Changes Requested</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{changesRequests.length}</p>
          <span className="text-xs text-amber-600 font-medium mt-0.5 block">Awaiting student update</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Rejected</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{rejectedRequests.length}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Ineligible requests</span>
        </div>
      </div>

      {/* Main Grid: Pending Approval Inbox & Weekly Turnaround */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending Approval Inbox */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Pending Approval Inbox</h3>
              <p className="text-xs text-slate-500">Student applications assigned for review</p>
            </div>
            <Link
              href="/faculty/inbox"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Open full inbox <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading inbox...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-800">All caught up!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  There are no pending student applications requiring your approval at this moment.
                </p>
              </div>
            ) : (
              pendingRequests.slice(0, 6).map((req) => (
                <Link
                  key={req._id}
                  href={`/faculty/requests/${req._id}`}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group block"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {req.requestNumber}
                      </span>
                      <TypeBadge type={req.type} />
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted by {req.studentId?.name || "Student"} • {formatDate(req.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={req.status} />
                    <Button size="sm" variant="outline" className="text-xs text-indigo-600 border-indigo-200">
                      Review
                    </Button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Weekly Turnaround Volume Chart */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Weekly Activity</h3>
            <p className="text-xs text-slate-500 mb-3">Volume of student applications processed</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyLoadData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="processed" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 mt-3 text-xs text-slate-600">
            <span className="font-medium text-slate-900 block mb-0.5">Audit Trail Active</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every approval decision, rejection justification, and change request is immutably logged with timestamp.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
