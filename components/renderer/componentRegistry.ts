"use client";

import type { ComponentName } from "@/types/pageBlueprint";
import type { SectionComponent } from "./types";
import { CenteredHero } from "@/components/sections/hero/CenteredHero";
import { SplitHero } from "@/components/sections/hero/SplitHero";
import { AvatarHero } from "@/components/sections/hero/AvatarHero";
import { MinimalHero } from "@/components/sections/hero/MinimalHero";
import { CreativeImageHero } from "@/components/sections/hero/CreativeImageHero";
import { AboutCard, AboutSplit, SummaryBlock } from "@/components/sections/about/AboutSections";
import {
  GroupedSkills,
  SkillBadgeCloud,
  SkillBarList,
  TechStackGrid,
} from "@/components/sections/skills/SkillBadgeCloud";
import {
  CorporateExperienceList,
  ExperienceCards,
  ExperienceTimeline,
} from "@/components/sections/experience/ExperienceTimeline";
import {
  CompactProjectList,
  FeaturedProject,
  ProjectCardGrid,
  ProjectImageGallery,
} from "@/components/sections/projects/ProjectCardGrid";
import {
  AcademicEducationBlock,
  EducationCards,
  EducationTimeline,
} from "@/components/sections/education/EducationCards";
import {
  ContactCTA,
  ContactCard,
  MinimalContact,
} from "@/components/sections/contact/ContactCTA";
import {
  AcademicPublicationBlock,
  AwardCards,
  AwardList,
  CertificationCards,
  CertificationList,
  ImpactMetrics,
  PublicationList,
  SkillChart,
  StatsStrip,
} from "@/components/sections/shared/ExtraSections";

export const componentRegistry: Record<ComponentName, SectionComponent> = {
  CenteredHero,
  SplitHero,
  AvatarHero,
  MinimalHero,
  CreativeImageHero,
  AboutCard,
  AboutSplit,
  SummaryBlock,
  SkillBadgeCloud,
  GroupedSkills,
  SkillBarList,
  TechStackGrid,
  ExperienceTimeline,
  ExperienceCards,
  CorporateExperienceList,
  ProjectCardGrid,
  ProjectImageGallery,
  FeaturedProject,
  CompactProjectList,
  EducationCards,
  EducationTimeline,
  AcademicEducationBlock,
  CertificationList,
  CertificationCards,
  AwardList,
  AwardCards,
  PublicationList,
  AcademicPublicationBlock,
  StatsStrip,
  ImpactMetrics,
  SkillChart,
  ContactCard,
  ContactCTA,
  MinimalContact,
};

export function getRegisteredComponent(name: string): SectionComponent | undefined {
  return componentRegistry[name as ComponentName];
}
