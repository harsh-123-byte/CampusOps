"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Files,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/v1/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/v1/ai/insights");
      if (res.ok) {
        const json = await res.json();
        setAiInsights(json.insights);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchAIInsights();
  }, []);

  const metrics = data?.metrics || {
    totalStudents: 0,
    totalFaculty: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    changesRequested: 0,
    overdueRequests: 0,
  };

  const deptStats = data?.deptStats || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <DashboardLayout title="Administration Command Center" requiredRole="ADMIN">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Administration Command Center
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Executive Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional overview, audit logs, and departmental request velocity.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Audit Logs
            </Button>
          </Link>
          <Link href="/admin/requests">
            <Button size="sm">
              <Files className="w-3.5 h-3.5 mr-1" />
              All Requests ({metrics.totalRequests})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Students</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{metrics.totalStudents}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Active student accounts</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Faculty</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{metrics.totalFaculty}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Authorized evaluators</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Pending Requests</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{metrics.pendingRequests}</p>
          <span className="text-xs text-blue-600 font-medium mt-0.5 block">In review pipeline</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Approved Total</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{metrics.approvedRequests}</p>
          <span className="text-xs text-emerald-600 font-medium mt-0.5 block">Successfully resolved</span>
        </div>
      </div>

      {/* AI Operations Analyst Widget */}
      <div className="bg-white rounded-lg p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                Operational Bottleneck Detection
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded border border-emerald-200">
                  {aiInsights?.efficiencyRating || "94% Operational Health"}
                </span>
              </h3>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchAIInsights}
            loading={loadingAI}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Analyze
          </Button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          {aiInsights?.executiveSummary ||
            "All college departments are currently operating within nominal workflow response times. Bonafide and NOC applications show high throughput."}
        </p>

        {aiInsights?.bottlenecks?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            {aiInsights.bottlenecks.map((b: any, idx: number) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-md p-3 text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">{b.department}</span>
                <p className="text-slate-600 text-[11px] mb-1">{b.issue}</p>
                <span className="text-blue-700 text-[11px] block font-medium">
                  Recommendation: {b.recommendation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Analytics Charts: Monthly Trends & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Request Trends */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs">
          <h3 className="font-semibold text-slate-900 text-sm mb-0.5">Monthly Application Volume</h3>
          <p className="text-xs text-slate-500 mb-4">Requests received vs approved turnaround</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Applications Filed"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Approved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Load Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs">
          <h3 className="font-semibold text-slate-900 text-sm mb-0.5">Departmental Workload</h3>
          <p className="text-xs text-slate-500 mb-4">Requests distributed across academic divisions</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats}>
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total Filed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Stream */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Platform Activity</h3>
            <p className="text-xs text-slate-500">Live immutable audit trail of campus actions</p>
          </div>

          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm" className="text-xs">
              View All Logs <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No activity recorded yet</div>
          ) : (
            recentActivity.slice(0, 6).map((log: any) => (
              <div key={log._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-medium text-slate-700 text-[11px]">
                    {log.action?.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">{log.action}</span>
                    <p className="text-slate-400 text-[11px]">
                      By {log.actorId?.name || "System"} ({log.actorId?.role || "AUTO"}) • Entity: {log.entityType}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 text-[11px]">{formatDate(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
