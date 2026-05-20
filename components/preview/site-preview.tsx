"use client";

import { Mail, MapPin, Globe, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import type { ResumeData, WebsiteConfig, SocialLink } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatDateRange, initials } from "@/lib/utils";

/**
 * Phase 1 "site preview" — a single reasonable template that reads
 * ResumeData + WebsiteConfig. In Phase 5 we'll split this into a
 * proper template registry keyed by config.templateId.
 */
export function SitePreview({
  resume,
  config,
}: {
  resume: ResumeData;
  config: WebsiteConfig;
}) {
  const enabledSections = config.sections.filter((s) => s.enabled);

  return (
    <article
      className="min-h-full bg-background text-foreground"
      style={{
        // CSS vars driven by website config so templates feel customized.
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
            case "work":
              return <Work key={section.id} title={section.title} resume={resume} />;
            case "projects":
              return <Projects key={section.id} title={section.title} resume={resume} />;
            case "skills":
              return <Skills key={section.id} title={section.title} resume={resume} />;
            case "education":
              return <Education key={section.id} title={section.title} resume={resume} />;
            case "awards":
              return <Awards key={section.id} title={section.title} resume={resume} />;
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
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
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
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {resume.basics.headline ?? "Personal site"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {resume.basics.name}
        </h1>
        {config.tagline && (
          <p className="mt-4 text-lg" style={{ color: "var(--site-fg)" }}>
            {config.tagline}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {resume.basics.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {resume.basics.location}
            </span>
          )}
          {resume.basics.email && (
            <a
              className="inline-flex items-center gap-1.5 hover:text-foreground"
              href={`mailto:${resume.basics.email}`}
            >
              <Mail className="h-3.5 w-3.5" />
              {resume.basics.email}
            </a>
          )}
          {resume.basics.website && (
            <a
              className="inline-flex items-center gap-1.5 hover:text-foreground"
              href={resume.basics.website}
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="h-3.5 w-3.5" />
              {resume.basics.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
        {resume.basics.socials && resume.basics.socials.length > 0 && (
          <div className="mt-4 flex gap-2">
            {resume.basics.socials.map((s) => (
              <SocialIcon key={s.label} link={s} />
            ))}
          </div>
        )}
      </div>
      <Portrait config={config} name={resume.basics.name} />
    </section>
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
      {initials(name)}
    </div>
  );
}

function SocialIcon({ link }: { link: SocialLink }) {
  const Icon =
    link.icon === "github"
      ? Github
      : link.icon === "linkedin"
        ? Linkedin
        : link.icon === "twitter"
          ? Twitter
          : ExternalLink;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      className="grid h-8 w-8 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function About({ title, resume }: { title: string; resume: ResumeData }) {
  if (!resume.basics.summary) return null;
  return (
    <SectionShell title={title}>
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        {resume.basics.summary}
      </p>
    </SectionShell>
  );
}

function Work({ title, resume }: { title: string; resume: ResumeData }) {
  if (resume.work.length === 0) return null;
  return (
    <SectionShell title={title}>
      <ol className="space-y-8">
        {resume.work.map((w, i) => (
          <li key={`${w.company}-${i}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr]">
            <div className="text-sm text-muted-foreground">
              {formatDateRange(w.startDate, w.endDate)}
              {w.location && <div className="text-xs">{w.location}</div>}
            </div>
            <div>
              <h3 className="text-base font-medium">
                {w.role} <span className="text-muted-foreground">· {w.company}</span>
              </h3>
              {w.summary && (
                <p className="mt-1 text-sm text-muted-foreground">{w.summary}</p>
              )}
              {w.highlights && w.highlights.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {w.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
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
        {resume.projects.map((p) => (
          <Card key={p.name} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-medium">{p.name}</h3>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {p.summary && (
                <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
              )}
              {p.highlights && p.highlights.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {p.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
              {p.technologies && p.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
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

function Skills({ title, resume }: { title: string; resume: ResumeData }) {
  if (resume.skills.length === 0) return null;
  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {resume.skills.map((g) => (
          <div key={g.category}>
            <h4 className="text-sm font-medium">{g.category}</h4>
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
          <li key={`${e.institution}-${i}`} className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]">
            <div className="text-sm text-muted-foreground">
              {formatDateRange(e.startDate, e.endDate)}
            </div>
            <div>
              <h3 className="text-base font-medium">{e.institution}</h3>
              <p className="text-sm text-muted-foreground">
                {[e.degree, e.field].filter(Boolean).join(", ")}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              {e.highlights && e.highlights.length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm marker:text-muted-foreground">
                  {e.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
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

function Awards({ title, resume }: { title: string; resume: ResumeData }) {
  if (!resume.awards || resume.awards.length === 0) return null;
  return (
    <SectionShell title={title}>
      <ol className="space-y-3">
        {resume.awards.map((a, i) => (
          <li key={`${a.title}-${i}`} className="text-sm">
            <span className="font-medium">{a.title}</span>
            {a.issuer && <span className="text-muted-foreground"> · {a.issuer}</span>}
            {a.date && <span className="text-muted-foreground"> · {a.date}</span>}
            {a.summary && <p className="mt-0.5 text-muted-foreground">{a.summary}</p>}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function Contact({ title, resume }: { title: string; resume: ResumeData }) {
  return (
    <SectionShell title={title}>
      <Separator className="mb-6" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {resume.basics.email && (
          <a className="inline-flex items-center gap-1.5 hover:text-foreground" href={`mailto:${resume.basics.email}`}>
            <Mail className="h-3.5 w-3.5" />
            {resume.basics.email}
          </a>
        )}
        {resume.basics.phone && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            {resume.basics.phone}
          </span>
        )}
        {resume.basics.socials?.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            {s.label}
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
