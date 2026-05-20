import { NextRequest, NextResponse } from "next/server";

import { getProvider, LlmError } from "@/lib/llm";
import { resumeSchema, type ResumeData } from "@/lib/resumeSchema";
import { careerDirectionSchema, visualStyleSchema } from "@/lib/schemas";
import {
  deterministicImageUsage,
  hasContentForSection,
  pageBlueprintImageSchema,
  pageBlueprintSchema,
  safeFallbackBlueprint,
} from "@/lib/pageBlueprintSchema";
import {
  BACKGROUND_STYLES,
  BORDER_RADII,
  COMPONENT_NAMES_BY_SECTION,
  FONT_STYLES,
  MAX_WIDTHS,
  NAVIGATIONS,
  SECTION_IDS,
  SPACINGS,
  THEME_MODES,
  type PageBlueprint,
  type PageBlueprintImage,
} from "@/types/pageBlueprint";
import { z } from "zod";
import type { CareerDirection, VisualStyle } from "@/lib/types";

/**
 * POST /api/generate-blueprint
 *
 * Input  : { resume, careerDirection, visualStyle, images?: PageBlueprintImage[] }
 * Output : { blueprint: PageBlueprint, fallbackUsed: boolean, reason?: string, model?: string }
 *
 * Robustness:
 *   - On any LLM failure (transport / invalid JSON / schema violation) the
 *     route still returns 200 with a deterministic safeFallbackBlueprint()
 *     and fallbackUsed: true. The user flow never breaks.
 *   - 4xx is reserved for malformed *client* input (bad resume / bad enums).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestBodySchema = z.object({
  resume: z.unknown(),
  careerDirection: z.unknown(),
  visualStyle: z.unknown(),
  images: z.array(pageBlueprintImageSchema).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof requestBodySchema>;
  try {
    body = requestBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body with { resume, careerDirection, visualStyle, images? }." },
      { status: 400 }
    );
  }

  // Validate inputs strictly so we never feed garbage to the LLM.
  const directionResult = careerDirectionSchema.safeParse(body.careerDirection);
  if (!directionResult.success) {
    return NextResponse.json(
      { error: "Invalid careerDirection.", issues: directionResult.error.issues },
      { status: 400 }
    );
  }
  const styleResult = visualStyleSchema.safeParse(body.visualStyle);
  if (!styleResult.success) {
    return NextResponse.json(
      { error: "Invalid visualStyle.", issues: styleResult.error.issues },
      { status: 400 }
    );
  }
  const resumeResult = resumeSchema.safeParse(body.resume);
  if (!resumeResult.success) {
    return NextResponse.json(
      {
        error: "Invalid resume payload.",
        issues: resumeResult.error.issues.slice(0, 8),
      },
      { status: 400 }
    );
  }

  const direction = directionResult.data as CareerDirection;
  const style = styleResult.data as VisualStyle;
  const resume = resumeResult.data;
  const images = (body.images ?? []) as PageBlueprintImage[];

  // ---- Try LLM, fall back to deterministic blueprint on any failure ----
  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const fallback = safeFallbackBlueprint(resume, direction, style, images);
    return NextResponse.json({
      blueprint: fallback,
      fallbackUsed: true,
      reason: err instanceof Error ? `Provider unavailable: ${err.message}` : "Provider unavailable.",
    });
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(resume, direction, style, images);

  let completionText = "";
  try {
    const completion = await provider.complete({
      system: systemPrompt,
      user: userPrompt,
      jsonMode: true,
    });
    completionText = completion.text;
  } catch (err) {
    const fallback = safeFallbackBlueprint(resume, direction, style, images);
    const reason =
      err instanceof LlmError
        ? `LLM error: ${err.message}`
        : err instanceof Error
          ? `LLM error: ${err.message}`
          : "LLM call failed.";
    return NextResponse.json({
      blueprint: fallback,
      fallbackUsed: true,
      reason,
      model: provider.model,
    });
  }

  const cleaned = stripCodeFences(completionText.trim());

  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    const fallback = safeFallbackBlueprint(resume, direction, style, images);
    return NextResponse.json({
      blueprint: fallback,
      fallbackUsed: true,
      reason: "LLM did not return valid JSON.",
      rawPreview: cleaned.slice(0, 1500),
      model: provider.model,
    });
  }

  // Force the user-selected direction/style on the output so the LLM
  // can't drift from what was picked in the UI.
  if (raw && typeof raw === "object") {
    (raw as Record<string, unknown>).careerDirection = direction;
    (raw as Record<string, unknown>).visualStyle = style;
    if (!("version" in (raw as Record<string, unknown>))) {
      (raw as Record<string, unknown>).version = "1.0";
    }
  }

  const validation = pageBlueprintSchema.safeParse(raw);
  if (!validation.success) {
    const fallback = safeFallbackBlueprint(resume, direction, style, images);
    return NextResponse.json({
      blueprint: fallback,
      fallbackUsed: true,
      reason: "LLM output failed schema validation; using safe fallback.",
      issues: validation.error.issues.slice(0, 8),
      rawPreview: cleaned.slice(0, 1500),
      model: provider.model,
    });
  }

  const sanitized = sanitizeBlueprint(validation.data, resume, images);

  return NextResponse.json({
    blueprint: sanitized,
    fallbackUsed: false,
    model: provider.model,
    provider: provider.id,
  });
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { resume, careerDirection, visualStyle, images? }." },
    { status: 405 }
  );
}

// ---------- Prompt building ----------

function buildSystemPrompt(): string {
  const componentLines = (Object.keys(COMPONENT_NAMES_BY_SECTION) as (keyof typeof COMPONENT_NAMES_BY_SECTION)[])
    .map(
      (sectionId) =>
        `- ${sectionId}: ${(COMPONENT_NAMES_BY_SECTION[sectionId] as readonly string[]).join(" | ")}`
    )
    .join("\n");

  return `You are a website-layout designer for personal resume sites. Given a candidate's parsed ResumeData, their target career direction, their preferred visual style, and optional uploaded images, return a strict JSON PageBlueprint that picks the best components, theme, layout, and content emphasis.

ABSOLUTE RULES:
- Output ONLY a valid JSON object. No markdown fences. No prose. No commentary.
- Do NOT generate JSX, HTML, CSS, JavaScript, or Tailwind class names. You ONLY pick component names from the allow-list below.
- Each section's component MUST be valid for that section's id (see ALLOWED COMPONENTS PER SECTION below).
- Do not invent resume facts, companies, schools, dates, metrics, or links.
- "stats" must be an empty array unless a real number is clearly stated in the ResumeData (e.g., "cut p95 from 3.1s to 1.4s"). Each stat must include a "source" field that points back to the resume fact.
- "highlightedSkills" must be a subset of items that actually appear in resume.skills.{languages,frameworks,tools,other}.
- "featuredProjects" must be a subset of resume.projects[].name values (exact match). Empty if no projects.
- "imageUsage" must only reference image IDs from the provided "images" input list. If no images are provided, leave imageUsage as an empty array.
- "imageUsage" entries must be full objects with imageId, usage, sectionId, component, and reason. Never return bare imageId strings.
- "imageUsage[].usage" must be one of: avatar | project | background | general.
- If no "avatar" image is provided in the images list, set hero "showAvatar": false and "avatarImageId": "".
- Sections must include at least "hero" and "contact". Skip a section if the resume has no content for it.
- Sort sections by importance for the careerDirection. Use the "order" field starting at 1.

ALLOWED COMPONENTS PER SECTION:
${componentLines}

ALLOWED VALUES:
- theme.mode: ${THEME_MODES.join(" | ")}
- theme.backgroundStyle: ${BACKGROUND_STYLES.join(" | ")}
- theme.fontStyle: ${FONT_STYLES.join(" | ")}
- theme.spacing: ${SPACINGS.join(" | ")}
- theme.borderRadius: ${BORDER_RADII.join(" | ")}
- layout.pageType: single-page
- layout.maxWidth: ${MAX_WIDTHS.join(" | ")}
- layout.sectionSpacing: ${SPACINGS.join(" | ")}
- layout.navigation: ${NAVIGATIONS.join(" | ")}
- primaryColor / accentColor: hex strings like "#RRGGBB"
- section.id: one of ${SECTION_IDS.join(" | ")}

CAREER DIRECTION GUIDANCE:
- software-engineer: prefer SplitHero, SkillBadgeCloud or TechStackGrid, ExperienceTimeline, ProjectCardGrid, ContactCTA. Surface GitHub if present. Avoid overly creative layouts unless visualStyle requests it.
- data-ai-ml: prefer SplitHero, TechStackGrid, FeaturedProject, ExperienceTimeline. Use AcademicPublicationBlock ONLY when resume.publications.length > 0.
- finance-accounting: prefer MinimalHero, SummaryBlock, CorporateExperienceList, CertificationCards, EducationCards, MinimalContact. Formal, conservative, minimal animation.
- product-business: prefer CenteredHero, AboutCard, ExperienceCards, ProjectCardGrid, ContactCTA. Use ImpactMetrics ONLY when you can derive at least 2 real metrics from the resume.
- designer-creative: prefer CreativeImageHero, AboutSplit, ProjectImageGallery, FeaturedProject, SkillBadgeCloud, ContactCTA. Use project images if provided.
- academic-research: prefer MinimalHero, SummaryBlock, AcademicEducationBlock, AcademicPublicationBlock, AwardList, MinimalContact. Text-focused.

VISUAL STYLE GUIDANCE:
- minimal-professional: clean light neutral. backgroundStyle "plain" or "subtle-gradient". Avoid unnecessary imagery.
- modern-tech: sleek, slightly bold. backgroundStyle "subtle-gradient" or "grid".
- corporate-clean: formal. backgroundStyle "plain". Minimal animation.
- creative-portfolio: expressive, image-friendly. backgroundStyle can be "soft-color" or "image" when an image is available. Larger hero is okay.
- dark-mode-developer: theme.mode "dark". backgroundStyle "grid" or "subtle-gradient". Technical feel.
- elegant-academic: refined, text-focused. fontStyle "classic" or "editorial". backgroundStyle "plain" or "soft-color".

PROPS RULES:
- For hero: { showAvatar (bool), avatarImageId (string), avatarPosition ("left"|"right"|"center"), avatarSize ("small"|"medium"|"large"), avatarShape ("circle"|"rounded"|"square"), showSocialLinks (bool), headlineStyle ("bold"|"display"|"plain"), background ("plain"|"gradient"|"image") }
- For other components: keep props short and self-explanatory. Do not invent unrelated keys.
- Always include "props": {} even when empty.

REQUIRED SCHEMA (every key must be present):
{
  "version": "1.0",
  "careerDirection": "",
  "visualStyle": "",
  "theme": {
    "mode": "",
    "primaryColor": "",
    "accentColor": "",
    "backgroundStyle": "",
    "fontStyle": "",
    "spacing": "",
    "borderRadius": ""
  },
  "layout": {
    "pageType": "single-page",
    "maxWidth": "",
    "sectionSpacing": "",
    "navigation": ""
  },
  "sections": [
    { "id": "", "component": "", "enabled": true, "order": 1, "props": {} }
  ],
  "highlightedSkills": [],
  "featuredProjects": [],
  "stats": [],
  "imageUsage": [
    { "imageId": "", "usage": "", "sectionId": "", "component": "", "reason": "" }
  ],
  "notes": ""
}`;
}

function buildUserPrompt(
  resume: ResumeData,
  direction: CareerDirection,
  style: VisualStyle,
  images: PageBlueprintImage[]
): string {
  return [
    `ResumeData:`,
    "```json",
    JSON.stringify(resume, null, 2),
    "```",
    "",
    `careerDirection: "${direction}"`,
    `visualStyle: "${style}"`,
    "",
    "Images provided (you may reference these by id in imageUsage and hero props):",
    "```json",
    JSON.stringify(
      images.map(({ id, type, alt, relatedProject }) => ({ id, type, alt, relatedProject })),
      null,
      2
    ),
    "```",
    "",
    "Return the JSON PageBlueprint object now.",
  ].join("\n");
}

// ---------- Helpers ----------

function stripCodeFences(s: string): string {
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const m = s.match(fence);
  if (m) return m[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first > 0 && last > first) return s.slice(first, last + 1);
  return s;
}

/**
 * Defensive cleanup on validated LLM output:
 *   - drop highlightedSkills not in resume.skills
 *   - drop featuredProjects whose names don't exist
 *   - drop imageUsage entries that reference unknown image IDs
 *   - drop sections whose underlying content is missing (keep hero + contact)
 *   - normalize section.order to 1..N in stable order
 *   - if hero has showAvatar=true but no avatar image was provided, flip it off
 */
