"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Files, Loader2 } from "lucide-react";

export default function AdminAllRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (status !== "ALL") params.append("status", status);
      if (type !== "ALL") params.append("type", type);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await fetch(`/api/v1/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <DashboardLayout title="Master Request Registry" requiredRole="ADMIN">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campus-Wide Applications Registry</h2>
            <p className="text-xs text-slate-500">
              Total {totalCount} applications across all student cohorts and departments
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request #, student name, or title..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="BONAFIDE">Bonafide Certificate</option>
              <option value="NOC">No Objection (NOC)</option>
              <option value="EVENT_PERMISSION">Event Permission</option>
              <option value="LAB_ACCESS">Lab Access</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading master registry...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">No applications found.</div>
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
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
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
                      <td className="py-3.5 px-4 text-slate-600">
                        {req.departmentId?.code || "ADMIN"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[240px] truncate">
                        {req.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/requests/${req._id}`}>
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
              {requests.map((req) => (
                <div key={req._id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {req.requestNumber}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">{req.studentId?.name || "Student"}</span>
                    <span className="text-slate-400 ml-1.5">• {req.departmentId?.code || "ADMIN"}</span>
                  </div>

                  <Link href={`/admin/requests/${req._id}`} className="block group">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {req.title}
                    </h4>
                  </Link>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={req.type} />
                    <PriorityBadge priority={req.priority} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                    <span>{formatDate(req.createdAt)}</span>
                    <Link href={`/admin/requests/${req._id}`}>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
