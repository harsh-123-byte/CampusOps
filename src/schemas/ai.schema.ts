import { z } from "zod";

export const AIDocumentExtractionSchema = z.object({
  studentName: z.string().nullish(),
  registrationNumber: z.string().nullish(),
  date: z.string().nullish(),
  documentType: z.string().nullish(),
  organization: z.string().nullish(),
  purpose: z.string().nullish(),
  keyDetails: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.85),
});

export const AIClassificationSchema = z.object({
  suggestedCategory: z.enum([
    "BONAFIDE",
    "NOC",
    "EVENT_PERMISSION",
    "LAB_ACCESS",
    "MAINTENANCE",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  suggestedDepartmentCode: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).default(0.85),
  detectedMissingFields: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  summary: z.string().default(""),
});

export const AIAssistSchema = z.object({
  recommendedType: z.enum([
    "BONAFIDE",
    "NOC",
    "EVENT_PERMISSION",
    "LAB_ACCESS",
    "MAINTENANCE",
    "OTHER",
  ]),
  improvedTitle: z.string().optional(),
  improvedDescription: z.string().optional(),
  missingChecklist: z.array(z.string()).default([]),
  actionableTips: z.array(z.string()).default([]),
});

export const AIAdminInsightsSchema = z.object({
  executiveSummary: z.string(),
  bottlenecks: z.array(
    z.object({
      department: z.string(),
      issue: z.string(),
      recommendation: z.string(),
    })
  ),
  trendAnalysis: z.string(),
  efficiencyRating: z.string(),
});

export type AIDocumentExtraction = z.infer<typeof AIDocumentExtractionSchema>;
export type AIClassification = z.infer<typeof AIClassificationSchema>;
export type AIAssistResult = z.infer<typeof AIAssistSchema>;
export type AIAdminInsights = z.infer<typeof AIAdminInsightsSchema>;
