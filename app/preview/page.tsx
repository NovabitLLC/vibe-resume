"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Download, PencilLine } from "lucide-react";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SitePreview } from "@/components/preview/site-preview";

import { MOCK_RESUME, MOCK_WEBSITE_CONFIG } from "@/lib/mock-data";
import type { CareerDirection, VisualStyle, WebsiteConfig } from "@/lib/types";
import { loadResumeData } from "@/lib/storage";
import type { ResumeData } from "@/lib/resumeSchema";

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
  const params = useSearchParams();

  const direction =
    (params.get("direction") as CareerDirection | null) ?? MOCK_WEBSITE_CONFIG.direction;
  const style = (params.get("style") as VisualStyle | null) ?? MOCK_WEBSITE_CONFIG.style;

  // Resume hydration is client-only — read once on mount.
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setResume(loadResumeData());
    setHydrated(true);
  }, []);

  // Mock fallback when no parsed resume is in storage.
  const isMock = hydrated && resume == null;
  const displayedResume = resume ?? MOCK_RESUME;

  const config = useMemo<WebsiteConfig>(
    () => ({ ...MOCK_WEBSITE_CONFIG, direction, style }),
    [direction, style]
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
              direction <Badge variant="muted">{direction}</Badge>
              <span className="mx-1">·</span>
              style <Badge variant="muted">{style}</Badge>
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

        {isMock && (
          <Alert variant="warning" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Showing sample data</AlertTitle>
            <AlertDescription>
              No parsed resume found in your browser. Head back to{" "}
              <Link href="/upload" className="underline underline-offset-2">
                upload
              </Link>{" "}
              to extract and structure your own PDF — the preview will swap in once it&apos;s
              ready.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 truncate text-xs text-muted-foreground">
              {(displayedResume.name || "you")
                .toLowerCase()
                .replace(/\s+/g, "")}
              .viberesume.app
            </span>
          </div>
          <div className="bg-background">
            <SitePreview resume={displayedResume} config={config} />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Phase 3 preview · Phase 4 will generate a proper WebsiteConfig (theme + sections) instead
          of using the default template.
        </p>
      </div>
    </main>
  );
}