function sanitizeBlueprint(
  blueprint: PageBlueprint,
  resume: ResumeData,
  images: PageBlueprintImage[]
): PageBlueprint {
  const knownSkills = new Set<string>([
    ...resume.skills.languages,
    ...resume.skills.frameworks,
    ...resume.skills.tools,
    ...resume.skills.other,
  ]);
  const projectNames = new Set(resume.projects.map((p) => p.name).filter(Boolean));
  const imageIds = new Set(images.map((i) => i.id));
  const hasAvatar = images.some((i) => i.type === "avatar");

  const highlightedSkills = blueprint.highlightedSkills.filter((s) => knownSkills.has(s));
  const featuredProjects = blueprint.featuredProjects.filter((n) => projectNames.has(n));
  const imageUsage = blueprint.imageUsage.filter((u) => imageIds.has(u.imageId));

  // Filter empty sections, then re-number order 1..N in current order.
  let sections = blueprint.sections
    .filter((s) => hasContentForSection(s.id, resume))
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i + 1 }));

  // Ensure hero + contact always present.
  if (!sections.some((s) => s.id === "hero")) {
    sections = [
      {
        id: "hero",
        component: "SplitHero",
        enabled: true,
        order: 0,
        props: {
          showAvatar: hasAvatar,
          avatarImageId: "",
          avatarPosition: "right",
          avatarSize: "large",
          avatarShape: "circle",
          showSocialLinks: true,
          headlineStyle: "bold",
          background: "gradient",
        },
      },
      ...sections,
    ];
  }
  if (!sections.some((s) => s.id === "contact")) {
    sections.push({
      id: "contact",
      component: "ContactCTA",
      enabled: true,
      order: sections.length + 1,
      props: {},
    });
  }
  sections = sections.map((s, i) => ({ ...s, order: i + 1 }));

  // Flip showAvatar off when there's no avatar image to back it.
  sections = sections.map((s) => {
    if (s.id !== "hero") return s;
    const heroProps = { ...s.props } as Record<string, unknown>;
    if (heroProps.showAvatar && !hasAvatar) {
      heroProps.showAvatar = false;
      heroProps.avatarImageId = "";
    } else if (hasAvatar) {
      heroProps.showAvatar = true;
      heroProps.avatarImageId = images.find((i) => i.type === "avatar")?.id ?? "";
    }
    return { ...s, props: heroProps };
  });

  const deterministicUsage = deterministicImageUsage(imageUsage, sections, images);

  // Stats: trust the LLM but at least require label+value (already enforced by schema).
  return {
    ...blueprint,
    sections,
    highlightedSkills,
    featuredProjects,
    imageUsage: deterministicUsage,
  };
}
