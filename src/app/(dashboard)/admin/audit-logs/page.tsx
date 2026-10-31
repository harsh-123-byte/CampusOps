"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, Search, Filter, Loader2 } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter !== "ALL") params.append("entityType", entityFilter);
      params.append("limit", "100");

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <DashboardLayout title="System Audit Logs" requiredRole="ADMIN">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Immutable Audit Trail ({logs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographic and timestamped trail of all approval decisions, logins, and workflow changes
          </p>
        </div>

        <div className="w-full sm:w-60">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="SERVICE_REQUEST">Service Requests</option>
            <option value="USER">User Accounts</option>
            <option value="DEPARTMENT">Departments</option>
            <option value="AUTH">Authentication / Logins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Reading immutable audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity Reference</th>
                  <th className="py-3 px-4">Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-sans">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4 font-sans text-slate-800">
                      {log.actorId?.name || "System"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-sans font-semibold">
                        {log.actorId?.role || "AUTO"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-600">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[140px]">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-[240px] truncate text-[11px]">
                      {JSON.stringify(log.details || {})}
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
