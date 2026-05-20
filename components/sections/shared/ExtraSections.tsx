"use client";

import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "./SectionWrapper";
import { cn } from "@/lib/utils";

export function CertificationList(props: SectionComponentProps) {
  return <SimpleList props={props} items={props.resume.certifications} />;
}

export function CertificationCards(props: SectionComponentProps) {
  return <SimpleCards props={props} items={props.resume.certifications} />;
}

export function AwardList(props: SectionComponentProps) {
  return <SimpleList props={props} items={props.resume.awards} />;
}

export function AwardCards(props: SectionComponentProps) {
  return <SimpleCards props={props} items={props.resume.awards} />;
}

export function PublicationList(props: SectionComponentProps) {
  return <SimpleList props={props} items={props.resume.publications} />;
}

export function AcademicPublicationBlock(props: SectionComponentProps) {
  return <SimpleList props={props} items={props.resume.publications} />;
}

export function StatsStrip(props: SectionComponentProps) {
  if (props.blueprint.stats.length === 0) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {props.blueprint.stats.map((stat, index) => (
          <div key={`${stat.label}-${index}`} className={props.theme.mutedCard}>
            <p className="text-3xl font-semibold text-[color:var(--site-primary)]">{stat.value}</p>
            <p className={cn("mt-1 text-sm", props.theme.subtleText)}>{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ImpactMetrics(props: SectionComponentProps) {
  return <StatsStrip {...props} />;
}

export function SkillChart(props: SectionComponentProps) {
  return <StatsStrip {...props} />;
}

function SimpleList({ props, items }: { props: SectionComponentProps; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <ul className="space-y-2 text-sm leading-relaxed">
        {items.map((item, index) => (
          <li key={index} className="border-l-2 pl-3" style={{ borderColor: "var(--site-primary)" }}>
            {item}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function SimpleCards({ props, items }: { props: SectionComponentProps; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className={props.theme.mutedCard}>
            <p className="text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
