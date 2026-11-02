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
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">Application Assistant</h4>
            <p className="text-[11px] text-slate-500">Draft analysis and formal writing guidance</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getAdvice}
          loading={loading}
          className="text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Analyze Draft
        </Button>
      </div>

      {!advice ? (
        <div className="bg-slate-50 rounded-md p-3.5 text-center border border-slate-200/60">
          <p className="text-xs text-slate-600 mb-2.5">
            Analyze your draft to verify completeness and receive formal wording improvements before submitting.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={getAdvice}
            loading={loading}
            className="text-xs mx-auto"
          >
            Run Application Review
          </Button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Missing Checklist */}
          {advice.missingChecklist?.length > 0 && (
            <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200/80">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Required Information Checklist:
              </span>
              <ul className="space-y-0.5">
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
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-800">Formal Statement Suggestion:</span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyImprovedDesc(advice.improvedDescription);
                    toast.success("Applied formal text to description!");
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  Apply <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-line bg-white p-2.5 rounded-md border border-slate-200">
                {advice.improvedDescription}
              </p>
            </div>
          )}

          {/* Actionable Tips */}
          {advice.actionableTips?.length > 0 && (
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-800 block mb-1">
                Recommendations:
              </span>
              <ul className="space-y-0.5">
                {advice.actionableTips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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
