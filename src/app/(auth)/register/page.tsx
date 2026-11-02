"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    departmentId: "",
    rollNumber: "",
    employeeId: "",
    phone: "",
  });

  useEffect(() => {
    fetch("/api/v1/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch(() => {});

    fetch("/api/v1/auth/admin-exists")
      .then((res) => res.json())
      .then((data) => {
        setAdminExists(data.adminExists);
      })
      .catch(() => setAdminExists(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        if (data.error && data.error.includes("administrator")) {
          setAdminExists(true);
          setFormData((prev) => ({ ...prev, role: "STUDENT" }));
        }
        return;
      }

      toast.success(
        formData.role === "ADMIN"
          ? "Primary Administrator registered successfully! Redirecting..."
          : "Account registered successfully! Redirecting..."
      );
      router.push(`/${formData.role.toLowerCase()}`);
    } catch {
      toast.error("Registration network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-8 h-8 rounded-md bg-white text-slate-950 flex items-center justify-center font-bold text-xs tracking-tight">
              CO
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CampusOps</span>
          </Link>
          <p className="text-xs text-slate-400">Institutional Digital Operations Portal</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">Create an Account</h2>
            {adminExists === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin slot open
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Select Role</label>
                {adminExists === true && (
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Admin registered (Single-Admin locked)
                  </span>
                )}
              </div>
              <div className={cn("grid gap-2", adminExists === true ? "grid-cols-2" : "grid-cols-3")}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "STUDENT" })}
                  className={`py-2 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                    formData.role === "STUDENT"
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "FACULTY" })}
                  className={`py-2 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                    formData.role === "FACULTY"
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Faculty
                </button>
                {adminExists === false && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                    className={`py-2 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                      formData.role === "ADMIN"
                        ? "bg-purple-950/60 border-purple-500 text-purple-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-purple-300"
                    }`}
                  >
                    Admin (You)
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@college.edu"
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="">{formData.role === "ADMIN" ? "General Administration (Auto)" : "Select Department..."}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.role === "STUDENT" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Roll / Reg Number</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. 2024CS1042"
                    className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {formData.role === "ADMIN" ? "Admin Employee ID (Optional)" : "Faculty Employee ID"}
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder={formData.role === "ADMIN" ? "ADM-001" : "FAC-4099"}
                    className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0199"
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-4"
            >
              Complete Registration <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
