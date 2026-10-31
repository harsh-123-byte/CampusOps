"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { Building2, Plus, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newDept, setNewDept] = useState({
    code: "",
    name: "",
    description: "",
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleToggleActive = async (deptId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId: deptId, isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`Department ${!currentStatus ? "activated" : "deactivated"}`);
        setDepartments((prev) =>
          prev.map((d) => (d._id === deptId ? { ...d, isActive: !currentStatus } : d))
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.code || !newDept.name) return;

    setCreateLoading(true);
    try {
      const res = await fetch("/api/v1/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDept),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create department");

      toast.success("Department created successfully!");
      setShowCreateModal(false);
      setNewDept({ code: "", name: "", description: "" });
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout title="Department Management" requiredRole="ADMIN">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Academic & Administrative Departments ({departments.length})
          </h2>
          <p className="text-xs text-slate-500">
            Configure faculties, routing codes, and departmental approval nodes
          </p>
        </div>

        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Department
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading departments...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Head of Dept</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{d.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[280px] truncate">
                      {d.description || "Academic department"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {d.headOfDepartmentId?.name || "Assigned by Dean"}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={d.isActive ? "outline" : "primary"}
                        onClick={() => handleToggleActive(d._id, d.isActive)}
                        className="text-xs"
                      >
                        {d.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Department Node"
        description="Establish a new academic department in CampusOps"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Code * (e.g. CSE, ECE, ARCH)
            </label>
            <input
              type="text"
              required
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BIO"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Department Name *
            </label>
            <input
              type="text"
              required
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Department of Biotechnology & Genetic Engineering"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Mandate
            </label>
            <textarea
              rows={3}
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              placeholder="Specialized focus areas, laboratories, and student programs..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
