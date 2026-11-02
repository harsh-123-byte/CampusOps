"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setLoginFailed(false);
    const ok = await login(email, password);
    if (!ok) {
      setLoginFailed(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-8 h-8 rounded-md bg-white text-slate-950 flex items-center justify-center font-bold text-xs tracking-tight">
              CO
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CampusOps</span>
          </Link>
          <p className="text-xs text-slate-400">Campus Workflow & Approvals Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access your dashboard</p>
          </div>

          {/* Error Message */}
          {loginFailed && (
            <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <p className="font-semibold text-rose-200">Invalid email or password</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Please check your email and password, or create an account if you haven&apos;t registered yet.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-700 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-700 transition-colors"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Create Account (Student / Faculty / Admin)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
