export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-2 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Vibe Resume — yours, exported as static HTML.</p>
        <p>Built with Next.js · Tailwind · shadcn/ui</p>
      </div>
    </footer>
  );
}
