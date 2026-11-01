"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AIChatSidebar } from "@/components/layout/AIChatSidebar";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check localStorage or window width on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("campusops_ai_chat_open");
      if (stored !== null) {
        setIsAIChatOpen(stored === "true");
      } else if (window.innerWidth >= 1280) {
        // Default to open on desktop screens
        setIsAIChatOpen(true);
      }
    }
  }, []);

  const handleToggleAIChat = () => {
    setIsAIChatOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("campusops_ai_chat_open", String(next));
      }
      return next;
    });
  };

  const handleCloseAIChat = () => {
    setIsAIChatOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusops_ai_chat_open", "false");
    }
  };

  const handleOpenAIChat = () => {
    setIsAIChatOpen(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusops_ai_chat_open", "true");
    }
  };

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
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={title}
          onToggleAIChat={handleToggleAIChat}
          isAIChatOpen={isAIChatOpen}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">{children}</div>
        </main>
      </div>
      <AIChatSidebar
        isOpen={isAIChatOpen}
        onClose={handleCloseAIChat}
        onOpen={handleOpenAIChat}
        onToggle={handleToggleAIChat}
      />
    </div>
  );
}
