"use client";

import { useMemo } from "react";
import { Image as ImageIcon, BarChart3, ListOrdered, Palette, LayoutGrid } from "lucide-react";

import type { PageBlueprint } from "@/types/pageBlueprint";
import { SECTION_DISPLAY_TITLES } from "@/types/pageBlueprint";
import {
  careerDirectionLabel,
  visualStyleLabel,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Always-visible metadata card for the preview page. Surfaces:
 *  - careerDirection + visualStyle (human labels)
 *  - theme (mode, colors, fontStyle, backgroundStyle, spacing, borderRadius)
 *  - ordered list of (section, component)
 *  - highlightedSkills, featuredProjects
 *  - stats and imageUsage
 *
 * Stays in sync with the canonical Blueprint shape via TypeScript.
 */
export function BlueprintSummary({ blueprint }: { blueprint: PageBlueprint }) {
  const sections = useMemo(
    () => [...blueprint.sections].sort((a, b) => a.order - b.order),
    [blueprint.sections]
  );

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Blueprint summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Direction + style + version */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="muted">{careerDirectionLabel(blueprint.careerDirection)}</Badge>
          <Badge variant="muted">{visualStyleLabel(blueprint.visualStyle)}</Badge>
          <Badge variant="outline">v{blueprint.version}</Badge>
          <Badge variant="outline">{blueprint.layout.pageType}</Badge>
        </div>

        {/* Theme + layout */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Tile icon={Palette} title="Theme">
            <KV k="mode" v={blueprint.theme.mode} />
            <ColorSwatch label="primary" hex={blueprint.theme.primaryColor} />
            <ColorSwatch label="accent" hex={blueprint.theme.accentColor} />
            <KV k="background" v={blueprint.theme.backgroundStyle} />
            <KV k="font" v={blueprint.theme.fontStyle} />
            <KV k="spacing" v={blueprint.theme.spacing} />
            <KV k="radius" v={blueprint.theme.borderRadius} />
          </Tile>
          <Tile icon={LayoutGrid} title="Layout">
            <KV k="pageType" v={blueprint.layout.pageType} />
            <KV k="maxWidth" v={blueprint.layout.maxWidth} />
            <KV k="sectionSpacing" v={blueprint.layout.sectionSpacing} />
            <KV k="navigation" v={blueprint.layout.navigation} />
          </Tile>
        </div>

        {/* Ordered section list */}
        <div>
          <SubHeader icon={ListOrdered} title={`Sections (${sections.length})`} />
          <ol className="mt-2 space-y-1.5 text-sm">
            {sections.map((s) => (
              <li
                key={`${s.id}-${s.order}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-block h-5 w-5 rounded-full bg-foreground/10 text-center text-[10px] font-mono leading-5">
                    {s.order}
                  </span>
                  <span className="font-medium">
                    {SECTION_DISPLAY_TITLES[s.id] || s.id}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.id}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {s.component}
                  </Badge>
                  {!s.enabled && (
                    <Badge variant="outline" className="text-[10px]">
                      disabled
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Highlights + featured */}
        {(blueprint.highlightedSkills.length > 0 ||
          blueprint.featuredProjects.length > 0) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {blueprint.highlightedSkills.length > 0 && (
              <Tile title={`Highlighted skills (${blueprint.highlightedSkills.length})`}>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.highlightedSkills.map((s) => (
                    <Badge key={s} variant="default">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Tile>
            )}
            {blueprint.featuredProjects.length > 0 && (
              <Tile title={`Featured projects (${blueprint.featuredProjects.length})`}>
                <ul className="space-y-1 text-sm">
                  {blueprint.featuredProjects.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Tile>
            )}
          </div>
        )}

        {/* Image usage + stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Tile icon={ImageIcon} title={`Image usage (${blueprint.imageUsage.length})`}>
            {blueprint.imageUsage.length === 0 ? (
              <p className="text-sm text-muted-foreground">No images referenced.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {blueprint.imageUsage.map((u, i) => (
                  <li key={`${u.imageId}-${i}`} className="leading-snug">
                    <span className="font-mono text-xs text-muted-foreground">{u.imageId}</span>
                    <span className="mx-1.5">·</span>
                    <Badge variant="outline" className="text-[10px]">
                      {u.usage}
                    </Badge>
                    {u.sectionId && (
                      <>
                        <span className="mx-1.5 text-muted-foreground">in</span>
                        <span className="font-medium">{u.sectionId}</span>
                      </>
                    )}
                    {u.reason && (
                      <div className="text-xs text-muted-foreground">{u.reason}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Tile>
          <Tile icon={BarChart3} title={`Stats (${blueprint.stats.length})`}>
            {blueprint.stats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stats — none derived from real numbers in the resume.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {blueprint.stats.map((s, i) => (
                  <li key={i}>
                    <span className="font-mono font-medium">{s.value}</span>
                    <span className="mx-1.5">·</span>
                    {s.label}
                    {s.source && (
                      <div className="text-xs text-muted-foreground">{s.source}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Tile>
        </div>

        {blueprint.notes && (
          <p className="text-xs italic text-muted-foreground">{blueprint.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Tile({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <SubHeader icon={Icon} title={title} />
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SubHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />}
      <span>{title}</span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

function ColorSwatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-mono">
        <span
          className="h-3 w-3 rounded-full border"
          style={{ background: hex, borderColor: "rgba(0,0,0,0.1)" }}
        />
        {hex}
      </span>
    </div>
  );
}
