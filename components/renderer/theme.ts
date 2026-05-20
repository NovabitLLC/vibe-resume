"use client";

import type { CSSProperties } from "react";
import type { PageBlueprint } from "@/types/pageBlueprint";
import { cn } from "@/lib/utils";
import type { ImageResolver } from "./imageResolver";

export interface ThemeClasses {
  page: string;
  inner: string;
  section: string;
  sectionTitle: string;
  card: string;
  mutedCard: string;
  badge: string;
  subtleText: string;
  link: string;
  divider: string;
  radius: string;
  compactGap: string;
  font: string;
}

export function getThemeClasses(blueprint: PageBlueprint): ThemeClasses {
  const isDark = blueprint.theme.mode === "dark";
  const radius = radiusClass(blueprint.theme.borderRadius);
  const spacing = spacingClasses(blueprint.theme.spacing);

  return {
    page: cn(
      "min-h-full overflow-hidden",
      isDark ? "bg-zinc-950 text-zinc-50" : "bg-white text-slate-950",
      backgroundClass(blueprint.theme.backgroundStyle, isDark),
      fontClass(blueprint.theme.fontStyle)
    ),
    inner: cn("mx-auto px-5 sm:px-8", maxWidthClass(blueprint), spacing.inner),
    section: cn(spacing.section),
    sectionTitle: "mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--site-primary)]",
    card: cn(
      "border p-5 shadow-sm transition-colors",
      radius,
      isDark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white"
    ),
    mutedCard: cn(
      "border p-5",
      radius,
      isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50"
    ),
    badge: cn(
      "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
      isDark ? "border-white/10 bg-white/10 text-zinc-100" : "border-slate-200 bg-slate-100 text-slate-700"
    ),
    subtleText: isDark ? "text-zinc-400" : "text-slate-600",
    link: "transition-colors hover:text-[color:var(--site-primary)]",
    divider: isDark ? "border-white/10" : "border-slate-200",
    radius,
    compactGap: spacing.gap,
    font: fontClass(blueprint.theme.fontStyle),
  };
}

export function getThemeStyle(
  blueprint: PageBlueprint,
  imageResolver?: ImageResolver
): CSSProperties {
  const isDark = blueprint.theme.mode === "dark";
  const baseBg = isDark ? "#09090b" : "#ffffff";
  const fg = isDark ? "#fafafa" : "#0f172a";
  const muted = isDark ? "#18181b" : "#f8fafc";
  const mutedFg = isDark ? "#a1a1aa" : "#64748b";
  const background = imageResolver?.getBackgroundImage();

  const style: CSSProperties = {
    ["--site-primary" as never]: blueprint.theme.primaryColor,
    ["--site-accent" as never]: blueprint.theme.accentColor,
    ["--site-bg" as never]: baseBg,
    ["--site-fg" as never]: fg,
    ["--site-muted" as never]: muted,
    ["--site-muted-fg" as never]: mutedFg,
    color: fg,
  };

  if (blueprint.theme.backgroundStyle === "image" && background) {
    style.backgroundImage = isDark
      ? `linear-gradient(rgba(9,9,11,0.86), rgba(9,9,11,0.96)), url(${background.url})`
      : `linear-gradient(rgba(255,255,255,0.86), rgba(255,255,255,0.96)), url(${background.url})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  return style;
}

function maxWidthClass(blueprint: PageBlueprint): string {
  switch (blueprint.layout.maxWidth) {
    case "narrow":
      return "max-w-3xl";
    case "wide":
      return "max-w-6xl";
    case "standard":
    default:
      return "max-w-5xl";
  }
}

function spacingClasses(spacing: PageBlueprint["theme"]["spacing"]) {
  switch (spacing) {
    case "compact":
      return { inner: "py-10 sm:py-14", section: "mt-10 first:mt-0", gap: "gap-3" };
    case "spacious":
      return { inner: "py-16 sm:py-24", section: "mt-20 first:mt-0", gap: "gap-6" };
    case "comfortable":
    default:
      return { inner: "py-14 sm:py-20", section: "mt-16 first:mt-0", gap: "gap-4" };
  }
}

function radiusClass(radius: PageBlueprint["theme"]["borderRadius"]): string {
  switch (radius) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded";
    case "medium":
      return "rounded-md";
    case "xl":
      return "rounded-xl";
    case "large":
    default:
      return "rounded-lg";
  }
}

function fontClass(font: PageBlueprint["theme"]["fontStyle"]): string {
  switch (font) {
    case "classic":
      return "font-serif";
    case "technical":
      return "font-mono";
    case "editorial":
      return "font-serif";
    case "modern":
    default:
      return "font-sans";
  }
}

function backgroundClass(
  background: PageBlueprint["theme"]["backgroundStyle"],
  isDark: boolean
): string {
  switch (background) {
    case "subtle-gradient":
      return isDark
        ? "bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950"
        : "bg-gradient-to-b from-white via-slate-50 to-white";
    case "grid":
      return isDark
        ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"
        : "bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:32px_32px]";
    case "soft-color":
      return isDark
        ? "bg-gradient-to-br from-zinc-950 via-slate-900 to-emerald-950"
        : "bg-gradient-to-br from-white via-sky-50 to-emerald-50";
    case "image":
    case "plain":
    default:
      return "";
  }
}
