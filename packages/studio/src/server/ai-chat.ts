const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type ProviderId = "openrouter" | "groq" | "grok" | "custom";

export interface AiChatRequest {
  providerId: ProviderId;
  apiKey: string;
  baseUrl?: string;
  model: string;
  messages: ChatMessage[];
  context?: string;
}

function resolveChatUrl(providerId: ProviderId, baseUrl?: string): string {
  const trimmed = baseUrl?.trim().replace(/\/+$/, "");
  if (trimmed) {
    return trimmed.endsWith("/chat/completions")
      ? trimmed
      : `${trimmed}/chat/completions`;
  }

  if (providerId === "groq") {
    return "https://api.groq.com/openai/v1/chat/completions";
  }

  if (providerId === "grok") {
    return "https://api.x.ai/v1/chat/completions";
  }

  return DEFAULT_OPENROUTER_URL;
}

function resolveHeaders(providerId: ProviderId, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey.trim()}`,
    "Content-Type": "application/json",
  };

  if (providerId === "openrouter") {
    headers["HTTP-Referer"] = "http://localhost:5555";
    headers["X-Title"] = "Insyte Studio";
  }

  return headers;
}

export async function handleAiChat(body: AiChatRequest) {
  if (!body.apiKey?.trim()) {
    return { status: 400 as const, data: { error: "An API key is required for the selected provider." } };
  }

  if (!body.model?.trim()) {
    return { status: 400 as const, data: { error: "A model ID is required." } };
  }

  if (body.providerId === "custom" && !body.baseUrl?.trim()) {
    return { status: 400 as const, data: { error: "Custom providers require a base URL." } };
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { status: 400 as const, data: { error: "At least one message is required." } };
  }

  const systemMessage: ChatMessage = {
    role: "system",
    content: [
      "You are the Insyte Studio analytics assistant.",
      "Help the user explore and understand their local analytics database.",
      "Answer clearly and concisely. When useful, suggest filters, views, or next steps in the studio.",
      body.context ? `\nCurrent studio context (JSON):\n${body.context}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };

  const response = await fetch(resolveChatUrl(body.providerId, body.baseUrl), {
    method: "POST",
    headers: resolveHeaders(body.providerId, body.apiKey),
    body: JSON.stringify({
      model: body.model.trim(),
      messages: [systemMessage, ...body.messages.filter((message) => message.role !== "system")],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string } | string;
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message ?? `Provider request failed (${response.status}).`;
    return {
      status: response.status as 400 | 401 | 403 | 429 | 500,
      data: { error: message },
    };
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { status: 502 as const, data: { error: "The provider returned an empty response." } };
  }

  return {
    status: 200 as const,
    data: { message: content, model: body.model.trim() },
  };
}
