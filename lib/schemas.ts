import { z } from "zod";

/**
 * Zod schemas for WebsiteConfig (presentation). The ResumeData schema
 * lives in lib/resumeSchema.ts so the parse-resume route imports it cleanly.
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
  "experience",
  "projects",
  "education",
  "skills",
  "awards",
  "certifications",
  "publications",
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

export type WebsiteConfigParsed = z.infer<typeof websiteConfigSchema>;
