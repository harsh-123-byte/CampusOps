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
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-indigo-200 backdrop-blur-md mb-3">
            <UserCheck className="w-3.5 h-3.5 text-indigo-300" />
            Authorized Department Reviewer
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You have <strong className="text-white font-bold">{pendingRequests.length} applications</strong> currently
            awaiting your departmental approval and verification.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/faculty/inbox">
              <Button size="md" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30">
                <Inbox className="w-4 h-4 mr-1" /> Open Approval Inbox ({pendingRequests.length})
              </Button>
            </Link>
            <Link href="/faculty/processed">
              <Button size="md" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Processed History
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{pendingRequests.length}</p>
          <span className="text-xs text-blue-600 font-medium mt-1 block">Requires action</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{approvedRequests.length}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Authorized by faculty</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Changes Requested
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{changesRequests.length}</p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">Awaiting student update</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{rejectedRequests.length}</p>
          <span className="text-xs text-rose-600 font-medium mt-1 block">Ineligible requests</span>
        </div>
      </div>

      {/* Main Grid: Pending Approval Inbox & Weekly Turnaround */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approval Inbox */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pending Approval Inbox</h3>
              <p className="text-xs text-slate-500">Student applications assigned for review</p>
            </div>
            <Link
              href="/faculty/inbox"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Open full inbox <ChevronRight className="w-4 h-4" />
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Weekly Activity</h3>
            <p className="text-xs text-slate-500 mb-4">Volume of student applications processed</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyLoadData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="processed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 mt-4 text-xs text-indigo-900">
            <span className="font-bold block mb-1">Audit Trail Active</span>
            Every approval decision, rejection justification, and change request is immutably logged with timestamp.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
