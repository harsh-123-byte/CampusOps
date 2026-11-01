"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { AIDocumentReviewer } from "@/components/requests/AIDocumentReviewer";
import { AIAssistantDrawer } from "@/components/requests/AIAssistantDrawer";
import { GeminiSubmissionReviewer } from "@/components/requests/GeminiSubmissionReviewer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FilePlus,
} from "lucide-react";
import { RequestType, RequestPriority } from "@/types";

export default function NewRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [assignedFacultyId, setAssignedFacultyId] = useState("");

  // Form states
  const [type, setType] = useState<RequestType>("BONAFIDE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("NORMAL");
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);

  // Request-specific dynamic form fields
  const [formData, setFormData] = useState<Record<string, any>>({
    purpose: "",
    academicYear: "2026-2027",
    semester: "6th Semester",
    companyName: "",
    internshipDuration: "",
    eventName: "",
    eventDate: "",
    expectedTurnout: "",
    labName: "",
    accessHours: "",
    roomLocation: "",
    issueDescription: "",
  });

  useEffect(() => {
    fetch("/api/v1/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) {
          setDepartments(data.departments);
          if (data.departments.length > 0 && !departmentId) {
            setDepartmentId(data.departments[0]._id);
          }
        }
      })
      .catch(() => {});

    fetch("/api/v1/faculty")
      .then((res) => res.json())
      .then((data) => {
        if (data.faculty) {
          setFacultyList(data.faculty);
        }
      })
      .catch(() => {});
  }, [departmentId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/v1/attachments/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      setUploadedAttachments((prev) => [...prev, data.attachment]);
      toast.success(data.message || "Document uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setUploadedAttachments((prev) => prev.filter((a) => a._id !== id));
  };

  const handleApplyAIExtraction = (ext: any) => {
    if (ext.documentType && !title) {
      setTitle(`${ext.documentType} Request`);
    }
    if (ext.purpose) {
      setFormData((prev) => ({ ...prev, purpose: ext.purpose }));
    }
    if (ext.organization) {
      setFormData((prev) => ({ ...prev, companyName: ext.organization }));
    }
    if (ext.date) {
      setFormData((prev) => ({ ...prev, eventDate: ext.date }));
    }
    if (ext.studentName && ext.registrationNumber) {
      setDescription(
        `Application on behalf of ${ext.studentName} (Reg: ${ext.registrationNumber}) for ${type.replace(
          /_/g,
          " "
        )}. Verified documentation attached.`
      );
    }
  };

  const submitRequest = async (status: "DRAFT" | "SUBMITTED") => {
    if (!title.trim()) {
      toast.error("Please enter an application title");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (!departmentId) {
      toast.error("Please select a target department");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description,
          departmentId,
          assignedFacultyId: assignedFacultyId || undefined,
          priority,
          formData,
          attachments: uploadedAttachments.map((a) => a._id),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      toast.success(data.message || "Request created successfully!");
      router.push(`/student/requests/${data.request._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const requestTypeOptions: { type: RequestType; label: string; desc: string }[] = [
    { type: "BONAFIDE", label: "Bonafide Certificate", desc: "Proof of enrollment for scholarships, passport, or loans" },
    { type: "NOC", label: "No Objection (NOC)", desc: "For external internships, research projects, or visa" },
    { type: "EVENT_PERMISSION", label: "Event Permission", desc: "Club hackathons, workshops, and auditorium booking" },
    { type: "LAB_ACCESS", label: "Lab / HPC Access", desc: "After-hours specialized workstation or equipment access" },
    { type: "MAINTENANCE", label: "Campus Facility Repair", desc: "Classroom electrical, AC, or lab hardware maintenance" },
    { type: "OTHER", label: "General Petition", desc: "Academic concession, fee queries, or special petitions" },
  ];

  return (
    <DashboardLayout title="Create Service Request" requiredRole="STUDENT">
      {/* Step Indicator Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              1
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-800">
              <span className="hidden sm:inline">Category & </span>Type
            </span>
          </div>

          <div className="w-3 sm:w-12 h-0.5 bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              2
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-800">
              <span className="hidden sm:inline">Details & </span>Docs
            </span>
          </div>

          <div className="w-3 sm:w-12 h-0.5 bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                currentStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              3
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-800">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Step Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: SELECT TYPE */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Request Category</h3>
                <p className="text-xs text-slate-500">
                  Choose the category that matches your collegiate administrative requirement
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requestTypeOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      type === opt.type
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">{opt.label}</span>
                      {type === opt.type && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Faculty Reviewer (Optional)
                  </label>
                  <select
                    value={assignedFacultyId}
                    onChange={(e) => setAssignedFacultyId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Auto-assign Department Faculty</option>
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.departmentId?.code || "Faculty"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequestPriority)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Imminent deadline)</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentStep(2)}>
                  Continue to Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS & DYNAMIC FORM & ATTACHMENTS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* AI Document Extraction Tool */}
              <AIDocumentReviewer onApplyExtraction={handleApplyAIExtraction} />

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                  <p className="text-xs text-slate-500">
                    Provide necessary justifications and specific request parameters
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Application Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Request for Bonafide Certificate for Passport Renewal"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>

                {/* Dynamic Category Specific Form Fields */}
                {type === "BONAFIDE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Purpose of Certificate
                      </label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="e.g. Bank Education Loan / Passport / Visa"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Current Semester
                      </label>
                      <input
                        type="text"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        placeholder="e.g. 6th Semester"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {type === "NOC" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Host Company / Institution
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Google / Microsoft / ISRO"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Internship Duration & Dates
                      </label>
                      <input
                        type="text"
                        value={formData.internshipDuration}
                        onChange={(e) =>
                          setFormData({ ...formData, internshipDuration: e.target.value })
                        }
                        placeholder="e.g. June 1 - Aug 25, 2026 (12 Weeks)"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {type === "EVENT_PERMISSION" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Event Title
                      </label>
                      <input
                        type="text"
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        placeholder="e.g. Annual Hackathon 2026"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Event Dates & Expected Turnout
                      </label>
                      <input
                        type="text"
                        value={formData.expectedTurnout}
                        onChange={(e) =>
                          setFormData({ ...formData, expectedTurnout: e.target.value })
                        }
                        placeholder="e.g. Nov 14-15, 200 Students"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {type === "LAB_ACCESS" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Laboratory Name & Room
                      </label>
                      <input
                        type="text"
                        value={formData.labName}
                        onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                        placeholder="e.g. Turing GPU AI Lab - Room 402"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Required Access Hours
                      </label>
                      <input
                        type="text"
                        value={formData.accessHours}
                        onChange={(e) => setFormData({ ...formData, accessHours: e.target.value })}
                        placeholder="e.g. 6:00 PM - 10:00 PM Weekdays"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {type === "MAINTENANCE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Building Block & Room #
                      </label>
                      <input
                        type="text"
                        value={formData.roomLocation}
                        onChange={(e) => setFormData({ ...formData, roomLocation: e.target.value })}
                        placeholder="e.g. Block C, 3rd Floor, Lab 304"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Issue Category
                      </label>
                      <input
                        type="text"
                        value={formData.issueDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, issueDescription: e.target.value })
                        }
                        placeholder="e.g. AC Thermostat / Projector / Ethernet"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Formal Description / Statement *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Clearly explain the reason for this application, relevant deadlines, and authorization request..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Supporting Documents (PDF, PNG, JPG up to 5MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
                    <input
                      type="file"
                      id="doc-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                    <label htmlFor="doc-upload" className="cursor-pointer block">
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-semibold text-blue-600 hover:underline">
                        {uploadingFile ? "Uploading document..." : "Click to upload document"}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Attach offer letters, fee receipts, or event proposals
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedAttachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedAttachments.map((att) => (
                        <div
                          key={att._id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{att.fileName}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              ({Math.round(att.fileSize / 1024)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(att._id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Review Summary <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review Application</h3>
                <p className="text-xs text-slate-500">
                  Double check all information before sending to faculty reviewer
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Type:</span>
                    <span className="font-semibold text-slate-900">{type.replace(/_/g, " ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reviewing Faculty:</span>
                    <span className="font-semibold text-indigo-700">
                      {facultyList.find((f) => f._id === assignedFacultyId)?.name || "Auto-assigned Department Faculty"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Priority:</span>
                    <span className="font-semibold text-slate-900">{priority}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Application Title:</span>
                  <span className="font-semibold text-slate-900 text-sm">{title}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Description:</span>
                  <p className="text-slate-700 whitespace-pre-line mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    {description}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Attached Documents:</span>
                  <span className="font-semibold text-slate-900">
                    {uploadedAttachments.length} file(s) attached
                  </span>
                </div>
              </div>

              {/* Gemini AI Pre-Submission Reviewer */}
              <GeminiSubmissionReviewer
                requestType={type}
                title={title}
                description={description}
                formData={formData}
                attachments={uploadedAttachments}
                onAddAttachment={(att) => setUploadedAttachments((prev) => [...prev, att])}
                onRemoveAttachment={removeAttachment}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Edit Details
                </Button>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    loading={loading}
                    onClick={() => submitRequest("DRAFT")}
                    className="w-full sm:w-auto"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    loading={loading}
                    onClick={() => submitRequest("SUBMITTED")}
                    className="w-full sm:w-auto"
                  >
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar Panel */}
        <div className="space-y-6">
          <AIAssistantDrawer
            requestType={type}
            title={title}
            description={description}
            onApplyImprovedTitle={(t) => setTitle(t)}
            onApplyImprovedDesc={(d) => setDescription(d)}
          />

          <div className="bg-slate-900 rounded-2xl p-5 text-slate-300 text-xs space-y-3 border border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Submission Workflow Guarantees
            </span>
            <p className="text-slate-400 leading-relaxed">
              Once submitted, your assigned Department Faculty Advisor will be immediately notified via
              automated in-app alert. You can follow approval timestamps in real-time.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
