"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Download, PencilLine } from "lucide-react";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SitePreview } from "@/components/preview/site-preview";
import { BlueprintSummary } from "@/components/preview/blueprint-summary";

import { MOCK_BLUEPRINT, MOCK_RESUME } from "@/lib/mock-data";
import { loadPageBlueprint, loadResumeData, loadUploadedImages } from "@/lib/storage";
import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";
import {
  careerDirectionLabel,
  visualStyleLabel,
} from "@/lib/constants";

export default function PreviewPage() {
  return (
    <div className="flex min-h-screen flex-col vibe-backdrop">
      <SiteNav />
      <Suspense fallback={null}>
        <PreviewBody />
      </Suspense>
      <SiteFooter />
    </div>
  );
}

function PreviewBody() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [blueprint, setBlueprint] = useState<PageBlueprint | null>(null);
  const [images, setImages] = useState<PageBlueprintImage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setResume(loadResumeData());
    setBlueprint(loadPageBlueprint());
    setImages(loadUploadedImages());
    setHydrated(true);
  }, []);

  const isResumeMock = hydrated && resume == null;
  const isBlueprintMock = hydrated && blueprint == null;
  const isAnyMock = isResumeMock || isBlueprintMock;

  const displayedResume = useMemo(() => resume ?? MOCK_RESUME, [resume]);
  const displayedBlueprint = useMemo(() => blueprint ?? MOCK_BLUEPRINT, [blueprint]);
  const avatarImageUrl = useMemo(() => {
    const avatarUsage = displayedBlueprint.imageUsage.find((usage) => usage.usage === "avatar");
    if (!avatarUsage) return undefined;
    return images.find((image) => image.id === avatarUsage.imageId)?.url;
  }, [displayedBlueprint.imageUsage, images]);
  const imageRegistryDebug = useMemo(
    () =>
      images.map((image) => ({
        ...image,
        url: `${image.url.slice(0, 72)}${image.url.length > 72 ? "..." : ""}`,
        urlLength: image.url.length,
      })),
    [images]
  );

  return (
    <main className="flex-1">
      <div className="container max-w-6xl py-8 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/upload">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to upload
              </Link>
            </Button>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your generated site
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              direction{" "}
              <Badge variant="muted">
                {careerDirectionLabel(displayedBlueprint.careerDirection)}
              </Badge>
              <span className="mx-1">·</span>
              style{" "}
              <Badge variant="muted">{visualStyleLabel(displayedBlueprint.visualStyle)}</Badge>
              <span className="mx-1">·</span>
              theme <Badge variant="muted">{displayedBlueprint.theme.mode}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled title="Editor lands in Phase 6">
              <PencilLine className="h-4 w-4" />
              Edit
            </Button>
            <Button disabled title="Export lands in Phase 7">
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
          </div>
        </div>

        {isAnyMock && (
          <Alert variant="warning" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Showing sample data</AlertTitle>
            <AlertDescription>
              {isResumeMock && isBlueprintMock
                ? "No parsed resume or blueprint found in your browser."
                : isResumeMock
                  ? "No parsed resume found — using sample resume data."
                  : "No generated blueprint found — using the default blueprint."}{" "}
              Head back to{" "}
              <Link href="/upload" className="underline underline-offset-2">
                upload
              </Link>{" "}
              to run the full pipeline.
            </AlertDescription>
          </Alert>
        )}

        {/* Blueprint metadata card — always visible. */}
        <div className="mt-6">
          <BlueprintSummary blueprint={displayedBlueprint} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DebugJsonPanel
            title={`Image registry (${images.length})`}
            value={imageRegistryDebug}
            empty="No uploaded images found in vibe-resume-images."
          />
          <DebugJsonPanel
            title={`Blueprint imageUsage (${displayedBlueprint.imageUsage.length})`}
            value={displayedBlueprint.imageUsage}
            empty="No imageUsage entries in the blueprint."
          />
        </div>

        {/* Rendered preview */}
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 truncate text-xs text-muted-foreground">
              {(displayedResume.name || "you").toLowerCase().replace(/\s+/g, "")}
              .viberesume.app
            </span>
          </div>
          <div className="bg-background">
            <SitePreview
              resume={displayedResume}
              blueprint={displayedBlueprint}
              heroImage={avatarImageUrl}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Phase 4 preview · Phase 5 will dispatch each section to its picked component via the
          ComponentRenderer.
        </p>
      </div>
    </main>
  );
}

function DebugJsonPanel({
  title,
  value,
  empty,
}: {
  title: string;
  value: unknown[];
  empty: string;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <pre className="max-h-72 overflow-auto rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
