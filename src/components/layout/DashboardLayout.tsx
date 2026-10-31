"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function DashboardLayout({
  children,
  title,
  requiredRole,
}: {
  children: React.ReactNode;
  title?: string;
  requiredRole?: "STUDENT" | "FACULTY" | "ADMIN";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && requiredRole && user.role !== requiredRole && user.role !== "ADMIN") {
      router.push(`/${user.role.toLowerCase()}`);
    }
  }, [user, loading, requiredRole, router]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Securing session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
