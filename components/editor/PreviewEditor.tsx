"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cog,
  FileJson,
  Image as ImageIcon,
  LayoutDashboard,
  Pencil,
  RotateCcw,
} from "lucide-react";

import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";
import { MOCK_BLUEPRINT, MOCK_RESUME } from "@/lib/mock-data";
import {
  loadOriginalPageBlueprint,
  loadOriginalResumeData,
  loadPageBlueprint,
  loadResumeData,
  loadUploadedImages,
  savePageBlueprint,
  saveResumeData,
  saveUploadedImages,
  seedOriginalsIfMissing,
} from "@/lib/storage";

import { ComponentRenderer } from "@/components/renderer/ComponentRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { ContentEditor } from "./ContentEditor";
import { LayoutEditor } from "./LayoutEditor";
import { ThemeEditor } from "./ThemeEditor";
import { ImageEditor } from "./ImageEditor";
import { DebugEditor } from "./DebugEditor";

type TabKey = "content" | "layout" | "theme" | "images" | "debug";

const TABS: { key: TabKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "content", label: "Content", Icon: Pencil },
  { key: "layout", label: "Layout", Icon: LayoutDashboard },
  { key: "theme", label: "Theme", Icon: Cog },
  { key: "images", label: "Images", Icon: ImageIcon },
  { key: "debug", label: "Debug", Icon: FileJson },
];

/**
 * Top-level Phase 6 editor.
 *
 * Owns:
 *   - resume / blueprint / images state
 *   - autosave to localStorage (gated by a `hydrated` flag so the first-mount
 *     load doesn't immediately echo back to disk)
 *   - reset-to-original behavior (originals are seeded once from the
 *     generated values on first load)
 *   - live preview via ComponentRenderer
 */
