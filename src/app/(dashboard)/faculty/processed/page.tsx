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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Processed History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Applications previously approved, rejected, or modified with recorded timestamps
          </p>
        </div>
      </div>

      {/* Unified Table Container */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search processed records..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filtered.map((req) => (
                <div key={req._id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {req.requestNumber}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">{req.studentId?.name || "Student"}</span>
                  </div>

                  <Link href={`/faculty/requests/${req._id}`} className="block group">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {req.title}
                    </h4>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <TypeBadge type={req.type} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                    <span>{formatDate(req.completedAt || req.updatedAt)}</span>
                    <Link href={`/faculty/requests/${req._id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
