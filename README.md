# Vibe Resume

Turn a resume PDF into a beautiful, editable personal website — export as a single static HTML file.

> Architecture: **PDF → text → structured `ResumeData` JSON → `WebsiteConfig` JSON → template-based render → preview/edit → static HTML export.**
> No "AI generates random HTML" shortcuts. The two JSON contracts in [`lib/types.ts`](lib/types.ts) are the boundary every later phase plugs into.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style primitives
- Framer Motion · Lucide React
- [`unpdf`](https://github.com/unjs/unpdf) for serverless-safe PDF text extraction
- Zod for LLM-output validation (Phase 3+)

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the shared npm cache hits permission issues, use a project-local cache:

```bash
npm install --cache .npm-cache
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | `next lint`. |

## Routes

| Path | What it is |
|---|---|
| `/` | Landing page — hero, pipeline explainer, style gallery. |
| `/upload` | PDF upload + options. Calls `/api/extract-pdf`, shows extracted text in a collapsible debug panel, persists to `localStorage`. |
| `/preview` | Mock preview of the generated site (Phase 1 mock data; will read real data in Phase 3+). |
| `/api/extract-pdf` | `POST` multipart/form-data → `{ text, filename, bytes, chars }`. |

## Roadmap

1. ✅ Project setup · types · schemas · landing · upload UI · mock preview
2. ✅ PDF upload + text extraction
3. ⏳ LLM resume JSON extraction
4. ⏳ Website config generation
5. ⏳ Template-based website rendering
6. ⏳ Preview editor
7. ⏳ Static HTML export
8. ⏳ Polish, errors, responsive UI, cleanup

## Layout

```
app/
  page.tsx              # landing
  upload/page.tsx       # upload flow
  preview/page.tsx      # site preview
  api/extract-pdf/      # PDF -> text
components/
  ui/                   # shadcn-style primitives
  site/                 # nav + footer
  upload/               # upload-specific components
  preview/              # site preview template
lib/
  types.ts              # ResumeData, WebsiteConfig
  schemas.ts            # Zod mirrors of types
  pdf.ts                # extractTextFromPdf
  storage.ts            # localStorage helpers
  mock-data.ts          # Phase 1 sample data
  constants.ts          # career directions, visual styles
  utils.ts              # cn(), date helpers
```
