"use client";

import { ExternalLink, Github, Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import type { ResumeData, ProjectItem } from "@/lib/resumeSchema";
import type { PageBlueprintImage } from "@/types/pageBlueprint";
import { cn, initials } from "@/lib/utils";
import type { SectionComponentProps } from "@/components/renderer/types";

export type SkillGroup = { label: string; items: string[] };

export function skillGroups(resume: ResumeData): SkillGroup[] {
  return [
    { label: "Languages", items: resume.skills.languages },
    { label: "Frameworks", items: resume.skills.frameworks },
    { label: "Tools", items: resume.skills.tools },
    { label: "Other", items: resume.skills.other },
  ].filter((group) => group.items.length > 0);
}

export function allSkills(resume: ResumeData): string[] {
  return skillGroups(resume).flatMap((group) => group.items);
}

export function ContactMeta({ resume, props }: { resume: ResumeData; props: SectionComponentProps }) {
  const items = [
    resume.location ? { key: "location", Icon: MapPin, label: resume.location, href: "" } : null,
    resume.email ? { key: "email", Icon: Mail, label: resume.email, href: `mailto:${resume.email}` } : null,
    resume.phone ? { key: "phone", Icon: Phone, label: resume.phone, href: "" } : null,
    resume.portfolio
      ? { key: "portfolio", Icon: Globe, label: compactUrl(resume.portfolio), href: resume.portfolio }
      : null,
  ].filter(Boolean) as { key: string; Icon: React.ComponentType<{ className?: string }>; label: string; href: string }[];

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm", props.theme.subtleText)}>
      {items.map(({ key, Icon, label, href }) =>
        href ? (
          <a
            key={key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={cn("inline-flex items-center gap-1.5", props.theme.link)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ) : (
          <span key={key} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        )
      )}
    </div>
  );
}

export function SocialLinks({
  resume,
  props,
  compact = false,
}: {
  resume: ResumeData;
  props: SectionComponentProps;
  compact?: boolean;
}) {
  const links = [
    resume.github ? { href: resume.github, label: "GitHub", Icon: Github } : null,
    resume.linkedin ? { href: resume.linkedin, label: "LinkedIn", Icon: Linkedin } : null,
    resume.portfolio ? { href: resume.portfolio, label: "Portfolio", Icon: ExternalLink } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[];

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 border transition-colors",
            compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
            props.theme.radius,
            props.theme.link,
            props.blueprint.theme.mode === "dark" ? "border-white/10" : "border-slate-200"
          )}
        >
          <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {label}
        </a>
      ))}
    </div>
  );
}

export function AvatarFrame({
  imageUrl,
  name,
  shape = "circle",
  size = "large",
  className,
}: {
  imageUrl?: string;
  name: string;
  shape?: "circle" | "rounded" | "square";
  size?: "small" | "medium" | "large";
  className?: string;
}) {
  const sizeClass =
    size === "small"
      ? "h-24 w-24 text-xl"
      : size === "medium"
        ? "h-32 w-32 text-2xl"
        : "h-40 w-40 text-3xl";
  const radiusClass =
    shape === "square" ? "rounded-none" : shape === "rounded" ? "rounded-2xl" : "rounded-full";

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border bg-[var(--site-muted)] font-semibold text-[color:var(--site-primary)] shadow-sm",
        sizeClass,
        radiusClass,
        className
      )}
      style={{ borderColor: "color-mix(in srgb, var(--site-primary) 20%, transparent)" }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name || "Profile photo"} className="h-full w-full object-cover" />
      ) : (
        initials(name || "")
      )}
    </div>
  );
}

export function SkillBadge({
  skill,
  highlighted,
  props,
}: {
  skill: string;
  highlighted?: boolean;
  props: SectionComponentProps;
}) {
  return (
    <span
      className={cn(
        props.theme.badge,
        "max-w-full break-words",
        highlighted && "border-transparent bg-[color:var(--site-primary)] text-white"
      )}
      style={
        highlighted
          ? { background: "var(--site-primary)", color: "#ffffff", borderColor: "transparent" }
          : undefined
      }
    >
      {skill}
    </span>
  );
}

export function ProjectImage({
  image,
  project,
  className,
}: {
  image?: PageBlueprintImage;
  project: ProjectItem;
  className?: string;
}) {
  if (!image) return null;
  return (
    <div className={cn("aspect-[16/10] overflow-hidden bg-[var(--site-muted)]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt || project.name || "Project image"}
        className="h-full w-full object-cover"
      />
    </div>
  );
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
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const dot = trimmed.indexOf(". ");
  if (dot < 0 || dot > 220) return trimmed.slice(0, 220);
  return trimmed.slice(0, dot + 1);
}
