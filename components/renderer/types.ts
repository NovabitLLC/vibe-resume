"use client";

import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage, BlueprintSection } from "@/types/pageBlueprint";
import type { ImageResolver } from "./imageResolver";
import type { ThemeClasses } from "./theme";

export interface SectionComponentProps {
  resume: ResumeData;
  blueprint: PageBlueprint;
  section: BlueprintSection;
  images: PageBlueprintImage[];
  imageResolver: ImageResolver;
  theme: ThemeClasses;
}

export type SectionComponent = (props: SectionComponentProps) => React.ReactNode;
