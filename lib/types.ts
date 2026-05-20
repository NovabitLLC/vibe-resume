/**
 * Core domain types for Vibe Resume.
 *
 * Pipeline:
 *   PDF -> raw text -> ResumeData -> PageBlueprint -> rendered template -> HTML export
 *
 * ResumeData lives in lib/resumeSchema.ts (Zod-derived).
 * PageBlueprint lives in types/pageBlueprint.ts (with Zod schemas in
 * lib/pageBlueprintSchema.ts).
 */

import type { ResumeData } from "./resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";

export type { ResumeData, PageBlueprint, PageBlueprintImage };

// ---------- Career direction & style ----------

export type CareerDirection =
  | "software-engineer"
  | "data-ai-ml"
  | "finance-accounting"
  | "product-business"
  | "designer-creative"
  | "academic-research";

export type VisualStyle =
  | "minimal-professional"
  | "modern-tech"
  | "corporate-clean"
  | "creative-portfolio"
  | "dark-mode-developer"
  | "elegant-academic";

// ---------- Upload form payload ----------

export type UploadedImage = PageBlueprintImage;

export interface UploadFormState {
  pdfFile: File | null;
  profileImage: UploadedImage | null;
  projectImages: UploadedImage[];
  direction: CareerDirection;
  style: VisualStyle;
}

// ---------- App-wide pipeline state ----------

export interface PipelineState {
  resume: ResumeData | null;
  blueprint: PageBlueprint | null;
  rawText: string | null;
}
