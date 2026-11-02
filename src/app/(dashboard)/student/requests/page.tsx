"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  Filter,
  FilePlus,
  ChevronRight,
  Files,
  Loader2,
  Calendar,
  Building,
} from "lucide-react";

export default function StudentRequestsListPage() {
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
      params.append("limit", "10");

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
    <DashboardLayout title="My Applications" requiredRole="STUDENT">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            My Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalCount} total application{totalCount === 1 ? "" : "s"} filed across campus departments
          </p>
        </div>

        <Link href="/student/requests/new">
          <Button size="sm">
            <FilePlus className="w-3.5 h-3.5 mr-1" /> New Application
          </Button>
        </Link>
      </div>

      {/* Unified Table Container */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Integrated Filter Bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request # or subject..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </form>

          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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
              className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Fetching real application records...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <Files className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">No matching applications</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search criteria or create a new request.
            </p>
            <Link href="/student/requests/new">
              <Button size="sm">Create Request</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {req.requestNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[280px] truncate">
                        {req.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <TypeBadge type={req.type} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {req.departmentId?.code || "ADMIN"}
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
                        <Link href={`/student/requests/${req._id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Details
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

                  <Link href={`/student/requests/${req._id}`} className="block group">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {req.title}
                    </h4>
                  </Link>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <TypeBadge type={req.type} />
                    <PriorityBadge priority={req.priority} />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      <Building className="w-3 h-3 text-slate-400" />
                      {req.departmentId?.code || "ADMIN"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(req.createdAt)}
                    </span>
                    <Link href={`/student/requests/${req._id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                        Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination controls */}
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
