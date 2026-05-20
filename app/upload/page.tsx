"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { PdfDropzone } from "@/components/upload/pdf-dropzone";
import { ProfileImagePicker, ProjectImagePicker } from "@/components/upload/image-picker";
import { StylePicker } from "@/components/upload/style-picker";
import { ExtractedTextPanel } from "@/components/upload/extracted-text-panel";

import { CAREER_DIRECTIONS } from "@/lib/constants";
import type { CareerDirection, UploadFormState, VisualStyle } from "@/lib/types";
import { clearExtraction, loadExtraction, saveExtraction } from "@/lib/storage";

const DEFAULT_FORM: UploadFormState = {
  pdfFile: null,
  profileImage: null,
  projectImages: [],
  direction: "software-engineer",
  style: "modern",
};

type ExtractStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; text: string; filename: string; chars: number }
  | { kind: "error"; message: string };

interface ExtractApiOk {
  text: string;
  filename: string;
  bytes: number;
  chars: number;
}

interface ExtractApiErr {
  error: string;
  code?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState<UploadFormState>(DEFAULT_FORM);
  const [status, setStatus] = useState<ExtractStatus>({ kind: "idle" });

  // Restore prior direction/style + cached extraction if present.
  useEffect(() => {
    const prior = loadExtraction();
    if (!prior) return;
    setForm((f) => ({ ...f, direction: prior.direction, style: prior.style }));
    setStatus({
      kind: "success",
      text: prior.text,
      filename: prior.filename,
      chars: prior.text.length,
    });
  }, []);

  const canExtract = useMemo(
    () => form.pdfFile != null && status.kind !== "loading",
    [form.pdfFile, status.kind]
  );

  function update<K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Picking a new file invalidates any prior extraction.
    if (key === "pdfFile") {
      setStatus({ kind: "idle" });
    }
  }

  async function handleExtract() {
    if (!form.pdfFile) return;
    setStatus({ kind: "loading" });

    try {
      const body = new FormData();
      body.append("file", form.pdfFile);

      const res = await fetch("/api/extract-pdf", { method: "POST", body });
      const json = (await res.json()) as ExtractApiOk | ExtractApiErr;

      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : `Extraction failed (HTTP ${res.status}).`;
        setStatus({ kind: "error", message });
        return;
      }

      const ok = json as ExtractApiOk;
      setStatus({
        kind: "success",
        text: ok.text,
        filename: ok.filename,
        chars: ok.chars,
      });

      saveExtraction({
        text: ok.text,
        filename: ok.filename,
        direction: form.direction,
        style: form.style,
        extractedAt: new Date().toISOString(),
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? `Network error: ${err.message}`
            : "Couldn't reach the extraction service. Check your connection and try again.",
      });
    }
  }

  function handleReset() {
    clearExtraction();
    setForm(DEFAULT_FORM);
    setStatus({ kind: "idle" });
  }

  function handleContinue() {
    // Phase 2 stops at extraction; preview still uses mock data for now.
    // Phase 3 will swap this for the parsed ResumeData route.
    router.push(`/preview?direction=${form.direction}&style=${form.style}&mock=1`);
  }

  const extracted = status.kind === "success" ? status : null;
  const loading = status.kind === "loading";

  return (
    <div className="min-h-screen flex flex-col vibe-backdrop">
      <SiteNav />
      <main className="flex-1">
        <div className="container max-w-4xl py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Let&apos;s build your site.
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Upload your resume PDF and we&apos;ll pull the text out. In the next phase the LLM
              will turn that text into structured resume data.
            </p>
          </motion.div>

          <div className="mt-10 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Resume PDF</CardTitle>
                <CardDescription>
                  PDF only · up to 10 MB · we extract text only, never store the file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PdfDropzone file={form.pdfFile} onChange={(f) => update("pdfFile", f)} />

                {status.kind === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Couldn&apos;t extract that PDF</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {extracted && (
                  <>
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Resume text extracted</AlertTitle>
                      <AlertDescription>
                        Pulled {extracted.chars.toLocaleString()} characters from{" "}
                        <span className="font-medium">{extracted.filename}</span>. Review below, or
                        continue to see your preview.
                      </AlertDescription>
                    </Alert>
                    <ExtractedTextPanel
                      text={extracted.text}
                      filename={extracted.filename}
                      defaultOpen={false}
                    />
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleExtract} disabled={!canExtract} variant={extracted ? "outline" : "default"}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Extracting resume text…
                      </>
                    ) : extracted ? (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Re-extract
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Extract resume text
                      </>
                    )}
                  </Button>
                  {extracted && (
                    <Button variant="ghost" onClick={handleReset}>
                      Start over
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Photos (optional)</CardTitle>
                <CardDescription>
                  A profile photo for the hero, plus images for any projects you want to feature.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Profile photo
                  </Label>
                  <div className="mt-2">
                    <ProfileImagePicker
                      value={form.profileImage}
                      onChange={(v) => update("profileImage", v)}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Project images
                  </Label>
                  <div className="mt-2">
                    <ProjectImagePicker
                      value={form.projectImages}
                      onChange={(v) => update("projectImages", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Career direction</CardTitle>
                <CardDescription>
                  We&apos;ll lean the wording and emphasis toward the role you&apos;re aiming at.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:max-w-md">
                  <Label htmlFor="direction">Aiming at</Label>
                  <Select
                    value={form.direction}
                    onValueChange={(v) => update("direction", v as CareerDirection)}
                  >
                    <SelectTrigger id="direction">
                      <SelectValue placeholder="Pick a direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREER_DIRECTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <div className="flex flex-col">
                            <span>{d.label}</span>
                            <span className="text-xs text-muted-foreground">{d.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Visual style</CardTitle>
                <CardDescription>
                  Pick the vibe. You can still tweak typography and color on the next page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StylePicker value={form.style} onChange={(v: VisualStyle) => update("style", v)} />
              </CardContent>
            </Card>

            <div className="sticky bottom-4 z-30 mt-8 flex items-center justify-between gap-4 rounded-xl border bg-background/80 p-3 shadow-lg backdrop-blur sm:p-4">
              <div className="text-sm text-muted-foreground">
                {extracted
                  ? `Ready: ${extracted.chars.toLocaleString()} characters extracted.`
                  : form.pdfFile
                    ? "Click Extract resume text to continue."
                    : "Upload a PDF to begin."}
              </div>
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!extracted || loading}
                title={extracted ? "Continue" : "Extract a PDF first"}
              >
                Continue to preview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
