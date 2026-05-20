import type { CareerDirection, VisualStyle } from "./types";

export const CAREER_DIRECTIONS: { value: CareerDirection; label: string; description: string }[] = [
  { value: "software-engineer", label: "Software Engineer", description: "Engineering, infrastructure, full-stack" },
  { value: "product-manager", label: "Product Manager", description: "Strategy, roadmaps, cross-functional leadership" },
  { value: "designer", label: "Designer", description: "Product, brand, visual, UX" },
  { value: "data-scientist", label: "Data / ML", description: "Analytics, machine learning, research engineering" },
  { value: "marketing", label: "Marketing", description: "Growth, content, brand, communications" },
  { value: "founder", label: "Founder", description: "Operator, generalist, building a company" },
  { value: "student", label: "Student", description: "Coursework, internships, early career" },
  { value: "researcher", label: "Researcher", description: "Academia, publications, scientific work" },
  { value: "other", label: "Other", description: "Tell us your own direction" },
];

export const VISUAL_STYLES: { value: VisualStyle; label: string; description: string; preview: string }[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Black on white. Quiet, confident, lots of whitespace.",
    preview: "linear-gradient(135deg,#ffffff,#f4f4f5)",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Crisp grid layout with a bold accent color.",
    preview: "linear-gradient(135deg,#eef2ff,#c7d2fe)",
  },
  {
    value: "elegant",
    label: "Elegant",
    description: "Serif typography, editorial spacing, refined.",
    preview: "linear-gradient(135deg,#fefce8,#fde68a)",
  },
  {
    value: "playful",
    label: "Playful",
    description: "Friendly color blocks, rounded edges, expressive.",
    preview: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Monospace details, dense data display, terminal vibes.",
    preview: "linear-gradient(135deg,#0f172a,#1e293b)",
  },
  {
    value: "editorial",
    label: "Editorial",
    description: "Magazine-style hero, large headlines, structured columns.",
    preview: "linear-gradient(135deg,#f5f5f4,#d6d3d1)",
  },
];
