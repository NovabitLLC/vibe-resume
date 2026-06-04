"use client";

import { Suspense } from "react";

import { SiteFooter } from "@/components/site/footer";
import { PreviewEditor } from "@/components/editor/PreviewEditor";

/**
 * Phase 6: the preview page is the Editor.
 * State, autosave, and tabs all live inside PreviewEditor — this page is just
 * the route container.
 */
export default function PreviewPage() {
  return (
    <div className="flex min-h-screen flex-col vibe-backdrop">
      <Suspense fallback={null}>
        <PreviewEditor />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
