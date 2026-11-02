"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FilePlus,
  Files,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/requests?limit=10")
      .then((res) => res.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = requests.length;
  const pending = requests.filter((r) => ["SUBMITTED", "IN_REVIEW"].includes(r.status)).length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;
  const changes = requests.filter((r) => r.status === "CHANGES_REQUESTED").length;

  const chartData = [
    { name: "Approved", value: approved, color: "#10b981" },
    { name: "Pending", value: pending, color: "#3b82f6" },
    { name: "Changes", value: changes, color: "#f59e0b" },
    { name: "Rejected", value: rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout title="Student Overview" requiredRole="STUDENT">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track student petitions, certificates, and departmental requests in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/student/requests">
            <Button variant="outline" size="sm">
              <Files className="w-3.5 h-3.5 mr-1" />
              All Requests
            </Button>
          </Link>
          <Link href="/student/requests/new">
            <Button size="sm">
              <FilePlus className="w-3.5 h-3.5 mr-1" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Filed</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{total}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">All registered requests</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Under Review</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{pending}</p>
          <span className="text-xs text-blue-600 font-medium mt-0.5 block">Awaiting faculty review</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Approved</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{approved}</p>
          <span className="text-xs text-emerald-600 font-medium mt-0.5 block">Ready for download</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Attention</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{changes + rejected}</p>
          <span className="text-xs text-amber-600 font-medium mt-0.5 block">
            {changes} changes, {rejected} rejected
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Status Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Applications</h3>
              <p className="text-xs text-slate-500">Your latest workflow submissions</p>
            </div>
            <Link
              href="/student/requests"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading your applications...</div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center">
                <Files className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No applications yet</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Submit your first bonafide, NOC, or lab request to get started.
                </p>
                <Link href="/student/requests/new">
                  <Button size="sm">Create Request</Button>
                </Link>
              </div>
            ) : (
              requests.slice(0, 5).map((req) => (
                <Link
                  key={req._id}
                  href={`/student/requests/${req._id}`}
                  className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group block"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-mono font-medium text-slate-700">
                        {req.requestNumber}
                      </span>
                      <TypeBadge type={req.type} />
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {req.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(req.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={req.status} />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Status Distribution Visual Chart */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Application Breakdown</h3>
            <p className="text-xs text-slate-500 mb-3">Distribution by approval outcome</p>

            {chartData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                No request statistics to chart
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 mt-3 text-xs text-slate-600">
            <span className="font-medium text-slate-900 block mb-0.5">Pre-submission Verification</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Required documents are verified automatically to prevent departmental delays.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
