"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Inbox,
  CheckCircle,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Sparkles,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case "STUDENT":
        return [
          { name: "Overview", href: "/student", icon: LayoutDashboard },
          { name: "My Requests", href: "/student/requests", icon: Files },
          { name: "New Request", href: "/student/requests/new", icon: FilePlus, highlight: true },
          { name: "Notifications", href: "/student/notifications", icon: Bell },
          { name: "Profile", href: "/student/profile", icon: User },
        ];
      case "FACULTY":
        return [
          { name: "Overview", href: "/faculty", icon: LayoutDashboard },
          { name: "Approval Inbox", href: "/faculty/inbox", icon: Inbox, highlight: true },
          { name: "Processed Requests", href: "/faculty/processed", icon: CheckCircle },
          { name: "Notifications", href: "/faculty/notifications", icon: Bell },
          { name: "Profile", href: "/faculty/profile", icon: User },
        ];
      case "ADMIN":
        return [
          { name: "Overview", href: "/admin", icon: LayoutDashboard },
          { name: "All Requests", href: "/admin/requests", icon: Files },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Departments", href: "/admin/departments", icon: Building2 },
          { name: "Analytics & Trends", href: "/admin/analytics", icon: BarChart3 },
          { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
          { name: "Notifications", href: "/admin/notifications", icon: Bell },
          { name: "Settings", href: "/admin/settings", icon: Settings },
          { name: "Profile", href: "/admin/profile", icon: User },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={cn(
          "bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none z-50 transition-all duration-200 ease-in-out",
          // Desktop positioning: static sticky sidebar
          "hidden md:flex md:w-64 md:relative md:inset-auto md:translate-x-0",
          // Mobile positioning: slide-over drawer
          isOpen
            ? "fixed inset-y-0 left-0 w-72 flex translate-x-0 shadow-2xl"
            : "fixed inset-y-0 left-0 w-72 -translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/90 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
              CO
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-white tracking-tight text-sm block leading-none">
                CampusOps
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize block mt-1 leading-none">
                {user.role.toLowerCase()} portal
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Menu
          </div>
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${user.role.toLowerCase()}` && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs sm:text-[13px] font-medium transition-colors group",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40">
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700/80 flex items-center justify-center text-[11px] font-semibold text-slate-200 shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
