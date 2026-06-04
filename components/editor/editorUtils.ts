/**
 * Pure helpers for the Preview Editor.
 *
 * Two themes:
 *   - Immutable array helpers (updateAt / removeAt / addAt / moveItem) so
 *     the sub-editors can pass tight onChange handlers without re-implementing
 *     spread acrobatics every time.
 *   - String parsers (csv, lines) for compact list inputs.
 */

import type {
  BlueprintSection,
  BlueprintImageUsage,
  ComponentName,
  PageBlueprint,
  PageBlueprintImage,
  SectionId,
} from "@/types/pageBlueprint";

// ---------- Array helpers ----------

export function updateAt<T>(arr: T[], index: number, updater: (item: T) => T): T[] {
  if (index < 0 || index >= arr.length) return arr;
  const next = arr.slice();
  next[index] = updater(arr[index]);
  return next;
}

export function setAt<T>(arr: T[], index: number, value: T): T[] {
  return updateAt(arr, index, () => value);
}

export function removeAt<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) return arr;
  const next = arr.slice();
  next.splice(index, 1);
  return next;
}

export function addItem<T>(arr: T[], item: T): T[] {
  return [...arr, item];
}

export function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return arr;
  if (fromIndex < 0 || fromIndex >= arr.length) return arr;
  if (toIndex < 0 || toIndex >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

// ---------- String list parsers ----------

/** "TypeScript, Python ,  Go" -> ["TypeScript", "Python", "Go"]. */
export function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function toCsv(arr: string[]): string {
  return arr.join(", ");
}

/** Each non-empty line becomes one entry. Used for bullets / details. */
export function parseLines(input: string): string[] {
  return input
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function toLines(arr: string[]): string {
  return arr.join("\n");
}

// ---------- Hex color ----------

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

export function normalizeHexColor(value: string, fallback: string): string {
  return isValidHexColor(value) ? value.toLowerCase() : fallback;
}

// ---------- Section helpers ----------

/**
 * Re-number `order` to a contiguous 1..N range based on current array order.
 * Run this whenever sections are moved/added/removed so the renderer never
 * sees gaps or duplicates.
 */
export function renumberSections(sections: BlueprintSection[]): BlueprintSection[] {
  return sections.map((section, index) => ({ ...section, order: index + 1 }));
}

/** Move a section by id, then renumber. Returns the original array if no-op. */
export function moveSection(
  sections: BlueprintSection[],
  fromIndex: number,
  toIndex: number
): BlueprintSection[] {
  const moved = moveItem(sections, fromIndex, toIndex);
  return moved === sections ? sections : renumberSections(moved);
}

// ---------- Image / avatar usage ----------

/**
 * Mark a single image ID as the avatar in `blueprint.imageUsage`, and clear
 * any conflicting avatar usage records. The renderer picks up the avatar
 * either via this usage record OR via `image.type === "avatar"` — we keep
 * both in sync.
 *
 * `heroComponent` should be the current hero section's component name so the
 * usage record points at the right one. Falls back to "SplitHero".
 */
export function setAvatarUsage(
  imageUsage: BlueprintImageUsage[],
  imageId: string,
  heroComponent: ComponentName = "SplitHero"
): BlueprintImageUsage[] {
  const filtered = imageUsage.filter((u) => u.usage !== "avatar");
  return [
    ...filtered,
    {
      imageId,
      usage: "avatar",
      sectionId: "hero",
      component: heroComponent,
      reason: "Marked as avatar in the editor.",
    },
  ];
}

/**
 * Remove any imageUsage entries that reference an image that no longer
 * exists in `images`. Keep everything else as-is.
 */
export function pruneImageUsage(
  imageUsage: BlueprintImageUsage[],
  images: PageBlueprintImage[]
): BlueprintImageUsage[] {
  const known = new Set(images.map((i) => i.id));
  return imageUsage.filter((u) => known.has(u.imageId));
}

/**
 * Lookup helper: which sectionIds are NOT currently in the blueprint?
 * Used by the "add missing section" dropdown.
 */
export function missingSectionIds(
  blueprint: PageBlueprint,
  candidates: SectionId[]
): SectionId[] {
  const present = new Set(blueprint.sections.map((s) => s.id));
  return candidates.filter((id) => !present.has(id));
}
