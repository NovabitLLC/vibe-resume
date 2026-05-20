import type { CareerDirection, VisualStyle } from "./types";

export { SECTION_DISPLAY_TITLES as SECTION_TITLES } from "@/types/pageBlueprint";

export const CAREER_DIRECTIONS: {
  value: CareerDirection;
  label: string;
  description: string;
}[] = [
  {
    value: "software-engineer",
    label: "Software Engineer",
    description: "Skills, projects, GitHub, technical impact",
  },
  {
    value: "data-ai-ml",
    label: "Data / AI / ML",
    description: "ML/data skills, projects, publications",
  },
  {
    value: "finance-accounting",
    label: "Finance / Accounting",
    description: "Experience, certifications, tools, corporate",
  },
  {
    value: "product-business",
    label: "Product / Business",
    description: "Impact, leadership, outcomes, communication",
  },
  {
    value: "designer-creative",
    label: "Designer / Creative",
    description: "Portfolio, images, visual presentation",
  },
  {
    value: "academic-research",
    label: "Academic / Research",
    description: "Education, publications, research, awards",
  },
];

export const VISUAL_STYLES: {
  value: VisualStyle;
  label: string;
  description: string;
  preview: string;
}[] = [
  {
    value: "minimal-professional",
    label: "Minimal Professional",
    description: "Clean, neutral, spacious. Quiet and confident.",
    preview: "linear-gradient(135deg,#ffffff,#f1f5f9)",
  },
  {
    value: "modern-tech",
    label: "Modern Tech",
    description: "Sleek, technical, slightly bold accent.",
    preview: "linear-gradient(135deg,#eef2ff,#c7d2fe)",
  },
  {
    value: "corporate-clean",
    label: "Corporate Clean",
    description: "Formal, conservative, recruiter-friendly.",
    preview: "linear-gradient(135deg,#f8fafc,#cbd5e1)",
  },
  {
    value: "creative-portfolio",
    label: "Creative Portfolio",
    description: "Visual, expressive, image-friendly.",
    preview: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  },
  {
    value: "dark-mode-developer",
    label: "Dark Mode Developer",
    description: "Dark background, technical feel.",
    preview: "linear-gradient(135deg,#0f172a,#1e293b)",
  },
  {
    value: "elegant-academic",
    label: "Elegant Academic",
    description: "Refined, text-focused, subtle.",
    preview: "linear-gradient(135deg,#fef3c7,#e7e5e4)",
  },
];

/** Look up a human label from a slug; falls back to the slug. */
export function careerDirectionLabel(slug: string): string {
  return CAREER_DIRECTIONS.find((d) => d.value === slug)?.label ?? slug;
}

export function visualStyleLabel(slug: string): string {
  return VISUAL_STYLES.find((s) => s.value === slug)?.label ?? slug;
}
