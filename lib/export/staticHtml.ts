/**
 * Static HTML export generator.
 *
 * Converts ResumeData + PageBlueprint + UploadedImage[] into a single,
 * standalone HTML document string:
 *   - semantic HTML + inline <style>
 *   - embedded image data URLs
 *   - no scripts, no Next runtime, no localStorage, no editor UI
 *   - all user text escaped, all links sanitized
 *
 * Dispatch model (mirrors the React ComponentRenderer):
 *   - section.id chooses the data + section title
 *   - section.component chooses the visual variant
 * Unknown ids/components fall back to a sensible default instead of crashing.
 */

import type { ResumeData } from "@/lib/resumeSchema";
import type {
  BlueprintSection,
  BlueprintStat,
  PageBlueprint,
  PageBlueprintImage,
} from "@/types/pageBlueprint";
import { SECTION_DISPLAY_TITLES } from "@/types/pageBlueprint";

import {
  compactUrl,
  escapeHtml,
  firstSentence,
  fontFamily,
  formatDateRange,
  initials,
  innerPadPx,
  leadingNumber,
  maxWidthPx,
  radiusPx,
  resolveAvatar,
  resolveBackground,
  resolveProjectImages,
  safeHex,
  safeImageSrc,
  sanitizeUrl,
  sectionGapPx,
  telHref,
} from "./exportUtils";

interface Ctx {
  resume: ResumeData;
  blueprint: PageBlueprint;
  avatarSrc: string | null;
  projectImages: PageBlueprintImage[];
}

interface HeroProps {
  showAvatar?: boolean;
  avatarShape?: "circle" | "rounded" | "square";
  avatarSize?: "small" | "medium" | "large";
  headlineStyle?: "bold" | "display" | "plain";
}

// ============================================================ //
//  Public entry                                                //
// ============================================================ //

export function generateStaticHtml(
  resume: ResumeData,
  blueprint: PageBlueprint,
  images: PageBlueprintImage[]
): string {
  const avatar = resolveAvatar(blueprint, images);
  const ctx: Ctx = {
    resume,
    blueprint,
    avatarSrc: safeImageSrc(avatar),
    projectImages: resolveProjectImages(blueprint, images),
  };

  const sections = [...blueprint.sections]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const body = sections
    .map((section) => renderSection(section, ctx))
    .filter(Boolean)
    .join("\n");

  const css = buildCss(blueprint, images);
  const title = `${resume.name || "Resume"} - Resume Website`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDescription(resume))}" />
