import { z } from "zod";

import type { ResumeData } from "./resumeSchema";
import { careerDirectionSchema, visualStyleSchema } from "./schemas";
import type { CareerDirection, VisualStyle } from "./types";
import {
  ALL_COMPONENT_NAMES,
  BACKGROUND_STYLES,
  BORDER_RADII,
  COMPONENT_NAMES_BY_SECTION,
  FONT_STYLES,
  IMAGE_TYPES,
  MAX_WIDTHS,
  NAVIGATIONS,
  PAGE_TYPES,
  SECTION_IDS,
  SPACINGS,
  THEME_MODES,
  type ComponentName,
  type PageBlueprint,
  type PageBlueprintImage,
  type SectionId,
} from "@/types/pageBlueprint";

/**
 * Zod schemas for PageBlueprint validation. Schemas are derived from the
 * const tables in types/pageBlueprint.ts, so adding a new component or
 * enum value in one place keeps validation in sync automatically.
 */

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a #RRGGBB hex color");

const componentNameSchema = z.enum(
  ALL_COMPONENT_NAMES as readonly [ComponentName, ...ComponentName[]]
);

export const themeSchema = z.object({
  mode: z.enum(THEME_MODES).default("light"),
  primaryColor: hexColor.default("#2563eb"),
  accentColor: hexColor.default("#0f172a"),
  backgroundStyle: z.enum(BACKGROUND_STYLES).default("subtle-gradient"),
  fontStyle: z.enum(FONT_STYLES).default("modern"),
  spacing: z.enum(SPACINGS).default("comfortable"),
  borderRadius: z.enum(BORDER_RADII).default("large"),
});

export const layoutSchema = z.object({
  pageType: z.enum(PAGE_TYPES).default("single-page"),
  maxWidth: z.enum(MAX_WIDTHS).default("wide"),
  sectionSpacing: z.enum(SPACINGS).default("comfortable"),
  navigation: z.enum(NAVIGATIONS).default("sticky"),
});

