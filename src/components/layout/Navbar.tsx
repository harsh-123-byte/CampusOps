"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export function Navbar({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Role status pill */}
        {user && (
          <Badge
            variant={
              user.role === "ADMIN"
                ? "purple"
                : user.role === "FACULTY"
                ? "info"
                : "success"
            }
            className="text-xs font-semibold px-2.5 py-0.5 uppercase tracking-wider hidden sm:inline-flex"
          >
            {user.role}
          </Badge>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar and profile pill */}
        {user && (
          <Link
            href={`/${user.role.toLowerCase()}/profile`}
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 block">
                {user.role} {user.rollNumber ? `• ${user.rollNumber}` : ""}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
