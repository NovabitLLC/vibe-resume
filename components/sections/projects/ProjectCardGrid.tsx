"use client";

import { ExternalLink } from "lucide-react";
import type { SectionComponentProps } from "@/components/renderer/types";
import { SectionWrapper, sectionTitle } from "../shared/SectionWrapper";
import { ProjectImage, SkillBadge } from "../shared/resume-ui";
import { cn } from "@/lib/utils";

export function ProjectCardGrid(props: SectionComponentProps) {
  if (props.resume.projects.length === 0) return null;
  const images = props.imageResolver.getProjectImages();

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-4 sm:grid-cols-2">
        {props.resume.projects.map((project, index) => (
          <ProjectCard
            key={`${project.name}-${index}`}
            props={props}
            project={project}
            image={images[index]}
            compact={false}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ProjectImageGallery(props: SectionComponentProps) {
  if (props.resume.projects.length === 0) return null;
  const images = props.imageResolver.getProjectImages();

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="grid gap-5">
        {props.resume.projects.map((project, index) => (
          <div
            key={`${project.name}-${index}`}
            className={cn(props.theme.card, "grid overflow-hidden p-0 sm:grid-cols-[0.9fr_1.1fr]")}
          >
            <ProjectImage image={images[index]} project={project} className="h-full min-h-56 rounded-none" />
            <div className="p-5">
              <ProjectContent props={props} project={project} />
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function FeaturedProject(props: SectionComponentProps) {
  if (props.resume.projects.length === 0) return null;
  const images = props.imageResolver.getProjectImages();
  const featuredName = props.blueprint.featuredProjects[0];
  const featuredIndex = Math.max(
    0,
    props.resume.projects.findIndex((project) => project.name === featuredName)
  );
  const featured = props.resume.projects[featuredIndex];
  const rest = props.resume.projects.filter((_, index) => index !== featuredIndex);

  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className={cn(props.theme.card, "grid overflow-hidden p-0 sm:grid-cols-[1fr_1fr]")}>
        <ProjectImage image={images[featuredIndex] ?? images[0]} project={featured} className="h-full min-h-64 rounded-none" />
        <div className="p-6">
          <p className={cn("mb-2 text-xs uppercase tracking-[0.16em]", props.theme.subtleText)}>
            Featured project
          </p>
          <ProjectContent props={props} project={featured} />
        </div>
      </div>
      {rest.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {rest.map((project, index) => (
            <ProjectCard
              key={`${project.name}-${index}`}
              props={props}
              project={project}
              image={images[index + 1]}
              compact
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

export function CompactProjectList(props: SectionComponentProps) {
  if (props.resume.projects.length === 0) return null;
  return (
    <SectionWrapper title={sectionTitle(props)} props={props}>
      <div className="divide-y" style={{ borderColor: "var(--site-muted)" }}>
        {props.resume.projects.map((project, index) => (
          <div key={`${project.name}-${index}`} className="py-4 first:pt-0">
            <ProjectContent props={props} project={project} compact />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function ProjectCard({
  props,
  project,
  image,
  compact,
}: {
  props: SectionComponentProps;
  project: SectionComponentProps["resume"]["projects"][number];
  image?: ReturnType<SectionComponentProps["imageResolver"]["getProjectImages"]>[number];
  compact?: boolean;
}) {
  return (
    <div className={cn(props.theme.card, "overflow-hidden p-0")}>
      {!compact && <ProjectImage image={image} project={project} className="rounded-none" />}
      <div className="p-5">
        <ProjectContent props={props} project={project} compact={compact} />
      </div>
    </div>
  );
}

function ProjectContent({
  props,
  project,
  compact,
}: {
  props: SectionComponentProps;
  project: SectionComponentProps["resume"]["projects"][number];
  compact?: boolean;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
          {project.name || "Untitled project"}
        </h3>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex shrink-0 items-center gap-1 text-xs", props.theme.link)}
          >
            Visit
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      {project.description && (
        <p className={cn("mt-2 text-sm leading-relaxed", props.theme.subtleText)}>
          {project.description}
        </p>
      )}
      {!compact && project.bullets.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {project.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
      {project.techStack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.techStack.map((skill) => (
            <SkillBadge key={skill} skill={skill} props={props} />
          ))}
        </div>
      )}
    </div>
  );
}
