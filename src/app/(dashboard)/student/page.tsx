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
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-200 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            AI-Assisted Workflow Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Submit bonafide requests, internship NOCs, and lab permissions without standing in queues.
            Track real-time faculty approvals and receive automated status alerts.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/student/requests/new">
              <Button size="md" className="bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25">
                <FilePlus className="w-4 h-4" />
                Submit New Request
              </Button>
            </Link>
            <Link href="/student/requests">
              <Button size="md" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Files className="w-4 h-4" />
                View All Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Filed</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{total}</p>
          <span className="text-xs text-slate-400 mt-1 block">All registered requests</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{pending}</p>
          <span className="text-xs text-blue-600 font-medium mt-1 block">Awaiting faculty sign-off</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{approved}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Ready for download</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Attention</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{changes + rejected}</p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">
            {changes} changes requested, {rejected} rejected
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Status Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Applications</h3>
              <p className="text-xs text-slate-500">Your latest campus workflow submissions</p>
            </div>
            <Link
              href="/student/requests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading your applications...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <Files className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-800">No applications yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
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
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group block"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-slate-900">
                        {req.requestNumber}
                      </span>
                      <TypeBadge type={req.type} />
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(req.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={req.status} />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Status Distribution Visual Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Application Health</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution by approval outcome</p>

            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                No request statistics to chart
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
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

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 mt-4">
            <span className="text-xs font-semibold text-blue-900 block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Automated AI Assistant
            </span>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Before submitting, use our Gemini AI Reviewer to verify required attachments and prevent application delays.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
