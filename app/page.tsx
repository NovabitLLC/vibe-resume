"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileUp,
  Sparkles,
  Wand2,
  LayoutTemplate,
  PencilLine,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { VISUAL_STYLES } from "@/lib/constants";

const steps = [
  {
    icon: FileUp,
    title: "Upload your PDF",
    body: "Drop in your existing resume. We extract the text — no rewriting required.",
  },
  {
    icon: Wand2,
    title: "Pick a direction",
    body: "Tell us the role you're aiming at. We tune wording and emphasis around it.",
  },
  {
    icon: LayoutTemplate,
    title: "Choose a vibe",
    body: "Minimal, modern, editorial, technical — pick a visual style that fits you.",
  },
  {
    icon: PencilLine,
    title: "Edit live",
    body: "Tweak any line, swap photos, reorder sections. Changes apply instantly.",
  },
  {
    icon: Download,
    title: "Export static HTML",
    body: "Take the whole site as a single HTML file. Host it anywhere — or nowhere.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col vibe-backdrop">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <StylePreview />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="container pt-20 pb-16 sm:pt-28 sm:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <Badge variant="muted" className="mb-6">
          <Sparkles className="mr-1.5 h-3 w-3" />
          Resume → website, automatically
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Your resume, but it actually <span className="shimmer-text">looks like you</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          Vibe Resume turns a PDF into a beautiful, editable personal website. Upload, pick a
          direction and a style — get a clean, professional site you can export as a single HTML
          file.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="xl" asChild>
            <Link href="/upload">
              Upload your resume
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/preview">See a live example</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No account needed for the demo. Your PDF never leaves your browser until you ask it to.
        </p>
      </motion.div>

      <HeroPreview />
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="mx-auto mt-16 max-w-5xl"
    >
      <Card className="overflow-hidden border-border/70 shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 truncate text-xs text-muted-foreground">avery.viberesume.app</span>
        </div>
        <CardContent className="grid grid-cols-1 gap-0 p-0 md:grid-cols-[1.1fr_1fr]">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Senior Product Engineer
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Avery Chen</h3>
            <p className="mt-4 max-w-md text-muted-foreground">
              I turn quiet complexity into obvious products. Most recently shipping
              developer-platform work at Lumen Labs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["TypeScript", "React", "Postgres", "Design systems"].map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <Stat label="YoE" value="6+" />
              <Stat label="Shipped products" value="14" />
              <Stat label="Activation lift" value="+34%" />
            </div>
          </div>
          <div className="relative min-h-[260px] bg-gradient-to-br from-indigo-500/15 via-pink-400/10 to-amber-300/15 p-8 sm:p-10">
            <div className="absolute inset-0 [background:radial-gradient(circle_at_70%_30%,rgba(255,255,255,.6),transparent_60%)]" />
            <div className="relative h-full">
              <div className="space-y-3">
                {["Lumen Labs · Senior PE", "Northwind · Product Eng.", "Foundry Studio · SWE"].map(
                  (l, i) => (
                    <motion.div
                      key={l}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-sm shadow-sm backdrop-blur"
                    >
                      {l}
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          From PDF to personal site in under a minute.
        </h2>
        <p className="mt-4 text-muted-foreground">
          A small, deliberate pipeline. Your data goes through structured JSON — never random AI
          HTML — so the result stays clean and editable.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <Card key={s.title} className="border-border/70">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-foreground text-background">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function StylePreview() {
  return (
    <section className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Six vibes. One that's yours.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Each style is a tuned template, not a random theme. Pick one, then edit any detail.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {VISUAL_STYLES.map((s) => (
          <Card key={s.value} className="overflow-hidden border-border/70">
            <div className="h-28 w-full" style={{ background: s.preview }} />
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium capitalize">{s.label}</h3>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {s.value}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container pb-24">
      <Card className="overflow-hidden border-border/70 bg-foreground text-background">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-10 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to give your resume a website?
            </h3>
            <p className="mt-2 max-w-xl text-sm text-background/70">
              It takes about as long as making a coffee. Editable, exportable, and yours.
            </p>
          </div>
          <Button size="xl" variant="secondary" asChild>
            <Link href="/upload">
              Start building
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