export const sectionSchema = z
  .object({
    id: z.enum(SECTION_IDS),
    component: componentNameSchema,
    enabled: z.boolean().default(true),
    order: z.number().int().nonnegative(),
    /** Component-specific props. In Phase 5 we'll add per-component schemas. */
    props: z.record(z.unknown()).default({}),
  })
  .superRefine((section, ctx) => {
    const allowed = COMPONENT_NAMES_BY_SECTION[section.id] as readonly string[];
    if (!allowed.includes(section.component)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Component "${section.component}" is not allowed for section "${section.id}". Allowed: ${allowed.join(", ")}.`,
        path: ["component"],
      });
    }
  });

export const statSchema = z.object({
  label: z.string().min(1),
  // LLMs sometimes return a bare number (e.g. 34) instead of "34" or "34%".
  // Coerce to string so we don't reject otherwise-valid output.
  value: z
    .union([z.string().min(1), z.number()])
    .transform((v) => (typeof v === "number" ? String(v) : v)),
  source: z.string().optional(),
});

export const imageUsageSchema = z.object({
  imageId: z.string().min(1),
  usage: z.enum(IMAGE_TYPES),
  sectionId: z.enum(SECTION_IDS),
  component: componentNameSchema,
  reason: z.string().min(1),
});

export const pageBlueprintImageSchema = z.object({
  id: z.string().min(1),
  type: z.enum(IMAGE_TYPES),
  url: z.string(),
  alt: z.string().optional(),
  relatedProject: z.string().optional(),
});

export const pageBlueprintSchema = z.object({
  version: z.string().default("1.0"),
  careerDirection: careerDirectionSchema,
  visualStyle: visualStyleSchema,
  theme: themeSchema,
  layout: layoutSchema,
  sections: z.array(sectionSchema).min(1, "blueprint must have at least one section"),
  highlightedSkills: z.array(z.string()).default([]),
  featuredProjects: z.array(z.string()).default([]),
  stats: z.array(statSchema).default([]),
  imageUsage: z.array(imageUsageSchema).default([]),
  notes: z.string().optional(),
});

// ---------- Fallback builder ----------

/**
 * Deterministic, schema-valid PageBlueprint built from the inputs alone.
 * Used as the safety net whenever the LLM call fails, returns invalid JSON,
 * or fails schema validation. Always passes pageBlueprintSchema.parse().
 */
export function safeFallbackBlueprint(
  resume: ResumeData,
  careerDirection: CareerDirection,
  visualStyle: VisualStyle,
  images: PageBlueprintImage[] = []
): PageBlueprint {
  const hasAvatar = images.some((i) => i.type === "avatar");

  const sections = baseSectionsFor(careerDirection, resume, hasAvatar).map((section) => {
    if (section.id !== "hero" || !hasAvatar) return section;
    return {
      ...section,
      props: {
        ...section.props,
        showAvatar: true,
        avatarImageId: images.find((i) => i.type === "avatar")?.id ?? "",
      },
    };
  });

  return {
    version: "1.0",
    careerDirection,
    visualStyle,
    theme: {
      mode: visualStyle === "dark-mode-developer" ? "dark" : "light",
      primaryColor: "#2563eb",
      accentColor: "#0f172a",
      backgroundStyle: "subtle-gradient",
      fontStyle: "modern",
      spacing: "comfortable",
      borderRadius: "large",
    },
    layout: {
      pageType: "single-page",
      maxWidth: "wide",
      sectionSpacing: "comfortable",
      navigation: "sticky",
    },
    sections,
    highlightedSkills: pickHighlightedSkills(resume),
    featuredProjects: resume.projects.slice(0, 2).map((p) => p.name).filter(Boolean),
    stats: [],
    imageUsage: deterministicImageUsage([], sections, images),
    notes: "Generated by safeFallbackBlueprint (deterministic; no LLM).",
  };
}

/**
 * Section list per career direction, with empty sections filtered out.
 * Component picks here match the "recommended components" in the spec.
 */
function baseSectionsFor(
  direction: CareerDirection,
  resume: ResumeData,
  hasAvatar: boolean
): PageBlueprint["sections"] {
  // Build a master list. Each entry's component is the safe default for that direction.
  const heroProps = makeHeroProps(hasAvatar);

  const master: { id: SectionId; component: ComponentName; props: Record<string, unknown> }[] =
    direction === "software-engineer"
      ? [
          { id: "hero", component: "SplitHero", props: heroProps },
          { id: "about", component: "AboutCard", props: {} },
          { id: "skills", component: "SkillBadgeCloud", props: {} },
          { id: "experience", component: "ExperienceTimeline", props: {} },
          { id: "projects", component: "ProjectCardGrid", props: {} },
          { id: "education", component: "EducationCards", props: {} },
          { id: "certifications", component: "CertificationList", props: {} },
          { id: "awards", component: "AwardList", props: {} },
          { id: "contact", component: "ContactCTA", props: {} },
        ]
      : direction === "data-ai-ml"
        ? [
            { id: "hero", component: "SplitHero", props: heroProps },
            { id: "about", component: "AboutCard", props: {} },
            { id: "skills", component: "TechStackGrid", props: {} },
            { id: "experience", component: "ExperienceTimeline", props: {} },
            { id: "projects", component: "FeaturedProject", props: {} },
            { id: "publications", component: "AcademicPublicationBlock", props: {} },
            { id: "education", component: "EducationCards", props: {} },
            { id: "awards", component: "AwardList", props: {} },
            { id: "contact", component: "ContactCTA", props: {} },
          ]
        : direction === "finance-accounting"
          ? [
              { id: "hero", component: "MinimalHero", props: makeHeroProps(false) },
              { id: "about", component: "SummaryBlock", props: {} },
              { id: "experience", component: "CorporateExperienceList", props: {} },
              { id: "certifications", component: "CertificationCards", props: {} },
              { id: "skills", component: "GroupedSkills", props: {} },
              { id: "education", component: "EducationCards", props: {} },
              { id: "awards", component: "AwardList", props: {} },
              { id: "contact", component: "MinimalContact", props: {} },
            ]
          : direction === "product-business"
            ? [
                { id: "hero", component: "CenteredHero", props: heroProps },
                { id: "about", component: "AboutCard", props: {} },
                { id: "experience", component: "ExperienceCards", props: {} },
                { id: "projects", component: "ProjectCardGrid", props: {} },
                { id: "skills", component: "GroupedSkills", props: {} },
                { id: "education", component: "EducationCards", props: {} },
                { id: "awards", component: "AwardList", props: {} },
                { id: "contact", component: "ContactCTA", props: {} },
              ]
            : direction === "designer-creative"
              ? [
                  { id: "hero", component: "CreativeImageHero", props: heroProps },
                  { id: "about", component: "AboutSplit", props: {} },
                  { id: "projects", component: "ProjectImageGallery", props: {} },
                  { id: "experience", component: "ExperienceCards", props: {} },
                  { id: "skills", component: "SkillBadgeCloud", props: {} },
                  { id: "education", component: "EducationCards", props: {} },
                  { id: "awards", component: "AwardList", props: {} },
                  { id: "contact", component: "ContactCTA", props: {} },
                ]
              : /* academic-research */ [
                  { id: "hero", component: "MinimalHero", props: makeHeroProps(false) },
                  { id: "about", component: "SummaryBlock", props: {} },
                  { id: "education", component: "AcademicEducationBlock", props: {} },
                  { id: "publications", component: "AcademicPublicationBlock", props: {} },
                  { id: "experience", component: "ExperienceTimeline", props: {} },
                  { id: "awards", component: "AwardList", props: {} },
                  { id: "skills", component: "GroupedSkills", props: {} },
                  { id: "contact", component: "MinimalContact", props: {} },
                ];

  return master
    .filter((s) => hasContentForSection(s.id, resume))
    .map((s, i) => ({
      id: s.id,
      component: s.component,
      enabled: true,
      order: i + 1,
      props: s.props,
    }));
}

function makeHeroProps(hasAvatar: boolean): Record<string, unknown> {
  return {
    showAvatar: hasAvatar,
    avatarImageId: "",
    avatarPosition: "right",
    avatarSize: "large",
    avatarShape: "circle",
    showSocialLinks: true,
    headlineStyle: "bold",
    background: "gradient",
  };
}

export function deterministicImageUsage(
  current: PageBlueprint["imageUsage"],
  sections: PageBlueprint["sections"],
  images: PageBlueprintImage[]
): PageBlueprint["imageUsage"] {
  const next = [...current];
  const heroSection = sections.find((s) => s.id === "hero");
  const projectSection = sections.find((s) => s.id === "projects");
  const avatar = images.find((i) => i.type === "avatar");

  if (avatar && heroSection && !next.some((u) => u.usage === "avatar")) {
    next.push({
      imageId: avatar.id,
      usage: "avatar",
      sectionId: "hero",
      component: heroSection.component,
      reason: "User uploaded this image as a profile photo.",
    });
  }

  if (projectSection) {
    images
      .filter((i) => i.type === "project")
      .forEach((image) => {
        const exists = next.some((u) => u.imageId === image.id && u.usage === "project");
        if (!exists) {
          next.push({
            imageId: image.id,
            usage: "project",
            sectionId: "projects",
            component: projectSection.component,
            reason: "User uploaded this image as a project image.",
          });
        }
      });
  }

  return next;
}

export function hasContentForSection(id: SectionId, resume: ResumeData): boolean {
  switch (id) {
    case "hero":
    case "contact":
      return true;
    case "about":
      return Boolean(resume.summary);
    case "skills":
      return (
        resume.skills.languages.length +
          resume.skills.frameworks.length +
          resume.skills.tools.length +
          resume.skills.other.length >
        0
      );
    case "experience":
      return resume.experience.length > 0;
    case "projects":
      return resume.projects.length > 0;
    case "education":
      return resume.education.length > 0;
    case "certifications":
      return resume.certifications.length > 0;
    case "awards":
      return resume.awards.length > 0;
    case "publications":
      return resume.publications.length > 0;
    case "stats":
      return false; // never default to a stats section; must be earned by real numbers
  }
}

export function pickHighlightedSkills(resume: ResumeData, max = 6): string[] {
  const ordered = [
    ...resume.skills.languages,
    ...resume.skills.frameworks,
    ...resume.skills.tools,
    ...resume.skills.other,
  ];
  return Array.from(new Set(ordered)).slice(0, max);
}
