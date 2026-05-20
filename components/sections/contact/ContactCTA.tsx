"use client";

import { Github, Globe, Linkedin, Mail, Phone } from "lucide-react";
import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { compactUrl } from "../shared/resume-ui";
import { cn } from "@/lib/utils";

export function ContactCTA(props: SectionComponentProps) {
  const items = contactItems(props);
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className={cn(props.theme.card, "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between")}>
        <div>
          <h3 className="text-xl font-semibold">Let&apos;s connect</h3>
          <p className={cn("mt-1 text-sm", props.theme.subtleText)}>
            Open to conversations about roles, projects, and collaborations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <ContactLink key={item.label} item={item} props={props} primary={item.kind === "email"} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export function ContactCard(props: SectionComponentProps) {
  const items = contactItems(props);
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className={cn(props.theme.card, "max-w-2xl")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <ContactLink key={item.label} item={item} props={props} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export function MinimalContact(props: SectionComponentProps) {
  const items = contactItems(props);
  if (items.length === 0) return null;

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className={cn("flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm", props.theme.subtleText)}>
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className={props.theme.link}
          >
            {item.label}
          </a>
        ))}
      </div>
    </SectionWrapper>
  );
}

type ContactItem = {
  label: string;
  href: string;
  external?: boolean;
  kind: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function contactItems(props: SectionComponentProps): ContactItem[] {
  const resume = props.resume;
  return [
    resume.email
      ? { label: resume.email, href: `mailto:${resume.email}`, kind: "email", Icon: Mail }
      : null,
    resume.phone ? { label: resume.phone, href: `tel:${resume.phone}`, kind: "phone", Icon: Phone } : null,
    resume.linkedin
      ? { label: "LinkedIn", href: resume.linkedin, external: true, kind: "linkedin", Icon: Linkedin }
      : null,
    resume.github
      ? { label: "GitHub", href: resume.github, external: true, kind: "github", Icon: Github }
      : null,
    resume.portfolio
      ? {
          label: compactUrl(resume.portfolio),
          href: resume.portfolio,
          external: true,
          kind: "portfolio",
          Icon: Globe,
        }
      : null,
  ].filter(Boolean) as ContactItem[];
}

function ContactLink({
  item,
  props,
  primary,
}: {
  item: ContactItem;
  props: SectionComponentProps;
  primary?: boolean;
}) {
  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-2 text-sm",
        props.theme.radius,
        primary ? "bg-[color:var(--site-primary)] text-white" : props.theme.link
      )}
      style={{ borderColor: primary ? "transparent" : "var(--site-muted)" }}
    >
      <item.Icon className="h-4 w-4" />
      {item.label}
    </a>
  );
}
