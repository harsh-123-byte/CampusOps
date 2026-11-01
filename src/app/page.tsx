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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">CampusOps</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Platform Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow Engine
            </a>
            <a href="#ai" className="hover:text-white transition-colors">
              Gemini AI Integration
            </a>
            <a href="#roles" className="hover:text-white transition-colors">
              Role Access
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm px-2.5 sm:px-3">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 text-xs sm:text-sm px-2.5 sm:px-3">
                <span className="hidden sm:inline">Student Portal</span>
                <span className="sm:hidden">Register</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Next-Gen AI-Powered Campus Workflow Management
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto text-white leading-[1.12]">
            Your Campus. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Smarter. Faster. Connected.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One intelligent platform to simplify campus requests, automate approvals, and seamlessly connect students, faculty, and administration.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 text-base px-8 py-3 rounded-xl font-semibold">
                Sign In to CampusOps
                <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-base px-8 py-3 rounded-xl">
                Explore Platform Features
              </Button>
            </a>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-700/60 to-slate-800/20 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl text-left">
              {/* Window Controls */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">campusops.college.edu/dashboard</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ● Real-time MongoDB Active
                </span>
              </div>

              {/* Mock Dashboard Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/90">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Incoming Requests</span>
                    <p className="text-2xl font-bold text-white mt-1">48 Applications</p>
                    <span className="text-xs text-blue-400 font-medium">Auto-classified via Gemini</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Average Sign-off</span>
                    <p className="text-2xl font-bold text-white mt-1">4.2 Hours</p>
                    <span className="text-xs text-emerald-400 font-medium">85% reduction in queue wait</span>
                  </div>
                </div>

                <div className="md:col-span-2 p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" /> Live Workflow Dispatch
                    </span>
                    <span className="text-[10px] text-slate-400">Step 1: Faculty Advisor Review</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-400">REQ-2026-0002</span>
                        <p className="font-semibold text-white">Google Summer Internship NOC</p>
                        <span className="text-slate-400 text-[10px]">Aiden Scott • Computer Science</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        In Review
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-400">REQ-2026-0001</span>
                        <p className="font-semibold text-white">National Scholarship Bonafide</p>
                        <span className="text-slate-400 text-[10px]">Maya Patel • ECE</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Approved & Sealed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/60 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
              Enterprise Grade Automation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Modern Campus Operations
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Replace slow manual paperwork, repetitive follow-ups, and lost forms with a transparent digital pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-lg hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dynamic Multi-Category Filing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart forms customized for Bonafide certificates, Internship NOCs, Lab and GPU cluster access, Club events, and facility repairs.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-lg hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Tier Approval Pipelines</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurable 1-step and 2-step faculty authorizations. Mandatory rejection reasons and revision feedback maintain complete fairness.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-lg hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gemini AI Document Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically parse offer letters and transcripts to auto-fill registration numbers, names, and validity with deterministic offline fallbacks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
              Transparent Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How CampusOps Works
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              A verifiable 4-step workflow connecting students and faculty without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
              <span className="text-3xl font-extrabold text-blue-500/20 absolute top-4 right-4">01</span>
              <h4 className="font-bold text-white text-base mb-2">Student Submits</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student fills request parameters, uploads proof documents, and verifies details with AI copilot.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
              <span className="text-3xl font-extrabold text-indigo-500/20 absolute top-4 right-4">02</span>
              <h4 className="font-bold text-white text-base mb-2">AI Pre-Screening</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini extracts key credentials, classifies priority, and checks for missing prerequisites.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
              <span className="text-3xl font-extrabold text-purple-500/20 absolute top-4 right-4">03</span>
              <h4 className="font-bold text-white text-base mb-2">Faculty Evaluates</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assigned faculty reviews the application in their Inbox to approve, reject with reason, or request changes.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
              <span className="text-3xl font-extrabold text-emerald-500/20 absolute top-4 right-4">04</span>
              <h4 className="font-bold text-white text-base mb-2">Live Notification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student receives real-time notification with digital approval seal and timestamped certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Matrix */}
      <section id="roles" className="py-24 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
              Role-Based Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Student Portal</h3>
                  <span className="text-xs text-slate-400">Application Submissions</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Apply for Bonafide, NOC, Lab Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Real-time visual approval timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  AI Document Auto-Fill & Drafting Copilot
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  One-click resubmission for requested edits
                </li>
              </ul>
            </div>

            {/* Faculty */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Faculty Portal</h3>
                  <span className="text-xs text-slate-400">Evaluation & Sign-Off</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Dedicated Approval Inbox queue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Inspect uploaded student credentials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Mandatory justification on rejections
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Processed history and audit logs
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Administration Portal</h3>
                  <span className="text-xs text-slate-400">Institutional Governance</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  User & Department RBAC Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Gemini AI Workflow Bottleneck Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Comprehensive Recharts trends & volume stats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Cryptographic, immutable audit trail
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Digitize Your Campus Operations Today
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Fast document generation, multi-stage approvals, and clear administrative oversight all in one unified platform.
          </p>

          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-blue-600/30">
              Access Institutional Portal <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">CampusOps</span>
            <span>— AI-Powered Campus Workflow Platform</span>
          </div>
          <p>© 2026 CampusOps. Built with Next.js, MongoDB Atlas, and Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
