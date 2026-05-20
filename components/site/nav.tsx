"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Vibe Resume</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/preview">Live demo</Link>
          </Button>
          <Button asChild>
            <Link href="/upload">Try it</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
