"use client";

import type { PageBlueprint, PageBlueprintImage, SectionId } from "@/types/pageBlueprint";

export type UploadedImage = PageBlueprintImage;

export interface ImageResolver {
  getAvatarImage: () => PageBlueprintImage | undefined;
  getAvatarUrl: () => string | undefined;
  getProjectImages: () => PageBlueprintImage[];
  getImagesForSection: (sectionId: SectionId) => PageBlueprintImage[];
  getBackgroundImage: () => PageBlueprintImage | undefined;
}

export function getAvatarImage(
  blueprint: PageBlueprint,
  images: UploadedImage[]
): PageBlueprintImage | undefined {
  const usage = blueprint.imageUsage.find((item) => item.usage === "avatar");
  const byUsage = usage ? images.find((image) => image.id === usage.imageId) : undefined;
  return byUsage ?? images.find((image) => image.type === "avatar");
}

export function getProjectImages(
  blueprint: PageBlueprint,
  images: UploadedImage[]
): PageBlueprintImage[] {
  const usedIds = blueprint.imageUsage
    .filter((item) => item.usage === "project")
    .map((item) => item.imageId);
  const byUsage = usedIds
    .map((id) => images.find((image) => image.id === id))
    .filter((image): image is PageBlueprintImage => Boolean(image));
  const fallback = images.filter((image) => image.type === "project");

  return uniqueImages([...byUsage, ...fallback]);
}

export function getImagesForSection(
  sectionId: SectionId,
  blueprint: PageBlueprint,
  images: UploadedImage[]
): PageBlueprintImage[] {
  const usedIds = blueprint.imageUsage
    .filter((item) => item.sectionId === sectionId)
    .map((item) => item.imageId);
  const byUsage = usedIds
    .map((id) => images.find((image) => image.id === id))
    .filter((image): image is PageBlueprintImage => Boolean(image));

  if (sectionId === "hero") {
    const avatar = getAvatarImage(blueprint, images);
    return uniqueImages([...(avatar ? [avatar] : []), ...byUsage]);
  }
  if (sectionId === "projects") {
    return uniqueImages([...byUsage, ...getProjectImages(blueprint, images)]);
  }

  return uniqueImages(byUsage);
}

export function createImageResolver(
  blueprint: PageBlueprint,
  images: UploadedImage[]
): ImageResolver {
  return {
    getAvatarImage: () => getAvatarImage(blueprint, images),
    getAvatarUrl: () => getAvatarImage(blueprint, images)?.url,
    getProjectImages: () => getProjectImages(blueprint, images),
    getImagesForSection: (sectionId) => getImagesForSection(sectionId, blueprint, images),
    getBackgroundImage: () => {
      const usage = blueprint.imageUsage.find((item) => item.usage === "background");
      const byUsage = usage ? images.find((image) => image.id === usage.imageId) : undefined;
      return byUsage ?? images.find((image) => image.type === "background");
    },
  };
}

function uniqueImages(images: PageBlueprintImage[]): PageBlueprintImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}
