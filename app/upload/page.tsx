"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Info,
  LayoutDashboard,
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
import { BlueprintPanel } from "@/components/upload/blueprint-panel";

import { CAREER_DIRECTIONS } from "@/lib/constants";
import type { CareerDirection, UploadFormState, VisualStyle } from "@/lib/types";
import {
  clearExtraction,
  clearPageBlueprint,
  clearResumeData,
  clearUploadedImages,
  loadExtraction,
  loadPageBlueprint,
  loadResumeData,
  loadUploadedImages,
  saveExtraction,
  savePageBlueprint,
  saveResumeData,
  saveUploadedImages,
} from "@/lib/storage";
import type { ResumeData } from "@/lib/resumeSchema";
import type { PageBlueprint, PageBlueprintImage } from "@/types/pageBlueprint";

const DEFAULT_FORM: UploadFormState = {
  pdfFile: null,
  profileImage: null,
  projectImages: [],
  direction: "software-engineer",
  style: "modern-tech",
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

type BlueprintStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "success";
      blueprint: PageBlueprint;
      fallbackUsed: boolean;
      reason?: string;
      model?: string;
    }
  | { kind: "error"; message: string };

interface ExtractApiOk {
  text: string;
  filename: string;
  bytes: number;
  chars: number;
}
interface ExtractApiErr {
  error: string;
}

interface ParseApiOk {
  resume: ResumeData;
  model: string;
  provider: string;
}
interface ParseApiErr {
  error: string;
}

interface BlueprintApiOk {
  blueprint: PageBlueprint;
  fallbackUsed: boolean;
  reason?: string;
  model?: string;
  provider?: string;
}
interface BlueprintApiErr {
  error: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState<UploadFormState>(DEFAULT_FORM);
  const [extract, setExtract] = useState<ExtractStatus>({ kind: "idle" });
  const [parse, setParse] = useState<ParseStatus>({ kind: "idle" });
  const [bp, setBp] = useState<BlueprintStatus>({ kind: "idle" });

