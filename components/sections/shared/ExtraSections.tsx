"use client";

import { Award, BadgeCheck, FileText, Trophy } from "lucide-react";
import type { SectionComponentProps } from "@/components/renderer/types";
import type { BlueprintStat } from "@/types/pageBlueprint";
import { SectionWrapper, sectionTitle } from "./SectionWrapper";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

/* ------------------------------------------------------------------ *
 * Certifications
 * ------------------------------------------------------------------ */

export function CertificationList(props: SectionComponentProps) {
  return (
    <IconList props={props} items={props.resume.certifications} Icon={BadgeCheck} />
  );
}

export function CertificationCards(props: SectionComponentProps) {
  return (
    <IconCards props={props} items={props.resume.certifications} Icon={BadgeCheck} />
  );
}

/* ------------------------------------------------------------------ *
 * Awards
 * ------------------------------------------------------------------ */

export function AwardList(props: SectionComponentProps) {
  return <IconList props={props} items={props.resume.awards} Icon={Trophy} />;
}

export function AwardCards(props: SectionComponentProps) {
  return <IconCards props={props} items={props.resume.awards} Icon={Award} accent />;
}

/* ------------------------------------------------------------------ *
 * Publications
 * ------------------------------------------------------------------ */

export function PublicationList(props: SectionComponentProps) {
  return <IconList props={props} items={props.resume.publications} Icon={FileText} />;
}

/**
 * Distinct from PublicationList: a formal, numbered citation block with a
 * hanging indent and quiet typography — reads like a CV references section.
 */
export function AcademicPublicationBlock(props: SectionComponentProps) {
  const items = props.resume.publications;
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm leading-relaxed"
          >
            <span
              className="pt-0.5 font-semibold tabular-nums text-[color:var(--site-primary)]"
              aria-hidden
            >
              {index + 1}.
            </span>
            <p className="text-pretty">{item}</p>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}

/* ------------------------------------------------------------------ *
 * Stats — three distinct visual treatments of blueprint.stats
 * ------------------------------------------------------------------ */

/** Horizontal row of compact stat cards. */
export function StatsStrip(props: SectionComponentProps) {
  const stats = props.blueprint.stats;
  if (stats.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={`${stat.label}-${index}`} className={props.theme.mutedCard}>
            <p className="text-3xl font-semibold text-[color:var(--site-primary)]">
              {stat.value}
            </p>
            <p className={cn("mt-1 text-sm", props.theme.subtleText)}>{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/**
 * Distinct from StatsStrip: larger emphasis "metric" cards with an accent rule,
 * an oversized number, and the supporting source rendered as a caption.
 */
export function ImpactMetrics(props: SectionComponentProps) {
  const stats = props.blueprint.stats;
  if (stats.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={`${stat.label}-${index}`}
            className={cn(props.theme.card, "relative overflow-hidden")}
          >
            <span
              className="absolute inset-x-0 top-0 h-1 bg-[color:var(--site-primary)]"
              aria-hidden
            />
            <p className="mt-1 text-4xl font-bold tracking-tight text-[color:var(--site-primary)]">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-medium">{stat.label}</p>
            {stat.source && (
              <p className={cn("mt-2 text-xs leading-snug", props.theme.subtleText)}>
                {stat.source}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/**
 * Distinct from StatsStrip/ImpactMetrics: a simple non-interactive horizontal
 * bar visualization. Bar widths are derived ONLY from the leading number that
 * already exists in each stat's value (never invented); stats without a number
 * render a full decorative bar. Magnitudes are normalized to the largest value
 * and clamped to a readable minimum.
 */
export function SkillChart(props: SectionComponentProps) {
  const stats = props.blueprint.stats;
  if (stats.length === 0) return null;

  const magnitudes = stats.map((stat) => leadingNumber(stat.value));
  const max = Math.max(1, ...magnitudes.map((value) => value ?? 0));

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <StatBar
            key={`${stat.label}-${index}`}
            stat={stat}
            magnitude={magnitudes[index]}
            max={max}
            props={props}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function StatBar({
  stat,
  magnitude,
  max,
  props,
}: {
  stat: BlueprintStat;
  magnitude: number | null;
  max: number;
  props: SectionComponentProps;
}) {
  // No parseable number → decorative full bar. Otherwise scale to the max,
  // clamped to 35%..100% so small magnitudes stay visible.
  const width =
    magnitude == null ? 100 : Math.max(35, Math.min(100, (magnitude / max) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{stat.label}</span>
        <span className="font-semibold text-[color:var(--site-primary)]">{stat.value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--site-muted)]">
        <div
          className="h-full rounded-full bg-[color:var(--site-primary)] transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
      {stat.source && (
        <p className={cn("mt-1 text-xs leading-snug", props.theme.subtleText)}>{stat.source}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shared list / card helpers
 * ------------------------------------------------------------------ */

function IconList({
  props,
  items,
  Icon,
}: {
  props: SectionComponentProps;
  items: string[];
  Icon: IconType;
}) {
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--site-primary)]" />
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function IconCards({
  props,
  items,
  Icon,
  accent,
}: {
  props: SectionComponentProps;
  items: string[];
  Icon: IconType;
  accent?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(props.theme.card, "flex items-start gap-3")}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                accent ? "text-white" : "text-[color:var(--site-primary)]"
              )}
              style={
                accent
                  ? { background: "var(--site-primary)" }
                  : { background: "color-mix(in srgb, var(--site-primary) 12%, transparent)" }
              }
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm leading-relaxed text-pretty">{item}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

/**
 * Extract the first numeric magnitude from a stat value string.
 * "34%" -> 34, "1.4s" -> 1.4, "~12k" -> 12, "+34%" -> 34, "x3" -> 3.
 * Returns null when there is no number to chart (so we never invent data).
 */
function leadingNumber(value: string): number | null {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.abs(parsed) : null;
}
