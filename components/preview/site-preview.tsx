"use client";

import {
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

import type { ResumeData } from "@/lib/resumeSchema";
import type { WebsiteConfig } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, initials } from "@/lib/utils";

/**
 * Phase 1-3 "site preview" — a single reasonable template that reads
 * ResumeData + WebsiteConfig. In Phase 5 we'll split this into a proper
 * template registry keyed by config.templateId.
 */
export function SitePreview({
  resume,
  config,
}: {
  resume: ResumeData;
  config: WebsiteConfig;
}) {
  const enabledSections = config.sections.filter((s) => s.enabled);
  const skillGroups = compactSkills(resume);

  return (
    <article
      className="min-h-full bg-background text-foreground"
      style={{
        ["--site-primary" as never]: config.theme.primary,
        ["--site-accent" as never]: config.theme.accent,
        ["--site-muted" as never]: config.theme.muted,
        ["--site-bg" as never]: config.theme.background,
        ["--site-fg" as never]: config.theme.foreground,
        background: config.theme.background,
        color: config.theme.foreground,
      }}
    >
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
        {enabledSections.map((section) => {
          switch (section.id) {
            case "hero":
              return <Hero key={section.id} resume={resume} config={config} />;
            case "about":
              return <About key={section.id} title={section.title} resume={resume} />;
            case "experience":
              return <Experience key={section.id} title={section.title} resume={resume} />;
            case "projects":
              return <Projects key={section.id} title={section.title} resume={resume} />;
            case "skills":
              return (
                <Skills
                  key={section.id}
                  title={section.title}
                  groups={skillGroups}
                />
              );
            case "education":
              return <Education key={section.id} title={section.title} resume={resume} />;
            case "awards":
              return <ListSection key={section.id} title={section.title} items={resume.awards} />;
            case "certifications":
              return (
                <ListSection
                  key={section.id}
                  title={section.title}
                  items={resume.certifications}
                />
              );
            case "publications":
              return (
                <ListSection
                  key={section.id}
                  title={section.title}
                  items={resume.publications}
                />
              );
            case "contact":
              return <Contact key={section.id} title={section.title} resume={resume} />;
            default:
              return null;
          }
        })}
      </div>
    </article>
  );
}

function SectionShell({
  title,
  children,
  className,
  hidden,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-60px" }}
      className={cn("mt-16 first:mt-0", className)}
    >
      {title && (
        <h2
          className="mb-6 text-xs font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--site-primary)" }}
        >
          {title}
        </h2>
      )}
      {children}
    </motion.section>
  );
}

