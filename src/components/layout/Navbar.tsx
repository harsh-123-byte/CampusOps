"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title?: string;
  onToggleAIChat?: () => void;
  isAIChatOpen?: boolean;
}

export function Navbar({ title, onToggleAIChat, isAIChatOpen }: NavbarProps) {
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

        {/* AI Assistant Toggle Button */}
        {onToggleAIChat && (
          <button
            type="button"
            onClick={onToggleAIChat}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer",
              isAIChatOpen
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                : "bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 border-slate-200 shadow-2xs"
            )}
            title="Campus AI Copilot (Documents, Timeline, Scholarships)"
          >
            <Sparkles className={cn("w-3.5 h-3.5", isAIChatOpen ? "text-amber-300 animate-pulse" : "text-blue-600")} />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        )}

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
