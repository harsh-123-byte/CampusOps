"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Building2, Shield, Hash } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Administrator Profile" requiredRole="ADMIN">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">
                Institutional Administrator • ID: {user?.employeeId || "ADM-9001"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Administrative Email
              </span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department / Office
              </span>
              <span className="font-semibold text-slate-800">Registrar & Academic Affairs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1 mb-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Administrative Badge
              </span>
              <span className="font-semibold text-slate-800">{user?.employeeId || "ADM-9001"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Super-Admin Clearance
              </span>
              <span className="font-semibold text-purple-600">Full System Configuration Access</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