<style>
${css}
</style>
</head>
<body>
<main class="container">
${body}
</main>
<footer class="site-footer">
<p>Built with Vibe Resume</p>
</footer>
</body>
</html>`;
}

function metaDescription(resume: ResumeData): string {
  const bits = [resume.name, resume.title].filter(Boolean).join(" - ");
  if (resume.summary) return `${bits} - ${firstSentence(resume.summary)}`;
  return bits || "Personal resume website";
}

// ============================================================ //
//  CSS                                                          //
// ============================================================ //

function buildCss(blueprint: PageBlueprint, images: PageBlueprintImage[]): string {
  const isDark = blueprint.theme.mode === "dark";
  const primary = safeHex(blueprint.theme.primaryColor, "#2563eb");
  const accent = safeHex(blueprint.theme.accentColor, isDark ? "#e2e8f0" : "#0f172a");

  const bg = isDark ? "#09090b" : "#ffffff";
  const text = isDark ? "#fafafa" : "#0f172a";
  const muted = isDark ? "#a1a1aa" : "#64748b";
  const card = isDark ? "#161618" : "#ffffff";
  const cardMuted = isDark ? "#161618" : "#f8fafc";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0";

  const radius = radiusPx(blueprint.theme.borderRadius);
  const maxWidth = maxWidthPx(blueprint.layout.maxWidth);
  const sectionGap = sectionGapPx(blueprint.layout.sectionSpacing);
  const innerPad = innerPadPx(blueprint.theme.spacing);
  const font = fontFamily(blueprint.theme.fontStyle);

  const bgRule = bodyBackground(blueprint, isDark, images);

  return `:root{
  --primary:${primary};
  --accent:${accent};
  --bg:${bg};
  --text:${text};
  --muted:${muted};
  --card:${card};
  --card-muted:${cardMuted};
  --border:${border};
  --radius:${radius};
  --max-width:${maxWidth};
  --section-gap:${sectionGap};
}
*{box-sizing:border-box;}
html{ -webkit-text-size-adjust:100%; }
body{
  margin:0;
  font-family:${font};
  color:var(--text);
  line-height:1.55;
  ${bgRule}
}
img{max-width:100%;display:block;}
a{color:inherit;text-decoration:none;}
.container{
  max-width:var(--max-width);
  margin:0 auto;
  padding:${innerPad} 20px;
}
.section{margin-top:var(--section-gap);}
.section:first-child{margin-top:0;}
.section-title{
  margin:0 0 22px;
  font-size:12px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.18em;
  color:var(--primary);
}
/* hero */
.hero{margin:0;}
.eyebrow{margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;color:var(--muted);}
.name{margin:0;font-size:clamp(34px,6vw,52px);font-weight:700;letter-spacing:-0.02em;line-height:1.05;}
.name.display{font-size:clamp(40px,7vw,64px);}
.name.plain{font-weight:600;font-size:clamp(28px,5vw,40px);}
.summary{margin:18px 0 0;max-width:60ch;color:var(--muted);font-size:17px;}
.hero-grid{display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;}
.hero-grid.left{grid-template-columns:auto 1fr;}
.hero-centered{max-width:680px;margin:0 auto;text-align:center;}
.hero-centered .summary{margin-left:auto;margin-right:auto;}
.hero-card{display:grid;grid-template-columns:auto 1fr;gap:32px;padding:28px;border:1px solid var(--border);background:var(--card-muted);border-radius:var(--radius);align-items:center;}
.hero-minimal{border-bottom:1px solid var(--border);padding-bottom:32px;max-width:70ch;}
.hero-creative{display:grid;grid-template-columns:1.05fr 0.95fr;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.hero-creative .copy{padding:32px;}
.hero-creative .visual{min-height:280px;background:var(--card-muted);}
.hero-creative .visual img{width:100%;height:100%;object-fit:cover;}
.hero-creative .visual .ph{display:grid;place-items:center;height:100%;min-height:280px;font-size:46px;font-weight:700;color:var(--primary);}
/* contact meta + social */
.contact-meta{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:22px;color:var(--muted);font-size:14px;}
.contact-meta a:hover{color:var(--primary);}
.center .contact-meta{justify-content:center;}
.social{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
.center .social{justify-content:center;}
.social-link{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:calc(var(--radius) * 0.6);padding:7px 12px;font-size:13px;}
.social-link:hover{color:var(--primary);border-color:var(--primary);}
/* badges */
.badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px;}
.center .badges{justify-content:center;}
.badge{display:inline-flex;align-items:center;border:1px solid var(--border);background:var(--card-muted);color:var(--text);border-radius:8px;padding:5px 10px;font-size:13px;font-weight:500;}
.badge.primary{background:var(--primary);border-color:transparent;color:#fff;}
/* cards / grids */
.card{border:1px solid var(--border);background:var(--card);border-radius:var(--radius);padding:20px;}
.muted-card{border:1px solid var(--border);background:var(--card-muted);border-radius:var(--radius);padding:20px;}
.grid{display:grid;gap:16px;}
.grid-2{grid-template-columns:repeat(2,1fr);}
.grid-3{grid-template-columns:repeat(3,1fr);}
.grid-4{grid-template-columns:repeat(4,1fr);}
.stack{display:grid;gap:16px;}
h3{margin:0;font-size:17px;font-weight:600;}
.muted{color:var(--muted);}
.small{font-size:14px;}
.bullets{margin:12px 0 0;padding-left:20px;}
.bullets li{margin-top:6px;}
/* avatar */
.avatar{flex-shrink:0;display:grid;place-items:center;overflow:hidden;border:1px solid var(--border);background:var(--card-muted);color:var(--primary);font-weight:700;}
.avatar img{width:100%;height:100%;object-fit:cover;}
.avatar.lg{width:160px;height:160px;font-size:34px;}
.avatar.md{width:128px;height:128px;font-size:28px;}
.avatar.sm{width:96px;height:96px;font-size:22px;}
.avatar.circle{border-radius:999px;}
.avatar.rounded{border-radius:calc(var(--radius) + 4px);}
.avatar.square{border-radius:0;}
/* timeline */
.timeline{position:relative;border-left:1px solid var(--border);padding-left:24px;display:grid;gap:30px;margin:0;list-style:none;}
.timeline li{position:relative;}
.timeline .dot{position:absolute;left:-31px;top:6px;width:11px;height:11px;border-radius:999px;background:var(--primary);}
.row{display:grid;grid-template-columns:160px 1fr;gap:10px;}
.row .when{color:var(--muted);font-size:14px;}
/* experience list */
.divided > * {border-top:1px solid var(--border);padding:20px 0;}
.divided > *:first-child{border-top:0;padding-top:0;}
.corp-row{display:grid;grid-template-columns:1fr 180px;gap:12px;}
.corp-row .when{color:var(--muted);font-size:14px;text-align:right;}
/* projects */
.project{border:1px solid var(--border);background:var(--card);border-radius:var(--radius);overflow:hidden;}
.project .body{padding:18px;}
.project .img{aspect-ratio:16/10;background:var(--card-muted);}
.project .img img{width:100%;height:100%;object-fit:cover;}
.project-split{display:grid;grid-template-columns:0.9fr 1.1fr;}
.project-split .img{aspect-ratio:auto;min-height:200px;}
.featured{display:grid;grid-template-columns:1fr 1fr;}
.featured .img{aspect-ratio:auto;min-height:240px;}
.proj-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}
.proj-head a{font-size:13px;color:var(--primary);}
.tech{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}
.eyebrow-sm{font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:var(--muted);margin:0 0 8px;}
/* stats */
.stat-card{border:1px solid var(--border);background:var(--card-muted);border-radius:var(--radius);padding:18px;}
.stat-value{font-size:30px;font-weight:700;color:var(--primary);margin:0;}
.metric-card{position:relative;border:1px solid var(--border);background:var(--card);border-radius:var(--radius);padding:22px;overflow:hidden;}
.metric-card .bar{position:absolute;inset:0 0 auto 0;height:4px;background:var(--primary);}
.metric-value{font-size:38px;font-weight:800;letter-spacing:-0.02em;color:var(--primary);margin:4px 0 0;}
.chart-row{margin-top:16px;}
.chart-row:first-child{margin-top:0;}
.chart-head{display:flex;justify-content:space-between;gap:12px;font-size:14px;}
.chart-head .v{font-weight:700;color:var(--primary);}
.track{height:10px;background:var(--card-muted);border:1px solid var(--border);border-radius:999px;overflow:hidden;margin-top:6px;}
.fill{height:100%;background:var(--primary);border-radius:999px;}
/* icon list / cards */
.icon-list{list-style:none;margin:0;padding:0;display:grid;gap:10px;}
.icon-list li{display:grid;grid-template-columns:auto 1fr;gap:10px;font-size:14px;}
.marker{width:8px;height:8px;border-radius:2px;background:var(--primary);margin-top:7px;}
.num-list{list-style:none;margin:0;padding:0;display:grid;gap:16px;}
.num-list li{display:grid;grid-template-columns:1.9rem 1fr;gap:8px;font-size:14px;}
.num-list .n{font-weight:700;color:var(--primary);}
/* contact */
.contact-cta{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between;}
.contact-cta h3{font-size:20px;}
.contact-links{display:flex;flex-wrap:wrap;gap:10px;}
.clink{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:calc(var(--radius) * 0.6);padding:9px 14px;font-size:14px;}
.clink:hover{color:var(--primary);}
.clink.primary{background:var(--primary);border-color:transparent;color:#fff;}
.contact-min{display:flex;flex-wrap:wrap;gap:8px 20px;border-top:1px solid var(--border);padding-top:20px;color:var(--muted);font-size:14px;}
.contact-min a:hover{color:var(--primary);}
/* footer */
.site-footer{max-width:var(--max-width);margin:0 auto;padding:28px 20px;color:var(--muted);font-size:12px;border-top:1px solid var(--border);}
/* responsive */
@media (max-width:720px){
  .hero-grid,.hero-grid.left,.hero-card,.hero-creative,.project-split,.featured{grid-template-columns:1fr;}
  .grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}
  .row,.corp-row{grid-template-columns:1fr;}
  .corp-row .when{text-align:left;}
  .hero-card{text-align:center;justify-items:center;}
}
@media (min-width:721px){
  .grid-3{grid-template-columns:repeat(3,1fr);}
  .grid-4{grid-template-columns:repeat(4,1fr);}
}`;
}

function bodyBackground(
  blueprint: PageBlueprint,
  isDark: boolean,
  images: PageBlueprintImage[]
): string {
  switch (blueprint.theme.backgroundStyle) {
    case "subtle-gradient":
      return isDark
        ? "background:linear-gradient(180deg,#09090b,#0f172a,#09090b);"
        : "background:linear-gradient(180deg,#ffffff,#f8fafc,#ffffff);";
    case "grid": {
      const line = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)";
      return `background-color:var(--bg);background-image:linear-gradient(to right,${line} 1px,transparent 1px),linear-gradient(to bottom,${line} 1px,transparent 1px);background-size:32px 32px;`;
    }
    case "soft-color":
      return isDark
        ? "background:linear-gradient(135deg,#09090b,#0f172a,#042f2e);"
        : "background:linear-gradient(135deg,#ffffff,#eff6ff,#ecfdf5);";
    case "image": {
      const bg = safeImageSrc(resolveBackground(blueprint, images));
      if (bg) {
        const overlay = isDark ? "rgba(9,9,11,0.88)" : "rgba(255,255,255,0.90)";
        return `background-image:linear-gradient(${overlay},${overlay}),url("${bg}");background-size:cover;background-position:center;background-attachment:fixed;`;
      }
      return "background:var(--bg);";
    }
    case "plain":
    default:
      return "background:var(--bg);";
  }
}

// ============================================================ //
//  Section dispatch                                            //
// ============================================================ //

function renderSection(section: BlueprintSection, ctx: Ctx): string {
  switch (section.id) {
    case "hero":
      return renderHero(section, ctx);
    case "about":
      return renderAbout(section, ctx);
    case "skills":
      return renderSkills(section, ctx);
    case "experience":
      return renderExperience(section, ctx);
    case "projects":
      return renderProjects(section, ctx);
    case "education":
      return renderEducation(section, ctx);
    case "certifications":
      return renderStringSection(section, ctx, ctx.resume.certifications);
    case "awards":
      return renderStringSection(section, ctx, ctx.resume.awards);
    case "publications":
      return renderPublications(section, ctx);
    case "stats":
      return renderStats(section, ctx);
    case "contact":
      return renderContact(section, ctx);
    default:
      return "";
  }
}

function sectionTitleFor(section: BlueprintSection): string {
  return SECTION_DISPLAY_TITLES[section.id] ?? "";
}

function section(title: string, inner: string): string {
  if (!inner.trim()) return "";
  const heading = title ? `<h2 class="section-title">${escapeHtml(title)}</h2>` : "";
  return `<section class="section">${heading}${inner}</section>`;
}

// ============================================================ //
//  Hero                                                        //
// ============================================================ //

function renderHero(section: BlueprintSection, ctx: Ctx): string {
  const hp = (section.props ?? {}) as HeroProps;
  const variant = section.component;

  switch (variant) {
    case "CenteredHero":
      return heroCentered(ctx, hp);
    case "AvatarHero":
      return heroCard(ctx, hp);
    case "MinimalHero":
      return heroMinimal(ctx, hp);
    case "CreativeImageHero":
      return heroCreative(ctx, hp);
    case "SplitHero":
    default:
      return heroSplit(ctx, hp);
  }
}

function heroSplit(ctx: Ctx, hp: HeroProps): string {
  const showAvatar = Boolean(ctx.avatarSrc) || hp.showAvatar !== false;
  const avatar = showAvatar ? avatarHtml(ctx, hp.avatarShape, hp.avatarSize) : "";
  return `<header class="hero hero-grid">
<div>${heroCopy(ctx, hp, {})}</div>
${avatar}
</header>`;
}

function heroCentered(ctx: Ctx, hp: HeroProps): string {
  const showAvatar = Boolean(ctx.avatarSrc) || hp.showAvatar === true;
  const avatar = showAvatar
    ? `<div style="display:flex;justify-content:center;margin-bottom:22px;">${avatarHtml(ctx, hp.avatarShape, hp.avatarSize ?? "medium")}</div>`
    : "";
  return `<header class="hero hero-centered center">
${avatar}
${heroCopy(ctx, hp, { centered: true })}
</header>`;
}

function heroCard(ctx: Ctx, hp: HeroProps): string {
  return `<header class="hero hero-card">
${avatarHtml(ctx, hp.avatarShape ?? "rounded", hp.avatarSize ?? "large")}
<div>${heroCopy(ctx, hp, {})}</div>
</header>`;
}

function heroMinimal(ctx: Ctx, hp: HeroProps): string {
  return `<header class="hero hero-minimal">
${heroCopy(ctx, hp, { minimal: true, hideSocial: true })}
</header>`;
}

function heroCreative(ctx: Ctx, hp: HeroProps): string {
  const visualSrc = ctx.avatarSrc ?? safeImageSrc(ctx.projectImages[0]);
  const visual = visualSrc
    ? `<img src="${escapeHtml(visualSrc)}" alt="${escapeHtml(ctx.resume.name || "Profile image")}" />`
    : `<div class="ph">${escapeHtml(initials(ctx.resume.name))}</div>`;
  return `<header class="hero hero-creative">
<div class="copy">${heroCopy(ctx, hp, {})}</div>
<div class="visual">${visual}</div>
</header>`;
}

function heroCopy(
  ctx: Ctx,
  hp: HeroProps,
  opts: { centered?: boolean; minimal?: boolean; hideSocial?: boolean }
): string {
  const r = ctx.resume;
  const nameClass =
    hp.headlineStyle === "display" ? "name display" : hp.headlineStyle === "plain" ? "name plain" : "name";

  const parts: string[] = [];
  if (r.title) parts.push(`<p class="eyebrow">${escapeHtml(r.title)}</p>`);
  parts.push(`<h1 class="${nameClass}">${escapeHtml(r.name || "Your Name")}</h1>`);
  if (r.summary) {
    parts.push(
      `<p class="summary">${escapeHtml(opts.minimal ? r.summary : firstSentence(r.summary))}</p>`
    );
  }
  const meta = contactMeta(ctx);
  if (meta) parts.push(meta);
  if (!opts.hideSocial) {
    const social = socialLinks(ctx);
    if (social) parts.push(social);
  }
  if (!opts.minimal && ctx.blueprint.highlightedSkills.length > 0) {
    const badges = ctx.blueprint.highlightedSkills
      .slice(0, 6)
      .map((s) => badge(s, true))
      .join("");
    parts.push(`<div class="badges">${badges}</div>`);
  }
  return parts.join("\n");
}

function contactMeta(ctx: Ctx): string {
  const r = ctx.resume;
  const items: string[] = [];
  if (r.location) items.push(`<span>${escapeHtml(r.location)}</span>`);
  if (r.email) {
    const href = sanitizeUrl(r.email);
    items.push(
      href
        ? `<a href="${escapeHtml(href)}">${escapeHtml(r.email)}</a>`
        : `<span>${escapeHtml(r.email)}</span>`
    );
  }
  if (r.phone) {
    const href = telHref(r.phone);
    items.push(
      href
        ? `<a href="${escapeHtml(href)}">${escapeHtml(r.phone)}</a>`
        : `<span>${escapeHtml(r.phone)}</span>`
    );
  }
  if (r.portfolio) {
    const href = sanitizeUrl(r.portfolio);
    if (href) items.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(compactUrl(r.portfolio))}</a>`);
  }
  if (items.length === 0) return "";
  return `<div class="contact-meta">${items.join("")}</div>`;
}

