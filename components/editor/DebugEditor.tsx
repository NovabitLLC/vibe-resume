"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";
import { Button } from "@/components/ui/button";
import { BlueprintSummary } from "@/components/preview/blueprint-summary";

interface DebugEditorProps {
  resume: ResumeData;
  blueprint: PageBlueprint;
  images: PageBlueprintImage[];
}

export function DebugEditor({ resume, blueprint, images }: DebugEditorProps) {
  const imagesForDisplay = useMemo(
    () =>
      images.map((image) => ({
        ...image,
        url: image.url
          ? `${image.url.slice(0, 72)}${image.url.length > 72 ? "…" : ""}`
          : "",
        urlLength: image.url?.length ?? 0,
      })),
    [images]
  );

  return (
    <div className="space-y-3">
      <BlueprintSummary blueprint={blueprint} />
      <JsonPanel title="Resume JSON" value={resume} />
      <JsonPanel title="PageBlueprint JSON" value={blueprint} />
      <JsonPanel
        title={`Image registry (${images.length})`}
        value={imagesForDisplay}
        copyValue={images}
        empty="No uploaded images in vibe-resume-images."
      />
    </div>
  );
}

function JsonPanel({
  title,
  value,
  copyValue,
  empty,
}: {
  title: string;
  value: unknown;
  /** Full payload to copy when the display value is truncated. */
  copyValue?: unknown;
  empty?: string;
}) {
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const copyJson = useMemo(
    () => (copyValue !== undefined ? JSON.stringify(copyValue, null, 2) : json),
    [copyValue, json]
  );
  const isEmpty = Array.isArray(value) && value.length === 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silent */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <p className="text-sm font-medium">{title}</p>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      {isEmpty && empty ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <pre className="max-h-[24rem] overflow-auto whitespace-pre rounded-b-xl bg-muted/40 px-4 py-3 font-mono text-[11px] leading-relaxed text-foreground/90">
          {json}
        </pre>
      )}
    </div>
  );
}
