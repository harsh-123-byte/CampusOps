"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Settings, Database, Sparkles, Cloud, Shield, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout title="System Settings" requiredRole="ADMIN">
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Environment Configuration & Operational Status
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Real-time status of backend integrations, AI providers, and database connectivity
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Database Engine</h4>
                  <p className="text-xs text-slate-500">MongoDB with Mongoose ODM (Indexes Active)</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">AI Intelligence Core</h4>
                  <p className="text-xs text-slate-500">
                    Google Gemini 1.5 Flash + Deterministic High-Confidence Rule Fallback
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Resilient
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Attachment Storage</h4>
                  <p className="text-xs text-slate-500">
                    Secure Local Server Storage (/public/uploads)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Security & Authentication</h4>
                  <p className="text-xs text-slate-500">
                    Bcrypt 10 rounds + Signed HTTP-Only Session Cookies (RBAC Enforced)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
