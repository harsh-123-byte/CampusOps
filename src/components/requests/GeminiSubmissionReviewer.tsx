"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  RefreshCw,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { RequestType } from "@/types";

export interface ReviewResult {
  readinessScore: number;
  status: "READY" | "NEEDS_ATTENTION" | "INCOMPLETE";
  verifiedAttachments: string[];
  missingAttachments: string[];
  delayRisks: string[];
  actionableTips: string[];
  summary: string;
}

interface GeminiSubmissionReviewerProps {
  requestType: RequestType;
  title: string;
  description: string;
  formData: Record<string, any>;
  attachments: Array<{
    _id: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
  }>;
  onAddAttachment?: (attachment: any) => void;
  onRemoveAttachment?: (id: string) => void;
}

export function GeminiSubmissionReviewer({
  requestType,
  title,
  description,
  formData,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: GeminiSubmissionReviewerProps) {
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>("Google Gemini 3.8 Flash");
  const [uploadingInline, setUploadingInline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performReview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          title: title || "Untitled Request",
          description: description || "No statement provided",
          formData,
          attachments: attachments.map((a) => ({
            fileName: a.fileName,
            fileSize: a.fileSize,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Review failed");
      }

      if (data.review) {
        setReview(data.review);
        if (data.provider) setProvider(data.provider);
      }
    } catch (err: any) {
      console.error("Gemini reviewer error:", err);
      toast.error(err.message || "Failed to complete AI submission review");
    } finally {
      setLoading(false);
    }
  }, [requestType, title, description, formData, attachments]);

  // Run on initial mount
  useEffect(() => {
    performReview();
  }, [performReview]);

  const handleInlineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInline(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/v1/attachments/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      if (onAddAttachment) {
        onAddAttachment(data.attachment);
      }
      toast.success(`Attached "${file.name}"! Re-verifying application...`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploadingInline(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const score = review?.readinessScore ?? 75;
  const isReady = score >= 85;
  const isWarning = score >= 60 && score < 85;

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-6 shadow-sm space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">
                Gemini AI Pre-Submission Reviewer
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                {provider}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Before submitting, use our Gemini AI Reviewer to verify required attachments and prevent application delays.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={performReview}
          loading={loading}
          className="text-xs bg-white border-indigo-200 hover:bg-indigo-50/60 text-indigo-700 shadow-2xs shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Re-verify Application
        </Button>
      </div>

      {loading && !review && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-xs font-medium">Gemini AI is analyzing attached documents and requirements...</p>
        </div>
      )}

      {review && (
        <div className="space-y-5">
          {/* Readiness Score Card */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                  Overall Readiness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold ${
                      isReady ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {review.readinessScore}%
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isReady
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isWarning
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isReady
                      ? "Ready for Expedited Approval"
                      : isWarning
                      ? "Attention Recommended"
                      : "Incomplete - Delay Risk High"}
                  </span>
                </div>
              </div>

              <div className="sm:text-right max-w-md">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {review.summary}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isReady ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.max(10, Math.min(100, review.readinessScore))}%` }}
              />
            </div>
          </div>

          {/* Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verified Attachments & Checks */}
            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h5 className="text-xs font-bold text-slate-800">
                  Verified Requirements & Attachments ({review.verifiedAttachments?.length || 0})
                </h5>
              </div>
              {review.verifiedAttachments && review.verifiedAttachments.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {review.verifiedAttachments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No verified attachments detected yet.</p>
              )}
            </div>

            {/* Missing Attachments & Information */}
            <div
              className={`p-4 rounded-xl bg-white border shadow-2xs space-y-2.5 ${
                review.missingAttachments && review.missingAttachments.length > 0
                  ? "border-amber-200 bg-amber-50/20"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      review.missingAttachments && review.missingAttachments.length > 0
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  />
                  <h5 className="text-xs font-bold text-slate-800">
                    Missing Required Items ({review.missingAttachments?.length || 0})
                  </h5>
                </div>
              </div>

              {review.missingAttachments && review.missingAttachments.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {review.missingAttachments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All standard mandatory attachments present!
                </p>
              )}
            </div>
          </div>

          {/* Delay Prevention & Remediation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delay Risks */}
            {review.delayRisks && review.delayRisks.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-rose-100/80">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <h5 className="text-xs font-bold text-rose-950">
                    Identified Delay Risks & Bottlenecks
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {review.delayRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold shrink-0">⚠️</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Tips */}
            {review.actionableTips && review.actionableTips.length > 0 && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-blue-100/80">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h5 className="text-xs font-bold text-blue-950">
                    Faculty Reviewer Tips
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-blue-900">
                  {review.actionableTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold shrink-0">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Instant Inline Upload to Fix Missing Documents */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  Quick Attach Missing Proof Right Here
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Need to attach an additional offer letter or fee slip? Upload directly without losing your place.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInlineUpload}
                  disabled={uploadingInline}
                  className="hidden"
                  id="inline-reviewer-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingInline}
                  className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  {uploadingInline ? "Uploading & Analyzing..." : "Upload Missing File"}
                </Button>
              </div>
            </div>

            {/* List Current Attachments */}
            {attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <span
                    key={att._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {att.fileName}
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(att._id)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remove attachment"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GeminiSubmissionReviewer;

