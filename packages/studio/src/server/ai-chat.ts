const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/free";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiChatRequest {
  apiKey: string;
  messages: ChatMessage[];
  context?: string;
}

export async function handleAiChat(body: AiChatRequest) {
  if (!body.apiKey?.trim()) {
    return { status: 400 as const, data: { error: "OpenRouter API key is required." } };
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

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${body.apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5555",
      "X-Title": "Insyte Studio",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [systemMessage, ...body.messages.filter((message) => message.role !== "system")],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    return {
      status: response.status as 400 | 401 | 403 | 429 | 500,
      data: {
        error: payload.error?.message ?? `OpenRouter request failed (${response.status}).`,
      },
    };
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { status: 502 as const, data: { error: "OpenRouter returned an empty response." } };
  }

  return {
    status: 200 as const,
    data: { message: content, model: DEFAULT_MODEL },
  };
}
