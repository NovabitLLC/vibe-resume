"use client";

import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { formatDateRange } from "../shared/resume-ui";
import { cn } from "@/lib/utils";

export function ExperienceTimeline(props: SectionComponentProps) {
  if (props.resume.experience.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <ol className="relative space-y-8 border-l pl-6" style={{ borderColor: "var(--site-muted)" }}>
        {props.resume.experience.map((item, index) => (
          <li key={`${item.company}-${item.role}-${index}`} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[color:var(--site-primary)]" />
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              <p className={cn("text-sm", props.theme.subtleText)}>
                {formatDateRange(item.startDate, item.endDate)}
                {item.location && <span className="block text-xs">{item.location}</span>}
              </p>
              <ExperienceBody item={item} props={props} />
            </div>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}

export function ExperienceCards(props: SectionComponentProps) {
  if (props.resume.experience.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-4">
        {props.resume.experience.map((item, index) => (
          <div key={`${item.company}-${item.role}-${index}`} className={props.theme.card}>
            <ExperienceBody item={item} props={props} showMeta />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function CorporateExperienceList(props: SectionComponentProps) {
  if (props.resume.experience.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="divide-y" style={{ borderColor: "var(--site-muted)" }}>
        {props.resume.experience.map((item, index) => (
          <div key={`${item.company}-${item.role}-${index}`} className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[1fr_180px]">
            <ExperienceBody item={item} props={props} />
            <p className={cn("text-sm sm:text-right", props.theme.subtleText)}>
              {formatDateRange(item.startDate, item.endDate)}
              {item.location && <span className="block text-xs">{item.location}</span>}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function ExperienceBody({
  item,
  props,
  showMeta,
}: {
  item: SectionComponentProps["resume"]["experience"][number];
  props: SectionComponentProps;
  showMeta?: boolean;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold">
        {item.role || "Role"}
        {item.company && <span className={props.theme.subtleText}> · {item.company}</span>}
      </h3>
      {showMeta && (
        <p className={cn("mt-1 text-sm", props.theme.subtleText)}>
          {formatDateRange(item.startDate, item.endDate)}
          {item.location ? ` · ${item.location}` : ""}
        </p>
      )}
      {item.bullets.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {item.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
