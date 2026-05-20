/**
 * Canonical PageBlueprint types + const tables.
 *
 * This file is the single source of truth for:
 *   - the allowed values for each enum (theme.mode, backgroundStyle, etc.)
 *   - the allowed components per section_id
 *
 * Both lib/pageBlueprintSchema.ts (Zod validation) and the LLM prompt
 * inside app/api/generate-blueprint/route.ts read from these tables, so
 * there is no list duplication to keep in sync.
 */

import type { CareerDirection, VisualStyle } from "@/lib/types";

// ---------- Theme enums ----------

export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const BACKGROUND_STYLES = [
  "plain",
  "subtle-gradient",
  "grid",
  "soft-color",
  "image",
] as const;
export type BackgroundStyle = (typeof BACKGROUND_STYLES)[number];

export const FONT_STYLES = ["modern", "classic", "editorial", "technical"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export const SPACINGS = ["compact", "comfortable", "spacious"] as const;
export type Spacing = (typeof SPACINGS)[number];

export const BORDER_RADII = ["none", "small", "medium", "large", "xl"] as const;
export type BorderRadius = (typeof BORDER_RADII)[number];

// ---------- Layout enums ----------

export const PAGE_TYPES = ["single-page"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const MAX_WIDTHS = ["narrow", "standard", "wide"] as const;
export type MaxWidth = (typeof MAX_WIDTHS)[number];

export const NAVIGATIONS = ["none", "top", "sticky"] as const;
export type Navigation = (typeof NAVIGATIONS)[number];

// ---------- Sections ----------

export const SECTION_IDS = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "awards",
  "publications",
  "stats",
  "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

// ---------- Components, grouped by section ----------

export const HERO_COMPONENTS = [
  "CenteredHero",
  "SplitHero",
  "AvatarHero",
  "MinimalHero",
  "CreativeImageHero",
] as const;

export const ABOUT_COMPONENTS = ["AboutCard", "AboutSplit", "SummaryBlock"] as const;

export const SKILLS_COMPONENTS = [
  "SkillBadgeCloud",
  "GroupedSkills",
  "SkillBarList",
  "TechStackGrid",
] as const;

export const EXPERIENCE_COMPONENTS = [
  "ExperienceTimeline",
  "ExperienceCards",
  "CorporateExperienceList",
] as const;

export const PROJECT_COMPONENTS = [
  "ProjectCardGrid",
  "ProjectImageGallery",
  "FeaturedProject",
  "CompactProjectList",
] as const;

export const EDUCATION_COMPONENTS = [
  "EducationCards",
  "EducationTimeline",
  "AcademicEducationBlock",
] as const;

export const CERTIFICATION_COMPONENTS = ["CertificationList", "CertificationCards"] as const;

export const AWARD_COMPONENTS = ["AwardList", "AwardCards"] as const;

export const PUBLICATION_COMPONENTS = ["PublicationList", "AcademicPublicationBlock"] as const;

export const STATS_COMPONENTS = ["StatsStrip", "ImpactMetrics", "SkillChart"] as const;

export const CONTACT_COMPONENTS = ["ContactCard", "ContactCTA", "MinimalContact"] as const;

export const COMPONENT_NAMES_BY_SECTION = {
  hero: HERO_COMPONENTS,
  about: ABOUT_COMPONENTS,
  skills: SKILLS_COMPONENTS,
  experience: EXPERIENCE_COMPONENTS,
  projects: PROJECT_COMPONENTS,
  education: EDUCATION_COMPONENTS,
  certifications: CERTIFICATION_COMPONENTS,
  awards: AWARD_COMPONENTS,
  publications: PUBLICATION_COMPONENTS,
  stats: STATS_COMPONENTS,
  contact: CONTACT_COMPONENTS,
} as const satisfies Record<SectionId, readonly string[]>;

export type ComponentName =
  | (typeof HERO_COMPONENTS)[number]
  | (typeof ABOUT_COMPONENTS)[number]
  | (typeof SKILLS_COMPONENTS)[number]
  | (typeof EXPERIENCE_COMPONENTS)[number]
  | (typeof PROJECT_COMPONENTS)[number]
  | (typeof EDUCATION_COMPONENTS)[number]
  | (typeof CERTIFICATION_COMPONENTS)[number]
  | (typeof AWARD_COMPONENTS)[number]
  | (typeof PUBLICATION_COMPONENTS)[number]
  | (typeof STATS_COMPONENTS)[number]
  | (typeof CONTACT_COMPONENTS)[number];

/** Flat list of every allowed component name (handy for z.enum). */
export const ALL_COMPONENT_NAMES: readonly ComponentName[] = [
  ...HERO_COMPONENTS,
  ...ABOUT_COMPONENTS,
  ...SKILLS_COMPONENTS,
  ...EXPERIENCE_COMPONENTS,
  ...PROJECT_COMPONENTS,
  ...EDUCATION_COMPONENTS,
  ...CERTIFICATION_COMPONENTS,
  ...AWARD_COMPONENTS,
  ...PUBLICATION_COMPONENTS,
  ...STATS_COMPONENTS,
  ...CONTACT_COMPONENTS,
];

// ---------- Images ----------

export const IMAGE_TYPES = ["avatar", "project", "background", "general"] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

export interface PageBlueprintImage {
  id: string;
  type: ImageType;
  url: string;
  alt?: string;
  relatedProject?: string;
}

// ---------- Blueprint shapes ----------

export interface BlueprintTheme {
  mode: ThemeMode;
  /** Hex like "#RRGGBB" */
  primaryColor: string;
  /** Hex like "#RRGGBB" */
  accentColor: string;
  backgroundStyle: BackgroundStyle;
  fontStyle: FontStyle;
  spacing: Spacing;
  borderRadius: BorderRadius;
}

export interface BlueprintLayout {
  pageType: PageType;
  maxWidth: MaxWidth;
  sectionSpacing: Spacing;
  navigation: Navigation;
}

export interface BlueprintSection {
  id: SectionId;
  component: ComponentName;
  enabled: boolean;
  /** Used to sort sections at render time. */
  order: number;
  /** Component-specific props (validated loosely in Phase 4; strictly per component in Phase 5). */
  props: Record<string, unknown>;
}

export interface BlueprintImageUsage {
  imageId: string;
  usage: ImageType;
  sectionId: SectionId;
  component: ComponentName;
  reason: string;
}

export interface BlueprintStat {
  label: string;
  value: string;
  /** Free-form pointer back to the resume fact this stat was derived from. */
  source?: string;
}

export interface PageBlueprint {
  /** Schema version — semver-ish. Currently "1.0". */
  version: string;
  careerDirection: CareerDirection;
  visualStyle: VisualStyle;
  theme: BlueprintTheme;
  layout: BlueprintLayout;
  sections: BlueprintSection[];
  highlightedSkills: string[];
  /** Project names (must match resume.projects[].name) that get extra emphasis. */
  featuredProjects: string[];
  stats: BlueprintStat[];
  imageUsage: BlueprintImageUsage[];
  notes?: string;
}

// ---------- Display helpers ----------

export const SECTION_DISPLAY_TITLES: Record<SectionId, string> = {
  hero: "Hello",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  awards: "Recognition",
  publications: "Publications",
  stats: "Impact",
  contact: "Contact",
};