function Hero({ resume, config }: { resume: ResumeData; config: WebsiteConfig }) {
  return (
    <section className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        {resume.title && (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {resume.title}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {resume.name || "Your Name"}
        </h1>
        {config.tagline && (
          <p className="mt-4 text-lg" style={{ color: "var(--site-fg)" }}>
            {config.tagline}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {resume.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {resume.location}
            </span>
          )}
          {resume.email && (
            <a
              className="inline-flex items-center gap-1.5 hover:text-foreground"
              href={`mailto:${resume.email}`}
            >
              <Mail className="h-3.5 w-3.5" />
              {resume.email}
            </a>
          )}
          {resume.portfolio && (
            <a
              className="inline-flex items-center gap-1.5 hover:text-foreground"
              href={resume.portfolio}
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="h-3.5 w-3.5" />
              {resume.portfolio.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
        <SocialRow resume={resume} />
      </div>
      <Portrait config={config} name={resume.name} />
    </section>
  );
}

function SocialRow({ resume }: { resume: ResumeData }) {
  const items: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [];
  if (resume.github) items.push({ href: resume.github, label: "GitHub", Icon: Github });
  if (resume.linkedin) items.push({ href: resume.linkedin, label: "LinkedIn", Icon: Linkedin });
  if (resume.portfolio) items.push({ href: resume.portfolio, label: "Portfolio", Icon: ExternalLink });
  if (items.length === 0) return null;
  return (
    <div className="mt-4 flex gap-2">
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="grid h-8 w-8 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function Portrait({ config, name }: { config: WebsiteConfig; name: string }) {
  if (config.heroImage) {
    return (
      <div
        className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-40"
        style={{ background: "var(--site-muted)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.heroImage} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="grid h-32 w-32 shrink-0 place-items-center rounded-2xl text-2xl font-semibold sm:h-40 sm:w-40 sm:text-3xl"
      style={{
        background: "var(--site-muted)",
        color: "var(--site-primary)",
      }}
    >
      {initials(name || "")}
    </div>
  );
}

function About({ title, resume }: { title: string; resume: ResumeData }) {
  if (!resume.summary) return null;
  return (
    <SectionShell title={title}>
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        {resume.summary}
      </p>
    </SectionShell>
  );
}

function Experience({ title, resume }: { title: string; resume: ResumeData }) {
  if (resume.experience.length === 0) return null;
  return (
    <SectionShell title={title}>
      <ol className="space-y-8">
        {resume.experience.map((w, i) => (
          <li key={`${w.company}-${i}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr]">
            <div className="text-sm text-muted-foreground">
              {formatDateRange(w.startDate, w.endDate)}
              {w.location && <div className="text-xs">{w.location}</div>}
            </div>
            <div>
              <h3 className="text-base font-medium">
                {w.role || "Role"}{" "}
                {w.company && (
                  <span className="text-muted-foreground">· {w.company}</span>
                )}
              </h3>
              {w.bullets.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {w.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function Projects({ title, resume }: { title: string; resume: ResumeData }) {
  if (resume.projects.length === 0) return null;
  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {resume.projects.map((p, i) => (
          <Card key={`${p.name}-${i}`} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-medium">{p.name || "Untitled project"}</h3>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              )}
              {p.bullets.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {p.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {p.techStack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.techStack.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

type SkillGroup = { label: string; items: string[] };

function compactSkills(resume: ResumeData): SkillGroup[] {
  const groups: SkillGroup[] = [
    { label: "Languages", items: resume.skills.languages },
    { label: "Frameworks", items: resume.skills.frameworks },
    { label: "Tools", items: resume.skills.tools },
    { label: "Other", items: resume.skills.other },
  ];
  return groups.filter((g) => g.items.length > 0);
}

function Skills({ title, groups }: { title: string; groups: SkillGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.label}>
            <h4 className="text-sm font-medium">{g.label}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function Education({ title, resume }: { title: string; resume: ResumeData }) {
  if (resume.education.length === 0) return null;
  return (
    <SectionShell title={title}>
      <ol className="space-y-4">
        {resume.education.map((e, i) => (
          <li
            key={`${e.school}-${i}`}
            className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]"
          >
            <div className="text-sm text-muted-foreground">
              {formatDateRange(e.startDate, e.endDate)}
            </div>
            <div>
              <h3 className="text-base font-medium">{e.school || "School"}</h3>
              {(e.degree || e.location) && (
                <p className="text-sm text-muted-foreground">
                  {e.degree}
                  {e.degree && e.location ? " · " : ""}
                  {e.location}
                </p>
              )}
              {e.details.length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {e.details.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <SectionShell title={title}>
      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="text-foreground/90">
            {it}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function Contact({ title, resume }: { title: string; resume: ResumeData }) {
  const hasAny =
    resume.email || resume.phone || resume.linkedin || resume.github || resume.portfolio;
  if (!hasAny) return null;
  return (
    <SectionShell title={title}>
      <Separator className="mb-6" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {resume.email && (
          <a
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            href={`mailto:${resume.email}`}
          >
            <Mail className="h-3.5 w-3.5" />
            {resume.email}
          </a>
        )}
        {resume.phone && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {resume.phone}
          </span>
        )}
        {resume.linkedin && (
          <a
            href={resume.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            LinkedIn
          </a>
        )}
        {resume.github && (
          <a
            href={resume.github}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
        )}
        {resume.portfolio && (
          <a
            href={resume.portfolio}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Portfolio
          </a>
        )}
      </div>
    </SectionShell>
  );
}

function formatDateRange(start?: string, end?: string): string {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} — Present`;
  if (!s && e) return e!;
  return `${s} — ${e}`;
}
