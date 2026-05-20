import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf, PdfExtractionError, type PdfErrorCode } from "@/lib/pdf";

/**
 * POST /api/extract-pdf
 *
 * Accepts multipart/form-data with a single "file" field containing a PDF.
 * Returns:
 *   200 { text: string }      on success
 *   4xx { error: string, code?: PdfErrorCode } on validation/extraction failure
 *   500 { error: string }     on unexpected error
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Body parsing for app-router route handlers is automatic for formData;
// we still keep a hard size limit below.

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const codeStatus: Record<PdfErrorCode, number> = {
  INVALID_PDF: 415,
  EMPTY_PDF: 400,
  NO_TEXT_FOUND: 422,
  EXTRACTION_FAILED: 422,
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with a 'file' field." },
        { status: 400 }
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Could not parse the upload. Please try again." },
        { status: 400 }
      );
    }

    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file uploaded. Attach a PDF in the 'file' field." },
        { status: 400 }
      );
    }

    // Mime + extension sanity check. Some browsers send application/octet-stream
    // for drag-and-dropped PDFs, so we also accept .pdf by name.
    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name?.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfName) {
      return NextResponse.json(
        { error: "Only PDF files are accepted." },
        { status: 415 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "That PDF appears to be empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `That PDF is too large (${(file.size / 1024 / 1024).toFixed(
            1
          )} MB). The limit is ${MAX_BYTES / 1024 / 1024} MB.`,
        },
        { status: 413 }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const text = await extractTextFromPdf(buffer);

    return NextResponse.json({
      text,
      filename: file.name,
      bytes: file.size,
      chars: text.length,
    });
  } catch (err) {
    if (err instanceof PdfExtractionError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: codeStatus[err.code] ?? 422 }
      );
    }
    // eslint-disable-next-line no-console
    console.error("[/api/extract-pdf] unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong extracting the PDF. Please try again." },
      { status: 500 }
    );
  }
}

// Block other methods cleanly.
export async function GET() {
  return NextResponse.json(
    { error: "Use POST with multipart/form-data." },
    { status: 405 }
  );
}
