"use client";

import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { cn } from "@/lib/utils";

export function AboutCard(props: SectionComponentProps) {
  if (!props.resume.summary) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className={cn(props.theme.card, "max-w-3xl")}>
        <p className={cn("text-base leading-relaxed sm:text-lg", props.theme.subtleText)}>
          {props.resume.summary}
        </p>
      </div>
    </SectionWrapper>
  );
}

export function AboutSplit(props: SectionComponentProps) {
  if (!props.resume.summary) return null;
  const highlights = props.blueprint.highlightedSkills.slice(0, 4);
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-6 sm:grid-cols-[1.2fr_0.8fr]">
        <p className={cn("text-base leading-relaxed sm:text-lg", props.theme.subtleText)}>
          {props.resume.summary}
        </p>
        {highlights.length > 0 && (
          <div className={cn(props.theme.mutedCard, "self-start")}>
            <p className="text-sm font-medium">Current focus</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className={props.theme.badge}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export function SummaryBlock(props: SectionComponentProps) {
  if (!props.resume.summary) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <p className={cn("max-w-3xl text-base leading-7", props.theme.subtleText)}>
        {props.resume.summary}
      </p>
    </SectionWrapper>
  );
}
