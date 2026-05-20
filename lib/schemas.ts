import { z } from "zod";

/**
 * Zod schemas mirroring lib/types.ts.
 * Used to validate LLM output in phases 3/4 so we can trust the JSON before rendering.
 */

export const careerDirectionSchema = z.enum([
  "software-engineer",
  "product-manager",
  "designer",
  "data-scientist",
  "marketing",
  "founder",
  "student",
  "researcher",
  "other",
]);

export const visualStyleSchema = z.enum([
  "minimal",
  "modern",
  "elegant",
  "playful",
  "technical",
  "editorial",
]);

export const templateIdSchema = z.enum([
  "classic",
  "split",
  "magazine",
  "terminal",
]);

export const socialLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
  icon: z.string().optional(),
});

export const resumeBasicsSchema = z.object({
  name: z.string(),
  headline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  summary: z.string().optional(),
  socials: z.array(socialLinkSchema).optional(),
});

export const workExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const projectEntrySchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  imageId: z.string().optional(),
});

export const skillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const awardEntrySchema = z.object({
  title: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  summary: z.string().optional(),
});

export const resumeDataSchema = z.object({
  basics: resumeBasicsSchema,
  work: z.array(workExperienceSchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  projects: z.array(projectEntrySchema).default([]),
  skills: z.array(skillGroupSchema).default([]),
  awards: z.array(awardEntrySchema).optional(),
  extras: z
    .array(z.object({ title: z.string(), items: z.array(z.string()) }))
    .optional(),
});

export const themeConfigSchema = z.object({
  primary: z.string(),
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  muted: z.string(),
  fontHeading: z.enum(["sans", "serif", "mono"]),
  fontBody: z.enum(["sans", "serif", "mono"]),
  radius: z.enum(["sharp", "soft", "round"]),
});

export const sectionIdSchema = z.enum([
  "hero",
  "about",
  "work",
  "projects",
  "education",
  "skills",
  "awards",
  "contact",
]);

export const sectionConfigSchema = z.object({
  id: sectionIdSchema,
  title: z.string(),
  enabled: z.boolean(),
});

export const websiteConfigSchema = z.object({
  templateId: templateIdSchema,
  style: visualStyleSchema,
  direction: careerDirectionSchema,
  theme: themeConfigSchema,
  sections: z.array(sectionConfigSchema),
  heroImage: z.string().optional(),
  tagline: z.string().optional(),
});

export type ResumeDataParsed = z.infer<typeof resumeDataSchema>;
export type WebsiteConfigParsed = z.infer<typeof websiteConfigSchema>;
