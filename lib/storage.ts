/**
 * Tiny localStorage helpers. The pipeline accumulates data across pages
 * (PDF -> rawText -> ResumeData -> WebsiteConfig); we stash intermediate
 * results here so the user can navigate without losing work.
 *
 * Keys are namespaced under "viberesume:".
 */

import type { CareerDirection, VisualStyle } from "./types";

export const STORAGE_KEYS = {
  rawText: "viberesume:rawText",
  filename: "viberesume:filename",
  direction: "viberesume:direction",
  style: "viberesume:style",
  // reserved for later phases:
  resume: "viberesume:resume",
  website: "viberesume:website",
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

export function saveExtraction(rec: ExtractionRecord) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.rawText, rec.text);
    localStorage.setItem(STORAGE_KEYS.filename, rec.filename);
    localStorage.setItem(STORAGE_KEYS.direction, rec.direction);
    localStorage.setItem(STORAGE_KEYS.style, rec.style);
    localStorage.setItem("viberesume:extractedAt", rec.extractedAt);
  } catch {
    // localStorage quota / disabled — fine to ignore for now.
  }
}

export function loadExtraction(): ExtractionRecord | null {
  if (!isBrowser()) return null;
  try {
    const text = localStorage.getItem(STORAGE_KEYS.rawText);
    const filename = localStorage.getItem(STORAGE_KEYS.filename);
    const direction = localStorage.getItem(STORAGE_KEYS.direction) as CareerDirection | null;
    const style = localStorage.getItem(STORAGE_KEYS.style) as VisualStyle | null;
    const extractedAt = localStorage.getItem("viberesume:extractedAt");
    if (!text || !filename || !direction || !style || !extractedAt) return null;
    return { text, filename, direction, style, extractedAt };
  } catch {
    return null;
  }
}

export function clearExtraction() {
  if (!isBrowser()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("viberesume:extractedAt");
  } catch {
    /* ignore */
  }
}
