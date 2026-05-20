"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Copy, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExtractedTextPanelProps {
  text: string;
  filename?: string;
  /** Defaults to closed; debug panel — expandable. */
  defaultOpen?: boolean;
}

export function ExtractedTextPanel({
  text,
  filename,
  defaultOpen = false,
}: ExtractedTextPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const lines = text.split("\n").length;
    return { chars, words, lines };
  }, [text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked in some embedded contexts — silent fail is fine.
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
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              Extracted text {filename ? `· ${filename}` : ""}
            </span>
            <span className="block text-xs text-muted-foreground">
              {stats.chars.toLocaleString()} chars · {stats.words.toLocaleString()} words ·{" "}
              {stats.lines.toLocaleString()} lines
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
              Raw, whitespace-normalized text. This is what the LLM will see in Phase 3.
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
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-b-xl bg-muted/40 px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