export function PreviewEditor() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [blueprint, setBlueprint] = useState<PageBlueprint | null>(null);
  const [images, setImages] = useState<PageBlueprintImage[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // ---------- Hydrate on mount ----------
  useEffect(() => {
    const loadedResume = loadResumeData();
    const loadedBlueprint = loadPageBlueprint();
    const loadedImages = loadUploadedImages();
    setResume(loadedResume);
    setBlueprint(loadedBlueprint);
    setImages(loadedImages);
    // First-time editor visit: stash the originals so Reset has something to
    // restore. Idempotent — subsequent visits skip.
    seedOriginalsIfMissing(loadedResume, loadedBlueprint);
    setHydrated(true);
  }, []);

  // ---------- Autosave (skip first render via `hydrated`) ----------
  useEffect(() => {
    if (!hydrated || !resume) return;
    saveResumeData(resume);
    setLastSavedAt(Date.now());
  }, [resume, hydrated]);

  useEffect(() => {
    if (!hydrated || !blueprint) return;
    savePageBlueprint(blueprint);
    setLastSavedAt(Date.now());
  }, [blueprint, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveUploadedImages(images);
    setLastSavedAt(Date.now());
  }, [images, hydrated]);

  // ---------- Reset handlers ----------
  const resetContent = useCallback(() => {
    const original = loadOriginalResumeData();
    if (!original) {
      alert("No original resume snapshot found. Re-upload to regenerate.");
      return;
    }
    if (!confirm("Reset all resume content to the originally generated version?")) return;
    setResume(original);
  }, []);

  const resetLayout = useCallback(() => {
    const original = loadOriginalPageBlueprint();
    if (!original) {
      alert("No original blueprint snapshot found. Re-upload to regenerate.");
      return;
    }
    if (!confirm("Reset layout, theme, and section order to the originally generated version?"))
      return;
    setBlueprint(original);
  }, []);

  // ---------- Mock fallback so the page never breaks ----------
  const isResumeMock = hydrated && resume == null;
  const isBlueprintMock = hydrated && blueprint == null;
  const anyMock = isResumeMock || isBlueprintMock;
  const displayedResume = resume ?? MOCK_RESUME;
  const displayedBlueprint = blueprint ?? MOCK_BLUEPRINT;

  // Stable callback shells passed to sub-editors. We always update the real
  // state (resume / blueprint) — never the mock — so the user's first edit
  // implicitly "claims" the mock data as their own.
  const onResumeChange = useCallback((next: ResumeData) => setResume(next), []);
  const onBlueprintChange = useCallback((next: PageBlueprint) => setBlueprint(next), []);
  const onImagesChange = useCallback((next: PageBlueprintImage[]) => setImages(next), []);

  // ---------- Render ----------
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        savedAt={lastSavedAt}
        hydrated={hydrated}
        onResetContent={resetContent}
        onResetLayout={resetLayout}
      />

      <main className="flex-1">
        <div className="container max-w-7xl py-6 sm:py-8">
          {anyMock && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Editing sample data</AlertTitle>
              <AlertDescription>
                {isResumeMock && isBlueprintMock
                  ? "No saved resume or blueprint found — using sample data. Edits will persist locally."
                  : isResumeMock
                    ? "Using sample resume — your edits will replace it."
                    : "Using sample blueprint — your edits will replace it."}{" "}
                Need to start fresh?{" "}
                <Link href="/upload" className="underline underline-offset-2">
                  Re-upload your PDF
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[460px_1fr]">
            {/* ----- Editor side ----- */}
            <section className="space-y-3">
              <Tabs activeTab={activeTab} onChange={setActiveTab} />
              <div className="rounded-xl border border-border bg-background/30 p-3 sm:p-4">
                {activeTab === "content" && (
                  <ContentEditor resume={displayedResume} onChange={onResumeChange} />
                )}
                {activeTab === "layout" && (
                  <LayoutEditor blueprint={displayedBlueprint} onChange={onBlueprintChange} />
                )}
                {activeTab === "theme" && (
                  <ThemeEditor blueprint={displayedBlueprint} onChange={onBlueprintChange} />
                )}
                {activeTab === "images" && (
                  <ImageEditor
                    images={images}
                    blueprint={displayedBlueprint}
                    onImagesChange={onImagesChange}
                    onBlueprintChange={onBlueprintChange}
                  />
                )}
                {activeTab === "debug" && (
                  <DebugEditor
                    resume={displayedResume}
                    blueprint={displayedBlueprint}
                    images={images}
                  />
                )}
              </div>
            </section>

            {/* ----- Live preview side ----- */}
            <section className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
                <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                  <span className="ml-3 truncate text-xs text-muted-foreground">
                    {(displayedResume.name || "you").toLowerCase().replace(/\s+/g, "")}.viberesume.app
                  </span>
                  <span className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">live preview</Badge>
                  </span>
                </div>
                <div className="bg-background">
                  <ComponentRenderer
                    resume={displayedResume}
                    blueprint={displayedBlueprint}
                    images={images}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- Top bar ----------

function TopBar({
  savedAt,
  hydrated,
  onResetContent,
  onResetLayout,
}: {
  savedAt: number | null;
  hydrated: boolean;
  onResetContent: () => void;
  onResetLayout: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-14 max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/upload">
              <ArrowLeft className="h-3.5 w-3.5" />
              Upload
            </Link>
          </Button>
          <span className="hidden text-sm font-medium sm:inline">Vibe Resume Editor</span>
          <SaveStatus savedAt={savedAt} hydrated={hydrated} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onResetContent}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset content
          </Button>
          <Button variant="outline" size="sm" onClick={onResetLayout}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset layout
          </Button>
        </div>
      </div>
    </header>
  );
}

function SaveStatus({ savedAt, hydrated }: { savedAt: number | null; hydrated: boolean }) {
  // Reactive "n seconds ago" — recompute every 5s so the indicator stays alive.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 5000);
    return () => clearInterval(id);
  }, []);
  void tick; // keep linter quiet

  if (!hydrated) return null;
  const label = savedAt ? humanizeSavedAt(savedAt) : "Saved locally";
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      {label}
    </span>
  );
}

function humanizeSavedAt(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return "Saved locally";
}

// ---------- Tabs ----------

function Tabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
      {TABS.map(({ key, label, Icon }) => {
        const active = key === activeTab;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
