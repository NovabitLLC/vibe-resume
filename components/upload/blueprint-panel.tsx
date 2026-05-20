"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, LayoutDashboard } from "lucide-react";

import type { PageBlueprint } from "@/types/pageBlueprint";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BlueprintPanelProps {
  blueprint: PageBlueprint;
  /** Optional — appended to the subtitle (e.g. model name). */
  source?: string;
  /** Show a small "Fallback" badge in the header. */
  fallback?: boolean;
  defaultOpen?: boolean;
}

/**
 * Collapsible debug panel for the generated PageBlueprint.
 * Always-on Copy Blueprint button. Defaults to open so the JSON is visible.
 */
export function BlueprintPanel({
  blueprint,
  source,
  fallback,
  defaultOpen = true,
}: BlueprintPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const json = useMemo(() => JSON.stringify(blueprint, null, 2), [blueprint]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silent */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              Generated Page Blueprint
            </span>
            <span className="block text-xs text-muted-foreground">
              v{blueprint.version} · {blueprint.sections.length} sections ·{" "}
              {blueprint.highlightedSkills.length} skills · {blueprint.stats.length} stats ·{" "}
              {blueprint.imageUsage.length} images
              {source ? ` · ${source}` : ""}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="hidden h-4 w-4 rounded-full border sm:inline-block"
            style={{ background: blueprint.theme.primaryColor, borderColor: "rgba(0,0,0,0.1)" }}
            title={`primaryColor: ${blueprint.theme.primaryColor}`}
          />
          {fallback && (
            <Badge variant="outline" className="hidden sm:inline-flex">
              fallback
            </Badge>
          )}
          <Badge variant="muted" className="hidden sm:inline-flex">
            debug
          </Badge>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between gap-2 px-4 py-2 text-xs text-muted-foreground">
            <span>
              Saved to <code className="font-mono">vibe-resume-blueprint</code>. Phase 5 will
              dispatch each section to its picked component.
            </span>
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Blueprint
                </>
              )}
            </Button>
          </div>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre rounded-b-xl bg-muted/40 px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
