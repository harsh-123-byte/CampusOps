"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Search, Loader2 } from "lucide-react";

export default function FacultyProcessedPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProcessed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/requests?limit=50");
      if (res.ok) {
        const data = await res.json();
        const all = data.requests || [];
        const processed = all.filter((r: any) =>
          ["APPROVED", "REJECTED", "CHANGES_REQUESTED"].includes(r.status)
        );
        setRequests(processed);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessed();
  }, []);

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.requestNumber?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.studentId?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Processed Applications" requiredRole="FACULTY">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Processed History ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">
              Applications previously approved, rejected, or modified with recorded comments
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search processed records..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">
            No processed applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Processed Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.requestNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {req.studentId?.name || "Student"}
                    </td>
                    <td className="py-3.5 px-4">
                      <TypeBadge type={req.type} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 max-w-[260px] truncate">
                      {req.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(req.completedAt || req.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/faculty/requests/${req._id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
