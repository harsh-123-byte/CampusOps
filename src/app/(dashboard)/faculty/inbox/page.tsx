"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, TypeBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Inbox, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

export default function FacultyInboxPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/requests?limit=50");
      if (res.ok) {
        const data = await res.json();
        const all = data.requests || [];
        // Filter only pending requests
        const pending = all.filter((r: any) => ["SUBMITTED", "IN_REVIEW"].includes(r.status));
        setRequests(pending);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.requestNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = type === "ALL" || r.type === type;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout title="Approval Inbox" requiredRole="FACULTY">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-600" />
              Pending Applications ({filteredRequests.length})
            </h2>
            <p className="text-xs text-slate-500">
              Applications assigned to your department requiring verification and official action
            </p>
          </div>
        </div>

        {/* Search & filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, request #, or subject..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading pending applications...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">Inbox is empty</h4>
            <p className="text-xs text-slate-500 mt-1">
              You have no pending requests requiring approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Applicant Student</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.requestNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{req.studentId?.name || "Student"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {req.studentId?.rollNumber || "ID Pending"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <TypeBadge type={req.type} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[260px] truncate">
                      {req.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/faculty/requests/${req._id}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                          Review & Sign
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
