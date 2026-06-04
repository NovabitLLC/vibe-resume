"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import type {
  BlueprintLayout,
  BlueprintTheme,
  PageBlueprint,
} from "@/types/pageBlueprint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  BACKGROUND_STYLE_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  FONT_STYLE_OPTIONS,
  MAX_WIDTH_OPTIONS,
  NAVIGATION_OPTIONS,
  SPACING_OPTIONS,
  THEME_MODE_OPTIONS,
} from "./editorOptions";
import { isValidHexColor } from "./editorUtils";

interface ThemeEditorProps {
  blueprint: PageBlueprint;
  onChange: (next: PageBlueprint) => void;
}

export function ThemeEditor({ blueprint, onChange }: ThemeEditorProps) {
  function patchTheme(updater: (t: BlueprintTheme) => BlueprintTheme) {
    onChange({ ...blueprint, theme: updater(blueprint.theme) });
  }
  function patchLayout(updater: (l: BlueprintLayout) => BlueprintLayout) {
    onChange({ ...blueprint, layout: updater(blueprint.layout) });
  }

  return (
    <div className="space-y-5">
      <Card title="Theme">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EnumField
            label="Mode"
            value={blueprint.theme.mode}
            options={THEME_MODE_OPTIONS}
            onChange={(v) => patchTheme((t) => ({ ...t, mode: v as BlueprintTheme["mode"] }))}
          />
          <EnumField
            label="Background"
            value={blueprint.theme.backgroundStyle}
            options={BACKGROUND_STYLE_OPTIONS}
            onChange={(v) =>
              patchTheme((t) => ({ ...t, backgroundStyle: v as BlueprintTheme["backgroundStyle"] }))
            }
          />
          <HexField
            label="Primary color"
            value={blueprint.theme.primaryColor}
            onChange={(v) => patchTheme((t) => ({ ...t, primaryColor: v }))}
          />
          <HexField
            label="Accent color"
            value={blueprint.theme.accentColor}
            onChange={(v) => patchTheme((t) => ({ ...t, accentColor: v }))}
          />
          <EnumField
            label="Font style"
            value={blueprint.theme.fontStyle}
            options={FONT_STYLE_OPTIONS}
            onChange={(v) =>
              patchTheme((t) => ({ ...t, fontStyle: v as BlueprintTheme["fontStyle"] }))
            }
          />
          <EnumField
            label="Spacing"
            value={blueprint.theme.spacing}
            options={SPACING_OPTIONS}
            onChange={(v) =>
              patchTheme((t) => ({ ...t, spacing: v as BlueprintTheme["spacing"] }))
            }
          />
          <EnumField
            label="Border radius"
            value={blueprint.theme.borderRadius}
            options={BORDER_RADIUS_OPTIONS}
            onChange={(v) =>
              patchTheme((t) => ({ ...t, borderRadius: v as BlueprintTheme["borderRadius"] }))
            }
          />
        </div>
      </Card>

      <Card title="Layout">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EnumField
            label="Max width"
            value={blueprint.layout.maxWidth}
            options={MAX_WIDTH_OPTIONS}
            onChange={(v) =>
              patchLayout((l) => ({ ...l, maxWidth: v as BlueprintLayout["maxWidth"] }))
            }
          />
          <EnumField
            label="Section spacing"
            value={blueprint.layout.sectionSpacing}
            options={SPACING_OPTIONS}
            onChange={(v) =>
              patchLayout((l) => ({
                ...l,
                sectionSpacing: v as BlueprintLayout["sectionSpacing"],
              }))
            }
          />
          <EnumField
            label="Navigation"
            value={blueprint.layout.navigation}
            options={NAVIGATION_OPTIONS}
            onChange={(v) =>
              patchLayout((l) => ({ ...l, navigation: v as BlueprintLayout["navigation"] }))
            }
          />
        </div>
      </Card>
    </div>
  );
}

// ---------- Small UI ----------

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function EnumField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; hint?: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
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
  );
}

function HexField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  // Keep draft in sync if parent value changes externally (e.g., Reset).
  if (draft !== value && isValidHexColor(value) && !isValidHexColor(draft)) {
    // External update wins on next render; user-typed invalid values stay.
  }
  const valid = isValidHexColor(draft);
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidHexColor(value) ? value : "#000000"}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
          }}
          className={cn(
            "h-9 w-9 cursor-pointer rounded-md border border-input bg-background p-0.5",
            "[&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          )}
          aria-label={`${label} picker`}
        />
        <Input
          value={draft}
          placeholder="#000000"
          spellCheck={false}
          className="font-mono"
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            if (isValidHexColor(next)) onChange(next);
          }}
          onBlur={() => {
            if (!isValidHexColor(draft)) setDraft(value);
          }}
        />
      </div>
      {!valid && draft.length > 0 && (
        <p className="flex items-center gap-1 text-[10px] text-amber-600">
          <AlertCircle className="h-3 w-3" />
          Use a #RRGGBB hex value (e.g. #2563eb).
        </p>
      )}
    </div>
  );
}
