/**
 * Whitelisted option lists for the Preview Editor.
 *
 * Everything that's user-selectable in the editor pulls from these tables.
 * The canonical source lives in types/pageBlueprint.ts — these arrays are
 * just re-exports + display labels so dropdowns can't pick unsafe values.
 */

import {
  BACKGROUND_STYLES,
  BORDER_RADII,
  COMPONENT_NAMES_BY_SECTION,
  FONT_STYLES,
  IMAGE_TYPES,
  MAX_WIDTHS,
  NAVIGATIONS,
  SECTION_IDS,
  SPACINGS,
  THEME_MODES,
  type ComponentName,
  type SectionId,
} from "@/types/pageBlueprint";

export interface Option<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

function opt<T extends string>(value: T, label?: string, hint?: string): Option<T> {
  return { value, label: label ?? value, hint };
}

// ---------- Component options per section ----------

/**
 * Display-label + hint mapping per component. Hints are short — they show in
 * a select dropdown to help the user pick. Components missing here fall back
 * to bare names.
 */
const COMPONENT_LABELS: Partial<Record<ComponentName, { label: string; hint?: string }>> = {
  CenteredHero: { label: "Centered Hero", hint: "Headline centered above content" },
  SplitHero: { label: "Split Hero", hint: "Text + avatar side by side" },
  AvatarHero: { label: "Avatar Hero", hint: "Avatar-led variation" },
  MinimalHero: { label: "Minimal Hero", hint: "Quiet, text-only" },
  CreativeImageHero: { label: "Creative Image Hero", hint: "Image-forward" },
  AboutCard: { label: "About Card", hint: "Single card with summary" },
  AboutSplit: { label: "About Split", hint: "Two-column intro" },
  SummaryBlock: { label: "Summary Block", hint: "Full-width prose" },
  SkillBadgeCloud: { label: "Skill Badge Cloud", hint: "Pills, ungrouped" },
  GroupedSkills: { label: "Grouped Skills", hint: "By language / framework / tool" },
  SkillBarList: { label: "Skill Bar List", hint: "Bars with category labels" },
  TechStackGrid: { label: "Tech Stack Grid", hint: "Compact grid of tools" },
  ExperienceTimeline: { label: "Experience Timeline", hint: "Vertical timeline" },
  ExperienceCards: { label: "Experience Cards", hint: "Card per role" },
  CorporateExperienceList: { label: "Corporate List", hint: "Formal list, no animation" },
  ProjectCardGrid: { label: "Project Card Grid", hint: "Cards in a grid" },
  ProjectImageGallery: { label: "Project Image Gallery", hint: "Image-led grid" },
  FeaturedProject: { label: "Featured Project", hint: "Big hero project + rest" },
  CompactProjectList: { label: "Compact Project List", hint: "Single-line list" },
  EducationCards: { label: "Education Cards", hint: "Cards" },
  EducationTimeline: { label: "Education Timeline", hint: "Timeline" },
  AcademicEducationBlock: { label: "Academic Education Block", hint: "Detailed block" },
  CertificationList: { label: "Certification List" },
  CertificationCards: { label: "Certification Cards" },
  AwardList: { label: "Award List" },
  AwardCards: { label: "Award Cards" },
  PublicationList: { label: "Publication List" },
  AcademicPublicationBlock: { label: "Academic Publication Block" },
  StatsStrip: { label: "Stats Strip", hint: "Horizontal stat row" },
  ImpactMetrics: { label: "Impact Metrics", hint: "Highlighted numbers" },
  SkillChart: { label: "Skill Chart" },
  ContactCard: { label: "Contact Card" },
  ContactCTA: { label: "Contact CTA", hint: "Call to action" },
  MinimalContact: { label: "Minimal Contact", hint: "Quiet contact line" },
};

export function getComponentLabel(name: ComponentName): string {
  return COMPONENT_LABELS[name]?.label ?? name;
}

export function getComponentHint(name: ComponentName): string | undefined {
  return COMPONENT_LABELS[name]?.hint;
}

export function getComponentOptions(sectionId: SectionId): Option<ComponentName>[] {
  const list = COMPONENT_NAMES_BY_SECTION[sectionId];
  return list.map((name) => ({
    value: name as ComponentName,
    label: getComponentLabel(name as ComponentName),
    hint: getComponentHint(name as ComponentName),
  }));
}

// ---------- Theme + layout option lists ----------

export const THEME_MODE_OPTIONS: Option[] = [
  opt("light", "Light"),
  opt("dark", "Dark"),
];

export const BACKGROUND_STYLE_OPTIONS: Option[] = [
  opt("plain", "Plain", "No background art"),
  opt("subtle-gradient", "Subtle gradient", "Soft top-to-bottom fade"),
  opt("grid", "Grid", "Tech grid lines"),
  opt("soft-color", "Soft color", "Warm tint"),
  opt("image", "Image", "Uses background image if set"),
];

export const FONT_STYLE_OPTIONS: Option[] = [
  opt("modern", "Modern", "Default sans"),
  opt("classic", "Classic", "Serif"),
  opt("editorial", "Editorial", "Display serif"),
  opt("technical", "Technical", "Monospace accents"),
];

export const SPACING_OPTIONS: Option[] = [
  opt("compact", "Compact"),
  opt("comfortable", "Comfortable"),
  opt("spacious", "Spacious"),
];

export const BORDER_RADIUS_OPTIONS: Option[] = [
  opt("none", "None"),
  opt("small", "Small"),
  opt("medium", "Medium"),
  opt("large", "Large"),
  opt("xl", "Extra large"),
];

export const MAX_WIDTH_OPTIONS: Option[] = [
  opt("narrow", "Narrow"),
  opt("standard", "Standard"),
  opt("wide", "Wide"),
];

export const NAVIGATION_OPTIONS: Option[] = [
  opt("none", "No navigation"),
  opt("top", "Top bar"),
  opt("sticky", "Sticky top bar"),
];

export const IMAGE_TYPE_OPTIONS: Option[] = [
  opt("avatar", "Avatar", "Used in the hero portrait"),
  opt("project", "Project", "Used in project sections"),
  opt("background", "Background", "Used as page background"),
  opt("general", "General", "Unassigned"),
];

// ---------- Add-section dropdown ----------

/**
 * Sections that are commonly missing from a generated blueprint and that the
 * user might want to add back. Hero/contact are always present so they're
 * intentionally excluded.
 */
export const ADDABLE_SECTIONS: Option<SectionId>[] = [
  opt("about", "About"),
  opt("skills", "Skills"),
  opt("experience", "Experience"),
  opt("projects", "Projects"),
  opt("education", "Education"),
  opt("certifications", "Certifications"),
  opt("awards", "Awards"),
  opt("publications", "Publications"),
  opt("stats", "Stats"),
];

// Sanity guard so the editor never crashes on an unknown enum.
export function isKnownSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

// Re-exports so the editor doesn't import deep from types/pageBlueprint.ts.
export {
  BACKGROUND_STYLES,
  BORDER_RADII,
  FONT_STYLES,
  IMAGE_TYPES,
  MAX_WIDTHS,
  NAVIGATIONS,
  SECTION_IDS,
  SPACINGS,
  THEME_MODES,
};
