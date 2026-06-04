"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import {
  type BlueprintSection,
  type ComponentName,
  type PageBlueprint,
  type SectionId,
  SECTION_DISPLAY_TITLES,
} from "@/types/pageBlueprint";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ADDABLE_SECTIONS,
  getComponentLabel,
  getComponentOptions,
} from "./editorOptions";
import {
  addItem,
  moveSection,
  removeAt,
  renumberSections,
  updateAt,
  missingSectionIds,
} from "./editorUtils";
import { cn } from "@/lib/utils";

interface LayoutEditorProps {
  blueprint: PageBlueprint;
  onChange: (next: PageBlueprint) => void;
}

export function LayoutEditor({ blueprint, onChange }: LayoutEditorProps) {
  // Render in current order; the source of truth for order is `section.order`.
  const ordered = useMemo(
    () => [...blueprint.sections].sort((a, b) => a.order - b.order),
    [blueprint.sections]
  );

  function setSections(next: BlueprintSection[]) {
    onChange({ ...blueprint, sections: next });
  }

  function patchSection(index: number, updater: (s: BlueprintSection) => BlueprintSection) {
    setSections(updateAt(ordered, index, updater));
  }

  function move(index: number, delta: -1 | 1) {
    const to = index + delta;
    setSections(moveSection(ordered, index, to));
  }

  function remove(index: number) {
    setSections(renumberSections(removeAt(ordered, index)));
  }

  function addSection(id: SectionId) {
    const firstComponent = getComponentOptions(id)[0]?.value as ComponentName | undefined;
    if (!firstComponent) return;
    const next = addItem(ordered, {
      id,
      component: firstComponent,
      enabled: true,
      order: ordered.length + 1,
      props: {},
    });
    setSections(renumberSections(next));
  }

  const addable = missingSectionIds(
    blueprint,
    ADDABLE_SECTIONS.map((o) => o.value)
  );

  return (
    <div className="space-y-3">
      {ordered.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          No sections in this blueprint.
        </p>
      )}
      {ordered.map((section, i) => (
        <SectionRow
          key={`${section.id}-${i}`}
          index={i}
          section={section}
          isFirst={i === 0}
          isLast={i === ordered.length - 1}
          onPatch={(updater) => patchSection(i, updater)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, +1)}
          onRemove={() => remove(i)}
        />
      ))}

      <div className="rounded-xl border border-dashed border-border bg-card p-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Add missing section
        </Label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <Select
            disabled={addable.length === 0}
            value=""
            onValueChange={(v) => addSection(v as SectionId)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  addable.length === 0
                    ? "All common sections present"
                    : "Choose a section to add"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {ADDABLE_SECTIONS.filter((o) => addable.includes(o.value)).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function SectionRow({
  index,
  section,
  isFirst,
  isLast,
  onPatch,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  index: number;
  section: BlueprintSection;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (updater: (s: BlueprintSection) => BlueprintSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const componentOptions = getComponentOptions(section.id);
  const validComponent = componentOptions.some((o) => o.value === section.component);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3",
        !section.enabled && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-mono">
            {index + 1}
          </span>
          <Badge variant="muted" className="font-mono text-[10px]">
            {section.id}
          </Badge>
          <span className="text-sm font-medium">
            {SECTION_DISPLAY_TITLES[section.id] ?? section.id}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPatch((s) => ({ ...s, enabled: !s.enabled }))}
            aria-label={section.enabled ? "Disable" : "Enable"}
            title={section.enabled ? "Disable section" : "Enable section"}
          >
            {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Component
        </Label>
        <Select
          value={validComponent ? section.component : componentOptions[0]?.value ?? ""}
          onValueChange={(v) =>
            onPatch((s) => ({ ...s, component: v as ComponentName }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue>{getComponentLabel(section.component)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {componentOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <div className="flex flex-col">
                  <span className="font-mono text-xs">{o.value}</span>
                  {o.hint && <span className="text-[10px] text-muted-foreground">{o.hint}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!validComponent && (
          <p className="mt-1 text-[10px] text-amber-600">
            Previous component <code>{section.component}</code> is not valid for{" "}
            <code>{section.id}</code> — pick a replacement.
          </p>
        )}
      </div>
    </div>
  );
}
