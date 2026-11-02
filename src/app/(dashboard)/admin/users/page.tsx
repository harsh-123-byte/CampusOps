"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { Users, UserPlus, Search, ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Create User modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    departmentId: "",
    rollNumber: "",
    employeeId: "",
    phone: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (roleFilter !== "ALL") params.append("role", roleFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetch("/api/v1/departments")
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => {});
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      toast.success("New user created successfully!");
      setShowCreateModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        departmentId: "",
        rollNumber: "",
        employeeId: "",
        phone: "",
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout title="User Management" requiredRole="ADMIN">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            User Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {users.length} institutional user account{users.length === 1 ? "" : "s"} across campus roles
          </p>
        </div>

        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Account
        </Button>
      </div>

      {/* Unified Table Container */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Integrated Filter bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-8 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, or employee ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </form>

          <div className="sm:col-span-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty Members</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">No matching users found.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">ID Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "FACULTY"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.departmentId?.name || "General"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {u.rollNumber || u.employeeId || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={u.isActive ? "outline" : "primary"}
                          onClick={() => handleToggleActive(u._id, u.isActive)}
                          className="text-xs"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-snug">{u.name}</h4>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "FACULTY"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Department</span>
                      <span className="font-medium truncate block">{u.departmentId?.name || "General"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">ID Number</span>
                      <span className="font-mono font-medium block">{u.rollNumber || u.employeeId || "-"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div>
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={u.isActive ? "outline" : "primary"}
                      onClick={() => handleToggleActive(u._id, u.isActive)}
                      className="text-xs h-8 px-3"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Institutional Account"
        description="Create an authorized Student, Faculty, or Administrative profile"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Dr. John Doe"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="johndoe@college.edu"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={newUser.departmentId}
                onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {newUser.role === "STUDENT" ? "Roll / Reg Number" : "Employee ID"}
              </label>
              <input
                type="text"
                value={newUser.role === "STUDENT" ? newUser.rollNumber : newUser.employeeId}
                onChange={(e) =>
                  newUser.role === "STUDENT"
                    ? setNewUser({ ...newUser, rollNumber: e.target.value })
                    : setNewUser({ ...newUser, employeeId: e.target.value })
                }
                placeholder={newUser.role === "STUDENT" ? "2024CS1042" : "FAC-4012"}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
