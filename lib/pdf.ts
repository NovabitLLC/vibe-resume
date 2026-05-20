import { extractText, getDocumentProxy } from "unpdf";

/**
 * Domain errors thrown by PDF extraction so the API route can map them
 * to clean HTTP statuses + user-facing messages.
 */
export type PdfErrorCode =
  | "INVALID_PDF"
  | "EMPTY_PDF"
  | "NO_TEXT_FOUND"
  | "EXTRACTION_FAILED";

export class PdfExtractionError extends Error {
  code: PdfErrorCode;
  constructor(code: PdfErrorCode, message: string) {
    super(message);
    this.name = "PdfExtractionError";
    this.code = code;
  }
}

/**
 * If a PDF returns this little text after normalization, it's almost certainly
 * a scanned/image-only PDF (or otherwise unextractable). Tuned to be permissive
 * — short resumes still pass, but a 0-char or 5-char result fails clearly.
 */
const MIN_USEFUL_TEXT_LENGTH = 60;

/**
 * Extract plain text from a PDF buffer.
 *
 * - Normalizes whitespace (collapses runs of spaces, trims lines, removes blank-line spam).
 * - Throws PdfExtractionError on empty / unreadable / scanned PDFs.
 * - Returns clean plain text suitable for feeding to an LLM in later phases.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new PdfExtractionError("EMPTY_PDF", "The uploaded PDF is empty.");
  }

  // Quick magic-number sanity check — every PDF starts with "%PDF-".
  const header = buffer.subarray(0, 5).toString("utf8");
  if (header !== "%PDF-") {
    throw new PdfExtractionError(
      "INVALID_PDF",
      "That file doesn't look like a PDF — the file header is wrong."
    );
  }

  // unpdf accepts Uint8Array. Wrap our Node Buffer in one.
  // (Buffer is a subclass of Uint8Array but we copy to avoid passing the
  // pooled-allocation slice that pdfjs sometimes complains about.)
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  let raw: string;
  try {
    const doc = await getDocumentProxy(data);
    const result = await extractText(doc, { mergePages: true });
    raw = result.text ?? "";
  } catch (err) {
    // pdfjs throws InvalidPDFException / MissingPDFException with various messages.
    const message = err instanceof Error ? err.message : String(err);
    throw new PdfExtractionError(
      "EXTRACTION_FAILED",
      `We couldn't read that PDF. (${message})`
    );
  }

  const text = normalizeWhitespace(raw);

  if (text.length < MIN_USEFUL_TEXT_LENGTH) {
    throw new PdfExtractionError(
      "NO_TEXT_FOUND",
      "We couldn't find readable text in that PDF. It may be a scanned image — try exporting your resume from a text-based source (Google Docs, Word, LinkedIn)."
    );
  }

  return text;
}

/**
 * Collapse the noisy whitespace pdfjs returns into something an LLM
 * (and a human debug panel) can actually read.
 *
 *  - Convert hard line-breaks to \n
 *  - Trim each line
 *  - Collapse 3+ blank lines into 2
 *  - Collapse runs of internal spaces / tabs into a single space
 *  - Drop trailing whitespace
 */
export function normalizeWhitespace(input: string): string {
  if (!input) return "";
  return input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
