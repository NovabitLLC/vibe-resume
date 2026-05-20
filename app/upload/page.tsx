"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
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
import { ParsedResumePanel } from "@/components/upload/parsed-resume-panel";

import { CAREER_DIRECTIONS } from "@/lib/constants";
import type { CareerDirection, UploadFormState, VisualStyle } from "@/lib/types";
import {
  clearExtraction,
  clearResumeData,
  loadExtraction,
  loadResumeData,
  saveExtraction,
  saveResumeData,
} from "@/lib/storage";
import type { ResumeData } from "@/lib/resumeSchema";

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

type ParseStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; resume: ResumeData; model?: string }
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

interface ParseApiOk {
  resume: ResumeData;
  model: string;
  provider: string;
}
interface ParseApiErr {
  error: string;
  issues?: unknown[];
  rawPreview?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState<UploadFormState>(DEFAULT_FORM);
  const [extract, setExtract] = useState<ExtractStatus>({ kind: "idle" });
  const [parse, setParse] = useState<ParseStatus>({ kind: "idle" });

  // Restore prior direction/style + cached extraction + parsed resume on load.
  useEffect(() => {
    const priorExtraction = loadExtraction();
    if (priorExtraction) {
      setForm((f) => ({
        ...f,
        direction: priorExtraction.direction,
        style: priorExtraction.style,
      }));
      setExtract({
        kind: "success",
        text: priorExtraction.text,
        filename: priorExtraction.filename,
        chars: priorExtraction.text.length,
      });
    }
    const priorResume = loadResumeData();
    if (priorResume) {
      setParse({ kind: "success", resume: priorResume });
    }
  }, []);

  const canExtract = useMemo(
    () => form.pdfFile != null && extract.kind !== "loading",
    [form.pdfFile, extract.kind]
  );

  const canStructure = useMemo(
    () => extract.kind === "success" && parse.kind !== "loading",
    [extract.kind, parse.kind]
  );

  const canContinue = parse.kind === "success";

  function update<K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Picking a new file invalidates everything downstream.
    if (key === "pdfFile") {
      setExtract({ kind: "idle" });
      setParse({ kind: "idle" });
      clearResumeData();
    }
  }

  async function handleExtract() {
    if (!form.pdfFile) return;
    setExtract({ kind: "loading" });
    setParse({ kind: "idle" });

    try {
      const body = new FormData();
      body.append("file", form.pdfFile);
      const res = await fetch("/api/extract-pdf", { method: "POST", body });
      const json = (await res.json()) as ExtractApiOk | ExtractApiErr;

      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : `Extraction failed (HTTP ${res.status}).`;
        setExtract({ kind: "error", message });
        return;
      }

      const ok = json as ExtractApiOk;
      setExtract({
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
      setExtract({
        kind: "error",
        message: err instanceof Error ? `Network error: ${err.message}` : "Network error.",
      });
    }
  }

  async function handleStructure() {
    if (extract.kind !== "success") return;
    setParse({ kind: "loading" });

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: extract.text }),
      });
      const json = (await res.json()) as ParseApiOk | ParseApiErr;

      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : `Parsing failed (HTTP ${res.status}).`;
        setParse({ kind: "error", message });
        return;
      }

      const ok = json as ParseApiOk;
      setParse({ kind: "success", resume: ok.resume, model: ok.model });
      saveResumeData(ok.resume);
    } catch (err) {
      setParse({
        kind: "error",
        message: err instanceof Error ? `Network error: ${err.message}` : "Network error.",
      });
    }
  }

  function handleReset() {
    clearExtraction();
    clearResumeData();
    setForm(DEFAULT_FORM);
    setExtract({ kind: "idle" });
    setParse({ kind: "idle" });
  }

  function handleContinue() {
    if (parse.kind !== "success") return;
    router.push(`/preview?direction=${form.direction}&style=${form.style}`);
  }

  const extracted = extract.kind === "success" ? extract : null;
  const parsed = parse.kind === "success" ? parse : null;

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
              Upload your resume PDF. We pull the text, then structure it into JSON with an LLM,
              then render the preview.
            </p>
          </motion.div>

          <div className="mt-10 space-y-6">
            {/* ---------- 1. Resume PDF ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>1. Resume PDF</CardTitle>
                <CardDescription>
                  PDF only · up to 10 MB · we extract text only, never store the file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PdfDropzone file={form.pdfFile} onChange={(f) => update("pdfFile", f)} />

                {extract.kind === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Couldn&apos;t extract that PDF</AlertTitle>
                    <AlertDescription>{extract.message}</AlertDescription>
                  </Alert>
                )}

                {extracted && (
                  <>
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Resume text extracted</AlertTitle>
                      <AlertDescription>
                        Pulled {extracted.chars.toLocaleString()} characters from{" "}
                        <span className="font-medium">{extracted.filename}</span>.
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
                  <Button
                    onClick={handleExtract}
                    disabled={!canExtract}
                    variant={extracted ? "outline" : "default"}
                  >
                    {extract.kind === "loading" ? (
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
                  {(extracted || parsed) && (
                    <Button variant="ghost" onClick={handleReset}>
                      Start over
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ---------- 2. Structure ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>2. Structure</CardTitle>
                <CardDescription>
                  We send the extracted text to an LLM and validate the response against a strict
                  schema before saving.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!extracted && (
                  <p className="text-sm text-muted-foreground">
                    Extract a PDF first — that text becomes the input to this step.
                  </p>
                )}

                {parse.kind === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Couldn&apos;t structure that resume</AlertTitle>
                    <AlertDescription>{parse.message}</AlertDescription>
                  </Alert>
                )}

                {parsed && (
                  <>
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Resume structured</AlertTitle>
                      <AlertDescription>
                        Parsed into ResumeData JSON
                        {parsed.model ? ` (via ${parsed.model})` : ""}. Saved to your browser as{" "}
                        <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono dark:bg-emerald-900/40">
                          vibe-resume-data
                        </code>
                        .
                      </AlertDescription>
                    </Alert>
                    <ParsedResumePanel
                      resume={parsed.resume}
                      source={parsed.model}
                      defaultOpen
                    />
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleStructure}
                    disabled={!canStructure}
                    variant={parsed ? "outline" : "default"}
                  >
                    {parse.kind === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Structuring your resume…
                      </>
                    ) : parsed ? (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Re-structure
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Structure resume
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ---------- 3. Photos ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>3. Photos (optional)</CardTitle>
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

            {/* ---------- 4. Career direction ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>4. Career direction</CardTitle>
                <CardDescription>
                  We&apos;ll lean wording and emphasis toward the role you&apos;re aiming at.
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

            {/* ---------- 5. Visual style ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>5. Visual style</CardTitle>
                <CardDescription>
                  Pick the vibe. You can still tweak typography and color on the next page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StylePicker value={form.style} onChange={(v: VisualStyle) => update("style", v)} />
              </CardContent>
            </Card>

            {/* ---------- Sticky action bar ---------- */}
            <div className="sticky bottom-4 z-30 mt-8 flex items-center justify-between gap-4 rounded-xl border bg-background/80 p-3 shadow-lg backdrop-blur sm:p-4">
              <div className="text-sm text-muted-foreground">
                {parsed
                  ? `Ready: ${parsed.resume.name || "resume"} structured.`
                  : extracted
                    ? "Click Structure resume to parse with the LLM."
                    : form.pdfFile
                      ? "Click Extract resume text to begin."
                      : "Upload a PDF to begin."}
              </div>
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!canContinue}
                title={canContinue ? "Continue to preview" : "Structure your resume first"}
              >
                Continue to Preview
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
