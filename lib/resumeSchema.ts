import { z } from "zod";

/**
 * Canonical ResumeData shape — produced by the LLM in /api/parse-resume,
 * consumed by the preview / template renderer in later phases.
 *
 * Every field has a default so partial LLM output still validates;
 * missing fields fall back to "" or []. This keeps the renderer simple.
 */

export const skillsSchema = z
  .object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    other: z.array(z.string()).default([]),
  })
  .default({ languages: [], frameworks: [], tools: [], other: [] });

export const experienceItemSchema = z.object({
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  link: z.string().default(""),
});

export const educationItemSchema = z.object({
  school: z.string().default(""),
  degree: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.array(z.string()).default([]),
});

export const resumeSchema = z.object({
  name: z.string().default(""),
  title: z.string().default(""),
  location: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  portfolio: z.string().default(""),
  summary: z.string().default(""),
  skills: skillsSchema,
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  certifications: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  publications: z.array(z.string()).default([]),
});

export type ResumeData = z.infer<typeof resumeSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type Skills = z.infer<typeof skillsSchema>;

/** An empty, fully-defaulted ResumeData. Handy as a fallback. */
export function emptyResume(): ResumeData {
  return resumeSchema.parse({});
}
