/**
 * Tiny LLM provider abstraction.
 *
 * Today only OpenAI is implemented; anthropic / gemini / deepseek are stubs
 * that throw clearly. Picking a provider:
 *
 *   AI_PROVIDER=openai   (default)
 *   OPENAI_API_KEY=sk-...
 *   OPENAI_MODEL=gpt-5-mini
 *
 * Switching providers later is a one-file change: implement the LlmProvider
 * interface and add a case to getProvider().
 */

export type ProviderId = "openai" | "anthropic" | "gemini" | "deepseek";

export interface CompletionRequest {
  /** High-level instructions / role description. */
  system: string;
  /** The actual user content. */
  user: string;
  /** Force JSON object response if the provider supports it. */
  jsonMode?: boolean;
  /** Soft cap on output tokens; omitted by default. */
  maxOutputTokens?: number;
}

export interface CompletionResponse {
  text: string;
  /** Raw provider response, kept for debugging. */
  raw?: unknown;
}

export interface LlmProvider {
  id: ProviderId;
  model: string;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
}

export class LlmError extends Error {
  status: number;
  providerId: ProviderId;
  constructor(providerId: ProviderId, status: number, message: string) {
    super(message);
    this.name = "LlmError";
    this.status = status;
    this.providerId = providerId;
  }
}

// ---------- OpenAI ----------

class OpenAIProvider implements LlmProvider {
  id: ProviderId = "openai";
  model: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(opts: { apiKey: string; model: string; baseUrl?: string }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.baseUrl = (opts.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
    };
    if (req.jsonMode) {
      body.response_format = { type: "json_object" };
    }
    // Newer OpenAI models (gpt-4o, gpt-4.1, gpt-5 family) accept
    // max_completion_tokens. Older models accept max_tokens. We send both
    // when requested — extras are ignored.
    if (typeof req.maxOutputTokens === "number") {
      body.max_completion_tokens = req.maxOutputTokens;
      body.max_tokens = req.maxOutputTokens;
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      // Surface the OpenAI error message cleanly.
      let message = errText.slice(0, 500);
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) message = parsed.error.message;
      } catch {
        /* leave message as-is */
      }
      throw new LlmError("openai", res.status, `OpenAI ${res.status}: ${message}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    if (!text) {
      throw new LlmError("openai", 502, "OpenAI returned an empty completion.");
    }
    return { text, raw: json };
  }
}

// ---------- Stubs for future providers ----------

function notImplemented(id: ProviderId): LlmProvider {
  return {
    id,
    model: "",
    async complete() {
      throw new LlmError(
        id,
        501,
        `Provider "${id}" is not implemented yet. Set AI_PROVIDER=openai or implement it in lib/llm.ts.`
      );
    },
  };
}

// ---------- Factory ----------

export function getProvider(): LlmProvider {
  const id = (process.env.AI_PROVIDER ?? "openai").toLowerCase() as ProviderId;
  switch (id) {
    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new LlmError(
          "openai",
          500,
          "Missing OPENAI_API_KEY. Set it in .env.local."
        );
      }
      return new OpenAIProvider({
        apiKey,
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        baseUrl: process.env.OPENAI_BASE_URL,
      });
    }
    case "anthropic":
    case "gemini":
    case "deepseek":
      return notImplemented(id);
    default:
      throw new LlmError(
        "openai",
        500,
        `Unknown AI_PROVIDER: "${id}". Expected one of: openai, anthropic, gemini, deepseek.`
      );
  }
}
