import { NextRequest, NextResponse } from "next/server";
import { getProvider, LlmError } from "@/lib/llm";
import { resumeSchema } from "@/lib/resumeSchema";

/**
 * POST /api/parse-resume
 *
 * Input  : { resumeText: string }
 * Output : { resume: ResumeData, model: string }    on success
 *          { error: string, ...debug }              on failure
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 100_000;

const SYSTEM_PROMPT = `You are a resume parsing assistant. Your job is to convert a free-form resume text into a strict JSON object matching the schema below.

ABSOLUTE RULES:
- Output ONLY a valid JSON object. No markdown fences. No prose. No commentary.
- Preserve factual content from the resume. Do NOT invent companies, schools, degrees, dates, titles, metrics, links, awards, or any fact that is not present in the input.
- You may lightly polish phrasing for clarity (fix grammar, tighten bullets) but never add information.
- If a field is missing from the resume, return "" for strings and [] for arrays. Never use null.
- All keys listed in the schema MUST be present in the output, even when empty.

FIELD CONVENTIONS:
- "name": full name as it appears.
- "title": current headline / role (e.g. "Senior Product Engineer"). Empty if not stated.
- "summary": 1-3 sentence professional summary. If the resume has one, condense it. Otherwise leave empty.
- "linkedin" / "github" / "portfolio": full URLs (https://...). Empty if absent.
- Dates: preserve the format from the resume (e.g. "Jan 2023", "2023-01", "2023"). Use "Present" for ongoing roles. Empty if unknown.
- Skills categorization:
    "languages" — programming languages (TypeScript, Python, SQL, Go, etc.)
    "frameworks" — libraries / frameworks / platforms (React, Next.js, Django, AWS, etc.)
    "tools" — software & services (Figma, Linear, Docker, Vercel, etc.)
    "other" — methodologies, soft skills, or anything uncategorized
- "experience[].bullets": each bullet is one accomplishment, kept short.
- "projects[].techStack": short list of technologies used.
- "certifications" / "awards" / "publications": flat string arrays — one entry per line as written in the resume.

REQUIRED SCHEMA (every key must be present):
{
  "name": "",
  "title": "",
  "location": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "",
  "skills": {
    "languages": [],
    "frameworks": [],
    "tools": [],
    "other": []
  },
  "experience": [
    { "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "bullets": [] }
  ],
  "projects": [
    { "name": "", "description": "", "techStack": [], "bullets": [], "link": "" }
  ],
  "education": [
    { "school": "", "degree": "", "location": "", "startDate": "", "endDate": "", "details": [] }
  ],
  "certifications": [],
  "awards": [],
  "publications": []
}`;

export async function POST(req: NextRequest) {
  let body: { resumeText?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body with a 'resumeText' field." },
      { status: 400 }
    );
  }

  const resumeText = body?.resumeText;
  if (typeof resumeText !== "string" || resumeText.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing 'resumeText' string in body." },
      { status: 400 }
    );
  }
  if (resumeText.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `resumeText is too short (need at least ${MIN_TEXT_LENGTH} characters).` },
      { status: 400 }
    );
  }
  if (resumeText.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `resumeText is too long (max ${MAX_TEXT_LENGTH} characters).` },
      { status: 413 }
    );
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "LLM provider not configured." },
      { status: 500 }
    );
  }

  let completionText: string;
  try {
    const completion = await provider.complete({
      system: SYSTEM_PROMPT,
      user: `Resume text:\n\n${resumeText}\n\nReturn the JSON object now.`,
      jsonMode: true,
    });
    completionText = completion.text;
  } catch (err) {
    if (err instanceof LlmError) {
      // 502 — failure originated upstream from us
      return NextResponse.json(
        { error: err.message, provider: err.providerId },
        { status: err.status >= 500 ? 502 : err.status }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "LLM request failed." },
      { status: 502 }
    );
  }

  // Be defensive: some models still wrap JSON in ``` fences despite instructions.
  const cleaned = stripCodeFences(completionText.trim());

  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      {
        error:
          "The LLM didn't return valid JSON. Try clicking Re-structure, or try a different model.",
        rawPreview: cleaned.slice(0, 1500),
      },
      { status: 502 }
    );
  }

  const validation = resumeSchema.safeParse(raw);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Parsed JSON didn't match the expected resume schema.",
        issues: validation.error.issues.slice(0, 12),
        rawPreview: typeof cleaned === "string" ? cleaned.slice(0, 1500) : undefined,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    resume: validation.data,
    model: provider.model,
    provider: provider.id,
  });
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with a JSON body: { resumeText: string }." },
    { status: 405 }
  );
}

function stripCodeFences(s: string): string {
  // Strip ```json ... ``` or ``` ... ``` wrappers, plus stray leading/trailing
  // text before/after the first/last balanced braces.
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const m = s.match(fence);
  if (m) return m[1].trim();
  // If there's leading prose, try to find the first { and last } and slice.
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first > 0 && last > first) return s.slice(first, last + 1);
  return s;
}
