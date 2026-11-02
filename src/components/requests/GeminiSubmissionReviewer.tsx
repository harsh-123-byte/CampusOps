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
    <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-slate-900">
                Pre-Submission Verification
              </h4>
              <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {provider}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated document and requirements verification to prevent approval delays
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={performReview}
          loading={loading}
          className="text-xs shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Re-verify
        </Button>
      </div>

      {loading && !review && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-xs">Analyzing attached documents and required criteria...</p>
        </div>
      )}

      {review && (
        <div className="space-y-4">
          {/* Readiness Score Card */}
          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                  Readiness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold tracking-tight ${
                      isReady ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {review.readinessScore}%
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      isReady
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : isWarning
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {isReady
                      ? "Ready for Approval"
                      : isWarning
                      ? "Attention Recommended"
                      : "Incomplete Requirements"}
                  </span>
                </div>
              </div>

              <div className="sm:text-right max-w-md">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {review.summary}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isReady ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.max(10, Math.min(100, review.readinessScore))}%` }}
              />
            </div>
          </div>

          {/* Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Verified Attachments & Checks */}
            <div className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <h5 className="text-xs font-semibold text-slate-900">
                  Verified Requirements ({review.verifiedAttachments?.length || 0})
                </h5>
              </div>
              {review.verifiedAttachments && review.verifiedAttachments.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-600">
                  {review.verifiedAttachments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
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
              className={`p-3 rounded-md bg-white border shadow-2xs space-y-2 ${
                review.missingAttachments && review.missingAttachments.length > 0
                  ? "border-amber-200 bg-amber-50/20"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      review.missingAttachments && review.missingAttachments.length > 0
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  />
                  <h5 className="text-xs font-semibold text-slate-900">
                    Missing Required Items ({review.missingAttachments?.length || 0})
                  </h5>
                </div>
              </div>

              {review.missingAttachments && review.missingAttachments.length > 0 ? (
                <ul className="space-y-1 text-xs text-amber-900">
                  {review.missingAttachments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All standard mandatory attachments present!
                </p>
              )}
            </div>
          </div>

          {/* Delay Prevention & Remediation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Delay Risks */}
            {review.delayRisks && review.delayRisks.length > 0 && (
              <div className="p-3 rounded-md bg-rose-50/40 border border-rose-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-rose-100">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <h5 className="text-xs font-semibold text-rose-950">
                    Delay Risks Identified
                  </h5>
                </div>
                <ul className="space-y-1 text-xs text-rose-900">
                  {review.delayRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold shrink-0">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Tips */}
            {review.actionableTips && review.actionableTips.length > 0 && (
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/70">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                  <h5 className="text-xs font-semibold text-slate-900">
                    Reviewer Notes
                  </h5>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {review.actionableTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Instant Inline Upload to Fix Missing Documents */}
          <div className="p-3.5 rounded-md bg-white border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  Attach Additional Documents
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Need to attach an additional offer letter or fee slip? Upload directly to re-verify.
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
                  className="text-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  {uploadingInline ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </div>

            {/* List Current Attachments */}
            {attachments.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                {attachments.map((att) => (
                  <span
                    key={att._id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
                  >
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                    {att.fileName}
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(att._id)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
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

