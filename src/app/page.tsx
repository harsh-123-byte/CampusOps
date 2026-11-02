"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Bot,
  GraduationCap,
  Building2,
  Users,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-md bg-white text-slate-950 flex items-center justify-center font-bold text-xs tracking-tight">
              CO
            </div>
            <span className="font-semibold text-sm sm:text-base tracking-tight text-white">CampusOps</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Platform Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow Engine
            </a>
            <a href="#ai" className="hover:text-white transition-colors">
              AI Verification
            </a>
            <a href="#roles" className="hover:text-white transition-colors">
              Role Access
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-900 text-xs px-3">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs px-3">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Register</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Institutional Workflow Automation Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-white leading-tight">
            Streamlined Campus Operations & Approvals
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            One unified platform to eliminate administrative paper trails, automate faculty reviews, and track institutional service requests with cryptographic auditability.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="md" className="w-full sm:w-auto px-6 text-xs sm:text-sm">
                Sign In to CampusOps
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="md" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm px-6">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-lg border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-left">
            {/* Window Controls */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="text-[11px] text-slate-500 font-mono ml-2">campusops.college.edu/dashboard</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> System Operational
              </span>
            </div>

            {/* Mock Dashboard Body */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/90 text-xs">
              <div className="space-y-3">
                <div className="p-3.5 rounded-md bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active Queue</span>
                  <p className="text-xl font-bold text-white mt-1">48 Applications</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Automated routing active</span>
                </div>
                <div className="p-3.5 rounded-md bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Avg Turnaround</span>
                  <p className="text-xl font-bold text-white mt-1">4.2 Hours</p>
                  <span className="text-[11px] text-emerald-400 mt-0.5 block">85% queue reduction</span>
                </div>
              </div>

              <div className="md:col-span-2 p-4 rounded-md bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-400" /> Live Request Pipeline
                  </span>
                  <span className="text-[10px] text-slate-500">Real-time status</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[11px] text-slate-400">REQ-2026-0002</span>
                      <p className="font-medium text-slate-200">Google Summer Internship NOC</p>
                      <span className="text-slate-500 text-[10px]">Aiden Scott • Computer Science</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      In Review
                    </span>
                  </div>

                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[11px] text-slate-400">REQ-2026-0001</span>
                      <p className="font-medium text-slate-200">National Scholarship Bonafide</p>
                      <span className="text-slate-500 text-[10px]">Maya Patel • ECE</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/30 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Institutional Reliability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Replace paperwork, email chains, and manual sign-offs with structured digital workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6 transition-colors">
              <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mb-4">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Dynamic Multi-Category Filing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Forms configured for Bonafide certificates, Internship NOCs, Lab and HPC workstation access, Club events, and maintenance tickets.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6 transition-colors">
              <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mb-4">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Multi-Tier Approval Pipelines</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurable departmental authorizations with recorded justification notes, revision requests, and transparent status timestamps.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6 transition-colors">
              <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mb-4">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Gemini AI Document Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated pre-screening of supporting documentation to verify student identifiers, extract key dates, and flag missing paperwork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How CampusOps Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              A transparent 4-stage pipeline connecting students, faculty, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 relative">
              <span className="text-xs font-mono font-semibold text-slate-500 mb-2 block">Stage 01</span>
              <h4 className="font-semibold text-white text-xs sm:text-sm mb-1.5">Student Submits</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student fills required parameters, attaches supporting documentation, and reviews with AI assistance.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 relative">
              <span className="text-xs font-mono font-semibold text-slate-500 mb-2 block">Stage 02</span>
              <h4 className="font-semibold text-white text-xs sm:text-sm mb-1.5">Pre-Screening</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini validates mandatory attachments, extracts credential metadata, and sets priority tier.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 relative">
              <span className="text-xs font-mono font-semibold text-slate-500 mb-2 block">Stage 03</span>
              <h4 className="font-semibold text-white text-xs sm:text-sm mb-1.5">Faculty Reviews</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assigned faculty advisor assesses the filing directly from their inbox to approve, reject, or request revisions.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 relative">
              <span className="text-xs font-mono font-semibold text-slate-500 mb-2 block">Stage 04</span>
              <h4 className="font-semibold text-white text-xs sm:text-sm mb-1.5">Instant Notification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Applicant receives timestamped in-app alerts and official decision records immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Matrix */}
      <section id="roles" className="py-20 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Role Separation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm">Student Portal</h3>
                  <span className="text-[11px] text-slate-500">Service Requests</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Apply for Bonafide, NOC, and Lab Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Real-time visual approval timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  AI Document Auto-Fill & Drafting Copilot
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  One-click resubmission for requested edits
                </li>
              </ul>
            </div>

            {/* Faculty */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm">Faculty Portal</h3>
                  <span className="text-[11px] text-slate-500">Evaluation & Sign-Off</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Dedicated Approval Inbox queue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Inspect uploaded student credentials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Mandatory justification on rejections
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Processed history and audit logs
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm">Administration Portal</h3>
                  <span className="text-[11px] text-slate-500">Governance & Analytics</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  User & Department RBAC Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Gemini AI Workflow Bottleneck Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Volume metrics and processing charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Master registry audit trail
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-800/80 relative text-center">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Digitize Your Campus Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6">
            Multi-tier approvals, verified document handling, and real-time oversight in a production-ready institutional portal.
          </p>

          <Link href="/login">
            <Button size="md" className="px-6 text-xs sm:text-sm">
              Access Institutional Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CampusOps</span>
            <span>— Institutional Workflow & Approvals Platform</span>
          </div>
          <p>© 2026 CampusOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