  // Restore everything saved on first mount.
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
    if (priorResume) setParse({ kind: "success", resume: priorResume });
    const priorBlueprint = loadPageBlueprint();
    if (priorBlueprint) {
      setBp({ kind: "success", blueprint: priorBlueprint, fallbackUsed: false });
    }
    const priorImages = loadUploadedImages();
    if (priorImages.length > 0) {
      setForm((f) => ({
        ...f,
        profileImage: priorImages.find((img) => img.type === "avatar") ?? null,
        projectImages: priorImages.filter((img) => img.type === "project"),
      }));
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
  const canDesign = useMemo(
    () => parse.kind === "success" && bp.kind !== "loading",
    [parse.kind, bp.kind]
  );
  const canContinue = bp.kind === "success";

  function update<K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "profileImage" || key === "projectImages") {
        saveUploadedImages(buildImagesFromForm(next));
      }
      return next;
    });
    if (key === "pdfFile") {
      setExtract({ kind: "idle" });
      setParse({ kind: "idle" });
      setBp({ kind: "idle" });
      clearResumeData();
      clearPageBlueprint();
    }
    // Direction/style or image changes invalidate the blueprint.
    if (key === "direction" || key === "style" || key === "profileImage" || key === "projectImages") {
      if (bp.kind === "success") {
        setBp({ kind: "idle" });
        clearPageBlueprint();
      }
    }
  }

  async function handleExtract() {
    if (!form.pdfFile) return;
    setExtract({ kind: "loading" });
    setParse({ kind: "idle" });
    setBp({ kind: "idle" });

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
      setExtract({ kind: "success", text: ok.text, filename: ok.filename, chars: ok.chars });
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
    setBp({ kind: "idle" });
    clearPageBlueprint();

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

  function buildImagesForApi(): PageBlueprintImage[] {
    return buildImagesFromForm(form);
  }

  async function handleDesign() {
    if (parse.kind !== "success") return;
    setBp({ kind: "loading" });

    try {
      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: parse.resume,
          careerDirection: form.direction,
          visualStyle: form.style,
          images: buildImagesForApi(),
        }),
      });
      const json = (await res.json()) as BlueprintApiOk | BlueprintApiErr;

      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : `Blueprint generation failed (HTTP ${res.status}).`;
        setBp({ kind: "error", message });
        return;
      }

      const ok = json as BlueprintApiOk;
      setBp({
        kind: "success",
        blueprint: ok.blueprint,
        fallbackUsed: ok.fallbackUsed,
        reason: ok.reason,
        model: ok.model,
      });
      savePageBlueprint(ok.blueprint);
    } catch (err) {
      setBp({
        kind: "error",
        message: err instanceof Error ? `Network error: ${err.message}` : "Network error.",
      });
    }
  }

  function handleReset() {
    clearExtraction();
    clearResumeData();
    clearPageBlueprint();
    clearUploadedImages();
    setForm(DEFAULT_FORM);
    setExtract({ kind: "idle" });
    setParse({ kind: "idle" });
    setBp({ kind: "idle" });
  }

  function handleContinue() {
    if (bp.kind !== "success") return;
    router.push("/preview");
  }

  const extracted = extract.kind === "success" ? extract : null;
  const parsed = parse.kind === "success" ? parse : null;
  const blueprinted = bp.kind === "success" ? bp : null;

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
              Upload your resume PDF. We extract text, structure it with an LLM, then design a
              modular Page Blueprint that drives the preview. The AI only picks from a fixed
              component library — it never writes code.
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
                  {(extracted || parsed || blueprinted) && (
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
                  Send the extracted text to an LLM and validate the response against the
                  ResumeData schema before saving.
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
                        {parsed.model ? ` (via ${parsed.model})` : ""}. Saved as{" "}
                        <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono dark:bg-emerald-900/40">
                          vibe-resume-data
                        </code>
                        .
                      </AlertDescription>
                    </Alert>
                    <ParsedResumePanel
                      resume={parsed.resume}
                      source={parsed.model}
                      defaultOpen={false}
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
                  These are passed as metadata to the blueprint designer.
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
                  Drives section ordering, component picks, and tone.
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
                  Drives theme (light/dark), backgroundStyle, fontStyle, and primary color.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StylePicker value={form.style} onChange={(v: VisualStyle) => update("style", v)} />
              </CardContent>
            </Card>

            {/* ---------- 6. Design website layout (Blueprint) ---------- */}
            <Card>
              <CardHeader>
                <CardTitle>6. Design website layout</CardTitle>
                <CardDescription>
                  The LLM picks components from a fixed allow-list (no JSX, no HTML, no CSS) and
                  produces a Page Blueprint. Always validated; falls back to a deterministic
                  default if the LLM misbehaves.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!parsed && (
                  <p className="text-sm text-muted-foreground">
                    Structure a resume first — its JSON is the input to this step.
                  </p>
                )}

                {bp.kind === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Couldn&apos;t generate a blueprint</AlertTitle>
                    <AlertDescription>{bp.message}</AlertDescription>
                  </Alert>
                )}

                {blueprinted && (
                  <>
                    <Alert variant={blueprinted.fallbackUsed ? "warning" : "success"}>
                      {blueprinted.fallbackUsed ? (
                        <Info className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {blueprinted.fallbackUsed
                          ? "Generated a fallback blueprint"
                          : "Blueprint generated"}
                      </AlertTitle>
                      <AlertDescription>
                        {blueprinted.blueprint.sections.length} sections ·{" "}
                        {blueprinted.blueprint.highlightedSkills.length} highlighted skills ·{" "}
                        {blueprinted.blueprint.imageUsage.length} image references.
                        {blueprinted.fallbackUsed && blueprinted.reason
                          ? ` Reason: ${blueprinted.reason}`
                          : ""}
                        {blueprinted.model && !blueprinted.fallbackUsed
                          ? ` (via ${blueprinted.model})`
                          : ""}
                      </AlertDescription>
                    </Alert>
                    <BlueprintPanel
                      blueprint={blueprinted.blueprint}
                      source={blueprinted.model}
                      fallback={blueprinted.fallbackUsed}
                      defaultOpen
                    />
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleDesign}
                    disabled={!canDesign}
                    variant={blueprinted ? "outline" : "default"}
                  >
                    {bp.kind === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Designing your website layout…
                      </>
                    ) : blueprinted ? (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Re-design
                      </>
                    ) : (
                      <>
                        <LayoutDashboard className="h-4 w-4" />
                        Design website layout
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ---------- Sticky action bar ---------- */}
            <div className="sticky bottom-4 z-30 mt-8 flex items-center justify-between gap-4 rounded-xl border bg-background/80 p-3 shadow-lg backdrop-blur sm:p-4">
              <div className="text-sm text-muted-foreground">
                {blueprinted
                  ? `Ready: ${blueprinted.blueprint.sections.length} sections designed.`
                  : parsed
                    ? "Click Design website layout to continue."
                    : extracted
                      ? "Structure your resume next."
                      : form.pdfFile
                        ? "Click Extract resume text to begin."
                        : "Upload a PDF to begin."}
              </div>
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!canContinue}
                title={canContinue ? "Continue to preview" : "Design a blueprint first"}
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

function buildImagesFromForm(form: UploadFormState): PageBlueprintImage[] {
  return [
    ...(form.profileImage ? [form.profileImage] : []),
    ...form.projectImages,
  ];
}
