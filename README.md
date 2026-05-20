# Vibe Resume

Turn a resume PDF into a beautiful, editable personal website — export as a single static HTML file.

> Architecture: **PDF → text → structured `ResumeData` JSON → modular `PageBlueprint` JSON → component-based preview → preview/edit → static HTML export.**
> No "AI generates random HTML" shortcuts. `ResumeData` and `PageBlueprint` are the contracts every later phase plugs into.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style primitives
- Framer Motion · Lucide React
- [`unpdf`](https://github.com/unjs/unpdf) for serverless-safe PDF text extraction
- Zod for validating LLM output and persisted browser state

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
| `/upload` | End-to-end creation flow: PDF upload, optional image uploads, career direction/style choices, resume parsing, and PageBlueprint generation. |
| `/preview` | Loads persisted `ResumeData`, `PageBlueprint`, and uploaded image metadata; renders the Phase 5 PageBlueprint Renderer plus debug panels. |
| `/api/extract-pdf` | `POST` multipart/form-data → `{ text, filename, bytes, chars }`. |
| `/api/parse-resume` | `POST` JSON `{ resumeText }` → validated `ResumeData`. |
| `/api/generate-blueprint` | `POST` JSON `{ resume, careerDirection, visualStyle, images }` → validated `PageBlueprint`, with deterministic fallback. |

## Current Process

1. Upload a resume PDF on `/upload`.
2. Click **Extract resume text**. The server route extracts text with `unpdf` and stores the raw text metadata in `localStorage`.
3. Click **Structure resume**. The app sends the extracted text to the LLM and validates the response against `ResumeData`.
4. Optionally upload a profile photo and project images. Upload input determines image type:
   - profile photo → `type: "avatar"`
   - project images → `type: "project"`
5. Pick a career direction and visual style.
6. Click **Design website layout**. The app sends `resume`, `careerDirection`, `visualStyle`, and uploaded image metadata to `/api/generate-blueprint`.
7. The blueprint route validates LLM output against `PageBlueprint`. If the model fails or returns invalid JSON, it returns a deterministic fallback blueprint.
8. Continue to `/preview`. The preview loads persisted resume, blueprint, and image metadata, then renders the website through the predefined ComponentRenderer registry.

## PageBlueprint Renderer

Phase 5 turns the blueprint contract into a real modular website renderer.

- `ComponentRenderer` reads `blueprint.sections`, filters enabled sections, sorts by `order`, and renders each section through a registry lookup.
- `componentRegistry` maps allowed blueprint component names to local React components. It never uses `eval`, model-generated JSX, raw HTML, or `dangerouslySetInnerHTML`.
- Unknown components are skipped safely in production and shown as a small development fallback locally.
- Section components hide themselves when their resume data is empty, so empty headings do not render.
- Theme values are mapped through safe helpers in `components/renderer/theme.ts`; LLM values are never used as raw Tailwind classes.

Implemented section families:

| Family | Components |
|---|---|
| Hero | `SplitHero`, `CenteredHero`, `AvatarHero`, `MinimalHero`, `CreativeImageHero` |
| About | `AboutCard`, `AboutSplit`, `SummaryBlock` |
| Skills | `SkillBadgeCloud`, `GroupedSkills`, `TechStackGrid`, `SkillBarList` |
| Experience | `ExperienceTimeline`, `ExperienceCards`, `CorporateExperienceList` |
| Projects | `ProjectCardGrid`, `ProjectImageGallery`, `FeaturedProject`, `CompactProjectList` |
| Education | `EducationCards`, `EducationTimeline`, `AcademicEducationBlock` |
| Contact | `ContactCTA`, `ContactCard`, `MinimalContact` |
| Supporting | certifications, awards, publications, stats |

## Browser Storage

The app intentionally uses `localStorage` while the product is in the early local-preview phase.

| Key | Contents |
|---|---|
| `viberesume:rawText` | Extracted PDF text. |
| `viberesume:filename` | Source PDF filename. |
| `viberesume:direction` | Selected career direction. |
| `viberesume:style` | Selected visual style. |
| `vibe-resume-data` | Validated `ResumeData` JSON. |
| `vibe-resume-blueprint` | Validated `PageBlueprint` JSON. |
| `vibe-resume-images` | Uploaded image metadata, including data URLs, for preview-time image lookup. |

`PageBlueprint.imageUsage` stores image references, not image bytes. The renderer resolves `imageId` against `vibe-resume-images`.

## Image Flow

Uploaded images are classified by the input control, not by the LLM.

Profile photo metadata:

```json
{
  "id": "uuid",
  "type": "avatar",
  "url": "data:image/...",
  "alt": "Profile photo"
}
```

Project image metadata:

```json
{
  "id": "uuid",
  "type": "project",
  "url": "data:image/...",
  "alt": "Project image",
  "relatedProject": ""
}
```

The blueprint may reference images through full `imageUsage` objects:

```json
{
  "imageId": "uuid",
  "usage": "avatar",
  "sectionId": "hero",
  "component": "SplitHero",
  "reason": "User uploaded this image as a profile photo."
}
```

After LLM validation, the blueprint route deterministically adds missing avatar/project `imageUsage` entries when matching uploaded images exist.

## Smoke Test

1. Run `npm run dev` and open `/upload`.
2. Upload a PDF and click **Extract resume text**.
3. Click **Structure resume**.
4. Upload a profile photo and, optionally, one or more project images.
5. Click **Design website layout**.
6. Continue to `/preview`.
7. Confirm the status summary says `PageBlueprint Renderer`.
8. Confirm resume content appears in the rendered website.
9. Confirm sections follow the `order` values from the blueprint.
10. Confirm the avatar renders instead of initials when an avatar is uploaded.
11. Confirm project images render in project sections when project images are uploaded.
12. Confirm the preview shows debug panels for resume JSON, PageBlueprint JSON, and image registry.
13. Test a dark-mode blueprint and confirm tags/badges remain readable.
14. Run `npm run typecheck` and `npm run build` before committing.

## Roadmap

1. ✅ Project setup · types · schemas · landing · upload UI · mock preview
2. ✅ PDF upload + text extraction
3. ✅ LLM resume JSON extraction
4. ✅ PageBlueprint generation
4.5. ✅ Image metadata persistence and avatar lookup
5. ✅ ComponentRenderer and modular section components
6. ⏳ Preview editor
7. ⏳ Static HTML export
8. ⏳ Polish, errors, responsive UI, cleanup

## Layout

```
app/
  page.tsx              # landing
  upload/page.tsx       # upload flow
  preview/page.tsx      # PageBlueprint-driven preview
  api/extract-pdf/      # PDF -> text
  api/parse-resume/     # text -> ResumeData
  api/generate-blueprint/ # ResumeData + choices + images -> PageBlueprint
components/
  ui/                   # shadcn-style primitives
  site/                 # nav + footer
  upload/               # upload-specific components
  preview/              # preview shell and debug panels
  renderer/             # ComponentRenderer, registry, image/theme helpers
  sections/             # predefined section components used by PageBlueprint
lib/
  resumeSchema.ts       # canonical ResumeData schema
  pageBlueprintSchema.ts # PageBlueprint validation and fallback
  types.ts              # shared app types
  schemas.ts            # shared enum schemas
  pdf.ts                # extractTextFromPdf
  storage.ts            # localStorage helpers
  mock-data.ts          # sample ResumeData/PageBlueprint
  constants.ts          # career directions, visual styles
  utils.ts              # cn(), date helpers
types/
  pageBlueprint.ts      # canonical PageBlueprint types and component allow-list
```
