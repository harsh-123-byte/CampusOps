"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title?: string;
  onToggleMobileNav?: () => void;
  onToggleAIChat?: () => void;
  isAIChatOpen?: boolean;
}

export function Navbar({ title, onToggleMobileNav, onToggleAIChat, isAIChatOpen }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md md:hidden cursor-pointer shrink-0 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {title && (
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate max-w-[170px] sm:max-w-xs md:max-w-none">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role status badge */}
        {user && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700 capitalize">
            {user.role.toLowerCase()}
          </span>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* AI Assistant Toggle Button */}
        {onToggleAIChat && (
          <button
            type="button"
            onClick={onToggleAIChat}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer shrink-0 shadow-2xs",
              isAIChatOpen
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
            )}
            title="Campus AI Copilot"
          >
            <Sparkles className={cn("w-3.5 h-3.5", isAIChatOpen ? "text-blue-400" : "text-blue-600")} />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        )}

        {/* User profile link */}
        {user && (
          <Link
            href={`/${user.role.toLowerCase()}/profile`}
            className="flex items-center gap-2 pl-1.5 py-1 pr-1.5 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 shrink-0"
          >
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-semibold text-xs shrink-0">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-medium text-slate-900 block leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
