/**
 * Shared simple Zod enums that mirror lib/types.ts.
 *
 * The full ResumeData / WebsiteConfig schemas live in their own files
 * (lib/resumeSchema.ts, lib/websiteConfigSchema.ts).
 */

import { z } from "zod";

export const careerDirectionSchema = z.enum([
  "software-engineer",
  "data-ai-ml",
  "finance-accounting",
  "product-business",
  "designer-creative",
  "academic-research",
]);

export const visualStyleSchema = z.enum([
  "minimal-professional",
  "modern-tech",
  "corporate-clean",
  "creative-portfolio",
  "dark-mode-developer",
  "elegant-academic",
]);

export const templateIdSchema = z.enum([
  "modern-tech",
  "corporate-clean",
  "creative-portfolio",
]);

export const sectionIdSchema = z.enum([
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "awards",
  "publications",
  "contact",
]);
