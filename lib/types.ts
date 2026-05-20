/**
 * Core domain types for Vibe Resume.
 *
 * Pipeline:
 *   PDF -> raw text -> ResumeData (structured) -> WebsiteConfig -> rendered template -> HTML export
 *
 * ResumeData is the canonical user-data shape.
 * WebsiteConfig is the canonical presentation shape (template + theme + layout choices).
 * Templates only ever read these two objects.
 */

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

// ---------- Resume data (extracted by LLM) ----------

export interface ResumeBasics {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  /** Picked up from social links e.g. LinkedIn, GitHub, X. */
  socials?: SocialLink[];
}

export interface SocialLink {
  label: string;
  url: string;
  /** Optional icon hint, e.g. "github", "linkedin", "twitter". */
  icon?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  /** ISO-ish strings, e.g. "2021-04" or "2024-Present" — kept as strings since PDFs are messy. */
  startDate?: string;
  endDate?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
}

export interface EducationEntry {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  highlights?: string[];
}

export interface ProjectEntry {
  name: string;
  role?: string;
  url?: string;
  summary?: string;
  highlights?: string[];
  technologies?: string[];
  /** Resolved at upload time — relative to /public or a data URL. */
  imageId?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface AwardEntry {
  title: string;
  issuer?: string;
  date?: string;
  summary?: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  work: WorkExperience[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillGroup[];
  awards?: AwardEntry[];
  /** Extra free-form sections we couldn't classify; LLM may add these. */
  extras?: { title: string; items: string[] }[];
}

// ---------- Website config (produced by LLM in phase 4) ----------

export interface ThemeConfig {
  /** Tailwind-friendly hex values. */
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
  | "work"
  | "projects"
  | "education"
  | "skills"
  | "awards"
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
  /** Data URL — stored client-side in phase 1; later we'll persist properly. */
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
