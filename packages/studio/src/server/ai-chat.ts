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

type AiChatValidationResult =
  | { ok: true; payload: { url: string; headers: Record<string, string>; body: string } }
  | { ok: false; status: 400; error: string };

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

function buildSystemMessage(context?: string): ChatMessage {
  return {
    role: "system",
    content: [
      "You are the Insyte Studio analytics assistant.",
      "Help the user explore and understand their local analytics database.",
      "Answer clearly and concisely. When useful, suggest filters, views, or next steps in the studio.",
      context ? `\nCurrent studio context (JSON):\n${context}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function validateAiChatRequest(body: AiChatRequest): AiChatValidationResult {
  if (!body.apiKey?.trim()) {
    return { ok: false, status: 400, error: "An API key is required for the selected provider." };
  }

  if (!body.model?.trim()) {
    return { ok: false, status: 400, error: "A model ID is required." };
  }

  if (body.providerId === "custom" && !body.baseUrl?.trim()) {
    return { ok: false, status: 400, error: "Custom providers require a base URL." };
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, status: 400, error: "At least one message is required." };
  }

  const systemMessage = buildSystemMessage(body.context);

  return {
    ok: true,
    payload: {
      url: resolveChatUrl(body.providerId, body.baseUrl),
      headers: resolveHeaders(body.providerId, body.apiKey),
      body: JSON.stringify({
        model: body.model.trim(),
        messages: [systemMessage, ...body.messages.filter((message) => message.role !== "system")],
      }),
    },
  };
}

function encodeStreamEvent(event: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function parseUpstreamSseLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;

  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export function createAiChatStream(body: AiChatRequest, signal?: AbortSignal): ReadableStream<Uint8Array> {
  const validation = validateAiChatRequest(body);

  if (!validation.ok) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encodeStreamEvent({ type: "error", error: validation.error }));
        controller.close();
      },
    });
  }

  const { url, headers, body: requestBody } = validation.payload;
  const streamingBody = JSON.stringify({
    ...JSON.parse(requestBody),
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      const enqueue = (event: Record<string, unknown>) => {
        controller.enqueue(encodeStreamEvent(event));
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: streamingBody,
          signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: { message?: string } | string;
          } | null;
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : payload?.error?.message ?? `Provider request failed (${response.status}).`;
          enqueue({ type: "error", error: message });
          controller.close();
          return;
        }

        if (!response.body) {
          enqueue({ type: "error", error: "The provider returned an empty stream." });
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const content = parseUpstreamSseLine(line);
            if (content) {
              enqueue({ type: "token", content });
            }
          }
        }

        enqueue({ type: "done", model: body.model.trim() });
        controller.close();
      } catch (error) {
        if (signal?.aborted) {
          controller.close();
          return;
        }

        enqueue({
          type: "error",
          error: error instanceof Error ? error.message : "Stream failed.",
        });
        controller.close();
      }
    },
  });
}

export async function handleAiChat(body: AiChatRequest) {
  const validation = validateAiChatRequest(body);

  if (!validation.ok) {
    return { status: validation.status, data: { error: validation.error } };
  }

  const { url, headers, body: requestBody } = validation.payload;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: requestBody,
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
