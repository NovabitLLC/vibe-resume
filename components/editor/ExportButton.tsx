"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  resume: ResumeData;
  blueprint: PageBlueprint;
  images: PageBlueprintImage[];
}

/**
 * Posts the current editor state to /api/export-html and downloads the
 * returned standalone HTML file. Pure client glue — the document itself is
 * generated server-side as an escaped string.
 */
export function ExportButton({ resume, blueprint, images }: ExportButtonProps) {
  const [status, setStatus] = useState<"idle" | "exporting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setStatus("exporting");
    setError(null);
    try {
      const res = await fetch("/api/export-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, blueprint, images }),
      });

      if (!res.ok) {
        // Error responses are JSON.
        let message = `Export failed (HTTP ${res.status}).`;
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) message = json.error;
        } catch {
          /* keep default */
        }
        setError(message);
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const filename = filenameFromDisposition(res.headers.get("Content-Disposition")) ?? "vibe-resume.html";
      triggerDownload(blob, filename);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error during export.");
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === "error" && error && (
        <span className="hidden max-w-[200px] truncate text-xs text-red-500 sm:inline" title={error}>
          {error}
        </span>
      )}
      <Button
        size="sm"
        onClick={handleExport}
        disabled={status === "exporting"}
        className={cn(status === "error" && "ring-1 ring-red-400")}
      >
        {status === "exporting" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            Export HTML
          </>
        )}
      </Button>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/filename="?([^"]+)"?/i);
  return match ? match[1] : null;
}
