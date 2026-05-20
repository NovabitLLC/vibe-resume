"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, FileJson } from "lucide-react";

import type { ResumeData } from "@/lib/resumeSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ParsedResumePanelProps {
  resume: ResumeData;
  /** Optional — shown next to the title. e.g. the model name. */
  source?: string;
  defaultOpen?: boolean;
}

export function ParsedResumePanel({
  resume,
  source,
  defaultOpen = true,
}: ParsedResumePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const json = useMemo(() => JSON.stringify(resume, null, 2), [resume]);

  const stats = useMemo(() => {
    return {
      experience: resume.experience.length,
      projects: resume.projects.length,
      education: resume.education.length,
      skills:
        resume.skills.languages.length +
        resume.skills.frameworks.length +
        resume.skills.tools.length +
        resume.skills.other.length,
    };
  }, [resume]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silently ignore */
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
            <FileJson className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              Parsed Resume JSON
            </span>
            <span className="block text-xs text-muted-foreground">
              {resume.name || "Unnamed"} ·{" "}
              {stats.experience} experience · {stats.projects} projects ·{" "}
              {stats.education} education · {stats.skills} skills
              {source ? ` · ${source}` : ""}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
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
              This is the validated ResumeData your preview will render and Phase 4 will style.
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
                  Copy JSON
                </>
              )}
            </Button>
          </div>
          <pre className="max-h-[28rem] overflow-auto whitespace-pre rounded-b-xl bg-muted/40 px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