function socialLinks(ctx: Ctx): string {
  const r = ctx.resume;
  const links: string[] = [];
  const push = (raw: string, label: string) => {
    const href = sanitizeUrl(raw);
    if (href) {
      links.push(
        `<a class="social-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      );
    }
  };
  if (r.github) push(r.github, "GitHub");
  if (r.linkedin) push(r.linkedin, "LinkedIn");
  if (r.portfolio) push(r.portfolio, "Portfolio");
  if (links.length === 0) return "";
  return `<div class="social">${links.join("")}</div>`;
}

function avatarHtml(ctx: Ctx, shape: HeroProps["avatarShape"] = "circle", size: HeroProps["avatarSize"] = "large"): string {
  const shapeClass = shape === "square" ? "square" : shape === "rounded" ? "rounded" : "circle";
  const sizeClass = size === "small" ? "sm" : size === "medium" ? "md" : "lg";
  const name = ctx.resume.name || "Profile photo";
  if (ctx.avatarSrc) {
    return `<div class="avatar ${shapeClass} ${sizeClass}"><img src="${escapeHtml(ctx.avatarSrc)}" alt="${escapeHtml(name)}" /></div>`;
  }
  return `<div class="avatar ${shapeClass} ${sizeClass}">${escapeHtml(initials(ctx.resume.name))}</div>`;
}

function badge(text: string, primary = false): string {
  return `<span class="badge${primary ? " primary" : ""}">${escapeHtml(text)}</span>`;
}

// ============================================================ //
//  About                                                       //
// ============================================================ //

function renderAbout(section: BlueprintSection, ctx: Ctx): string {
  const summary = ctx.resume.summary;
  if (!summary) return "";
  const title = sectionTitleFor(section);

  if (section.component === "SummaryBlock") {
    return sectionWrap(title, `<p class="summary" style="margin-top:0;max-width:70ch;">${escapeHtml(summary)}</p>`);
  }
  if (section.component === "AboutSplit") {
    const highlights = ctx.blueprint.highlightedSkills.slice(0, 4);
    const aside =
      highlights.length > 0
        ? `<div class="muted-card"><p style="margin:0;font-weight:600;font-size:14px;">Current focus</p><div class="badges" style="margin-top:12px;">${highlights
            .map((h) => badge(h))
            .join("")}</div></div>`
        : "";
    return sectionWrap(
      title,
      `<div class="grid" style="grid-template-columns:1.2fr 0.8fr;gap:24px;"><p class="summary" style="margin-top:0;">${escapeHtml(
        summary
      )}</p>${aside}</div>`
    );
  }
  // AboutCard (default)
  return sectionWrap(
    title,
    `<div class="card" style="max-width:70ch;"><p style="margin:0;color:var(--muted);font-size:17px;">${escapeHtml(summary)}</p></div>`
  );
}

function sectionWrap(title: string, inner: string): string {
  return section(title, inner);
}

// ============================================================ //
//  Skills                                                      //
// ============================================================ //

type SkillGroup = { label: string; items: string[] };

function skillGroups(resume: ResumeData): SkillGroup[] {
  return [
    { label: "Languages", items: resume.skills.languages },
    { label: "Frameworks", items: resume.skills.frameworks },
    { label: "Tools", items: resume.skills.tools },
    { label: "Other", items: resume.skills.other },
  ].filter((g) => g.items.length > 0);
}

function renderSkills(sec: BlueprintSection, ctx: Ctx): string {
  const groups = skillGroups(ctx.resume);
  if (groups.length === 0) return "";
  const title = sectionTitleFor(sec);
  const all = groups.flatMap((g) => g.items);
  const highlighted = new Set(ctx.blueprint.highlightedSkills);

  switch (sec.component) {
    case "GroupedSkills":
      return section(
        title,
        `<div class="grid grid-2">${groups
          .map(
            (g) =>
              `<div class="muted-card"><h3 style="font-size:14px;">${escapeHtml(
                g.label
              )}</h3><div class="badges" style="margin-top:12px;">${g.items
                .map((s) => badge(s, highlighted.has(s)))
                .join("")}</div></div>`
          )
          .join("")}</div>`
      );
    case "TechStackGrid":
      return section(
        title,
        `<div class="grid grid-4">${groups
          .map(
            (g) =>
              `<div class="card"><p class="eyebrow-sm">${escapeHtml(
                g.label
              )}</p><div class="stack" style="gap:8px;margin-top:4px;">${g.items
                .map(
                  (s) =>
                    `<div style="border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:14px;">${escapeHtml(
                      s
                    )}</div>`
                )
                .join("")}</div></div>`
          )
          .join("")}</div>`
      );
    case "SkillBarList":
      return section(
        title,
        `<div class="stack" style="gap:12px;">${all
          .slice(0, 12)
          .map((s, i) => {
            const width = Math.max(52, 94 - i * 4);
            return `<div><div class="chart-head"><span>${escapeHtml(s)}</span></div><div class="track" style="margin-top:6px;"><div class="fill" style="width:${width}%;"></div></div></div>`;
          })
          .join("")}</div>`
      );
    case "SkillBadgeCloud":
    default:
      return section(
        title,
        `<div class="badges" style="margin-top:0;">${all.map((s) => badge(s, highlighted.has(s))).join("")}</div>`
      );
  }
}

// ============================================================ //
//  Experience                                                  //
// ============================================================ //

function renderExperience(sec: BlueprintSection, ctx: Ctx): string {
  const items = ctx.resume.experience;
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);

  const head = (role: string, company: string) =>
    `<h3>${escapeHtml(role || "Role")}${company ? `<span class="muted"> · ${escapeHtml(company)}</span>` : ""}</h3>`;
  const bullets = (list: string[]) =>
    list.length > 0
      ? `<ul class="bullets small">${list.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";

  switch (sec.component) {
    case "ExperienceCards":
      return section(
        title,
        `<div class="stack">${items
          .map(
            (it) =>
              `<div class="card">${head(it.role, it.company)}<p class="muted small" style="margin:6px 0 0;">${escapeHtml(
                [formatDateRange(it.startDate, it.endDate), it.location].filter(Boolean).join(" · ")
              )}</p>${bullets(it.bullets)}</div>`
          )
          .join("")}</div>`
      );
    case "CorporateExperienceList":
      return section(
        title,
        `<div class="divided">${items
          .map(
            (it) =>
              `<div class="corp-row"><div>${head(it.role, it.company)}${bullets(
                it.bullets
              )}</div><div class="when">${escapeHtml(formatDateRange(it.startDate, it.endDate))}${
                it.location ? `<br/>${escapeHtml(it.location)}` : ""
              }</div></div>`
          )
          .join("")}</div>`
      );
    case "ExperienceTimeline":
    default:
      return section(
        title,
        `<ol class="timeline">${items
          .map(
            (it) =>
              `<li><span class="dot"></span><div class="row"><div class="when">${escapeHtml(
                formatDateRange(it.startDate, it.endDate)
              )}${it.location ? `<br/>${escapeHtml(it.location)}` : ""}</div><div>${head(
                it.role,
                it.company
              )}${bullets(it.bullets)}</div></div></li>`
          )
          .join("")}</ol>`
      );
  }
}

// ============================================================ //
//  Projects                                                    //
// ============================================================ //

function renderProjects(sec: BlueprintSection, ctx: Ctx): string {
  const items = ctx.resume.projects;
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);

  switch (sec.component) {
    case "ProjectImageGallery":
      return section(
        title,
        `<div class="stack" style="gap:20px;">${items
          .map(
            (p, i) =>
              `<div class="project project-split">${projectImageHtml(ctx, i, p.name)}<div class="body">${projectContent(
                ctx,
                p
              )}</div></div>`
          )
          .join("")}</div>`
      );
    case "FeaturedProject": {
      const featuredName = ctx.blueprint.featuredProjects[0];
      const idx = Math.max(0, items.findIndex((p) => p.name === featuredName));
      const featured = items[idx];
      const rest = items.filter((_, i) => i !== idx);
      const featuredHtml = `<div class="project featured">${projectImageHtml(ctx, idx, featured.name)}<div class="body"><p class="eyebrow-sm">Featured project</p>${projectContent(
        ctx,
        featured
      )}</div></div>`;
      const restHtml =
        rest.length > 0
          ? `<div class="grid grid-2" style="margin-top:16px;">${rest
              .map((p) => `<div class="project"><div class="body">${projectContent(ctx, p, true)}</div></div>`)
              .join("")}</div>`
          : "";
      return section(title, featuredHtml + restHtml);
    }
    case "CompactProjectList":
      return section(
        title,
        `<div class="divided">${items
          .map((p) => `<div>${projectContent(ctx, p, true)}</div>`)
          .join("")}</div>`
      );
    case "ProjectCardGrid":
    default:
      return section(
        title,
        `<div class="grid grid-2">${items
          .map(
            (p, i) =>
              `<div class="project">${projectImageHtml(ctx, i, p.name)}<div class="body">${projectContent(
                ctx,
                p
              )}</div></div>`
          )
          .join("")}</div>`
      );
  }
}

function projectImageHtml(ctx: Ctx, index: number, projectName: string): string {
  const src = safeImageSrc(ctx.projectImages[index]);
  if (!src) return "";
  return `<div class="img"><img src="${escapeHtml(src)}" alt="${escapeHtml(projectName || "Project image")}" /></div>`;
}

function projectContent(ctx: Ctx, project: ResumeData["projects"][number], compact = false): string {
  const link = sanitizeUrl(project.link);
  const head = `<div class="proj-head"><h3>${escapeHtml(project.name || "Untitled project")}</h3>${
    link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Visit</a>` : ""
  }</div>`;
  const desc = project.description
    ? `<p class="muted small" style="margin:8px 0 0;">${escapeHtml(project.description)}</p>`
    : "";
  const bullets =
    !compact && project.bullets.length > 0
      ? `<ul class="bullets small">${project.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";
  const tech =
    project.techStack.length > 0
      ? `<div class="tech">${project.techStack.map((t) => badge(t)).join("")}</div>`
      : "";
  return head + desc + bullets + tech;
}

// ============================================================ //
//  Education                                                   //
// ============================================================ //

function renderEducation(sec: BlueprintSection, ctx: Ctx): string {
  const items = ctx.resume.education;
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);

  const body = (it: ResumeData["education"][number], hideDate = false) => {
    const meta = [it.degree, it.location, hideDate ? "" : formatDateRange(it.startDate, it.endDate)]
      .filter(Boolean)
      .join(" · ");
    const details =
      it.details.length > 0
        ? `<ul class="bullets small">${it.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
        : "";
    return `<h3>${escapeHtml(it.school || "School")}</h3>${
      meta ? `<p class="muted small" style="margin:6px 0 0;">${escapeHtml(meta)}</p>` : ""
    }${details}`;
  };

  switch (sec.component) {
    case "EducationTimeline":
      return section(
        title,
        `<div class="stack">${items
          .map(
            (it) =>
              `<div class="row"><div class="when">${escapeHtml(
                formatDateRange(it.startDate, it.endDate)
              )}</div><div>${body(it, true)}</div></div>`
          )
          .join("")}</div>`
      );
    case "AcademicEducationBlock":
      return section(title, `<div class="divided">${items.map((it) => `<div>${body(it)}</div>`).join("")}</div>`);
    case "EducationCards":
    default:
      return section(
        title,
        `<div class="grid grid-2">${items.map((it) => `<div class="card">${body(it)}</div>`).join("")}</div>`
      );
  }
}

// ============================================================ //
//  Certifications / Awards (string lists)                      //
// ============================================================ //

function renderStringSection(sec: BlueprintSection, ctx: Ctx, items: string[]): string {
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);
  const isCards = sec.component === "CertificationCards" || sec.component === "AwardCards";

  if (isCards) {
    return section(
      title,
      `<div class="grid grid-2">${items
        .map((it) => `<div class="card"><p style="margin:0;font-size:14px;">${escapeHtml(it)}</p></div>`)
        .join("")}</div>`
    );
  }
  return section(
    title,
    `<ul class="icon-list">${items
      .map((it) => `<li><span class="marker"></span><span>${escapeHtml(it)}</span></li>`)
      .join("")}</ul>`
  );
}

// ============================================================ //
//  Publications                                                //
// ============================================================ //

function renderPublications(sec: BlueprintSection, ctx: Ctx): string {
  const items = ctx.resume.publications;
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);

  if (sec.component === "AcademicPublicationBlock") {
    return section(
      title,
      `<ol class="num-list">${items
        .map((it, i) => `<li><span class="n">${i + 1}.</span><span>${escapeHtml(it)}</span></li>`)
        .join("")}</ol>`
    );
  }
  return section(
    title,
    `<ul class="icon-list">${items
      .map((it) => `<li><span class="marker"></span><span>${escapeHtml(it)}</span></li>`)
      .join("")}</ul>`
  );
}

// ============================================================ //
//  Stats                                                       //
// ============================================================ //

function renderStats(sec: BlueprintSection, ctx: Ctx): string {
  const stats = ctx.blueprint.stats;
  if (stats.length === 0) return "";
  const title = sectionTitleFor(sec);

  switch (sec.component) {
    case "ImpactMetrics":
      return section(
        title,
        `<div class="grid grid-3">${stats
          .map(
            (s) =>
              `<div class="metric-card"><span class="bar"></span><p class="metric-value">${escapeHtml(
                s.value
              )}</p><p style="margin:8px 0 0;font-weight:600;font-size:14px;">${escapeHtml(s.label)}</p>${
                s.source ? `<p class="muted" style="margin:8px 0 0;font-size:12px;">${escapeHtml(s.source)}</p>` : ""
              }</div>`
          )
          .join("")}</div>`
      );
    case "SkillChart":
      return section(title, statBars(stats));
    case "StatsStrip":
    default:
      return section(
        title,
        `<div class="grid grid-4">${stats
          .map(
            (s) =>
              `<div class="stat-card"><p class="stat-value">${escapeHtml(s.value)}</p><p class="muted small" style="margin:6px 0 0;">${escapeHtml(
                s.label
              )}</p></div>`
          )
          .join("")}</div>`
      );
  }
}

function statBars(stats: BlueprintStat[]): string {
  const magnitudes = stats.map((s) => leadingNumber(s.value));
  const max = Math.max(1, ...magnitudes.map((m) => m ?? 0));
  return `<div class="stack" style="gap:16px;">${stats
    .map((s, i) => {
      const m = magnitudes[i];
      const width = m == null ? 100 : Math.max(35, Math.min(100, (m / max) * 100));
      return `<div class="chart-row"><div class="chart-head"><span>${escapeHtml(s.label)}</span><span class="v">${escapeHtml(
        s.value
      )}</span></div><div class="track"><div class="fill" style="width:${width}%;"></div></div>${
        s.source ? `<p class="muted" style="margin:6px 0 0;font-size:12px;">${escapeHtml(s.source)}</p>` : ""
      }</div>`;
    })
    .join("")}</div>`;
}

// ============================================================ //
//  Contact                                                     //
// ============================================================ //

interface ContactItem {
  label: string;
  href: string;
  external: boolean;
  primary?: boolean;
}

function contactItems(ctx: Ctx): ContactItem[] {
  const r = ctx.resume;
  const items: ContactItem[] = [];
  if (r.email) {
    const href = sanitizeUrl(r.email);
    if (href) items.push({ label: r.email, href, external: false, primary: true });
  }
  if (r.phone) {
    const href = telHref(r.phone);
    if (href) items.push({ label: r.phone, href, external: false });
  }
  if (r.linkedin) {
    const href = sanitizeUrl(r.linkedin);
    if (href) items.push({ label: "LinkedIn", href, external: true });
  }
  if (r.github) {
    const href = sanitizeUrl(r.github);
    if (href) items.push({ label: "GitHub", href, external: true });
  }
  if (r.portfolio) {
    const href = sanitizeUrl(r.portfolio);
    if (href) items.push({ label: compactUrl(r.portfolio), href, external: true });
  }
  return items;
}

function renderContact(sec: BlueprintSection, ctx: Ctx): string {
  const items = contactItems(ctx);
  if (items.length === 0) return "";
  const title = sectionTitleFor(sec);

  const link = (it: ContactItem, withPrimary = false) =>
    `<a class="clink${withPrimary && it.primary ? " primary" : ""}" href="${escapeHtml(it.href)}"${
      it.external ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>${escapeHtml(it.label)}</a>`;

  switch (sec.component) {
    case "ContactCard":
      return section(
        title,
        `<div class="card" style="max-width:640px;"><div class="grid grid-2" style="gap:10px;">${items
          .map((it) => link(it))
          .join("")}</div></div>`
      );
    case "MinimalContact":
      return section(
        title,
        `<div class="contact-min">${items
          .map(
            (it) =>
              `<a href="${escapeHtml(it.href)}"${
                it.external ? ' target="_blank" rel="noopener noreferrer"' : ""
              }>${escapeHtml(it.label)}</a>`
          )
          .join("")}</div>`
      );
    case "ContactCTA":
    default:
      return section(
        title,
        `<div class="card contact-cta"><div><h3>Let&#39;s connect</h3><p class="muted small" style="margin:6px 0 0;">Open to conversations about roles, projects, and collaborations.</p></div><div class="contact-links">${items
          .map((it) => link(it, true))
          .join("")}</div></div>`
      );
  }
}
