"use client";

import { useCallback } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import type { UploadedImage } from "@/lib/types";
import { Button } from "@/components/ui/button";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ProfileImagePickerProps {
  value: UploadedImage | null;
  onChange: (next: UploadedImage | null) => void;
}

export function ProfileImagePicker({ value, onChange }: ProfileImagePickerProps) {
  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      const dataUrl = await readAsDataUrl(file);
      onChange({ id: crypto.randomUUID(), name: file.name, dataUrl });
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.dataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="inline-flex">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button variant="outline" size="sm" asChild>
            <span>{value ? "Replace" : "Upload"} photo</span>
          </Button>
        </label>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

interface ProjectImagePickerProps {
  value: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
}

export function ProjectImagePicker({ value, onChange }: ProjectImagePickerProps) {
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const next: UploadedImage[] = [];
      for (const f of Array.from(files)) {
        next.push({ id: crypto.randomUUID(), name: f.name, dataUrl: await readAsDataUrl(f) });
      }
      onChange([...value, ...next]);
    },
    [value, onChange]
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v.id !== img.id))}
              className="absolute right-1 top-1 hidden rounded-md bg-background/90 p-1 text-xs shadow group-hover:block"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed text-muted-foreground hover:bg-accent">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <ImagePlus className="h-5 w-5" />
        </label>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Optional. We'll use these on project cards or the hero, based on your style.
      </p>
    </div>
  );
}
