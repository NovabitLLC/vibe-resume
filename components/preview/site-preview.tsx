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
import type { PageBlueprint, SectionId } from "@/types/pageBlueprint";
import { SECTION_DISPLAY_TITLES } from "@/types/pageBlueprint";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, initials } from "@/lib/utils";

/**
 * Phase 1-4 "site preview" — reads a PageBlueprint and renders a single
 * reasonable template. In Phase 5 we'll split this into a ComponentRenderer
 * that dispatches by `section.component` to the modular component library.
 *
 * For now, we use `section.id` to pick the right render block and ignore
 * `section.component` / `section.props` (kept in the blueprint for Phase 5).
 */
export function SitePreview({
  resume,
  blueprint,
  heroImage,
}: {
  resume: ResumeData;
  blueprint: PageBlueprint;
  /** Optional override — passed in from the upload page profile picker. */
  heroImage?: string;
}) {
  const skillGroups = compactSkills(resume);
  const sections = [...blueprint.sections]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const themeStyle = themeToStyle(blueprint);

  return (
    <article
      className="min-h-full"
      style={{
        ...themeStyle.cssVars,
        background: themeStyle.background,
        color: themeStyle.foreground,
      }}
    >
      <div className={cn("mx-auto px-6 py-16 sm:px-10 sm:py-24", maxWidthClass(blueprint))}>
        {sections.map((section) => {
          const title = SECTION_DISPLAY_TITLES[section.id];
          switch (section.id) {
            case "hero":
              return (
                <Hero
                  key="hero"
                  resume={resume}
                  blueprint={blueprint}
                  heroImage={heroImage}
                />
              );
            case "about":
              return <About key="about" title={title} resume={resume} />;
            case "experience":
              return <Experience key="experience" title={title} resume={resume} />;
            case "projects":
              return <Projects key="projects" title={title} resume={resume} />;
            case "skills":
              return (
                <Skills
                  key="skills"
                  title={title}
                  groups={skillGroups}
                  highlights={blueprint.highlightedSkills}
                />
              );
            case "education":
              return <Education key="education" title={title} resume={resume} />;
            case "awards":
              return <ListSection key="awards" title={title} items={resume.awards} />;
            case "certifications":
              return (
                <ListSection
                  key="certifications"
                  title={title}
                  items={resume.certifications}
                />
              );
            case "publications":
              return (
                <ListSection
                  key="publications"
                  title={title}
                  items={resume.publications}
                />
              );
            case "stats":
              return <Stats key="stats" title={title} blueprint={blueprint} />;
            case "contact":
              return <Contact key="contact" title={title} resume={resume} />;
            default:
              return null;
          }
        })}
      </div>
    </article>
  );
}

// ---------- Layout helpers ----------

function maxWidthClass(blueprint: PageBlueprint): string {
  switch (blueprint.layout.maxWidth) {
    case "narrow":
      return "max-w-2xl";
    case "wide":
      return "max-w-5xl";
    case "standard":
    default:
      return "max-w-4xl";
  }
}

function themeToStyle(blueprint: PageBlueprint) {
  const isDark = blueprint.theme.mode === "dark";
  const background = isDark ? "#0a0a0a" : "#ffffff";
  const foreground = isDark ? "#fafafa" : "#0f172a";
  const muted = isDark ? "#1f2937" : "#f1f5f9";
  const mutedFg = isDark ? "#94a3b8" : "#64748b";

  // Subtle backgroundStyle hint via a CSS gradient overlay.
  let background2 = background;
  if (blueprint.theme.backgroundStyle === "subtle-gradient") {
    background2 = isDark
      ? `linear-gradient(180deg, #0a0a0a 0%, #0f172a 100%)`
      : `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`;
  } else if (blueprint.theme.backgroundStyle === "soft-color") {
    background2 = isDark
      ? `linear-gradient(180deg, #0a0a0a, #111827)`
      : `linear-gradient(180deg, #fefce8, #ffffff)`;
  }

  return {
    background: background2,
    foreground,
    cssVars: {
      ["--site-primary" as never]: blueprint.theme.primaryColor,
      ["--site-accent" as never]: blueprint.theme.accentColor,
      ["--site-bg" as never]: background,
      ["--site-fg" as never]: foreground,
      ["--site-muted" as never]: muted,
      ["--site-muted-fg" as never]: mutedFg,
    } as React.CSSProperties,
  };
}

