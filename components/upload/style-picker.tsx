"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { VISUAL_STYLES } from "@/lib/constants";
import type { VisualStyle } from "@/lib/types";

interface StylePickerProps {
  value: VisualStyle;
  onChange: (next: VisualStyle) => void;
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {VISUAL_STYLES.map((s) => {
        const selected = s.value === value;
        return (
          <button
            type="button"
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-md",
              selected ? "border-foreground ring-2 ring-foreground/20" : "border-border"
            )}
          >
            <div className="h-20 w-full" style={{ background: s.preview }} />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{s.label}</p>
                {selected && <Check className="h-4 w-4 text-foreground" />}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
