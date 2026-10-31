"use client";

import React, { useState } from "react";
import { Sparkles, Bot, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface AIAssistantDrawerProps {
  requestType: string;
  title: string;
  description: string;
  onApplyImprovedTitle: (title: string) => void;
  onApplyImprovedDesc: (desc: string) => void;
}

export function AIAssistantDrawer({
  requestType,
  title,
  description,
  onApplyImprovedTitle,
  onApplyImprovedDesc,
}: AIAssistantDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          draftTitle: title,
          draftDescription: description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch assistant advice");

      setAdvice(data.data);
      setIsFallback(data.isFallback);
      toast.success("AI Application Copilot recommendations refreshed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to contact AI Copilot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">CampusOps AI Copilot</h4>
            <p className="text-xs text-slate-500">Real-time guidance to ensure fast approval</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getAdvice}
          loading={loading}
          className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          <RefreshCw className="w-3 h-3" />
          Analyze Draft
        </Button>
      </div>

      {!advice ? (
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-600 mb-2">
            Click <strong>Analyze Draft</strong> to review your application with Gemini AI, detect missing items, and get formal drafting suggestions.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={getAdvice}
            loading={loading}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run Application Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Missing Checklist */}
          {advice.missingChecklist?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Required Information Checklist:
              </span>
              <ul className="space-y-1">
                {advice.missingChecklist.map((item: string, idx: number) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved description suggestion */}
          {advice.improvedDescription && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-800">Formal Description Suggestion:</span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyImprovedDesc(advice.improvedDescription);
                    toast.success("Applied formal text to description!");
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  Use this <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-line italic bg-white p-2.5 rounded-lg border border-slate-200">
                {advice.improvedDescription}
              </p>
            </div>
          )}

          {/* Actionable Tips */}
          {advice.actionableTips?.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-xs font-semibold text-blue-900 block mb-1">
                Pro-Tips for Approval:
              </span>
              <ul className="space-y-1">
                {advice.actionableTips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-[11px] text-blue-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
