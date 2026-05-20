"use client";

import { useCallback, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PdfDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function PdfDropzone({ file, onChange }: PdfDropzoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const next = files[0];
      if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) return;
      onChange(next);
    },
    [onChange]
  );

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · PDF</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onChange(null)} aria-label="Remove file">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/40 px-6 py-12 text-center transition-colors",
        isOver && "border-foreground/40 bg-accent/60"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground group-hover:text-foreground">
        <UploadCloud className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-medium">Drop your resume PDF here, or click to browse</p>
      <p className="mt-1 text-xs text-muted-foreground">Up to 10MB · we extract text only</p>
    </label>
  );
}
