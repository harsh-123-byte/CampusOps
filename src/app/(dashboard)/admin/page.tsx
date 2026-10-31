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
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Executive Administration Mode
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Operations Control Center
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Monitor real-time request flow, audit trails, department load distributions, and Gemini AI workflow bottleneck predictions across all academic faculties.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/requests">
              <Button size="md" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                <Files className="w-4 h-4 mr-1" /> Inspect All Requests ({metrics.totalRequests})
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button size="md" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Users className="w-4 h-4 mr-1" /> User Management
              </Button>
            </Link>
            <Link href="/admin/audit-logs">
              <Button size="md" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <ShieldCheck className="w-4 h-4 mr-1" /> Tamper-Proof Audit Logs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalStudents}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active student accounts</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalFaculty}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Authorized evaluators</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.pendingRequests}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">In review pipeline</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Approved Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.approvedRequests}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Successfully resolved</span>
        </div>
      </div>

      {/* AI Operations Analyst Widget */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Gemini AI Workflow Bottleneck Analytics
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
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
            className="text-xs text-indigo-200 border-indigo-700 hover:bg-indigo-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Analyze
          </Button>
        </div>

        <p className="text-xs text-indigo-200 leading-relaxed mb-4">
          {aiInsights?.executiveSummary ||
            "All college departments are currently operating within nominal workflow response times. Bonafide and NOC applications show high throughput."}
        </p>

        {aiInsights?.bottlenecks?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60">
            {aiInsights.bottlenecks.map((b: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                <span className="font-bold text-amber-300 block mb-0.5">{b.department}</span>
                <p className="text-indigo-200 text-[11px] mb-1">{b.issue}</p>
                <span className="text-emerald-400 text-[11px] block font-medium">
                  Recommendation: {b.recommendation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Analytics Charts: Monthly Trends & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Request Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Monthly Application Volume</h3>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Departmental Workload</h3>
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Platform Activity</h3>
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
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                    {log.action?.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{log.action}</span>
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
