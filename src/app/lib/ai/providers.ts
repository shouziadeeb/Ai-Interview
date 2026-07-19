import Groq from "groq-sdk";

export const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";
export const GROQ_WHISPER_MODEL = "whisper-large-v3";

export const OPENROUTER_MODELS = [
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.1-8b-instruct:free",
] as const;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResult = {
  content: string;
  provider: "groq" | "openrouter";
  model: string;
};

function requireEnv(name: "GROQ_API_KEY" | "OPENROUTER_API_KEY"): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getGroqClient(): Groq {
  const apiKey = requireEnv("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey });
}

async function chatWithGroq(messages: ChatMessage[], temperature = 0.3): Promise<ChatCompletionResult> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: GROQ_CHAT_MODEL,
    temperature,
    messages,
  });

  const content = completion.choices?.[0]?.message?.content?.trim() || "";
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return {
    content,
    provider: "groq",
    model: GROQ_CHAT_MODEL,
  };
}

async function chatWithOpenRouter(
  messages: ChatMessage[],
  temperature = 0.3,
  preferredModel?: string
): Promise<ChatCompletionResult> {
  const apiKey = requireEnv("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const models = preferredModel
    ? [preferredModel, ...OPENROUTER_MODELS.filter((model) => model !== preferredModel)]
    : [...OPENROUTER_MODELS];

  const errors: string[] = [];

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MyInterview",
        },
        body: JSON.stringify({
          model,
          temperature,
          messages,
        }),
      });

      const raw = await response.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        throw new Error(parsed?.error?.message || `OpenRouter ${model} failed (${response.status})`);
      }

      const content =
        parsed?.choices?.[0]?.message?.content?.trim?.() ||
        (typeof parsed?.choices?.[0]?.message?.content === "string"
          ? parsed.choices[0].message.content.trim()
          : "");

      if (!content) {
        throw new Error(`OpenRouter ${model} returned an empty response`);
      }

      return {
        content,
        provider: "openrouter",
        model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  throw new Error(errors.join(" | ") || "OpenRouter request failed");
}

/**
 * Prefer Groq, then automatically fall back to OpenRouter.
 */
export async function chatWithFallback(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    preferOpenRouter?: boolean;
    openRouterModel?: string;
  }
): Promise<ChatCompletionResult> {
  const temperature = options?.temperature ?? 0.3;
  const errors: string[] = [];

  if (!options?.preferOpenRouter) {
    try {
      return await chatWithGroq(messages, temperature);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[ai] Groq failed, falling back to OpenRouter:", message);
      errors.push(`Groq: ${message}`);
    }
  }

  try {
    return await chatWithOpenRouter(messages, temperature, options?.openRouterModel);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`OpenRouter: ${message}`);
    throw new Error(errors.join(" | "));
  }
}

/**
 * Groq-only chat (used for resume analysis per product requirements).
 * Falls back to OpenRouter only if Groq is unavailable, to keep the app usable.
 */
export async function chatWithGroqPreferred(
  messages: ChatMessage[],
  temperature = 0.2
): Promise<ChatCompletionResult> {
  return chatWithFallback(messages, { temperature });
}

export function extractJsonObject<T extends Record<string, unknown>>(content: string, fallback: T): T {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return fallback;

  try {
    return { ...fallback, ...JSON.parse(jsonMatch[0]) } as T;
  } catch {
    return fallback;
  }
}

export function extractJsonArrayMatch(content: string): string | null {
  const objectMatch = content.match(/\{[\s\S]*\}/);
  return objectMatch?.[0] || null;
}
