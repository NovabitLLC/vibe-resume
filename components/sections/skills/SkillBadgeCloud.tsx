"use client";

import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { allSkills, skillGroups, SkillBadge } from "../shared/resume-ui";
import { cn } from "@/lib/utils";

export function SkillBadgeCloud(props: SectionComponentProps) {
  const skills = allSkills(props.resume);
  if (skills.length === 0) return null;
  const highlighted = new Set(props.blueprint.highlightedSkills);

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge key={skill} skill={skill} highlighted={highlighted.has(skill)} props={props} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export function GroupedSkills(props: SectionComponentProps) {
  const groups = skillGroups(props.resume);
  if (groups.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.label} className={props.theme.mutedCard}>
            <h3 className="text-sm font-semibold">{group.label}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <SkillBadge
                  key={skill}
                  skill={skill}
                  highlighted={props.blueprint.highlightedSkills.includes(skill)}
                  props={props}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function TechStackGrid(props: SectionComponentProps) {
  const groups = skillGroups(props.resume);
  if (groups.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div key={group.label} className={cn(props.theme.card, "min-h-36")}>
            <p className={cn("text-xs uppercase tracking-[0.16em]", props.theme.subtleText)}>
              {group.label}
            </p>
            <div className="mt-4 space-y-2">
              {group.items.map((skill) => (
                <div
                  key={skill}
                  className="rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--site-muted)" }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function SkillBarList(props: SectionComponentProps) {
  const skills = allSkills(props.resume);
  if (skills.length === 0) return null;
  const highlighted = new Set(props.blueprint.highlightedSkills);

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="space-y-3">
        {skills.slice(0, 12).map((skill, index) => (
          <div key={skill}>
            <div className="flex items-center justify-between text-sm">
              <span>{skill}</span>
              {highlighted.has(skill) && <span className={props.theme.subtleText}>highlight</span>}
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--site-muted)]">
              <div
                className="h-full rounded-full bg-[color:var(--site-primary)]"
                style={{ width: `${Math.max(52, 94 - index * 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