// ---------- Section shell ----------

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

// ---------- Hero ----------

function Hero({
  resume,
  blueprint,
  heroImage,
}: {
  resume: ResumeData;
  blueprint: PageBlueprint;
  heroImage?: string;
}) {
  const heroSection = blueprint.sections.find((s) => s.id === "hero");
  const heroProps = (heroSection?.props ?? {}) as {
    showAvatar?: boolean;
    avatarShape?: "circle" | "rounded" | "square";
    background?: "plain" | "gradient" | "image";
    headlineStyle?: "bold" | "display" | "plain";
  };
  const showAvatar = Boolean(heroImage) || heroProps.showAvatar !== false; // default true in renderer
  const headlineClass =
    heroProps.headlineStyle === "display"
      ? "text-5xl font-bold tracking-tight sm:text-6xl"
      : heroProps.headlineStyle === "plain"
        ? "text-3xl font-medium tracking-tight sm:text-4xl"
        : "text-4xl font-semibold tracking-tight sm:text-5xl";

  return (
    <section className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        {resume.title && (
          <p
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--site-muted-fg)" }}
          >
            {resume.title}
          </p>
        )}
        <h1 className={cn("mt-3", headlineClass)}>{resume.name || "Your Name"}</h1>
        {resume.summary && (
          <p className="mt-4 max-w-md text-base" style={{ color: "var(--site-muted-fg)" }}>
            {firstSentence(resume.summary)}
          </p>
        )}
        <div
          className="mt-6 flex flex-wrap gap-3 text-sm"
          style={{ color: "var(--site-muted-fg)" }}
        >
          {resume.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {resume.location}
            </span>
          )}
          {resume.email && (
            <a
              className="inline-flex items-center gap-1.5 hover:opacity-80"
              href={`mailto:${resume.email}`}
            >
              <Mail className="h-3.5 w-3.5" />
              {resume.email}
            </a>
          )}
          {resume.portfolio && (
            <a
              className="inline-flex items-center gap-1.5 hover:opacity-80"
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
        {blueprint.highlightedSkills.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {blueprint.highlightedSkills.map((s) => (
              <Badge
                key={s}
                style={{
                  background: "var(--site-primary)",
                  color: "#ffffff",
                  borderColor: "transparent",
                }}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {showAvatar && <Portrait heroImage={heroImage} name={resume.name} shape={heroProps.avatarShape} />}
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
          className="grid h-8 w-8 place-items-center rounded-md border transition-colors hover:opacity-80"
          style={{
            borderColor: "var(--site-muted)",
            color: "var(--site-muted-fg)",
          }}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function Portrait({
  heroImage,
  name,
  shape,
}: {
  heroImage?: string;
  name: string;
  shape?: "circle" | "rounded" | "square";
}) {
  const radius = shape === "square" ? "rounded-none" : shape === "rounded" ? "rounded-2xl" : "rounded-full";
  if (heroImage) {
    return (
      <div
        className={cn("h-32 w-32 shrink-0 overflow-hidden sm:h-40 sm:w-40", radius)}
        style={{ background: "var(--site-muted)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid h-32 w-32 shrink-0 place-items-center text-2xl font-semibold sm:h-40 sm:w-40 sm:text-3xl",
        radius
      )}
      style={{
        background: "var(--site-muted)",
        color: "var(--site-primary)",
      }}
    >
      {initials(name || "")}
    </div>
  );
}

// ---------- Other sections ----------

function About({ title, resume }: { title: string; resume: ResumeData }) {
  if (!resume.summary) return null;
  return (
    <SectionShell title={title}>
      <p
        className="max-w-2xl text-pretty text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--site-muted-fg)" }}
      >
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
            <div className="text-sm" style={{ color: "var(--site-muted-fg)" }}>
              {formatDateRange(w.startDate, w.endDate)}
              {w.location && <div className="text-xs">{w.location}</div>}
            </div>
            <div>
              <h3 className="text-base font-medium">
                {w.role || "Role"}{" "}
                {w.company && (
                  <span style={{ color: "var(--site-muted-fg)" }}>· {w.company}</span>
                )}
              </h3>
              {w.bullets.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
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
          <Card
            key={`${p.name}-${i}`}
            className="border-0"
            style={{ background: "var(--site-muted)" }}
          >
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-medium">{p.name || "Untitled project"}</h3>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                    style={{ color: "var(--site-muted-fg)" }}
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {p.description && (
                <p className="mt-2 text-sm" style={{ color: "var(--site-muted-fg)" }}>
                  {p.description}
                </p>
              )}
              {p.bullets.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
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

function Skills({
  title,
  groups,
  highlights,
}: {
  title: string;
  groups: SkillGroup[];
  highlights: string[];
}) {
  if (groups.length === 0) return null;
  const highlightSet = new Set(highlights);
  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.label}>
            <h4 className="text-sm font-medium">{g.label}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((s) => {
                const isHi = highlightSet.has(s);
                return (
                  <Badge
                    key={s}
                    variant={isHi ? "default" : "outline"}
                    style={
                      isHi
                        ? {
                            background: "var(--site-primary)",
                            color: "#ffffff",
                            borderColor: "transparent",
                          }
                        : undefined
                    }
                  >
                    {s}
                  </Badge>
                );
              })}
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
            <div className="text-sm" style={{ color: "var(--site-muted-fg)" }}>
              {formatDateRange(e.startDate, e.endDate)}
            </div>
            <div>
              <h3 className="text-base font-medium">{e.school || "School"}</h3>
              {(e.degree || e.location) && (
                <p className="text-sm" style={{ color: "var(--site-muted-fg)" }}>
                  {e.degree}
                  {e.degree && e.location ? " · " : ""}
                  {e.location}
                </p>
              )}
              {e.details.length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
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
          <li key={i}>{it}</li>
        ))}
      </ul>
    </SectionShell>
  );
}

function Stats({ title, blueprint }: { title: string; blueprint: PageBlueprint }) {
  if (blueprint.stats.length === 0) return null;
  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {blueprint.stats.map((s, i) => (
          <div key={i}>
            <p className="text-3xl font-semibold" style={{ color: "var(--site-primary)" }}>
              {s.value}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--site-muted-fg)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
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
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
        style={{ color: "var(--site-muted-fg)" }}
      >
        {resume.email && (
          <a
            className="inline-flex items-center gap-1.5 hover:opacity-80"
            href={`mailto:${resume.email}`}
          >
            <Mail className="h-3.5 w-3.5" />
            {resume.email}
          </a>
        )}
        {resume.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {resume.phone}
          </span>
        )}
        {resume.linkedin && (
          <a href={resume.linkedin} target="_blank" rel="noreferrer" className="hover:opacity-80">
            LinkedIn
          </a>
        )}
        {resume.github && (
          <a href={resume.github} target="_blank" rel="noreferrer" className="hover:opacity-80">
            GitHub
          </a>
        )}
        {resume.portfolio && (
          <a href={resume.portfolio} target="_blank" rel="noreferrer" className="hover:opacity-80">
            Portfolio
          </a>
        )}
      </div>
    </SectionShell>
  );
}

// ---------- Small utils ----------

function formatDateRange(start?: string, end?: string): string {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} — Present`;
  if (!s && e) return e!;
  return `${s} — ${e}`;
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const dot = trimmed.indexOf(". ");
  if (dot < 0 || dot > 200) return trimmed.slice(0, 200);
  return trimmed.slice(0, dot + 1);
}

export type { SectionId };
