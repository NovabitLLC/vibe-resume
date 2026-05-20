/**
 * Tiny localStorage helpers. The pipeline accumulates data across pages
 * (PDF -> rawText -> ResumeData -> PageBlueprint); we stash intermediate
 * results here so the user can navigate without losing work.
 */

import type { CareerDirection, VisualStyle } from "./types";
import { resumeSchema, type ResumeData } from "./resumeSchema";
import { pageBlueprintImageSchema, pageBlueprintSchema } from "./pageBlueprintSchema";
import { careerDirectionSchema, visualStyleSchema } from "./schemas";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";

export const STORAGE_KEYS = {
  rawText: "viberesume:rawText",
  filename: "viberesume:filename",
  direction: "viberesume:direction",
  style: "viberesume:style",
  /** Canonical key for the parsed resume JSON (Phase 3). */
  resume: "vibe-resume-data",
  /** Canonical key for the generated page blueprint (Phase 4). */
  blueprint: "vibe-resume-blueprint",
  /** Uploaded images, including data URLs, used to resolve blueprint image refs. */
  images: "vibe-resume-images",
} as const;

export interface ExtractionRecord {
  text: string;
  filename: string;
  direction: CareerDirection;
  style: VisualStyle;
  /** ISO timestamp of when it was extracted. */
  extractedAt: string;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// ---------- Extraction (Phase 2) ----------

export function saveExtraction(rec: ExtractionRecord) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.rawText, rec.text);
    localStorage.setItem(STORAGE_KEYS.filename, rec.filename);
    localStorage.setItem(STORAGE_KEYS.direction, rec.direction);
    localStorage.setItem(STORAGE_KEYS.style, rec.style);
    localStorage.setItem("viberesume:extractedAt", rec.extractedAt);
  } catch {
    /* ignore */
  }
}

export function loadExtraction(): ExtractionRecord | null {
  if (!isBrowser()) return null;
  try {
    const text = localStorage.getItem(STORAGE_KEYS.rawText);
    const filename = localStorage.getItem(STORAGE_KEYS.filename);
    const direction = localStorage.getItem(STORAGE_KEYS.direction);
    const style = localStorage.getItem(STORAGE_KEYS.style);
    const extractedAt = localStorage.getItem("viberesume:extractedAt");
    if (!text || !filename || !extractedAt) return null;
    // Validate enums — slugs from older sessions may be out of date.
    const dResult = careerDirectionSchema.safeParse(direction);
    const sResult = visualStyleSchema.safeParse(style);
    if (!dResult.success || !sResult.success) return null;
    return {
      text,
      filename,
      direction: dResult.data,
      style: sResult.data,
      extractedAt,
    };
  } catch {
    return null;
  }
}

export function clearExtraction() {
  if (!isBrowser()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("viberesume:extractedAt");
    localStorage.removeItem("viberesume:resumeSavedAt");
    localStorage.removeItem("viberesume:blueprintSavedAt");
    localStorage.removeItem("viberesume:imagesSavedAt");
  } catch {
    /* ignore */
  }
}

// ---------- Parsed resume (Phase 3) ----------

export function saveResumeData(resume: ResumeData) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.resume, JSON.stringify(resume));
    localStorage.setItem("viberesume:resumeSavedAt", new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function loadResumeData(): ResumeData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.resume);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = resumeSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function clearResumeData() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.resume);
    localStorage.removeItem("viberesume:resumeSavedAt");
  } catch {
    /* ignore */
  }
}

// ---------- Page blueprint (Phase 4) ----------

export function savePageBlueprint(blueprint: PageBlueprint) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.blueprint, JSON.stringify(blueprint));
    localStorage.setItem("viberesume:blueprintSavedAt", new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function loadPageBlueprint(): PageBlueprint | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.blueprint);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = pageBlueprintSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function clearPageBlueprint() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.blueprint);
    localStorage.removeItem("viberesume:blueprintSavedAt");
  } catch {
    /* ignore */
  }
}

// ---------- Uploaded images (Phase 4.5) ----------

export function saveUploadedImages(images: PageBlueprintImage[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.images, JSON.stringify(images));
    localStorage.setItem("viberesume:imagesSavedAt", new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function loadUploadedImages(): PageBlueprintImage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.images);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = pageBlueprintImageSchema.array().safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function clearUploadedImages() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.images);
    localStorage.removeItem("viberesume:imagesSavedAt");
  } catch {
    /* ignore */
  }
}
