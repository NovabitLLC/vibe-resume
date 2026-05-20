"use client";

import { cn } from "@/lib/utils";
import type { SectionComponentProps } from "@/components/renderer/types";
import { AvatarFrame, ContactMeta, firstSentence, SkillBadge, SocialLinks } from "../shared/resume-ui";

interface HeroProps {
  showAvatar?: boolean;
  avatarPosition?: "left" | "right" | "center";
  avatarSize?: "small" | "medium" | "large";
  avatarShape?: "circle" | "rounded" | "square";
  showSocialLinks?: boolean;
  headlineStyle?: "bold" | "display" | "plain";
  background?: "plain" | "gradient" | "image";
}

export function SplitHero(props: SectionComponentProps) {
  const heroProps = (props.section.props ?? {}) as HeroProps;
  const avatarUrl = props.imageResolver.getAvatarUrl();
  const showAvatar = Boolean(avatarUrl) || heroProps.showAvatar !== false;
  const avatar = showAvatar ? (
    <AvatarFrame
      imageUrl={avatarUrl}
      name={props.resume.name}
      shape={heroProps.avatarShape}
      size={heroProps.avatarSize}
      className="mx-auto sm:mx-0"
    />
  ) : null;

  return (
    <section
      className={cn(
        props.theme.section,
        "grid items-center gap-8 sm:grid-cols-[1fr_auto]",
        heroProps.avatarPosition === "left" && "sm:grid-cols-[auto_1fr]"
      )}
    >
      {heroProps.avatarPosition === "left" && avatar}
      <HeroCopy props={props} heroProps={heroProps} />
      {heroProps.avatarPosition !== "left" && avatar}
    </section>
  );
}

export function CenteredHero(props: SectionComponentProps) {
  const heroProps = (props.section.props ?? {}) as HeroProps;
  const avatarUrl = props.imageResolver.getAvatarUrl();
  const showAvatar = Boolean(avatarUrl) || heroProps.showAvatar === true;

  return (
    <section className={cn(props.theme.section, "mx-auto max-w-3xl text-center")}>
      {showAvatar && (
        <AvatarFrame
          imageUrl={avatarUrl}
          name={props.resume.name}
          shape={heroProps.avatarShape}
          size={heroProps.avatarSize ?? "medium"}
          className="mx-auto mb-6"
        />
      )}
      <HeroCopy props={props} heroProps={{ ...heroProps, avatarPosition: "center" }} centered />
    </section>
  );
}

export function AvatarHero(props: SectionComponentProps) {
  const heroProps = (props.section.props ?? {}) as HeroProps;
  const avatarUrl = props.imageResolver.getAvatarUrl();

  return (
    <section className={cn(props.theme.section, "grid gap-8 rounded-2xl border p-6 sm:grid-cols-[auto_1fr] sm:p-8", props.theme.mutedCard)}>
      <AvatarFrame
        imageUrl={avatarUrl}
        name={props.resume.name}
        shape={heroProps.avatarShape ?? "rounded"}
        size={heroProps.avatarSize ?? "large"}
        className="mx-auto sm:mx-0"
      />
      <HeroCopy props={props} heroProps={heroProps} />
    </section>
  );
}

export function MinimalHero(props: SectionComponentProps) {
  const heroProps = (props.section.props ?? {}) as HeroProps;
  return (
    <section className={cn(props.theme.section, "max-w-3xl border-b pb-8")} style={{ borderColor: "var(--site-muted)" }}>
      <HeroCopy props={props} heroProps={{ ...heroProps, showSocialLinks: false }} minimal />
    </section>
  );
}

export function CreativeImageHero(props: SectionComponentProps) {
  const heroProps = (props.section.props ?? {}) as HeroProps;
  const avatarUrl = props.imageResolver.getAvatarUrl();
  const projectImage = props.imageResolver.getProjectImages()[0];
  const visualUrl = avatarUrl ?? projectImage?.url;

  return (
    <section className={cn(props.theme.section, "grid overflow-hidden rounded-2xl border shadow-sm sm:grid-cols-[1.1fr_0.9fr]")}>
      <div className="p-6 sm:p-8">
        <HeroCopy props={props} heroProps={heroProps} />
      </div>
      <div className="min-h-64 bg-[var(--site-muted)]">
        {visualUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visualUrl}
            alt={avatarUrl ? props.resume.name || "Profile photo" : projectImage?.alt || "Project image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full min-h-64 place-items-center text-4xl font-semibold text-[color:var(--site-primary)]">
            {props.resume.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroCopy({
  props,
  heroProps,
  centered,
  minimal,
}: {
  props: SectionComponentProps;
  heroProps: HeroProps;
  centered?: boolean;
  minimal?: boolean;
}) {
  const name = props.resume.name || "Your Name";
  const headlineClass =
    heroProps.headlineStyle === "display"
      ? "text-5xl font-bold tracking-tight sm:text-6xl"
      : heroProps.headlineStyle === "plain"
        ? "text-3xl font-medium tracking-tight sm:text-4xl"
        : "text-4xl font-semibold tracking-tight sm:text-5xl";

  return (
    <div className={cn(centered && "mx-auto flex max-w-3xl flex-col items-center")}>
      {props.resume.title && (
        <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", props.theme.subtleText)}>
          {props.resume.title}
        </p>
      )}
      <h1 className={cn("mt-3 text-balance", headlineClass)}>{name}</h1>
      {props.resume.summary && (
        <p className={cn("mt-4 max-w-2xl text-base leading-relaxed", props.theme.subtleText, centered && "mx-auto")}>
          {minimal ? props.resume.summary : firstSentence(props.resume.summary)}
        </p>
      )}
      <div className={cn("mt-6", centered && "flex justify-center")}>
        <ContactMeta resume={props.resume} props={props} />
      </div>
      {heroProps.showSocialLinks !== false && (
        <div className={cn("mt-4", centered && "flex justify-center")}>
          <SocialLinks resume={props.resume} props={props} compact />
        </div>
      )}
      {!minimal && props.blueprint.highlightedSkills.length > 0 && (
        <div className={cn("mt-6 flex flex-wrap gap-1.5", centered && "justify-center")}>
          {props.blueprint.highlightedSkills.slice(0, 6).map((skill) => (
            <SkillBadge key={skill} skill={skill} highlighted props={props} />
          ))}
        </div>
      )}
    </div>
  );
}
