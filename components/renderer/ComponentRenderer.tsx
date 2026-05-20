"use client";

import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";
import { cn } from "@/lib/utils";
import { createImageResolver } from "./imageResolver";
import { getRegisteredComponent } from "./componentRegistry";
import { getThemeClasses, getThemeStyle } from "./theme";

export function ComponentRenderer({
  resume,
  blueprint,
  images,
}: {
  resume: ResumeData;
  blueprint: PageBlueprint;
  images: PageBlueprintImage[];
}) {
  const imageResolver = createImageResolver(blueprint, images);
  const theme = getThemeClasses(blueprint);
  const themeStyle = getThemeStyle(blueprint, imageResolver);
  const sections = [...blueprint.sections]
    .filter((section) => section.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <article className={theme.page} style={themeStyle}>
      <div className={theme.inner}>
        {sections.map((section) => {
          const SectionComponent = getRegisteredComponent(section.component);

          if (!SectionComponent) {
            if (process.env.NODE_ENV !== "production") {
              return (
                <div key={`${section.id}-${section.order}`} className={cn(theme.mutedCard, "text-sm")}>
                  Unknown component: <code>{section.component}</code>
                </div>
              );
            }
            return null;
          }

          return (
            <SectionComponent
              key={`${section.id}-${section.component}-${section.order}`}
              resume={resume}
              blueprint={blueprint}
              section={section}
              images={images}
              imageResolver={imageResolver}
              theme={theme}
            />
          );
        })}
      </div>
    </article>
  );
}

export function getEnabledSectionCount(blueprint: PageBlueprint): number {
  return blueprint.sections.filter((section) => section.enabled !== false).length;
}
