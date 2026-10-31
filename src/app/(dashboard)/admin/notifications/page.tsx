"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatTimeAgo, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/v1/notifications/mark-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  return (
    <DashboardLayout title="System Alerts" requiredRole="ADMIN">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Administration Alerts</h2>
            <p className="text-xs text-slate-500">Security, operational, and critical workflow notifications</p>
          </div>

          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading alerts...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">
            No active administrative notifications.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4 ${
                  !n.isRead ? "bg-purple-50/20" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    {formatDate(n.createdAt)} • {formatTimeAgo(n.createdAt)}
                  </span>
                </div>

                {n.link && (
                  <Link href={n.link}>
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
                      Inspect <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
