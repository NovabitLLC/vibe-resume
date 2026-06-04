"use client";

import { ImageOff, Trash2 } from "lucide-react";

import type {
  ComponentName,
  ImageType,
  PageBlueprint,
  PageBlueprintImage,
} from "@/types/pageBlueprint";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IMAGE_TYPE_OPTIONS } from "./editorOptions";
import {
  pruneImageUsage,
  removeAt,
  setAvatarUsage,
  updateAt,
} from "./editorUtils";

interface ImageEditorProps {
  images: PageBlueprintImage[];
  blueprint: PageBlueprint;
  onImagesChange: (next: PageBlueprintImage[]) => void;
  onBlueprintChange: (next: PageBlueprint) => void;
}

export function ImageEditor({
  images,
  blueprint,
  onImagesChange,
  onBlueprintChange,
}: ImageEditorProps) {
  function patchImage(index: number, updater: (img: PageBlueprintImage) => PageBlueprintImage) {
    const nextImages = updateAt(images, index, updater);
    onImagesChange(nextImages);
  }

  function removeImage(index: number) {
    const removed = images[index];
    const nextImages = removeAt(images, index);
    onImagesChange(nextImages);
    if (!removed) return;
    // Also prune any imageUsage entries that pointed at the removed image.
    onBlueprintChange({
      ...blueprint,
      imageUsage: pruneImageUsage(blueprint.imageUsage, nextImages),
    });
  }

  function setImageType(index: number, type: ImageType) {
    const img = images[index];
    if (!img) return;
    const nextImages = updateAt(images, index, (it) => ({ ...it, type }));
    onImagesChange(nextImages);

    if (type === "avatar") {
      // Make sure the blueprint's imageUsage agrees: only one avatar at a
      // time, pointing at this image. Use the current hero section's
      // component so the usage record stays accurate.
      const heroComponent =
        (blueprint.sections.find((s) => s.id === "hero")?.component as ComponentName | undefined) ??
        "SplitHero";
      onBlueprintChange({
        ...blueprint,
        imageUsage: setAvatarUsage(blueprint.imageUsage, img.id, heroComponent),
      });
    } else {
      // Drop any avatar usage that pointed at this image — its type changed.
      const usage = blueprint.imageUsage.filter(
        (u) => !(u.usage === "avatar" && u.imageId === img.id)
      );
      if (usage.length !== blueprint.imageUsage.length) {
        onBlueprintChange({ ...blueprint, imageUsage: usage });
      }
    }
  }

  // For each image, also surface its current usage label from blueprint.imageUsage.
  function usageBadges(imageId: string): string[] {
    return blueprint.imageUsage
      .filter((u) => u.imageId === imageId)
      .map((u) =>
        u.sectionId ? `${u.usage} · ${u.sectionId}` : u.usage
      );
  }

  return (
    <div className="space-y-3">
      {images.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
          <ImageOff className="mx-auto mb-1 h-4 w-4" />
          No uploaded images. Add images from the upload step to use them here.
        </p>
      )}

      {images.map((img, i) => (
        <div key={img.id} className="rounded-xl border border-border bg-card p-3">
          <div className="flex flex-wrap items-start gap-3">
            <Thumbnail image={img} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-mono text-muted-foreground">
                    {img.id}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {usageBadges(img.id).length === 0 ? (
                      <Badge variant="outline" className="text-[10px]">unused</Badge>
                    ) : (
                      usageBadges(img.id).map((u) => (
                        <Badge key={u} variant="secondary" className="text-[10px]">
                          {u}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove image"
                  onClick={() => removeImage(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Type
                  </Label>
                  <Select
                    value={img.type}
                    onValueChange={(v) => setImageType(i, v as ImageType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          <div className="flex flex-col">
                            <span>{o.label}</span>
                            {o.hint && (
                              <span className="text-[10px] text-muted-foreground">{o.hint}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Alt text
                  </Label>
                  <Input
                    value={img.alt ?? ""}
                    onChange={(e) =>
                      patchImage(i, (it) => ({ ...it, alt: e.target.value }))
                    }
                    placeholder="Description of the image"
                  />
                </div>
                {img.type === "project" && (
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Related project
                    </Label>
                    <Input
                      value={img.relatedProject ?? ""}
                      onChange={(e) =>
                        patchImage(i, (it) => ({ ...it, relatedProject: e.target.value }))
                      }
                      placeholder="Project name from your resume"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <p className="text-[11px] text-muted-foreground">
        Setting an image&apos;s type to <code className="font-mono">avatar</code> automatically
        wires it into the hero section. Removing an image clears any of its blueprint
        references.
      </p>
    </div>
  );
}

function Thumbnail({ image }: { image: PageBlueprintImage }) {
  const isAvatar = image.type === "avatar";
  return (
    <div
      className={`relative h-20 w-20 shrink-0 overflow-hidden ${
        isAvatar ? "rounded-full" : "rounded-md"
      } border border-border bg-muted`}
    >
      {image.url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image.url}
          alt={image.alt ?? image.id}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted-foreground">
          <ImageOff className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
