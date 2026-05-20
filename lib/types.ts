/**
 * Core domain types for Vibe Resume.
 *
 * Pipeline:
 *   PDF -> raw text -> ResumeData (structured) -> WebsiteConfig -> rendered template -> HTML export
 *
 * ResumeData lives in lib/resumeSchema.ts (Zod-derived, every field defaulted).
 * WebsiteConfig stays here — it's the canonical *presentation* shape consumed
 * by templates.
 */

import type { ResumeData } from "./resumeSchema";

export type { ResumeData };

// ---------- Career direction & style ----------

export type CareerDirection =
  | "software-engineer"
  | "product-manager"
  | "designer"
  | "data-scientist"
  | "marketing"
  | "founder"
  | "student"
  | "researcher"
  | "other";

export type VisualStyle =
  | "minimal"
  | "modern"
  | "elegant"
  | "playful"
  | "technical"
  | "editorial";

export type TemplateId =
  | "classic"
  | "split"
  | "magazine"
  | "terminal";

// ---------- Website config (produced by LLM in phase 4) ----------

export interface ThemeConfig {
  primary: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  fontHeading: "sans" | "serif" | "mono";
  fontBody: "sans" | "serif" | "mono";
  radius: "sharp" | "soft" | "round";
}

export type SectionId =
  | "hero"
  | "about"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "awards"
  | "certifications"
  | "publications"
  | "contact";

export interface SectionConfig {
  id: SectionId;
  title: string;
  enabled: boolean;
}

export interface WebsiteConfig {
  templateId: TemplateId;
  style: VisualStyle;
  direction: CareerDirection;
  theme: ThemeConfig;
  /** Display order + on/off per section. */
  sections: SectionConfig[];
  /** Resolved hero portrait (data URL or public path). */
  heroImage?: string;
  /** Tagline that goes under the name in the hero. AI generated, editable. */
  tagline?: string;
}

// ---------- Upload form payload ----------

export interface UploadedImage {
  id: string;
  name: string;
  /** Data URL — stored client-side; later we'll persist properly. */
  dataUrl: string;
}

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
  website: WebsiteConfig | null;
  rawText: string | null;
}
