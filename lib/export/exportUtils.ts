/**
 * Pure, dependency-free helpers for the static HTML export.
 *
 * Everything here is server-safe (runs inside the /api/export-html route).
 * No React, no Next runtime, no DOM. All user-provided text MUST pass through
 * escapeHtml before landing in the output string, and all links through
 * sanitizeUrl.
 */

import type {
  PageBlueprint,
  PageBlueprintImage,
} from "@/types/pageBlueprint";

// ---------- HTML escaping ----------

/**
 * Escape a value for safe inclusion in HTML text or double-quoted attributes.
 * Handles &, <, >, ", '. Null/undefined become "".
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- Link sanitization ----------

/**
 * Return a safe href string, or null if the link is unsafe / unusable.
 *
 * Allowed: http://, https://, mailto:, tel:
 * Normalized: bare email -> mailto:, bare domain -> https://
 * Rejected: javascript:, vbscript:, file:, data:, and anything unrecognized.
 */
export function sanitizeUrl(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const url = String(raw).trim();
  if (!url) return null;

  const lower = url.toLowerCase();

  // Explicitly dangerous / disallowed schemes.
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("data:")
  ) {
    return null;
  }

  // Already-safe schemes pass through.
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("http://") ||
    lower.startsWith("https://")
  ) {
    return url;
  }

  // Bare email -> mailto:
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) {
    return `mailto:${url}`;
  }

  // Bare domain / domain+path -> https://
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(url)) {
    return `https://${url}`;
  }

  // Anything else is not a safe link.
  return null;
}

/** Build a tel: href from a phone string, stripping formatting. */
export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

// ---------- Images ----------

/**
 * Return a safe image src, or null. Only data:image/... and http(s) URLs are
 * allowed (uploaded images are data URLs from FileReader).
 */
export function safeImageSrc(image: PageBlueprintImage | undefined | null): string | null {
  if (!image || !image.url) return null;
  const url = image.url.trim();
  const lower = url.toLowerCase();
  if (lower.startsWith("data:image/")) return url;
  if (lower.startsWith("http://") || lower.startsWith("https://")) return url;
  return null;
}

/** Avatar: imageUsage usage==="avatar" wins, else first image of type "avatar". */
export function resolveAvatar(
  blueprint: PageBlueprint,
  images: PageBlueprintImage[]
): PageBlueprintImage | undefined {
  const usage = blueprint.imageUsage.find((u) => u.usage === "avatar");
  const byUsage = usage ? images.find((i) => i.id === usage.imageId) : undefined;
  return byUsage ?? images.find((i) => i.type === "avatar");
}

/** Project images: imageUsage usage==="project" first, then images of type "project". */
export function resolveProjectImages(
  blueprint: PageBlueprint,
  images: PageBlueprintImage[]
): PageBlueprintImage[] {
  const usedIds = blueprint.imageUsage
    .filter((u) => u.usage === "project")
    .map((u) => u.imageId);
  const byUsage = usedIds
    .map((id) => images.find((i) => i.id === id))
    .filter((i): i is PageBlueprintImage => Boolean(i));
  const fallback = images.filter((i) => i.type === "project");
  return uniqueImages([...byUsage, ...fallback]);
}

/** Background: imageUsage usage==="background" wins, else first image of type "background". */
export function resolveBackground(
  blueprint: PageBlueprint,
  images: PageBlueprintImage[]
): PageBlueprintImage | undefined {
  const usage = blueprint.imageUsage.find((u) => u.usage === "background");
  const byUsage = usage ? images.find((i) => i.id === usage.imageId) : undefined;
  return byUsage ?? images.find((i) => i.type === "background");
}

function uniqueImages(images: PageBlueprintImage[]): PageBlueprintImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

// ---------- Text helpers ----------

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDateRange(start?: string, end?: string): string {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} - Present`;
  if (!s && e) return e;
  return `${s} - ${e}`;
}

export function compactUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const dot = trimmed.indexOf(". ");
  if (dot < 0 || dot > 220) return trimmed.slice(0, 220);
  return trimmed.slice(0, dot + 1);
}

/**
 * Extract the first numeric magnitude from a stat value string, used only to
 * size decorative bars. Returns null when there is no number (never invents).
 */
export function leadingNumber(value: string): number | null {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.abs(parsed) : null;
}

/** Build a download-friendly filename from the resume name. */
export function safeFileName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base ? `${base}-vibe-resume.html` : "vibe-resume.html";
}

// ---------- Theme value mappers (enum -> safe CSS value) ----------

export function safeHex(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

export function radiusPx(radius: PageBlueprint["theme"]["borderRadius"]): string {
  switch (radius) {
    case "none":
      return "0px";
    case "small":
      return "8px";
    case "medium":
      return "12px";
    case "xl":
      return "24px";
    case "large":
    default:
      return "16px";
  }
}

export function maxWidthPx(maxWidth: PageBlueprint["layout"]["maxWidth"]): string {
  switch (maxWidth) {
    case "narrow":
      return "760px";
    case "wide":
      return "1152px";
    case "standard":
    default:
      return "1024px";
  }
}

export function sectionGapPx(spacing: PageBlueprint["layout"]["sectionSpacing"]): string {
  switch (spacing) {
    case "compact":
      return "40px";
    case "spacious":
      return "88px";
    case "comfortable":
    default:
      return "64px";
  }
}

export function innerPadPx(spacing: PageBlueprint["theme"]["spacing"]): string {
  switch (spacing) {
    case "compact":
      return "48px";
    case "spacious":
      return "104px";
    case "comfortable":
    default:
      return "76px";
  }
}

export function fontFamily(font: PageBlueprint["theme"]["fontStyle"]): string {
  switch (font) {
    case "classic":
      return "Georgia, 'Times New Roman', serif";
    case "editorial":
      return "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
    case "technical":
      return "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
    case "modern":
    default:
      return "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  }
}
