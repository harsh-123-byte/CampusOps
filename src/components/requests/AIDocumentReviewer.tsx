"use client";

import React, { useState } from "react";
import { Sparkles, FileText, Check, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface AIDocumentReviewerProps {
  onApplyExtraction: (data: {
    studentName?: string;
    registrationNumber?: string;
    date?: string;
    documentType?: string;
    organization?: string;
  }) => void;
}

export function AIDocumentReviewer({ onApplyExtraction }: AIDocumentReviewerProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);

  const handleExtract = async () => {
    if (!inputText.trim()) {
      toast.error("Please paste or type document text to analyze");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setExtractionResult(data.data);
      setIsFallback(data.isFallback);
      toast.success(
        data.isFallback
          ? "Extraction complete (Rule Engine Fallback)"
          : "Extraction complete via Google Gemini AI"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze document");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!extractionResult) return;
    onApplyExtraction(extractionResult);
    toast.success("Extracted metadata applied to your application form!");
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">Document Auto-Extraction</h4>
            <p className="text-[11px] text-slate-500">
              Paste offer letter, bonafide draft, or certificate text for instant field populating
            </p>
          </div>
        </div>
        {isFallback && (
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            Rule Fallback Mode
          </span>
        )}
      </div>

      <div className="space-y-3">
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste document text here (e.g. 'This is to certify that student, Reg No: 2024CS1042, is selected for Google Internship...')"
          className="w-full text-xs p-2.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
        />

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setInputText(
                "Certificate of Selection: This certifies that Aiden Scott (Roll No: 2024CS1042) of Computer Science is accepted for the Google Software Engineering Internship from June 1 to August 25, 2026. Signed by Academic Placement Officer."
              )
            }
          >
            Insert Sample Text
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleExtract}
            loading={loading}
          >
            Extract Fields
          </Button>
        </div>

        {extractionResult && (
          <div className="mt-3 p-3.5 rounded-md bg-slate-50 border border-slate-200/90 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Extracted Fields
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                Confidence: {Math.round((extractionResult.confidenceScore || 0.85) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Identified Name</span>
                <span className="font-medium text-slate-800">
                  {extractionResult.studentName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Registration / ID</span>
                <span className="font-medium text-slate-800 font-mono">
                  {extractionResult.registrationNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Document Type</span>
                <span className="font-medium text-slate-800">
                  {extractionResult.documentType || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Document Date</span>
                <span className="font-medium text-slate-800">
                  {extractionResult.date || "N/A"}
                </span>
              </div>
            </div>

            {extractionResult.keyDetails?.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Key Details:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  {extractionResult.keyDetails.map((k: string, idx: number) => (
                    <li key={idx}>{k}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={handleApply}
              className="w-full text-xs justify-center"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Details to Form
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
