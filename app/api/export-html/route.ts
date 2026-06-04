import { NextRequest, NextResponse } from "next/server";

import { resumeSchema } from "@/lib/resumeSchema";
import {
  pageBlueprintImageSchema,
  pageBlueprintSchema,
} from "@/lib/pageBlueprintSchema";
import { generateStaticHtml } from "@/lib/export/staticHtml";
import { safeFileName } from "@/lib/export/exportUtils";

/**
 * POST /api/export-html
 *
 * Input  : { resume: ResumeData, blueprint: PageBlueprint, images: UploadedImage[] }
 * Output : a standalone HTML document as a file download
 *          (Content-Type: text/html, Content-Disposition: attachment)
 *
 * The generator is a pure string builder — no React, no Next runtime in the
 * output. All user text is escaped and all links sanitized inside the
 * generator.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { resume?: unknown; blueprint?: unknown; images?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body with { resume, blueprint, images }." },
      { status: 400 }
    );
  }

  const resumeResult = resumeSchema.safeParse(body.resume);
  if (!resumeResult.success) {
    return NextResponse.json(
      { error: "Invalid resume payload.", issues: resumeResult.error.issues.slice(0, 8) },
      { status: 400 }
    );
  }

  const blueprintResult = pageBlueprintSchema.safeParse(body.blueprint);
  if (!blueprintResult.success) {
    return NextResponse.json(
      { error: "Invalid blueprint payload.", issues: blueprintResult.error.issues.slice(0, 8) },
      { status: 400 }
    );
  }

  // Images are optional; default to [] and validate when present.
  const imagesInput = Array.isArray(body.images) ? body.images : [];
  const imagesResult = pageBlueprintImageSchema.array().safeParse(imagesInput);
  const images = imagesResult.success ? imagesResult.data : [];

  let html: string;
  try {
    html = generateStaticHtml(resumeResult.data, blueprintResult.data, images);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[/api/export-html] generation failed", err);
    return NextResponse.json(
      { error: "Failed to generate the HTML export." },
      { status: 500 }
    );
  }

  const filename = safeFileName(resumeResult.data.name);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { resume, blueprint, images }." },
    { status: 405 }
  );
}
