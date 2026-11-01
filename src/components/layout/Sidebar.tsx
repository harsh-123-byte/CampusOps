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
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base block">CampusOps</span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
                {user.role} PORTAL
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
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
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : link.highlight
                    ? "bg-slate-800/80 text-blue-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
