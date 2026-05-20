"use client";

import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { formatDateRange } from "../shared/resume-ui";
import { cn } from "@/lib/utils";

export function EducationCards(props: SectionComponentProps) {
  if (props.resume.education.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-4 sm:grid-cols-2">
        {props.resume.education.map((item, index) => (
          <div key={`${item.school}-${index}`} className={props.theme.card}>
            <EducationBody item={item} props={props} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function EducationTimeline(props: SectionComponentProps) {
  if (props.resume.education.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <ol className="space-y-4">
        {props.resume.education.map((item, index) => (
          <li key={`${item.school}-${index}`} className="grid gap-2 sm:grid-cols-[160px_1fr]">
            <p className={cn("text-sm", props.theme.subtleText)}>
              {formatDateRange(item.startDate, item.endDate)}
            </p>
            <EducationBody item={item} props={props} hideDate />
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}

export function AcademicEducationBlock(props: SectionComponentProps) {
  if (props.resume.education.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="divide-y" style={{ borderColor: "var(--site-muted)" }}>
        {props.resume.education.map((item, index) => (
          <div key={`${item.school}-${index}`} className="py-4 first:pt-0">
            <EducationBody item={item} props={props} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function EducationBody({
  item,
  props,
  hideDate,
}: {
  item: SectionComponentProps["resume"]["education"][number];
  props: SectionComponentProps;
  hideDate?: boolean;
}) {
  return (
    <div>
      <h3 className="font-semibold">{item.school || "School"}</h3>
      {(item.degree || item.location || !hideDate) && (
        <p className={cn("mt-1 text-sm", props.theme.subtleText)}>
          {[item.degree, item.location, hideDate ? "" : formatDateRange(item.startDate, item.endDate)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {item.details.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {item.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
